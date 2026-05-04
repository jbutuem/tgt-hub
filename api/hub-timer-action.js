/* ============================================================
   /api/hub-timer-action.js — Vercel Serverless Function
   
   Endpoint chamado pelo HUB quando o usuário inicia/para timer
   pela interface web. Sincroniza a coluna People "Executando"
   no Monday correspondente.
   
   POST {
     action: 'start' | 'stop',
     monday_user_id: string,
     monday_board_id: string,
     monday_item_id: string
   }
   
   start → adiciona o user na coluna People do card
   stop  → remove o user da coluna People do card (mantém os outros)
   ============================================================ */

const MONDAY_API = 'https://api.monday.com/v2';
const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYzODU1NzY3OCwiYWFpIjoxMSwidWlkIjo0MzE2OTUwOSwiaWFkIjoiMjAyNi0wMy0yN1QwOTo1Mzo0Ny4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTY4NjczMjAsInJnbiI6InVzZTEifQ.Rcm5SgNkiGizjRY_z1ECf7jCEGC2j_UGqtX2h_NkTAw';

// Mapeamento board_id → exec_col (mesma estrutura do monday-timer.js)
const BOARDS = {
  '8067947432':  { exec_col: 'multiple_person_mm31syka' }, // NOU
  '18401417952': { exec_col: 'multiple_person_mm31gyg0' }, // NONO
  '4911397036':  { exec_col: 'multiple_person_mm31vpmm' }, // LESAFFRE
  '5845978306':  { exec_col: 'multiple_person_mm31q5mx' }, // CELERA
  '18309098296': { exec_col: 'multiple_person_mm31e586' }, // NOVONESIS
  '4911421503':  { exec_col: 'multiple_person_mm31xq3y' }, // BAPTISTELLA
  '7033792227':  { exec_col: 'multiple_person_mm318epv' }, // KERRY RH
  '4530656213':  { exec_col: 'multiple_person_mm31fa0a' }, // KERRY INST
  '4711581849':  { exec_col: 'multiple_person_mm319y9p' }, // KERRY BRANDS
  '18395709707': { exec_col: 'multiple_person_mm31q6g7' }, // KERRY H&T
  '8824474984':  { exec_col: 'multiple_person_mm31b038' }, // KERRY PACKAGING
  '6594719717':  { exec_col: 'multiple_person_mm31vjt7' }, // LESAFFRE PACKAGING
  '18399575558': { exec_col: 'multiple_person_mm31sbfg' }, // ADM NUTRITION
  '9356404232':  { exec_col: 'multiple_person_mm31cd11' }, // LLEV
  '18387416550': { exec_col: 'multiple_person_mm312ny4' }, // DE MARCHI USA
  '8938781105':  { exec_col: 'multiple_person_mm316v6q' }, // DE MARCHI BR
  '4911473212':  { exec_col: 'multiple_person_mm31mjfe' }, // PRONUTRITION
  '5378150325':  { exec_col: 'multiple_person_mm312c20' }, // GAMER HUT
  '5382264448':  { exec_col: 'multiple_person_mm31kfa4' }, // PÃO DO CAMBUÍ
  '9356397361':  { exec_col: 'multiple_person_mm31yx0p' }, // UV-LINE
  '18395931952': { exec_col: 'multiple_person_mm312gh7' }, // GAROA PACKAGING
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

// Lê o valor atual da coluna People de um card
async function readPeopleColumn(itemId, columnId) {
  const q = `query{ items(ids:[${itemId}]){ column_values(ids:["${columnId}"]){ value } } }`;
  const r = await mondayQuery(q);
  const raw = r?.data?.items?.[0]?.column_values?.[0]?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return parsed.personsAndTeams || [];
  } catch {
    return [];
  }
}

// Escreve o valor da coluna People (substitui completamente)
async function writePeopleColumn(boardId, itemId, columnId, persons) {
  const newVal = JSON.stringify({ personsAndTeams: persons });
  const escapedVal = newVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const mut = `mutation{ change_column_value(board_id:${boardId}, item_id:${itemId}, column_id:"${columnId}", value:"${escapedVal}"){id} }`;
  return mondayQuery(mut);
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, message: 'Hub timer action endpoint ativo' });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'Método não permitido.' });
    }

    const body = req.body || {};
    const { action, monday_user_id, monday_board_id, monday_item_id } = body;

    if (!action || !['start', 'stop'].includes(action)) {
      return res.status(400).json({ ok: false, error: 'action inválida' });
    }
    if (!monday_user_id || !monday_board_id || !monday_item_id) {
      return res.status(400).json({ ok: false, error: 'Faltam parâmetros' });
    }

    const boardCfg = BOARDS[String(monday_board_id)];
    if (!boardCfg) {
      return res.status(200).json({ ok: false, error: 'Board não mapeado' });
    }

    const userIdStr = String(monday_user_id);
    const persons = await readPeopleColumn(monday_item_id, boardCfg.exec_col);

    let newPersons;
    let changed = false;

    if (action === 'start') {
      // Adiciona se ainda não estiver
      if (persons.find(p => String(p.id) === userIdStr)) {
        return res.status(200).json({ ok: true, action, skipped: true, reason: 'já está' });
      }
      newPersons = [...persons, { id: parseInt(userIdStr, 10), kind: 'person' }];
      changed = true;
    } else {
      // stop: remove
      newPersons = persons.filter(p => String(p.id) !== userIdStr);
      if (newPersons.length === persons.length) {
        return res.status(200).json({ ok: true, action, skipped: true, reason: 'não estava' });
      }
      changed = true;
    }

    if (changed) {
      const r = await writePeopleColumn(monday_board_id, monday_item_id, boardCfg.exec_col, newPersons);
      const ok = !!r?.data?.change_column_value?.id;
      return res.status(200).json({
        ok,
        action,
        persons_now: newPersons.length,
        err: r?.errors?.[0]?.message,
      });
    }

    return res.status(200).json({ ok: true, action, noop: true });
  } catch (err) {
    console.error('[hub-timer-action] ERRO:', err);
    return res.status(200).json({ ok: false, error: String(err?.message || err) });
  }
}
