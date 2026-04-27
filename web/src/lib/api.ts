// Client-side calls go through /api/proxy/* which attaches the httpOnly
// session cookie server-side and forwards to the NestJS backend.
const BASE = '/api/proxy';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) ?? {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────

export async function login(email: string, password: string, captchaToken?: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, captchaToken }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || res.statusText);
  }
  return res.json() as Promise<{ user: SessionUser; expiresIn: number }>;
}

export async function register(payload: {
  email: string;
  password: string;
  name?: string;
  phoneNumber?: string;
  captchaToken?: string;
}) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || res.statusText);
  }
  return res.json() as Promise<{ user: SessionUser; expiresIn: number }>;
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
}

// ── Public reads ──────────────────────────────────────────────────────

export function listSampleCategories() {
  return apiFetch<SampleCategory[]>('/samples/categories');
}

export function listSamples(categoryId?: string) {
  const q = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  return apiFetch<Sample[]>(`/samples${q}`);
}

export function listPackages() {
  return apiFetch<PointsPackage[]>('/packages');
}

// ── Authenticated user ────────────────────────────────────────────────

export function getMe() {
  return apiFetch<SessionUser>('/users/me');
}

export function listMyProjects() {
  return apiFetch<Project[]>('/projects');
}

export function getMyProject(id: string) {
  return apiFetch<Project & { designs: Design[] }>(`/projects/${id}`);
}

export function createProject(data: { name: string; roomType: string; originalImageUrl: string }) {
  return apiFetch<Project>('/projects', { method: 'POST', body: JSON.stringify(data) });
}

export function generateDesign(data: GenerateDesignPayload) {
  return apiFetch<Design>('/designs', { method: 'POST', body: JSON.stringify(data) });
}

export async function uploadReferenceImage(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/proxy/uploads/reference', { method: 'POST', body: fd });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || res.statusText);
  }
  return res.json() as Promise<{ url: string }>;
}

// ── Types ─────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  pointsBalance: number;
}

export interface SampleCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Sample {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string;
  aiPrompt: string;
  widthCm: number | string | null;
  heightCm: number | string | null;
  thicknessMm: number | string | null;
  modelNumber: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface PointsPackage {
  id: string;
  name: string;
  pointsAmount: number;
  priceSar: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  roomType: string;
  originalImageUrl: string;
  createdAt: string;
}

export interface Design {
  id: string;
  projectId: string;
  generatedImageUrl: string;
  promptUsed: string;
  customPrompt: string | null;
  imageSize: string;
  referenceImageUrl: string | null;
  pointsConsumed: number;
  createdAt: string;
}

export interface GenerateDesignPayload {
  projectId: string;
  sampleIds?: string[];
  customPrompt?: string;
  referenceImageUrl?: string;
  imageSize?: '1024x1024' | '1024x1792' | '1792x1024';
}
