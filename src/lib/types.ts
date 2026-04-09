export interface Supplier {
  id: string
  name: string
  cifThreshold: number
}

export interface ERPNeed {
  id: string
  description: string
  minStock: number
  maxStock: number
  currentStock: number
  requiredQuantity: number
  monthlyConsumption: number
  unit?: string
}

export interface SupplierItem {
  id: string
  source: 'AM_DEMANDA' | 'AM_PEDIDO' | 'DIRECT_QUOTE'
  description: string
  supplierId: string
  price: number
  expiryDate: string
  minQuantity: number
  bulkDiscount?: { qty: number; discount: number }
  unit?: string
}

export interface MatchedNeed {
  erpId: string
  matches: { itemId: string; confidence: number }[]
  selectedItemId?: string
  suggestedQuantity: number
  confirmed: boolean
}
