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
import { Search, Trash2, Filter } from 'lucide-react'

export default function SupplierItemsTab() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetch = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await pb
        .collection('supplier_items')
        .getFullList({ sort: '-created', expand: 'supplier_id' })
      setData(res)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [user])

  useRealtime('supplier_items', () => {
    fetch()
  })

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('supplier_items').delete(id)
      toast({ title: 'Sucesso', description: 'Item removido.' })
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = data.filter((item) => {
    const supplierName = item.expand?.supplier_id?.nome || item.expand?.supplier_id?.name || ''
    const matchesSearch =
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      supplierName.toLowerCase().includes(search.toLowerCase())
    const matchesSource = sourceFilter ? item.source === sourceFilter : true
    return matchesSearch && matchesSource
  })

  const sources = Array.from(new Set(data.map((i) => i.source)))

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar item ou fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="">Todas as Fontes</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
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
                  <TableHead>Descrição</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>
                      {item.expand?.supplier_id?.nome ||
                        item.expand?.supplier_id?.name ||
                        'Desconhecido'}
                    </TableCell>
                    <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.source}</Badge>
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
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhum item encontrado.
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
