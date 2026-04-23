/* ============================================================
   /api/monday-timer.js — Vercel Serverless Function
   
   Endpoint único que RECEBE webhook do Monday diretamente
   (sem passar pelo Make). Faz tudo:
   
   1. Valida o challenge do Monday (primeira chamada ao configurar)
   2. Identifica o cliente pelo board_id
   3. Busca o membro no Supabase pelo monday_user_id
   4. Se status = "Rodando":
      a) Busca OUTROS cards "Rodando" do mesmo user no Monday (todos os 7 boards)
      b) Desarma eles pra "Parado"
      c) Fecha entries abertas no Supabase
      d) Cria nova entry
   5. Se status != "Rodando":
      a) Fecha entry desse card no Supabase
   
   URL: https://tgt-hub-tgt4.vercel.app/api/monday-timer
   ============================================================ */

const MONDAY_API = 'https://api.monday.com/v2';
const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYzODU1NzY3OCwiYWFpIjoxMSwidWlkIjo0MzE2OTUwOSwiaWFkIjoiMjAyNi0wMy0yN1QwOTo1Mzo0Ny4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTY4NjczMjAsInJnbiI6InVzZTEifQ.Rcm5SgNkiGizjRY_z1ECf7jCEGC2j_UGqtX2h_NkTAw';
const SB_URL = 'https://opqivuzvyvvvajokutvc.supabase.co/rest/v1';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcWl2dXp2eXZ2dmFqb2t1dHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTg0ODIsImV4cCI6MjA5MDQ3NDQ4Mn0.7mH_9ikNMnM2zfUFQrb1ot6t47plzib6No2GPT0gfa0';

// Mapeamento board_id -> { client_id, project, timer_col }
const BOARDS = {
  '8067947432':  { client_id: 'cf8d9c05-3778-4e2e-8da3-3ce58bddd8ff', project: 'NOU',         timer_col: 'color_mm2bz077' },
  '18401417952': { client_id: '7e9d3aa8-7e39-45fb-bf03-f64c9cfd7416', project: 'NONO',        timer_col: 'color_mm2b5g4d' },
  '4911397036':  { client_id: 'd2d884b3-9855-4df9-9cb6-5ed115675a48', project: 'LESAFFRE',    timer_col: 'color_mm2cvezy' },
  '5845978306':  { client_id: 'c8e04923-5dd6-47d6-a127-a8612d5168db', project: 'CELERA',      timer_col: 'color_mm2c9c2f' },
  '18309098296': { client_id: '9e31fc4a-add1-435e-a5f4-dd38fcff8883', project: 'NOVONESIS',   timer_col: 'color_mm2asg65' },
  '4911421503':  { client_id: 'd9145d77-cfea-4541-b0aa-578aae80b333', project: 'BAPTISTELLA', timer_col: 'color_mm2bn208' },
  '7033792227':  { client_id: '97fdfab4-f2ac-4047-b0e0-77e819d3c842', project: 'KERRY_RH',    timer_col: 'color_mm2bc3be' },
};

const SB_HEADERS = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

const MONDAY_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: MONDAY_TOKEN,
  'API-Version': '2024-10',
};

async function mondayQuery(query) {
  const r = await fetch(MONDAY_API, {
    method: 'POST',
    headers: MONDAY_HEADERS,
    body: JSON.stringify({ query }),
  });
  return r.json();
}

async function sbFetch(path, options = {}) {
  return fetch(`${SB_URL}${path}`, { ...options, headers: { ...SB_HEADERS, ...(options.headers || {}) } });
}

export default async function handler(req, res) {
  try {
    // Monday envia GET na primeira configuração (challenge) - aceitar
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, message: 'Endpoint ativo' });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'Método não permitido.' });
    }

    const body = req.body || {};

    // Monday challenge (verificação inicial do webhook)
    if (body.challenge) {
      return res.status(200).json({ challenge: body.challenge });
    }

    // Payload normal do Monday webhook
    const event = body.event || {};
    const boardId = String(event.boardId || '');
    const pulseId = String(event.pulseId || '');
    const pulseName = event.pulseName || '';
    const userId = event.userId;
    const label = event.value?.label?.text || '';

    const boardCfg = BOARDS[boardId];
    if (!boardCfg) {
      console.warn(`[monday-timer] Board desconhecido: ${boardId}`);
      return res.status(200).json({ ok: false, error: 'Board não mapeado' });
    }

    // Busca o membro no Supabase
    const memberRes = await sbFetch(`/tt_members?monday_user_id=eq.${userId}&select=id,name`);
    const members = await memberRes.json();
    if (!members || members.length === 0) {
      console.warn(`[monday-timer] Membro não encontrado: user=${userId}`);
      return res.status(200).json({ ok: false, error: 'Membro não encontrado' });
    }
    const member = members[0];
    const memberId = member.id;

    const isRodando = label.toLowerCase().includes('rodando');
    const nowIso = new Date().toISOString();
    const today = nowIso.slice(0, 10);

    console.log(`[monday-timer] ${member.name} | ${boardCfg.project} | ${pulseName} | label="${label}" | isRodando=${isRodando}`);

    if (isRodando) {
      // 1. Busca TODOS os monday_item_id ativos do user (em todos os boards)
      const runningRes = await sbFetch(
        `/tt_time_entries?member_id=eq.${memberId}&is_running=eq.true&monday_item_id=not.is.null&monday_item_id=neq.${pulseId}&select=monday_item_id,monday_board_id`
      );
      const runningRows = await runningRes.json();

      // 2. Desarma cada card antigo no Monday, MAS só se nenhum outro user estiver rodando nele
      const stopResults = [];
      for (const row of runningRows || []) {
        const oldBoardId = String(row.monday_board_id || '');
        const oldItemId = String(row.monday_item_id || '');
        if (!oldItemId || !oldBoardId) continue;

        const oldBoardCfg = BOARDS[oldBoardId];
        if (!oldBoardCfg) continue;

        // Checa se OUTROS users ainda têm esse card_old rodando
        const othersRes = await sbFetch(
          `/tt_time_entries?monday_item_id=eq.${oldItemId}&is_running=eq.true&member_id=neq.${memberId}&select=id`
        );
        const others = await othersRes.json();
        if (others && others.length > 0) {
          // Outro user ainda roda esse card → deixar verde no Monday
          stopResults.push({ item: oldItemId, ok: false, skipped: true, reason: `${others.length} other(s) still running` });
          continue;
        }

        const mutation = `mutation{change_simple_column_value(board_id:${oldBoardId},item_id:${oldItemId},column_id:"${oldBoardCfg.timer_col}",value:"Parado"){id}}`;
        const r = await mondayQuery(mutation);
        stopResults.push({ item: oldItemId, ok: !!r?.data?.change_simple_column_value?.id, err: r?.errors?.[0]?.message });
      }

      // 3. Fecha todas as entries abertas do user no Supabase
      await sbFetch(`/tt_time_entries?member_id=eq.${memberId}&is_running=eq.true`, {
        method: 'PATCH',
        body: JSON.stringify({ is_running: false, ended_at: nowIso }),
      });

      // 4. Cria nova entry
      const createRes = await sbFetch('/tt_time_entries', {
        method: 'POST',
        body: JSON.stringify({
          member_id: memberId,
          client_id: boardCfg.client_id,
          description: pulseName,
          action: null,
          project: boardCfg.project,
          started_at: nowIso,
          date: today,
          hours: 0,
          duration_minutes: 0,
          is_manual: false,
          is_running: true,
          monday_item_id: pulseId,
          monday_board_id: boardId,
        }),
      });

      const created = await createRes.json();
      return res.status(200).json({
        ok: true,
        action: 'started',
        member: member.name,
        project: boardCfg.project,
        pulse: pulseName,
        stopped_old: stopResults.length,
        stopped_results: stopResults,
        created_id: Array.isArray(created) ? created[0]?.id : null,
      });
    } else {
      // NÃO Rodando (Parado/vazio/outro)
      // 1. Fecha entry desse user pra esse card
      await sbFetch(
        `/tt_time_entries?member_id=eq.${memberId}&monday_item_id=eq.${pulseId}&is_running=eq.true`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_running: false, ended_at: nowIso }),
        }
      );

      // 2. Checa se OUTROS users ainda têm esse card rodando no Supabase
      const stillRunningRes = await sbFetch(
        `/tt_time_entries?monday_item_id=eq.${pulseId}&is_running=eq.true&member_id=neq.${memberId}&select=id,member_id`
      );
      const stillRunning = await stillRunningRes.json();

      let rearmed = false;
      if (stillRunning && stillRunning.length > 0) {
        // Outros ainda rodando → rearmar o card no Monday pra "Rodando"
        const mutation = `mutation{change_simple_column_value(board_id:${boardId},item_id:${pulseId},column_id:"${boardCfg.timer_col}",value:"Rodando"){id}}`;
        const r = await mondayQuery(mutation);
        rearmed = !!r?.data?.change_simple_column_value?.id;
        console.log(`[monday-timer] ${stillRunning.length} user(s) ainda rodando ${pulseName} → rearmado=${rearmed}`);
      }

      return res.status(200).json({
        ok: true,
        action: 'stopped',
        member: member.name,
        project: boardCfg.project,
        pulse: pulseName,
        others_still_running: stillRunning?.length || 0,
        rearmed,
      });
    }
  } catch (err) {
    console.error('[monday-timer] ERRO:', err);
    return res.status(200).json({ ok: false, error: String(err?.message || err) });
  }
}
