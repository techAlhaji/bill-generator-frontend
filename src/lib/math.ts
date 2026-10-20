/**
 * Integer Minor Unit Arithmetic & Formatting Utilities
 * Eliminates JavaScript floating-point rounding drift.
 * Implements authoritative mathematical conversions matching backend math.ts.
 */

const STROOP_SCALE = 10_000_000n; // 10^7 for Stellar Lumens / Classic assets
const QUANTITY_SCALE = 10_000n; // 10^4 for 4-decimal quantity scaling

/**
 * Converts a human-readable decimal amount string to integer minor units (e.g. stroops).
 * Example: "100.5" -> 1005000000n (for decimals = 7)
 */
export function parseDecimalToMinor(decimalStr: string, decimals: number = 7): bigint {
  const sanitized = decimalStr.trim();
  if (!sanitized || sanitized === '.') return 0n;

  const parts = sanitized.split('.');
  if (parts.length > 2) {
    throw new Error(`Invalid decimal amount string: "${decimalStr}"`);
  }

  const wholeStr = parts[0] === '' || parts[0] === '-' ? '0' : parts[0];
  const fractionStr = parts[1] || '';

  const wholeBig = BigInt(wholeStr);
  const paddedFraction = fractionStr.padEnd(decimals, '0').slice(0, decimals);
  const fractionBig = BigInt(paddedFraction);

  const multiplier = 10n ** BigInt(decimals);
  return wholeBig * multiplier + fractionBig;
}

/**
 * Converts integer minor units to a human-readable decimal string.
 * Example: 1005000000n (decimals=7) -> "100.5000000" or trimmed "100.5"
 */
export function formatMinorToDecimal(
  minor: bigint | string | number,
  decimals: number = 7,
  trimTrailingZeros: boolean = false
): string {
  const minorBig = BigInt(minor.toString());
  const divisor = 10n ** BigInt(decimals);

  const whole = minorBig / divisor;
  let fraction = (minorBig % divisor).toString().padStart(decimals, '0');

  if (trimTrailingZeros) {
    fraction = fraction.replace(/0+$/, '');
    return fraction ? `${whole}.${fraction}` : whole.toString();
  }

  return `${whole}.${fraction}`;
}

/**
 * Parses user input for quantity (e.g. "1.5", "10", "0.25") into quantityScale4 string ("15000", "100000", "2500").
 */
export function parseQuantityToScale4(qtyStr: string): string {
  const sanitized = qtyStr.trim();
  if (!sanitized || sanitized === '.') return '10000'; // Default 1 unit

  const parts = sanitized.split('.');
  const whole = parts[0] || '0';
  const frac = (parts[1] || '').padEnd(4, '0').slice(0, 4);

  const total = BigInt(whole) * QUANTITY_SCALE + BigInt(frac);
  if (total <= 0n) return '10000';
  return total.toString();
}

/**
 * Formats quantityScale4 ("15000") into friendly string ("1.5").
 */
export function formatScale4ToQuantity(scale4Str: string): string {
  if (!scale4Str) return '1';
  try {
    const scale4Big = BigInt(scale4Str);
    const whole = scale4Big / QUANTITY_SCALE;
    let frac = (scale4Big % QUANTITY_SCALE).toString().padStart(4, '0');
    frac = frac.replace(/0+$/, '');
    return frac ? `${whole}.${frac}` : whole.toString();
  } catch {
    return '1';
  }
}

/**
 * Formats basis points (e.g. 500 = 5%) into human percentage ("5%", "7.5%").
 */
export function formatBpsToPercent(bps: number): string {
  const whole = Math.floor(bps / 100);
  const frac = bps % 100;
  if (frac === 0) return `${whole}%`;
  return `${(bps / 100).toFixed(2).replace(/\.?0+$/, '')}%`;
}

/**
 * Parses human percentage ("5", "7.5", "10%") into basis points (500, 750, 1000).
 */
export function parsePercentToBps(pctStr: string): number {
  const clean = pctStr.replace('%', '').trim();
  const num = parseFloat(clean);
  if (isNaN(num) || num < 0) return 0;
  return Math.min(10_000, Math.round(num * 100));
}

/**
 * Calculates line item total in minor units:
 * totalMinor = (quantityScale4 * unitPriceMinor) / 10000
 */
export function computeLineItemTotal(quantityScale4: string, unitPriceMinor: string): string {
  try {
    const qty = BigInt(quantityScale4 || '0');
    const price = BigInt(unitPriceMinor || '0');
    const total = (qty * price) / QUANTITY_SCALE;
    return total.toString();
  } catch {
    return '0';
  }
}

export interface InvoiceCalculations {
  subtotalMinor: string;
  taxMinor: string;
  discountMinor: string;
  totalMinor: string;
  amountStroops: string;
}

/**
 * Client-side calculation preview for invoice editor.
 * The backend remains the authoritative source, but this gives immediate, accurate feedback.
 */
export function computeInvoiceTotals(
  items: Array<{ quantityScale4: string; unitPriceMinor: string }>,
  taxRateBps: number = 0,
  discountMinor: string = '0'
): InvoiceCalculations {
  let subtotal = 0n;

  for (const item of items) {
    const itemTotal = (BigInt(item.quantityScale4 || '0') * BigInt(item.unitPriceMinor || '0')) / QUANTITY_SCALE;
    subtotal += itemTotal;
  }

  const requestedDiscount = BigInt(discountMinor || '0');
  const discount = requestedDiscount > subtotal ? subtotal : requestedDiscount;
  const taxableAmount = subtotal - discount;

  // Tax calculation with half-up rounding: (taxableAmount * bps + 5000) / 10000
  const tax = taxRateBps > 0 ? (taxableAmount * BigInt(taxRateBps) + 5000n) / 10000n : 0n;
  const total = taxableAmount + tax;

  return {
    subtotalMinor: subtotal.toString(),
    discountMinor: discount.toString(),
    taxMinor: tax.toString(),
    totalMinor: total.toString(),
    amountStroops: total.toString(),
  };
}

/**
 * Formats asset amount for display with code, e.g. "100.50 XLM" or "25.00 USDC".
 */
export function formatCurrency(
  minorStr: string | bigint | number,
  assetCode: string = 'XLM',
  decimals: number = 7
): string {
  const formatted = formatMinorToDecimal(minorStr, decimals, decimals > 2);
  return `${formatted} ${assetCode}`;
}
