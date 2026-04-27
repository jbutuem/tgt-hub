/* ============================================================
   HUB · Agentes — clientes.js
   Objeto com os guias de marca de cada cliente.

   Campos com valor null significam que a informação NÃO estava
   no documento oficial da marca. Quando um cliente tem muitos
   campos null, o agente roda em modo parcial usando apenas
   o que está disponível.

   Última atualização: baseada nos documentos de marca fornecidos
   via upload no projeto.
   ============================================================ */

const CLIENTES = {

  // ============================================================
  // TGT STUDIO (identidade visual do próprio HUB)
  // ============================================================
  tgt: {
    nome: "TGT Studio",
    time: "tgt",
    guia: {
      posicionamento: "A agência além do marketing. Ser extensão dos times que atende, alinhando visão, propósito e execução pra transformar estratégia em resultado. Agência humana que vai além, com retidão nas relações e propósito no serviço.",
      tom_de_voz: "Humana, servil, ousada, parceira, engajada, coletiva e criativa. Comunicação direta e próxima, sem jargão corporativo vazio. Fala como parceiro que caminha junto, não como fornecedor distante.",
      publico_alvo: "Marcas e empresas que buscam uma agência parceira pra estratégia, design, produção e execução de campanhas — especialmente quem valoriza relacionamento próximo e entregas surpreendentes acima da burocracia de agência tradicional.",
      paleta_cores: [
        { hex: "#231F20", nome: "Preto TGT", uso: "Cor base, fundos principais" },
        { hex: "#ED1C24", nome: "Vermelho TGT", uso: "Cor de destaque — uso pontual e estratégico" },
        { hex: "#FFFFFF", nome: "Branco", uso: "Tipografia sobre fundos escuros, contraste" },
        { hex: "#E2DBCE", nome: "Bege", uso: "Fundo claro alternativo" },
        { hex: "#455E6E", nome: "Azul aço", uso: "Secundária de apoio" },
        { hex: "#575756", nome: "Cinza 80%", uso: "Textos secundários" },
        { hex: "#9D9D9C", nome: "Cinza 50%", uso: "Divisórias, apoio" },
        { hex: "#D0D0D0", nome: "Cinza 25%", uso: "Backgrounds claros" }
      ],
      tipografia: {
        principal: "Acumin Pro — títulos, subtítulos e textos de destaque. Pesos de Thin a Black.",
        secundaria: "Montserrat — corpo de texto, legendas, informações complementares."
      },
      dos_donts: {
        dos: [
          "Usar vermelho #ED1C24 como acento pontual, sempre em contraste forte com preto ou bege",
          "Priorizar fundos pretos ou beges com tipografia em caixa alta nos títulos principais",
          "Aplicar elementos gráficos recorrentes: asterisco branco/vermelho, seta diagonal, pontos vermelhos, colagens",
          "Manter tipografia geométrica e direta — Acumin Pro bold/black nos títulos",
          "Usar marca-texto vermelho em palavras de destaque do manifesto (ex: 'vamos além')"
        ],
        donts: [
          "Usar vermelho como cor predominante (ele é acento, não fundo)",
          "Misturar fontes serifadas ou decorativas — a marca é sans-serif",
          "Usar gradientes ou efeitos visuais chamativos que fujam da estética direta",
          "Aplicar o logo sobre fundos que comprometam a leitura do vermelho",
          "Usar tons pastel ou paletas coloridas fora das cores oficiais"
        ]
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // KERRY (masterbrand)
  // Fontes: Amplify Brand in Your Hand Dec 2025 + Amplify Guides V2
  // ============================================================
  kerry: {
    nome: "Kerry",
    time: "t12",
    guia: {
      posicionamento: "The Future of Sustainable Nutrition. Kerry é o parceiro mais valorizado dos clientes, unindo a engenhosidade das pessoas à inovação com respaldo científico pra criar impacto vital. Purpose: 'Inspiring Food, Nourishing Life'. Vision: 'Our customers' most valued partner, creating a world of sustainable nutrition'.",
      tom_de_voz: "5 traits principais: Future-Focused (visionário), Energising (vibrante, dinâmico), Relatable (autêntico, humano), Thought-Provoking (provoca reflexão com ciência e dados) e Proactive (responsável, orientado a resultados). Tom se ajusta à audiência — mais técnico pra R&D/científicos, mais inspirador pra marketing/inovação, mais estratégico pra C-suite.",
      publico_alvo: "B2B corporativo. Audiências segmentadas: Corporate (investidores, analistas, mídia), Customer C-Suite (decisores de negócio), Customer Marketing & Innovation (brand, insights, product development), Customer R&D & Technical (formuladores, cientistas) e Employees & Future Talent.",
      paleta_cores: [
        { hex: "#005776", nome: "Valentia Slate", uso: "Cor primária principal — sempre presente em qualquer aplicação Kerry" },
        { hex: "#289BA2", nome: "Sage", uso: "Primária — apoio ao Valentia Slate" },
        { hex: "#44CF93", nome: "Jade", uso: "Primária — usada em Proactive Health" },
        { hex: "#F9C20A", nome: "Sunrise", uso: "Secundária — Technology Platform" },
        { hex: "#F24A00", nome: "Sunset", uso: "Secundária — Technology Platform" },
        { hex: "#FFC2B3", nome: "Amaranth", uso: "Secundária — Women's Health" },
        { hex: "#143700", nome: "Forest", uso: "Secundária — texto e blocos pequenos" },
        { hex: "#F1F1E5", nome: "Stone", uso: "Secundária — backgrounds neutros, breakers" },
        { hex: "#DFFF11", nome: "Innovation", uso: "Secundária — destaques energéticos" }
      ],
      tipografia: {
        principal: "Noto Sans — fonte primária, usada em todas as comunicações. Pesos: Light (headlines), Condensed Extra-Bold (Impact Statements em caixa alta), Bold (sub-headlines), Regular (body).",
        secundaria: "Noto Serif (italic regular) — usado APENAS em citações diretas. IBM Plex Mono (regular) — usado APENAS em dados científicos, patentes, resultados clínicos."
      },
      dos_donts: {
        dos: [
          "Valentia Slate sempre deve aparecer na aplicação Kerry — é a cor de equity da marca",
          "Liderar com impacto: comunicar primeiro o benefício real pro leitor, não só o ingrediente/tecnologia",
          "Usar Impact Statements em Noto Sans Condensed all-caps apenas no início ou fim da frase",
          "Noto Serif italic só em aspas/citações diretas",
          "IBM Plex Mono só pra dados factuais e científicos",
          "Headlines em title case, subheads e body em sentence case"
        ],
        donts: [
          "Nunca usar cores fora da paleta oficial",
          "Não criar combinações de cores com contraste ruim",
          "Não combinar cores pra criar gradientes",
          "Não usar muitas cores combinadas simultaneamente",
          "Não sobrepor cores com overlay que altere as cores originais da marca",
          "Não usar Noto Sans Condensed em parágrafos longos — só em Impact Statements",
          "Não usar Impact Statement no meio de uma frase, só no início ou fim",
          "Não usar IBM Plex Mono em conteúdo narrativo ou marketing direto ao consumidor",
          "Não abusar da paleta secundária — ela apoia, não lidera quando se fala como marca Kerry"
        ]
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // H&T / KERRY PROACTIVE HEALTH
  // Fontes: Amplify Brand in Your Hand + Amplify Guides + Proactive Health Chapter
  // ============================================================
  ht: {
    nome: "H&T (Kerry Proactive Health)",
    time: "t4",
    guia: {
      posicionamento: "Líder em nutrição proativa e saúde — Kerry Proactive Health posiciona-se como referência no setor de saúde e nutrição, comprometida em impactar positivamente a vida de consumidores globais. 3 pilares da proposta de valor: Impact (benefício positivo para clientes, pessoas, planeta), Ingenuity (engenhosidade das pessoas e colaboração) e Science-backed Innovation (fundamentação científica, 1.400+ patentes, 100+ estudos clínicos).",
      tom_de_voz: "Herda os 5 traits do masterbrand Kerry (Future-Focused, Energising, Relatable, Thought-Provoking, Proactive) aplicados a temas de saúde. Framework de mensagem: liderar com Impact, destacar Ingenuity das pessoas, provar com Science-backed innovation. Usa verbos ativos de energia ('ignite', 'unleash', 'advance', 'empower'). Exemplos: 'Where science drives impact', 'Unstoppable advancement', 'Unleashing ingenuity'.",
      publico_alvo: "Mesma segmentação Kerry corporativa, com foco em 5 plataformas de saúde: Women's Health (Her range), Immune Health, Digestive Health, Cognitive Health e Infant Health. Clientes B2B que desenvolvem suplementos, bebidas funcionais, alimentos fortificados.",
      paleta_cores: [
        { hex: "#FFFFFF", nome: "White", uso: "Cor chave em Proactive Health — dá clareza e permite que as outras cores se destaquem" },
        { hex: "#005776", nome: "Valentia Slate", uso: "Cor de apoio — link ao masterbrand, mas sem dominar" },
        { hex: "#143700", nome: "Forest", uso: "Texto principal e pequenos blocos de cor" },
        { hex: "#44CF93", nome: "Jade", uso: "Vibrância e energia — pode representar uma plataforma" },
        { hex: "#289BA2", nome: "Sage", uso: "Vida e energia" },
        { hex: "#FFC2B3", nome: "Amaranth", uso: "Women's Health" },
        { hex: "#DFFF11", nome: "Innovation", uso: "Destaque científico e energético" },
        { hex: "#F1F1E5", nome: "Stone", uso: "Breaker pra páginas longas, alternativa ao branco" }
      ],
      tipografia: {
        principal: "Noto Sans — herda do masterbrand Kerry. Light, Regular, Semi Bold, Bold, Condensed.",
        secundaria: "Noto Serif (italic) para citações humanas. IBM Plex Mono para dados científicos, stats e proof-points (ex: '100+ clinical studies', '1,400+ patents')."
      },
      dos_donts: {
        dos: [
          "Liderar com Impact — começar pela consequência positiva, não pelo ingrediente",
          "Balancear ciência (Plex Mono) com humanidade (pessoas reais nas fotos)",
          "Usar white como dominante — traz clareza e deixa as outras cores cantarem",
          "Usar hexágono como micro shape principal — representa ciência e precisão",
          "Mostrar diversidade real nas fotos — Kerry é humana e global",
          "Logo sempre em Valentia Slate ou White",
          "Fotografia científica (microscópica, texturas de ingredientes) pra reforçar respaldo científico"
        ],
        donts: [
          "Não dominar com Valentia Slate — em Proactive Health ele é apoio, não herói",
          "Não usar Forest como fundo predominante — fica pesado demais pro tom vibrante de saúde",
          "Não esquecer de mostrar pessoas reais — a marca é 'inherently human'",
          "Seguem todos os don'ts do masterbrand Kerry"
        ]
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // LESAFFRE
  // Fonte: Lesaffre Visual Identity Guide 2025
  // ============================================================
  lesaffre: {
    nome: "Lesaffre",
    time: "t12",
    guia: {
      posicionamento: "Working together to nourish and protect the planet. Grupo global especialista em fermentação e microorganismos (leveduras, probióticos, bactérias). Missão: melhor nutrir e proteger o planeta através da fermentação. 170+ anos de história (fundada em 1853).",
      tom_de_voz: null,
      publico_alvo: null,
      paleta_cores: [
        { hex: "#0A3B93", nome: "Ultramarine Blue", uso: "Cor icônica e símbolica da marca — fundamental, sempre presente" },
        { hex: "#F7EFE5", nome: "Light Brown", uso: "Primária — fundo claro, elegante" },
        { hex: "#8A7B60", nome: "Taupe Brown", uso: "Primária — bege escuro" },
        { hex: "#C4BDAF", nome: "Taupe Brown 50%", uso: "Primária — bege médio" },
        { hex: "#C6C6C6", nome: "Light Grey", uso: "Primária — cinza neutro" },
        { hex: "#791D41", nome: "Ruby Red", uso: "Secundária — uso com blue ou outra primária presente" },
        { hex: "#135975", nome: "Tunic Blue", uso: "Secundária" },
        { hex: "#F08A00", nome: "Passion Orange", uso: "Secundária" },
        { hex: "#88BA14", nome: "Grass Green", uso: "Secundária" }
      ],
      tipografia: {
        principal: "Lato (Google Font) — tipografia de referência. Usada em títulos, corpo de texto e legendas. Variações de Hairline a Black. Preferência pra minúsculas em títulos.",
        secundaria: "Nothing You Could Do — fonte script complementar, usada ocasionalmente pra enfatizar uma palavra ou frase, nunca mais que isso."
      },
      dos_donts: {
        dos: [
          "Ultramarine Blue deve sempre estar presente — é a cor fundamental do sistema",
          "Uma das 4 cores primárias (beiges ou light grey) sempre junto ao blue",
          "Cores secundárias apenas se blue ou outra primária já estiver no meio",
          "Gradientes: entre blue e secundária OU entre duas secundárias — não mais que 4 combinações de cor por capa",
          "Lato preferencialmente em minúsculas nos títulos",
          "Usar os 5 padrões gráficos oficiais que representam microorganismos (fermentação, levedura, probióticos)",
          "Padrões sempre sobrepõem um bloco de texto ou visual — nunca sobrepõem entre si",
          "Logo da andorinha (swallow) como elemento gráfico permitido",
          "Estilos tipográficos variados: Lato em reverse, outline, com gradiente"
        ],
        donts: [
          "Não usar cores fora da paleta",
          "Padrões não podem se sobrepor entre si",
          "Nothing You Could Do nunca com gradientes — só em cor sólida secundária",
          "Não usar mais de 4 combinações de cor por capa/material",
          "Não esquecer de incluir blue ou primária obrigatória quando usar secundárias"
        ]
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // CELERA
  // Fontes: Celera Guia de Marca 2026 + Celera Thermal Brand Profile
  // ============================================================
  celera: {
    nome: "Celera",
    time: "t12",
    guia: {
      posicionamento: "A new era in thermal management. For a new generation. Parceira estratégica de engenharia em materiais avançados para gestão térmica e vedação técnica. Combina IA, engenharia de materiais e expertise global pra entregar soluções que melhoram performance, segurança e durabilidade. Assinatura: 'Passion for Technique'. Fechamento: 'BUILD IT BETTER, FASTER AND SAFER. BUILD WITH CELERA.'",
      tom_de_voz: "Técnica mas acessível. Confiante sem arrogância, direta e objetiva (frases curtas em headlines), aspiracional (conecta performance a resultados concretos), humana (perguntas retóricas nas redes), parceira estratégica. Comunicação oficial predominantemente em inglês (posicionamento global B2B).",
      publico_alvo: "B2B técnico — engenheiros, P&D, tomadores de decisão técnicos. Setores principais: Eletrônicos (PCBs, data centers, 5G), Automotivo/EVs (baterias, ECUs), Iluminação LED, Telecomunicações, Energia e Agricultura. Mercados exigentes: Europa (especialmente Alemanha), EUA e Brasil.",
      paleta_cores: [
        { hex: "#000000", nome: "Preto", uso: "Primária — fundos escuros, tipografia de contraste" },
        { hex: "#00AEEF", nome: "Cyan", uso: "Primária — cor de destaque, nunca como fundo principal" },
        { hex: "#19468D", nome: "Azul Escuro (Pantone 286)", uso: "Primária — headers, tabelas, destaques" },
        { hex: "#A0344D", nome: "Vermelho/Rosa (setorial)", uso: "Apenas em seções de Thermal Interface Materials do catálogo" },
        { hex: "#D4951A", nome: "Laranja/Dourado (setorial)", uso: "Apenas em seções de Technical Sealants" },
        { hex: "#8B9A1B", nome: "Verde-oliva (setorial)", uso: "Apenas em seções de Encapsulation & Shielding" }
      ],
      tipografia: {
        principal: "Calibri Bold — títulos e destaques.",
        secundaria: "Calibri Regular — corpo de texto."
      },
      dos_donts: {
        dos: [
          "Logo no canto superior esquerdo em redes sociais (versão branca sobre fundo escuro)",
          "Headlines curtas e impactantes, preferencialmente em inglês",
          "Perguntas retóricas pra engajamento ('Have you ever touched an LED light after hours of use?')",
          "Paleta de cores respeitada: fundos escuros com acentos em cyan e azul",
          "Certificações e compliance (UL 94 V0, RoHS, REACH) sempre visíveis em catálogo",
          "Porta-voz de vídeo: camisa polo preta Celera, fundo azul",
          "Imagens de circuito (PCB) como textura de fundo em aberturas de seção",
          "Tabelas de propriedades no padrão: Mechanical/Chemical, Thermal, Electrical"
        ],
        donts: [
          "Cyan nunca como fundo principal — só destaque",
          "Não rotacionar, distorcer ou aplicar efeitos (sombra, brilho) no logo",
          "Não usar cores setoriais fora das seções correspondentes do catálogo",
          "Não usar fontes alternativas ao Calibri sem aprovação",
          "Não usar linguagem consumer ou tom promocional de varejo",
          "Não usar jargão corporativo vazio nem superlativos sem evidência ('o melhor', 'único')"
        ]
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // DAVINCI GOURMET
  // Fonte: DaVinci Gourmet Brand Guidelines 2025
  // ============================================================
  davinci: {
    nome: "DaVinci Gourmet",
    time: "t12",
    guia: {
      posicionamento: "Inventive Alchemist — palette for your creativity. Brand promise: 'We promise to be a palette for your creativity, inspiring you to craft beverages as unique as you are.' Personagem de marca: open-minded, curious, forward-thinking. Rooted in artistry e attitude of experimentation. Acredita que satisfazer a curiosidade é uma das maiores fontes de inspiração e auto-expressão. Tagline: 'Drink Curious'.",
      tom_de_voz: "4 voice pillars: Bold (comanda atenção com substância, não barulho — expressivo, confiante, não arrogante), Helpful (action-oriented, empático, solucionador), Charming (magnético, relacionável, genuíno, espirituoso) e Inspiring (vívido, poético, otimista, criativo, mágico mas prático). Tone adapta à audiência: foodservice operators (mais prático e direto) vs consumers (mais inspirador).",
      publico_alvo: "Foodservice operators (bares, cafés, restaurantes) e consumidores finais que buscam bebidas criativas. Parte da Kerry. B2B + B2C dual.",
      paleta_cores: [
        { hex: "#FFFFFF", nome: "Marshmallow", uso: "Base — neutra e versátil" },
        { hex: "#E5DCCF", nome: "Cashew", uso: "Base — neutra clara" },
        { hex: "#A89E96", nome: "Nougat", uso: "Base — cinza quente" },
        { hex: "#820034", nome: "Cherry", uso: "Boost — cor vibrante, storytelling de sabor" },
        { hex: "#286587", nome: "Blueberry", uso: "Boost" },
        { hex: "#5B3A87", nome: "Fig", uso: "Boost — roxo profundo, cor de identidade DaVinci" },
        { hex: "#366143", nome: "Kale", uso: "Boost" },
        { hex: "#F52560", nome: "Raspberry", uso: "Boost — rosa vibrante" },
        { hex: "#49B5F1", nome: "Splash", uso: "Boost — azul claro" },
        { hex: "#9C77E5", nome: "Lavender", uso: "Boost — lavanda" },
        { hex: "#88BD91", nome: "Matcha", uso: "Boost" },
        { hex: "#EE8E07", nome: "Citrus", uso: "Depth — laranja âmbar" },
        { hex: "#8C5F35", nome: "Caramel", uso: "Depth — marrom caramelo" },
        { hex: "#231F20", nome: "Charcoal", uso: "Depth — preto/carvão" },
        { hex: "#756D66", nome: "Mocha", uso: "Depth — marrom neutro" }
      ],
      tipografia: {
        principal: "DaVinci Regular — fonte proprietária, apenas HEADLINES em caixa alta (não existem caracteres minúsculos). Fave Script Pro — fonte de accent, uso pontual pra criar contraste com as outras fontes.",
        secundaria: "Noto Sans (Regular, SemiBold, Bold) — subheads e body copy. Brandon Grotesque (Light, Regular, Medium, Bold, Black) — reservada apenas para packaging."
      },
      dos_donts: {
        dos: [
          "Usar DaVinci font sempre em CAIXA ALTA — não existem minúsculas",
          "Fave Script Pro só como accent, pra contraste com DaVinci/Noto",
          "Brandon Grotesque APENAS em packaging",
          "Adaptar o tom à audiência: mais prático pra operators, mais inspirador pra consumers",
          "Usar verbos ativos e descrições vívidas de sabor",
          "Ser encantador, surpreender com frases inesperadas, evitar ser óbvio",
          "Liderar com bold headlines e entregar solução prática pra foodservice operators"
        ],
        donts: [
          "EVITAR palavras: Elegant, Stunning, Indulge, Plump, Essence, Elevate, Durable, goodness, delight, Unparalleled, Discover, Bliss, Concoctions, No Fuss, Effortlessly, Versatile Flavor Enhancer, Crafted With Care, Conveniently, Sophistication",
          "Não ser arrogante ou barulhento — bold sem ser cocky",
          "Não usar DaVinci font em body copy — só headlines",
          "Não usar Brandon Grotesque fora de packaging",
          "Não ser genérico — tom DaVinci é sempre charming, nunca corporativo"
        ]
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // UV.LINE
  // Fontes: Manual de Identidade UV.LINE + UV.LINE Brand Profile
  // ============================================================
  uvline: {
    nome: "UV.LINE",
    time: "t4",
    guia: {
      posicionamento: "Estilo de vida solar. Moda com proteção UV — primeira marca da América Latina em roupas e acessórios com UPF 50+ certificado pela ARPANSA (autoridade australiana). Defende o 'uso consciente do sol': aproveitar a vida ao ar livre sem descuidar da saúde. A proteção é parte integral da peça — não sai com água nem transpiração. Missão: proteger as pessoas do sol sem abrir mão do estilo e do bem-estar. Diferenciais: tecnologia têxtil avançada + design de moda + respaldo científico (dermatologistas) + certificação internacional.",
      tom_de_voz: "Caloroso, otimista e convidativo. Celebra o sol, a vida ao ar livre e o bem-estar — mas sempre ancorado em tecnologia e ciência. Não é marca médica fria, nem marca esportiva técnica: é marca de estilo de vida com substância. Inclusivo (família, todas as idades). Emocional + funcional juntos. Operação Colômbia publica em espanhol. Tom descontraído e visual nas redes digitais.",
      publico_alvo: "B2C — consumidor final todas as idades. Mulher (público principal): roupas casual/esportivo/praia/banho, sombreros e viseiras. Homem: casual e esportivo. Kids: esportivos e banho. Perfil geral: pessoas ativas que valorizam saúde, bem-estar e moda. Amantes do ar livre: praia, esporte, família. Mercados: Brasil (fundação 2003) e Colômbia (desde 2020).",
      paleta_cores: [
        { hex: "#221E1F", nome: "Preto", uso: "Cor base" },
        { hex: "#C86425", nome: "Laranja/Terracota", uso: "Cor de destaque" },
        { hex: "#82ACB7", nome: "Azul claro", uso: "Apoio" },
        { hex: "#B7987D", nome: "Bege", uso: "Apoio" },
        { hex: "#636466", nome: "Cinza escuro", uso: "Texto secundário" },
        { hex: "#499989", nome: "Verde-água", uso: "Apoio" },
        { hex: "#37606C", nome: "Azul petróleo", uso: "Apoio escuro" },
        { hex: "#F0EEE9", nome: "Off-white", uso: "Fundo claro" }
      ],
      tipografia: null,
      dos_donts: {
        dos: [
          "Tom alegre, solar, convidativo",
          "Emocional e funcional juntos",
          "Inclusivo: família, todas as idades",
          "Dados de proteção com leveza (UPF 50+, 98%)",
          "Celebração do sol com consciência",
          "'Clube solar', comunidade, pertencimento",
          "Conteúdo visual apoiado em estilo de vida solar, família e movimento",
          "Operação Colômbia em espanhol"
        ],
        donts: [
          "Evitar tom clínico ou excessivamente técnico",
          "Não falar só de tecnologia sem estilo",
          "Não usar linguagem de nicho ou elitista",
          "Evitar claims de saúde sem certificação",
          "Nunca usar medo ou alarmismo sobre câncer de pele",
          "Evitar tom transacional frio"
        ]
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // DEMARCHI USA
  // Fonte: DeMarchi USA Claims Playbook (FDA-compliant)
  // ============================================================
  demarchi_usa: {
    nome: "DeMarchi USA",
    time: "t4",
    guia: {
      posicionamento: "Polpas de frutas congeladas e bowls de açaí/pitaya para o mercado norte-americano. Foco em compliance FDA — USDA Organic certified, Product of Brazil, Certified by IBD. Marca que leva o melhor da natureza brasileira ao mercado dos EUA.",
      tom_de_voz: "Direto, factual e regulatório-consciente. Linguagem sempre defensável sob as regras da FDA — evitar claims subjetivos de saúde e bem-estar. Foco em fatos verificáveis: certificações, origem, ingredientes reais.",
      publico_alvo: "Mercado B2C americano, foodservice e retail nos EUA. Consumidores conscientes que valorizam certificações orgânicas e origem autêntica.",
      paleta_cores: null,
      tipografia: null,
      dos_donts: {
        dos: [
          "Usar '100% fruit. One ingredient. Nothing added.' no lugar de 'Pure and natural'",
          "Usar 'USDA Organic certified. Product of Brazil.' em claims de saúde genéricos",
          "Usar 'Made with organic ingredients. USDA Organic certified.' no lugar de 'No preservatives'",
          "Usar 'Made with real organic acai [or dragon fruit] from Brazil.' no lugar de 'All natural'",
          "Usar 'Frozen to preserve freshness. Keep frozen.' no lugar de 'Preservative-free'",
          "Usar 'A delicious way to enjoy organic acai.' no lugar de 'Healthy treat'",
          "Usar 'USDA Organic. Certified by IBD. Product of Brazil.' no lugar de 'Clean label'",
          "Sempre pode dizer: 'Made with organic ingredients', 'Made with real organic acai', 'Product of Brazil', 'Frozen to preserve freshness', 'Just thaw and enjoy', 'BDK Kosher Parve', 'Ready-to-eat bowl', 'Tropical organic bowl'"
        ],
        donts: [
          "NUNCA dizer: 'No preservatives', 'Preservative-free', 'No preservatives added' (alto risco de litigation — produto contém ácido cítrico)",
          "NUNCA dizer: 'All natural', '100% natural', 'Nothing artificial', 'Clean label'",
          "NUNCA dizer: 'No additives', 'Chemical-free', 'Pure' (como claim isolado)",
          "NUNCA dizer: 'Healthy', 'Guilt-free', 'Boosts immunity', 'Anti-aging'",
          "NUNCA fazer claims de saúde, prevenção de doença ou médicos de qualquer tipo",
          "CUIDADO com: 'No artificial preservatives' (só se sourcing do ácido cítrico estiver documentado como natural), 'No artificial flavors' (requer verificação ingrediente por ingrediente), 'Superfood', 'Antioxidant-rich', 'Non-GMO'",
          "Em dúvida, escalar pro brand team ANTES de postar"
        ]
      },
      criterios_briefing: "Importante: este cliente opera nos EUA e todas as peças devem seguir o compliance FDA. Qualquer claim de saúde, 'all natural', 'preservative-free', 'clean label' ou similares deve ser sinalizado como risco alto. O briefing deve mencionar que a linguagem final passará por compliance/jurídico antes de ir pro ar."
    }
  },

  // ============================================================
  // DEMARCHI BR
  // Fonte: Apresentação DeMarchi / Açaí Sport (Conceito de Marca)
  // ============================================================
  demarchi_br: {
    nome: "DeMarchi BR",
    time: "t4",
    guia: {
      posicionamento: "Plataforma guarda-chuva do grupo — consolida portfólio, processos e credibilidade B2B/B2C. Autoridade e abrangência. 'Qualidade De Marchi' como endosso de produtos. Separar para expandir: mesmo DNA, públicos distintos. DeMarchi preserva autoridade e amplia conteúdos B2B.",
      tom_de_voz: "Acolhedor, confiável, abrangente e técnico. Comunicação institucional e de qualidade. Fala para cozinhas industriais, food service e refeições familiares.",
      publico_alvo: "B2B e B2C adulto. Cozinha industrial, food service, refeições familiares. Decisores técnicos de alimentação, chefs, gestores de restaurantes.",
      paleta_cores: null,
      tipografia: null,
      dos_donts: {
        dos: [
          "Tom acolhedor, confiável, abrangente e técnico",
          "Conteúdo focado em qualidade e autoridade",
          "Canais: Instagram, TikTok, Pinterest, LinkedIn, YouTube",
          "Comunicação B2B forte no LinkedIn",
          "Editoria de posts focados em qualidade no Instagram"
        ],
        donts: [
          "Não se misturar com tom Açaí Sport (que é jovem/vibrante)",
          "Evitar linguagem de lifestyle 18-34 — esse é território da Açaí Sport"
        ]
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // AÇAÍ SPORT (sub-marca do grupo DeMarchi)
  // Fonte: Apresentação DeMarchi / Açaí Sport
  // ============================================================
  acai_sport: {
    nome: "Açaí Sport",
    time: "t4",
    guia: {
      posicionamento: "Açaí Sport by De Marchi — feed ágil, tom jovem e estética competitiva pra disputar share-of-mind com Oakberry, Frooty, Polpanorte e Sambazon. Desejo e performance. Mantém o selo de qualidade 'Qualidade De Marchi' como endosso, mas no front-end tem tom, estética e cadência próprias. Energia e movimento. 'Vai treinar? Vai de açaí!'",
      tom_de_voz: "Vibrante, esportivo, cool e inspirador. Jovem, ágil, competitivo. Fala de desejo e lifestyle, não de ficha técnica. Linguagem do dia a dia do esporte e bem-estar.",
      publico_alvo: "B2C jovem (18-34 anos) que decide por desejo de lifestyle, não por ficha técnica. Praticantes de atividade física, frequentadores de praia, público fitness e wellness.",
      paleta_cores: null,
      tipografia: null,
      dos_donts: {
        dos: [
          "Tom vibrante, esportivo, cool e inspirador",
          "Foco em momentos de consumo: pré/pós-treino, praia, pós-trilha, snack rápido",
          "Linguagem que fala de desejo e lifestyle",
          "Canais digitais: Instagram, TikTok, Pinterest",
          "Estética competitiva contra líderes do açaí (Oakberry, Frooty, etc.)",
          "Conteúdo de energia e movimento",
          "Headlines tipo 'Vai treinar? Vai de açaí!', 'Sua dose diária de disposição'"
        ],
        donts: [
          "Não usar tom técnico ou institucional (isso é DeMarchi BR)",
          "Não focar em ficha técnica — o público decide por desejo",
          "Não comunicar como commodity de alimentação"
        ]
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // LLEV
  // Fonte: Llev Lar Guideline de Marca (minimalista — só logo/fontes/cores)
  // ============================================================
  llev: {
    nome: "Llev",
    time: "t4",
    guia: {
      posicionamento: null,
      tom_de_voz: null,
      publico_alvo: null,
      paleta_cores: [
        { hex: "#FE5D0A", nome: "Laranja primário", uso: "Cor principal" },
        { hex: "#FE8401", nome: "Laranja secundário", uso: "Apoio ao laranja principal" },
        { hex: "#011F38", nome: "Azul escuro", uso: "Primária escura" },
        { hex: "#012E53", nome: "Azul médio", uso: "Apoio ao azul escuro" },
        { hex: "#EDEDED", nome: "Cinza claro", uso: "Fundo neutro" }
      ],
      tipografia: {
        principal: "Montserrat — todos os pesos disponíveis (Thin, ExtraLight, Light, Regular, Medium, Semibold, Bold, Black).",
        secundaria: null
      },
      dos_donts: {
        dos: [
          "Usar gradientes oficiais: laranja (#FE8401 → #FE5F0A), azul (#004074 → #012E53), neutro (#FEFEFE → #CFCFCF)",
          "Montserrat em variações de peso pra hierarquia"
        ],
        donts: null
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // KORA NATURAL
  // Fontes: KORA Manual de Marca + Update estratégico nov/2025
  // ============================================================
  kora: {
    nome: "Kora",
    time: "t3",
    guia: {
      posicionamento: "Kora Natural — marca de nutrição natural para pets, conectada ao bem-estar, à natureza e ao vínculo entre tutor e animal. 'Kora vem de coração. Da essência. Do que é verdadeiramente importante.' Nutrição de verdade, ingredientes selecionados, promessa de uma vida mais saudável e feliz para o pet. Celebração de aventuras, contato com a natureza, brincadeiras e 'lambeijos'. Estratégia: fortalecer posicionamento como marca natural diferenciada (ingredientes selecionados, vida saudável, felicidade, conexão genuína), gerar awareness, criar identificação emocional com tutores que valorizam cuidado e qualidade de vida, construir confiança e desejo de marca, estimular consideração de compra.",
      tom_de_voz: "Acolhedora, leve e emocional, sempre valorizando afeto, cuidado e conexão entre pets e tutores. Linguagem simples, próxima e positiva, transmitindo bem-estar sem parecer excessivamente técnica ou comercial. Comunicação inspiradora, conectada à natureza, à felicidade dos animais e ao estilo de vida saudável. Reforça a verdade, a essência e aquilo que realmente importa (conceito central da marca). Nível de formalidade: moderado e acessível — próxima, mas transmitindo confiança e qualidade. Estilo: predominantemente emocional (vínculo afetivo entre tutor e pet), complementado por argumentos racionais ligados à nutrição e ingredientes selecionados. Idioma: Português, linguagem clara e humanizada. Palavras preferidas: natural, bem-estar, cuidado, nutrição de verdade, saúde, companhia, vida saudável, aventuras, amor, felicidade, essência. Palavras a evitar: industrializado, artificial, pesado, termos excessivamente técnicos, linguagem promocional exagerada. CTAs padrão: 'Descubra mais', 'Cuide com carinho', 'Conheça a Kora', 'Ofereça o melhor para seu pet', 'Faça parte dessa conexão'.",
      publico_alvo: "Tutores de pets que valorizam alimentação natural e ingredientes selecionados. Pessoas ativas, aventureiras, que passeiam com seus pets ao ar livre. Tutores que buscam vida saudável e conexão com a natureza tanto pra si quanto pro pet. A marca diferencia comunicação por espécie através de cor: verde para cães, azul para gatos.",
      paleta_cores: [
        { hex: "#096132", nome: "Verde escuro (Pantone 7733 C)", uso: "Cor principal — comunicação geral e cães" },
        { hex: "#015687", nome: "Azul escuro (Pantone 7692 C)", uso: "Cor principal — comunicação para gatos" },
        { hex: "#519E2D", nome: "Verde vibrante", uso: "Secundária — apoio" },
        { hex: "#1491CE", nome: "Azul vibrante", uso: "Secundária — apoio" },
        { hex: "#FF9D00", nome: "Laranja", uso: "Secundária" },
        { hex: "#FF6701", nome: "Laranja intenso", uso: "Secundária" },
        { hex: "#E6C99D", nome: "Bege claro", uso: "Secundária" },
        { hex: "#0F2B1C", nome: "Verde muito escuro", uso: "Secundária" },
        { hex: "#113356", nome: "Azul muito escuro", uso: "Secundária" },
        { hex: "#E68902", nome: "Âmbar", uso: "Secundária" },
        { hex: "#E25B10", nome: "Vermelho terra", uso: "Secundária" }
      ],
      tipografia: {
        principal: "Red Rose Bold — títulos e textos que precisam ter maior destaque e peso.",
        secundaria: "Figtree — corpo de texto e textos longos."
      },
      dos_donts: {
        dos: [
          "Verde principal (#096132) para comunicação geral e produtos de cães",
          "Azul principal (#015687) para comunicação de produtos de gatos",
          "Estilo fotográfico aventureiro: tutor em atividade com pet, ao ar livre",
          "Pets sempre em momentos alegres e felizes nas imagens (pets de raça)",
          "Temperatura de cor iluminada e confortável nas fotos",
          "Elementos gráficos criados a partir dos laços do coração (logotipo) — leves",
          "Layouts limpos e sofisticados",
          "Contexto natural ou doméstico agradável",
          "Posts que reforçam rotina saudável e vínculo emocional",
          "Comunicação afetiva com foco em bem-estar"
        ],
        donts: [
          "Comunicação excessivamente comercial ou agressiva",
          "Visual poluído ou com excesso de informação",
          "Uso incorreto do logotipo, cores e tipografia",
          "Imagens sem contexto emocional ou desconectadas da proposta da marca",
          "Fotografias artificiais, frias ou sem naturalidade",
          "Fundos que prejudiquem a legibilidade do logo",
          "Comunicação muito técnica ou distante emocionalmente",
          "Uso de imagens sem contexto humano/pet",
          "Posts promocionais sem narrativa",
          "Layouts excessivamente carregados"
        ]
      },
      criterios_briefing: "PEÇA APROVADA quando: mantém coerência com o posicionamento emocional e natural da marca, transmite leveza visual, proximidade e bem-estar. AJUSTES COMUNS: redução de excesso textual, melhor equilíbrio entre emoção e informação, reforço da identidade natural, maior presença de lifestyle pet. EXEMPLOS APROVADOS: conteúdos com pets ao ar livre, comunicação afetiva com foco em bem-estar, aplicações visuais minimalistas e organizadas, posts que reforçam rotina saudável e vínculo emocional. EXEMPLOS REJEITADOS: posts promocionais sem narrativa, layouts excessivamente carregados, uso inadequado do logo ou cores fora do manual, comunicação muito técnica ou distante."
    }
  },

  // ============================================================
  // PURAVIE
  // Fontes: PURAVIE Manual de Marca + Update estratégico nov/2025
  // ============================================================
  puravie: {
    nome: "Puravie",
    time: "t3",
    guia: {
      posicionamento: "Marca de nutrição pet que une cuidado, afeto e responsabilidade. Conceito central: 'amor a cada tigela' — alimentação como forma de expressar amor pelos pets, que vai além do produto e representa vínculo, carinho e qualidade de vida. Estratégia: fortalecer reconhecimento de marca, construir conexão emocional com tutores, ampliar awareness no segmento pet premium, gerar identificação por meio de histórias e momentos afetivos, reforçar valores institucionais (cuidado, nutrição de qualidade, amor, responsabilidade social), incentivar interesse pelos produtos e direcionar para pontos de venda/distribuidores/canais oficiais.",
      tom_de_voz: "Acolhedora, próxima e emocional, transmitindo cuidado genuíno com pets e famílias. Discurso positivo, humano e inspirador, evitando exageros comerciais ou linguagem excessivamente técnica. Carinhosa, leve e empática. Próxima do tutor, como alguém que entende a relação com os pets. Inspiradora, reforçando afeto e responsabilidade. Confiante, mas sem parecer distante ou corporativa demais. Nível de formalidade: moderadamente informal — conversa acessível, porém profissional. Estilo: predominantemente emocional (vínculo tutor-pet), complementado por argumentos racionais (nutrição e qualidade). Idioma: Português brasileiro. Palavras preferidas: amor, cuidado, nutrição, bem-estar, família, carinho, qualidade, compromisso, saúde, vida saudável. Palavras a evitar: termos agressivos de venda ('imperdível', 'última chance', 'compre agora'), linguagem excessivamente técnica ou fria, promessas absolutas sem sustentação ('o melhor do mercado', 'resultado garantido'). CTAs padrão: 'Cuide de quem faz parte da sua família', 'Descubra mais sobre Puravie', 'Ofereça mais carinho em cada refeição', 'Conheça a nutrição que transforma cuidado em amor'.",
      publico_alvo: "Tutores de pets (cães e gatos) que valorizam nutrição de qualidade, cuidado e vínculo afetivo. Famílias que tratam pets como parte da família. A marca diferencia comunicação por espécie através de cor: vermelho para cães, azul para gatos.",
      paleta_cores: [
        { hex: "#C71523", nome: "Vermelho (Pantone 3517 C)", uso: "Cor principal — comunicação geral e cães" },
        { hex: "#232F5E", nome: "Azul marinho (Pantone 2748 C)", uso: "Cor principal — comunicação para gatos" },
        { hex: "#00BED5", nome: "Cyan (Pantone 3115 C)", uso: "Secundária" },
        { hex: "#0068A7", nome: "Azul médio (Pantone 307 C)", uso: "Secundária" },
        { hex: "#E44261", nome: "Rosa (Pantone 198 C)", uso: "Secundária" },
        { hex: "#523177", nome: "Roxo (Pantone 7680 C)", uso: "Secundária" },
        { hex: "#AA95DB", nome: "Lavanda (Pantone 2645 C)", uso: "Secundária" },
        { hex: "#FD9CB1", nome: "Rosa claro (Pantone 183 C)", uso: "Secundária" },
        { hex: "#5FC4E5", nome: "Azul claro (Pantone 305 C)", uso: "Secundária" },
        { hex: "#0084D6", nome: "Azul vibrante (Pantone 2173 C)", uso: "Secundária" },
        { hex: "#EA564F", nome: "Vermelho claro (Pantone 2348 C)", uso: "Secundária" },
        { hex: "#5D2A2D", nome: "Marrom vinho (Pantone 490 C)", uso: "Secundária" },
        { hex: "#002F6D", nome: "Azul ultramarino (Pantone 294 C)", uso: "Secundária" },
        { hex: "#007484", nome: "Teal escuro (Pantone 7474 C)", uso: "Secundária" }
      ],
      tipografia: {
        principal: "Onest — usada em todas as comunicações. Variações de peso: Regular, Medium, Bold, Extra Bold.",
        secundaria: null
      },
      dos_donts: {
        dos: [
          "Vermelho (#C71523) para comunicação geral e produtos de cães",
          "Azul marinho (#232F5E) para comunicação de produtos de gatos",
          "Estilo fotográfico com foco no amor entre pet e tutor",
          "Pets em momentos alegres e felizes nas imagens",
          "Temperatura de cor calorosa e confortável",
          "Usar variações de peso Onest pra destaque e hierarquia",
          "Sempre preferir aplicação principal do logotipo (colorido)",
          "Fotos quentes e confortáveis",
          "Pets em momentos felizes e naturais, contexto familiar e cotidiano",
          "Mostrar benefícios e qualidade do produto",
          "Uso de pets SRD (sem raça definida)",
          "Linguagem leve, positiva e emocional"
        ],
        donts: [
          "Não aplicar logo em cores diferentes das oficiais",
          "Não aplicar logo em fundos que comprometam a legibilidade",
          "Não rotacionar o logo ou colocá-lo em posição que prejudique a leitura",
          "Não alterar a aplicação das versões do logotipo com assinatura (Premium Especial, Vitalidade Premium Especial)",
          "Comunicação excessivamente promocional",
          "Falta de conexão emocional com pets e tutores",
          "Visual que não respeite a identidade da marca",
          "Fotos frias, sem contexto afetivo ou sensação de acolhimento",
          "Excesso de texto técnico",
          "Foco apenas no produto e não no vínculo emocional",
          "Imagens genéricas sem expressão de felicidade ou conexão"
        ]
      },
      criterios_briefing: "PEÇA APROVADA: comunicação que reflete cuidado genuíno, vínculo emocional e qualidade. AJUSTES COMUNS: reduzir tom comercial, tornar mensagem mais humana, inserir contexto emocional na copy, melhor equilíbrio entre informação e sentimento. EXEMPLOS APROVADOS: conteúdos com pets e tutores em interação, frases institucionais ligadas a cuidado e nutrição, imagens com temperatura quente e sensação acolhedora. EXEMPLOS REJEITADOS: posts focados apenas em preço, comunicação muito técnica ou fria, imagens sem expressão emocional ou contexto de relacionamento. Direção visual valoriza fotos calorosas, pets felizes e contexto afetivo, reforçando conforto e proximidade."
    }
  },

  // ============================================================
  // EMPÓRIO DO NONO
  // Fontes: Brand Book Empório do Nono v1.0 (Abril 2026 — TGT Digital)
  // + Update estratégico nov/2025
  // ============================================================
  emporio_nono: {
    nome: "Empório do Nono",
    time: "t3",
    guia: {
      posicionamento: "Restaurante-bar tradicional na esquina da Av. Albino J. B. Oliveira em Barão Geraldo (Campinas/SP), fundado em 1999 por Junior Pattaro. 27 anos de história. 'Um boteco tradicional. De família, sem ser formal. Artesanal, sem ser rústico. Acolhedor, sem precisar gritar.' Manifesto: 'A gente não serve refeição. A gente recebe.' Em uma frase: 'Um bar com alma de casa, uma cozinha com sotaque italiano, uma esquina com 27 anos de história — e um chopp que virou marca registrada.' Quatro pilares: (1) Acolhedor — conhece cliente por nome, lembra do prato; (2) Tradicional — receita que não muda, chopp tirado com capricho, PF feito na hora; (3) Artesanal — forno à lenha, bolinho moldado à mão, queijo artesanal da mogiana, nada industrial; (4) Com Ocasião — do almoço simples ao jantar italiano, do chorinho da última segunda do mês ao Samba do Nono. Marcos: 1999 (abertura), 2001 (Segunda do Chorinho — agenda fixa da cidade), 2010 (40+ aperitivos de balcão / 'acepipes de balcão'), 2018-2021 (Melhor Casa de Campinas para se Petiscar pela Veja Campinas, 4 anos consecutivos), 2021 (delivery próprio via WhatsApp), 2026 (primeiro Brand Book oficial). Estratégia: aumentar movimento diário no almoço e jantar (especialmente seg-qua), aumentar recorrência, mostrar tradição desde 1999, humanizar marca através de equipe e ambiente, reforçar credibilidade e permanência no bairro, comunicar como experiência (não apenas refeição), consolidar imagem de restaurante clássico e familiar.",
      tom_de_voz: "Arquétipo: O Anfitrião — não é o crítico, não é o chef, não é o sommelier. É quem abre a porta, serve o chopp, puxa a mesa, se senta do lado e conversa. Calmo, generoso, com sotaque próprio. Não precisa impressionar porque já impressiona só por estar onde está. Atributos: generoso, calmo, próximo, nostálgico, com humor, sem pressa. Posicionamento: caseiro (não formal), tradicional (não moderno), conversador (não silencioso), acolhedor (não sofisticado), sem pressa (não apressado), bem-humorado (não sério). Comunicação humana, próxima, acolhedora, tradicional, simples — conversa como quem recebe alguém em casa, profissional sem parecer publicidade. Nível de formalidade: médio-baixo, linguagem natural, sem exagero comercial. Estilo emocional: acolhimento, pertencimento, família, memória afetiva, conforto. Estilo racional: pratos bem servidos, ingredientes e preparo, ambiente e atendimento, tradição e qualidade. Idioma: português brasileiro, linguagem cotidiana, próxima da realidade do público local. SEIS PRINCÍPIOS DE VOZ: (1) Primeira pessoa do plural — 'a gente nosso' nunca 'o estabelecimento/a empresa'; (2) Tempo presente, sem urgência — 'tem feijoada na última segunda do mês', não 'corre que tem' (tradição não precisa de manchete); (3) Humor seco com carinho — pode brincar com o cliente, com a casa, com o prato (mas nunca com tom de superioridade); (4) Detalhe concreto > adjetivo genérico — 'chopp cremoso, com 2 dedos de colarinho' é melhor que 'chopp premium' (sempre que der, se prove); (5) Memória coletiva como argumento — 'desde 1999', 'como sempre', 'todo mundo em Barão sabe' (frases que ativam pertencimento); (6) Convite, não comando — 'vem tomar um chopp', não 'reserve agora'. A GENTE DIZ: 'Vem petiscar.' / 'O chopp tá cremoso hoje.' / 'Feijoada na quarta, como sempre.' / 'Aqui tem mesa pra vocês.' / 'PF do Nono, o de sempre?'. A GENTE NÃO DIZ: 'Gastronomia autoral.' / 'Experiência imersiva.' / 'Corre, só hoje!' / 'Ambiente descolado.' / 'Unidade gastronômica.' / 'Imperdível' / 'promoção relâmpago' / 'gourmet' / 'premium' / 'explosão de sabores' / 'corre pra cá' / 'o melhor da cidade' / 'barato' / 'experiência premium' / 'oferta limitada'. Palavras preferidas: tradição, acolhimento, família, bem servido, casa, mesa cheia, feito na hora, sabor, encontro, comida de verdade, rotina boa, clássico. CTAs padrão: 'Vem pro almoço.' / 'Hoje já estamos servindo.' / 'Te esperamos por aqui.' / 'Seu lugar à mesa está pronto.' / 'Passa aqui no fim do dia.' / 'Vem aproveitar o clima.' Pergunta-teste sempre: 'O Nono diria isso?' Se a resposta for não (ou 'talvez'), reescreve.",
      publico_alvo: "Moradores e frequentadores de Barão Geraldo (Campinas/SP). Famílias, grupos de amigos, apreciadores de cozinha clássica brasileira com toque italiano e música ao vivo (chorinho). Clientela que valoriza tradição, ambiente acolhedor, experiência gastronômica autêntica. Frequentadores recorrentes que viram parte da casa.",
      paleta_cores: [
        { hex: "#F2B70B", nome: "Amarelo Chopp", uso: "PRINCIPAL (35%) — destaque e atenção. CMYK 0/26/100/0, Pantone 7549 C" },
        { hex: "#1E5A8A", nome: "Azul Italiano", uso: "PRINCIPAL (25%) — estrutural, identidade italiana. CMYK 92/60/20/5, Pantone 2186 C" },
        { hex: "#8B2635", nome: "Vinho", uso: "ACENTO (5%) — raro e pontual. CMYK 30/95/75/30, Pantone 1815 C" },
        { hex: "#F6EFE0", nome: "Creme", uso: "BASE (45%) — fundo principal. CMYK 3/4/12/0, Pantone 7527 C" },
        { hex: "#1A1815", nome: "Carvão", uso: "TINTA — texto principal. CMYK 70/65/65/90, Pantone Black 6 C" },
        { hex: "#EBE3CC", nome: "Creme Sombreado", uso: "Secundária — variação do creme" },
        { hex: "#0F3554", nome: "Azul Profundo", uso: "Secundária — variação do azul italiano" },
        { hex: "#D99507", nome: "Âmbar (chopp escuro)", uso: "Secundária — variação do amarelo" },
        { hex: "#2B2620", nome: "Tinta", uso: "Para textos longos — alternativa ao carvão" }
      ],
      tipografia: {
        principal: "Playfair Display (Serif Display, Open Font License via Google Fonts) — TÍTULOS, MANCHETES, DESTAQUES. Pesos Regular 400, Italic 400, Bold 700, Black 900. Conversa com a história da casa: serifa clássica que lembra menus antigos de trattoria.",
        secundaria: "Libre Caslon Text (Serif Corpo, Google Fonts) — PARÁGRAFOS, DESCRIÇÕES, CORPO DE TEXTO. Pesos Regular 400, Italic 400, Bold 700, Bold Italic. Família tipográfica inglesa do século XVIII. Perfeita para menus, cartas de vinho, descrições de pratos, blocos longos. Archivo (Sans-serif UI, Google Fonts) — LEGENDAS, RÓTULOS, DETALHES TÉCNICOS, BOTÕES, FORMULÁRIOS, LABELS, RODAPÉS. Special Elite (Monospace, Google Fonts) — APENAS DECORATIVO: SELOS, CARIMBOS, RÓTULOS DECORATIVOS, etiquetas de garrafa. NUNCA pra texto corrido ou títulos longos. Sem fontes de sistema, sem Arial, sem preguiça."
      },
      dos_donts: {
        dos: [
          "USE versão colorida do logo SEMPRE QUE POSSÍVEL (4 cores sobre creme — assinatura principal)",
          "Versões monocromáticas SÓ em exceções (impressão limitada, bordado, gravação, contraste insuficiente)",
          "Reserve área de segurança = altura da letra 'O' do logotipo ao redor — nada deve invadir essa margem",
          "Tamanho mínimo: 24px digital / 12mm impresso",
          "Mascote (rosto do Nono) pode ser usado SOZINHO em selos, avatares, adesivos pequenos — com parcimônia, ele é pontuação, não frase inteira",
          "Proporção de cores: Creme 45% (fundo), Carvão 25%, Chopp 18%, Azul Italiano 8%, Vinho 4% — RECEITA VISUAL",
          "Combinações que funcionam: Creme + Carvão / Carvão + Chopp / Azul + Creme / Chopp + Carvão",
          "Use o XADREZ ITALIANO (#1E5A8A azul sobre creme — NUNCA invertido) como textura de fundo, divisor de seções, moldura ou assinatura de categoria",
          "SELOS E CARIMBOS pequenos pra capas de menu, embalagens de delivery, posts oficiais — UM por vez (selo é pontuação, não parágrafo)",
          "ORNAMENTOS E DIVISORES finos (asteriscos, símbolos pequenos) sempre em vinho ou carvão — NUNCA em chopp (chopp é destaque)",
          "FOTOGRAFIA: luz quente (2800-3400K), ÂMBAR, NUNCA fria. White balance neutro = ERRADO",
          "Composição com respiro — nunca encha o quadro",
          "Profundidade de campo rasa NO PRATO — contexto atrás desfocado",
          "Preserve reflexos, gotas, vapor, farelos reais (textura antes de perfeição)",
          "Use xadrez da toalha, madeira da mesa, vidro do balcão como elementos",
          "Paleta cálida pós-produção: aumente levemente laranjas e ocres",
          "GENTE aparece como ATMOSFERA — mãos servindo, silhueta atrás do balcão, mesa cheia no fundo. Raramente rosto inteiro em primeiro plano. O protagonista é a CASA",
          "FOCO É O PRATO — sempre sobre o prato, não sobre o set. Planos fechados, recortes agressivos, ponto de vista de cima ou a 45°",
          "FEED INSTAGRAM: 70% foto direta, 25% template com tipografia, 5% padrão decorativo — sempre alternando, nunca dois templates seguidos",
          "Stories em 9:16, sempre com hierarquia tipográfica clara e paleta oficial",
          "Legenda do post = voz do Nono: curta, direta, em primeira pessoa do plural",
          "Sempre incluir um detalhe concreto do dia — horário, prato, música, tempo",
          "Cardápio: papel pólen creme, impressão offset monocromática (preta ou vinho), eventual brilho dourado em edições especiais",
          "Embalagem delivery: caixa kraft natural com adesivo de selagem em vinho ou amarelo chopp, sacolas em cream com logotipo grande, bilhete manuscrito",
          "Uniforme: avental sarja crua com mascote bordado em amarelo (cozinha), camiseta confortável em cores da paleta com logo (salão)"
        ],
        donts: [
          "DISTORCER O LOGO — sempre proporcional, sempre limpo. Nunca recompor as proporções entre símbolo e logotipo",
          "USAR FONTES DE SISTEMA (Arial, Times) — a tipografia É parte da marca, sem preguiça",
          "GRITAR EM CAIXA ALTA — o Nono não corre, o Nono não grita. Mesmo promoção é comunicada com calma",
          "EMOJI EM POST DE FEED — só em stories, nunca em feed. Se precisar enfatizar, use tipografia",
          "SOBRECARGA VISUAL — se precisa explicar tanto, a peça tá errada. Faça o ar trabalhar a favor",
          "FRASES GENÉRICAS — 'sabor único', 'experiência única', 'qualidade premium', 'incomparável' — não diz nada do Nono. Use detalhe concreto sempre",
          "FOTOGRAFIA SATURADA / HDR exagerado / filtros 'vintage' genéricos — a casa é quente, não ácida",
          "VOZ CORPORATIVA — 'Garanta sua reserva pra uma jornada gastronômica de sabores autorais...' — fale como gente, não como marca",
          "FOTO DE BANCO DE IMAGENS — o Nono só usa foto do Nono. Não tem genérico — ou expõe a casa, ou não posta",
          "Fundo branco liso tipo catálogo ou delivery de app",
          "Flash direto na comida",
          "Plano desfocado onde não tem foco claro",
          "Pessoas posando sorrindo pra câmera — isso é propaganda, não Nono",
          "Legendas gravadas em cima da foto (exceto em stories)",
          "Combinações ruins de cor: Vinho+Chopp / Chopp+Azul direto / Azul claro+cinza / Creme+cinza",
          "Vinho aparece apenas como ACENTO (4%) — nunca como dominante",
          "Logo sobre fundos com contraste insuficiente",
          "Layouts poluídos ou com excesso de informação",
          "Comunicação distante da atmosfera acolhedora e tradicional",
          "Excesso de elementos gráficos que desviem do produto principal",
          "Linguagem promocional exagerada ou agressiva",
          "Imperdível, promoção relâmpago, gourmet, premium, explosão de sabores"
        ]
      },
      criterios_briefing: "REGRA DE OURO: na dúvida, pergunte 'O Nono diria isso?' Se a resposta for não (ou 'talvez'), reescreve. PEÇA APROVADA: identidade visual respeitada (paleta, tipografia, composição), elegância e tradição transmitidas, fotografia gastronômica bem iluminada (luz âmbar 2800-3400K) e indulgente, destaque pra texturas/frescor/momentos reais, layouts limpos e sofisticados, comunicação que une tradição e modernidade, posts que transmitam experiência (não apenas produto), voz do Nono presente (1ª pessoa plural, tempo presente sem urgência, humor seco com carinho, detalhe concreto, memória coletiva, convite). REPROVA: layouts poluídos ou excesso de informação, fotografias escuras/artificiais/sem apelo gastronômico, linguagem promocional exagerada ou agressiva, uso incorreto do logo, baixa legibilidade ou falta de contraste, comunicação distante da atmosfera acolhedora e tradicional, excesso de elementos gráficos, voz corporativa, frases genéricas, fotografia saturada/HDR/filtros vintage, foto de banco de imagens, posing pra câmera. PADRÕES DE ERRO: textos longos demais para redes sociais, falta de valorização do alimento ou da experiência, uso de cores fora da paleta, comunicação genérica sem identidade, falta de padronização visual entre posts. AJUSTES COMUNS: redução de excesso de texto, refinamento de CTA, melhor equilíbrio entre imagem e copy, mais destaque pro produto principal, ajuste de tom pra parecer mais acolhedor e menos comercial. EXEMPLOS APROVADOS: posts com foco em café da manhã/sobremesas/pizzas/refeições em clima aconchegante, conteúdo com enquadramento clean, iluminação quente e valorização do produto, artes minimalistas para datas comemorativas e comunicados institucionais. EXEMPLOS REJEITADOS: layouts com muitos blocos de texto, artes promocionais visualmente agressivas, fotos frias/sem profundidade/pouca apetência visual, comunicação sem vínculo emocional ou sensorial."
    }
  },

  // ============================================================
  // PÃO DO CAMBUÍ
  // Fonte: Update estratégico nov/2025 (boulangerie tradicional Campinas)
  // ============================================================
  pao_cambui: {
    nome: "Pão do Cambuí",
    time: "t3",
    guia: {
      posicionamento: "Boulangerie tradicional, acolhedora e completa, parte da rotina e dos bons momentos dos clientes. Mais que padaria: experiência ampliada — café, refeições, pizzaria, confeitaria e momentos especiais. Estratégia: fortalecer posicionamento como boulangerie de tradição e qualidade, ampliar awareness regional, fortalecer reconhecimento institucional, gerar tráfego para as unidades, aumentar consumo recorrente no dia a dia. Valorizar tradição, qualidade, experiência e diversidade de produtos. Posicionar a marca como parte da rotina e dos bons momentos. Incentivar o desejo por meio de conteúdos visuais apetitosos, fortalecendo percepção de credibilidade e permanência.",
      tom_de_voz: "Acolhedor, familiar e inspirador, transmitindo proximidade e sensação de pertencimento. Comunicação calorosa, simples e confiável, evitando excesso de formalidade ou linguagem técnica. Objetivo: fazer o cliente sentir que está sendo convidado para um momento agradável e especial. Nível de formalidade: intermediário — elegante, mas acessível. Estilo: predominância emocional, com apoio racional baseado em tradição, qualidade e confiança. Idioma: Português brasileiro. Palavras preferidas: tradição, sabor, aconchego, qualidade, família, frescor, experiência, pausa, momento, carinho, confiança, variedade. Palavras a evitar: termos frios, promocionais em excesso, linguagem agressiva, linguagem muito informal, comunicação 'apelativa' ou barata. CTAs padrão: 'Passe aqui e aproveite' / 'Venha viver esse momento' / 'Experimente hoje' / 'Seu café, almoço ou jantar te espera'. Descrições devem despertar o apetite e valorizar sensações, texturas, aromas e momentos cotidianos. Escrita transmite simplicidade e desejo, sem exagero comercial.",
      publico_alvo: "Moradores e frequentadores da região do Cambuí (Campinas). Clientes que buscam tradição, qualidade e experiência completa de boulangerie — café da manhã, almoço, jantar, sobremesa. Famílias e clientes recorrentes do dia a dia.",
      paleta_cores: null,
      tipografia: null,
      dos_donts: {
        dos: [
          "Fotografia gastronômica bem iluminada e indulgente",
          "Destaque para texturas, frescor e momentos reais",
          "Layouts limpos e sofisticados",
          "Comunicação que une tradição e modernidade",
          "Posts que transmitam experiência (não apenas produto)",
          "Foco em café da manhã, sobremesas, pizzas e refeições em clima aconchegante",
          "Enquadramento clean, iluminação quente, valorização do produto",
          "Artes minimalistas para datas comemorativas e comunicados institucionais",
          "Padronização visual e consistência estética nas redes",
          "Apelo indulgente e encantamento visual"
        ],
        donts: [
          "Layouts poluídos ou com excesso de informação",
          "Fotografias escuras, artificiais ou sem apelo gastronômico",
          "Linguagem promocional exagerada ou agressiva",
          "Uso incorreto do logo, baixa legibilidade ou falta de contraste",
          "Comunicação distante da atmosfera acolhedora e tradicional",
          "Excesso de elementos gráficos que desviem do produto principal",
          "Textos longos demais para redes sociais",
          "Falta de valorização do alimento ou da experiência",
          "Uso de cores fora da paleta",
          "Comunicação genérica sem identidade da marca",
          "Falta de padronização visual entre posts",
          "Layouts com muitos blocos de texto",
          "Artes promocionais visualmente agressivas",
          "Fotos frias, sem profundidade ou pouca apetência visual"
        ]
      },
      criterios_briefing: "PEÇA APROVADA: segue rigorosamente identidade visual (paleta, tipografia, fotografia, composição minimalista), transmite elegância, tradição e conforto visual. AJUSTES COMUNS: redução de excesso de texto, refinamento de CTA, melhor equilíbrio entre imagem e copy, mais destaque pro produto principal, ajuste de tom pra parecer mais acolhedor e menos comercial. Brand book/diretrizes visuais oficiais ainda pendentes — usar referências visuais de boulangeries tradicionais e seguir orientação de tom acolhedor + indulgente."
    }
  },

  // ============================================================
  // PÃO DA PRIMAVERA
  // Fonte: Update estratégico nov/2025 (boulangerie tradicional)
  // (Mesmas diretrizes do Pão do Cambuí — marca-irmã)
  // ============================================================
  pao_primavera: {
    nome: "Pão da Primavera",
    time: "t3",
    guia: {
      posicionamento: "Boulangerie tradicional, acolhedora e completa, parte da rotina e dos bons momentos dos clientes. Mais que padaria: experiência ampliada — café, refeições, pizzaria, confeitaria e momentos especiais. Estratégia: fortalecer posicionamento como boulangerie de tradição e qualidade, ampliar awareness regional, fortalecer reconhecimento institucional, gerar tráfego para as unidades, aumentar consumo recorrente no dia a dia. Valorizar tradição, qualidade, experiência e diversidade de produtos. Posicionar a marca como parte da rotina e dos bons momentos. Incentivar o desejo por meio de conteúdos visuais apetitosos, fortalecendo percepção de credibilidade e permanência.",
      tom_de_voz: "Acolhedor, familiar e inspirador, transmitindo proximidade e sensação de pertencimento. Comunicação calorosa, simples e confiável, evitando excesso de formalidade ou linguagem técnica. Objetivo: fazer o cliente sentir que está sendo convidado para um momento agradável e especial. Nível de formalidade: intermediário — elegante, mas acessível. Estilo: predominância emocional, com apoio racional baseado em tradição, qualidade e confiança. Idioma: Português brasileiro. Palavras preferidas: tradição, sabor, aconchego, qualidade, família, frescor, experiência, pausa, momento, carinho, confiança, variedade. Palavras a evitar: termos frios, promocionais em excesso, linguagem agressiva, linguagem muito informal, comunicação 'apelativa' ou barata. CTAs padrão: 'Passe aqui e aproveite' / 'Venha viver esse momento' / 'Experimente hoje' / 'Seu café, almoço ou jantar te espera'. Descrições devem despertar o apetite e valorizar sensações, texturas, aromas e momentos cotidianos. Escrita transmite simplicidade e desejo, sem exagero comercial.",
      publico_alvo: "Moradores e frequentadores da região (Campinas). Clientes que buscam tradição, qualidade e experiência completa de boulangerie — café da manhã, almoço, jantar, sobremesa. Famílias e clientes recorrentes do dia a dia.",
      paleta_cores: null,
      tipografia: null,
      dos_donts: {
        dos: [
          "Fotografia gastronômica bem iluminada e indulgente",
          "Destaque para texturas, frescor e momentos reais",
          "Layouts limpos e sofisticados",
          "Comunicação que une tradição e modernidade",
          "Posts que transmitam experiência (não apenas produto)",
          "Foco em café da manhã, sobremesas, pizzas e refeições em clima aconchegante",
          "Enquadramento clean, iluminação quente, valorização do produto",
          "Artes minimalistas para datas comemorativas e comunicados institucionais",
          "Padronização visual e consistência estética nas redes",
          "Apelo indulgente e encantamento visual"
        ],
        donts: [
          "Layouts poluídos ou com excesso de informação",
          "Fotografias escuras, artificiais ou sem apelo gastronômico",
          "Linguagem promocional exagerada ou agressiva",
          "Uso incorreto do logo, baixa legibilidade ou falta de contraste",
          "Comunicação distante da atmosfera acolhedora e tradicional",
          "Excesso de elementos gráficos que desviem do produto principal",
          "Textos longos demais para redes sociais",
          "Falta de valorização do alimento ou da experiência",
          "Uso de cores fora da paleta",
          "Comunicação genérica sem identidade da marca",
          "Falta de padronização visual entre posts",
          "Layouts com muitos blocos de texto",
          "Artes promocionais visualmente agressivas",
          "Fotos frias, sem profundidade ou pouca apetência visual"
        ]
      },
      criterios_briefing: "PEÇA APROVADA: segue rigorosamente identidade visual (paleta, tipografia, fotografia, composição minimalista), transmite elegância, tradição e conforto visual. AJUSTES COMUNS: redução de excesso de texto, refinamento de CTA, melhor equilíbrio entre imagem e copy, mais destaque pro produto principal, ajuste de tom pra parecer mais acolhedor e menos comercial. Brand book/diretrizes visuais oficiais ainda pendentes — usar referências visuais de boulangeries tradicionais e seguir orientação de tom acolhedor + indulgente."
    }
  },

  // ============================================================
  // ESPÓSITO (NOVO — pizzaria)
  // Fonte: Update estratégico nov/2025
  // Brand Book/diretrizes visuais ainda em aprovação
  // ============================================================
  esposito: {
    nome: "Espósito",
    time: "t3",
    guia: {
      posicionamento: "Pizzaria artesanal posicionada como referência visual e experiência irresistível. Foco em desejo imediato, qualidade do forno/massa/queijo/ingredientes, atmosfera noturna e social. Estratégia: aumentar awareness e presença digital, criar associação imediata entre desejo, noite e pizza, gerar engajamento (comentários, compartilhamentos, salvamentos), criar conteúdo que provoque reação instantânea ('preciso comer isso'), incentivar marcações entre amigos e casais. Atrair leads pra cardápio/localização/WhatsApp/delivery. Estimular pedidos por impulso, aumentar movimento noturno (semana e fim de semana), transformar conteúdo em gatilho direto de compra. Fortalecer percepção de qualidade (forno, ingredientes, experiência) e construir uma marca visualmente desejada. Ser percebida como pizzaria visualmente irresistível — associada a momentos sociais, encontros e prazer.",
      tom_de_voz: "Direta, visual, provocativa, impactante e curta. Nível de formalidade: informal/cotidiana — conversa natural, linguagem próxima. Estilo: emocional, focado em desejo. Menos explicação, mais sensação. Conteúdo que parece 'quente', imediato e irresistível. Idioma: Português, linguagem simples e popular. Palavras preferidas: derretendo, crocante, saindo do forno, fatia perfeita, quentinha, irresistível, hoje, vem, últimas saídas, explosão de sabor, noite perfeita. Palavras a evitar: técnico demais, gourmet excessivo, formalidade corporativa, textos longos, termos frios ou genéricos. ESTRUTURA DE COPY: (1) Gancho forte → (2) Qualidade → (3) Desejo visual → (4) Sensação → (5) CTA direto. CTAs padrão: 'Vem hoje' / 'Já pediu a sua?' / 'Marque quem vai dividir essa' / 'Corre porque sai rápido' / 'Quem encara essa?' / 'Pede agora' / 'Hoje merece pizza'.",
      publico_alvo: "Público local interessado em pizza artesanal e experiência noturna. Casais, amigos, grupos sociais. Clientela que valoriza qualidade visual do produto e atmosfera. Pessoas com hábito de consumo noturno e por impulso (delivery e presencial).",
      paleta_cores: null,
      tipografia: null,
      dos_donts: {
        dos: [
          "Conteúdo que desperta fome imediata",
          "Conteúdo que mostre preparo e qualidade",
          "Movimento de queijo e vapor",
          "Close em fatia puxando queijo",
          "Ambiente noturno e aconchegante",
          "Sensação de experiência social",
          "Reels com corte da pizza e queijo puxando",
          "Vídeos em câmera lenta saindo do forno",
          "Close na crocância da borda",
          "Conteúdo mostrando pessoas compartilhando pizza",
          "Aumentar contraste e textura",
          "CTA direto e visível",
          "Destacar produto",
          "Legenda direta"
        ],
        donts: [
          "Texto longo",
          "Visual fraco",
          "Pizza sem destaque",
          "Conteúdo sem desejo visual",
          "Foto com elementos que baixam a qualidade do prato",
          "Imagem escura ou sem textura",
          "Conteúdo genérico",
          "Excesso de texto",
          "Falta de close na pizza",
          "Pouca valorização do queijo, corte e forno",
          "Legendas sem impacto",
          "Falta de gatilho de urgência",
          "Foto distante do produto",
          "Texto explicativo demais",
          "Layout poluído",
          "Conteúdo sem atmosfera",
          "Imagem genérica de banco de imagens"
        ]
      },
      criterios_briefing: "REPROVA: texto longo, visual fraco, pizza sem destaque, conteúdo sem desejo visual, foto com elementos que baixam qualidade do prato, imagem escura ou sem textura, conteúdo genérico. ERROS RECORRENTES: excesso de texto, falta de close na pizza, pouca valorização do queijo/corte/forno, legendas sem impacto, falta de gatilho de urgência. AJUSTES COMUNS: aumentar contraste e textura, inserir CTA, destacar mais o produto, tornar legenda mais direta. Brand book oficial em aprovação — usar referências visuais de pizzarias artesanais com forte apelo gastronômico."
    }
  },

  // ============================================================
  // NOU PET CARE (NOVO — pet premium)
  // Fonte: Update estratégico nov/2025
  // Brand book/diretrizes visuais a serem documentadas em material complementar
  // ============================================================
  nou_pet_care: {
    nome: "Nou Pet Care",
    time: "t3",
    guia: {
      posicionamento: "Marca pet premium com nutrição de qualidade, originalidade e cuidado genuíno com os animais. Conceito central: Nutrição + Originalidade + Singularidade. Estratégia: construir percepção de marca moderna, confiável e emocionalmente conectada com famílias e tutores conscientes. Posicionamento como marca pet premium, inovadora e humana. Aumentar reconhecimento no segmento pet care (awareness). Criar identificação emocional com tutores e gerar comunidade (engajamento). Reforçar propósito, valores e diferenciais (institucional). Gerar interesse via conteúdos educativos, lifestyle e confiança (leads e vendas). Mostrar expertise em nutrição e bem-estar animal (autoridade). Comunicação aspiracional, porém acessível, focada em qualidade, afeto, cuidado e responsabilidade socioambiental.",
      tom_de_voz: "Humana, acolhedora e sofisticada, equilibrando emoção e credibilidade. Comunicação transmite proximidade sem parecer excessivamente informal. Tom predominante: elegante e contemporâneo, empático e afetivo, transparente e confiável, inspirador e consciente, premium mas acessível. Nível de formalidade: semi-formal — profissional, porém caloroso. Estilo: predominantemente emocional (priorizando conexão, sensibilidade e identificação com o público), equilibrado com argumentos racionais que reforçam qualidade, confiança e credibilidade. Idioma: Português (com possibilidade de adaptações internacionais — naming/conceito multilíngue). Palavras preferidas: cuidado, bem-estar, qualidade, nutrição, vínculo, família, carinho, confiança, propósito, natural, responsabilidade, transparência. Palavras a evitar: barato, ração comum, 'melhor do mercado' sem prova, termos excessivamente técnicos, comunicação apelativa e sensacionalista. ESTRUTURA DE COPY: (1) Gancho emocional ou insight do tutor → (2) Benefício funcional ou diferencial → (3) Conexão com cuidado e propósito → (4) CTA suave. CTAs padrão: 'Conheça mais' / 'Descubra a diferença' / 'Cuide com propósito' / 'Saiba mais' / 'Faça parte desse cuidado'. Valoriza transparência, simplicidade e proximidade — alimentação pet vai além do produto: é extensão do cuidado familiar.",
      publico_alvo: "Tutores e famílias conscientes que valorizam nutrição premium, qualidade e cuidado genuíno com pets. Público de poder aquisitivo médio-alto, sofisticado, que busca diferenciação no segmento pet care e está disposto a investir em produtos premium. Pessoas que enxergam o pet como parte da família.",
      paleta_cores: null,
      tipografia: null,
      dos_donts: {
        dos: [
          "Layout minimalista",
          "Uso inteligente de espaços vazios",
          "Paleta neutra e elegante",
          "Conteúdo que pareça editorial e premium",
          "Fotos autênticas e afetivas",
          "Narrativas que conectem propósito e rotina pet",
          "Conteúdo institucional com storytelling",
          "Bastidores da marca e propósito",
          "Educação sobre nutrição pet",
          "Lifestyle pet com estética premium",
          "Conteúdo que transmite confiança e acolhimento",
          "Simplificar mensagens",
          "Tornar texto mais humano",
          "Aproximar comunicação da relação tutor + pet",
          "Reforçar identidade visual limpa"
        ],
        donts: [
          "Comunicação excessivamente promocional",
          "Visual poluído ou com excesso de informação",
          "Linguagem muito comercial/agressiva",
          "Uso de termos genéricos sem alinhamento ao propósito",
          "Falta de sofisticação visual",
          "Imagens que não transmitam cuidado, premium ou bem-estar",
          "Copy muito técnica ou fria",
          "Excesso de texto sem emoção",
          "Falta de conexão com pets e tutores",
          "Comunicação que parece varejo comum",
          "Uso inadequado do logo e variações fora do manual",
          "Posts muito 'varejão'",
          "Artes com excesso de elementos gráficos",
          "Linguagem apelativa de venda",
          "Comunicação genérica sem personalidade"
        ]
      },
      criterios_briefing: "PEÇA APROVADA: comunicação aspiracional e acessível, sofisticada visualmente, com conexão emocional autêntica entre tutor e pet, valores de responsabilidade/ética/respeito/competência/proximidade emocional refletidos tanto na estética quanto no discurso. REPROVA: comunicação excessivamente promocional, visual poluído, linguagem comercial/agressiva, falta de sofisticação visual, imagens que não transmitam cuidado/premium/bem-estar. AJUSTES COMUNS: simplificar mensagens, tornar texto mais humano, aproximar comunicação da relação tutor + pet, reforçar identidade visual limpa. Brand book oficial pendente — usar referências de marcas pet premium internacionais com estética editorial."
    }
  },

  // ============================================================
  // BAPTISTELA
  // Fonte: Update estratégico nov/2025
  // (Brand Book atualizado em aprovação)
  // ============================================================
  baptistela: {
    nome: "Baptistela",
    time: "t3",
    guia: {
      posicionamento: "Marca posicionada com autoridade, sofisticação e clareza estratégica. Personalidade: estratégica, próxima, confiável, atual, clara e segura. Comunica com intenção, gera autoridade e transmite domínio sem apelar. Estratégia (em ordem de prioridade): (1) AWARENESS — ampliar reconhecimento e alcance; (2) POSICIONAMENTO — reforçar diferenciais e percepção de valor; (3) ENGAJAMENTO — interação, compartilhamento, comunidade; (4) TRÁFEGO — direcionar pro site; (5) LEADS — captar contatos qualificados; (6) CONVERSÃO/VENDAS — transformar interesse em oportunidade comercial; (7) INSTITUCIONAL — fortalecer credibilidade e reputação. Conteúdo precisa equilibrar construção de autoridade, relacionamento e conversão.",
      tom_de_voz: "Comunicação humana, objetiva e inteligente. Fala com autoridade, mas sem parecer distante. Explica de forma simples, transmite confiança e evita exageros. Linguagem sofisticada, mas acessível. Não utiliza exageros, promessas apelativas ou excesso de persuasão. Conduz percepção, gera autoridade e transmite domínio. Nível de formalidade: semi-formal — profissional acessível, linguagem clara e contemporânea. Estilo: racional (clareza, benefícios, solução) + emocional (conexão, desejo, identificação). REGRAS DE COPYWRITING: priorizar benefício antes da característica, frases curtas e escaneáveis, headline forte logo no início, evitar blocos longos de texto, sempre responder 'por que isso importa para o cliente?', utilizar gatilhos com moderação (autoridade, prova, urgência leve). Palavras preferidas: estratégia, resultado, transformação, experiência, crescimento, exclusivo, solução, posicionamento, qualidade. Palavras evitadas/proibidas: barato, imperdível, corre, garantido, milagre, urgente. CTAs padrão: 'Saiba mais' / 'Descubra como' / 'Fale com a equipe' / 'Solicite um orçamento' / 'Conheça a solução' / 'Entre em contato'.",
      publico_alvo: "Decisores e tomadores de decisão que valorizam estratégia, posicionamento e percepção de valor. Público que busca soluções premium e diferenciadas, com repertório e exigência por sofisticação visual e textual.",
      paleta_cores: null,
      tipografia: null,
      dos_donts: {
        dos: [
          "Visual minimalista",
          "Comunicação estratégica",
          "Estética editorial",
          "Linguagem refinada",
          "Clareza e intenção",
          "Sofisticação sem exagero",
          "Possuir intenção estratégica clara",
          "Manter estética clean e organizada",
          "Coerência entre design, copy e posicionamento",
          "Comunicação que gera percepção de valor",
          "Conteúdo que parece editorial",
          "Transmite os valores da marca",
          "Reduzir texto",
          "Simplificar composição visual",
          "Headlines fortes",
          "Melhor respiro visual",
          "Refinar escolha de palavras",
          "Mensagem mais inteligente e menos promocional"
        ],
        donts: [
          "Comunicação genérica",
          "Excesso de informação",
          "Design poluído",
          "Copy apelativa ou agressiva",
          "Falta de hierarquia visual",
          "Linguagem comum ou clichê",
          "Excesso de emojis ou informalidade",
          "Falar demais sobre serviço e pouco sobre percepção",
          "Vender antes de construir contexto",
          "Textos longos sem ritmo",
          "Artes com excesso de elementos",
          "Headline fraca ou previsível",
          "Comunicação sem direção estética",
          "Improvisação ou aparência excessivamente comercial"
        ]
      },
      criterios_briefing: "PADRÃO BAPTISTELA: comunicação deve transmitir repertório, posicionamento e controle estético. Peça precisa parecer construída ESTRATEGICAMENTE, nunca improvisada ou excessivamente comercial. PEÇA APROVADA: intenção estratégica clara, sofisticação visual e textual, estética clean e organizada, mensagem clara sem ser óbvia, coerência entre design/copy/posicionamento, percepção de valor, conteúdo que parece editorial, valores da marca presentes. REPROVA: comunicação genérica, excesso de informação, design poluído, copy apelativa/agressiva, falta de hierarquia visual, linguagem comum/clichê, excesso de emojis ou informalidade. ERROS RECORRENTES: falar demais do serviço e pouco sobre percepção, vender antes de construir contexto, textos longos sem ritmo, artes com excesso de elementos, headline fraca/previsível, comunicação sem direção estética. AJUSTES COMUNS: reduzir texto, simplificar composição visual, headline mais forte, melhorar respiro visual, refinar escolha de palavras, deixar mensagem mais inteligente e menos promocional. Brand book atualizado em aprovação."
    }
  },

  // ============================================================
  // GAMER HUT
  // Fonte: Update estratégico nov/2025 (mídia física gamer)
  // ============================================================
  gamerhut: {
    nome: "Gamer Hut",
    time: "t3",
    guia: {
      posicionamento: "Referência em mídia física gamer (jogos físicos, edições especiais, lançamentos, reposições). Posicionada como o lugar ideal para garantir jogos antes que acabem — destaque para novidade, exclusividade e disponibilidade imediata. Estratégia: aumentar awareness da marca, gerar desejo imediato pelos produtos, impulsionar vendas diretas, reforçar autoridade no nicho gamer, criar senso de urgência e escassez.",
      tom_de_voz: "Direta, atual e envolvente, transmitindo energia, urgência e autoridade no universo gamer. Gírias do universo Gamer são bem-vindas (sem nada polêmico ou problemático). Comunicação rápida, clara e impactante, evitando excesso de formalidade ou explicações longas. Objetivo: fazer o cliente sentir que precisa agir AGORA. Texto na arte: curto e direto. CTA visível na arte e reforçado na legenda. Idioma: Português, com gírias gamer apropriadas.",
      publico_alvo: "Gamers e entusiastas de mídia física (colecionadores, jogadores que valorizam edições especiais, fãs de lançamentos). Público engajado no nicho gamer, atento a novidades e reposições, com hábito de compra por impulso quando há senso de urgência ou exclusividade.",
      paleta_cores: null,
      tipografia: null,
      dos_donts: {
        dos: [
          "Layout limpo, com hierarquia clara e destaque para a mídia física",
          "Capas de jogos em evidência",
          "Mão segurando produto (humanização)",
          "Fundos temáticos relacionados ao jogo",
          "Iluminação que valorize o produto",
          "Usar logos em conjunto",
          "Estética impactante, alto contraste, foco total no produto",
          "Texto na arte curto e direto",
          "CTA visível na arte e reforçado na legenda",
          "Hashtags relevantes do nicho",
          "Gírias gamer (sem polêmica)",
          "Senso de urgência e escassez na comunicação"
        ],
        donts: [
          "Layout poluído ou com excesso de informação",
          "Falta de destaque para o produto",
          "Comunicação genérica ou sem identidade gamer",
          "Texto longo ou pouco objetivo",
          "Falta de CTA claro",
          "Baixo impacto visual",
          "Copy extensa para redes sociais",
          "Falta de urgência na comunicação",
          "Artes sem hierarquia visual",
          "Comunicação pouco atrativa",
          "Excesso de elementos visuais que distraem do produto principal",
          "Poluição visual",
          "Excesso de formalidade"
        ]
      },
      criterios_briefing: "TÉCNICO POR CANAL: Feed 1080x1350. Stories 1080x1920. Reels — depende do tipo (roteirizados até 3min, com mínimo permitido pra alcance do Instagram). PEÇA APROVADA: segue identidade visual da marca, foco total no produto, comunicação direta. REPROVA: layout poluído, falta de destaque pro produto, comunicação genérica/sem identidade gamer, texto longo, falta de CTA claro, baixo impacto visual. ERROS RECORRENTES: copy extensa, falta de urgência, artes sem hierarquia visual, comunicação pouco atrativa."
    }
  },

  // ============================================================
  // SLOTS VAZIOS — guides ainda não fornecidos
  // ============================================================

  junior:        { nome: "Junior",            time: "t12", guia: null }

};

/**
 * Transforma um objeto de guia de marca num bloco de texto
 * pra ser injetado no system prompt do agente.
 * Ignora campos null. Se `guia === null`, retorna null.
 */
function guiaParaTexto(guia) {
  if (!guia) return null;

  const linhas = [];
  linhas.push("=== GUIA DE MARCA DO CLIENTE ===");

  if (guia.posicionamento) {
    linhas.push("\n## POSICIONAMENTO\n" + guia.posicionamento);
  }
  if (guia.tom_de_voz) {
    linhas.push("\n## TOM DE VOZ\n" + guia.tom_de_voz);
  }
  if (guia.publico_alvo) {
    linhas.push("\n## PÚBLICO-ALVO\n" + guia.publico_alvo);
  }
  if (Array.isArray(guia.paleta_cores) && guia.paleta_cores.length) {
    linhas.push("\n## PALETA DE CORES");
    guia.paleta_cores.forEach(c => {
      linhas.push(`- ${c.hex} (${c.nome}) — ${c.uso || ""}`);
    });
  }
  if (guia.tipografia) {
    linhas.push("\n## TIPOGRAFIA");
    if (guia.tipografia.principal) linhas.push("Principal: " + guia.tipografia.principal);
    if (guia.tipografia.secundaria) linhas.push("Secundária: " + guia.tipografia.secundaria);
  }
  if (guia.dos_donts) {
    if (Array.isArray(guia.dos_donts.dos) && guia.dos_donts.dos.length) {
      linhas.push("\n## DO'S (FAZER)");
      guia.dos_donts.dos.forEach(i => linhas.push("- " + i));
    }
    if (Array.isArray(guia.dos_donts.donts) && guia.dos_donts.donts.length) {
      linhas.push("\n## DON'TS (NÃO FAZER)");
      guia.dos_donts.donts.forEach(i => linhas.push("- " + i));
    }
  }
  if (guia.criterios_briefing) {
    linhas.push("\n## CRITÉRIOS ESPECÍFICOS DE BRIEFING\n" + guia.criterios_briefing);
  }

  return linhas.join("\n");
}

// Exporta globalmente
window.CLIENTES = CLIENTES;
window.guiaParaTexto = guiaParaTexto;
