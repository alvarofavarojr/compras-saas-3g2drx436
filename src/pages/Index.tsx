import { Link } from 'react-router-dom'
import { Rocket, Target, Code2, LineChart, Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import usePlannerStore from '@/stores/usePlannerStore'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export default function Index() {
  const { progress } = usePlannerStore()

  const pillars = [
    {
      icon: Target,
      title: 'Validação',
      desc: 'Encontre um problema real e confirme que as pessoas pagariam por ele.',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      icon: Lightbulb,
      title: 'Planejamento',
      desc: 'Defina o MVP cortando tudo que não é essencial para a dor principal.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Code2,
      title: 'Desenvolvimento',
      desc: 'Escolha a stack certa e lance rápido, sem reinventar a roda.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: LineChart,
      title: 'Crescimento',
      desc: 'Defina preços, capte feedback e escale o marketing gradualmente.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="animate-fade-in-up space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Rocket className="w-4 h-4" />
          <span>O guia definitivo para o seu primeiro SaaS</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          SaaS Blueprint:{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            De Zero ao Primeiro Cliente
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          O caminho para um software bem-sucedido não é apenas sobre escrever código perfeito. É
          sobre validar problemas reais, planejar estrategicamente e lançar rápido.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <Link to="/roteiro">
              Começar a Jornada <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
            <Link to="/ferramentas">Explorar Ferramentas</Link>
          </Button>
        </div>
      </section>

      {/* Progress Preview Widget */}
      <section className="max-w-md mx-auto">
        <Card className="border-primary/20 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Progresso do seu Plano
              </h3>
              <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            <div className="text-center">
              <Link to="/plano" className="text-sm text-primary hover:underline font-medium">
                {progress === 0
                  ? 'Comece a preencher seu plano agora →'
                  : 'Continue o bom trabalho →'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pillars Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Os 4 Pilares da Construção</h2>
          <p className="text-muted-foreground mt-2">
            Um framework testado para minimizar riscos e maximizar resultados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <Card key={idx} className="group hover:border-primary/50 transition-colors bg-card/40">
              <CardContent className="p-6 space-y-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110',
                    pillar.bg,
                    pillar.color,
                  )}
                >
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
