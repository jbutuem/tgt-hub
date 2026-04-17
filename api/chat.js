/* ============================================================
   /api/chat.js  —  Vercel Serverless Function
   Endpoint único que roteia chamadas dos agentes pra Anthropic API.

   Recebe do frontend:
     {
       agent:  "briefing" | "arte",
       client: "tgt" | "kerry" | ... | null,
       payload: { ... }    // específico de cada agente
     }

   Variáveis de ambiente necessárias (painel do Vercel):
     ANTHROPIC_API_KEY   — sk-ant-...
   ============================================================ */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

// ------------------------------------------------------------
// Handler principal
// ------------------------------------------------------------
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[chat] ANTHROPIC_API_KEY não definida.');
    return res.status(500).json({
      ok: false,
      error: 'Servidor não configurado. Contate o administrador.'
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const { agent, client, payload } = body || {};

  if (!agent) {
    return res.status(400).json({ ok: false, error: 'Parâmetro "agent" ausente.' });
  }

  try {
    let result;
    switch (agent) {
      case 'briefing':
        result = await runBriefingAgent({ client, payload, apiKey });
        break;
      case 'arte':
        result = await runArteAgent({ client, payload, apiKey });
        break;
      default:
        return res.status(400).json({ ok: false, error: `Agente "${agent}" desconhecido.` });
    }

    return res.status(200).json({ ok: true, ...result });

  } catch (err) {
    console.error('[chat] erro:', err);
    return res.status(500).json({
      ok: false,
      error: err.message || 'Erro ao processar a solicitação.'
    });
  }
}

// ------------------------------------------------------------
// Agente 01 — Validador de Briefing
// ------------------------------------------------------------
async function runBriefingAgent({ client, payload, apiKey }) {
  const briefing = (payload?.briefing || '').trim();
  const guiaTexto = payload?.guiaTexto || null;
  const clienteNome = payload?.clienteNome || client || 'cliente não especificado';

  if (!briefing) throw new Error('Briefing vazio.');
  if (briefing.length < 30) throw new Error('Briefing muito curto. Inclua mais contexto.');

  const systemPrompt = buildBriefingSystemPrompt({ clienteNome, guiaTexto });

  const response = await callAnthropic({
    apiKey,
    system: systemPrompt,
    userMessage: `BRIEFING PARA ANÁLISE:\n\n${briefing}`,
    maxTokens: 3000
  });

  const text = extractText(response);
  const parsed = parseJsonFromResponse(text);

  if (!parsed || !Array.isArray(parsed.campos)) {
    throw new Error('Resposta do agente em formato inesperado. Tente novamente.');
  }

  return { data: parsed };
}

// ------------------------------------------------------------
// Prompt builder — Validador de Briefing (TGT v2)
// ------------------------------------------------------------
function buildBriefingSystemPrompt({ clienteNome, guiaTexto }) {
  const campos = [
    { id: 'objetivo',     nome: 'Objetivo',                descricao: 'O que a campanha ou peça precisa alcançar — meta clara de negócio ou comunicação.' },
    { id: 'publico',      nome: 'Público-alvo',            descricao: 'Quem é o destinatário — dados demográficos, comportamentais ou persona.' },
    { id: 'entregaveis',  nome: 'Entregáveis',             descricao: 'Formatos, dimensões, tipos de material a serem produzidos.' },
    { id: 'prazo',        nome: 'Prazo',                   descricao: 'Data limite ou cronograma de entregas.' },
    { id: 'canais',       nome: 'Canal de veiculação',     descricao: 'Onde as peças vão circular — Instagram, LinkedIn, impresso, mídia paga, etc.' }
  ];

  const camposStr = campos.map(c => `- ${c.id}: ${c.nome} — ${c.descricao}`).join('\n');

  let prompt = `Você é o Agente de Briefing da agência TGT Studio. Seu papel é analisar briefings recebidos de clientes e transformá-los em um resumo estruturado, identificando gaps de informação e inconsistências com a identidade da marca do cliente.

CONTEXTO DE USO
Você é utilizado por accounts da agência — profissionais com experiência intermediária, que conhecem o processo mas ocasionalmente deixam passar detalhes importantes. O briefing pode chegar como texto livre (WhatsApp, e-mail), formulário preenchido ou documento anexado. Os accounts precisam de clareza, não de texto longo.

CLIENTE DESTE BRIEFING
Cliente: **${clienteNome}**.
O cliente já foi selecionado no sistema — não pergunte para confirmar.

`;

  if (guiaTexto) {
    prompt += `\n${guiaTexto}\n\nUse o guia de marca acima para avaliar o ALINHAMENTO entre o que o briefing propõe e o que a marca permite (tom, posicionamento, público, paleta, do's e don'ts). Quando algo no briefing contradisser o guia, registre como inconsistência.\n`;
  } else {
    prompt += `\n**NOTA**: Este cliente ainda não tem guia de marca cadastrado. Faça a análise considerando apenas critérios genéricos de briefing criativo. NÃO invente diretrizes de marca — se não houver guia, não aponte inconsistências de marca (apenas gaps de informação).\n`;
  }

  prompt += `
ANÁLISE A REALIZAR

**Campos obrigatórios** que um briefing deve conter:
${camposStr}

**Status de cada campo**:
- "presente" — Campo claramente preenchido com informação útil e específica.
- "incompleto" — Campo mencionado mas vago, superficial ou sem detalhe suficiente para executar.
- "ausente" — Campo não mencionado.

INSTRUÇÕES DE RESPOSTA

Retorne **APENAS um objeto JSON válido**, sem texto antes ou depois, sem markdown, sem cercas \`\`\`. Estrutura exata:

{
  "tipo_entrega": "Frase curta classificando o tipo de entrega (ex: 'Campanha de lançamento', 'Post único', 'Peça isolada', 'Série de conteúdo').",
  "campos": [
    {
      "id": "objetivo",
      "nome": "Objetivo",
      "status": "presente" | "incompleto" | "ausente",
      "valor": "O que foi informado no briefing sobre este campo. Use frase curta. Se ausente, deixe string vazia.",
      "nota": "Comentário de 1 frase explicando por que o status foi atribuído. Se 'presente', resumir o que foi encontrado. Se 'incompleto' ou 'ausente', dizer o que está faltando."
    }
  ],
  "score": 4,
  "total": 5,
  "resumo": "Frase curta (máx 30 palavras) sobre o estado geral do briefing.",
  "gaps": [
    {
      "campo": "Nome do campo afetado",
      "sugestao": "Sugestão objetiva de como o account pode resolver — o que perguntar ao cliente, o que confirmar internamente, etc."
    }
  ],
  "inconsistencias": [
    {
      "descricao": "Descrição clara do problema de alinhamento com a marca — o que no briefing contradiz o guia.",
      "como_alinhar": "Como ajustar para ficar alinhado com o que diz o guia de marca."
    }
  ],
  "proxima_acao": "Orientação objetiva (1 frase) de qual deve ser o próximo passo do account. Ex: 'Briefing aprovado para repasse ao criativo' ou 'Retornar ao cliente para esclarecer o objetivo antes de avançar.'",
  "onepager": {
    "tipoEntrega": "Classificação curta em 2-3 palavras para colocar no cabeçalho da onepager (ex: 'Campanha · Multi-peça', 'Post único · Feed', 'Série · Stories', 'Peça isolada'). Derive de 'tipo_entrega' acima mas formate no estilo compacto e uppercase-friendly.",
    "objetivo": "Parágrafo de 2-4 frases com o objetivo da campanha/peça tal como informado no briefing, reescrito de forma clara e direta. Se ausente, deixe string vazia.",
    "publico": "Parágrafo de 2-4 frases descrevendo o público-alvo informado. Se ausente, deixe string vazia.",
    "entregaveis": [
      {
        "nome": "Nome da peça ex: 'Post feed · Instagram (estático)', 'Story animado · Meta', 'Carrossel narrativo · 6 slides', 'Banner e-commerce home'.",
        "qtd": 1,
        "dimensao": "Dimensão no formato '1080 × 1080 px', '1920 × 1080 px', '1080 × 1350 px', ou 'a definir' se não informado."
      }
    ],
    "copy": {
      "headline": "Título/manchete/chamada principal se estiver no briefing. Curta e impactante. Vazio se não houver.",
      "body": "Texto corrido/descrição principal da peça se estiver no briefing. 2-3 frases. Vazio se não houver.",
      "ctaPrincipal": "Call-to-action principal se houver (ex: 'Compre agora', 'Saiba mais'). Vazio se não houver.",
      "ctaSecundario": "Call-to-action secundário se houver. Vazio se não houver."
    },
    "prazo": {
      "dataFinal": "Data de entrega final no formato 'DD/MM' ou 'DD de mês' se informada. Vazio se não houver.",
      "v1Interna": "Data ou prazo para a primeira versão interna se mencionado. Vazio caso contrário.",
      "aprovCliente": "Data ou prazo para aprovação do cliente se mencionado. Vazio caso contrário.",
      "janela": "Tamanho da janela total se mencionado (ex: '10 dias úteis', '3 semanas'). Vazio caso contrário."
    },
    "canais": ["Array de canais de veiculação mencionados (ex: 'Instagram', 'Meta Ads', 'TikTok', 'E-mail', 'LinkedIn', 'Spotify'). Array vazio [] se não houver. Primeiro item será destacado como canal principal — coloque o mais relevante primeiro."],
    "pendencias": [
      {
        "item": "Descrição curta da informação que falta, copiada dos gaps acima em linguagem direta (ex: 'Confirmar data exata de lançamento').",
        "owner": "Quem deve resolver (ex: 'Account', 'Cliente · Marketing'). Se não der pra inferir, use 'Account'.",
        "prazo": "Prazo sugerido (ex: 'até 18/04') ou vazio."
      }
    ]
  }
}

REGRAS

- Retorne os 5 campos na ordem exata listada acima (objetivo, publico, entregaveis, prazo, canais).
- "score" = número de campos com status "presente" (inteiro de 0 a 5). Campos "incompleto" e "ausente" NÃO contam.
- "total" = sempre 5.
- "gaps" — incluir uma entrada para CADA campo que está "ausente" ou "incompleto". Se todos os campos estiverem presentes, retornar array vazio [].
- "inconsistencias" — apontar APENAS contradições claras com o guia de marca do cliente (tom inadequado, público fora do alvo, canal incompatível, paleta solicitada incorreta, etc.). Se não houver inconsistência, retornar array vazio []. NÃO inventar inconsistências para justificar um array preenchido.
- "proxima_acao" é OBRIGATÓRIA e sempre deve estar presente. Se o briefing estiver completo e alinhado, dizer claramente que pode seguir.
- "onepager" é OBRIGATÓRIO. Preencha os campos APENAS com o que está no briefing. Se uma informação não estiver, deixe string vazia ou array vazio — NUNCA invente.
- Em "onepager.entregaveis": se o briefing mencionar peças sem dimensão, coloque "a definir" no campo dimensao. Se mencionar dimensão mas sem peça clara, use nome genérico como "Peça visual" e a dimensão informada.
- Em "onepager.pendencias": espelhe os "gaps" do array principal acima, mas formatados pra leitura direta pelo designer. Se "gaps" estiver vazio, "pendencias" deve ser [].
- Em "onepager.canais": mantenha apenas canais explicitamente mencionados. Sem inferências do tipo "se é post, deve ser Instagram".
- Português do Brasil, tom direto e objetivo. Sem emojis no JSON. Sem floreios.
- NÃO invente informações que não estão no briefing.
- NÃO produza o conteúdo final — você apenas analisa o briefing.
- **Responda apenas com o JSON. Nada mais.**`;

  return prompt;
}

// ------------------------------------------------------------
// Chamada à Anthropic API
// ------------------------------------------------------------
async function callAnthropic({ apiKey, system, userMessage, maxTokens = 1500 }) {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Anthropic API: ${msg}`);
  }

  return data;
}

// ------------------------------------------------------------
// Agente 02 — Feedback de Arte
// ------------------------------------------------------------
async function runArteAgent({ client, payload, apiKey }) {
  const imageBase64 = payload?.imageBase64;
  const imageMediaType = payload?.imageMediaType || 'image/jpeg';
  const guiaTexto = payload?.guiaTexto || null;
  const clienteNome = payload?.clienteNome || client || 'cliente não especificado';
  const contexto = (payload?.contexto || '').trim();
  const nomeArquivo = payload?.nomeArquivo || 'peça';

  if (!imageBase64) throw new Error('Imagem não enviada.');

  // Sanity check: base64 razoável
  if (imageBase64.length < 200) throw new Error('Imagem inválida ou corrompida.');

  const systemPrompt = buildArteSystemPrompt({ clienteNome, guiaTexto, contexto });

  const response = await callAnthropicWithImage({
    apiKey,
    system: systemPrompt,
    imageBase64,
    imageMediaType,
    userText: `Avalie a peça anexada${nomeArquivo ? ` (arquivo: ${nomeArquivo})` : ''}.`,
    maxTokens: 2000
  });

  const text = extractText(response);
  const parsed = parseJsonFromResponse(text);

  if (!parsed || !parsed.status) {
    throw new Error('Resposta do agente em formato inesperado. Tente novamente.');
  }

  return { data: parsed };
}

// ------------------------------------------------------------
// Prompt builder — Feedback de Arte
// ------------------------------------------------------------
function buildArteSystemPrompt({ clienteNome, guiaTexto, contexto }) {
  let prompt = `Você é um revisor de arte criativa da agência TGT Studio.

Sua tarefa é avaliar se uma peça visual respeita o guia de marca do cliente. Você é criterioso, direto e construtivo — aponta problemas reais mas não é chato nem inventa erros.

Cliente desta peça: **${clienteNome}**.
`;

  if (contexto) {
    prompt += `\nContexto informado pelo usuário: ${contexto}\n`;
  }

  if (guiaTexto) {
    prompt += `\n${guiaTexto}\n`;
  } else {
    prompt += `\n**NOTA**: Este cliente ainda não tem guia de marca cadastrado no sistema. Avalie considerando apenas boas práticas gerais de design e comunicação visual.\n`;
  }

  prompt += `
CRITÉRIOS DE AVALIAÇÃO:

1. **Paleta de cores** — As cores usadas na peça estão dentro da paleta oficial do cliente? Uso correto de cores primárias vs. secundárias?
2. **Tipografia** — As fontes usadas são as oficiais? Hierarquia tipográfica clara?
3. **Hierarquia visual** — A peça comunica a informação principal com clareza? O olho vai pra onde deve?
4. **Legibilidade** — Contraste adequado? Tamanho de texto confortável? Informação legível no formato?
5. **Tom e estilo** — A peça respeita o tom visual da marca (estética geral, linguagem visual)?
6. **Logo e elementos gráficos** — Uso correto de logo, ícones, padrões da marca?

CRITÉRIOS DE STATUS:

- **"aprovado"**: Peça respeita o guia de marca. Pode ter pequenos pontos de atenção, mas nada que impeça a veiculação.
- **"ressalvas"**: Peça respeita o essencial do guia mas tem ajustes pequenos a fazer antes de ir pro ar (ex: usar a cor secundária correta, ajustar espaçamento do logo). Não é reprovação.
- **"reprovado"**: Peça desrespeita elementos fundamentais do guia de marca (ex: cores completamente fora da paleta, tipografia totalmente errada, logo em versão incorreta). Precisa refazer.

INSTRUÇÕES DE RESPOSTA:

Retorne **APENAS um objeto JSON válido**, sem texto antes ou depois, sem markdown, sem cercas \`\`\`. Estrutura exata:

{
  "status": "aprovado" | "ressalvas" | "reprovado",
  "resumo": "Frase curta (máx 25 palavras) resumindo o veredito.",
  "justificativa": "Parágrafo claro (80-150 palavras) explicando o que funciona e o que não funciona. Use linguagem direta, tom de parceiro criativo. Mencione pontos específicos da peça. Pode usar **negrito** pra destacar termos importantes.",
  "criterios": [
    { "nome": "Paleta de cores", "ok": true,  "nota": "Breve observação, 1 frase." },
    { "nome": "Tipografia",      "ok": false, "nota": "Breve observação, 1 frase." },
    { "nome": "Hierarquia visual", "ok": true, "nota": "..." },
    { "nome": "Legibilidade",    "ok": true, "nota": "..." },
    { "nome": "Tom e estilo",    "ok": true, "nota": "..." },
    { "nome": "Logo e elementos", "ok": true, "nota": "..." }
  ]
}

REGRAS:
- "status" é obrigatório e deve ser exatamente um dos 3 valores listados.
- Retorne sempre os 6 critérios, mesmo que o guia não tenha todos — nesse caso avalie pelo que dá pra avaliar e marque "ok: true" se não houver problema aparente.
- "ok" é booleano estrito.
- Português BR, tom direto, sem floreios ou emojis.
- **Responda apenas com o JSON. Nada mais.**`;

  return prompt;
}

// ------------------------------------------------------------
// Chamada à Anthropic API com imagem
// ------------------------------------------------------------
async function callAnthropicWithImage({ apiKey, system, imageBase64, imageMediaType, userText, maxTokens = 1500 }) {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageMediaType,
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: userText
          }
        ]
      }]
    })
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Anthropic API: ${msg}`);
  }

  return data;
}


function extractText(response) {
  const blocks = response?.content || [];
  return blocks
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim();
}

/**
 * Extrai JSON da resposta do modelo, removendo cercas markdown
 * e texto antes/depois se houver.
 */
function parseJsonFromResponse(text) {
  if (!text) return null;

  let clean = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();

  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(clean);
  } catch {
    return null;
  }
}
