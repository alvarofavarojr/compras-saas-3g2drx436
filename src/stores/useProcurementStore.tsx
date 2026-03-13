import { createContext, useContext, useState, ReactNode } from 'react'
import { Supplier, ERPNeed, SupplierItem, MatchedNeed } from '@/lib/types'
import { MOCK_SUPPLIERS, MOCK_ERP_NEEDS, MOCK_SUPPLIER_ITEMS } from '@/lib/mockData'

interface StoreState {
  suppliers: Supplier[]
  erpNeeds: ERPNeed[]
  supplierItems: SupplierItem[]
  matchedNeeds: MatchedNeed[]
  importData: (type: 'ERP' | 'AM' | 'QUOTE') => void
  confirmMatch: (erpId: string, itemId: string) => void
  updateQuantity: (erpId: string, qty: number) => void
}

const StoreContext = createContext<StoreState | null>(null)

export const ProcurementProvider = ({ children }: { children: ReactNode }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [erpNeeds, setErpNeeds] = useState<ERPNeed[]>([])
  const [supplierItems, setSupplierItems] = useState<SupplierItem[]>([])
  const [matchedNeeds, setMatchedNeeds] = useState<MatchedNeed[]>([])

  const importData = (type: 'ERP' | 'AM' | 'QUOTE') => {
    if (type === 'ERP') {
      setErpNeeds(MOCK_ERP_NEEDS)
      generateMatches(MOCK_ERP_NEEDS, supplierItems)
    } else {
      setSuppliers(MOCK_SUPPLIERS)
      const newItems =
        type === 'AM'
          ? MOCK_SUPPLIER_ITEMS.filter((i) => i.source.startsWith('AM'))
          : MOCK_SUPPLIER_ITEMS.filter((i) => i.source === 'DIRECT_QUOTE')

      const allItems = [...supplierItems, ...newItems]
      // remove duplicates safely
      const uniqueItems = Array.from(new Map(allItems.map((i) => [i.id, i])).values())
      setSupplierItems(uniqueItems)
      if (erpNeeds.length > 0) generateMatches(erpNeeds, uniqueItems)
    }
  }

  const generateMatches = (needs: ERPNeed[], items: SupplierItem[]) => {
    const matches: MatchedNeed[] = needs.map((need) => {
      const keyword = need.description.split(' ')[0].toLowerCase()
      const needMatches = items
        .filter((item) => item.description.toLowerCase().includes(keyword))
        .map((item) => ({
          itemId: item.id,
          confidence: item.description === need.description ? 0.99 : 0.85,
        }))

      needMatches.sort((a, b) => b.confidence - a.confidence)
      const bestMatch = needMatches[0]

      return {
        erpId: need.id,
        matches: needMatches,
        selectedItemId: bestMatch?.itemId,
        suggestedQuantity: need.requiredQuantity,
      }
    })
    setMatchedNeeds(matches)
  }

  const confirmMatch = (erpId: string, itemId: string) => {
    setMatchedNeeds((prev) =>
      prev.map((m) => (m.erpId === erpId ? { ...m, selectedItemId: itemId } : m)),
    )
  }

  const updateQuantity = (erpId: string, qty: number) => {
    setMatchedNeeds((prev) =>
      prev.map((m) => (m.erpId === erpId ? { ...m, suggestedQuantity: qty } : m)),
    )
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
