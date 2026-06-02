export function formatAUD(amount: number): string {
  return `$${amount.toLocaleString("en-AU")}`;
}

export function calcCCTVQuote(
  solutions: string[],
  quantities: Record<string, number>,
  prices: Record<string, number>,
  installFee: number,
  gstRate: number
) {
  const items = solutions.map((s) => ({
    key: s,
    qty: quantities[s] || 1,
    unitPrice: prices[s],
    lineTotal: prices[s] * (quantities[s] || 1),
  }));
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0) + installFee;
  const gst = subtotal * gstRate;
  const total = subtotal + gst;
  return { items, subtotal, gst, total };
}
