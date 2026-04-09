import { supabase } from '@/lib/supabase/client'

export async function getErpNeeds() {
  const { data, error } = await supabase
    .from('erp_needs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function deleteErpNeed(id: string) {
  const { error } = await supabase.from('erp_needs').delete().eq('id', id)
  if (error) throw error
}
