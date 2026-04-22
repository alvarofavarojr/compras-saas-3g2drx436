import pb from '@/lib/pocketbase/client'

export async function getSupplierItems() {
  return await pb
    .collection('supplier_items')
    .getFullList({ sort: '-created', expand: 'supplier_id' })
}

export async function deleteSupplierItem(id: string) {
  return await pb.collection('supplier_items').delete(id)
}
