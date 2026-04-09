import { LineChart } from 'lucide-react'
import CIFWidget from '@/components/optimization/CIFWidget'
import DecisionTable from '@/components/optimization/DecisionTable'
import useProcurementStore from '@/stores/useProcurementStore'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function OptimizationPage() {
  const { matchedNeeds } = useProcurementStore()

  const hasConfirmed = matchedNeeds.some((m) => m.confirmed)

  if (matchedNeeds.length === 0 || !hasConfirmed) {
    return (
      <div className="text-center mt-20">
        <p>Realize e confirme o mapeamento de produtos primeiro.</p>
        <Button asChild className="mt-4">
          <Link to="/matching">Ir para Mapeamento</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <LineChart className="w-8 h-8 text-primary" /> Motor de Otimização
        </h1>
        <p className="text-muted-foreground">
          Análise combinada de Frete CIF, Validade e Custo de Oportunidade para decisões assertivas.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Status de Frete CIF por Fornecedor</h2>
        <CIFWidget />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recomendações e Painel de Decisão</h2>
        <DecisionTable />
      </div>
    </div>
  )
}
