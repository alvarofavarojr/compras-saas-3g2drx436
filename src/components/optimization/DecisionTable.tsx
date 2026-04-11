import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { evaluateBulkPurchase, checkExpiryRisk, calculateSimilarity } from '@/lib/optimizationUtils'
import useProcurementStore from '@/stores/useProcurementStore'
import { TrendingDown, ShieldAlert, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function DecisionMatrix() {
  const { erpNeeds, supplierItems, matchedNeeds, suppliers } = useProcurementStore()
  const [selicRate, setSelicRate] = useState(0.01) // default 1% monthly
  const { toast } = useToast()

  useEffect(() => {
    supabase
      .from('selic_rates')
      .select('rate')
      .order('valid_from', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          // convert annual selic to monthly
          const annual = data[0].rate
          const monthly = Math.pow(1 + annual / 100, 1 / 12) - 1
          setSelicRate(monthly)
        }
      })
  }, [])

  const confirmedMatches = matchedNeeds.filter((m) => m.confirmed)

  if (confirmedMatches.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Nenhum produto foi mapeado e confirmado ainda. Volte à tela de Mapeamento.
      </Card>
    )
  }

  // Get unique suppliers that offer items for these needs
  const relevantSupplierIds = new Set<string>()
  supplierItems.forEach((si) => {
    if (si.supplierId) relevantSupplierIds.add(si.supplierId)
  })

  const columns = suppliers.filter((s) => relevantSupplierIds.has(s.id))

  const handleSelectMock = () => {
    toast({
      title: 'Ação Registrada',
      description: 'A troca de fornecedor foi registrada para a próxima aprovação.',
    })
  }

  return (
    <Card className="overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="sticky left-0 z-20 bg-muted/90 backdrop-blur-sm min-w-[250px]">
              Produto / Necessidade
            </TableHead>
            {columns.map((sup) => (
              <TableHead key={sup.id} className="text-center min-w-[200px] border-l">
                {sup.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {confirmedMatches.map((match) => {
            const need = erpNeeds.find((n) => n.id === match.erpId)
            if (!need) return null

            // Find all supplier items that match this need (using a simple similarity or matching id)
            const options = supplierItems.filter(
              (si) =>
                calculateSimilarity(si.description, need.description) > 0.4 ||
                si.id === match.selectedItemId,
            )

            // Find cheapest option for comparison
            const validOptions = options.filter((o) => o.price > 0)
            const minPrice =
              validOptions.length > 0 ? Math.min(...validOptions.map((o) => o.price)) : 0

            return (
              <TableRow key={match.erpId}>
                <TableCell className="sticky left-0 z-20 bg-background/90 backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="font-medium">{need.description}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-col gap-0.5">
                    <span>Qtd Req: {need.requiredQuantity}</span>
                    <span>Estoque: {need.currentStock}</span>
                  </div>
                </TableCell>

                {columns.map((sup) => {
                  const item = options.find((o) => o.supplierId === sup.id)

                  if (!item)
                    return (
                      <TableCell
                        key={sup.id}
                        className="text-center border-l text-muted-foreground bg-muted/5"
                      >
                        -
                      </TableCell>
                    )

                  const isSelected = item.id === match.selectedItemId
                  const bulkEval = evaluateBulkPurchase(
                    need.requiredQuantity,
                    item,
                    need,
                    selicRate,
                  )
                  const { isRisk } = checkExpiryRisk(match.suggestedQuantity, item, need)
                  const isCheapest = item.price === minPrice

                  let JustificationIcon = isCheapest ? TrendingDown : Truck
                  let justificationText = isCheapest ? 'Menor Preço' : 'Melhor Prazo / Logística'

                  if (isSelected && !isCheapest) {
                    if (bulkEval?.recommendBulk) {
                      JustificationIcon = TrendingDown
                      justificationText = 'Desconto Volume (Supera SELIC)'
                    } else if (isRisk) {
                      JustificationIcon = ShieldAlert
                      justificationText = 'Segurança de Validade'
                    }
                  }

                  return (
                    <TableCell
                      key={sup.id}
                      className={`text-center border-l relative transition-colors ${isSelected ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : 'hover:bg-muted/10'}`}
                    >
                      {isSelected && (
                        <div
                          className="absolute top-0 right-0 p-1 bg-primary text-primary-foreground rounded-bl-lg shadow-sm"
                          title={justificationText}
                        >
                          <JustificationIcon className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="flex flex-col items-center gap-1.5 p-2 group">
                        <span
                          className={`font-semibold text-lg ${isSelected ? 'text-primary' : ''}`}
                        >
                          ${item.price.toFixed(2)}
                        </span>

                        <div className="flex flex-wrap justify-center gap-1">
                          <Badge variant="outline" className="text-[10px] bg-background">
                            {item.source}
                          </Badge>
                          {bulkEval?.recommendBulk && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-blue-100 text-blue-800 border-transparent"
                            >
                              Vol: {bulkEval.qBulk}
                            </Badge>
                          )}
                          {isRisk && (
                            <Badge variant="destructive" className="text-[10px]">
                              Curto
                            </Badge>
                          )}
                        </div>

                        {!isSelected && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs mt-2 w-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                            onClick={handleSelectMock}
                          >
                            Selecionar
                          </Button>
                        )}
                        {isSelected && (
                          <div className="h-6 mt-2 flex items-center justify-center">
                            <span className="text-[10px] text-primary/80 font-medium uppercase tracking-wider">
                              {justificationText}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
