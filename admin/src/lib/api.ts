// All admin API calls go through Next.js proxy at /api/proxy/* —
// the proxy reads the httpOnly admin_token cookie server-side and forwards
// to NestJS. This keeps the JWT invisible to client JS (XSS-safe).
const BASE = '/api/proxy';

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  // `token` arg is ignored — proxy attaches it server-side.
  const { token: _token, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────

// Login bypasses the proxy because there is no cookie yet. It posts to
// the Next.js /api/login route which forwards to NestJS and sets the
// httpOnly cookie atomically.
export async function login(email: string, password: string, captchaToken?: string) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, captchaToken }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || res.statusText);
  }
  return res.json() as Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AdminUser;
  }>;
}

// ── Admin API ─────────────────────────────────────────────────────────────

export async function getStats(token: string) {
  return apiFetch<DashboardStats>('/admin/stats', { token });
}

export async function getUsers(token: string, page = 1, search?: string) {
  const q = new URLSearchParams({ page: String(page), ...(search ? { search } : {}) });
  return apiFetch<{ users: AdminUserRow[]; total: number; page: number }>(`/admin/users?${q}`, { token });
}

export async function adjustPoints(token: string, userId: string, amount: number) {
  return apiFetch<{ pointsBalance: number }>(`/admin/users/${userId}/points`, {
    method: 'PATCH',
    body: JSON.stringify({ amount }),
    token,
  });
}

export async function getTransactions(token: string, page = 1, status?: string) {
  const q = new URLSearchParams({ page: String(page), ...(status ? { status } : {}) });
  return apiFetch<{ transactions: TransactionRow[]; total: number }>(`/admin/transactions?${q}`, { token });
}

export async function getPackages(token: string) {
  return apiFetch<Package[]>('/packages/admin/all', { token });
}

export async function createPackage(token: string, data: PackageForm) {
  return apiFetch<Package>('/packages', { method: 'POST', body: JSON.stringify(data), token });
}

export async function updatePackage(token: string, id: string, data: Partial<PackageForm>) {
  return apiFetch<Package>(`/packages/${id}`, { method: 'PATCH', body: JSON.stringify(data), token });
}

export async function deletePackage(token: string, id: string) {
  return apiFetch<Package>(`/packages/${id}`, { method: 'DELETE', token });
}

export async function getApsSettings(token: string) {
  return apiFetch<ApsSettingsResponse | null>('/admin/settings/aps', { token });
}

export async function updateApsSettings(token: string, data: ApsSettings) {
  return apiFetch<unknown>('/admin/settings/aps', { method: 'PUT', body: JSON.stringify(data), token });
}

export async function getAiSettings(token: string) {
  return apiFetch<AiSettings | null>('/admin/settings/ai', { token });
}

export async function updateAiSettings(token: string, data: AiSettings) {
  return apiFetch<unknown>('/admin/settings/ai', { method: 'PUT', body: JSON.stringify(data), token });
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  pointsBalance: number;
  emailVerified: boolean;
  authProvider: string;
  createdAt: string;
  _count: { projects: number; transactions: number };
}

export interface DashboardStats {
  totalUsers: number;
  totalRevenueSar: number;
  totalTransactions: number;
  successfulTransactions: number;
  totalProjects: number;
  totalDesigns: number;
  pointsInCirculation: number;
}

export interface TransactionRow {
  id: string;
  amountPaid: string;
  pointsAdded: number;
  status: string;
  createdAt: string;
  user: { email: string; name: string | null };
  package: { name: string; pointsAmount: number };
}

export interface Package {
  id: string;
  name: string;
  pointsAmount: number;
  priceSar: string;
  profitMargin: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PackageForm {
  name: string;
  pointsAmount: number;
  priceSar: number;
  profitMargin: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ApsSettings {
  merchantId: string;
  accessCode: string;
  shaRequestPhrase: string;
  shaResponsePhrase: string;
  baseUrl?: string;
}

export interface ApsSettingsResponse {
  id: string;
  isActive: boolean;
  config: ApsSettings;
  updatedAt: string;
}

export interface AiSettings {
  apiKey: string;
  modelName?: string;
  hasKey?: boolean;
}
