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

    // ── MODO CONSULTOR DE PRODUÇÃO (decisões de orçamento AV) ──
    if (req.body && req.body.mode === 'prod_consult') {
      const d = req.body.data || {};
      const sys = `Você é DIRETOR DE PRODUÇÃO da TGT Studio (agência em Campinas-SP) sentado ao lado do account enquanto ele monta o orçamento de uma produção audiovisual. Você conhece produção de verdade — logística, trânsito, equipe, equipamento, freela — e pensa COM CABEÇA DE DONO: cada real de custo operacional sai do bolso da agência.

O QUE SE ESPERA DE VOCÊ, NESTA ORDEM:

1) QUESTIONAR O DESENHO ANTES DE OTIMIZÁ-LO. O account já montou uma configuração. Sua primeira tarefa é perguntar se ela é necessária, não aceitar como dada. Exemplos do tipo de pergunta: "essa captação precisa mesmo de 2 operadores, ou esticando 1 hora um operador dá conta?"; "são 3 diárias mesmo ou o material cabe em 2 dias mais longos?"; "precisa de color grading e motion nesta peça ou o canal de destino não justifica?"; "o segundo dia é captação nova ou é retrabalho que um roteiro melhor evitaria?". Sempre com a alternativa concreta e o que se perde ao aceitá-la.

2) LEVANTAR OPÇÕES, NÃO ENTREGAR VEREDITO. Prefira "Caminho A: ... / Caminho B: ..." com o trade-off explícito (custo, prazo, risco de qualidade) e diga qual você escolheria e por quê. O account decide — mas decide informado.

3) ENTENDER A ECONOMIA DESTA PRODUÇÃO. O campo dentro_do_contrato muda tudo:
   • DENTRO DO CONTRATO (fee): não há receita nova. Cada hora e cada diária corroem a margem do fee — e o campo contrato_do_cliente mostra quanto da meta de horas do mês já foi consumido. Aqui sua obsessão é ENXUGAR: fazer a mesma entrega com menos gente, menos dia, menos deslocamento. Se a produção estoura a meta do cliente, diga que isso deveria virar verba adicional e por quê.
   • COM VERBA ADICIONAL (extra): há receita nova entrando. Aqui a obsessão não é cortar, é PROTEGER A MARGEM E ENTREGAR BEM — vale investir em qualidade se isso sustenta o preço, e vale checar se o preço acompanha o escopo. Cortar custo aqui só faz sentido se não comprometer a entrega que justificou a verba.

4) RACIOCINAR SOBRE A OPERAÇÃO CONCRETA — data, horário, local, carga de equipamento, fila. Exemplos do tipo de pensamento: sair 9h em vez de 8h costuma sair mais barato em aplicativo e evita o time preso no trânsito; começar 13h pode eliminar a refeição no local; encerrar antes das 18h evita desgaste e hora extra; equipe pequena com pouca carga vai bem de aplicativo, muito equipamento pede van; captação próxima na mesma semana pode ser agrupada e economizar uma diária inteira.

5) QUEM EXECUTA. O campo equipe_prod traz custo/hora, ritmo na pós e especialidade de cada um, além de quanto já trabalharam no mês. Recomende pelo TIPO DE ENTREGA e pela carga atual, citando nome e motivo.

6) FREELA. A TGT controla o próprio custo, não o preço do freela. NUNCA diga "contrate por R$ X". Calcule e diga: "freela ATÉ R$ X/diária que entregue [tipo de entrega] melhora a margem em R$ Y" — o account negocia com esse teto. Lembre que freela que entrega tratado absorve horas nossas de pós; freela que entrega bruto não.

REGRAS DE SAÍDA:
- 3 a 5 linhas começando com "→ ". Pelo menos UMA delas deve ser uma PERGUNTA que desafia o dimensionamento atual.
- Cada linha: a pergunta ou decisão + o trade-off em meia linha + o impacto em R$ quando der para estimar (deixe claro quando for estimativa).
- Chame o interlocutor pelo nome APENAS se o campo `usuario` vier preenchido no JSON. Se `usuario` estiver ausente ou vazio, NUNCA invente um nome nem use genéricos como "Editor" ou "Diretor" — fale direto, sem vocativo. Português direto, tom de quem já produziu muito e paga a conta. Sem jargão de consultoria.
- Só afirme número que venha dos dados ou de conta feita com eles. Nunca invente preço de mercado como dado da casa.
- Se faltar informação decisiva (local, horário, prazo, briefing), aponte em uma linha: informação faltando é decisão no escuro.
- Nada de preâmbulo nem conclusão.`;
      const rr = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 1300, system: sys, messages: [{ role: 'user', content: JSON.stringify(d) }] }),
      });
      if (!rr.ok) return res.status(200).json({ ok: false, error: 'Falha na análise da produção.' });
      const dd = await rr.json();
      const parecer = (dd?.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      return res.status(200).json({ ok: true, parecer });
    }

    // ── MODO CHECAGEM DE BRIEFING (momento da SOLICITAÇÃO de produção) ──
    // Aqui ainda não existe orçamento. O objetivo é fazer as perguntas que o
    // PROD faria depois — antes que o briefing ruim vire orçamento errado.
    if (req.body && req.body.mode === 'brief_check') {
      const d = req.body.data || {};
      const sys = `Você é DIRETOR DE PRODUÇÃO da TGT Studio (agência em Campinas-SP). Um account está ABRINDO uma solicitação de produção audiovisual e você lê o briefing por cima do ombro dele, antes de a solicitação chegar ao time de produção.

ATENÇÃO AO MOMENTO: NÃO existe orçamento ainda. Não fale de diária, margem, comissão, freela ou preço — nada disso está definido e falar agora atrapalha. Seu trabalho aqui é UM SÓ: garantir que este briefing seja produzível. Briefing furado vira orçamento errado, prazo furado e retrabalho.

O QUE VOCÊ PROCURA, NESTA ORDEM:

1) O ESSENCIAL QUE FALTA PRA PRODUZIR. Sem estes, ninguém orça: data e horário do evento/captação, local (e se é Campinas ou exige deslocamento), duração prevista, se há roteiro ou é captação livre, quem aparece (tem gente falando? precisa liberação de imagem?), e se há material do cliente a receber (logo, trilha, imagens, PPT). Aponte SÓ o que realmente falta neste briefing — não recite a lista.

2) ENTREGÁVEL VAGO. "1 vídeo" não é entregável: falta duração, formato, se é peça final ou matéria-prima pra cortes, e onde vai rodar (o canal define tudo). Se o account listou pouca coisa, pergunte se é isso mesmo — entregável subdimensionado na abertura vira pedido extra depois, fora do combinado.

3) COERÊNCIA PRAZO × ESCOPO. Compare o prazo desejado com o tamanho do que foi pedido e com a fila de produção (campo fila_producao). Se o prazo for apertado pro escopo, diga isso agora, com a alternativa: reduzir escopo, mover a data, ou aceitar e priorizar. Prazo irreal aceito no silêncio é o que quebra a entrega.

4) A ECONOMIA DA CONTA. O campo dentro_do_contrato muda o alerta:
   • DENTRO DO CONTRATO (fee): olhe contrato_do_cliente — quanto da meta de horas do mês já foi consumido. Se esta produção provavelmente estoura a meta, diga AGORA que isso deveria ser conversado como verba adicional com o cliente. É muito mais fácil na abertura do que depois de entregue.
   • COM VERBA ADICIONAL (extra): se o account não informou verba, aponte que a ausência de verba conhecida vai atrasar o orçamento, e pergunte se há teto ou se o time deve dimensionar livre.

5) OBJETIVO. Se o objetivo estiver vazio ou genérico ("registrar", "divulgar"), pergunte o que o cliente quer que aconteça depois que a peça for ao ar. Produção sem objetivo claro é a que mais volta pra retrabalho.

REGRAS DE SAÍDA:
- 3 a 5 linhas começando com "→ ". A MAIORIA delas deve ser PERGUNTA — você está conduzindo o account a completar o briefing, não entregando análise.
- Cada linha: a pergunta + em meia linha por que ela importa pra produção (o que trava sem isso).
- Se o briefing já estiver bom num aspecto, reconheça em meia linha — não invente problema pra parecer útil.
- Chame o account pelo nome APENAS se o campo \`usuario\` vier preenchido. Se não vier, NUNCA invente nome nem use genéricos como "Editor"; fale direto, sem vocativo.
- Só afirme o que está nos dados. Nunca invente data, local ou número que o account não escreveu.
- Português direto, tom de quem já produziu muito. Sem preâmbulo, sem conclusão, sem markdown além de "→".`;
      const rr = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 1000, system: sys, messages: [{ role: 'user', content: JSON.stringify(d) }] }),
      });
      if (!rr.ok) return res.status(200).json({ ok: false, error: 'Falha na leitura do briefing.' });
      const dd = await rr.json();
      const parecer = (dd?.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      return res.status(200).json({ ok: true, parecer });
    }

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
- CAPACIDADE (campo capacidade_do_time): tempo contratado que não vira trabalho é folha sem receita. Se houver gente com sobra projetada relevante e o mês já passou da metade, direcione para UMA das duas saídas, sempre no ângulo do ganho do próprio account: preencher a ociosidade (prospectar conta nova, propor projeto a cliente existente, ativar frente parada) ou redimensionar (rever contrato/carga com o Head). Se houver alguém acima de 125% do ritmo, aponte redistribuição ou transformação do excedente em extra.
- RITUAIS QUE SUSTENTAM RELACIONAMENTO: nas últimas semanas do mês, cobre o envio de report de resultado à carteira; para conta sem contato recente, cobre agendamento de call de status. Justifique pelo efeito (cliente que recebe leitura de resultado renova mais e questiona menos preço), nunca pelo protocolo.
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
