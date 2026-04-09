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
import { getErpNeeds, deleteErpNeed } from '@/services/erp-needs'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ErpNeedsTab() {
  const [data, setData] = useState<any[]>([])
  const { toast } = useToast()

  const load = async () => {
    try {
      setData((await getErpNeeds()) || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteErpNeed(id)
      toast({ title: 'Sucesso', description: 'Registro removido com sucesso' })
      load()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao remover o registro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 mt-4 animate-fade-in-up">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Qtd. Necessária</TableHead>
              <TableHead className="text-right">Estoque Min/Max</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.required_quantity}</TableCell>
                <TableCell className="text-right">
                  {item.min_stock} / {item.max_stock}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma necessidade do ERP cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
