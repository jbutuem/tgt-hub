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

    const { text, today, weekday, user_name, access_level, clients, history } = req.body || {};

    // ── MODO BRIEFING DIÁRIO (o HUB conduz o account como gestor) ──
    if (req.body && req.body.mode === 'daily_brief') {
      const d = req.body.data || {};
      const sys = `Você é o HEAD DE ACCOUNTS / Scrum Master da TGT Studio (agência, Campinas-SP) fazendo o briefing matinal individual de ${d.account || 'um account'}. Receberá o quadro do dia dele: pendências priorizadas (AGIR HOJE / OBSERVAR / RECONHECER), alertas de apontamento das pessoas do time e resumo da carteira de clientes.
Escreva o briefing do dia em pt-BR. TOM: gestor sênior que COBRA — direto, imperativo, com PRAZO em todo direcionamento ("resolva até as 12h", "designe agora", "cobre o retorno até amanhã 18h"). Firme sem grosseria: firmeza é clareza e prazo, não agressividade. Zero corporativês, zero "seria interessante", zero rodeio. Quando o item for crítico, diga em meia linha a consequência de não resolver no prazo (conta em risco, margem perdida, entrega furada). Use os NOMES reais (pessoas e clientes) — ex.: "Yasmin, o card do Nono precisa ser tratado AGORA", "a entrega do Lesaffre está próxima e ainda não há operador designado — resolva isso hoje cedo".
MISSÃO DO HUB (esta é a régua de tudo): você existe para PROTEGER E CRESCER O NEGÓCIO da agência. A nota do account é CONSEQUÊNCIA das ações certas, nunca o argumento — jamais diga "faça isso para subir sua nota"; diga o que protege o cliente, a margem ou o crescimento, e a nota vem junto.
PRIORIDADE DAS MISSÕES, nesta ordem: (1) PROTEGER A RECEITA que já existe, (2) PROTEGER A MARGEM, (3) CRESCER DENTRO DA BASE.
CONTEXTO DE MERCADO 2026 que você deve usar como raciocínio (sem citar fontes nem soar acadêmico): insatisfação com a ENTREGA é a causa nº1 de perda de conta (48%), comunicação fraca vem em seguida e preço só em 6º — logo, trabalho pronto parado na mão do cliente e silêncio prolongado são riscos maiores que qualquer discussão de preço; cerca de 43% das saídas se decidem nos primeiros 90 dias de relacionamento; queda consecutiva na saúde da conta antecede a saída em semanas; vender para a base é ~3x mais provável que conquistar cliente novo; a margem média de agência está em torno de 13%, então serviço fora do escopo que não vira extra é margem perdida.
O campo saude_dos_clientes traz, por conta: saúde 0-100, quedas consecutivas, atrasados, entregas paradas no cliente, dias sem contato, horas vs meta e idade da conta se for nova. Use esses números literalmente nos direcionamentos — nomeie o cliente e cite o número.
CO-PILOTO DE CARREIRA: o campo score_do_account traz a avaliação do account (4 pilares: Estratégia & Planejamento 20%, Eficiência Operacional 30%, Rentabilidade & Comercial 30%, Relacionamento & Comunicação 20%), o pilar mais fraco, a média do time e a variação do mês. Use isso para DIRECIONAR: pelo menos 1 dos direcionamentos deve atacar o pilar mais fraco, ancorado num dado real do dossiê (cliente específico, job específico, número específico). Exemplos do raciocínio esperado — Relacionamento fraco → propor call/status com um cliente que está sem contato; Rentabilidade fraca → apontar cliente consumindo acima da meta e mandar transformar em extra, ou sugerir upsell concreto; Eficiência fraca → mandar zerar atrasados e cobrar apontamento; Estratégia fraca → pedir plano do mês para a carteira. Se o account melhorou (variação positiva), reconheça em 1 linha antes de pedir o próximo passo. Nunca cite a nota como julgamento moral — trate como placar que dá pra virar.

ESTRUTURA:
- 1 linha de abertura com o clima do dia (direta, sem "bom dia" genérico se houver urgência).
- 3 a 6 direcionamentos em linhas começando com "→ " — cada um é uma ORDEM ou decisão clara, não uma dica.
- Se houver algo positivo, 1 linha nominal de reconhecimento.
- Feche com "PRIORIDADE Nº1: ..." em uma linha.
REGRAS: use só fatos do dossiê, nunca invente nomes ou números. Se o quadro estiver limpo, briefing curto de manutenção de ritmo (3 linhas). Máximo ~10 linhas. Sem markdown além de "→".`;
      const rr = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 600, system: sys, messages: [{ role: 'user', content: JSON.stringify(d) }] }),
      });
      if (!rr.ok) return res.status(200).json({ ok: false, error: 'Falha no briefing.' });
      const dd = await rr.json();
      const brief = (dd?.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      return res.status(200).json({ ok: true, brief });
    }

    // ── MODO CONSOLIDAÇÃO (auditoria de consistência do financeiro) ──
    if (req.body && req.body.mode === 'consolidate') {
      const d = req.body.data || {};
      const sys = `Você é o AUDITOR DE CONSOLIDAÇÃO do TGT Hub (agência TGT Studio). Receberá um dossiê JSON do financeiro: pessoas (ativas/inativas, contratos, custo/h, capacidade, organograma, horas do mês corrente e anterior, presença na fotografia de competência), clientes (fee/projeto, valores, times, organograma, divisões de budget, fee da fotografia vs atual), custos fixos e uma lista de CHECAGENS AUTOMÁTICAS já detectadas pelo sistema.
Sua tarefa: consolidar a auditoria apontando discrepâncias e riscos, priorizados por impacto financeiro.
REGRAS:
- Use os checks automáticos como base factual — NÃO invente números; cite os valores do dossiê.
- Mudanças de fee/contrato entre fotografia e cadastro atual NÃO são erro (competência funciona assim) — liste como "mudanças do mês" informativas, pedindo só confirmação de intencionalidade.
- Estruture EXATAMENTE assim (pule seções vazias):
🔴 CRÍTICO — corrigir agora: itens com impacto direto no resultado (1 linha cada: problema → impacto → onde corrigir no Hub).
🟡 ATENÇÃO — verificar: inconsistências menores ou pendências.
📋 MUDANÇAS DO MÊS: alterações intencionais detectadas (fees, contratos, entradas/saídas de pessoas).
✅ CONSOLIDADO: 1 linha resumindo o que está consistente (folha, fees, organograma, fotografia).
- Máximo ~14 linhas no total. Sem preâmbulo, sem conclusão. pt-BR.`;
      const rr = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 900, system: sys, messages: [{ role: 'user', content: JSON.stringify(d) }] }),
      });
      if (!rr.ok) return res.status(200).json({ ok: false, error: 'Falha na auditoria. Tente novamente.' });
      const dd = await rr.json();
      const report = (dd?.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      return res.status(200).json({ ok: true, report });
    }

    // ── MODO INSIGHTS DE TIME (alertas de apontamento p/ heads/accounts) ──
    if (req.body && req.body.mode === 'team_insights') {
      const d = req.body.data || {};
      const sys = `Você é o consultor de operação da TGT Studio (agência, Campinas-SP). Receberá um JSON com: apontamento de horas do mês por pessoa (horas vs esperado pro-rata, dias sem lançar), carteira de CLIENTES do account (horas consumidas vs meta mensal, entregas atrasadas por cliente) e atrasos totais no radar.
Gere de 3 a 6 insights CURTOS e ACIONÁVEIS em pt-BR para o account/head responsável. Diretrizes:
- PESSOAS: diferencie padrão coletivo (time inteiro abaixo = processo) de caso individual (conversa direta). Horas baixas podem ser FALTA DE APONTAMENTO, não ociosidade — recomende verificar antes de cobrar.
- CLIENTES: aponte sobreconsumo (horas muito acima da meta = conta dando prejuízo ou escopo estourado) e subatendimento (muito abaixo da meta = cliente esquecido, risco de churn). Cruze com entregas atrasadas do cliente.
- MELHORIAS: onde houver padrão, sugira 1 melhoria de processo concreta (ex.: ritual de apontamento diário, redistribuir demanda entre pessoas, renegociar escopo).
- 1 ação prática por insight. Formato: cada insight numa linha começando com "• ". Sem preâmbulo, sem conclusão.`;
      const rr = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 500, system: sys, messages: [{ role: 'user', content: JSON.stringify(d) }] }),
      });
      if (!rr.ok) return res.status(200).json({ ok: false, error: 'Falha na análise. Tente novamente.' });
      const dd = await rr.json();
      const insights = (dd?.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      return res.status(200).json({ ok: true, insights });
    }

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
0. O texto vem de TRANSCRIÇÃO DE VOZ (speech-to-text) e pode ter erros fonéticos em pt-BR. Faça matching FONÉTICO/aproximado com a lista de clientes: "Acelera"→Celera, "Selera"→Celera, "Now"/"Nou"→NOU, "Lesafre"/"Le Safre"→Lesaffre, "Gamer Rute"/"Gamer Rut"→Gamer Hut, "Batistela"→Baptistella, "Nôno"/"Emporio Nono"→Empório Nono, "Lev"→Llev, "Uvi Line"/"UV Láine"→UV Line, "Pronutrição"→PRO Pronutrition, "Pão do Cambui"→Pão do Cambuí, "De Márqui"→De Marchi. Se só UM cliente é foneticamente próximo, use-o direto com ambiguous=false. Só marque ambiguous quando houver mais de um match plausível.
0b. CONTEXTO: use o histórico da conversa. Se o usuário corrigir ou completar um pedido anterior ("na verdade foram 4 horas", "isso foi anteontem", "pode ser de manhã", "o cliente é o Celera"), COMBINE com o pedido pendente e retorne o log_time completo atualizado.
1. Resolva datas relativas ("ontem", "anteontem", "sexta passada", "hoje de manhã") usando a data de hoje. Sem menção de data = hoje. Abreviações brasileiras de dias: "2af"=segunda, "3af"=terça, "4af"=quarta, "5af"=quinta, "6af"=sexta ("última 6af" = a sexta-feira anterior mais recente).
1b. Se o usuário citar tipo de trabalho + peça/projeto (ex.: "design para Guia de filmagem"), combine na description: "Design — Guia de filmagem". Não perca contexto do que foi dito.
1c. Se houver conflito de horário com horas já lançadas, NÃO trate como erro: retorne o log_time normalmente (com start_time se dito, ou null) — o app consulta a agenda real do dia e oferece os espaços livres.
2. "meia hora"=0.5, "1h30"=1.5, "das 14 às 16"=2 horas com start_time "14:00".
2b. start_time: horário explícito → use-o. "de manhã"/"pela manhã" → "09:00". "meio-dia"/"na hora do almoço" → "12:00". "à tarde"/"de tarde" → "14:00". "fim do dia"/"final da tarde" → "16:00". Se o usuário NÃO indicar período nem horário → start_time = null (o app perguntará).
3. Match de cliente: escolha o MAIS próximo do que foi dito. Atenção ao grupo Kerry — existem várias frentes (Institucional COMM, MKT Ativação, Brands, RH, Packaging, H&T). "Kerry Institucional" ou só "Kerry" → marque ambiguous=true e liste em alternatives as frentes Kerry plausíveis (2 a 4), com client_id = a mais provável (Institucional COMM se disser "institucional"). Para outros clientes, só marque ambiguous se realmente houver mais de um match razoável.
4. description: extraia a atividade descrita (ex.: "Ajuste de website blog"). Sem descrição = "".
5. Se não houver horas nem cliente reconhecível, action="unknown" e reply explicando o que faltou, com um exemplo de comando.
6. reply para log_time: frase natural confirmando o que será lançado (ex.: "Lançar 3h em Kerry Institucional COMM ontem (28/07) — Ajuste de website blog").
7. Nunca invente client_id fora da lista. Nunca produza nada além do JSON.`;

    const msgs = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-8)) {
        if (h && (h.role === 'user' || h.role === 'assistant') && h.content) {
          const c = String(h.content).slice(0, 400);
          if (msgs.length && msgs[msgs.length - 1].role === h.role) {
            msgs[msgs.length - 1].content += '\n' + c;  // mescla consecutivos (API exige alternância)
          } else {
            msgs.push({ role: h.role, content: c });
          }
        }
      }
    }
    // A API exige alternância começando por 'user': se o 1º for assistant, descarta
    while (msgs.length && msgs[0].role === 'assistant') msgs.shift();
    if (msgs.length && msgs[msgs.length - 1].role === 'user') { msgs[msgs.length - 1].content += '\n' + text; }
    else msgs.push({ role: 'user', content: text });

    const r = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 600,
        system,
        messages: msgs,
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
