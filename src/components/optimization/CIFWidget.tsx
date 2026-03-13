import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import useProcurementStore from '@/stores/useProcurementStore'
import { Truck, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function CIFWidget() {
  const { suppliers, supplierItems, matchedNeeds } = useProcurementStore()

  const supplierTotals = suppliers
    .map((s) => {
      const total = matchedNeeds.reduce((sum, match) => {
        const item = supplierItems.find((i) => i.id === match.selectedItemId)
        if (item && item.supplierId === s.id) {
          return sum + match.suggestedQuantity * item.price
        }
        return sum
      }, 0)
      return { ...s, total }
    })
    .filter((s) => s.total > 0)

  if (supplierTotals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum fornecedor selecionado nas compras.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {supplierTotals.map((s) => {
        const pct = Math.min(100, (s.total / s.cifThreshold) * 100)
        const reached = pct >= 100
        return (
          <Card
            key={s.id}
            className={
              reached ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/30'
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4" /> {s.name}
                </span>
                {reached ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>${s.total.toFixed(2)}</span>
                <span className="text-muted-foreground">Meta: ${s.cifThreshold}</span>
              </div>
              <Progress
                value={pct}
                className="h-2 bg-black/5"
                indicatorClassName={reached ? 'bg-emerald-500' : 'bg-amber-500'}
              />
              <p className="text-[10px] mt-2 text-muted-foreground text-right">
                {reached
                  ? 'Frete CIF Garantido'
                  : `Faltam $${(s.cifThreshold - s.total).toFixed(2)} para CIF`}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
