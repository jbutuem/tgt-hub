// /api/monday-snapshot-refresh.js  v2
// Atualiza tt_monday_hot_items com dados frescos do Monday
//
// Triggered by:
//   1. Vercel Cron (daily)         → GET sem item_id → full refresh
//   2. Monday webhook              → POST com event.pulseId → atualiza só esse item
//   3. Manual                       → POST {force:true} → full refresh on-demand

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

let DEADLINE_COLS_CACHE = null;
let DEADLINE_COLS_LOADED_AT = 0;

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

async function sbRequest(method, path, body) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method,
    headers: { ...HDR_SB, 'Prefer': 'return=minimal' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Supabase ${method} ${path}: ${r.status} ${txt.substring(0,200)}`);
  }
  return r.status === 204 ? null : r.json().catch(() => null);
}

async function loadDeadlineCols() {
  if (DEADLINE_COLS_CACHE && (Date.now() - DEADLINE_COLS_LOADED_AT) < 5 * 60 * 1000) {
    return DEADLINE_COLS_CACHE;
  }
  const r = await fetch(`${SB_URL}/rest/v1/tt_monday_deadline_cols?select=*`, { headers: HDR_SB });
  const rows = await r.json();
  DEADLINE_COLS_CACHE = {};
  for (const row of rows) DEADLINE_COLS_CACHE[row.monday_board_id] = row;
  DEADLINE_COLS_LOADED_AT = Date.now();
  console.log(`[loadDeadlineCols] ${rows.length} boards mapeados`);
  return DEADLINE_COLS_CACHE;
}

function inferDone(statusLabel) {
  if (!statusLabel) return false;
  return /finaliz|feito|arte fechada|done|conclu[íi]d|approved|completed|entregue|delivered|encerrad/i.test(statusLabel);
}

function parseDeadline(colVal, colType) {
  if (!colVal) return null;
  if (colType === 'date') {
    if (typeof colVal === 'string') {
      const m = colVal.match(/(\d{4}-\d{2}-\d{2})/);
      return m ? m[1] : null;
    }
    if (colVal.date) return colVal.date.substring(0, 10);
    return null;
  }
  if (colType === 'timeline') {
    if (typeof colVal === 'string') {
      const m = colVal.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
      if (m) return m[2];
      const m2 = colVal.match(/(\d{4}-\d{2}-\d{2})/);
      return m2 ? m2[1] : null;
    }
    if (colVal.to) return colVal.to.substring(0, 10);
    if (colVal.from) return colVal.from.substring(0, 10);
  }
  return null;
}

// Fetch dados de UM item: tudo em UMA query (incluindo people)
async function fetchMondayItem(boardId, itemId, cols) {
  const cfg = cols[boardId];
  if (!cfg) return { skipped: true, reason: 'no_mapping' };

  // Lista de colunas específicas pedidas + people é descoberta varrendo tudo
  const wantedColIds = [cfg.deadline_col_id, cfg.status_col_id, cfg.priority_col_id].filter(Boolean);
  const colsList = wantedColIds.map(c => `"${c}"`).join(',');

  const query = `query {
    items(ids: [${itemId}]) {
      id
      name
      url
      group { id title }
      ${colsList ? `column_values(ids:[${colsList}]) { id text }` : ''}
    }
  }`;
  const data = await mondayQuery(query, `item_${itemId}`);
  if (!data || !data.items) return { error: true };
  const item = data.items[0];
  if (!item) return { deleted: true };

  return { item, cfg };
}

// Fetch people column separadamente (mais permissivo)
async function fetchPeopleNames(itemId) {
  const q = `query { items(ids:[${itemId}]) { column_values { type text } } }`;
  const data = await mondayQuery(q, `people_${itemId}`);
  if (!data || !data.items || !data.items[0]) return null;
  const allCols = data.items[0].column_values || [];
  const peopleCol = allCols.find(c => c.type === 'people' && c.text && c.text.trim());
  if (!peopleCol) return null;
  return peopleCol.text.split(',').map(s => s.trim()).filter(Boolean);
}

async function listItemsWithHours() {
  const since = new Date(Date.now() - 60 * 86400000).toISOString();
  const r = await fetch(`${SB_URL}/rest/v1/tt_time_entries?monday_item_id=not.is.null&monday_board_id=not.is.null&is_running=eq.false&started_at=gte.${since}&select=monday_item_id,monday_board_id,client_id,hours,started_at`, { headers: HDR_SB });
  const entries = await r.json();
  const map = new Map();
  for (const e of entries) {
    const key = `${e.monday_board_id}:${e.monday_item_id}`;
    if (!map.has(key)) map.set(key, {
      monday_item_id: Number(e.monday_item_id),
      monday_board_id: Number(e.monday_board_id),
      client_id: e.client_id,
      hours_invested: 0,
      entries_count: 0,
      last_activity_at: e.started_at
    });
    const rec = map.get(key);
    rec.hours_invested += (e.hours || 0);
    rec.entries_count++;
    if (e.started_at > rec.last_activity_at) rec.last_activity_at = e.started_at;
  }
  return Array.from(map.values());
}

async function refreshOneItem(boardId, itemId, cols, aggregateData) {
  const result = await fetchMondayItem(boardId, itemId, cols);
  
  if (result.skipped) {
    return { itemId, action: 'skipped', reason: result.reason };
  }
  if (result.deleted) {
    // Item realmente sumiu do Monday: NÃO deletar do snapshot
    // (manter como referência histórica); apenas atualizar timestamp
    return { itemId, action: 'gone' };
  }
  if (result.error) {
    return { itemId, action: 'error' };
  }

  const { item, cfg } = result;
  const cv = {};
  (item.column_values || []).forEach(c => { cv[c.id] = c.text });

  const deadline = parseDeadline(cv[cfg.deadline_col_id], cfg.deadline_col_type);
  const statusLabel = cv[cfg.status_col_id] || null;
  const priorityLabel = cfg.priority_col_id ? (cv[cfg.priority_col_id] || null) : null;

  // People column em chamada separada (não bloqueia se falhar)
  const respNames = await fetchPeopleNames(itemId);

  const payload = {
    monday_item_id: Number(itemId),
    monday_board_id: Number(boardId),
    client_id: aggregateData?.client_id || null,
    item_name: item.name || null,
    item_url: item.url || null,
    group_title: item.group?.title || null,
    status_label: statusLabel,
    priority_label: priorityLabel,
    deadline_date: deadline,
    responsible_names: respNames,
    hours_invested: aggregateData?.hours_invested || 0,
    entries_count: aggregateData?.entries_count || 0,
    last_activity_at: aggregateData?.last_activity_at || null,
    is_done: inferDone(statusLabel),
    updated_at: new Date().toISOString()
  };

  await sbRequest('POST', 'tt_monday_hot_items?on_conflict=monday_item_id', payload);
  return { itemId, action: 'upserted', is_done: payload.is_done };
}

async function fullRefresh(cols) {
  const aggregates = await listItemsWithHours();
  console.log(`[fullRefresh] ${aggregates.length} items para sincronizar`);
  const results = { upserted: 0, skipped: 0, gone: 0, errors: 0 };
  for (const agg of aggregates) {
    try {
      const r = await refreshOneItem(agg.monday_board_id, agg.monday_item_id, cols, {
        client_id: agg.client_id,
        hours_invested: agg.hours_invested,
        entries_count: agg.entries_count,
        last_activity_at: agg.last_activity_at
      });
      if (r.action === 'upserted') results.upserted++;
      else if (r.action === 'skipped') results.skipped++;
      else if (r.action === 'gone') results.gone++;
      else results.errors++;
    } catch (e) {
      console.error(`[fullRefresh] item ${agg.monday_item_id}:`, e.message);
      results.errors++;
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`[fullRefresh] done:`, JSON.stringify(results));
  return results;
}

// ═══════════════════════════════════════════════════════════════
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Validar env vars
  if (!MONDAY_TOKEN || !SB_URL || !SB_KEY) {
    return res.status(500).json({
      error: 'Missing env vars',
      has_monday: !!MONDAY_TOKEN,
      has_sb_url: !!SB_URL,
      has_sb_key: !!SB_KEY
    });
  }

  try {
    const cols = await loadDeadlineCols();

    if (req.method === 'POST' && req.body?.challenge) {
      return res.status(200).json({ challenge: req.body.challenge });
    }

    if (req.method === 'POST' && req.body?.event) {
      const { pulseId, boardId } = req.body.event;
      if (!pulseId || !boardId) {
        return res.status(400).json({ error: 'missing pulseId/boardId' });
      }
      const r = await fetch(`${SB_URL}/rest/v1/tt_time_entries?monday_item_id=eq.${pulseId}&monday_board_id=eq.${boardId}&is_running=eq.false&select=client_id,hours,started_at`, { headers: HDR_SB });
      const entries = await r.json();
      if (!entries.length) {
        return res.status(200).json({ skipped: 'no_hours' });
      }
      const agg = {
        client_id: entries[0].client_id,
        hours_invested: entries.reduce((s, e) => s + (e.hours || 0), 0),
        entries_count: entries.length,
        last_activity_at: entries.reduce((m, e) => e.started_at > m ? e.started_at : m, entries[0].started_at)
      };
      const result = await refreshOneItem(boardId, pulseId, cols, agg);
      return res.status(200).json(result);
    }

    if (req.method === 'GET' || req.body?.force) {
      const results = await fullRefresh(cols);
      return res.status(200).json({ ok: true, ...results });
    }

    return res.status(400).json({ error: 'no action' });

  } catch (e) {
    console.error('[handler] error:', e);
    return res.status(500).json({ error: e.message });
  }
};
