import { Save, Check, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import usePlannerStore from '@/stores/usePlannerStore'
import { cn } from '@/lib/utils'

export default function Planner() {
  const { projectData, setProjectData, checklist, toggleChecklistItem, progress } =
    usePlannerStore()
  const { toast } = useToast()

  const handleSave = () => {
    // Logic is already auto-saved in context via useEffect,
    // this button is mostly for UX satisfaction.
    toast({
      title: 'Projeto salvo com sucesso!',
      description: 'Seus dados foram salvos no seu navegador.',
      variant: 'default',
    })
  }

  // Group checklist by phases
  const phases = [1, 2, 3, 4, 5]

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Meu Plano de Ação</h1>
          <p className="text-muted-foreground">
            Documente sua ideia e acompanhe seu progresso prático.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Project Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes do Projeto</CardTitle>
              <CardDescription>Defina a base da sua ideia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto (Provisório)</Label>
                <Input
                  id="name"
                  placeholder="Ex: AutoVet"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Público Alvo</Label>
                <Input
                  id="audience"
                  placeholder="Ex: Clínicas Veterinárias Pequenas"
                  value={projectData.audience}
                  onChange={(e) => setProjectData({ audience: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="problem">Problema Principal que Resolve</Label>
                <Textarea
                  id="problem"
                  placeholder="Descreva a dor que você vai curar..."
                  className="min-h-[120px] resize-none"
                  value={projectData.problem}
                  onChange={(e) => setProjectData({ problem: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2 text-primary">
                <ClipboardList className="w-5 h-5" /> Status Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-medium">Jornada Completada</span>
                <span className="text-2xl font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Checklist de Execução</CardTitle>
              <CardDescription>Marque as tarefas conforme avança no seu SaaS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {phases.map((phaseNum) => {
                  const phaseItems = checklist.filter((item) => item.phase === phaseNum)
                  if (phaseItems.length === 0) return null

                  const isAllCompleted = phaseItems.every((i) => i.completed)

                  return (
                    <div key={phaseNum} className="space-y-3">
                      <h3
                        className={cn(
                          'text-sm font-bold uppercase tracking-wider flex items-center gap-2',
                          isAllCompleted ? 'text-emerald-500' : 'text-muted-foreground',
                        )}
                      >
                        {isAllCompleted && <Check className="w-4 h-4" />}
                        Fase {phaseNum}
                      </h3>
                      <div className="space-y-2">
                        {phaseItems.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              'flex items-start gap-3 p-3 rounded-md border transition-colors hover:bg-muted/50',
                              item.completed ? 'bg-muted/30 border-transparent' : 'bg-card',
                            )}
                          >
                            <Checkbox
                              id={item.id}
                              checked={item.completed}
                              onCheckedChange={() => toggleChecklistItem(item.id)}
                              className="mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                            <Label
                              htmlFor={item.id}
                              className={cn(
                                'text-sm font-medium leading-tight cursor-pointer',
                                item.completed && 'line-through text-muted-foreground',
                              )}
                            >
                              {item.text}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
