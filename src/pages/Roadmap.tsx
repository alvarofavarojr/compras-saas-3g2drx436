import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Lightbulb } from 'lucide-react'
import { roadmapData } from '@/data/roadmapData'
import usePlannerStore from '@/stores/usePlannerStore'

export default function Roadmap() {
  const { checklist } = usePlannerStore()

  // Function to determine if a phase is fully completed based on the checklist
  const isPhaseCompleted = (phaseNum: number) => {
    const phaseItems = checklist.filter((item) => item.phase === phaseNum)
    if (phaseItems.length === 0) return false
    return phaseItems.every((item) => item.completed)
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-3">O Roteiro Definitivo</h1>
        <p className="text-muted-foreground text-lg">
          Siga este passo a passo para construir e lançar seu SaaS com segurança e estratégia.
        </p>
      </div>

      <Accordion type="single" collapsible defaultValue="phase-1" className="space-y-4">
        {roadmapData.map((phase) => {
          const completed = isPhaseCompleted(phase.phase)
          return (
            <AccordionItem
              key={phase.phase}
              value={`phase-${phase.phase}`}
              className="border border-border/50 rounded-lg bg-card/30 overflow-hidden"
            >
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-secondary/50 transition-all [&[data-state=open]]:bg-secondary/30">
                <div className="flex items-center gap-4 text-left">
                  <div className="shrink-0">
                    {completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={completed ? 'default' : 'secondary'}
                        className={completed ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                      >
                        Fase {phase.phase}
                      </Badge>
                      <h3 className="font-semibold text-lg">{phase.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground font-normal line-clamp-1">
                      {phase.description}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="pl-10 space-y-6">
                  <ul className="space-y-4">
                    {phase.content.map((item, idx) => {
                      // Simple regex to parse bold text like **bold**
                      const parts = item.split(/(\*\*.*?\*\*)/g)
                      return (
                        <li key={idx} className="flex gap-3 text-foreground/90 leading-relaxed">
                          <span className="text-primary mt-1 shrink-0">•</span>
                          <span>
                            {parts.map((part, i) =>
                              part.startsWith('**') && part.endsWith('**') ? (
                                <strong key={i} className="font-semibold text-foreground">
                                  {part.slice(2, -2)}
                                </strong>
                              ) : (
                                part
                              ),
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex gap-4 items-start">
                      <Lightbulb className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-amber-500 mb-1">Dica Pro</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {phase.proTip}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
