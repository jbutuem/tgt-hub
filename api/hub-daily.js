/* ============================================================
   /api/hub-daily.js — VIGILÂNCIA ATIVA DO HUB
   Roda sozinho todo dia útil às 7h (BRT) via Vercel Cron.

   O que faz, nesta ordem:
   1) Lê o estado real (pessoas, clientes, apontamentos, radar, produções)
   2) Calcula os sinais determinísticos (Health Score por cliente,
      ritmo de apontamento, entregas travadas, produções paradas)
   3) Grava a foto do Health Score do mês (série histórica p/ churn)
   4) Gera o Briefing do Dia por account com a IA e grava em cache
      → quando a pessoa abre o HUB, o briefing JÁ está pronto
   5) Registra alertas críticos em tt_hub_watch (log de vigilância)
   6) Opcional: notifica no Monday quem tem item crítico

   Chamada manual: GET /api/hub-daily?key=<CRON_SECRET>
   ============================================================ */

export const config = { maxDuration: 300 };   // a varredura completa leva ~2min

const SB   = process.env.SUPABASE_URL;
const SKEY = process.env.SUPABASE_SERVICE_KEY;
const AKEY = process.env.ANTHROPIC_API_KEY;
const MKEY = process.env.MONDAY_API_TOKEN;
const SECRET = process.env.CRON_SECRET || '';

const HDR = { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json' };
const TZ = 'America/Sao_Paulo';

const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
const monthOf = d => String(d || '').slice(0, 7);

async function sb(path) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { headers: HDR });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.json();
}
async function sbUpsert(table, rows, conflict) {
  if (!rows.length) return;
  const r = await fetch(`${SB}/rest/v1/${table}${conflict ? `?on_conflict=${conflict}` : ''}`, {
    method: 'POST',
    headers: { ...HDR, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!r.ok) console.error(`upsert ${table}:`, r.status, (await r.text()).slice(0, 200));
}

function bizDays(a, b) {
  let n = 0; const d = new Date(a); d.setHours(0, 0, 0, 0); const e = new Date(b); e.setHours(0, 0, 0, 0);
  while (d <= e) { const w = d.getDay(); if (w > 0 && w < 6) n++; d.setDate(d.getDate() + 1); }
  return n;
}
function bizHoursSince(iso) {
  if (!iso) return 9999;
  const t = new Date(iso).getTime(), now = Date.now();
  if (!(t < now)) return 0;
  let h = 0;
  for (let x = t; x < now; x += 3600000) { const d = new Date(x).getDay(); if (d > 0 && d < 6) { h++; if (h > 240) return h; } }
  return h;
}

// Vocabulário canônico (espelha o do front — estágios em que a bola está com o CLIENTE)
const CLIENT_SIDE = /aprova(?!.*(intern|lider|tgt))|ready for review|for approval|aguardando info|pending details|need more info/;
const isClientSide = lbl => {
  const s = norm(lbl); if (!s) return false;
  if (/intern|lider|leader|tgt review/.test(s)) return false;
  return CLIENT_SIDE.test(s);
};

export default async function handler(req, res) {
  const auth = req.query?.key || req.headers?.authorization?.replace('Bearer ', '');
  const isCron = !!req.headers?.['x-vercel-cron'];
  if (!isCron && SECRET && auth !== SECRET) return res.status(401).json({ ok: false, error: 'unauthorized' });

  // MODO: manhã (varredura geral) ou tarde (fechar o dia + revisar o que foi aberto)
  const horaBRT = Number(new Date().toLocaleString('en-US', { timeZone: TZ, hour: '2-digit', hour12: false }));
  const modo = (req.query?.mode) || (horaBRT >= 12 ? 'tarde' : 'manha');
  const log = { started: new Date().toISOString(), modo, steps: [] };
  try {
    const hoje = today(), mo = hoje.slice(0, 7);
    const d = new Date();
    const ms = new Date(d.getFullYear(), d.getMonth(), 1), me = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const frac = Math.min(1, bizDays(ms, d) / Math.max(1, bizDays(ms, me)));
    const diasUteis = bizDays(ms, d);

    // ── 1) ESTADO ──
    const [members, clients, mteams, cteams, items, entries, avs, scores, healthHist, aliases, extras, acksHoje, frentes, teamsCfg] = await Promise.all([
      sb('tt_members?select=id,name,email,team,access_level,is_active,capacity_hours,monthly_cost&access_level=neq.client'),
      sb('tt_clients?select=id,name,team,is_active,is_internal,target_hours_month,started_at,primary_account_id&is_active=eq.true'),
      sb('tt_member_teams?select=member_id,team,capacity_hours,is_leader'),
      sb('tt_client_teams?select=client_id,team,is_primary'),
      sb('tt_monday_hot_items?select=monday_item_id,client_id,item_name,item_url,status_label,priority_label,deadline_date,hours_invested,is_done,group_category,last_activity_at,responsible_names,first_seen_at'),
      sb(`tt_time_entries?select=member_id,client_id,hours,started_at,created_at,is_running&started_at=gte.${mo}-01`),
      sb('av_requests?select=id,title,client_id,stage,requested_by,archived_at,commissions_released,delivered_at,deadline_agreed,desired_deadline'),
      sb('score_adm?select=account_id,month,p1_score,p2_score,p3_score,p4_score,final_score&order=month.desc'),
      sb('tt_client_health?select=client_id,month,score&order=month.desc'),
      sb('tt_monday_aliases?select=alias,member_id'),
      sb(`tt_extras?select=account_id,client_id,valor_bruto,valor_account,status,created_at&created_at=gte.${mo}-01`),
      sb(`tt_focus_ack?select=member_id,day,item_id,kind,ref,title&day=eq.${today()}`),
      sb('tt_frente_owners?select=member_id,scope_type,scope_ref'),
      sb('tt_teams?select=key,is_service'),
    ]);
    log.steps.push(`estado: ${members.length} pessoas, ${clients.length} clientes, ${items.length} itens, ${entries.length} lançamentos`);

    const servico = new Set((teamsCfg || []).filter(t => t.is_service).map(t => t.key).concat(['PROD']));
    const activos = members.filter(m => m.is_active !== false);
    const cliById = Object.fromEntries(clients.map(c => [c.id, c]));
    const teamsOfClient = cid => cteams.filter(x => x.client_id === cid).map(x => x.team);
    const teamsOfMember = mid => mteams.filter(x => x.member_id === mid).map(x => x.team);
    const aliasMap = Object.fromEntries(aliases.map(a => [norm(a.alias), a.member_id]));
    const nameToMember = raw => {
      const n = norm(raw); if (!n) return null;
      if (aliasMap[n]) return aliasMap[n];
      const exact = activos.find(m => norm(m.name) === n); if (exact) return exact.id;
      const p = n.split(' ');
      if (p.length >= 2) {
        const ms2 = activos.filter(m => { const mn = norm(m.name).split(' '); return mn[0] === p[0] && mn.includes(p[p.length - 1]); });
        if (ms2.length === 1) return ms2[0].id;
      }
      return null;
    };

    // ── 2) HEALTH SCORE POR CLIENTE ──
    const hoursOfClient = cid => entries.filter(e => !e.is_running && e.client_id === cid && monthOf(e.started_at || e.created_at) === mo).reduce((s, e) => s + Number(e.hours || 0), 0);
    const lastTouch = cid => { const ds = entries.filter(e => e.client_id === cid && e.started_at).map(e => e.started_at).sort(); return ds.length ? Math.floor((Date.now() - new Date(ds[ds.length - 1])) / 86400000) : 99; };
    const healthRows = [], healthByClient = {};
    for (const c of clients) {
      if (c.is_internal === true) continue;
      const its = items.filter(h => h.client_id === c.id && !h.is_done && (h.group_category || 'unclassified') === 'active');
      const comPrazo = its.filter(h => h.deadline_date);
      const atrasados = comPrazo.filter(h => h.deadline_date < hoje).length;
      const s_prazo = comPrazo.length ? Math.max(0, 100 - (atrasados / comPrazo.length) * 130) : 100;
      const noCli = its.filter(h => isClientSide(h.status_label));
      const travados = noCli.filter(h => bizHoursSince(h.last_activity_at) > 24).length;
      const s_fluxo = noCli.length ? Math.max(0, 100 - (travados / noCli.length) * 100) : 100;
      const meta = Number(c.target_hours_month) || 0, horas = hoursOfClient(c.id);
      let s_meta = 100;
      if (meta > 0) { const r = horas / meta; s_meta = r > 1.3 ? Math.max(0, 100 - (r - 1.3) * 120) : r < 0.5 ? Math.max(0, (r / 0.5) * 100) : 100; }
      const dias = lastTouch(c.id);
      const s_at = dias <= 3 ? 100 : dias <= 7 ? 80 : dias <= 14 ? 50 : dias <= 21 ? 25 : 0;
      const score = Math.round(s_prazo * .40 + s_fluxo * .25 + s_meta * .20 + s_at * .15);
      const prev = healthHist.filter(h => h.client_id === c.id && h.month < mo).sort((a, b) => String(b.month).localeCompare(String(a.month)));
      let quedas = 0; const serie = [...prev].reverse().concat([{ score }]);
      for (let i = serie.length - 1; i > 0; i--) { if (Number(serie[i].score) < Number(serie[i - 1].score)) quedas++; else break; }
      healthByClient[c.id] = { name: c.name, score, atrasados, travados, dias, horas, meta, quedas, novo: c.started_at ? Math.floor((Date.now() - new Date(c.started_at + 'T12:00:00')) / 86400000) : null };
      healthRows.push({ client_id: c.id, month: mo, score, s_prazo: Math.round(s_prazo), s_fluxo: Math.round(s_fluxo), s_meta: Math.round(s_meta), s_atencao: s_at, horas: Number(horas.toFixed(1)), meta_horas: meta, atrasados, parados_cliente: travados });
    }
    if (modo !== 'tarde') await sbUpsert('tt_client_health', healthRows, 'client_id,month');
    log.steps.push(`health: ${healthRows.length} clientes fotografados`);

    // ── 3) SINAIS CRÍTICOS (log de vigilância) ──
    // SLA por tipo de sinal — o prazo entra no registro e vira cobrança
    const SLA = {
      sem_responsavel:    { dias: 0, label: 'designar HOJE, antes das 12h' },
      parado_cliente:     { dias: 1, label: 'cobrar retorno em até 24h' },
      churn_risk:         { dias: 2, label: 'call de escopo agendada em até 48h' },
      silencio:           { dias: 1, label: 'retomar contato em até 24h' },
      comissao_travada:   { dias: 1, label: 'liberar em até 24h' },
      aprovacao_pendente: { dias: 1, label: 'devolutiva em até 24h úteis' },
      escopo:             { dias: 5, label: 'decidir extra ou renegociação em até 5 dias úteis' },
      conta_nova:         { dias: 5, label: 'entregável visível ainda esta semana' },
    };
    const addBiz = (n) => { const d2 = new Date(); let k = 0; while (k < n) { d2.setDate(d2.getDate() + 1); const w = d2.getDay(); if (w > 0 && w < 6) k++; } return d2.toLocaleDateString('en-CA', { timeZone: TZ }); };
    const watch = [];
    const W = (kind, sev, ref, msg, meta) => {
      const s = SLA[kind] || { dias: 2, label: 'resolver em até 2 dias úteis' };
      watch.push({ day: hoje, kind, severity: sev, ref, message: msg, meta: meta || null,
        due_date: s.dias === 0 ? hoje : addBiz(s.dias), sla_label: s.label });
    };
    for (const [cid, h] of Object.entries(healthByClient)) {
      if (h.quedas >= 2) W('churn_risk', 'critical', cid, `${h.name}: ${h.quedas} meses seguidos de queda na saúde da conta`, { score: h.score });
      if (h.travados > 0) W('parado_cliente', h.travados >= 3 ? 'critical' : 'warning', cid, `${h.name}: ${h.travados} entrega(s) parada(s) no cliente há mais de 24h úteis`, null);
      if (h.dias >= 14 && h.dias < 99) W('silencio', 'warning', cid, `${h.name}: ${h.dias} dias sem nenhum registro de trabalho`, null);
      if (h.meta > 0 && h.horas > h.meta * 1.15) W('escopo', 'warning', cid, `${h.name}: ${Math.round(h.horas / h.meta * 100)}% da meta de horas — avaliar extra`, null);
      if (h.novo != null && h.novo <= 90) W('conta_nova', 'info', cid, `${h.name}: dia ${h.novo} de relacionamento (janela crítica dos 90 dias)`, null);
    }
    const semDono = items.filter(h => !h.is_done && (h.group_category || 'unclassified') === 'active' && h.deadline_date && h.deadline_date >= hoje && !String(h.responsible_names || '').trim());
    for (const h of semDono.slice(0, 10)) W('sem_responsavel', 'critical', h.client_id, `"${h.item_name}" vence ${h.deadline_date} e não tem operador designado`, { url: h.item_url });
    for (const r of avs.filter(r => r.stage === 'recebido' && !r.commissions_released && !r.archived_at)) W('comissao_travada', 'warning', r.client_id, `Produção "${r.title}" recebida com comissão ainda não liberada`, null);
    for (const r of avs.filter(r => r.stage === 'aguardando_aprovacao' && !r.archived_at)) W('aprovacao_pendente', 'warning', r.client_id, `Orçamento "${r.title}" aguardando devolutiva do account`, null);
    await sbUpsert('tt_hub_watch', watch, 'day,kind,ref');
    log.steps.push(`vigilância: ${watch.length} sinais registrados`);

    // ── 3b) DEMANDAS ABERTAS HOJE (qualidade do briefing) — rodada da tarde ──
    const novasHoje = items.filter(h => String(h.first_seen_at || '').slice(0, 10) === hoje && !h.is_done);
    const novasComFalha = novasHoje.map(h => {
      const falta = [];
      if (!h.deadline_date) falta.push('prazo de entrega');
      if (!String(h.responsible_names || '').trim()) falta.push('responsável');
      if (!h.priority_label) falta.push('prioridade');
      if (String(h.item_name || '').trim().length < 12) falta.push('título descritivo');
      return falta.length ? { item: h.item_name, cliente: (cliById[h.client_id] || {}).name || '—', client_id: h.client_id, falta, url: h.item_url } : null;
    }).filter(Boolean);
    log.steps.push(`demandas abertas hoje: ${novasHoje.length} (${novasComFalha.length} incompletas)`);

    // ── 4) BRIEFING POR ACCOUNT (IA) ──
    const accounts = activos.filter(m => ['admin', 'account', 'account_aux'].includes(m.access_level));
    let briefs = 0;
    for (const acc of accounts) {
      const myTeams = new Set(teamsOfMember(acc.id).concat(acc.team ? [acc.team] : []));
      const isAdmin = acc.access_level === 'admin';
      const minhas = frentes.filter(f => f.member_id === acc.id);
      const fCli = new Set(minhas.filter(f => f.scope_type === 'client').map(f => String(f.scope_ref)));
      // times LIDERADOS vêm do organograma (derivado, sempre atual)
      const fTime = new Set(mteams.filter(x => x.member_id === acc.id && x.is_leader === true && !servico.has(x.team)).map(x => x.team));
      const fBoard = new Set(minhas.filter(f => f.scope_type === 'board').map(f => String(f.scope_ref)));
      const meusClientes = (minhas.length || fTime.size)
        ? clients.filter(c => fCli.has(String(c.id)) || (fTime.size && (teamsOfClient(c.id).some(t => fTime.has(t)) || fTime.has(c.team))))
        : clients.filter(c => c.is_internal !== true && teamsOfClient(c.id).some(t => myTeams.has(t) && t !== 'PROD'));
      if (!meusClientes.length) continue;

      const saude = meusClientes.map(c => healthByClient[c.id]).filter(Boolean).sort((a, b) => a.score - b.score).slice(0, 8)
        .map(h => ({ cliente: h.name, saude: h.score, quedas_consecutivas: h.quedas, atrasados: h.atrasados, paradas_no_cliente: h.travados, dias_sem_contato: h.dias, horas: h.horas, meta: h.meta, conta_nova_dias: h.novo }));

      const pessoas = activos.filter(m => m.id !== acc.id && (isAdmin || teamsOfMember(m.id).some(t => myTeams.has(t))))
        .map(m => {
          const cap = Number(m.capacity_hours) || 0; if (!cap) return null;
          const hrs = entries.filter(e => !e.is_running && e.member_id === m.id && monthOf(e.started_at || e.created_at) === mo).reduce((s, e) => s + Number(e.hours || 0), 0);
          const exp = cap * frac; if (exp < 4) return null;
          return { nome: m.name, time: m.team, horas: Number(hrs.toFixed(1)), esperado: Number(exp.toFixed(1)), pct: Math.round(hrs / exp * 100) };
        }).filter(Boolean);

      // Capacidade do time liderado: sobra projetada = folha sem receita
      const meuTime = activos.filter(m => m.id !== acc.id && Number(m.capacity_hours) > 0
        && (mteams.some(x => x.member_id === m.id && fTime.has(x.team)) || m.reports_to_account_id === acc.id));
      const capRows = meuTime.map(m => {
        const cap = Number(m.capacity_hours) || 0;
        const hrs = entries.filter(e => !e.is_running && e.member_id === m.id && monthOf(e.started_at || e.created_at) === mo).reduce((s, e) => s + Number(e.hours || 0), 0);
        const proj = frac > 0 ? hrs / frac : 0;
        return { nome: m.name, capacidade: cap, horas_ate_agora: Number(hrs.toFixed(1)),
          ritmo_pct: cap * frac > 0 ? Math.round(hrs / (cap * frac) * 100) : null,
          sobra_projetada: Number(Math.max(0, cap - proj).toFixed(1)), custo_hora: Number(m.hourly_cost) || 0 };
      });
      const sobraTot = capRows.reduce((s, r) => s + r.sobra_projetada, 0);
      const capacidade = capRows.length ? {
        pct_mes_decorrido: Math.round(frac * 100),
        horas_sobrando_projetadas: Number(sobraTot.toFixed(1)),
        valor_folha_sem_receita: Math.round(capRows.reduce((s, r) => s + r.sobra_projetada * r.custo_hora, 0)),
        pessoas: capRows.sort((a, b) => b.sobra_projetada - a.sobra_projetada).slice(0, 8),
      } : null;

      const sc = scores.find(s => s.account_id === acc.id && s.final_score != null);
      const perfil = sc ? { mes: sc.month, nota_final: Number(sc.final_score), notas: { estrategia_planejamento: sc.p1_score, eficiencia_operacional: sc.p2_score, rentabilidade_comercial: sc.p3_score, relacionamento_comunicacao: sc.p4_score } } : null;

      const meusWatch = watch.filter(w => meusClientes.some(c => c.id === w.ref))
        .map(w => ({ sinal: w.message, gravidade: w.severity, prazo: w.sla_label, vence_em: w.due_date }));
      const vencidos = watch.filter(w => meusClientes.some(c => c.id === w.ref) && w.due_date < hoje).length;

      const tratados = acksHoje.filter(a => a.member_id === acc.id);
      const emAberto = meusWatch.filter(w => !tratados.some(t => String(t.ref || '') === String(watch.find(x => x.message === w.sinal)?.ref || '')));
      const minhasNovas = novasComFalha.filter(n => meusClientes.some(c => c.id === n.client_id));

      const dossie = modo === 'tarde'
        ? { account: acc.name, data: hoje, momento: 'fim de tarde',
            tratados_hoje: tratados.length, tratados_titulos: tratados.map(t => t.title).filter(Boolean).slice(0, 8),
            ainda_em_aberto: emAberto.slice(0, 10), vencem_hoje: meusWatch.filter(w => w.vence_em === hoje).length,
            demandas_abertas_hoje_incompletas: minhasNovas.slice(0, 6),
            saude_dos_clientes: saude.slice(0, 5) }
        : { account: acc.name, data: hoje, momento: 'início do dia', dia_util_do_mes: diasUteis, pct_mes_decorrido: Math.round(frac * 100),
            sinais_com_prazo: meusWatch.slice(0, 12), sinais_vencidos: vencidos,
            saude_dos_clientes: saude, pessoas, capacidade_do_time: capacidade, score_do_account: perfil,
            demandas_abertas_hoje_incompletas: minhasNovas.slice(0, 4),
            aviso_score_automatico: 'A partir do próximo mês a avaliação considera estes indicadores de Monday + HUB.' };

      try {
        const sysTarde = `Você é o HEAD DE ACCOUNTS da TGT Studio fazendo o CHECK DE FIM DE TARDE com ${acc.name}. São ~14h. O objetivo é UM só: não deixar nada do que foi apontado de manhã virar problema de amanhã.
TOM: curto, cirúrgico, cobrando fechamento. Sem repetir contexto, sem preâmbulo. A pessoa já leu o briefing da manhã.
ESTRUTURA (máximo 8 linhas):
- 1 linha de placar: quantos tratou hoje e quantos ainda estão em aberto. Se tratou tudo, reconheça e seja breve.
- Para cada item ainda em aberto (máx 4), uma linha começando com "→ " dizendo o que fazer e ATÉ QUE HORAS de hoje. Priorize o que vence hoje.
- Se houver demandas abertas hoje com informação faltando (campo demandas_abertas_hoje_incompletas), inclua até 2 linhas começando com "📋 " no formato: nome da demanda · cliente · o que falta preencher · por que isso melhora a assertividade da execução. Exemplo do tom: "📋 'Post lançamento linha X' (Kerry) foi aberto sem prazo nem responsável — sem isso o job não entra no radar de ninguém e chega em cima da hora. Complete antes de sair."
- Feche com "ANTES DE SAIR HOJE: ..." apontando o único item mais importante.
REGRAS: use nomes e números do dossiê, nunca invente. Firme sem grosseria. Se não houver nada em aberto e nada incompleto, responda em 2 linhas reconhecendo e sugerindo o que adiantar para amanhã.`;

        const sysManha = `Você é o HEAD DE ACCOUNTS / Scrum Master da TGT Studio (agência, Campinas-SP) fazendo o briefing matinal de ${acc.name}.
MISSÃO: proteger e crescer o negócio. A nota do account é CONSEQUÊNCIA — nunca diga "faça isso para subir sua nota".
PRIORIDADE: (1) proteger a receita existente, (2) proteger a margem, (3) crescer dentro da base.
CAPACIDADE (campo capacidade_do_time): tempo contratado que não vira trabalho é folha sem receita. Passada a metade do mês, se houver sobra projetada relevante, direcione para UMA das duas saídas, sempre pelo ganho do próprio account: preencher (prospectar conta nova, propor projeto a cliente existente) ou redimensionar (rever contrato/carga com o Head). Quem estiver acima de 125% do ritmo: redistribuir ou transformar excedente em extra.
RITUAIS: nas últimas semanas do mês, cobre o report de resultado para a carteira; para conta sem contato recente, cobre call de status. Justifique pelo efeito no cliente, nunca pelo protocolo.
CONTEXTO DE MERCADO (use como raciocínio, sem citar fontes): insatisfação com a ENTREGA é hoje a causa nº1 de perda de conta, comunicação fraca vem em seguida e preço só depois; ~43% das saídas se decidem nos primeiros 90 dias; queda consecutiva na saúde da conta antecede a saída; vender para a base é ~3x mais provável que conquistar cliente novo; margem de agência gira em torno de 13%, então escopo estourado que não vira extra é margem perdida.
TOM: gestor sênior que COBRA. Firme, direto, imperativo. Sem corporativês, sem "seria interessante", sem "talvez", sem "considere". Diga o que fazer, com quem e ATÉ QUANDO. Nada de grosseria ou ironia — firmeza é clareza e prazo, não agressividade.
PRAZO OBRIGATÓRIO: todo direcionamento termina com um prazo explícito, usando o campo prazo/sla de cada sinal quando existir (ex.: "até as 12h de hoje", "até amanhã 18h", "até sexta"). Direcionamento sem prazo não serve.
RESPONSABILIDADE: cada direcionamento tem um dono nomeado — o próprio account ou alguém do time dele.
CONSEQUÊNCIA: quando o item for crítico, diga em uma frase curta o que acontece se não for resolvido no prazo (conta em risco, margem perdida, entrega furada). Sem drama, com fato.
AVISO IMPORTANTE PARA O ACCOUNT: a partir do próximo mês a avaliação de desempenho passa a considerar estes indicadores de Monday + HUB. Mencione isso NO MÁXIMO uma vez, e só quando houver item crítico vencido — como informação, nunca como ameaça.
Use nomes reais e números do dossiê. Nunca invente dados.
IMPORTANTE: se quase todo o time está com apontamento baixo e o mês tem poucos dias úteis decorridos, trate como padrão de PROCESSO, não como falha individual.
ESTRUTURA: 1 linha de abertura com o placar do dia (quantos itens críticos e quantos vencem hoje); 3 a 5 direcionamentos começando com "→ ", cada um no formato: o quê · quem · ATÉ QUANDO · consequência se aplicável; se houver demanda aberta hoje com informação faltando, inclua 1 linha começando com "📋 " apontando o que completar e por quê; 1 linha de reconhecimento se houver algo bom; feche com "PRIORIDADE Nº1: ..." incluindo o horário limite. Máximo 11 linhas.`;
        const sys = modo === 'tarde' ? sysTarde : sysManha;
        let rr = null;
        for (let tent = 0; tent < 3; tent++) {
          rr = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': AKEY, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 600, system: sys, messages: [{ role: 'user', content: JSON.stringify(dossie) }] }),
          });
          if (rr.ok) break;
          if (rr.status !== 429 && rr.status < 500) break;      // erro definitivo: não insiste
          await new Promise(r => setTimeout(r, 1500 * (tent + 1)));   // 1,5s · 3s · 4,5s
        }
        if (rr && rr.ok) {
          const dd = await rr.json();
          const brief = (dd?.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
          if (brief) {
            const prev = modo === 'tarde' ? (await sb(`tt_ai_briefings?select=content&member_id=eq.${acc.id}&brief_date=eq.${hoje}`).catch(() => []))[0]?.content : null;
            const content = modo === 'tarde' && prev
              ? `${prev}\n\n──────────\n🕑 CHECK DE FIM DE TARDE\n${brief}`
              : brief;
            await sbUpsert('tt_ai_briefings', [{ member_id: acc.id, brief_date: hoje, content }], 'member_id,brief_date'); briefs++;
          }
        } else { console.error('anthropic', acc.name, rr && rr.status); log.steps.push(`⚠️ sem briefing: ${acc.name} (${rr && rr.status})`); }
      } catch (e) { console.error('brief', acc.name, e.message); }
      await new Promise(r => setTimeout(r, 400));
    }
    log.steps.push(`briefings: ${briefs} gerados`);

    // ── 4b) SCORE AUTOMÁTICO (Monday + HUB) — sombra do score manual ──
    const clamp = (v) => Math.max(0, Math.min(10, v));
    const pct = (a, b) => (b > 0 ? a / b : null);
    const scoreRows = [];
    for (const acc of accounts) {
      const myTeams = new Set(teamsOfMember(acc.id).concat(acc.team ? [acc.team] : []));
      const isAdmin = acc.access_level === 'admin';
      const mf = frentes.filter(f => f.member_id === acc.id);
      const fBoardScore = new Set(mf.filter(f => f.scope_type === 'board').map(f => String(f.scope_ref)));
      const sCli = new Set(mf.filter(f => f.scope_type === 'client').map(f => String(f.scope_ref)));
      const sTime = new Set(mteams.filter(x => x.member_id === acc.id && x.is_leader === true && !servico.has(x.team)).map(x => x.team));
      const meus = ((mf.length || sTime.size)
        ? clients.filter(c => sCli.has(String(c.id)) || (sTime.size && (teamsOfClient(c.id).some(t => sTime.has(t)) || sTime.has(c.team))))
        : clients.filter(c => teamsOfClient(c.id).some(t => myTeams.has(t) && t !== 'PROD'))
      ).filter(c => c.is_internal !== true);
      if (!meus.length) continue;
      const ids = new Set(meus.map(c => c.id));
      const its = items.filter(h => (ids.has(h.client_id) || (fBoardScore && fBoardScore.has(String(h.monday_board_id)))) && !h.is_done && (h.group_category || 'unclassified') === 'active');
      const hs = meus.map(c => healthByClient[c.id]).filter(Boolean);

      // P1 · Estratégia & Planejamento — organização e antecipação
      const comMeta = meus.filter(c => Number(c.target_hours_month) > 0).length;
      const comPrazo = its.filter(h => h.deadline_date).length;
      const comDono = its.filter(h => String(h.responsible_names || '').trim()).length;
      const p1_meta = pct(comMeta, meus.length), p1_prazo = pct(comPrazo, its.length), p1_dono = pct(comDono, its.length);
      const p1 = clamp(((p1_meta ?? 1) * 0.4 + (p1_prazo ?? 1) * 0.3 + (p1_dono ?? 1) * 0.3) * 10);

      // P2 · Eficiência Operacional — prazo cumprido, retrabalho, apontamento
      const cp = its.filter(h => h.deadline_date);
      const atras = cp.filter(h => h.deadline_date < hoje).length;
      const p2_prazo = cp.length ? 1 - atras / cp.length : 1;
      const retrab = its.filter(h => /altera|ajuste|rework|retrabalh/.test(norm(h.status_label))).length;
      const p2_retrab = its.length ? 1 - Math.min(1, retrab / its.length * 2.5) : 1;
      const time = activos.filter(m => m.id !== acc.id && (isAdmin || teamsOfMember(m.id).some(t => myTeams.has(t))) && Number(m.capacity_hours) > 0);
      let apont = [];
      for (const m of time) {
        const exp = Number(m.capacity_hours) * frac; if (exp < 4) continue;
        const hrs = entries.filter(e => !e.is_running && e.member_id === m.id && monthOf(e.started_at || e.created_at) === mo).reduce((s, e) => s + Number(e.hours || 0), 0);
        apont.push(Math.min(1.2, hrs / exp));
      }
      const p2_apont = apont.length ? apont.reduce((a, b) => a + b, 0) / apont.length : 1;
      const p2 = clamp((p2_prazo * 0.5 + p2_retrab * 0.2 + Math.min(1, p2_apont) * 0.3) * 10);

      // P3 · Rentabilidade & Comercial — escopo sob controle e receita gerada
      const comMetaH = hs.filter(h => h.meta > 0);
      const dentro = comMetaH.filter(h => h.horas <= h.meta * 1.15).length;
      const p3_escopo = comMetaH.length ? dentro / comMetaH.length : 1;
      const exMes = extras.filter(x => x.status !== 'cancelado' && (x.account_id === acc.id || ids.has(x.client_id)));
      const exTotal = exMes.reduce((s, x) => s + Number(x.valor_bruto || 0), 0);
      const p3_extra = Math.min(1, exTotal / Math.max(3000, meus.length * 1200));
      const estourNaoFat = comMetaH.filter(h => h.horas > h.meta * 1.15 && !exMes.some(x => x.client_id === Object.keys(healthByClient).find(k => healthByClient[k] === h))).length;
      const p3_pen = comMetaH.length ? 1 - Math.min(1, estourNaoFat / comMetaH.length) : 1;
      const p3 = clamp((p3_escopo * 0.45 + p3_extra * 0.35 + p3_pen * 0.20) * 10);

      // P4 · Relacionamento & Comunicação — saúde das contas e fluxo com o cliente
      const p4_saude = hs.length ? hs.reduce((s, h) => s + h.score, 0) / hs.length / 100 : 1;
      const travTot = hs.reduce((s, h) => s + h.travados, 0);
      const p4_fluxo = its.length ? 1 - Math.min(1, travTot / Math.max(1, its.length) * 3) : 1;
      const mudos = hs.filter(h => h.dias >= 14 && h.dias < 99).length;
      const p4_contato = hs.length ? 1 - mudos / hs.length : 1;
      const p4 = clamp((p4_saude * 0.5 + p4_fluxo * 0.25 + p4_contato * 0.25) * 10);

      const final = Number((p1 * 0.20 + p2 * 0.30 + p3 * 0.30 + p4 * 0.20).toFixed(2));
      scoreRows.push({ account_id: acc.id, month: mo,
        p1_score: Number(p1.toFixed(2)), p2_score: Number(p2.toFixed(2)), p3_score: Number(p3.toFixed(2)), p4_score: Number(p4.toFixed(2)),
        final_score: final,
        evidence: {
          p1: { clientes_com_meta: `${comMeta}/${meus.length}`, jobs_com_prazo: `${comPrazo}/${its.length}`, jobs_com_responsavel: `${comDono}/${its.length}` },
          p2: { entregas_no_prazo: `${cp.length - atras}/${cp.length}`, itens_em_retrabalho: retrab, apontamento_do_time_pct: Math.round(p2_apont * 100) },
          p3: { contas_dentro_do_escopo: `${dentro}/${comMetaH.length}`, extras_no_mes: Math.round(exTotal), contas_estouradas_sem_extra: estourNaoFat },
          p4: { saude_media_das_contas: Math.round(p4_saude * 100), entregas_paradas_no_cliente: travTot, contas_sem_contato_14d: mudos },
        } });
    }
    if (modo !== 'tarde') await sbUpsert('score_auto', scoreRows, 'account_id,month');
    log.steps.push(`score automático: ${scoreRows.length} accounts calculados`);

    // ── 5) NOTIFICAÇÃO NO MONDAY (só crítico, só quem tem dono) ──
    let notif = 0;
    if (MKEY && req.query?.notify !== '0') {
      try {
        const mu = await fetch('https://api.monday.com/v2', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: MKEY, 'API-Version': '2024-10' },
          body: JSON.stringify({ query: '{ users(limit:200){ id email } }' }),
        }).then(r => r.json());
        const byEmail = Object.fromEntries((mu?.data?.users || []).map(u => [norm(u.email), u.id]));
        const criticos = watch.filter(w => w.severity === 'critical');
        const porAccount = {};
        for (const w of criticos) {
          for (const acc of accounts) {
            const myTeams = new Set(teamsOfMember(acc.id).concat(acc.team ? [acc.team] : []));
            const c = cliById[w.ref];
            if (c && teamsOfClient(c.id).some(t => myTeams.has(t))) (porAccount[acc.id] = porAccount[acc.id] || []).push(w.message);
          }
        }
        for (const [mid, msgs] of Object.entries(porAccount)) {
          const acc = accounts.find(a => a.id === mid); if (!acc) continue;
          const uid = byEmail[norm(acc.email)]; if (!uid) continue;
          const txt = `🧭 HUB — ${msgs.length} ponto(s) crítico(s) hoje: ${msgs.slice(0, 2).join(' · ')}`.replace(/"/g, "'").slice(0, 240);
          await fetch('https://api.monday.com/v2', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: MKEY, 'API-Version': '2024-10' },
            body: JSON.stringify({ query: `mutation{ create_notification(user_id:${uid}, target_id:${uid}, target_type:Project, text:"${txt}"){ id } }` }),
          });
          notif++;
        }
      } catch (e) { console.error('notify', e.message); }
    }
    log.steps.push(`notificações: ${notif}`);

    log.ok = true; log.finished = new Date().toISOString();
    return res.status(200).json(log);
  } catch (err) {
    console.error('[hub-daily]', err);
    return res.status(200).json({ ok: false, error: String(err?.message || err), log });
  }
}
