export const roadmapData = [
  {
    phase: 1,
    title: 'Ideação e Problema',
    description: 'Encontre uma dor real que as pessoas estão dispostas a pagar para resolver.',
    content: [
      '**Foque no problema, não na solução:** Muitos fundadores constroem algo legal que ninguém precisa. Comece perguntando: "Qual processo manual chato meu público odeia fazer?"',
      '**Escolha um nicho específico:** "Software para empresas" é muito amplo. "Software de gestão de estoque para clínicas veterinárias de pequeno porte" é um excelente começo.',
      '**A Regra da Vitamina vs. Analgésico:** Seu SaaS deve ser um analgésico (resolve uma dor aguda e imediata) e não uma vitamina (algo bom de ter, mas não essencial).',
    ],
    proTip:
      'Use o Reddit, grupos do Facebook e ReclameAqui para minerar reclamações e encontrar problemas reais que as pessoas já estão tentando resolver com planilhas.',
  },
  {
    phase: 2,
    title: 'Validação de Mercado',
    description: 'Descubra se as pessoas comprariam antes de escrever a primeira linha de código.',
    content: [
      '**O Teste do Mom Test:** Ao falar com clientes, não pergunte "Você usaria isso?". Pergunte "Como você resolve esse problema hoje?" e "Quanto você gastou tentando resolver isso?".',
      '**Landing Page de Pré-venda:** Crie uma página simples explicando o benefício principal e coloque um formulário de e-mail ou botão de pagamento (com desconto de early bird).',
      '**Falso Positivo:** Likes e "ideia legal" não são validação. Validação real é cartão de crédito passado, tempo comprometido ou carta de intenção assinada.',
    ],
    proTip:
      'Se você não consegue vender a ideia em uma landing page simples ou em uma ligação de 15 minutos, o produto não vai se vender sozinho quando estiver pronto.',
  },
  {
    phase: 3,
    title: 'O MVP (Mínimo Produto Viável)',
    description: 'Construa apenas o núcleo essencial que resolve o problema de forma funcional.',
    content: [
      '**Corte sem dó:** Se uma funcionalidade não é estritamente necessária para entregar o valor principal, deixe para a versão 2.0.',
      '**Design não é tudo no início:** Um produto feio que resolve uma dor gigante será usado. Um produto lindo que não serve para nada será abandonado. Foque na utilidade.',
      '**Onboarding manual:** No começo, você não precisa de um sistema complexo de onboarding automatizado. Ligue para seus primeiros 10 clientes e configure as contas deles pessoalmente.',
    ],
    proTip:
      'Se você não tem vergonha da primeira versão do seu produto, você demorou demais para lançar (Reid Hoffman).',
  },
  {
    phase: 4,
    title: 'Modelo de Negócio',
    description: 'Defina como você vai cobrar pelo valor gerado.',
    content: [
      '**Cobre mais do que você acha justo:** Desenvolvedores tendem a subprecificar. Se o seu SaaS economiza 10 horas semanais de um profissional que ganha R$ 50/hora, cobrar R$ 200/mês é muito barato.',
      '**Evite o Freemium no início:** O Freemium exige volume massivo para dar certo. Prefira um modelo de Trial (teste grátis de 7-14 dias) e planos pagos desde o dia zero.',
      '**Planos em Tiers:** Tenha 3 opções de preço. A maioria escolherá a do meio se você ancorar a mais cara corretamente.',
    ],
    proTip:
      'Cobre anualmente oferecendo 2 meses de desconto. Isso injeta caixa no início do projeto e reduz a taxa de cancelamento (churn).',
  },
  {
    phase: 5,
    title: 'Tech Stack e Lançamento',
    description: 'Escolha suas ferramentas e coloque o projeto no mundo.',
    content: [
      '**Use o que você domina:** A melhor stack é aquela que você já sabe usar. Não aprenda uma linguagem nova só porque está na moda se o objetivo é validar um negócio rápido.',
      '**Não reinvente a roda:** Use ferramentas prontas para autenticação, pagamentos e envio de e-mails. Focar em construir um sistema de login próprio não agrega valor ao seu cliente.',
      '**O lançamento não é um evento único:** Se lançar e ninguém aparecer, tudo bem. O verdadeiro lançamento é um processo contínuo de marketing e vendas dia após dia.',
    ],
    proTip:
      'Integre o Stripe ou Pagar.me desde o dia 1 usando ferramentas no-code ou bibliotecas prontas. Não perca meses integrando bancos convencionais.',
  },
]
