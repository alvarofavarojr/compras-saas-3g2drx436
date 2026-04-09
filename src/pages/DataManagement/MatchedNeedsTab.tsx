import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getMatchedNeeds, deleteMatchedNeed } from '@/services/matched-needs'
import { Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function MatchedNeedsTab() {
  const [data, setData] = useState<any[]>([])
  const { toast } = useToast()

  const load = async () => {
    try {
      setData((await getMatchedNeeds()) || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteMatchedNeed(id)
      toast({ title: 'Sucesso', description: 'Mapeamento removido com sucesso' })
      load()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao remover o mapeamento', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 mt-4 animate-fade-in-up">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Necessidade ERP</TableHead>
              <TableHead>Item Selecionado (Fornecedor)</TableHead>
              <TableHead className="text-right">Qtd. Sugerida</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.erp_id}>
                <TableCell>
                  <div className="font-medium">{item.erp_id}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {item.erp_needs?.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{item.selected_item_id || 'Nenhum'}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {item.supplier_items?.description}
                  </div>
                </TableCell>
                <TableCell className="text-right">{item.suggested_quantity}</TableCell>
                <TableCell>
                  {item.confirmed ? (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Confirmado
                    </span>
                  ) : (
                    <span className="flex items-center text-muted-foreground text-sm font-medium">
                      <Circle className="w-4 h-4 mr-1" /> Pendente
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.erp_id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum mapeamento registrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
