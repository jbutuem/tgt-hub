/* ============================================================
   HUB · Agentes — onepager.js
   Geração de onepager A4 a partir dos dados do briefing validado.

   Uso:
     const html = gerarOnepagerHTML(dados, cliente);
     abrirOnepagerParaImpressao(html);

   Onde:
     - dados    = objeto retornado pelo agente de briefing (com os
                  campos estruturados: objetivo, publico, entregaveis,
                  copy, prazo, canais, pendencias, etc)
     - cliente  = objeto do window.CLIENTES[chave] (pra puxar tom de
                  voz, paleta, tipografia do guia da marca)
   ============================================================ */

(function () {
  'use strict';

  // ========== utilitários ==========

  const MESES_CURTOS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
                        'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const MESES_LONGOS = ['Janeiro', 'Fevereiro', 'Março', 'Abril',
                        'Maio', 'Junho', 'Julho', 'Agosto',
                        'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  function escHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function formatDataCurta(date) {
    // ex: "17 · Abr · 2026"
    const d = date instanceof Date ? date : new Date();
    const dia = pad2(d.getDate());
    const mes = MESES_CURTOS[d.getMonth()].charAt(0) + MESES_CURTOS[d.getMonth()].slice(1).toLowerCase();
    return `${dia} · ${mes} · ${d.getFullYear()}`;
  }

  function formatDataLonga(date) {
    // ex: "17 · Abril · 2026"
    const d = date instanceof Date ? date : new Date();
    return `${pad2(d.getDate())} · ${MESES_LONGOS[d.getMonth()]} · ${d.getFullYear()}`;
  }

  function parsePrazoParaDeadline(prazo) {
    // Tenta extrair uma data curta da string do prazo.
    // Retorna { dia: "05", mes: "MAI" } ou null se não achar.
    if (!prazo) return null;
    const s = String(prazo).toLowerCase();

    // formato dd/mm ou dd/mm/yyyy
    const m1 = s.match(/\b(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?\b/);
    if (m1) {
      const dia = pad2(parseInt(m1[1], 10));
      const mes = MESES_CURTOS[parseInt(m1[2], 10) - 1];
      if (mes) return { dia, mes };
    }

    // formato "15 de maio", "até 20 de junho", etc.
    const mesesRegex = MESES_LONGOS.map(m => m.toLowerCase()).join('|');
    const m2 = s.match(new RegExp(`\\b(\\d{1,2})\\s+(?:de\\s+)?(${mesesRegex})`, 'i'));
    if (m2) {
      const dia = pad2(parseInt(m2[1], 10));
      const mesIdx = MESES_LONGOS.findIndex(m => m.toLowerCase() === m2[2].toLowerCase());
      const mes = MESES_CURTOS[mesIdx];
      if (mes) return { dia, mes };
    }

    return null;
  }

  function gerarReferencia() {
    // BRF-2026-XXXX (número pseudo-aleatório de 4 dígitos baseado no timestamp)
    const d = new Date();
    const seed = (d.getTime() % 10000);
    return `BRF-${d.getFullYear()}-${pad2(Math.floor(seed / 100))}${pad2(seed % 100)}`;
  }

  // ========== CSS do template (copiado do Claude Design) ==========

  const ONEPAGER_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;700;900&family=Montserrat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    background: #d8d5cf;
    font-family: 'Montserrat', sans-serif;
    color: #231F20;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body {
    display: flex; justify-content: center; padding: 18px 0; gap: 18px;
    flex-direction: column; align-items: center;
  }

  .page {
    width: 210mm; height: 297mm; background: #ffffff;
    padding: 10mm 12mm 8mm; position: relative;
    display: flex; flex-direction: column; overflow: hidden;
  }
  @media print {
    html, body { background: #ffffff; padding: 0; }
    .page { box-shadow: none; margin: 0; page-break-after: always; }
    .page:last-of-type { page-break-after: auto; }
    .no-print { display: none !important; }
  }

  /* Barra de ações (só na tela) */
  .toolbar {
    position: fixed; top: 12px; right: 12px; z-index: 9999;
    display: flex; gap: 8px;
    background: #231F20; padding: 8px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  .toolbar button {
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 0.14em;
    font-size: 11px; font-weight: 600;
    padding: 8px 14px; border: 0; cursor: pointer;
    background: #ED1C24; color: #fff;
  }
  .toolbar button:hover { background: #c4161c; }
  .toolbar button.secondary { background: transparent; color: #fff; border: 1px solid #575756; }
  .toolbar button.secondary:hover { background: #353132; }

  /* HEADER */
  .header { display: flex; justify-content: space-between; align-items: flex-start; }
  .brand {
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.22em; font-size: 7.5pt; font-weight: 500; color: #231F20;
  }
  .meta-row {
    display: grid; grid-template-columns: auto auto;
    column-gap: 10px; justify-content: end; text-align: right; margin-bottom: 2px;
  }
  .meta-label {
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.18em; font-size: 6.8pt; color: #8a8680; font-weight: 500;
  }
  .meta-value {
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.14em; font-size: 7.5pt; color: #231F20; font-weight: 600;
  }

  .title-wrap { margin-top: 4mm; }
  .onepager-title {
    font-family: 'Barlow', sans-serif; font-weight: 900;
    text-transform: uppercase; letter-spacing: -0.01em;
    line-height: 0.86; font-size: 34pt; color: #231F20;
  }
  .onepager-title .slash { color: #ED1C24; margin: 0 0.06em; }

  .client-name {
    margin-top: 3mm; font-family: 'Barlow', sans-serif; font-weight: 900;
    text-transform: uppercase; letter-spacing: 0.02em; font-size: 14pt;
    color: #ED1C24; line-height: 1;
  }
  .client-name .tag {
    font-family: 'JetBrains Mono', monospace; font-size: 7pt;
    letter-spacing: 0.2em; color: #231F20; font-weight: 500; margin-left: 8px;
  }

  .header-divider { height: 1.2px; background: #ED1C24; margin-top: 3mm; width: 100%; }

  /* BODY — blocos numerados */
  .body {
    display: grid; grid-template-columns: 1fr 1fr;
    column-gap: 7mm; row-gap: 3.2mm; margin-top: 3.5mm;
  }
  .block { display: flex; flex-direction: column; gap: 1.6mm; }
  .block-full { grid-column: 1 / -1; }

  .block-number { display: flex; align-items: baseline; gap: 7px; }
  .block-number .num {
    font-family: 'Barlow', sans-serif; font-weight: 900;
    font-size: 10pt; color: #ED1C24; line-height: 1;
  }
  .block-number .dot {
    color: #231F20; font-family: 'JetBrains Mono', monospace;
    font-size: 9pt; line-height: 1;
  }
  .block-label {
    font-family: 'Barlow', sans-serif; font-weight: 900;
    text-transform: uppercase; letter-spacing: 0.06em;
    font-size: 9.5pt; color: #231F20; line-height: 1;
  }

  .block-content {
    font-family: 'Montserrat', sans-serif; font-size: 7.8pt;
    line-height: 1.42; color: #231F20; font-weight: 400;
  }
  .block-content p + p { margin-top: 1.5mm; }
  .block-content em.missing {
    color: #8a8680; font-style: italic; font-weight: 500;
  }

  /* Deliverables */
  .deliverables { display: flex; flex-direction: column; border-top: 1px solid #231F20; }
  .deliverables .row {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 1.1mm 0; border-bottom: 1px solid #E2DBCE;
  }
  .deliverables .row:last-child { border-bottom: 1px solid #231F20; }
  .deliverables .name {
    font-family: 'Montserrat', sans-serif; font-weight: 500;
    font-size: 7.8pt; color: #231F20;
  }
  .deliverables .dim {
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.1em; font-size: 7.2pt; font-weight: 500;
  }
  .deliverables .qty {
    font-family: 'JetBrains Mono', monospace; font-size: 7pt;
    letter-spacing: 0.14em; color: #8a8680; margin-right: 8px;
  }
  .deliverables-empty {
    font-family: 'Montserrat', sans-serif; font-size: 7.8pt;
    color: #8a8680; font-style: italic; padding: 2mm 0;
  }

  /* Copy box */
  .copy-box { background: #E2DBCE; padding: 3mm 4mm 3.2mm; position: relative; }
  .copy-box .q {
    font-family: 'Barlow', sans-serif; font-weight: 900;
    font-size: 20pt; color: #ED1C24; line-height: 0.6;
    position: absolute; top: 3mm; right: 4mm;
  }
  .copy-box .headline {
    font-family: 'Barlow', sans-serif; font-weight: 900;
    text-transform: uppercase; font-size: 11pt; line-height: 0.98;
    color: #231F20; margin-bottom: 1.8mm; max-width: 82%;
  }
  .copy-box .body-copy {
    font-family: 'Montserrat', sans-serif; font-size: 7.4pt;
    line-height: 1.4; color: #231F20;
  }
  .copy-box .cta-line {
    margin-top: 1.8mm; font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 0.16em;
    font-size: 6.4pt; color: #231F20;
  }
  .copy-box .cta-line .cta-label { color: #8a8680; margin-right: 5px; }
  .copy-box .cta-line .cta-sep { margin: 0 10px; color: #8a8680; }

  /* Deadline */
  .deadline-wrap { display: flex; align-items: flex-end; justify-content: space-between; gap: 5mm; }
  .deadline-date {
    font-family: 'Barlow', sans-serif; font-weight: 900;
    font-size: 30pt; line-height: 0.82; color: #231F20; letter-spacing: -0.01em;
  }
  .deadline-date .month { color: #ED1C24; }
  .deadline-date.empty {
    font-size: 11pt; color: #8a8680; font-style: italic; font-weight: 500;
    letter-spacing: 0; text-transform: none;
  }
  .deadline-aux { text-align: right; display: flex; flex-direction: column; gap: 1mm; padding-bottom: 1mm; }
  .deadline-aux .row-meta {
    display: grid; grid-template-columns: auto auto; gap: 10px; justify-content: end;
  }
  .deadline-aux .k {
    font-family: 'JetBrains Mono', monospace; font-size: 6.6pt;
    letter-spacing: 0.18em; color: #8a8680; text-transform: uppercase;
  }
  .deadline-aux .v {
    font-family: 'JetBrains Mono', monospace; font-size: 7pt;
    letter-spacing: 0.14em; color: #231F20; font-weight: 600; text-transform: uppercase;
  }

  /* Chips */
  .channels { display: flex; flex-wrap: wrap; gap: 1.5mm; }
  .chip {
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.14em; font-size: 6.5pt; font-weight: 500;
    color: #231F20; border: 1px solid #231F20;
    padding: 0.9mm 2.2mm 0.8mm; white-space: nowrap;
  }
  .chip.accent { background: #ED1C24; color: #fff; border-color: #ED1C24; }
  .chip.muted { background: #E2DBCE; border-color: #E2DBCE; }
  .chip.empty { border-style: dashed; color: #8a8680; border-color: #c9c4bb; }

  /* Brand guidelines */
  .brand-card { margin-top: 3.5mm; border-top: 1px solid #231F20; padding-top: 3mm; }
  .section-label {
    display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2.5mm;
  }
  .section-label .l {
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.2em; font-size: 7.5pt; font-weight: 600; color: #231F20;
  }
  .section-label .r {
    font-family: 'JetBrains Mono', monospace; letter-spacing: 0.18em;
    font-size: 6.6pt; color: #8a8680;
  }
  .brand-card-body {
    display: grid; grid-template-columns: 1.2fr 1.4fr 1fr;
    column-gap: 8mm; align-items: start; background: #ffffff;
  }
  .brand-cell .k {
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.18em; font-size: 6.4pt; color: #8a8680; margin-bottom: 1.2mm;
  }
  .brand-cell .v {
    font-family: 'Montserrat', sans-serif; font-size: 7.5pt;
    line-height: 1.4; color: #231F20; font-weight: 500;
  }
  .brand-cell .v.missing { color: #8a8680; font-style: italic; }
  .swatches { display: flex; gap: 2mm; margin-top: 0.5mm; flex-wrap: wrap; }
  .swatches-group { margin-bottom: 1.8mm; }
  .swatches-group:last-child { margin-bottom: 0; }
  .swatches-group .swatches-label {
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 5.8pt;
    color: #8a8680;
    margin-bottom: 1mm;
    font-weight: 500;
  }
  .swatches-group .swatches { margin-top: 0; }
  .swatch { display: flex; flex-direction: column; gap: 1mm; }
  .swatch .chip-color { width: 7.5mm; height: 7.5mm; border: 1px solid rgba(35,31,32,0.12); }
  .swatch .hex {
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.08em; font-size: 6.2pt; color: #231F20; font-weight: 500;
  }
  .typeline {
    font-family: 'Barlow', sans-serif; font-weight: 900;
    text-transform: uppercase; letter-spacing: 0.02em;
    font-size: 9pt; color: #231F20; line-height: 1.15;
  }
  .typeline .weight {
    font-family: 'JetBrains Mono', monospace; font-size: 6pt;
    letter-spacing: 0.18em; color: #8a8680; margin-left: 6px; font-weight: 500;
  }

  /* Pendências */
  .pend-section { margin-top: 3mm; padding-top: 2.5mm; border-top: 1px dashed #ED1C24; }
  .pend-section .section-label .l { color: #ED1C24; }
  .pend-list { display: flex; flex-direction: column; gap: 1.4mm; }
  .pend-item {
    display: grid; grid-template-columns: 10px 1fr; gap: 7px; align-items: baseline;
    font-family: 'Montserrat', sans-serif; font-size: 7.5pt;
    line-height: 1.4; color: #231F20;
  }
  .pend-item .ast {
    font-family: 'Barlow', sans-serif; font-weight: 900;
    color: #ED1C24; font-size: 10pt; line-height: 1; transform: translateY(2px);
  }
  .pend-item .owner {
    font-family: 'JetBrains Mono', monospace; font-size: 6.4pt;
    letter-spacing: 0.16em; text-transform: uppercase; color: #8a8680;
    font-weight: 500; margin-left: 6px; white-space: nowrap;
  }

  /* Footer */
  .footer {
    margin-top: auto; padding-top: 2.5mm; border-top: 1px solid #E2DBCE;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer .left, .footer .right {
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.22em; font-size: 6.5pt; color: #8a8680; font-weight: 500;
  }
  .footer .left .accent { color: #ED1C24; margin: 0 4px; }
  .footer .right { display: flex; gap: 9mm; }
  .footer .right .page-n { color: #231F20; font-weight: 600; }
  `;

  // ========== renderers de seções ==========

  function renderDeliverables(entregaveis) {
    if (!Array.isArray(entregaveis) || entregaveis.length === 0) {
      return `<div class="deliverables-empty">Não informado no briefing — alinhar com o cliente.</div>`;
    }
    const rows = entregaveis.map(e => {
      const nome = escHtml(e.nome || 'Peça');
      const qtd = e.qtd ? `<span class="qty">×${pad2(e.qtd)}</span>` : '';
      const dim = escHtml(e.dimensao || 'a definir');
      return `<div class="row">
        <span class="name">${nome}</span>
        <span>${qtd}<span class="dim">${dim}</span></span>
      </div>`;
    }).join('');
    return `<div class="deliverables">${rows}</div>`;
  }

  function renderCopy(copy) {
    if (!copy || (!copy.headline && !copy.body && !copy.ctaPrincipal)) {
      return `<div class="copy-box">
        <div class="body-copy" style="color:#8a8680;font-style:italic;">
          Copy e textos não informados no briefing. Alinhar com o cliente antes do designer iniciar.
        </div>
      </div>`;
    }
    const headline = copy.headline ? `<div class="headline">${escHtml(copy.headline)}</div>` : '';
    const body = copy.body ? `<div class="body-copy">${escHtml(copy.body)}</div>` : '';
    let ctaLine = '';
    if (copy.ctaPrincipal || copy.ctaSecundario) {
      const parts = [];
      if (copy.ctaPrincipal) parts.push(`<span class="cta-label">CTA principal</span>${escHtml(copy.ctaPrincipal)}`);
      if (copy.ctaSecundario) parts.push(`<span class="cta-label">CTA secundário</span>${escHtml(copy.ctaSecundario)}`);
      ctaLine = `<div class="cta-line">${parts.join('<span class="cta-sep">·</span>')}</div>`;
    }
    return `<div class="copy-box">
      <span class="q">"</span>
      ${headline}
      ${body}
      ${ctaLine}
    </div>`;
  }

  function renderDeadline(prazo) {
    const parsed = parsePrazoParaDeadline(prazo?.dataFinal);
    const aux = [];
    if (prazo?.v1Interna) aux.push({ k: 'V1 Interna', v: escHtml(prazo.v1Interna) });
    if (prazo?.aprovCliente) aux.push({ k: 'Aprov. Cliente', v: escHtml(prazo.aprovCliente) });
    if (prazo?.janela) aux.push({ k: 'Janela', v: escHtml(prazo.janela) });

    const dateBlock = parsed
      ? `<div class="deadline-date">${parsed.dia}<span class="month">/${parsed.mes}</span></div>`
      : `<div class="deadline-date empty">A definir</div>`;

    const auxBlock = aux.length
      ? `<div class="deadline-aux">${aux.map(a =>
          `<div class="row-meta"><span class="k">${a.k}</span><span class="v">${a.v}</span></div>`
        ).join('')}</div>`
      : '';

    return `<div class="deadline-wrap">${dateBlock}${auxBlock}</div>`;
  }

  function renderChannels(canais) {
    if (!Array.isArray(canais) || canais.length === 0) {
      return `<div class="channels"><span class="chip empty">Não informado</span></div>`;
    }
    const chips = canais.map((c, i) => {
      const classe = i === 0 ? 'chip accent' : 'chip';
      return `<span class="${classe}">${escHtml(c)}</span>`;
    }).join('');
    return `<div class="channels">${chips}</div>`;
  }

  function renderBrandCard(cliente) {
    const nomeCliente = cliente?.nome || 'Cliente';
    // Adapta ao formato real de clientes.js: dados ficam em cliente.guia.*
    const guia = cliente?.guia || {};
    const versao = cliente?.versaoGuia || guia.versao || '1.0 / 2026';

    // --- Tom de voz ---
    // Vem como string longa em guia.tom_de_voz (formato clientes.js atual)
    // Resumimos pra caber na caixa se for muito longo.
    let tomDeVoz = '';
    const tomRaw = guia.tom_de_voz || cliente?.tomDeVoz;
    if (tomRaw && typeof tomRaw === 'string' && tomRaw.trim()) {
      // Pega só as 2 primeiras frases para não estourar layout
      const frases = tomRaw.split(/(?<=[.!?])\s+/).filter(Boolean);
      const resumo = frases.slice(0, 2).join(' ');
      tomDeVoz = `<div class="v">${escHtml(resumo)}</div>`;
    } else {
      tomDeVoz = `<div class="v missing">Guia sem tom de voz registrado.</div>`;
    }

    // --- Paleta ---
    // guia.paleta_cores é array de objetos { hex, nome, uso }.
    // Separamos em primária (sempre mostrada) e secundária (mostrada se existir).
    // Cores setoriais/exceção não entram em nenhum grupo.
    let paletaBlock = '';
    const paletaRaw = guia.paleta_cores || guia.paleta || cliente?.paleta;
    if (Array.isArray(paletaRaw) && paletaRaw.length > 0) {
      const classify = (uso) => {
        if (!uso) return 'primaria'; // sem uso declarado → assumimos primária
        const u = String(uso).toLowerCase();
        // Setoriais / excepcionais — descarta
        if (/apenas em|setorial|exce[çc][ãa]o/.test(u)) return 'descarte';
        // Secundária
        if (/secund[áa]ria|terci[áa]ria/.test(u)) return 'secundaria';
        // Primária (padrão)
        return 'primaria';
      };

      const extractHex = (entry) => {
        if (typeof entry === 'string') return entry;
        return entry.hex || entry.color || entry.valor || '';
      };

      const primarias = [];
      const secundarias = [];
      paletaRaw.forEach(entry => {
        const uso = typeof entry === 'object' ? entry.uso : null;
        const group = classify(uso);
        const hex = extractHex(entry);
        if (!hex) return;
        if (group === 'primaria') primarias.push(hex);
        else if (group === 'secundaria') secundarias.push(hex);
      });

      // Fallback: se a classificação não separou nada, trata tudo como primária
      if (primarias.length === 0 && secundarias.length === 0) {
        paletaRaw.forEach(entry => {
          const hex = extractHex(entry);
          if (hex) primarias.push(hex);
        });
      }

      const renderSwatches = (hexes, limite) => hexes.slice(0, limite).map(hex => {
        const h = String(hex).startsWith('#') ? hex : '#' + hex;
        return `<div class="swatch">
          <div class="chip-color" style="background:${escHtml(h)};"></div>
          <span class="hex">${escHtml(h.toUpperCase())}</span>
        </div>`;
      }).join('');

      if (primarias.length > 0) {
        const primHtml = renderSwatches(primarias, 5);
        // Se tem secundária, mostra embaixo com label menor
        if (secundarias.length > 0) {
          const secHtml = renderSwatches(secundarias, 5);
          paletaBlock = `
            <div class="swatches-group">
              <div class="swatches-label">Primária</div>
              <div class="swatches">${primHtml}</div>
            </div>
            <div class="swatches-group">
              <div class="swatches-label">Secundária</div>
              <div class="swatches">${secHtml}</div>
            </div>`;
        } else {
          paletaBlock = `<div class="swatches">${primHtml}</div>`;
        }
      } else {
        paletaBlock = `<div class="v missing">Paleta não mapeada no guia.</div>`;
      }
    } else {
      paletaBlock = `<div class="v missing">Paleta não mapeada no guia.</div>`;
    }

    // --- Tipografia ---
    // guia.tipografia pode ser: (a) objeto { principal, secundaria }  [formato clientes.js]
    //                           (b) array de objetos { nome, uso }
    //                           (c) array de strings
    let tipoBlock = '';
    const tipoRaw = guia.tipografia || cliente?.tipografia;
    const tipolines = [];
    if (tipoRaw) {
      if (Array.isArray(tipoRaw)) {
        tipoRaw.slice(0, 3).forEach(t => {
          if (typeof t === 'string') {
            tipolines.push({ nome: t.split(/[—\-·,(]/)[0].trim(), uso: '' });
          } else if (typeof t === 'object') {
            tipolines.push({ nome: t.nome || '', uso: t.uso || '' });
          }
        });
      } else if (typeof tipoRaw === 'object') {
        // { principal: "Acumin Pro — títulos...", secundaria: "Montserrat — corpo..." }
        ['principal', 'secundaria', 'terciaria'].forEach(chave => {
          const str = tipoRaw[chave];
          if (str && typeof str === 'string') {
            // Separa nome da fonte do uso por "—", "-" ou ","
            const parts = str.split(/\s*[—–-]\s*/);
            const nome = parts[0].trim();
            // Uso resumido: primeira parte depois do travessão, cortando em vírgula/ponto
            let uso = parts.slice(1).join(' — ').split(/[.,]/)[0].trim();
            if (uso.length > 40) uso = uso.slice(0, 40) + '…';
            tipolines.push({ nome, uso });
          }
        });
      }
    }

    if (tipolines.length > 0) {
      tipoBlock = tipolines.map(t => {
        const uso = t.uso ? `<span class="weight">${escHtml(t.uso)}</span>` : '';
        return `<div class="typeline">${escHtml(t.nome)} ${uso}</div>`;
      }).join('');
    } else {
      tipoBlock = `<div class="v missing">Tipografia não mapeada no guia.</div>`;
    }

    return `<section class="brand-card">
      <div class="section-label">
        <span class="l">Diretrizes da marca · ${escHtml(nomeCliente)}</span>
        <span class="r">V · ${escHtml(versao)}</span>
      </div>
      <div class="brand-card-body">
        <div class="brand-cell">
          <div class="k">Tom de voz</div>
          ${tomDeVoz}
        </div>
        <div class="brand-cell">
          <div class="k">Paleta do cliente</div>
          ${paletaBlock}
        </div>
        <div class="brand-cell">
          <div class="k">Tipografia do cliente</div>
          ${tipoBlock}
        </div>
      </div>
    </section>`;
  }

  function renderPendencias(pendencias) {
    if (!Array.isArray(pendencias) || pendencias.length === 0) return '';
    const items = pendencias.map(p => {
      const desc = typeof p === 'string' ? p : escHtml(p.item || p.descricao || '');
      const owner = (typeof p === 'object' && (p.owner || p.dono || p.prazo))
        ? `<span class="owner">${escHtml([p.owner || p.dono, p.prazo].filter(Boolean).join(' · '))}</span>`
        : '';
      return `<div class="pend-item">
        <span class="ast">*</span>
        <span>${desc} ${owner}</span>
      </div>`;
    }).join('');
    return `<section class="pend-section">
      <div class="section-label">
        <span class="l">Pendências · alinhar com cliente</span>
        <span class="r">${pad2(pendencias.length)} ${pendencias.length === 1 ? 'item aberto' : 'itens abertos'}</span>
      </div>
      <div class="pend-list">${items}</div>
    </section>`;
  }

  // ========== renderer principal ==========

  /**
   * Gera o HTML completo da onepager.
   * @param {Object} dados - dados do briefing estruturado
   * @param {Object} cliente - dados do cliente (de window.CLIENTES)
   * @returns {string} HTML completo (pode ser escrito numa janela nova)
   */
  function gerarOnepagerHTML(dados, cliente) {
    dados = dados || {};
    cliente = cliente || {};

    const hoje = new Date();
    const dataCurta = formatDataCurta(hoje);
    const dataLonga = formatDataLonga(hoje);
    const tipoEntrega = dados.tipoEntrega || 'Briefing';
    const referencia = dados.referencia || gerarReferencia();
    const nomeCliente = cliente.nome || 'Cliente';
    const statusCliente = cliente.status || 'Conta Ativa';

    const objetivo = dados.objetivo
      ? `<p>${escHtml(dados.objetivo)}</p>`
      : `<p><em class="missing">Objetivo não informado no briefing.</em></p>`;

    const publico = dados.publico
      ? `<p>${escHtml(dados.publico)}</p>`
      : `<p><em class="missing">Público-alvo não informado no briefing.</em></p>`;

    const deliverables = renderDeliverables(dados.entregaveis);
    const copy = renderCopy(dados.copy);
    const deadline = renderDeadline(dados.prazo);
    const channels = renderChannels(dados.canais);
    const brandCard = renderBrandCard(cliente);
    const pendencias = renderPendencias(dados.pendencias);

    const tituloPagina = `Onepager · ${nomeCliente} · ${dataCurta}`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${escHtml(tituloPagina)}</title>
<style>${ONEPAGER_CSS}</style>
</head>
<body>

<div class="toolbar no-print">
  <button onclick="window.print()">Salvar como PDF</button>
  <button class="secondary" onclick="window.close()">Fechar</button>
</div>

<div class="page">

  <header class="header">
    <span class="brand">↗ TGT / HUB</span>
    <div>
      <div class="meta-row"><span class="meta-label">Gerado em</span><span class="meta-value">${escHtml(dataCurta)}</span></div>
      <div class="meta-row"><span class="meta-label">Tipo de entrega</span><span class="meta-value">${escHtml(tipoEntrega)}</span></div>
      <div class="meta-row"><span class="meta-label">Referência</span><span class="meta-value">${escHtml(referencia)}</span></div>
    </div>
  </header>

  <div class="title-wrap">
    <h1 class="onepager-title">Onepager<br/>de<span class="slash">/</span>Briefing</h1>
    <div class="client-name">${escHtml(nomeCliente)} <span class="tag">Cliente · ${escHtml(statusCliente)}</span></div>
  </div>
  <div class="header-divider"></div>

  <section class="body">

    <div class="block">
      <div class="block-number"><span class="num">01</span><span class="dot">·</span><span class="block-label">Objetivo</span></div>
      <div class="block-content">${objetivo}</div>
    </div>

    <div class="block">
      <div class="block-number"><span class="num">02</span><span class="dot">·</span><span class="block-label">Público-alvo</span></div>
      <div class="block-content">${publico}</div>
    </div>

    <div class="block block-full">
      <div class="block-number"><span class="num">03</span><span class="dot">·</span><span class="block-label">Entregáveis e dimensões</span></div>
      <div class="block-content">${deliverables}</div>
    </div>

    <div class="block block-full">
      <div class="block-number"><span class="num">04</span><span class="dot">·</span><span class="block-label">Copy e textos</span></div>
      ${copy}
    </div>

    <div class="block">
      <div class="block-number"><span class="num">05</span><span class="dot">·</span><span class="block-label">Prazo de entrega</span></div>
      ${deadline}
    </div>

    <div class="block">
      <div class="block-number"><span class="num">06</span><span class="dot">·</span><span class="block-label">Canais de veiculação</span></div>
      ${channels}
    </div>

  </section>

  ${brandCard}
  ${pendencias}

  <footer class="footer">
    <div class="left">Gerado pelo Hub <span class="accent">*</span> TGT Studio</div>
    <div class="right">
      <span>${escHtml(dataLonga)}</span>
      <span class="page-n">01 / 01</span>
    </div>
  </footer>

</div>

</body>
</html>`;
  }

  /**
   * Abre a onepager numa nova aba com barra de ações (Salvar como PDF / Fechar).
   */
  function abrirOnepagerParaImpressao(html) {
    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) {
      alert('Pop-ups bloqueados. Habilite pop-ups pra este site e tente de novo.');
      return null;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    return win;
  }

  // ========== exporta ==========
  window.Onepager = {
    gerarHTML: gerarOnepagerHTML,
    abrirParaImpressao: abrirOnepagerParaImpressao
  };
})();
