import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { Supplier, ERPNeed, SupplierItem, MatchedNeed } from '@/lib/types'
import { calculateSimilarity } from '@/lib/optimizationUtils'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

interface StoreState {
  suppliers: Supplier[]
  erpNeeds: ERPNeed[]
  supplierItems: SupplierItem[]
  matchedNeeds: MatchedNeed[]
  importData: (type: 'ERP' | 'AM' | 'QUOTE', mode: 'merge' | 'replace') => Promise<void>
  confirmMatch: (erpId: string, itemId: string) => Promise<void>
  updateQuantity: (erpId: string, qty: number) => Promise<void>
  loadData: () => Promise<void>
  isLoading: boolean
}

const StoreContext = createContext<StoreState | null>(null)

export const ProcurementProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [erpNeeds, setErpNeeds] = useState<ERPNeed[]>([])
  const [supplierItems, setSupplierItems] = useState<SupplierItem[]>([])
  const [matchedNeeds, setMatchedNeeds] = useState<MatchedNeed[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const [supData, erpData, itemsData, matchData] = await Promise.all([
        pb.collection('suppliers').getFullList(),
        pb.collection('erp_needs').getFullList(),
        pb.collection('supplier_items').getFullList(),
        pb.collection('matched_needs').getFullList(),
      ])

      setSuppliers(supData.map((s) => ({ id: s.id, name: s.nome || s.name, cifThreshold: 0 })))
      setErpNeeds(
        erpData.map((e) => ({
          id: e.id,
          description: e.description,
          minStock: Number(e.min_stock),
          maxStock: Number(e.max_stock),
          requiredQuantity: Number(e.required_quantity),
          currentStock: 0,
          monthlyConsumption: 0,
        })),
      )
      setSupplierItems(
        itemsData.map((i) => ({
          id: i.id,
          supplierId: i.supplier_id,
          description: i.description,
          price: Number(i.price),
          packSize: Number(i.pack_size),
          source: i.source as any,
          expiryDate: '',
          minQuantity: 0,
        })),
      )
      setMatchedNeeds(
        matchData.map((m) => ({
          erpId: m.erp_id,
          matches: m.matches_json as any,
          selectedItemId: m.selected_item_id || undefined,
          suggestedQuantity: Number(m.suggested_quantity),
          confirmed: m.confirmed,
        })),
      )
    } catch (e) {
      console.error(e)
    }

    setIsLoading(false)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const generateMatches = (needs: ERPNeed[], items: SupplierItem[]) => {
    const matches: MatchedNeed[] = needs.map((need) => {
      const needMatches = items
        .map((item) => ({
          itemId: item.id,
          confidence: calculateSimilarity(need.description, item.description),
        }))
        .filter((m) => m.confidence > 0.3)

      needMatches.sort((a, b) => b.confidence - a.confidence)
      const bestMatch = needMatches[0]
      const isHighConfidence = bestMatch && bestMatch.confidence >= 0.8

      return {
        erpId: need.id,
        matches: needMatches,
        selectedItemId: bestMatch?.itemId,
        suggestedQuantity: need.requiredQuantity,
        confirmed: !!isHighConfidence,
      }
    })
    return matches
  }

  const saveMatches = async (matches: MatchedNeed[]) => {
    if (!user) return
    for (const m of matches) {
      try {
        const existing = await pb
          .collection('matched_needs')
          .getFirstListItem(`erp_id="${m.erpId}"`)
        await pb.collection('matched_needs').update(existing.id, {
          matches_json: m.matches,
          selected_item_id: m.selectedItemId || null,
          suggested_quantity: m.suggestedQuantity,
          confirmed: m.confirmed,
        })
      } catch {
        await pb.collection('matched_needs').create({
          user_id: user.id,
          erp_id: m.erpId,
          matches_json: m.matches,
          selected_item_id: m.selectedItemId || null,
          suggested_quantity: m.suggestedQuantity,
          confirmed: m.confirmed,
        })
      }
    }
  }

  const importData = async (type: 'ERP' | 'AM' | 'QUOTE', mode: 'merge' | 'replace') => {
    if (!user) return

    if (type === 'ERP') {
      const mockErpNeeds = [
        {
          description: 'Paracetamol 500mg',
          min_stock: 1000,
          max_stock: 5000,
          required_quantity: 4200,
        },
        {
          description: 'Amoxicilina 500mg',
          min_stock: 500,
          max_stock: 2000,
          required_quantity: 1600,
        },
        {
          description: 'Ibuprofeno 400mg',
          min_stock: 800,
          max_stock: 3000,
          required_quantity: 2500,
        },
        {
          description: 'Dipirona 500mg',
          min_stock: 2000,
          max_stock: 10000,
          required_quantity: 8500,
        },
      ]
      for (const n of mockErpNeeds) {
        await pb.collection('erp_needs').create({
          user_id: user.id,
          description: n.description,
          min_stock: n.min_stock,
          max_stock: n.max_stock,
          required_quantity: n.required_quantity,
        })
      }
    } else {
      const existingSuppliers = await pb.collection('suppliers').getFullList()
      let supId = existingSuppliers[0]?.id
      if (!supId) {
        const sup = await pb
          .collection('suppliers')
          .create({ user_id: user.id, nome: 'Fornecedor IA', ativo: true })
        supId = sup.id
      }

      const mockItems =
        type === 'AM'
          ? [
              {
                description: 'Paracetamol 500mg cx 50',
                price: 0.12,
                pack_size: 50,
                source: 'AM_DEMANDA',
              },
              { description: 'Amoxil 500mg', price: 0.45, pack_size: 30, source: 'AM_PEDIDO' },
              { description: 'Ibuprofeno 400mg', price: 0.18, pack_size: 20, source: 'AM_PEDIDO' },
              {
                description: 'Dipirona Sódica 500mg',
                price: 0.08,
                pack_size: 100,
                source: 'AM_DEMANDA',
              },
            ]
          : [
              { description: 'Paracetamol 500', price: 0.1, pack_size: 10, source: 'DIRECT_QUOTE' },
              {
                description: 'Amoxicilina 500mg',
                price: 0.4,
                pack_size: 10,
                source: 'DIRECT_QUOTE',
              },
              {
                description: 'Ibuprofeno 400mg',
                price: 0.15,
                pack_size: 10,
                source: 'DIRECT_QUOTE',
              },
            ]

      for (const i of mockItems) {
        await pb.collection('supplier_items').create({
          user_id: user.id,
          supplier_id: supId,
          description: i.description,
          price: i.price,
          pack_size: i.pack_size,
          source: i.source,
        })
      }
    }

    const erpData = await pb.collection('erp_needs').getFullList()
    const itemsData = await pb.collection('supplier_items').getFullList()

    const formattedErp = erpData.map(
      (e) =>
        ({
          id: e.id,
          description: e.description,
          requiredQuantity: e.required_quantity,
        }) as ERPNeed,
    )
    const formattedItems = itemsData.map(
      (i) => ({ id: i.id, description: i.description }) as SupplierItem,
    )

    const newMatches = generateMatches(formattedErp, formattedItems)
    await saveMatches(newMatches)

    await loadData()
  }

  const confirmMatch = async (erpId: string, itemId: string) => {
    setMatchedNeeds((prev) =>
      prev.map((m) => (m.erpId === erpId ? { ...m, selectedItemId: itemId, confirmed: true } : m)),
    )
    if (user) {
      try {
        const existing = await pb.collection('matched_needs').getFirstListItem(`erp_id="${erpId}"`)
        await pb.collection('matched_needs').update(existing.id, {
          selected_item_id: itemId,
          confirmed: true,
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  const updateQuantity = async (erpId: string, qty: number) => {
    setMatchedNeeds((prev) =>
      prev.map((m) => (m.erpId === erpId ? { ...m, suggestedQuantity: qty } : m)),
    )
    if (user) {
      try {
        const existing = await pb.collection('matched_needs').getFirstListItem(`erp_id="${erpId}"`)
        await pb.collection('matched_needs').update(existing.id, {
          suggested_quantity: qty,
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <StoreContext.Provider
      value={{
        suppliers,
        erpNeeds,
        supplierItems,
        matchedNeeds,
        importData,
        confirmMatch,
        updateQuantity,
        loadData,
        isLoading,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export default function useProcurementStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('Missing Provider')
  return ctx
}
