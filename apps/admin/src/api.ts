export type AnalyticsSummaryItem = {
  eventName: string;
  eventCount: number;
  uniqueUsers: number;
};

export type AnalyticsSummary = {
  from: string;
  to: string;
  items: AnalyticsSummaryItem[];
};

export type AnalyticsDashboard = {
  from: string;
  to: string;
  timezone: string;
  kpis: {
    eventCount: number;
    uniqueDevices: number;
    sessionCount: number;
    uploadFailureCount: number;
    uploadFailureRate: number;
  };
  trend: { date: string; eventCount: number; uniqueDevices: number }[];
  eventDistribution: { name: string; eventCount: number; uniqueDevices: number }[];
  anatomyRanking: { name: string; eventCount: number; uniqueDevices: number }[];
  funnel: { eventName: string; label: string; eventCount: number; uniqueDevices: number }[];
  platformDistribution: { name: string; eventCount: number; uniqueDevices: number }[];
};

export type NutritionDashboard = {
  from: string;
  to: string;
  timezone: string;
  kpis: { eventCount: number; uniqueUsers: number; screenViews: number; foodSearches: number; itemSelections: number; mealRecords: number };
  eventDistribution: { name: string; eventCount: number; uniqueUsers: number }[];
  mealDistribution: { name: string; eventCount: number; uniqueUsers: number }[];
  trend: { date: string; eventCount: number; uniqueUsers: number }[];
  recentEvents: AnalyticsEvent[];
};

export type AnalyticsEvent = {
  eventId: string;
  eventName: string;
  eventVersion: number;
  occurredAt: string;
  receivedAt: string;
  sessionId: string | null;
  analyticsUserId: string | null;
  platform: string | null;
  appVersion: string | null;
  screenId: string | null;
  propertiesJson: string;
};

export type AnalyticsUser = {
  analyticsUserId: string;
  eventCount: number;
  firstSeen: string;
  lastSeen: string;
  platform: string | null;
};
export type AppUser = { id: string; phone: string; nickname: string; gender: string | null; goal: string | null; experienceLevel: string | null; status: string; createdAt: string; lastLoginAt: string | null };
export type WorkoutRecord = { id: string; userId: string; title: string; durationSeconds: number; totalSets: number; totalVolume: number; calories: number; completedAt: string };
export type NutritionRecord = { id: string; userId: string; mealName: string; calories: number; proteinG: number; carbohydratesG: number; fatG: number; foodCount: number; recordedAt: string };
export type CatalogMediaAsset = { url: string; objectName: string; fileName: string; fileSize: number; fileType: string; fileETag: string; expiresIn?: number };
export type ExerciseCatalogItem = {
  id: string;
  nameZh: string;
  nameEn: string;
  targetMuscles: string[];
  equipment: string | null;
  location: string | null;
  difficultyLevel: string | null;
  recommendedReps: string | null;
  recommendedSets: string | number | null;
  restSecondsMin: number | null;
  restSecondsMax: number | null;
  angleViews: string[];
  stepLabels: string[];
  sourceImage: string | null;
  sourcePanel: string | null;
  sourceNote: string | null;
  resources: { id: string; resourceType: string; viewLabel: string | null; resourceUrl: string; sortOrder: number; sourceImage: string }[];
};
export type FoodCatalogItem = {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  mediaUrl: string | null;
  mediaAssets: CatalogMediaAsset[];
};

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';

export type AdminSession = {
  subject: string;
  role: AdminRole;
  permissions: string[];
};

export type AuditLog = {
  id: string;
  occurredAt: string;
  actorSubject: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  metadataJson: string;
};

export type AdminAccount = {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type AdminSessionView = {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string;
  revokedAt: string | null;
  active: boolean;
};

export type AnatomyNode = {
  id: string;
  parentId: string | null;
  code: string;
  nameZh: string;
  nameEn: string;
  level: number;
  view: string;
  side: string;
  genderScope: string;
  assetPath: string | null;
  sortOrder: number;
};

export type ContentType = 'ARTICLE' | 'VIDEO' | 'GIF' | 'MODEL_3D' | 'EXERCISE';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ContentMediaAsset = {
  url: string;
  objectName: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileETag: string;
  expiresIn?: number;
};
export type ContentItem = {
  id: string;
  title: string;
  contentType: ContentType;
  status: ContentStatus;
  summary: string | null;
  body: string | null;
  mediaUrl: string | null;
  mediaAssets: ContentMediaAsset[];
  anatomyNodeId: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};
export type ContentInput = { title: string; contentType: ContentType; summary: string; body: string; mediaUrl: string; mediaAssets: ContentMediaAsset[]; anatomyNodeId: string };

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const REQUEST_TIMEOUT_MS = 15_000;

export function resolveMediaUrl(url: string | null | undefined) {
  if (!url) return '';
  if (/^(?:https?:|data:|blob:)/i.test(url)) return url;
  const base = API_BASE_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8080' : window.location.origin);
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

function authHeaders(token: string): HeadersInit {
  return token.startsWith('yg_admin_')
    ? { Authorization: `Bearer ${token}` }
    : { 'X-Admin-Test-Token': token };
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (cause) {
    if (controller.signal.aborted) throw new Error('请求超时，请稍后重试');
    throw cause;
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(path: string, token: string): Promise<T> {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    headers: authHeaders(token),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('管理员 Token 无效或已过期');
    throw new Error(`请求失败（${response.status}）`);
  }
  return response.json() as Promise<T>;
}

export async function loginAdmin(username: string, password: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error(response.status === 401 ? '账号或密码错误' : `登录失败（${response.status}）`);
  return response.json() as Promise<{ token: string; tokenType: 'Bearer'; expiresAt: string; username: string; displayName: string; role: AdminRole }>;
}

export async function registerAdmin(input: { username: string; displayName: string; password: string; inviteCode: string }) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('注册功能未开放或邀请码无效');
    if (response.status === 409) throw new Error('用户名已存在');
    throw new Error(`注册失败（${response.status}）`);
  }
  return response.json() as Promise<{ username: string; displayName: string; role: 'EMPLOYEE'; status: 'ACTIVE' }>;
}

export async function logoutAdmin(token: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/auth/logout`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!response.ok && response.status !== 401) throw new Error(`退出失败（${response.status}）`);
}

export function fetchAnalyticsSummary(token: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  return request<AnalyticsSummary>(`/api/admin/v1/analytics/summary${query ? `?${query}` : ''}`, token);
}

export function fetchAnalyticsDashboard(token: string, from?: string, to?: string, timezone = 'Asia/Shanghai') {
  const params = new URLSearchParams({ timezone });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  return request<AnalyticsDashboard>(`/api/admin/v1/analytics/dashboard?${params.toString()}`, token);
}

export function fetchNutritionDashboard(token: string, from?: string, to?: string, timezone = 'Asia/Shanghai') {
  const params = new URLSearchParams({ timezone });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  return request<NutritionDashboard>(`/api/admin/v1/analytics/nutrition?${params.toString()}`, token);
}

export function fetchAnalyticsUsers(token: string, from?: string, to?: string, search?: string) {
  const params = new URLSearchParams({ limit: '200' });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (search) params.set('search', search);
  return request<{ from: string; to: string; items: AnalyticsUser[] }>(`/api/admin/v1/analytics/users?${params.toString()}`, token);
}

export function fetchAdminSession(token: string) {
  return request<AdminSession>('/api/admin/v1/session', token);
}

export function fetchAnalyticsEvents(token: string, eventName?: string) {
  const params = new URLSearchParams({ limit: '100' });
  if (eventName) params.set('eventName', eventName);
  return request<{ items: AnalyticsEvent[] }>(`/api/admin/v1/analytics/events?${params.toString()}`, token);
}

export function fetchAuditLogs(token: string) {
  return request<{ items: AuditLog[] }>('/api/admin/v1/audit/logs?limit=50', token);
}

export function fetchAdminAccounts(token: string) {
  return request<{ items: AdminAccount[] }>('/api/admin/v1/accounts', token);
}

export function fetchAdminSessions(token: string) {
  return request<{ items: AdminSessionView[] }>('/api/admin/v1/sessions?limit=100', token);
}

export function fetchAdminAnatomyNodes(token: string) {
  return request<{ version: number; items: AnatomyNode[] }>('/api/admin/v1/anatomy/nodes', token);
}

export function fetchAppUsers(token: string, search?: string) { const params = new URLSearchParams({ limit: '200' }); if (search) params.set('search', search); return request<{ items: AppUser[] }>(`/api/admin/v1/app-users?${params.toString()}`, token); }
export function fetchAppWorkouts(token: string, userId?: string) { const params = new URLSearchParams({ limit: '200' }); if (userId) params.set('userId', userId); return request<{ items: WorkoutRecord[] }>(`/api/admin/v1/app-users/workouts?${params.toString()}`, token); }
export function fetchAppNutrition(token: string, userId?: string) { const params = new URLSearchParams({ limit: '200' }); if (userId) params.set('userId', userId); return request<{ items: NutritionRecord[] }>(`/api/admin/v1/app-users/nutrition?${params.toString()}`, token); }
export function fetchAdminExerciseCatalog(token: string, search?: string, page = 1, pageSize = 24) {
  const params = new URLSearchParams({ page: String(Math.max(1, page)), pageSize: String(Math.max(1, pageSize)) });
  if (search) params.set('search', search);
  return request<{ source: string; total: number; page: number; pageSize: number; items: ExerciseCatalogItem[] }>(`/api/admin/v1/exercise-catalog?${params.toString()}`, token);
}
export type ExerciseCatalogInput = { nameZh: string; nameEn: string; targetMuscles: string[]; equipment: string; location: string; difficultyLevel: string; recommendedReps: string; recommendedSets: string; restSecondsMin: number | null; restSecondsMax: number | null; sourceNote: string };
export async function updateAdminExerciseCatalog(token: string, id: string, input: ExerciseCatalogInput) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/exercise-catalog/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(response.status === 404 ? '动作不存在' : `更新动作失败（${response.status}）`);
  return response.json() as Promise<ExerciseCatalogItem>;
}
export function fetchAdminFoodCatalog(token: string, search?: string, status?: FoodCatalogItem['status'] | '', page = 1, pageSize = 24) {
  const params = new URLSearchParams({ page: String(Math.max(1, page)), pageSize: String(Math.max(1, pageSize)) });
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  return request<{ items: FoodCatalogItem[]; total: number; page: number; pageSize: number }>(`/api/admin/v1/food-catalog?${params.toString()}`, token);
}

export type FoodCatalogInput = { id?: string; name: string; serving: string; calories: number; protein: number; carbs: number; fat: number; source: string; status?: FoodCatalogItem['status']; mediaUrl?: string; mediaAssets?: CatalogMediaAsset[] };
export async function createFoodCatalogItem(token: string, input: FoodCatalogInput) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/food-catalog`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(response.status === 409 ? '食物 ID 已存在' : `创建食物失败（${response.status}）`);
  return response.json() as Promise<FoodCatalogItem>;
}
export async function updateFoodCatalogItem(token: string, id: string, input: FoodCatalogInput) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/food-catalog/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(`更新食物失败（${response.status}）`);
  return response.json() as Promise<FoodCatalogItem>;
}
export async function updateFoodCatalogStatus(token: string, id: string, status: FoodCatalogItem['status']) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/food-catalog/${encodeURIComponent(id)}/status`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  if (!response.ok) throw new Error(`更新食物状态失败（${response.status}）`);
  return response.json() as Promise<FoodCatalogItem>;
}
export async function deleteFoodCatalogItem(token: string, id: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/food-catalog/${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeaders(token) });
  if (!response.ok) throw new Error(`删除食物失败（${response.status}）`);
}

export function fetchContent(token: string, filters: { status?: ContentStatus; contentType?: ContentType; search?: string } = {}) {
  const params = new URLSearchParams({ limit: '200' });
  if (filters.status) params.set('status', filters.status);
  if (filters.contentType) params.set('contentType', filters.contentType);
  if (filters.search) params.set('search', filters.search);
  return request<{ items: ContentItem[] }>(`/api/admin/v1/content?${params.toString()}`, token);
}

export async function createContent(token: string, input: ContentInput) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/content`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(`创建内容失败（${response.status}）`);
  return response.json() as Promise<ContentItem>;
}

export async function updateContent(token: string, id: string, input: ContentInput) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/content/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(`更新内容失败（${response.status}）`);
  return response.json() as Promise<ContentItem>;
}

export async function deleteContent(token: string, id: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/content/${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeaders(token) });
  if (!response.ok) throw new Error(`删除内容失败（${response.status}）`);
  return response.json() as Promise<{ deleted: boolean; mediaAssets: ContentMediaAsset[] }>;
}

export type ContentMediaUploadResult = {
  uploadedFiles: ContentMediaAsset[];
  failedFiles: { fileName: string; error: string }[];
  uploadedCount: number;
  failedCount: number;
  allSuccess: boolean;
};

export function uploadContentMedia(token: string, files: File[], onProgress?: (progress: number) => void) {
  const form = new FormData();
  files.forEach((file) => form.append('file', file));
  return new Promise<ContentMediaUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/api/file/media-upload/batch`);
    xhr.timeout = REQUEST_TIMEOUT_MS;
    Object.entries(authHeaders(token)).forEach(([name, value]) => xhr.setRequestHeader(name, String(value)));
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    });
    xhr.addEventListener('load', () => {
      if (xhr.status < 200 || xhr.status >= 300) { reject(new Error(`资源上传失败（${xhr.status}）`)); return; }
      try {
        const result = JSON.parse(xhr.responseText) as { data: ContentMediaUploadResult };
        resolve(result.data);
      } catch { reject(new Error('资源上传响应格式错误')); }
    });
    xhr.addEventListener('error', () => reject(new Error('资源上传网络错误')));
    xhr.addEventListener('timeout', () => reject(new Error('资源上传超时，请稍后重试')));
    xhr.addEventListener('abort', () => reject(new Error('资源上传已取消')));
    xhr.send(form);
  });
}

export async function deleteContentMedia(token: string, objectName: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/file/media?objectName=${encodeURIComponent(objectName)}`, { method: 'DELETE', headers: authHeaders(token) });
  if (response.status === 404) return;
  if (!response.ok) throw new Error(`资源清理失败（${response.status}）`);
}

export async function updateContentStatus(token: string, id: string, status: ContentStatus) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/content/${encodeURIComponent(id)}/status`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  if (!response.ok) throw new Error(`更新内容状态失败（${response.status}）`);
  return response.json() as Promise<ContentItem>;
}

export async function revokeAdminSession(token: string, sessionId: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/sessions/${encodeURIComponent(sessionId)}/revoke`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error(`撤销会话失败（${response.status}）`);
}

export async function revokeOtherAdminSessions(token: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/sessions/revoke-all`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error(`批量撤销会话失败（${response.status}）`);
  return response.json() as Promise<{ revokedCount: number }>;
}

export async function createAdminAccount(token: string, input: { username: string; displayName: string; password: string; role: AdminRole }) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/accounts`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(response.status === 409 ? '用户名已存在' : `创建账号失败（${response.status}）`);
  return response.json() as Promise<AdminAccount>;
}

export async function updateAdminAccount(token: string, username: string, input: { role: AdminRole; status: 'ACTIVE' | 'LOCKED' }) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/accounts/${encodeURIComponent(username)}`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(`更新账号失败（${response.status}）`);
}

export async function downloadAnalyticsCsv(token: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/analytics/events.csv?limit=10000`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error(response.status === 401 ? '管理员 Token 无效或已过期' : `导出失败（${response.status}）`);
  return response.blob();
}

export async function downloadNutritionCsv(token: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/analytics/nutrition.csv?limit=10000`, { headers: authHeaders(token) });
  if (!response.ok) throw new Error(response.status === 401 ? '管理 Token 无效或已过期' : `导出失败（${response.status}）`);
  return response.blob();
}

export async function downloadAnalyticsUsersCsv(token: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/v1/analytics/users.csv?limit=10000`, { headers: authHeaders(token) });
  if (!response.ok) throw new Error(response.status === 401 ? '管理 Token 无效或已过期' : `导出失败（${response.status}）`);
  return response.blob();
}
