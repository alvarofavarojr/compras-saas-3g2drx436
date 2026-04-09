import { ERPNeed, SupplierItem } from './types'

export const SELIC_PLUS_1_MONTHLY = 0.01

export function normalizeUnit(qty: number, unit?: string) {
  if (!unit) return qty
  const lower = unit.toLowerCase()
  if (lower === 'g' || lower === 'gramas' || lower === 'grama') return qty / 1000
  if (lower === 'mg' || lower === 'miligramas') return qty / 1000000
  if (lower === 'ton' || lower === 'tonelada') return qty * 1000
  return qty
}

export function normalizePrice(price: number, unit?: string) {
  if (!unit) return price
  const lower = unit.toLowerCase()
  if (lower === 'g' || lower === 'gramas' || lower === 'grama') return price * 1000
  if (lower === 'mg' || lower === 'miligramas') return price * 1000000
  if (lower === 'ton' || lower === 'tonelada') return price / 1000
  return price
}

export function levenshteinDistance(a: string, b: string): number {
  const matrix = []
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1),
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  if (s1 === s2) return 1.0

  const distance = levenshteinDistance(s1, s2)
  const maxLength = Math.max(s1.length, s2.length)

  const words1 = new Set(s1.split(/\s+/))
  const words2 = new Set(s2.split(/\s+/))
  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const wordSimilarity = intersection.size / Math.max(words1.size, words2.size)

  const charSimilarity = Math.max(0, 1 - distance / maxLength)

  return charSimilarity * 0.4 + wordSimilarity * 0.6
}

export function calculateMonthsToExpiry(expiryDate: string) {
  const expiry = new Date(expiryDate)
  const now = new Date('2024-01-01') // Fixed baseline for consistent mock logic
  return (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
}

export function checkExpiryRisk(qty: number, item: SupplierItem, need: ERPNeed) {
  const months = calculateMonthsToExpiry(item.expiryDate)

  const normMonthlyCons = normalizeUnit(need.monthlyConsumption, need.unit)
  const normCurrentStock = normalizeUnit(need.currentStock, need.unit)
  const normQty = normalizeUnit(qty, item.unit)

  const maxSafeQtyKg = months * normMonthlyCons - normCurrentStock

  let maxSafeQtyItemUnit = maxSafeQtyKg
  if (item.unit) {
    const lower = item.unit.toLowerCase()
    if (lower === 'g' || lower === 'gramas' || lower === 'grama')
      maxSafeQtyItemUnit = maxSafeQtyKg * 1000
    if (lower === 'mg' || lower === 'miligramas') maxSafeQtyItemUnit = maxSafeQtyKg * 1000000
    if (lower === 'ton' || lower === 'tonelada') maxSafeQtyItemUnit = maxSafeQtyKg / 1000
  }

  return {
    isRisk: normQty > maxSafeQtyKg,
    maxSafeQty: Math.max(0, maxSafeQtyItemUnit),
  }
}

export function evaluateBulkPurchase(reqQty: number, item: SupplierItem, need: ERPNeed) {
  if (!item.bulkDiscount || reqQty >= item.bulkDiscount.qty) return null

  const qBulk = item.bulkDiscount.qty
  const extraUnits = qBulk - reqQty
  const discountedPrice = item.price * (1 - item.bulkDiscount.discount)

  const totalSavings = qBulk * (item.price - discountedPrice)

  const normMonthlyCons = normalizeUnit(need.monthlyConsumption, need.unit) // in KG
  const extraUnitsKg = normalizeUnit(extraUnits, item.unit)

  const monthsToConsumeExtra = normMonthlyCons > 0 ? extraUnitsKg / normMonthlyCons : 0
  const averageHoldingMonths = monthsToConsumeExtra / 2
  const holdingCost = extraUnits * discountedPrice * SELIC_PLUS_1_MONTHLY * averageHoldingMonths

  const netBenefit = totalSavings - holdingCost

  return {
    qBulk,
    netBenefit,
    recommendBulk: netBenefit > 0,
  }
}
