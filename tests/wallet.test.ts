import { describe, it, expect, vi } from 'vitest';
import { isFreighterAvailable } from '../src/lib/wallet';

describe('Stellar Wallet Integration', () => {
  it('safely handles isFreighterAvailable in mock browser environment', async () => {
    // In jsdom without window.freighter extension installed, returns false
    const available = await isFreighterAvailable();
    expect(typeof available).toBe('boolean');
  });
});
