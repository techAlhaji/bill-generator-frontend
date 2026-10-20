import { describe, it, expect, beforeEach } from 'vitest';
import {
  ApiError,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from '../src/lib/api';

describe('API Client & Error Normalization (RFC 7807)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manages auth bearer token in localStorage safely', () => {
    expect(getStoredToken()).toBeNull();

    setStoredToken('test-jwt-token-123');
    expect(getStoredToken()).toBe('test-jwt-token-123');

    removeStoredToken();
    expect(getStoredToken()).toBeNull();
  });

  it('correctly constructs ApiError from RFC 7807 problem details', () => {
    const error = new ApiError({
      type: 'https://errors.stellarbills.com/validation-error',
      title: 'Bad Request',
      status: 400,
      detail: 'Invoice due date cannot precede issue date.',
      instance: '/api/v1/invoices',
      code: 'VALIDATION_FAILED',
      timestamp: '2026-10-20T12:00:00Z',
      invalidParams: [
        { name: 'dueDate', reason: 'Due date cannot precede issue date' },
      ],
    });

    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(400);
    expect(error.title).toBe('Bad Request');
    expect(error.detail).toBe('Invoice due date cannot precede issue date.');
    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.invalidParams).toHaveLength(1);
    expect(error.invalidParams?.[0].name).toBe('dueDate');
  });
});
