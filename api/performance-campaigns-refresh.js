// /api/performance-campaigns-refresh.js
// Puxa itens ativos dos 2 boards (Tráfego 18412983620 e Produção 5809098456)
// e popula tt_performance_campaigns.
// Rodado pelo cron a cada 5min, e disparado manualmente pelo Hub.

const MONDAY_TOKEN = process.env.MONDAY_API_TOKEN;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

const MONDAY_API = 'https://api.monday.com/v2';
const HDR_MONDAY = {
  'Content-Type': 'application/json',
  'Authorization': MONDAY_TOKEN,
  'API-Version': '2024-10'
};
const HDR_SB = {
  'apikey': SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json'
};

// Boards e suas configurações
const BOARDS = [
  {
    board_id: 18412983620,
    board_type: 'trafego',
    client_col: 'dropdown_mm3asyeg',
    status_col: 'color_mm3a3jp6',
    // Status que NÃO contam como ativos:
    inactive_statuses: ['Feito', 'Cancelado']
  },
  {
    board_id: 5809098456,
    board_type: 'producao',
    client_col: 'status_16',
    status_col: 'status',
    // Status que NÃO contam como ativos:
    inactive_statuses: ['Feito', 'Cancelado']
  }
];

async function mondayQuery(query, label = 'q') {
  try {
    const r = await fetch(MONDAY_API, {
      method: 'POST',
      headers: HDR_MONDAY,
      body: JSON.stringify({ query })
    });
    const j = await r.json();
    if (j.errors) {
      console.error(`[monday:${label}] errors:`, JSON.stringify(j.errors).substring(0, 500));
      return null;
    }
    return j.data;
  } catch (e) {
    console.error(`[monday:${label}] fetch failed:`, e.message);
    return null;
  }
}

async function sbUpsert(table, payload, onConflict) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: { ...HDR_SB, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Supabase upsert ${table}: ${r.status} ${txt.substring(0, 200)}`);
  }
}

async function loadLabelMapping() {
  const r = await fetch(`${SB_URL}/rest/v1/tt_client_label_mapping?select=monday_label,client_id`, { headers: HDR_SB });
  const rows = await r.json();
  const map = {};
  rows.forEach(row => { map[row.monday_label] = row.client_id });
  return map;
}

async function fetchBoardItems(board) {
  // Pega TODOS os itens com paginação (cursor based)
  // OBS: não filtra por status no Monday — filtra aqui depois porque é mais flexível
  let allItems = [];
  let cursor = null;
  let pageCount = 0;
  const MAX_PAGES = 20; // proteção (500 * 20 = 10k itens máximo)

  do {
    const cursorArg = cursor ? `, cursor: "${cursor}"` : '';
    const query = `query {
      boards(ids: [${board.board_id}]) {
        items_page(limit: 500${cursorArg}) {
          cursor
          items {
            id
            name
            url
            column_values(ids: ["${board.client_col}", "${board.status_col}"]) {
              id
              text
            }
          }
        }
      }
    }`;
    const data = await mondayQuery(query, `board_${board.board_id}_p${pageCount}`);
    if (!data || !data.boards || !data.boards[0]) break;
    const page = data.boards[0].items_page;
    if (page.items) allItems = allItems.concat(page.items);
    cursor = page.cursor;
    pageCount++;
  } while (cursor && pageCount < MAX_PAGES);

  return allItems;
}

async function refreshAllBoards() {
  const labelMap = await loadLabelMapping();
  const results = { boards: {}, upserted: 0, inactive: 0, errors: 0 };

  for (const board of BOARDS) {
    const items = await fetchBoardItems(board);
    console.log(`[${board.board_type}] ${items.length} itens encontrados`);
    let boardUpserted = 0;
    let boardInactive = 0;

    for (const item of items) {
      try {
        const cv = {};
        (item.column_values || []).forEach(c => { cv[c.id] = c.text || '' });
        const statusLabel = cv[board.status_col] || '';
        const clientLabel = cv[board.client_col] || '';

        // Considera ativo se status NÃO está na lista de inativos
        const isActive = !board.inactive_statuses.includes(statusLabel);

        const payload = {
          monday_item_id: Number(item.id),
          monday_board_id: board.board_id,
          board_type: board.board_type,
          item_name: item.name,
          item_url: item.url,
          client_id: labelMap[clientLabel] || null,
          client_label_monday: clientLabel || null,
          status_label: statusLabel,
          is_active: isActive,
          updated_at: new Date().toISOString()
        };
        await sbUpsert('tt_performance_campaigns', payload, 'monday_item_id');
        if (isActive) boardUpserted++; else boardInactive++;
      } catch (e) {
        console.error(`[item ${item.id}] ${e.message}`);
        results.errors++;
      }
    }
    results.boards[board.board_type] = { total: items.length, active: boardUpserted, inactive: boardInactive };
    results.upserted += boardUpserted;
    results.inactive += boardInactive;
  }
  return results;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!MONDAY_TOKEN || !SB_URL || !SB_KEY) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  try {
    const results = await refreshAllBoards();
    return res.status(200).json({ ok: true, ...results });
  } catch (e) {
    console.error('[handler]', e);
    return res.status(500).json({ error: e.message });
  }
};
