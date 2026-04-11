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
import { Badge } from '@/components/ui/badge'
import { Search, Trash2 } from 'lucide-react'

export default function MatchedNeedsTab() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const { toast } = useToast()

  const fetch = async () => {
    if (!user) return
    const { data: res } = await supabase
      .from('matched_needs')
      .select('*, erp_needs(description), supplier_items(description, price)')
      .order('created_at', { ascending: false })
    if (res) setData(res)
  }

  useEffect(() => {
    fetch()
  }, [user])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('matched_needs').delete().eq('erp_id', id)
    if (!error) {
      toast({ title: 'Sucesso', description: 'Mapeamento removido.' })
      fetch()
    }
  }

  const filtered = data.filter((item) => {
    const erpDesc = item.erp_needs?.description || ''
    return erpDesc.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por necessidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Necessidade ERP</TableHead>
                <TableHead>Item Mapeado (Fornecedor)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.erp_id}>
                  <TableCell className="font-medium">{item.erp_needs?.description}</TableCell>
                  <TableCell>
                    {item.supplier_items ? (
                      <div>
                        <div>{item.supplier_items.description}</div>
                        <div className="text-xs text-muted-foreground">
                          ${Number(item.supplier_items.price).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Nenhum selecionado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.confirmed ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">Confirmado</Badge>
                    ) : (
                      <Badge variant="secondary">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.erp_id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Nenhum mapeamento encontrado.
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
