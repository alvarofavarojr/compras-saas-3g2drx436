import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { evaluateBulkPurchase, checkExpiryRisk } from '@/lib/optimizationUtils'
import useProcurementStore from '@/stores/useProcurementStore'
import { AlertTriangle, TrendingDown, Clock, PackageCheck } from 'lucide-react'
import { format } from 'date-fns'

export default function DecisionTable() {
  const { erpNeeds, supplierItems, matchedNeeds, suppliers, updateQuantity } = useProcurementStore()

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Produto / Necessidade</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Qtd Ideal</TableHead>
            <TableHead>Validade / Risco</TableHead>
            <TableHead>Custo de Oportunidade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matchedNeeds.map((match) => {
            const need = erpNeeds.find((n) => n.id === match.erpId)
            const item = supplierItems.find((i) => i.id === match.selectedItemId)
            if (!need || !item) return null

            const supplier = suppliers.find((s) => s.id === item.supplierId)
            const bulkEval = evaluateBulkPurchase(need.requiredQuantity, item, need)
            const { isRisk, maxSafeQty } = checkExpiryRisk(match.suggestedQuantity, item, need)

            return (
              <TableRow key={match.erpId}>
                <TableCell className="font-medium">
                  {need.description}
                  <div className="text-xs text-muted-foreground mt-1">
                    Req: {need.requiredQuantity} | Est: {need.currentStock}
                  </div>
                </TableCell>
                <TableCell>
                  {supplier?.name}
                  <Badge variant="outline" className="ml-2 text-[10px] block w-fit mt-1">
                    {item.source}
                  </Badge>
                </TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={match.suggestedQuantity}
                    onChange={(e) => updateQuantity(match.erpId, Number(e.target.value))}
                    className={`w-24 h-8 ${isRisk ? 'border-red-500' : ''}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {format(new Date(item.expiryDate), 'MM/yyyy')}
                    </span>
                    {isRisk ? (
                      <Badge variant="destructive" className="w-fit text-[10px]">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Máx: {Math.floor(maxSafeQty)}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="w-fit bg-emerald-100 text-emerald-700 text-[10px]"
                      >
                        <PackageCheck className="w-3 h-3 mr-1" /> Seguro
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {bulkEval?.recommendBulk ? (
                    <div className="flex flex-col gap-2 bg-blue-50/50 p-2 rounded border border-blue-100">
                      <span className="text-xs text-blue-700 flex items-start gap-1">
                        <TrendingDown className="w-4 h-4 shrink-0" />
                        Ganho real sobre Selic. Benefício líq: ${bulkEval.netBenefit.toFixed(2)}
                      </span>
                      {match.suggestedQuantity !== bulkEval.qBulk && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-white"
                          onClick={() => updateQuantity(match.erpId, bulkEval.qBulk)}
                        >
                          Aplicar Volume ({bulkEval.qBulk})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Nenhum ganho financeiro detectado em volume.
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
