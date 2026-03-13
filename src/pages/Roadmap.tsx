import { roadmapData } from '@/data/roadmapData'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Map, CheckCircle2, Lightbulb, TrendingUp, Zap, Briefcase, Code } from 'lucide-react'

const icons = [Lightbulb, TrendingUp, Zap, Briefcase, Code]

export default function RoadmapPage() {
  const renderContent = (text: string) => {
    const parts = text.split('**')
    return (
      <>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="text-foreground">
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <Map className="w-8 h-8 text-primary" /> Roteiro de Construção
        </h1>
        <p className="text-muted-foreground">
          Guia passo a passo com as 5 fases essenciais para construir e lançar o seu SaaS com
          sucesso.
        </p>
      </div>

      <div className="relative border-l border-border ml-4 md:ml-8 space-y-8 pb-8">
        {roadmapData.map((phase, index) => {
          const Icon = icons[index % icons.length]
          return (
            <div key={phase.phase} className="relative pl-8 md:pl-12">
              <div className="absolute -left-5 top-1 bg-background border-2 border-primary rounded-full p-2">
                <Icon className="w-5 h-5 text-primary" />
              </div>

              <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/30 bg-primary/5"
                    >
                      Fase {phase.phase}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{phase.title}</CardTitle>
                  <CardDescription className="text-base font-medium text-foreground/80">
                    {phase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {phase.content.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {renderContent(item)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {phase.proTip && (
                    <div className="mt-4 bg-secondary/50 rounded-lg p-3 text-sm border border-border/50">
                      <strong className="text-foreground flex items-center gap-1 mb-1">
                        💡 Dica Pro
                      </strong>
                      <p className="text-muted-foreground">{phase.proTip}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
