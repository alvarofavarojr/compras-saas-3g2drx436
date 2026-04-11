import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Trash2 } from 'lucide-react'

export default function ErpNeedsTab() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const { toast } = useToast()

  const fetch = async () => {
    if (!user) return
    const { data: res } = await supabase
      .from('erp_needs')
      .select('*')
      .order('created_at', { ascending: false })
    if (res) setData(res)
  }

  useEffect(() => {
    fetch()
  }, [user])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('erp_needs').delete().eq('id', id)
    if (!error) {
      toast({ title: 'Sucesso', description: 'Registro removido.' })
      fetch()
    }
  }

  const filtered = data.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Qtd Requerida</TableHead>
                <TableHead>Estoque Mín / Máx</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.required_quantity}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.min_stock} / {item.max_stock}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Nenhuma necessidade encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
