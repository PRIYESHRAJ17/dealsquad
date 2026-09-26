import { FakeDiscountCheck, PricePoint } from '@/types';

export function analyzeFakeDiscount(
  currentPrice: number,
  originalPrice: number,
  priceHistory: PricePoint[],
  lowestPrice: number
): FakeDiscountCheck {
  if (!priceHistory || priceHistory.length === 0) {
    return {
      isFake: false,
      verdict: 'fair_discount',
      historicalAverage: currentPrice,
      actualDiscountVsAverage: 0,
      claimedDiscountPercentage: Math.max(0, Math.round(((originalPrice - currentPrice) / originalPrice) * 100)),
      analysisMessage: 'Newly tracked item — establishing baseline pricing.',
    };
  }

  // Calculate historical average excluding current point if multiple exist
  const prices = priceHistory.map((p) => p.price);
  const sum = prices.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / prices.length);

  const claimedDiscount = originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const actualDiscountVsAverage = Math.round(((avg - currentPrice) / avg) * 100);

  // Verdict logic
  if (claimedDiscount >= 30 && actualDiscountVsAverage <= 4) {
    return {
      isFake: true,
      verdict: 'inflated_mrp',
      historicalAverage: avg,
      actualDiscountVsAverage,
      claimedDiscountPercentage: claimedDiscount,
      analysisMessage: `⚠️ Inflated MRP Alert! Seller claims ${claimedDiscount}% off, but item normally sells around ₹${avg.toLocaleString('en-IN')}. True saving is only ${Math.max(0, actualDiscountVsAverage)}%!`,
    };
  }

  if (currentPrice <= lowestPrice && actualDiscountVsAverage >= 12) {
    return {
      isFake: false,
      verdict: 'genuine_steal',
      historicalAverage: avg,
      actualDiscountVsAverage,
      claimedDiscountPercentage: claimedDiscount,
      analysisMessage: `🔥 Genuine Steal! True ${actualDiscountVsAverage}% drop below the 30-day normal average (₹${avg.toLocaleString('en-IN')}). Safe to buy!`,
    };
  }

  return {
    isFake: false,
    verdict: 'fair_discount',
    historicalAverage: avg,
    actualDiscountVsAverage: Math.max(0, actualDiscountVsAverage),
    claimedDiscountPercentage: claimedDiscount,
    analysisMessage: `Standard Festive Discount. Selling ₹${Math.max(0, avg - currentPrice).toLocaleString('en-IN')} below average.`,
  };
}
