import { ERPNeed, SupplierItem } from './types'

export const SELIC_PLUS_1_MONTHLY = 0.01

export function calculateMonthsToExpiry(expiryDate: string) {
  const expiry = new Date(expiryDate)
  const now = new Date('2024-01-01') // Fixed baseline for consistent mock logic
  return (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
}

export function checkExpiryRisk(qty: number, item: SupplierItem, need: ERPNeed) {
  const months = calculateMonthsToExpiry(item.expiryDate)
  const maxSafeQty = months * need.monthlyConsumption - need.currentStock
  return {
    isRisk: qty > maxSafeQty,
    maxSafeQty: Math.max(0, maxSafeQty),
  }
}

export function evaluateBulkPurchase(reqQty: number, item: SupplierItem, need: ERPNeed) {
  if (!item.bulkDiscount || reqQty >= item.bulkDiscount.qty) return null

  const qBulk = item.bulkDiscount.qty
  const extraUnits = qBulk - reqQty
  const discountedPrice = item.price * (1 - item.bulkDiscount.discount)

  // Total savings by applying discount to the whole bulk
  const totalSavings = qBulk * (item.price - discountedPrice)

  // Opportunity cost on the extra inventory held
  const monthsToConsumeExtra = extraUnits / need.monthlyConsumption
  const averageHoldingMonths = monthsToConsumeExtra / 2
  const holdingCost = extraUnits * discountedPrice * SELIC_PLUS_1_MONTHLY * averageHoldingMonths

  const netBenefit = totalSavings - holdingCost

  return {
    qBulk,
    netBenefit,
    recommendBulk: netBenefit > 0,
  }
}
