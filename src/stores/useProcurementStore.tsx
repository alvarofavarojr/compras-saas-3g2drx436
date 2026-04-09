import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { Supplier, ERPNeed, SupplierItem, MatchedNeed } from '@/lib/types'
import { MOCK_SUPPLIERS, MOCK_ERP_NEEDS, MOCK_SUPPLIER_ITEMS } from '@/lib/mockData'
import { calculateSimilarity } from '@/lib/optimizationUtils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

interface StoreState {
  suppliers: Supplier[]
  erpNeeds: ERPNeed[]
  supplierItems: SupplierItem[]
  matchedNeeds: MatchedNeed[]
  importData: (type: 'ERP' | 'AM' | 'QUOTE') => Promise<void>
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

    const [{ data: supData }, { data: erpData }, { data: itemsData }, { data: matchData }] =
      await Promise.all([
        supabase.from('suppliers').select('*').eq('user_id', user.id),
        supabase.from('erp_needs').select('*').eq('user_id', user.id),
        supabase.from('supplier_items').select('*').eq('user_id', user.id),
        supabase.from('matched_needs').select('*').eq('user_id', user.id),
      ])

    if (supData) setSuppliers(supData.map((s) => ({ id: s.id, name: s.name })))
    if (erpData)
      setErpNeeds(
        erpData.map((e) => ({
          id: e.id,
          description: e.description,
          minStock: Number(e.min_stock),
          maxStock: Number(e.max_stock),
          requiredQuantity: Number(e.required_quantity),
        })),
      )
    if (itemsData)
      setSupplierItems(
        itemsData.map((i) => ({
          id: i.id,
          supplierId: i.supplier_id,
          description: i.description,
          price: Number(i.price),
          packSize: Number(i.pack_size),
          source: i.source,
        })),
      )
    if (matchData)
      setMatchedNeeds(
        matchData.map((m) => ({
          erpId: m.erp_id,
          matches: m.matches_json as any,
          selectedItemId: m.selected_item_id || undefined,
          suggestedQuantity: Number(m.suggested_quantity),
          confirmed: m.confirmed,
        })),
      )

    setIsLoading(false)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveMatches = async (matches: MatchedNeed[]) => {
    if (!user) return
    const records = matches.map((m) => ({
      erp_id: m.erpId,
      user_id: user.id,
      matches_json: m.matches,
      selected_item_id: m.selectedItemId || null,
      suggested_quantity: m.suggestedQuantity,
      confirmed: m.confirmed,
    }))
    if (records.length > 0) {
      await supabase.from('matched_needs').upsert(records)
    }
  }

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

  const importData = async (type: 'ERP' | 'AM' | 'QUOTE') => {
    if (!user) return

    if (type === 'ERP') {
      const records = MOCK_ERP_NEEDS.map((n) => ({
        id: n.id,
        user_id: user.id,
        description: n.description,
        min_stock: n.minStock,
        max_stock: n.maxStock,
        required_quantity: n.requiredQuantity,
      }))
      await supabase.from('erp_needs').upsert(records)

      const newMatches = generateMatches(MOCK_ERP_NEEDS, supplierItems)
      await saveMatches(newMatches)
    } else {
      const supRecords = MOCK_SUPPLIERS.map((s) => ({
        id: s.id,
        user_id: user.id,
        name: s.name,
      }))
      await supabase.from('suppliers').upsert(supRecords)

      const newItems =
        type === 'AM'
          ? MOCK_SUPPLIER_ITEMS.filter((i) => i.source.startsWith('AM'))
          : MOCK_SUPPLIER_ITEMS.filter((i) => i.source === 'DIRECT_QUOTE')

      const itemRecords = newItems.map((i) => ({
        id: i.id,
        user_id: user.id,
        supplier_id: i.supplierId,
        description: i.description,
        price: i.price,
        pack_size: i.packSize,
        source: i.source,
      }))
      await supabase.from('supplier_items').upsert(itemRecords)

      const allItems = [...supplierItems, ...newItems]
      const uniqueItems = Array.from(new Map(allItems.map((i) => [i.id, i])).values())

      if (erpNeeds.length > 0) {
        const newMatches = generateMatches(erpNeeds, uniqueItems)
        await saveMatches(newMatches)
      }
    }

    await loadData()
  }

  const confirmMatch = async (erpId: string, itemId: string) => {
    setMatchedNeeds((prev) =>
      prev.map((m) => (m.erpId === erpId ? { ...m, selectedItemId: itemId, confirmed: true } : m)),
    )
    if (user) {
      await supabase
        .from('matched_needs')
        .update({
          selected_item_id: itemId,
          confirmed: true,
        })
        .eq('erp_id', erpId)
        .eq('user_id', user.id)
    }
  }

  const updateQuantity = async (erpId: string, qty: number) => {
    setMatchedNeeds((prev) =>
      prev.map((m) => (m.erpId === erpId ? { ...m, suggestedQuantity: qty } : m)),
    )
    if (user) {
      await supabase
        .from('matched_needs')
        .update({
          suggested_quantity: qty,
        })
        .eq('erp_id', erpId)
        .eq('user_id', user.id)
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
