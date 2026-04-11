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
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { Trash2, Plus } from 'lucide-react'

export default function SelicRatesTab() {
  const [rates, setRates] = useState<any[]>([])
  const [newRate, setNewRate] = useState('')
  const [newDate, setNewDate] = useState('')
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchRates = async () => {
    if (!user) return
    const { data } = await supabase
      .from('selic_rates')
      .select('*')
      .order('valid_from', { ascending: false })
    if (data) setRates(data)
  }

  useEffect(() => {
    fetchRates()
  }, [user])

  const handleAdd = async () => {
    if (!newRate || !newDate || !user) return
    const { error } = await supabase.from('selic_rates').insert({
      user_id: user.id,
      rate: parseFloat(newRate),
      valid_from: newDate,
    })
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Taxa adicionada.' })
      setNewRate('')
      setNewDate('')
      fetchRates()
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('selic_rates').delete().eq('id', id)
    if (!error) {
      toast({ title: 'Removido', description: 'Taxa removida com sucesso.' })
      fetchRates()
    }
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
        </div>
      </CardContent>
    </Card>
  )
}
