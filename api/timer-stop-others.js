/* ============================================================
   /api/timer-stop-others.js — Vercel Serverless Function
   
   Recebe:
     {
       member_id: UUID      // user do Supabase
       board_id: string     // Monday board
       item_id: string      // item ATUAL (não desarma esse)
       column_id: string    // coluna Timer
     }
   
   Ação: busca no Supabase todos os monday_item_id com is_running=true
         do user, diferentes do item atual. Desarma cada um pra "Parado"
         via Monday API em requests sequenciais.
   
   Chamado pelo Make timer scenarios (branch RODANDO) após criar entry nova.
   ============================================================ */

const MONDAY_API = 'https://api.monday.com/v2';
const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYzODU1NzY3OCwiYWFpIjoxMSwidWlkIjo0MzE2OTUwOSwiaWFkIjoiMjAyNi0wMy0yN1QwOTo1Mzo0Ny4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTY4NjczMjAsInJnbiI6InVzZTEifQ.Rcm5SgNkiGizjRY_z1ECf7jCEGC2j_UGqtX2h_NkTAw';
const SB_URL = 'https://opqivuzvyvvvajokutvc.supabase.co/rest/v1';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcWl2dXp2eXZ2dmFqb2t1dHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTg0ODIsImV4cCI6MjA5MDQ3NDQ4Mn0.7mH_9ikNMnM2zfUFQrb1ot6t47plzib6No2GPT0gfa0';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  }

  const { member_id, board_id, item_id, column_id } = req.body || {};

  if (!member_id || !board_id || !item_id || !column_id) {
    return res.status(400).json({ ok: false, error: 'Faltam parâmetros.' });
  }

  try {
    // 1. Busca no Supabase outros monday_item_id abertos desse user, exceto o atual
    const sbUrl = `${SB_URL}/tt_time_entries?member_id=eq.${member_id}&is_running=eq.true&monday_item_id=not.is.null&monday_item_id=neq.${item_id}&select=monday_item_id,monday_board_id`;
    const sbRes = await fetch(sbUrl, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
    });
    if (!sbRes.ok) {
      const t = await sbRes.text();
      return res.status(500).json({ ok: false, error: `Supabase: ${t}` });
    }
    const rows = await sbRes.json();

    if (!rows || rows.length === 0) {
      return res.status(200).json({ ok: true, stopped: 0, note: 'Sem cards antigos' });
    }

    // 2. Desarma cada item no Monday sequencialmente (evita rate limit)
    const results = [];
    for (const row of rows) {
      const oldItemId = row.monday_item_id;
      const oldBoardId = row.monday_board_id || board_id;
      if (!oldItemId) continue;

      const mutation = `mutation{change_simple_column_value(board_id:${oldBoardId},item_id:${oldItemId},column_id:"${column_id}",value:"Parado"){id}}`;

      try {
        const mRes = await fetch(MONDAY_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: MONDAY_TOKEN,
            'API-Version': '2024-10'
          },
          body: JSON.stringify({ query: mutation })
        });
        const mData = await mRes.json();
        results.push({
          item: oldItemId,
          ok: !!mData?.data?.change_simple_column_value?.id,
          err: mData?.errors?.[0]?.message || null
        });
      } catch (e) {
        results.push({ item: oldItemId, ok: false, err: String(e) });
      }
    }

    return res.status(200).json({
      ok: true,
      stopped: results.filter((r) => r.ok).length,
      total: rows.length,
      results
    });
  } catch (err) {
    console.error('[timer-stop-others] erro:', err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
