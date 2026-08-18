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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function authHeaders(token: string): HeadersInit {
  return token.startsWith('yg_admin_')
    ? { Authorization: `Bearer ${token}` }
    : { 'X-Admin-Test-Token': token };
}

async function request<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(token),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('管理员 Token 无效或已过期');
    throw new Error(`请求失败（${response.status}）`);
  }
  return response.json() as Promise<T>;
}

export async function loginAdmin(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error(response.status === 401 ? '账号或密码错误' : `登录失败（${response.status}）`);
  return response.json() as Promise<{ token: string; tokenType: 'Bearer'; expiresAt: string; username: string; displayName: string; role: AdminRole }>;
}

export async function registerAdmin(input: { username: string; displayName: string; password: string; inviteCode: string }) {
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/auth/register`, {
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
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/auth/logout`, {
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

export function fetchContent(token: string, filters: { status?: ContentStatus; contentType?: ContentType; search?: string } = {}) {
  const params = new URLSearchParams({ limit: '200' });
  if (filters.status) params.set('status', filters.status);
  if (filters.contentType) params.set('contentType', filters.contentType);
  if (filters.search) params.set('search', filters.search);
  return request<{ items: ContentItem[] }>(`/api/admin/v1/content?${params.toString()}`, token);
}

export async function createContent(token: string, input: ContentInput) {
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/content`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(`创建内容失败（${response.status}）`);
  return response.json() as Promise<ContentItem>;
}

export async function updateContent(token: string, id: string, input: ContentInput) {
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/content/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(`更新内容失败（${response.status}）`);
  return response.json() as Promise<ContentItem>;
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
    xhr.addEventListener('abort', () => reject(new Error('资源上传已取消')));
    xhr.send(form);
  });
}

export async function updateContentStatus(token: string, id: string, status: ContentStatus) {
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/content/${encodeURIComponent(id)}/status`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  if (!response.ok) throw new Error(`更新内容状态失败（${response.status}）`);
  return response.json() as Promise<ContentItem>;
}

export async function revokeAdminSession(token: string, sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/sessions/${encodeURIComponent(sessionId)}/revoke`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error(`撤销会话失败（${response.status}）`);
}

export async function revokeOtherAdminSessions(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/sessions/revoke-all`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error(`批量撤销会话失败（${response.status}）`);
  return response.json() as Promise<{ revokedCount: number }>;
}

export async function createAdminAccount(token: string, input: { username: string; displayName: string; password: string; role: AdminRole }) {
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/accounts`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(response.status === 409 ? '用户名已存在' : `创建账号失败（${response.status}）`);
  return response.json() as Promise<AdminAccount>;
}

export async function updateAdminAccount(token: string, username: string, input: { role: AdminRole; status: 'ACTIVE' | 'LOCKED' }) {
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/accounts/${encodeURIComponent(username)}`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(`更新账号失败（${response.status}）`);
}

export async function downloadAnalyticsCsv(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/v1/analytics/events.csv?limit=10000`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error(response.status === 401 ? '管理员 Token 无效或已过期' : `导出失败（${response.status}）`);
  return response.blob();
}
