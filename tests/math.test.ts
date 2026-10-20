import { describe, it, expect } from 'vitest';
import {
  parseDecimalToMinor,
  formatMinorToDecimal,
  parseQuantityToScale4,
  formatScale4ToQuantity,
  formatBpsToPercent,
  parsePercentToBps,
  computeLineItemTotal,
  computeInvoiceTotals,
  formatCurrency,
} from '../src/lib/math';

describe('Integer Minor Unit Math & Conversions', () => {
  it('correctly converts decimal strings to integer stroops (decimals = 7)', () => {
    expect(parseDecimalToMinor('100')).toBe(1_000_000_000n);
    expect(parseDecimalToMinor('1.5')).toBe(15_000_000n);
    expect(parseDecimalToMinor('0.0000001')).toBe(1n);
    expect(parseDecimalToMinor('0.0000000')).toBe(0n);
    expect(parseDecimalToMinor('123.4567890')).toBe(1_234_567_890n);
    expect(parseDecimalToMinor('')).toBe(0n);
  });

  it('correctly converts minor stroops to decimal strings', () => {
    expect(formatMinorToDecimal(1_000_000_000n, 7)).toBe('100.0000000');
    expect(formatMinorToDecimal(15_000_000n, 7)).toBe('1.5000000');
    expect(formatMinorToDecimal(15_000_000n, 7, true)).toBe('1.5');
    expect(formatMinorToDecimal(1_000_000_000n, 7, true)).toBe('100');
    expect(formatMinorToDecimal('5000000', 7, true)).toBe('0.5');
  });

  it('correctly parses and formats quantity with scale 10^4', () => {
    expect(parseQuantityToScale4('1')).toBe('10000');
    expect(parseQuantityToScale4('2.5')).toBe('25000');
    expect(parseQuantityToScale4('0.125')).toBe('1250');
    expect(parseQuantityToScale4('10.0000')).toBe('100000');

    expect(formatScale4ToQuantity('10000')).toBe('1');
    expect(formatScale4ToQuantity('25000')).toBe('2.5');
    expect(formatScale4ToQuantity('1250')).toBe('0.125');
  });

  it('correctly computes line item total with integer scale', () => {
    // 2 units * 50.0000000 XLM (500000000 stroops) = 1000000000 stroops
    const total = computeLineItemTotal('20000', '500000000');
    expect(total).toBe('1000000000');

    // 1.5 units * 10.0000000 XLM = 15.0000000 XLM (150000000 stroops)
    const fractional = computeLineItemTotal('15000', '100000000');
    expect(fractional).toBe('150000000');
  });

  it('accurately computes full invoice totals with tax and discount', () => {
    // 2 items:
    // Item 1: 1 unit * 100 XLM = 100 XLM (1000000000 stroops)
    // Item 2: 2 units * 50 XLM = 100 XLM (1000000000 stroops)
    // Subtotal = 200 XLM (2000000000 stroops)
    // Discount = 20 XLM (200000000 stroops) -> Taxable = 180 XLM (1800000000 stroops)
    // Tax Rate = 5% (500 bps) -> Tax = 9 XLM (90000000 stroops)
    // Total = 189 XLM (1890000000 stroops)
    const items = [
      { quantityScale4: '10000', unitPriceMinor: '1000000000' },
      { quantityScale4: '20000', unitPriceMinor: '500000000' },
    ];
    const taxRateBps = 500;
    const discountMinor = '200000000';

    const result = computeInvoiceTotals(items, taxRateBps, discountMinor);

    expect(result.subtotalMinor).toBe('2000000000');
    expect(result.discountMinor).toBe('200000000');
    expect(result.taxMinor).toBe('90000000');
    expect(result.totalMinor).toBe('1890000000');
    expect(result.amountStroops).toBe('1890000000');
  });

  it('formats basis points and human percentage strings', () => {
    expect(formatBpsToPercent(500)).toBe('5%');
    expect(formatBpsToPercent(750)).toBe('7.5%');
    expect(formatBpsToPercent(0)).toBe('0%');

    expect(parsePercentToBps('5')).toBe(500);
    expect(parsePercentToBps('7.5%')).toBe(750);
  });

  it('formats currency strings for display', () => {
    expect(formatCurrency('1000000000', 'XLM')).toBe('100 XLM');
    expect(formatCurrency('15000000', 'XLM')).toBe('1.5 XLM');
  });
});
