import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import useProcurementStore from '@/stores/useProcurementStore'

export function DecisionTable() {
  const { matchedNeeds, erpNeeds, supplierItems } = useProcurementStore()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto (ERP)</TableHead>
            <TableHead>Fornecedor sugerido</TableHead>
            <TableHead>Preço obtido</TableHead>
            <TableHead>Qtd Sugerida</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matchedNeeds.map((match) => {
            const need = erpNeeds.find((n) => n.id === match.erpId)
            const item = match.selectedItemId
              ? supplierItems.find((i) => i.id === match.selectedItemId)
              : null
            if (!need) return null

            const obtainedPrice = item?.price || 0

            return (
              <TableRow key={match.erpId}>
                <TableCell className="font-medium">{need.description}</TableCell>
                <TableCell>{item ? item.description : 'Pendente'}</TableCell>
                <TableCell>{obtainedPrice > 0 ? `$${obtainedPrice.toFixed(2)}` : '-'}</TableCell>
                <TableCell>{match.suggestedQuantity}</TableCell>
                <TableCell>
                  {match.confirmed ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Confirmado</Badge>
                  ) : (
                    <Badge variant="secondary">Revisar</Badge>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
          {matchedNeeds.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhum dado para otimização.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
