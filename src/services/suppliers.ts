import pb from '@/lib/pocketbase/client'

export async function getSuppliers() {
  return await pb.collection('suppliers').getFullList({ sort: '-created' })
}

export async function createSupplier(payload: any) {
  const userId = pb.authStore.record?.id
  if (!userId) throw new Error('Não autenticado')
  return await pb.collection('suppliers').create({ ...payload, user_id: userId })
}

export async function deleteSupplier(id: string) {
  return await pb.collection('suppliers').delete(id)
}
