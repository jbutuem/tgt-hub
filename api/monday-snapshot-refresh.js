// /api/monday-snapshot-refresh.js  v3 (upsert fix)
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

// IMPORTANT: para upsert real no PostgREST, header Prefer precisa de "resolution=merge-duplicates"
async function sbUpsert(table, payload, onConflict) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: { ...HDR_SB, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Supabase upsert ${table}: ${r.status} ${txt.substring(0,200)}`);
  }
  return null;
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
