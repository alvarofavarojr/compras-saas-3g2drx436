import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useProcurementStore from '@/stores/useProcurementStore'
import { BrainCircuit, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MatchingPage() {
  const { erpNeeds, matchedNeeds, supplierItems, confirmMatch } = useProcurementStore()

  if (erpNeeds.length === 0) {
    return (
      <div className="text-center mt-20">
        <p>Por favor, importe os dados do ERP primeiro.</p>
        <Button asChild className="mt-4">
          <Link to="/">Voltar para Importação</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-primary" /> Mapeamento de Produtos
          </h1>
          <p className="text-muted-foreground">
            A IA identificou automaticamente os produtos correspondentes entre o ERP e as cotações.
          </p>
        </div>
        <Button asChild>
          <Link to="/optimization" className="gap-2">
            Ir para Otimização <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Necessidade ERP</TableHead>
              <TableHead>Sugestão (Cotações & AM)</TableHead>
              <TableHead>Confiança</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matchedNeeds.map((match) => {
              const need = erpNeeds.find((n) => n.id === match.erpId)!
              const bestMatch =
                match.matches.find((m) => m.itemId === match.selectedItemId) || match.matches[0]

              return (
                <TableRow key={match.erpId} className={!match.confirmed ? 'bg-amber-50/30' : ''}>
                  <TableCell className="font-medium">
                    {need.description}
                    {need.unit && (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        {need.unit}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={match.selectedItemId}
                      onValueChange={(val) => confirmMatch(match.erpId, val)}
                    >
                      <SelectTrigger
                        className={`w-[300px] ${!match.confirmed && match.selectedItemId ? 'border-amber-400' : ''}`}
                      >
                        <SelectValue placeholder="Selecione um correspondente" />
                      </SelectTrigger>
                      <SelectContent>
                        {match.matches.map((m) => {
                          const item = supplierItems.find((i) => i.id === m.itemId)!
                          return (
                            <SelectItem key={m.itemId} value={m.itemId}>
                              {item.description} {item.unit ? `(${item.unit})` : ''} - $
                              {item.price.toFixed(2)}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {bestMatch ? (
                      bestMatch.confidence >= 0.8 ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Alta (
                          {(bestMatch.confidence * 100).toFixed(0)}%)
                        </Badge>
                      ) : bestMatch.confidence >= 0.5 ? (
                        <Badge
                          variant="secondary"
                          className="text-amber-600 border-amber-200 bg-amber-100"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" /> Média (
                          {(bestMatch.confidence * 100).toFixed(0)}%)
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" /> Baixa (
                          {(bestMatch.confidence * 100).toFixed(0)}%)
                        </Badge>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem sugestões</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {match.confirmed ? (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Confirmado
                      </span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Pendente
                        </span>
                        {match.selectedItemId && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs"
                            onClick={() => confirmMatch(match.erpId, match.selectedItemId!)}
                          >
                            Confirmar
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
