const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sufuf.pro/api/v1';

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

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

export async function login(email: string, password: string) {
  return apiFetch<{ accessToken: string; refreshToken: string; expiresIn: number; user: AdminUser }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
  );
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
  return apiFetch<ApsSettings | null>('/admin/settings/aps', { token });
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

export interface AiSettings {
  apiKey: string;
  modelName?: string;
}
