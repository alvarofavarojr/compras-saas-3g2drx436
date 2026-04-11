import { LineChart as LineChartIcon, History } from 'lucide-react'
import DecisionMatrix from '@/components/optimization/DecisionTable'
import PriceHistoryChart from '@/components/optimization/PriceHistoryChart'
import useProcurementStore from '@/stores/useProcurementStore'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function OptimizationPage() {
  const { matchedNeeds } = useProcurementStore()

  const hasConfirmed = matchedNeeds.some((m) => m.confirmed)

  if (matchedNeeds.length === 0 || !hasConfirmed) {
    return (
      <div className="text-center mt-20">
        <p className="text-muted-foreground text-lg">
          Realize e confirme o mapeamento de produtos primeiro.
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link to="/matching">Ir para Mapeamento IA</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in-up pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          Motor de Inteligência
        </h1>
        <p className="text-muted-foreground">
          Matriz de decisão estratégica considerando Custo SELIC, Validade e Descontos de Volume.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <LineChartIcon className="w-5 h-5 text-primary" /> Matriz de Comparação de Cotações
        </h2>
        <DecisionMatrix />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> Histórico e Tendências de Preço
        </h2>
        <PriceHistoryChart />
      </div>
    </div>
  )
}
