/* ============================================================
   /api/hub-ai.js — HUB IA (comandos por texto/voz)
   v1 (2026-07-29)

   Recebe um comando em linguagem natural + contexto (usuário,
   lista de clientes, data atual) e devolve JSON estruturado
   com a ação interpretada. A EXECUÇÃO acontece no front
   (mesmas regras do lançamento manual). Usa ANTHROPIC_API_KEY
   já configurada no Vercel (mesma dos agentes de briefing/arte).

   POST { text, today, weekday, user_name, access_level,
          clients:[{id,name,team}] }
   → { action:'log_time'|'unknown', client_id, client_name,
       hours, date:'YYYY-MM-DD', start_time:'HH:MM'|null,
       description, ambiguous:bool, alternatives:[{id,name}],
       reply }
   ============================================================ */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, message: 'HUB IA ativo v1' });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'Método não permitido.' });
    }

    const { text, today, weekday, user_name, access_level, clients } = req.body || {};
    if (!text || !today || !Array.isArray(clients)) {
      return res.status(400).json({ ok: false, error: 'Faltam parâmetros (text, today, clients).' });
    }

    const clientList = clients
      .map(c => `- ${c.name} (id: ${c.id}, time: ${c.team || '—'})`)
      .join('\n');

    const system = `Você é o interpretador de comandos do TGT Hub (agência TGT Studio, Campinas-SP).
Sua única saída é um JSON válido, sem markdown, sem texto fora do JSON.

DATA DE HOJE: ${today} (${weekday || ''}) — fuso America/Sao_Paulo.
USUÁRIO: ${user_name || 'desconhecido'} (perfil: ${access_level || '—'}).

CLIENTES DISPONÍVEIS (use exatamente estes ids):
${clientList}

AÇÃO SUPORTADA: lançar horas trabalhadas (log_time).

SCHEMA DA RESPOSTA:
{
  "action": "log_time" | "unknown",
  "client_id": "<id da lista ou null>",
  "client_name": "<nome do cliente escolhido ou null>",
  "hours": <número decimal de horas ou null>,
  "date": "YYYY-MM-DD",
  "start_time": "HH:MM" | null,
  "description": "<descrição do trabalho, limpa e curta>",
  "ambiguous": true|false,
  "alternatives": [{"id":"...","name":"..."}],
  "reply": "<frase curta em pt-BR>"
}

REGRAS:
1. Resolva datas relativas ("ontem", "anteontem", "sexta passada", "hoje de manhã") usando a data de hoje. Sem menção de data = hoje.
2. "meia hora"=0.5, "1h30"=1.5, "das 14 às 16"=2 horas com start_time "14:00".
3. Match de cliente: escolha o MAIS próximo do que foi dito. Atenção ao grupo Kerry — existem várias frentes (Institucional COMM, MKT Ativação, Brands, RH, Packaging, H&T). "Kerry Institucional" ou só "Kerry" → marque ambiguous=true e liste em alternatives as frentes Kerry plausíveis (2 a 4), com client_id = a mais provável (Institucional COMM se disser "institucional"). Para outros clientes, só marque ambiguous se realmente houver mais de um match razoável.
4. description: extraia a atividade descrita (ex.: "Ajuste de website blog"). Sem descrição = "".
5. Se não houver horas nem cliente reconhecível, action="unknown" e reply explicando o que faltou, com um exemplo de comando.
6. reply para log_time: frase natural confirmando o que será lançado (ex.: "Lançar 3h em Kerry Institucional COMM ontem (28/07) — Ajuste de website blog").
7. Nunca invente client_id fora da lista. Nunca produza nada além do JSON.`;

    const r = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system,
        messages: [{ role: 'user', content: text }],
      }),
    });

    if (!r.ok) {
      const errBody = await r.text();
      console.error('[hub-ai] Anthropic error:', r.status, errBody.slice(0, 300));
      return res.status(200).json({ ok: false, error: 'Falha na interpretação (API). Tente novamente.' });
    }

    const data = await r.json();
    const raw = (data?.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error('[hub-ai] JSON parse fail:', clean.slice(0, 300));
      return res.status(200).json({ ok: false, error: 'Não consegui interpretar. Reformule o comando.' });
    }

    // Sanidade: client_id precisa existir na lista enviada
    if (parsed.client_id && !clients.find(c => String(c.id) === String(parsed.client_id))) {
      parsed.client_id = null;
      parsed.ambiguous = true;
    }
    if (Array.isArray(parsed.alternatives)) {
      parsed.alternatives = parsed.alternatives.filter(a => clients.find(c => String(c.id) === String(a.id))).slice(0, 4);
    } else {
      parsed.alternatives = [];
    }

    return res.status(200).json({ ok: true, ...parsed });
  } catch (err) {
    console.error('[hub-ai] ERRO:', err);
    return res.status(200).json({ ok: false, error: String(err?.message || err) });
  }
}
