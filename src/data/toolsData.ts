export type ToolCategory = 'Desenvolvimento' | 'Pagamentos' | 'Design' | 'Marketing' | 'No-Code'

export interface Tool {
  id: string
  name: string
  category: ToolCategory
  description: string
  freeTier: boolean
  url: string
  logoUrl: string
}

export const toolsData: Tool[] = [
  {
    id: '1',
    name: 'Supabase',
    category: 'Desenvolvimento',
    description:
      'A alternativa Open Source ao Firebase. Banco de dados Postgres, Autenticação e Storage em minutos.',
    freeTier: true,
    url: 'https://supabase.com',
    logoUrl: 'https://img.usecurling.com/i?q=database&shape=fill&color=green',
  },
  {
    id: '2',
    name: 'Vercel',
    category: 'Desenvolvimento',
    description:
      'Plataforma de deploy focada em performance e experiência do desenvolvedor. Ideal para React/Next.js.',
    freeTier: true,
    url: 'https://vercel.com',
    logoUrl: 'https://img.usecurling.com/i?q=triangle&shape=fill&color=white',
  },
  {
    id: '3',
    name: 'Stripe',
    category: 'Pagamentos',
    description:
      'A infraestrutura de pagamentos mais robusta para negócios na internet. APIs incríveis para assinaturas.',
    freeTier: false,
    url: 'https://stripe.com',
    logoUrl: 'https://img.usecurling.com/i?q=credit-card&shape=fill&color=violet',
  },
  {
    id: '4',
    name: 'Figma',
    category: 'Design',
    description:
      'Ferramenta de design colaborativo líder de mercado. Essencial para criar wireframes e protótipos rápidos.',
    freeTier: true,
    url: 'https://figma.com',
    logoUrl: 'https://img.usecurling.com/i?q=pen-tool&shape=outline&color=multicolor',
  },
  {
    id: '5',
    name: 'Resend',
    category: 'Marketing',
    description:
      'API de e-mail feita para desenvolvedores. Simples, moderna e com excelente taxa de entrega.',
    freeTier: true,
    url: 'https://resend.com',
    logoUrl: 'https://img.usecurling.com/i?q=mail&shape=outline&color=white',
  },
  {
    id: '6',
    name: 'Bubble',
    category: 'No-Code',
    description:
      'Crie aplicações web completas sem escrever código. Excelente para validar MVPs complexos rapidamente.',
    freeTier: true,
    url: 'https://bubble.io',
    logoUrl: 'https://img.usecurling.com/i?q=grid&shape=fill&color=blue',
  },
  {
    id: '7',
    name: 'Shadcn UI',
    category: 'Desenvolvimento',
    description:
      'Componentes lindamente desenhados que você pode copiar e colar nos seus apps. Acessíveis e customizáveis.',
    freeTier: true,
    url: 'https://ui.shadcn.com',
    logoUrl: 'https://img.usecurling.com/i?q=code&shape=outline&color=white',
  },
  {
    id: '8',
    name: 'PostHog',
    category: 'Marketing',
    description:
      'Plataforma open-source de product analytics, gravação de sessão, feature flags e testes A/B.',
    freeTier: true,
    url: 'https://posthog.com',
    logoUrl: 'https://img.usecurling.com/i?q=chart-pie&shape=fill&color=orange',
  },
]
