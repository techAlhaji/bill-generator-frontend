import {
  Merchant,
  Client,
  Invoice,
  PublicInvoice,
  PublicInvoiceStatusResponse,
  PaymentRecord,
  InvoiceAuditLog,
  PaginatedResponse,
  ApiProblemDetails,
  CreateClientInput,
  UpdateClientInput,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  VerifyPaymentInput,
  VerifyPaymentResult,
  UpdateMerchantProfileInput,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status: number;
  title: string;
  detail: string;
  code: string;
  invalidParams?: Array<{ name: string; reason: string }>;

  constructor(problem: ApiProblemDetails) {
    super(problem.detail || problem.title || 'An API error occurred');
    this.name = 'ApiError';
    this.status = problem.status;
    this.title = problem.title;
    this.detail = problem.detail;
    this.code = problem.code;
    this.invalidParams = problem.invalidParams;
  }
}

// Token storage key
const TOKEN_KEY = 'stellar_bills_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json') || contentType.includes('application/problem+json');

  if (!response.ok) {
    if (response.status === 401) {
      removeStoredToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/pay/')) {
        // Only redirect to login if not already on login or public page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login?expired=true';
        }
      }
    }

    if (isJson) {
      const problem = (await response.json()) as ApiProblemDetails;
      throw new ApiError({
        type: problem.type || 'about:blank',
        title: problem.title || `HTTP ${response.status}`,
        status: problem.status || response.status,
        detail: problem.detail || 'An unexpected error occurred.',
        instance: problem.instance || endpoint,
        code: problem.code || 'UNKNOWN_ERROR',
        timestamp: problem.timestamp || new Date().toISOString(),
        invalidParams: problem.invalidParams,
      });
    }

    throw new ApiError({
      type: 'about:blank',
      title: response.statusText || `HTTP ${response.status}`,
      status: response.status,
      detail: await response.text().catch(() => 'An unexpected server error occurred.'),
      instance: endpoint,
      code: 'HTTP_ERROR',
      timestamp: new Date().toISOString(),
    });
  }

  if (isJson) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export const api = {
  // Authentication
  auth: {
    register: (input: { email: string; password: string; businessName: string; stellarAddress: string }) =>
      request<{ data: { token: string; merchant: Merchant } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    login: (input: { email: string; password: string }) =>
      request<{ data: { token: string; merchant: Merchant } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    getStellarChallenge: (stellarAddress: string) =>
      request<{ transaction: string; networkPassphrase: string }>('/auth/stellar-challenge', {
        method: 'POST',
        body: JSON.stringify({ stellarAddress }),
      }),

    verifyStellarChallenge: (signedTransaction: string) =>
      request<{ data: { token: string; merchant: Merchant } }>('/auth/stellar-verify', {
        method: 'POST',
        body: JSON.stringify({ signedTransaction }),
      }),
  },

  // Merchant Profile
  merchant: {
    getProfile: () => request<{ data: Merchant }>('/merchant/profile'),
    updateProfile: (input: UpdateMerchantProfileInput) =>
      request<{ data: Merchant }>('/merchant/profile', {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
  },

  // Clients CRM
  clients: {
    list: (params?: { page?: number; limit?: number; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());
      if (params?.search) q.set('search', params.search);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<PaginatedResponse<Client>>(`/clients${queryStr}`);
    },

    create: (input: CreateClientInput) =>
      request<{ data: Client }>('/clients', {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    getById: (id: string) => request<{ data: Client }>(`/clients/${id}`),

    update: (id: string, input: UpdateClientInput) =>
      request<{ data: Client }>(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),

    delete: (id: string) =>
      request<void>(`/clients/${id}`, {
        method: 'DELETE',
      }),
  },

  // Invoices
  invoices: {
    list: (params?: { page?: number; limit?: number; status?: string; clientId?: string; currencyType?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());
      if (params?.status) q.set('status', params.status);
      if (params?.clientId) q.set('clientId', params.clientId);
      if (params?.currencyType) q.set('currencyType', params.currencyType);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<PaginatedResponse<Invoice>>(`/invoices${queryStr}`);
    },

    create: (input: CreateInvoiceInput) =>
      request<{ data: Invoice }>('/invoices', {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    getById: (id: string) => request<{ data: Invoice }>(`/invoices/${id}`),

    update: (id: string, input: UpdateInvoiceInput) =>
      request<{ data: Invoice }>(`/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),

    issue: (id: string) =>
      request<{ data: Invoice }>(`/invoices/${id}/issue`, {
        method: 'POST',
      }),

    cancel: (id: string) =>
      request<{ data: Invoice }>(`/invoices/${id}/cancel`, {
        method: 'POST',
      }),

    getPdfBlobUrl: async (id: string): Promise<string> => {
      const token = getStoredToken();
      const response = await fetch(`${API_BASE}/invoices/${id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to download invoice PDF');
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    },

    getPayments: (id: string) => request<{ data: PaymentRecord[] }>(`/invoices/${id}/payments`),

    getAuditLogs: (id: string) => request<{ data: InvoiceAuditLog[] }>(`/invoices/${id}/audit-logs`),
  },

  // Public Endpoints
  public: {
    getInvoice: (publicToken: string) =>
      request<{ data: PublicInvoice }>(`/public/invoices/${publicToken}`),

    verifyPayment: (publicToken: string, input: VerifyPaymentInput) =>
      request<{ data: VerifyPaymentResult }>(`/public/invoices/${publicToken}/verify-payment`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    getStatus: (publicToken: string) =>
      request<PublicInvoiceStatusResponse>(`/public/invoices/${publicToken}/status`),

    getPdfBlobUrl: async (publicToken: string): Promise<string> => {
      const response = await fetch(`${API_BASE}/public/invoices/${publicToken}/pdf`);
      if (!response.ok) {
        throw new Error('Failed to download public invoice PDF');
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    },
  },
};
