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

// ── Samples & Categories ──────────────────────────────────────────────────

export async function getSampleCategories(token: string) {
  return apiFetch<SampleCategory[]>('/samples/admin/categories', { token });
}

export async function createSampleCategory(token: string, data: Partial<SampleCategory>) {
  return apiFetch<SampleCategory>('/samples/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function updateSampleCategory(token: string, id: string, data: Partial<SampleCategory>) {
  return apiFetch<SampleCategory>(`/samples/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteSampleCategory(token: string, id: string) {
  return apiFetch<SampleCategory>(`/samples/admin/categories/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function getSamples(token: string, categoryId?: string) {
  const q = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  return apiFetch<Sample[]>(`/samples/admin/all${q}`, { token });
}

export async function createSample(token: string, data: Partial<Sample>) {
  return apiFetch<Sample>('/samples/admin', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function updateSample(token: string, id: string, data: Partial<Sample>) {
  return apiFetch<Sample>(`/samples/admin/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteSample(token: string, id: string) {
  return apiFetch<Sample>(`/samples/admin/${id}`, {
    method: 'DELETE',
    token,
  });
}

// ── Palette: Colors ───────────────────────────────────────────────────────

export function listColorsAdmin() {
  return apiFetch<ColorEntry[]>('/palette/admin/colors');
}
export function createColor(data: { code: string; name: string; hex: string; family?: string; sortOrder?: number; isActive?: boolean }) {
  return apiFetch<ColorEntry>('/palette/admin/colors', { method: 'POST', body: JSON.stringify(data) });
}
export function updateColor(id: string, data: Partial<ColorEntry>) {
  return apiFetch<ColorEntry>(`/palette/admin/colors/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export function deleteColor(id: string) {
  return apiFetch<ColorEntry>(`/palette/admin/colors/${id}`, { method: 'DELETE' });
}

// ── Palette: Space Types ──────────────────────────────────────────────────

export function listSpacesAdmin() {
  return apiFetch<SpaceType[]>('/palette/admin/spaces');
}
export function createSpace(data: { slug: string; name: string; description?: string; icon?: string; sortOrder?: number; isActive?: boolean }) {
  return apiFetch<SpaceType>('/palette/admin/spaces', { method: 'POST', body: JSON.stringify(data) });
}
export function updateSpace(id: string, data: Partial<SpaceType>) {
  return apiFetch<SpaceType>(`/palette/admin/spaces/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export function deleteSpace(id: string) {
  return apiFetch<SpaceType>(`/palette/admin/spaces/${id}`, { method: 'DELETE' });
}

export async function aiDescribe(payload: { imageUrl?: string; textLabel?: string; categoryHint?: string }): Promise<{ description: string }> {
  return apiFetch<{ description: string }>('/samples/admin/describe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function uploadSampleImage(file: File, bucket: 'samples' | 'categories' = 'samples'): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`/api/proxy/samples/admin/upload?bucket=${bucket}`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || res.statusText);
  }
  return res.json() as Promise<{ url: string }>;
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

export interface SampleCategory {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  kind?: 'SAMPLE' | 'STYLE';
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColorEntry {
  id: string;
  code: string;
  name: string;
  hex: string;
  family?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface SpaceType {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Sample {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  aiPrompt: string;
  colorMode?: 'NONE' | 'PRESET' | 'ANY';
  presetColorIds?: string[] | null;
  widthCm?: number | string | null;
  heightCm?: number | string | null;
  thicknessMm?: number | string | null;
  modelNumber?: string | null;
  valueSar?: number | string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  quality?: 'low' | 'medium' | 'high' | 'standard' | 'hd';
  visionModel?: string;
  systemPrompt?: string;
  hasKey?: boolean;
}
