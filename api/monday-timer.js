/* ============================================================
   /api/monday-timer.js — V2 (People Column)
   
   Endpoint único que recebe webhook do Monday quando a coluna
   People "Executando" muda em qualquer um dos 7 boards.
   
   Detecta diff entre value/previousValue:
   - Pessoas ADICIONADAS → arma timer delas (cria entry Supabase + remove delas em outros cards)
   - Pessoas REMOVIDAS → fecha entry delas no Supabase
   
   Assim funciona pra:
   - User A entra no card X → arma timer A
   - User B entra no MESMO card X → arma timer B (sem afetar A)
   - User A se move pra card Y → entra em Y, sai de X automaticamente
   - User A clica "X" no card → sai
   ============================================================ */

const MONDAY_API = 'https://api.monday.com/v2';
const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYzODU1NzY3OCwiYWFpIjoxMSwidWlkIjo0MzE2OTUwOSwiaWFkIjoiMjAyNi0wMy0yN1QwOTo1Mzo0Ny4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTY4NjczMjAsInJnbiI6InVzZTEifQ.Rcm5SgNkiGizjRY_z1ECf7jCEGC2j_UGqtX2h_NkTAw';
const SB_URL = 'https://opqivuzvyvvvajokutvc.supabase.co/rest/v1';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcWl2dXp2eXZ2dmFqb2t1dHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTg0ODIsImV4cCI6MjA5MDQ3NDQ4Mn0.7mH_9ikNMnM2zfUFQrb1ot6t47plzib6No2GPT0gfa0';

// Mapeamento board_id -> { client_id, project, exec_col }
// exec_col = ID da coluna People "Executando"
const BOARDS = {
  '8067947432':  { client_id: 'cf8d9c05-3778-4e2e-8da3-3ce58bddd8ff', project: 'NOU',         exec_col: 'multiple_person_mm31syka' },
  '18401417952': { client_id: '7e9d3aa8-7e39-45fb-bf03-f64c9cfd7416', project: 'NONO',        exec_col: 'multiple_person_mm31gyg0' },
  '4911397036':  { client_id: 'd2d884b3-9855-4df9-9cb6-5ed115675a48', project: 'LESAFFRE',         exec_col: 'multiple_person_mm31vpmm' },
  '5845978306':  { client_id: 'c8e04923-5dd6-47d6-a127-a8612d5168db', project: 'CELERA',           exec_col: 'multiple_person_mm31q5mx' },
  '18309098296': { client_id: '9e31fc4a-add1-435e-a5f4-dd38fcff8883', project: 'NOVONESIS',        exec_col: 'multiple_person_mm31e586' },
  '4911421503':  { client_id: 'd9145d77-cfea-4541-b0aa-578aae80b333', project: 'BAPTISTELLA',      exec_col: 'multiple_person_mm31xq3y' },
  '7033792227':  { client_id: 'cfbd966d-1251-4b03-a945-3361db21c804', project: 'KERRY_RH',         exec_col: 'multiple_person_mm318epv' },
  '4530656213':  { client_id: '97fdfab4-f2ac-4047-b0e0-77e819d3c842', project: 'KERRY_INST',       exec_col: 'multiple_person_mm31fa0a' },
  '4711581849':  { client_id: 'ab5288fe-aa84-45ec-9d25-c8f919c1f760', project: 'KERRY_BRANDS',     exec_col: 'multiple_person_mm319y9p' },
  '18395709707': { client_id: '75e66248-90db-4bda-9892-3bcd94fe7198', project: 'KERRY_HT',         exec_col: 'multiple_person_mm31q6g7' },
  '8824474984':  { client_id: 'b25d6b91-b01a-4dad-bd49-2e7ab6caf545', project: 'KERRY_PACKAGING',  exec_col: 'multiple_person_mm31b038' },
  '6594719717':  { client_id: 'ca3a525f-a27b-42ef-b962-e7f056dc5b5c', project: 'LESAFFRE_PACK',    exec_col: 'multiple_person_mm31vjt7' },
  '18399575558': { client_id: '306ac07b-0461-4144-af1f-082837100b8c', project: 'ADM_NUTRITION',    exec_col: 'multiple_person_mm31sbfg' },
  '9356404232':  { client_id: 'e98412fb-0ec5-44b0-bc04-fa49591d4387', project: 'LLEV',             exec_col: 'multiple_person_mm31cd11' },
  '18387416550': { client_id: 'b6ebf19e-39e1-45f3-b12a-bc5a9a26f056', project: 'DE_MARCHI_USA',    exec_col: 'multiple_person_mm312ny4' },
  '8938781105':  { client_id: 'df5ccca7-4ae8-46b9-a4ac-a2b2a8520283', project: 'DE_MARCHI_BR',     exec_col: 'multiple_person_mm316v6q' },
  '4911473212':  { client_id: '57a794cd-5c87-4dde-a12b-8e9f5e4908a8', project: 'PRONUTRITION',     exec_col: 'multiple_person_mm31mjfe' },
  '5378150325':  { client_id: 'a8a29255-d1c8-4b43-9cef-bfa2b9e3fcca', project: 'GAMER_HUT',        exec_col: 'multiple_person_mm312c20' },
  '5382264448':  { client_id: 'd57a6097-0b2d-40af-a315-baffd933108d', project: 'PAO_DO_CAMBUI',    exec_col: 'multiple_person_mm31kfa4' },
  '9356397361':  { client_id: 'a2b750a1-c641-487d-94fa-52d7527393b9', project: 'UV_LINE',          exec_col: 'multiple_person_mm31yx0p' },
  '18395931952': { client_id: '48af097c-8487-4403-b0cb-49ae90488c7e', project: 'GAROA_PACKAGING',  exec_col: 'multiple_person_mm312gh7' },
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

// Extrai array de personIds do payload Monday people column
function extractPersonIds(val) {
  if (!val) return [];
  const arr = val.personsAndTeams || val.value?.personsAndTeams || [];
  return arr.filter(p => p.kind === 'person').map(p => String(p.id));
}

// Remove uma pessoa de uma coluna people em um card (mutação Monday)
async function mondayRemovePersonFromCard(boardId, itemId, columnId, personIdToRemove) {
  // 1. Lê valor atual
  const q = `query{ items(ids:[${itemId}]){ column_values(ids:["${columnId}"]){ value } } }`;
  const r = await mondayQuery(q);
  const raw = r?.data?.items?.[0]?.column_values?.[0]?.value;
  if (!raw) return { ok: true, skipped: true };
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { ok: false, err: 'parse failed' }; }
  const persons = parsed.personsAndTeams || [];
  const filtered = persons.filter(p => String(p.id) !== String(personIdToRemove));
  if (filtered.length === persons.length) return { ok: true, skipped: true };
  // 2. Atualiza
  const newVal = JSON.stringify({ personsAndTeams: filtered });
  const escapedVal = newVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const mut = `mutation{ change_column_value(board_id:${boardId}, item_id:${itemId}, column_id:"${columnId}", value:"${escapedVal}"){id} }`;
  const r2 = await mondayQuery(mut);
  return { ok: !!r2?.data?.change_column_value?.id, err: r2?.errors?.[0]?.message };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, message: 'Endpoint Executando ativo' });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'Método não permitido.' });
    }

    const body = req.body || {};
    if (body.challenge) return res.status(200).json({ challenge: body.challenge });

    const event = body.event || {};
    const boardId = String(event.boardId || '');
    const pulseId = String(event.pulseId || '');
    const pulseName = event.pulseName || '';
    const triggerUserId = event.userId; // quem fez a ação
    const value = event.value;
    const previousValue = event.previousValue;

    const boardCfg = BOARDS[boardId];
    if (!boardCfg) {
      console.warn(`[monday-timer] Board não mapeado: ${boardId}`);
      return res.status(200).json({ ok: false, error: 'Board não mapeado' });
    }

    const newIds = extractPersonIds(value);
    const oldIds = extractPersonIds(previousValue);

    const added = newIds.filter(id => !oldIds.includes(id));
    const removed = oldIds.filter(id => !newIds.includes(id));

    console.log(`[monday-timer] ${boardCfg.project} | card=${pulseName} | added=[${added.join(',')}] removed=[${removed.join(',')}]`);

    if (added.length === 0 && removed.length === 0) {
      return res.status(200).json({ ok: true, action: 'noop' });
    }

    const nowIso = new Date().toISOString();
    const today = nowIso.slice(0, 10);
    const results = { added: [], removed: [] };

    // ===== TRATA REMOÇÕES =====
    for (const mondayUserId of removed) {
      // Busca membro
      const mRes = await sbFetch(`/tt_members?monday_user_id=eq.${mondayUserId}&select=id,name`);
      const ms = await mRes.json();
      if (!ms || ms.length === 0) {
        results.removed.push({ user: mondayUserId, ok: false, reason: 'member not found' });
        continue;
      }
      const member = ms[0];
      // Fecha entry desse user no card
      await sbFetch(
        `/tt_time_entries?member_id=eq.${member.id}&monday_item_id=eq.${pulseId}&is_running=eq.true`,
        { method: 'PATCH', body: JSON.stringify({ is_running: false, ended_at: nowIso }) }
      );
      results.removed.push({ user: mondayUserId, name: member.name, ok: true });
    }

    // ===== TRATA ADIÇÕES =====
    for (const mondayUserId of added) {
      // Busca membro
      const mRes = await sbFetch(`/tt_members?monday_user_id=eq.${mondayUserId}&select=id,name`);
      const ms = await mRes.json();
      if (!ms || ms.length === 0) {
        results.added.push({ user: mondayUserId, ok: false, reason: 'member not found' });
        continue;
      }
      const member = ms[0];

      // 1. Busca cards onde esse user está executando atualmente (em todos os boards)
      const runningRes = await sbFetch(
        `/tt_time_entries?member_id=eq.${member.id}&is_running=eq.true&monday_item_id=not.is.null&monday_item_id=neq.${pulseId}&select=monday_item_id,monday_board_id`
      );
      const running = await runningRes.json();

      // 2. Pra cada card antigo, remove ele da coluna People (mantém os outros usuários intactos)
      const removedFrom = [];
      for (const row of running || []) {
        const oldBoardId = String(row.monday_board_id || '');
        const oldItemId = String(row.monday_item_id || '');
        if (!oldItemId || !oldBoardId) continue;
        const oldBoardCfg = BOARDS[oldBoardId];
        if (!oldBoardCfg) continue;
        const r = await mondayRemovePersonFromCard(oldBoardId, oldItemId, oldBoardCfg.exec_col, mondayUserId);
        removedFrom.push({ item: oldItemId, ok: r.ok, err: r.err });
      }

      // 3. Fecha todas as entries abertas desse user no Supabase
      await sbFetch(`/tt_time_entries?member_id=eq.${member.id}&is_running=eq.true`, {
        method: 'PATCH',
        body: JSON.stringify({ is_running: false, ended_at: nowIso }),
      });

      // 4. Cria nova entry pra este card
      const createRes = await sbFetch('/tt_time_entries', {
        method: 'POST',
        body: JSON.stringify({
          member_id: member.id,
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

      results.added.push({
        user: mondayUserId,
        name: member.name,
        ok: true,
        created_id: Array.isArray(created) ? created[0]?.id : null,
        removed_from_old_cards: removedFrom,
      });
    }

    return res.status(200).json({
      ok: true,
      project: boardCfg.project,
      pulse: pulseName,
      results,
    });
  } catch (err) {
    console.error('[monday-timer] ERRO:', err);
    return res.status(200).json({ ok: false, error: String(err?.message || err) });
  }
}
