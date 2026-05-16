// /api/monday-snapshot-refresh.js
// Atualiza tt_monday_hot_items com dados frescos do Monday
//
// Triggered by:
//   1. Vercel Cron (hourly)        → GET sem item_id → faz full refresh
//   2. Monday webhook              → POST com event.pulseId → atualiza só esse item
//   3. Manual                       → POST {force:true} → full refresh on-demand

const MONDAY_TOKEN = process.env.MONDAY_API_TOKEN;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY; // service role para bypass RLS

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

// Mapa de board → colunas (carregado do banco no startup)
let DEADLINE_COLS_CACHE = null;
let DEADLINE_COLS_LOADED_AT = 0;

async function mondayQuery(query) {
  const r = await fetch(MONDAY_API, {
    method: 'POST',
    headers: HDR_MONDAY,
    body: JSON.stringify({ query })
  });
  const j = await r.json();
  if (j.errors) {
    console.error('Monday error:', JSON.stringify(j.errors));
    throw new Error('Monday API error');
  }
  return j.data;
}

async function sbRequest(method, path, body) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method,
    headers: { ...HDR_SB, 'Prefer': 'return=minimal' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Supabase ${method} ${path}: ${r.status} ${txt}`);
  }
  return r.status === 204 ? null : r.json().catch(() => null);
}

async function loadDeadlineCols() {
  // Cache de 5 minutos
  if (DEADLINE_COLS_CACHE && (Date.now() - DEADLINE_COLS_LOADED_AT) < 5 * 60 * 1000) {
    return DEADLINE_COLS_CACHE;
  }
  const r = await fetch(`${SB_URL}/rest/v1/tt_monday_deadline_cols?select=*`, { headers: HDR_SB });
  const rows = await r.json();
  DEADLINE_COLS_CACHE = {};
  for (const row of rows) DEADLINE_COLS_CACHE[row.monday_board_id] = row;
  DEADLINE_COLS_LOADED_AT = Date.now();
  return DEADLINE_COLS_CACHE;
}

// Status "done" varia por board — heurística por palavras-chave
function inferDone(statusLabel) {
  if (!statusLabel) return false;
  const s = statusLabel.toLowerCase();
  return /finaliz|feito|arte fechada|done|conclu[íi]d|approved|completed|entregue|delivered|encerrad/i.test(s);
}

function parseDeadline(colVal, colType) {
  if (!colVal) return null;
  if (colType === 'date') {
    // date column: { date: "YYYY-MM-DD" } or "YYYY-MM-DD"
    if (typeof colVal === 'string') return colVal.substring(0, 10);
    if (colVal.date) return colVal.date.substring(0, 10);
    return null;
  }
  if (colType === 'timeline') {
    // timeline: "2026-05-12 - 2026-05-14" or { to: "...", from: "..." }
    if (typeof colVal === 'string') {
      const m = colVal.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
      if (m) return m[2]; // usa data final
      const m2 = colVal.match(/(\d{4}-\d{2}-\d{2})/);
      return m2 ? m2[1] : null;
    }
    if (colVal.to) return colVal.to.substring(0, 10);
    if (colVal.from) return colVal.from.substring(0, 10);
  }
  return null;
}

// Fetch dados de um item específico
async function fetchMondayItem(boardId, itemId, cols) {
  const cfg = cols[boardId];
  if (!cfg) return null;
  const wantedCols = [cfg.deadline_col_id, cfg.status_col_id, cfg.priority_col_id]
    .filter(Boolean)
    .map(c => `"${c}"`).join(',');
  const query = `query {
    items(ids: [${itemId}]) {
      id
      name
      url
      group { id title }
      column_values(ids:[${wantedCols}]) {
        id
        text
        value
      }
      ${''/* people column é separado pra pegar nomes */}
    }
  }`;
  const data = await mondayQuery(query);
  return data?.items?.[0] || null;
}

// Fetch lista de items com horas (para full refresh)
async function listItemsWithHours() {
  const r = await fetch(`${SB_URL}/rest/v1/tt_time_entries?monday_item_id=not.is.null&monday_board_id=not.is.null&is_running=eq.false&started_at=gte.${new Date(Date.now() - 60 * 86400000).toISOString()}&select=monday_item_id,monday_board_id,client_id,hours,started_at,description`, {
    headers: HDR_SB
  });
  const entries = await r.json();
  // Agrega por (board, item)
  const map = new Map();
  for (const e of entries) {
    const key = `${e.monday_board_id}:${e.monday_item_id}`;
    if (!map.has(key)) map.set(key, {
      monday_item_id: Number(e.monday_item_id),
      monday_board_id: Number(e.monday_board_id),
      client_id: e.client_id,
      sample_name: e.description,
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

// Atualiza UM item no snapshot
async function refreshOneItem(boardId, itemId, cols, aggregateData) {
  const item = await fetchMondayItem(boardId, itemId, cols);
  if (!item) {
    // Item foi deletado no Monday — remove do snapshot
    await sbRequest('DELETE', `tt_monday_hot_items?monday_item_id=eq.${itemId}`);
    return { itemId, action: 'deleted' };
  }
  const cfg = cols[boardId];
  const cv = {};
  (item.column_values || []).forEach(c => { cv[c.id] = c.text });

  const deadline = parseDeadline(cv[cfg.deadline_col_id], cfg.deadline_col_type);
  const statusLabel = cv[cfg.status_col_id] || null;
  const priorityLabel = cfg.priority_col_id ? (cv[cfg.priority_col_id] || null) : null;

  // Pega responsáveis (people column) com query separada
  let respNames = null;
  try {
    const peopleQ = `query { items(ids:[${itemId}]) { column_values { id type text } } }`;
    const peopleData = await mondayQuery(peopleQ);
    const allCols = peopleData?.items?.[0]?.column_values || [];
    const peopleCol = allCols.find(c => c.type === 'people' && c.text);
    if (peopleCol?.text) {
      respNames = peopleCol.text.split(',').map(s => s.trim()).filter(Boolean);
    }
  } catch (e) { /* ignore */ }

  const payload = {
    monday_item_id: Number(itemId),
    monday_board_id: Number(boardId),
    client_id: aggregateData?.client_id,
    item_name: item.name,
    item_url: item.url,
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

  // Upsert via PostgREST
  await sbRequest('POST', 'tt_monday_hot_items?on_conflict=monday_item_id', payload);
  return { itemId, action: 'upserted', is_done: payload.is_done };
}

// Full refresh: re-atualiza todos os items com horas
async function fullRefresh(cols) {
  const aggregates = await listItemsWithHours();
  console.log(`[fullRefresh] ${aggregates.length} items para sincronizar`);
  const results = { upserted: 0, deleted: 0, errors: 0 };
  for (const agg of aggregates) {
    try {
      const aggMap = { client_id: agg.client_id, hours_invested: agg.hours_invested, entries_count: agg.entries_count, last_activity_at: agg.last_activity_at };
      const r = await refreshOneItem(agg.monday_board_id, agg.monday_item_id, cols, aggMap);
      if (r.action === 'deleted') results.deleted++;
      else results.upserted++;
    } catch (e) {
      console.error(`[fullRefresh] item ${agg.monday_item_id}:`, e.message);
      results.errors++;
    }
    // Rate limit gentle
    await new Promise(r => setTimeout(r, 300));
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════
module.exports = async (req, res) => {
  // CORS pra POST do Monday e GET do cron
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const cols = await loadDeadlineCols();

    // === MONDAY WEBHOOK CHALLENGE ===
    // Monday envia POST {challenge: "xxx"} ao criar o webhook
    if (req.method === 'POST' && req.body?.challenge) {
      return res.status(200).json({ challenge: req.body.challenge });
    }

    // === SINGLE-ITEM UPDATE (Monday webhook) ===
    // Monday envia { event: { pulseId, boardId, type, ... } }
    if (req.method === 'POST' && req.body?.event) {
      const { pulseId, boardId } = req.body.event;
      if (!pulseId || !boardId) {
        return res.status(400).json({ error: 'missing pulseId/boardId' });
      }
      // Re-pega aggregate desse item do banco
      const r = await fetch(`${SB_URL}/rest/v1/tt_time_entries?monday_item_id=eq.${pulseId}&monday_board_id=eq.${boardId}&is_running=eq.false&select=client_id,hours,started_at`, { headers: HDR_SB });
      const entries = await r.json();
      if (entries.length === 0) {
        // Item não tem horas TGT lançadas — ignora (não está no escopo do radar)
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

    // === FULL REFRESH (cron ou manual com ?force=1) ===
    if (req.method === 'GET' || req.body?.force) {
      const results = await fullRefresh(cols);
      return res.status(200).json({ ok: true, ...results });
    }

    return res.status(400).json({ error: 'no action' });

  } catch (e) {
    console.error('[snapshot-refresh] error:', e);
    return res.status(500).json({ error: e.message });
  }
};
