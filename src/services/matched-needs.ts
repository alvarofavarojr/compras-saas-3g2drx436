import { supabase } from '@/lib/supabase/client'

export async function getMatchedNeeds() {
  const { data, error } = await supabase
    .from('matched_needs')
    .select('*, erp_needs(description), supplier_items(description)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function deleteMatchedNeed(id: string) {
  const { error } = await supabase.from('matched_needs').delete().eq('erp_id', id)
  if (error) throw error
}
