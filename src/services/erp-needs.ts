import pb from '@/lib/pocketbase/client'

export async function getErpNeeds() {
  return await pb.collection('erp_needs').getFullList({ sort: '-created' })
}

export async function deleteErpNeed(id: string) {
  return await pb.collection('erp_needs').delete(id)
}
