import { supabase } from '@/lib/supabase/client'

export async function getSupplierItems() {
  const { data, error } = await supabase
    .from('supplier_items')
    .select('*, suppliers(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function deleteSupplierItem(id: string) {
  const { error } = await supabase.from('supplier_items').delete().eq('id', id)
  if (error) throw error
}
