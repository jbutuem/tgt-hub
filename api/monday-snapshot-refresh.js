// /api/monday-snapshot-refresh.js  v3 (dinâmico)
// Atualiza tt_monday_hot_items com dados frescos do Monday
//
// FONTE DA VERDADE DOS BOARDS = tt_clients (cliente ativo com monday_board_id).
//   Cadastrou/moveu/inativou cliente no Organograma → reflete sozinho. Sem editar código.
//   Colunas de prazo/status: tt_monday_deadline_cols (override) OU auto-detecção por board.
//
// Triggered by:
//   1. Vercel Cron (daily)         → GET                 → full refresh (board-driven)
//   2. Monday webhook              → POST {event}        → atualiza só esse item
//   3. Manual                       → POST {force:true}   → full refresh on-demand

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

const ITEMS_PER_PAGE = 100;
const MAX_PAGES_PER_BOARD = 8;     // teto de segurança: 800 itens/board
const PAGE_DELAY_MS = 120;

let DEADLINE_COLS_CACHE = null;
let DEADLINE_COLS_LOADED_AT = 0;
let GROUP_RULES_CACHE = null;
let GROUP_RULES_LOADED_AT = 0;
const AUTODETECT_CACHE = {};

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

// Upsert em LOTE (um POST para N linhas) — evita centenas de chamadas sequenciais
async function sbUpsertBatch(rows) {
  if (!rows || !rows.length) return 0;
  let done = 0;
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const r = await fetch(`${SB_URL}/rest/v1/tt_monday_hot_items?on_conflict=monday_item_id`, {
      method: 'POST',
      headers: { ...HDR_SB, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(slice)
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`Supabase bulk upsert: ${r.status} ${txt.substring(0,200)}`);
    }
    done += slice.length;
  }
  return done;
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
  console.log(`[loadDeadlineCols] ${rows.length} boards mapeados (override)`);
  return DEADLINE_COLS_CACHE;
}

// ── DINÂMICO: lista de boards = clientes ativos + boards extras ────
//   Fonte 1: tt_clients (board primário — 1 por cliente)
//   Fonte 2: tt_monday_deadline_cols com client_id (boards EXTRAS — N por cliente)
//   → adicionar outro board a um cliente = 1 linha em tt_monday_deadline_cols
async function loadActiveBoards() {
  const map = new Map();
  // 1) Board primário de cada cliente ativo
  const rc = await fetch(`${SB_URL}/rest/v1/tt_clients?is_active=eq.true&monday_board_id=not.is.null&select=id,name,monday_board_id`, { headers: HDR_SB });
  for (const c of await rc.json()) {
    const bid = Number(c.monday_board_id);
    if (bid && !map.has(bid)) map.set(bid, { board_id: bid, client_id: c.id, name: c.name });
  }
  // 2) Boards extras mapeados a um cliente (ex.: Gamer Hut com 2+ boards)
  const rd = await fetch(`${SB_URL}/rest/v1/tt_monday_deadline_cols?client_id=not.is.null&select=monday_board_id,client_id,board_name`, { headers: HDR_SB });
  for (const d of await rd.json()) {
    const bid = Number(d.monday_board_id);
    if (bid && !map.has(bid)) map.set(bid, { board_id: bid, client_id: d.client_id, name: d.board_name || null });
  }
  console.log(`[loadActiveBoards] ${map.size} boards ativos`);
  return Array.from(map.values());
}

// ── Auto-detecção de colunas quando o board não está no override ──
async function autoDetectCols(boardId) {
  if (AUTODETECT_CACHE[boardId]) return AUTODETECT_CACHE[boardId];
  const q = `query { boards(ids:[${boardId}]) { columns { id title type } } }`;
  const data = await mondayQuery(q, `cols_${boardId}`);
  const cols = data?.boards?.[0]?.columns || [];
  const dl = cols.find(c => /prazo|deadline|entrega|cronograma|previs|publica/i.test(c.title) && (c.type === 'date' || c.type === 'timeline'))
          || cols.find(c => c.type === 'date' || c.type === 'timeline');
  const st = cols.find(c => /status/i.test(c.title) && c.type === 'status')
          || cols.find(c => c.type === 'status');
  const pr = cols.find(c => /prioridade|priority/i.test(c.title) && c.type === 'status');
  const cfg = {
    deadline_col_id: dl ? dl.id : '',
    deadline_col_type: dl ? (dl.type === 'timeline' ? 'timeline' : 'date') : 'date',
    status_col_id: st ? st.id : '',
    priority_col_id: pr ? pr.id : ''
  };
  AUTODETECT_CACHE[boardId] = cfg;
  console.log(`[autoDetect ${boardId}] deadline=${cfg.deadline_col_id} status=${cfg.status_col_id}`);
  return cfg;
}

function inferDone(statusLabel) {
  if (!statusLabel) return false;
  return /finaliz|feito|arte fechada|done|conclu[íi]d|approved|completed|entregue|delivered|encerrad/i.test(statusLabel);
}

async function loadGroupRules() {
  if (GROUP_RULES_CACHE && (Date.now() - GROUP_RULES_LOADED_AT) < 5 * 60 * 1000) {
    return GROUP_RULES_CACHE;
  }
  const r = await fetch(`${SB_URL}/rest/v1/tt_radar_group_rules?select=monday_board_id,group_title,category`, { headers: HDR_SB });
  const rows = await r.json();
  GROUP_RULES_CACHE = {};
  for (const row of rows) {
    const key = `${row.monday_board_id}|${row.group_title}`;
    GROUP_RULES_CACHE[key] = row.category;
  }
  GROUP_RULES_LOADED_AT = Date.now();
  console.log(`[loadGroupRules] ${rows.length} regras carregadas`);
  return GROUP_RULES_CACHE;
}

function inferGroupCategory(boardId, groupTitle, rules) {
  if (!groupTitle) return 'unclassified';
  const key = `${boardId}|${groupTitle}`;
  if (rules[key]) return rules[key];
  const t = groupTitle.toLowerCase();
  if (/em aprovaç[aã]o|client review|aprovação 1|aprovação cliente|avaliação.*\(pro\)|cliente review/i.test(t)) return 'client_review';
  if (/finaliz|completed|publicado|arquivo final|done|conclu[íi]d|encerrad/i.test(t)) return 'done';
  if (/on hold|cancelad|pausad|stand[ ]?by/i.test(t)) return 'ignore';
  if (/backlog|sprint|solicit|banco de conte[úu]dos|desenvolv|fechamento|postagen|material|website|a fazer|configur|planejamento|redes sociais|social\s*[-—]/i.test(t)) return 'active';
  return 'unclassified';
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

// ── Mapa de horas investidas (últimos 60d) por board:item ──────────
async function buildHoursMap() {
  const since = new Date(Date.now() - 60 * 86400000).toISOString();
  const r = await fetch(`${SB_URL}/rest/v1/tt_time_entries?monday_item_id=not.is.null&monday_board_id=not.is.null&is_running=eq.false&started_at=gte.${since}&select=monday_item_id,monday_board_id,client_id,hours,started_at`, { headers: HDR_SB });
  const entries = await r.json();
  const map = new Map();
  for (const e of entries) {
    const key = `${e.monday_board_id}:${e.monday_item_id}`;
    if (!map.has(key)) map.set(key, { hours: 0, count: 0, last: e.started_at, client_id: e.client_id });
    const rec = map.get(key);
    rec.hours += (e.hours || 0);
    rec.count++;
    if (e.started_at > rec.last) rec.last = e.started_at;
  }
  return map;
}

// ── Varre UM board inteiro (paginando) e faz upsert do que importa ──
async function scanBoard(board, cols, groupRules, hoursMap, results) {
  let cfg = cols[board.board_id];
  if (!cfg || (!cfg.deadline_col_id && !cfg.status_col_id)) {
    cfg = await autoDetectCols(board.board_id);
  }
  const batch = [];
  let cursor = null, pages = 0;
  do {
    const q = `query {
      boards(ids: [${board.board_id}]) {
        items_page(limit: ${ITEMS_PER_PAGE}${cursor ? `, cursor: "${cursor}"` : ''}) {
          cursor
          items { id name url group { title } column_values { id text type } }
        }
      }
    }`;
    const data = await mondayQuery(q, `board_${board.board_id}`);
    const page = data?.boards?.[0]?.items_page;
    if (!page) break;
    cursor = page.cursor;

    for (const item of (page.items || [])) {
      const cv = {};
      let peopleNames = null;
      for (const c of (item.column_values || [])) {
        cv[c.id] = c.text;
        if (c.type === 'people' && c.text && c.text.trim() && !peopleNames) {
          peopleNames = c.text.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      const deadline = cfg.deadline_col_id ? parseDeadline(cv[cfg.deadline_col_id], cfg.deadline_col_type) : null;
      const statusLabel = cfg.status_col_id ? (cv[cfg.status_col_id] || null) : null;
      const priorityLabel = cfg.priority_col_id ? (cv[cfg.priority_col_id] || null) : null;
      const groupTitle = item.group?.title || null;
      const isDone = inferDone(statusLabel);

      const key = `${board.board_id}:${item.id}`;
      const h = hoursMap.get(key);
      const hours = h ? h.hours : 0;

      // Mantém a tabela enxuta: só grava itens relevantes ao Radar
      //  - qualquer item com horas investidas (qualquer status), OU
      //  - item pendente (não-done) que tenha prazo definido
      if (!(hours > 0 || (!isDone && deadline))) continue;

      batch.push({
        monday_item_id: Number(item.id),
        monday_board_id: board.board_id,
        client_id: board.client_id,
        item_name: item.name || null,
        item_url: item.url || null,
        group_title: groupTitle,
        group_category: inferGroupCategory(board.board_id, groupTitle, groupRules),
        status_label: statusLabel,
        priority_label: priorityLabel,
        deadline_date: deadline,
        responsible_names: peopleNames,
        hours_invested: hours,
        entries_count: h ? h.count : 0,
        last_activity_at: h ? h.last : null,
        is_done: isDone,
        updated_at: new Date().toISOString()
      });
    }
    pages++;
  } while (cursor && pages < MAX_PAGES_PER_BOARD);

  // Um único upsert em lote por board
  try {
    const n = await sbUpsertBatch(batch);
    results.upserted += n;
  } catch (e) {
    console.error(`[scanBoard ${board.board_id}] bulk upsert:`, e.message);
    results.errors++;
  }
}

async function fullRefresh(cols) {
  const groupRules = await loadGroupRules();
  const hoursMap = await buildHoursMap();
  const boards = await loadActiveBoards();
  const results = { upserted: 0, errors: 0, boards: boards.length, cleaned: 0 };

  // Limpeza: remove do snapshot itens de boards que não são mais de cliente ativo
  // (cliente inativado/removido no Organograma → some do Radar)
  try {
    const activeIds = boards.map(b => b.board_id);
    if (activeIds.length) {
      await sbRequest('DELETE', `tt_monday_hot_items?monday_board_id=not.in.(${activeIds.join(',')})`);
      results.cleaned = 1;
    }
  } catch (e) {
    console.error('[fullRefresh] cleanup:', e.message);
  }

  // Varre os boards em PARALELO (blocos) — reduz drasticamente o tempo total,
  // já que cada board é uma consulta lenta ao Monday.
  const CONCURRENCY = 5;
  for (let i = 0; i < boards.length; i += CONCURRENCY) {
    const chunk = boards.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(b =>
      scanBoard(b, cols, groupRules, hoursMap, results).catch(e => {
        console.error(`[fullRefresh] board ${b.board_id}:`, e.message);
        results.errors++;
      })
    ));
  }
  console.log('[fullRefresh] done:', JSON.stringify(results));
  return results;
}

// ── Webhook: atualiza só 1 item (start/stop do timer) ──────────────
async function fetchMondayItem(boardId, itemId, cols) {
  let cfg = cols[boardId];
  if (!cfg || (!cfg.deadline_col_id && !cfg.status_col_id)) {
    cfg = await autoDetectCols(boardId);
  }
  const wantedColIds = [cfg.deadline_col_id, cfg.status_col_id, cfg.priority_col_id].filter(Boolean);
  const colsList = wantedColIds.map(c => `"${c}"`).join(',');
  const query = `query {
    items(ids: [${itemId}]) {
      id name url group { id title }
      ${colsList ? `column_values(ids:[${colsList}]) { id text }` : ''}
    }
  }`;
  const data = await mondayQuery(query, `item_${itemId}`);
  if (!data || !data.items) return { error: true };
  const item = data.items[0];
  if (!item) return { deleted: true };
  return { item, cfg };
}

async function fetchPeopleNames(itemId) {
  const q = `query { items(ids:[${itemId}]) { column_values { type text } } }`;
  const data = await mondayQuery(q, `people_${itemId}`);
  if (!data || !data.items || !data.items[0]) return null;
  const allCols = data.items[0].column_values || [];
  const peopleCol = allCols.find(c => c.type === 'people' && c.text && c.text.trim());
  if (!peopleCol) return null;
  return peopleCol.text.split(',').map(s => s.trim()).filter(Boolean);
}

async function refreshOneItem(boardId, itemId, cols, aggregateData, groupRules) {
  const result = await fetchMondayItem(boardId, itemId, cols);
  if (result.deleted) return { itemId, action: 'gone' };
  if (result.error) return { itemId, action: 'error' };

  const { item, cfg } = result;
  const cv = {};
  (item.column_values || []).forEach(c => { cv[c.id] = c.text });

  const deadline = cfg.deadline_col_id ? parseDeadline(cv[cfg.deadline_col_id], cfg.deadline_col_type) : null;
  const statusLabel = cfg.status_col_id ? (cv[cfg.status_col_id] || null) : null;
  const priorityLabel = cfg.priority_col_id ? (cv[cfg.priority_col_id] || null) : null;
  const groupTitle = item.group?.title || null;
  const respNames = await fetchPeopleNames(itemId);

  const payload = {
    monday_item_id: Number(itemId),
    monday_board_id: Number(boardId),
    client_id: aggregateData?.client_id || null,
    item_name: item.name || null,
    item_url: item.url || null,
    group_title: groupTitle,
    group_category: inferGroupCategory(boardId, groupTitle, groupRules || {}),
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
  await sbUpsertBatch([payload]);
  return { itemId, action: 'upserted', is_done: payload.is_done };
}

// ═══════════════════════════════════════════════════════════════
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!MONDAY_TOKEN || !SB_URL || !SB_KEY) {
    return res.status(500).json({
      error: 'Missing env vars',
      has_monday: !!MONDAY_TOKEN, has_sb_url: !!SB_URL, has_sb_key: !!SB_KEY
    });
  }

  try {
    const cols = await loadDeadlineCols();

    if (req.method === 'POST' && req.body?.challenge) {
      return res.status(200).json({ challenge: req.body.challenge });
    }

    if (req.method === 'POST' && req.body?.event) {
      const { pulseId, boardId } = req.body.event;
      if (!pulseId || !boardId) return res.status(400).json({ error: 'missing pulseId/boardId' });
      const r = await fetch(`${SB_URL}/rest/v1/tt_time_entries?monday_item_id=eq.${pulseId}&monday_board_id=eq.${boardId}&is_running=eq.false&select=client_id,hours,started_at`, { headers: HDR_SB });
      const entries = await r.json();
      const agg = entries.length ? {
        client_id: entries[0].client_id,
        hours_invested: entries.reduce((s, e) => s + (e.hours || 0), 0),
        entries_count: entries.length,
        last_activity_at: entries.reduce((m, e) => e.started_at > m ? e.started_at : m, entries[0].started_at)
      } : { client_id: null, hours_invested: 0, entries_count: 0, last_activity_at: null };
      const result = await refreshOneItem(boardId, pulseId, cols, agg, await loadGroupRules());
      return res.status(200).json(result);
    }

    // ── Modo LISTA: retorna boards ativos + limpa órfãos (rápido, sem Monday) ──
    //    O front usa isto pra saber quais boards varrer, um a um.
    if (req.method === 'POST' && req.body?.list) {
      const boards = await loadActiveBoards();
      try {
        const activeIds = boards.map(b => b.board_id);
        if (activeIds.length) {
          await sbRequest('DELETE', `tt_monday_hot_items?monday_board_id=not.in.(${activeIds.join(',')})`);
        }
      } catch (e) { console.error('[list] cleanup:', e.message); }
      return res.status(200).json({ ok: true, boards });
    }

    // ── Modo BOARD ÚNICO: varre só 1 board (evita o timeout do full refresh) ──
    if (req.method === 'POST' && req.body?.board_id) {
      const groupRules = await loadGroupRules();
      const hoursMap = await buildHoursMap();
      const results = { upserted: 0, errors: 0 };
      await scanBoard(
        { board_id: Number(req.body.board_id), client_id: req.body.client_id || null, name: null },
        cols, groupRules, hoursMap, results
      );
      return res.status(200).json({ ok: true, ...results });
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
