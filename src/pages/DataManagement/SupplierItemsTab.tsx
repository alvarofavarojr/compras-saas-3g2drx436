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
import { getSupplierItems, deleteSupplierItem } from '@/services/supplier-items'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SupplierItemsTab() {
  const [data, setData] = useState<any[]>([])
  const { toast } = useToast()

  const load = async () => {
    try {
      setData((await getSupplierItems()) || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteSupplierItem(id)
      toast({ title: 'Sucesso', description: 'Item removido com sucesso' })
      load()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao remover o item', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 mt-4 animate-fade-in-up">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Embalagem</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.suppliers?.name || item.supplier_id}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    item.price,
                  )}
                </TableCell>
                <TableCell className="text-right">{item.pack_size}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum item de fornecedor cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
