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
  captchaToken?: string;
  deviceId?: string;
  visitorId?: string;
  signedDeviceId?: string;
  website?: string;
  referralCode?: string;
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

/** Helper: convert a data URL to a File object so we can post as multipart. */
export async function dataUrlToFile(dataUrl: string, name = 'upload.jpg'): Promise<File> {
  const r = await fetch(dataUrl);
  const blob = await r.blob();
  return new File([blob], name, { type: blob.type || 'image/jpeg' });
}

// ── Public reads ──────────────────────────────────────────────────────

export function listSampleCategories(kind?: 'SAMPLE' | 'STYLE') {
  const q = kind ? `?kind=${kind}` : '';
  return apiFetch<SampleCategory[]>(`/samples/categories${q}`);
}

export function listSamples(categoryId?: string, kind?: 'SAMPLE' | 'STYLE') {
  const params = new URLSearchParams();
  if (categoryId) params.set('categoryId', categoryId);
  if (kind) params.set('kind', kind);
  const q = params.toString();
  return apiFetch<Sample[]>(`/samples${q ? `?${q}` : ''}`);
}

export function listPackages() {
  return apiFetch<PointsPackage[]>('/packages');
}

export function listColorsPublic() {
  return apiFetch<ColorEntry[]>('/palette/colors');
}

export function listSpacesPublic() {
  return apiFetch<SpaceType[]>('/palette/spaces');
}

// ── Site content & showcase ──────────────────────────────────────────────

export interface SiteContent {
  brandName: string;
  brandTagline?: string | null;
  heroEyebrow?: string | null;
  heroTitle: string;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  ctaPrimary: string;
  ctaSecondary?: string | null;
  trustLine?: string | null;
  freeQuotaText?: string | null;
}

export interface Showcase {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  badge?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export function getSiteContentPublic() {
  return apiFetch<SiteContent>('/site/content');
}
export function listShowcasePublic() {
  return apiFetch<Showcase[]>('/site/showcase');
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

// ── Sketch (floor-plan) mode ─────────────────────────────────────────

export interface DetectedSpace {
  label: string;
  count: number;
  notes?: string;
}

export interface SketchAnalyzeResponse {
  spaces: DetectedSpace[];
  warning?: string;
  totalSpaces: number;
  estimatedPoints: number;
}

export function analyzeSketch(sketchUrl: string) {
  return apiFetch<SketchAnalyzeResponse>('/designs/sketch/analyze', {
    method: 'POST',
    body: JSON.stringify({ sketchUrl }),
  });
}

export interface SketchSpaceInput {
  label: string;
  customPrompt?: string;
  sampleIds?: string[];
  styleId?: string;
  colorIds?: string[];
  cameraAngle?: string;
  elements?: Array<{
    kind: string;
    variant: string;
    lengthMeters?: number;
    widthMeters?: number;
    heightMeters?: number;
    areaSqm?: number;
    glassPercent?: number;
    notes?: string;
  }>;
  /** Previously approved design URLs from the same project (continuity). */
  previousApprovedUrls?: string[];
  /** Additional reference images attached (each one triggers a vision call). */
  extraReferenceCount?: number;
  /** Measured-overlay mode for this space (extra vision pass). */
  measuredFirst?: boolean;
}

export interface SketchGenerateResponse {
  project: Project;
  designs: Design[];
  pointsConsumed: number;
  status: 'PENDING_PAYMENT';
}

export function generateFromSketch(payload: {
  sketchUrl: string;
  projectName?: string;
  /** When set, append designs to an existing SKETCH project (sequential approval). */
  projectId?: string;
  spaces: SketchSpaceInput[];
  analysis?: { spaces: DetectedSpace[] };
}) {
  return apiFetch<SketchGenerateResponse>('/designs/sketch/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Sequential approval flow: generate / re-generate one space at a time. */
export interface SketchGenerateOneResponse {
  project: Project;
  design: Design;
  pointsConsumed: number;
  status: 'PENDING_PAYMENT';
}
export function generateOneFromSketch(payload: {
  sketchUrl: string;
  projectName?: string;
  projectId?: string;
  regenerateDesignId?: string;
  space: SketchSpaceInput;
  analysis?: { spaces: DetectedSpace[] };
}) {
  return apiFetch<SketchGenerateOneResponse>('/designs/sketch/generate-one', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Types ─────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  pointsBalance: number;
  authProvider?: 'LOCAL' | 'GOOGLE';
  emailVerified?: boolean;
  createdAt?: string;
  designsCount?: number;
  referralCode?: string | null;
  referredCount?: number;
}

export async function updateMyName(name: string) {
  return apiFetch<SessionUser>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export interface SampleCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  kind?: 'SAMPLE' | 'STYLE';
  sortOrder: number;
  isActive: boolean;
}

export interface Sample {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  aiPrompt: string;
  colorMode?: 'NONE' | 'PRESET' | 'ANY';
  presetColorIds?: string[] | null;
  widthCm: number | string | null;
  heightCm: number | string | null;
  thicknessMm: number | string | null;
  modelNumber: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ColorEntry {
  id: string;
  code: string;
  name: string;
  hex: string;
  family?: string | null;
  sortOrder: number;
}

export interface SpaceType {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
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
  isPublic?: boolean;
  publicSlug?: string | null;
  shareViewCount?: number;
}

export interface GenerateDesignPayload {
  projectId: string;
  sampleIds?: string[];
  customPrompt?: string;
  referenceImageUrl?: string;
  imageSize?: '1024x1024' | '1024x1792' | '1792x1024';
  /** Per-sample color choices: { sampleId: { colorId? | customHex?, note? } } */
  sampleColors?: Record<string, { colorId?: string; customHex?: string; note?: string }>;
  customSpaceType?: string;
  /** Number of additional reference images analyzed for this generation. */
  extraReferenceCount?: number;
  /** Measured-overlay mode (extra vision pass). */
  measuredFirst?: boolean;
}

// ── Cost helpers (mirror backend `pricing.ts`) ────────────────────────
export const POINTS_PER_DESIGN = 5;
export const POINTS_PER_REFERENCE_ANALYSIS = 2;
export const POINTS_FOR_MEASURED_OVERLAY = 3;
export function calcDesignCost(inputs: { refCount?: number; measuredFirst?: boolean } = {}): number {
  const refs = Math.max(0, Math.floor(inputs.refCount ?? 0));
  return POINTS_PER_DESIGN
    + refs * POINTS_PER_REFERENCE_ANALYSIS
    + (inputs.measuredFirst ? POINTS_FOR_MEASURED_OVERLAY : 0);
}
export function describeDesignCost(inputs: { refCount?: number; measuredFirst?: boolean } = {}) {
  const refs = Math.max(0, Math.floor(inputs.refCount ?? 0));
  return {
    base: POINTS_PER_DESIGN,
    references: refs * POINTS_PER_REFERENCE_ANALYSIS,
    measured: inputs.measuredFirst ? POINTS_FOR_MEASURED_OVERLAY : 0,
    total: calcDesignCost(inputs),
  };
}

// ── Contact messages (public) ─────────────────────────────────────────
export interface SubmitContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  kind?: 'GENERAL' | 'IMPLEMENTATION' | 'PARTNERSHIP' | 'SUPPORT';
  message: string;
}

export async function submitContactMessage(payload: SubmitContactPayload) {
  return apiFetch<{ ok: true; id: string }>('/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── User insights ─────────────────────────────────────────────────────
export interface UserInsights {
  pointsBalance: number;
  memberSince: string;
  totalDesigns: number;
  designsLast30Days: number;
  pointsConsumedRecent: number;
  projectsCount: number;
  transactions: { count: number; totalSpent: number; totalPointsBought: number };
  series: { date: string; designs: number }[];
}
export function getMyInsights() {
  return apiFetch<UserInsights>('/users/me/insights');
}

// ── Design share + referral ─────────────────────────────────────────
export interface ShareResponse {
  isPublic: boolean;
  publicSlug: string | null;
  shareUrl: string | null;
}
export function toggleDesignShare(designId: string, isPublic: boolean) {
  return apiFetch<ShareResponse>(`/designs/${designId}/share`, {
    method: 'PATCH',
    body: JSON.stringify({ isPublic }),
  });
}

export interface PublicShareData {
  id: string;
  generatedImageUrl: string;
  createdAt: string;
  project: { name: string; roomType: string };
  shareViewCount: number;
}

// ── Custom elements (admin-defined, fetched at runtime) ─────────────
export interface PublicCustomElement {
  id: string;
  kindCode: string;
  label: string;
  icon: string;
  category: 'INTERIOR' | 'EXTERIOR';
  hint: string | null;
  variants: string[];
  askLength: boolean;
  askWidth: boolean;
  askHeight: boolean;
  askArea: boolean;
  defaultUnit: 'm' | 'cm' | 'in';
  notesPlaceholder: string | null;
  drawHint: string | null;
  sortOrder: number;
}
export function listPublicCustomElements() {
  return apiFetch<PublicCustomElement[]>('/custom-elements/public');
}
