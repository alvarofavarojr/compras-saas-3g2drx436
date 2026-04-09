import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type SupplierInsert = Database['public']['Tables']['suppliers']['Insert']

export async function getSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createSupplier(payload: Omit<SupplierInsert, 'user_id'>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { error } = await supabase.from('suppliers').insert({ ...payload, user_id: user.id })
  if (error) throw error
}

export async function deleteSupplier(id: string) {
  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) throw error
}
