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
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { Trash2, Plus } from 'lucide-react'

export default function SelicRatesTab() {
  const [rates, setRates] = useState<any[]>([])
  const [newRate, setNewRate] = useState('')
  const [newDate, setNewDate] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchRates = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await pb.collection('selic_rates').getFullList({ sort: '-valid_from' })
      setRates(res)
    } catch (e) {}
    setLoading(false)
  }

  useEffect(() => {
    fetchRates()
  }, [user])

  useRealtime('selic_rates', () => {
    fetchRates()
  })

  const handleAdd = async () => {
    if (!newRate || !newDate || !user) return
    try {
      await pb.collection('selic_rates').create({
        user_id: user.id,
        rate: parseFloat(newRate),
        valid_from: newDate,
      })
      toast({ title: 'Sucesso', description: 'Taxa adicionada.' })
      setNewRate('')
      setNewDate('')
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('selic_rates').delete(id)
      toast({ title: 'Removido', description: 'Taxa removida com sucesso.' })
    } catch (e) {}
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Taxas SELIC (COPOM)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-end gap-4 bg-muted/50 p-4 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
            <div className="space-y-1">
              <label className="text-sm font-medium">Data de Vigência</label>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Taxa Anual (%)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 10.50"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full sm:w-auto gap-2">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
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
                  <TableHead>Data de Vigência</TableHead>
                  <TableHead>Taxa Anual</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>{format(new Date(rate.valid_from), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-semibold">{Number(rate.rate).toFixed(2)}%</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(rate.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rate.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhuma taxa cadastrada.
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
