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
  // KORA
  // Fonte: KORA Manual de Marca (foco visual — sem tom de voz explícito)
  // ============================================================
  kora: {
    nome: "Kora",
    time: "t3",
    guia: {
      posicionamento: "Kora Natural — pet food natural. 'Kora vem de coração. Da essência. Do que é verdadeiramente importante.' Nutrição de verdade, ingredientes selecionados, promessa de uma vida mais saudável e feliz para o pet. Celebração de aventuras, contato com a natureza, brincadeiras e 'lambeijos'.",
      tom_de_voz: null,
      publico_alvo: "Tutores de pets que valorizam alimentação natural e ingredientes selecionados. Pessoas ativas, aventureiras, que passeiam com seus pets ao ar livre.",
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
          "Pets sempre em momentos alegres e felizes nas imagens",
          "Temperatura de cor iluminada e confortável nas fotos",
          "Elementos gráficos criados a partir dos laços do coração (logotipo)"
        ],
        donts: null
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // PURAVIE
  // Fonte: PURAVIE Manual de Marca (foco visual)
  // ============================================================
  puravie: {
    nome: "Puravie",
    time: "t3",
    guia: {
      posicionamento: null,
      tom_de_voz: null,
      publico_alvo: "Tutores de pets (cães e gatos). A marca diferencia comunicação por espécie através de cor: vermelho para cães, azul para gatos.",
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
          "Sempre preferir aplicação principal do logotipo (colorido)"
        ],
        donts: [
          "Não aplicar logo em cores diferentes das oficiais",
          "Não aplicar logo em fundos que comprometam a legibilidade",
          "Não rotacionar o logo ou colocá-lo em posição que prejudique a leitura",
          "Não alterar a aplicação das versões do logotipo com assinatura (Premium Especial, Vitalidade Premium Especial)"
        ]
      },
      criterios_briefing: null
    }
  },

  // ============================================================
  // EMPÓRIO DO NONO
  // Fonte: Manual de Marca Empório do Nono
  // ============================================================
  emporio_nono: {
    nome: "Empório do Nono",
    time: "t3",
    guia: {
      posicionamento: "Restaurante e bar clássico em Barão Geraldo, fundado em 1999 por Junior Pattaro. Lugar familiar com atmosfera acolhedora que faz cada cliente se sentir em casa. Pilar da comunidade local, referência em experiência gastronômica autêntica, com insumos de primeira qualidade e equipe dedicada (parte da história do restaurante há muitos anos). Lugar de celebração, com a tradicional Noite do Chorinho às segundas. Missão: oferecer experiência gastronômica única com ingredientes de alta qualidade e atendimento caloroso, refletindo tradição e hospitalidade de um restaurante familiar. Visão: ser lugar onde as pessoas se sintam em casa e apreciem pratos saborosos e autênticos da cozinha clássica, sempre com um toque de excelência. Valores: Qualidade, Tradição, Família, Dedicação, Hospedagem.",
      tom_de_voz: null,
      publico_alvo: "Moradores e frequentadores de Barão Geraldo (Campinas/SP). Famílias, grupos de amigos, apreciadores de cozinha clássica e música ao vivo (chorinho). Clientela que valoriza tradição, ambiente acolhedor e experiência gastronômica autêntica.",
      paleta_cores: [
        { hex: "#1E1D1D", nome: "Preto primário", uso: "Cor principal" },
        { hex: "#FAAE00", nome: "Amarelo/Dourado primário", uso: "Cor principal de destaque" },
        { hex: "#FFFCF8", nome: "Off-white", uso: "Secundária — fundo claro" }
      ],
      tipografia: null,
      dos_donts: null,
      criterios_briefing: null
    }
  },
  // ============================================================
  // SLOTS VAZIOS — guides ainda não fornecidos
  // ============================================================

  junior:        { nome: "Junior",            time: "t12", guia: null },
  pao_cambui:    { nome: "Pão do Cambuí",     time: "t3",  guia: null },
  pao_primavera: { nome: "Pão da Primavera",  time: "t3",  guia: null },
  baptistela:    { nome: "Baptistela",        time: "t3",  guia: null },
  gamerhut:      { nome: "Gamer Hut",         time: "t3",  guia: null }

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
