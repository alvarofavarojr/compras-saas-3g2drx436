import pb from '@/lib/pocketbase/client'

export async function getMatchedNeeds() {
  return await pb
    .collection('matched_needs')
    .getFullList({ sort: '-created', expand: 'erp_id,selected_item_id' })
}

export async function deleteMatchedNeed(id: string) {
  return await pb.collection('matched_needs').delete(id)
}
