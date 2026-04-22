import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
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
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetch = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await pb
        .collection('matched_needs')
        .getFullList({ sort: '-created', expand: 'erp_id,selected_item_id' })
      setData(res)
    } catch (e) {}
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [user])

  useRealtime('matched_needs', () => {
    fetch()
  })

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('matched_needs').delete(id)
      toast({ title: 'Sucesso', description: 'Mapeamento removido.' })
    } catch (e) {}
  }

  const filtered = data.filter((item) => {
    const erpDesc = item.expand?.erp_id?.description || ''
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
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
              Carregando dados...
            </div>
          ) : (
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
                    <TableCell className="font-medium">
                      {item.expand?.erp_id?.description}
                    </TableCell>
                    <TableCell>
                      {item.expand?.selected_item_id ? (
                        <div>
                          <div>{item.expand?.selected_item_id.description}</div>
                          <div className="text-xs text-muted-foreground">
                            ${Number(item.expand?.selected_item_id.price).toFixed(2)}
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}
