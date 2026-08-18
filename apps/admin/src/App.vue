<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AdminAuthView from './AdminAuthView.vue';
import DashboardChart from './components/DashboardChart.vue';
import {
  createAdminAccount, createContent, downloadAnalyticsCsv, fetchAdminAccounts, fetchAdminAnatomyNodes, fetchAdminSessions,
  fetchAdminSession, fetchAnalyticsDashboard, fetchAnalyticsEvents, fetchAnalyticsSummary, fetchAuditLogs, fetchContent,
  logoutAdmin, revokeAdminSession, revokeOtherAdminSessions, updateAdminAccount, updateContent, updateContentStatus,
  type AdminAccount, type AdminRole, type AdminSessionView, type AnalyticsDashboard, type AnalyticsEvent,
  type AnalyticsSummary, type AuditLog, type AnatomyNode, type ContentItem, type ContentStatus, type ContentType,
} from './api';

const sessionStorageKey = 'you-gym:admin-session';
const token = ref(localStorage.getItem(sessionStorageKey) ?? '');
const dashboard = ref<AnalyticsDashboard | null>(null);
const summary = ref<AnalyticsSummary | null>(null);
const events = ref<AnalyticsEvent[]>([]);
const selectedEvent = ref('');
const rangeDays = ref(30);
const loading = ref(false);
const error = ref('');
const lastUpdated = ref('');
const role = ref<AdminRole | null>(null);
const permissions = ref<string[]>([]);
const auditLogs = ref<AuditLog[]>([]);
const adminAccounts = ref<AdminAccount[]>([]);
const adminSessions = ref<AdminSessionView[]>([]);
const anatomyNodes = ref<AnatomyNode[]>([]);
const contentItems = ref<ContentItem[]>([]);
const contentStatusFilter = ref<ContentStatus | ''>('');
const contentTypeFilter = ref<ContentType | ''>('');
const contentSearch = ref('');
const contentFormOpen = ref(false);
const contentEditingId = ref<string | null>(null);
const contentLoading = ref(false);
const contentForm = ref({ title: '', contentType: 'ARTICLE' as ContentType, summary: '', body: '', mediaUrl: '', anatomyNodeId: '' });
const accountForm = ref({ username: '', displayName: '', password: '', role: 'EMPLOYEE' as AdminRole });
const accountLoading = ref(false);

const totalEvents = computed(() => dashboard.value?.kpis.eventCount ?? 0);
const totalUsers = computed(() => dashboard.value?.kpis.uniqueDevices ?? 0);
const totalSessions = computed(() => dashboard.value?.kpis.sessionCount ?? 0);
const eventTypeCount = computed(() => dashboard.value?.eventDistribution.length ?? 0);
const canExport = computed(() => permissions.value.includes('ANALYTICS_EXPORT'));
const canReadAudit = computed(() => permissions.value.includes('AUDIT_READ'));
const canReadContent = computed(() => permissions.value.includes('CONTENT_READ'));
const canManageContent = computed(() => permissions.value.includes('CONTENT_MANAGE'));
const anatomyRegions = computed(() => anatomyNodes.value.filter((node) => node.level === 1));
const roleLabel = computed(() => ({ SUPER_ADMIN: '超级管理员', ADMIN: '管理员', EMPLOYEE: '普通员工' }[role.value ?? 'EMPLOYEE']));
const isSession = computed(() => token.value.startsWith('yg_admin_'));

function anatomyDescendants(parentId: string) {
  const children = anatomyNodes.value.filter((node) => node.parentId === parentId);
  return children.flatMap((node) => [node, ...anatomyNodes.value.filter((child) => child.parentId === node.id)]);
}

function rangeBounds() {
  const to = new Date();
  const from = new Date(to.getTime() - rangeDays.value * 86400000);
  return { from: from.toISOString(), to: to.toISOString() };
}

const contentTypeLabel: Record<ContentType, string> = { ARTICLE: '文章', VIDEO: '视频', GIF: 'GIF', MODEL_3D: '3D 模型', EXERCISE: '动作课程' };
const contentStatusLabel: Record<ContentStatus, string> = { DRAFT: '草稿', PUBLISHED: '已发布', ARCHIVED: '已归档' };
function resetContentForm() { contentEditingId.value = null; contentFormOpen.value = false; contentForm.value = { title: '', contentType: 'ARTICLE', summary: '', body: '', mediaUrl: '', anatomyNodeId: '' }; }
function editContent(item: ContentItem) { contentEditingId.value = item.id; contentFormOpen.value = true; contentForm.value = { title: item.title, contentType: item.contentType, summary: item.summary ?? '', body: item.body ?? '', mediaUrl: item.mediaUrl ?? '', anatomyNodeId: item.anatomyNodeId ?? '' }; }
async function refreshContent() { if (!canReadContent.value) return; contentItems.value = (await fetchContent(token.value, { status: contentStatusFilter.value || undefined, contentType: contentTypeFilter.value || undefined, search: contentSearch.value.trim() || undefined })).items; }
async function saveContent() { contentLoading.value = true; error.value = ''; try { if (contentEditingId.value) await updateContent(token.value, contentEditingId.value, contentForm.value); else await createContent(token.value, contentForm.value); resetContentForm(); await refreshContent(); } catch (cause) { error.value = cause instanceof Error ? cause.message : '保存内容失败'; } finally { contentLoading.value = false; } }
async function changeContentStatus(item: ContentItem, status: ContentStatus) { try { await updateContentStatus(token.value, item.id, status); await refreshContent(); } catch (cause) { error.value = cause instanceof Error ? cause.message : '更新内容状态失败'; } }

const trendOption = computed(() => {
  const points = dashboard.value?.trend ?? [];
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['事件数', '匿名设备'], textStyle: { color: '#a5acb8' } },
    grid: { left: 42, right: 18, top: 38, bottom: 28 },
    xAxis: { type: 'category', data: points.map((point) => point.date.slice(5)), axisLabel: { color: '#8c95a3' }, axisLine: { lineStyle: { color: '#343a43' } } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { color: '#8c95a3' }, splitLine: { lineStyle: { color: '#262b33' } } },
    series: [
      { name: '事件数', type: 'line', smooth: true, showSymbol: false, data: points.map((point) => point.eventCount), lineStyle: { color: '#b3ff00', width: 2 }, itemStyle: { color: '#b3ff00' } },
      { name: '匿名设备', type: 'line', smooth: true, showSymbol: false, data: points.map((point) => point.uniqueDevices), lineStyle: { color: '#35e6e8', width: 2 }, itemStyle: { color: '#35e6e8' } },
    ],
  } as const;
});

function horizontalBarOption(items: { name: string; eventCount: number }[]) {
  const rows = [...items].reverse();
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 118, right: 18, top: 12, bottom: 22 },
    xAxis: { type: 'value', minInterval: 1, axisLabel: { color: '#8c95a3' }, splitLine: { lineStyle: { color: '#262b33' } } },
    yAxis: { type: 'category', data: rows.map((item) => item.name), axisLabel: { color: '#a5acb8', width: 106, overflow: 'truncate' }, axisLine: { lineStyle: { color: '#343a43' } } },
    series: [{ type: 'bar', data: rows.map((item) => item.eventCount), barMaxWidth: 18, itemStyle: { color: '#35e6e8', borderRadius: [0, 3, 3, 0] } }],
  } as const;
}

const eventOption = computed(() => horizontalBarOption(dashboard.value?.eventDistribution ?? []));
const anatomyOption = computed(() => horizontalBarOption(dashboard.value?.anatomyRanking ?? []));
const funnelOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'funnel', left: '8%', top: 8, bottom: 8, width: '84%', min: 0,
    max: Math.max(...(dashboard.value?.funnel.map((item) => item.eventCount) ?? [1]), 1),
    minSize: '12%', maxSize: '100%', sort: 'descending', gap: 3,
    label: { color: '#e7edf3', formatter: (params: { name: string; value: number }) => `${params.name}  ${params.value}` },
    itemStyle: { borderColor: '#171a1f', borderWidth: 1 },
    data: (dashboard.value?.funnel ?? []).map((item, index) => ({
      name: item.label, value: item.eventCount,
      itemStyle: { color: ['#b3ff00', '#9bdc20', '#35e6e8', '#5da7ff', '#ffb020', '#ff2d55'][index] },
    })),
  }],
} as const));
const platformOption = computed(() => ({
  tooltip: { trigger: 'item' }, legend: { bottom: 0, textStyle: { color: '#a5acb8' } },
  series: [{ type: 'pie', radius: ['52%', '76%'], center: ['50%', '44%'], label: { color: '#dce3ea', formatter: '{b}\n{c}' },
    data: (dashboard.value?.platformDistribution ?? []).map((item, index) => ({ name: item.name, value: item.eventCount, itemStyle: { color: ['#b3ff00', '#35e6e8', '#5da7ff', '#ffb020', '#ff2d55'][index % 5] } })) }],
} as const));

async function refresh() {
  loading.value = true;
  error.value = '';
  try {
    const session = await fetchAdminSession(token.value);
    role.value = session.role;
    permissions.value = session.permissions;
    const { from, to } = rangeBounds();
    const [nextDashboard, nextSummary, nextEvents, nextAudit, nextAccounts, nextSessions, nextAnatomy, nextContent] = await Promise.all([
      fetchAnalyticsDashboard(token.value, from, to),
      fetchAnalyticsSummary(token.value, from, to),
      fetchAnalyticsEvents(token.value, selectedEvent.value || undefined),
      session.permissions.includes('AUDIT_READ') ? fetchAuditLogs(token.value) : Promise.resolve({ items: [] as AuditLog[] }),
      session.permissions.includes('ADMIN_ACCOUNT_MANAGE') ? fetchAdminAccounts(token.value) : Promise.resolve({ items: [] as AdminAccount[] }),
      session.permissions.includes('ADMIN_ACCOUNT_MANAGE') ? fetchAdminSessions(token.value) : Promise.resolve({ items: [] as AdminSessionView[] }),
      session.permissions.includes('ANALYTICS_READ') ? fetchAdminAnatomyNodes(token.value) : Promise.resolve({ version: 1, items: [] as AnatomyNode[] }),
      session.permissions.includes('CONTENT_READ') ? fetchContent(token.value, { status: contentStatusFilter.value || undefined, contentType: contentTypeFilter.value || undefined, search: contentSearch.value.trim() || undefined }) : Promise.resolve({ items: [] as ContentItem[] }),
    ]);
    dashboard.value = nextDashboard;
    summary.value = nextSummary;
    events.value = nextEvents.items;
    auditLogs.value = nextAudit.items;
    adminAccounts.value = nextAccounts.items;
    adminSessions.value = nextSessions.items;
    anatomyNodes.value = nextAnatomy.items;
    contentItems.value = nextContent.items;
    lastUpdated.value = new Date().toLocaleString();
  } catch (cause) {
    role.value = null; permissions.value = []; dashboard.value = null; summary.value = null; events.value = [];
    auditLogs.value = []; adminAccounts.value = []; adminSessions.value = []; anatomyNodes.value = []; contentItems.value = [];
    error.value = cause instanceof Error ? cause.message : '加载失败';
  } finally { loading.value = false; }
}

async function createAccount() {
  accountLoading.value = true; error.value = '';
  try { await createAdminAccount(token.value, accountForm.value); accountForm.value = { username: '', displayName: '', password: '', role: 'EMPLOYEE' }; adminAccounts.value = (await fetchAdminAccounts(token.value)).items; }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '创建账号失败'; }
  finally { accountLoading.value = false; }
}
async function toggleAccount(account: AdminAccount) { try { await updateAdminAccount(token.value, account.username, { role: account.role, status: account.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' }); adminAccounts.value = (await fetchAdminAccounts(token.value)).items; } catch (cause) { error.value = cause instanceof Error ? cause.message : '更新账号失败'; } }
async function revokeSession(session: AdminSessionView) { try { await revokeAdminSession(token.value, session.id); adminSessions.value = (await fetchAdminSessions(token.value)).items; } catch (cause) { error.value = cause instanceof Error ? cause.message : '撤销会话失败'; } }
async function revokeOtherSessions() { try { await revokeOtherAdminSessions(token.value); adminSessions.value = (await fetchAdminSessions(token.value)).items; } catch (cause) { error.value = cause instanceof Error ? cause.message : '撤销会话失败'; } }
async function handleAuthenticated(nextToken: string) { token.value = nextToken; localStorage.setItem(sessionStorageKey, nextToken); await refresh(); }
async function logout() { const current = token.value; try { if (isSession.value) await logoutAdmin(current); } finally { localStorage.removeItem(sessionStorageKey); token.value = ''; role.value = null; permissions.value = []; dashboard.value = null; summary.value = null; events.value = []; auditLogs.value = []; adminSessions.value = []; anatomyNodes.value = []; contentItems.value = []; } }
async function downloadCsv() { try { if (!canExport.value) return; const blob = await downloadAnalyticsCsv(token.value); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'analytics-events.csv'; anchor.click(); URL.revokeObjectURL(url); } catch (cause) { error.value = cause instanceof Error ? cause.message : '导出失败'; } }
onMounted(() => { if (token.value) void refresh(); });
</script>

<template>
  <AdminAuthView v-if="!role" @authenticated="handleAuthenticated" />
  <div v-else class="shell">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">YG</span><span>YOU GYM</span></div>
      <nav class="nav" aria-label="后台导航">
        <a class="nav-item active" href="#analytics">埋点仪表盘</a>
        <a v-if="canReadContent" class="nav-item" href="#content">内容中心</a>
        <a v-if="role !== 'EMPLOYEE'" class="nav-item" href="#anatomy">解剖中心</a>
        <a v-if="role !== 'EMPLOYEE'" class="nav-item" href="#review">审核中心 <span>预留</span></a>
        <a v-if="role === 'SUPER_ADMIN'" class="nav-item" href="#system">系统管理</a>
        <a v-if="canReadAudit" class="nav-item" href="#audit">审计日志</a>
      </nav>
      <div class="sidebar-footer">本地开发环境<br /><small>RBAC 权限已启用</small></div>
    </aside>
    <main class="main" id="analytics">
      <header class="topbar"><div><p class="eyebrow">OPERATIONS</p><h1>埋点仪表盘</h1></div><div class="header-meta"><span class="role-badge">{{ roleLabel }}</span><div class="environment">LOCAL</div></div></header>
      <div class="toolbar" aria-label="数据连接">
        <button class="button primary" type="button" :disabled="loading" @click="refresh">{{ loading ? '加载中…' : '刷新数据' }}</button>
        <label class="range-control">时间范围<select v-model.number="rangeDays" aria-label="选择数据时间范围" @change="refresh"><option :value="7">近 7 天</option><option :value="30">近 30 天</option><option :value="90">近 90 天</option></select></label>
        <button v-if="canExport" class="button" type="button" :disabled="!summary" @click="downloadCsv">导出 CSV</button>
        <button class="button" type="button" @click="logout">退出会话</button>
      </div>
      <p v-if="error" class="alert" role="alert">{{ error }}</p><p v-else-if="lastUpdated" class="updated">最近更新：{{ lastUpdated }}</p>
      <section class="stats" aria-label="汇总指标">
        <article class="stat"><span>事件总量</span><strong>{{ totalEvents }}</strong><small>当前时间窗口内</small></article>
        <article class="stat"><span>匿名设备</span><strong>{{ totalUsers }}</strong><small>按匿名 ID 去重</small></article>
        <article class="stat"><span>会话数</span><strong>{{ totalSessions }}</strong><small>按 session ID 去重</small></article>
        <article class="stat"><span>上传失败率</span><strong>{{ ((dashboard?.kpis.uploadFailureRate ?? 0) * 100).toFixed(1) }}%</strong><small>{{ dashboard?.kpis.uploadFailureCount ?? 0 }} 次失败</small></article>
      </section>
      <section class="dashboard-grid">
        <article class="panel chart-panel chart-wide"><div class="panel-heading"><div><p class="eyebrow">DAILY TREND</p><h2>每日趋势</h2></div><span class="panel-note">事件与匿名设备</span></div><DashboardChart :option="trendOption" :empty="!dashboard?.trend.length" /></article>
        <article class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">EVENT RANKING</p><h2>事件类型排行</h2></div><span class="panel-note">{{ eventTypeCount }} 类</span></div><DashboardChart :option="eventOption" :empty="!dashboard?.eventDistribution.length" /></article>
        <article class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">ANATOMY RANKING</p><h2>热门解剖区域</h2></div></div><DashboardChart :option="anatomyOption" :empty="!dashboard?.anatomyRanking.length" /></article>
        <article class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">ANATOMY FUNNEL</p><h2>解剖行为漏斗</h2></div><span class="panel-note">训练事件接入后自动增长</span></div><DashboardChart :option="funnelOption" :empty="!dashboard?.funnel.some((item) => item.eventCount)" /></article>
        <article class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">PLATFORM MIX</p><h2>平台分布</h2></div></div><DashboardChart :option="platformOption" :empty="!dashboard?.platformDistribution.length" /></article>
      </section>
      <section class="content-grid">
        <article class="panel"><div class="panel-heading"><div><p class="eyebrow">EVENT SUMMARY</p><h2>事件明细</h2></div></div><div v-if="summary?.items.length" class="summary-list"><div v-for="item in summary.items" :key="item.eventName" class="summary-row"><div class="summary-name"><strong>{{ item.eventName }}</strong><span>{{ item.uniqueUsers }} 个匿名设备</span></div><strong>{{ item.eventCount }}</strong></div></div><div v-else class="empty">暂无事件数据</div></article>
        <article class="panel"><div class="panel-heading"><div><p class="eyebrow">RECENT EVENTS</p><h2>最近事件</h2></div><select v-model="selectedEvent" aria-label="按事件名称筛选" @change="refresh"><option value="">全部事件</option><option v-for="item in summary?.items ?? []" :key="item.eventName" :value="item.eventName">{{ item.eventName }}</option></select></div><div class="table-wrap"><table><thead><tr><th>事件</th><th>屏幕</th><th>平台</th><th>发生时间</th></tr></thead><tbody><tr v-for="event in events" :key="event.eventId"><td><strong>{{ event.eventName }}</strong><small>{{ event.analyticsUserId ?? '未标识' }}</small></td><td>{{ event.screenId ?? '-' }}</td><td>{{ event.platform ?? '-' }}</td><td>{{ new Date(event.occurredAt).toLocaleString() }}</td></tr></tbody></table><div v-if="!events.length" class="empty">暂无匹配事件</div></div></article>
      </section>
      <section v-if="role !== 'EMPLOYEE'" id="anatomy" class="panel audit-panel"><div class="panel-heading"><div><p class="eyebrow">ANATOMY CATALOG</p><h2>解剖节点目录</h2></div><span class="panel-note">{{ anatomyNodes.length }} 个节点 · V1</span></div><div class="anatomy-grid"><article v-for="region in anatomyRegions" :key="region.id" class="anatomy-region"><div class="anatomy-region-heading"><strong>{{ region.nameZh }}</strong><small>{{ region.nameEn }}</small></div><div class="anatomy-tags"><span v-for="node in anatomyDescendants(region.id)" :key="node.id" :class="['anatomy-tag', `level-${node.level}`]">{{ node.nameZh }}</span></div></article></div><div v-if="!anatomyNodes.length" class="empty">暂无解剖节点</div></section>
      <section v-if="canReadAudit" id="audit" class="panel audit-panel"><div class="panel-heading"><div><p class="eyebrow">AUDIT TRAIL</p><h2>最近审计操作</h2></div><span class="panel-note">管理员可见</span></div><div class="table-wrap"><table><thead><tr><th>时间</th><th>操作者</th><th>动作</th><th>资源</th><th>来源 IP</th></tr></thead><tbody><tr v-for="log in auditLogs" :key="log.id"><td>{{ new Date(log.occurredAt).toLocaleString() }}</td><td>{{ log.actorSubject }}<small>{{ log.actorRole }}</small></td><td><strong>{{ log.action }}</strong></td><td>{{ log.resourceType }}</td><td>{{ log.ipAddress ?? '-' }}</td></tr></tbody></table><div v-if="!auditLogs.length" class="empty">暂无审计记录</div></div></section>
      <section v-if="role === 'SUPER_ADMIN'" id="system" class="panel audit-panel"><div class="panel-heading"><div><p class="eyebrow">SYSTEM ACCESS</p><h2>管理员账号</h2></div><span class="panel-note">超级管理员专属</span></div><form class="account-form" aria-label="创建管理员账号" @submit.prevent="createAccount"><input v-model="accountForm.username" required pattern="[A-Za-z0-9._-]{3,80}" placeholder="用户名" autocomplete="username" /><input v-model="accountForm.displayName" required placeholder="显示名称" /><input v-model="accountForm.password" required minlength="12" type="password" placeholder="初始密码（至少 12 位）" autocomplete="new-password" /><select v-model="accountForm.role"><option value="ADMIN">管理员</option><option value="EMPLOYEE">普通员工</option></select><button class="button primary" type="submit" :disabled="accountLoading">{{ accountLoading ? '创建中…' : '创建账号' }}</button></form><div class="table-wrap"><table><thead><tr><th>用户名</th><th>名称</th><th>角色</th><th>状态</th><th>最后登录</th><th>操作</th></tr></thead><tbody><tr v-for="account in adminAccounts" :key="account.id"><td><strong>{{ account.username }}</strong></td><td>{{ account.displayName }}</td><td>{{ account.role }}</td><td><span :class="['status', account.status === 'ACTIVE' ? 'active' : 'locked']">{{ account.status === 'ACTIVE' ? '正常' : '已锁定' }}</span></td><td>{{ account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : '-' }}</td><td><button class="table-action" type="button" @click="toggleAccount(account)">{{ account.status === 'ACTIVE' ? '锁定' : '解锁' }}</button></td></tr></tbody></table><div v-if="!adminAccounts.length" class="empty">暂无管理员账号</div></div><div class="panel-heading session-heading"><div><p class="eyebrow">ACTIVE SESSIONS</p><h2>管理员会话</h2></div><button class="button" type="button" @click="revokeOtherSessions">撤销其他会话</button></div><div class="table-wrap"><table><thead><tr><th>用户名</th><th>角色</th><th>创建时间</th><th>最后使用</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="session in adminSessions" :key="session.id"><td><strong>{{ session.username }}</strong><small>{{ session.displayName }}</small></td><td>{{ session.role }}</td><td>{{ new Date(session.createdAt).toLocaleString() }}</td><td>{{ new Date(session.lastUsedAt).toLocaleString() }}</td><td><span :class="['status', session.active ? 'active' : 'locked']">{{ session.active ? '使用中' : '已撤销' }}</span></td><td><button v-if="session.active" class="table-action" type="button" @click="revokeSession(session)">撤销</button><span v-else>-</span></td></tr></tbody></table><div v-if="!adminSessions.length" class="empty">暂无会话</div></div></section>
      <section v-if="canReadContent" id="content" class="panel audit-panel content-center">
        <div class="panel-heading"><div><p class="eyebrow">CONTENT CENTER</p><h2>内容中心</h2></div><span class="panel-note">{{ contentItems.length }} 条内容</span></div>
        <div class="content-toolbar"><input v-model="contentSearch" placeholder="搜索标题或摘要" aria-label="搜索内容" @keyup.enter="refreshContent" /><select v-model="contentStatusFilter" aria-label="按状态筛选" @change="refreshContent"><option value="">全部状态</option><option value="DRAFT">草稿</option><option value="PUBLISHED">已发布</option><option value="ARCHIVED">已归档</option></select><select v-model="contentTypeFilter" aria-label="按类型筛选" @change="refreshContent"><option value="">全部类型</option><option v-for="(label, type) in contentTypeLabel" :key="type" :value="type">{{ label }}</option></select><button v-if="canManageContent" class="button primary" type="button" @click="contentFormOpen = true">新建内容</button></div>
        <form v-if="contentFormOpen && canManageContent" class="content-form" aria-label="内容编辑表单" @submit.prevent="saveContent"><input v-model="contentForm.title" required maxlength="180" placeholder="标题" aria-label="内容标题" /><select v-model="contentForm.contentType" aria-label="内容类型"><option v-for="(label, type) in contentTypeLabel" :key="type" :value="type">{{ label }}</option></select><select v-model="contentForm.anatomyNodeId" aria-label="关联解剖节点"><option value="">不关联解剖节点</option><option v-for="node in anatomyNodes.filter((item) => item.level >= 2)" :key="node.id" :value="node.id">{{ node.nameZh }} · {{ node.nameEn }}</option></select><input v-model="contentForm.mediaUrl" type="url" placeholder="媒体地址（可选）" aria-label="媒体地址" /><textarea v-model="contentForm.summary" maxlength="500" placeholder="摘要（可选）" aria-label="内容摘要" /><textarea v-model="contentForm.body" rows="5" placeholder="正文或播放说明" aria-label="内容正文" /><div class="form-actions"><button class="button primary" type="submit" :disabled="contentLoading">{{ contentLoading ? '保存中…' : '保存草稿' }}</button><button class="button" type="button" @click="resetContentForm">取消</button></div></form>
        <div class="table-wrap content-table"><table><thead><tr><th>标题</th><th>类型</th><th>关联肌群</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody><tr v-for="item in contentItems" :key="item.id"><td><strong>{{ item.title }}</strong><small>{{ item.summary || '无摘要' }}</small></td><td>{{ contentTypeLabel[item.contentType] }}</td><td>{{ anatomyNodes.find((node) => node.id === item.anatomyNodeId)?.nameZh || '-' }}</td><td><span :class="['status', item.status === 'PUBLISHED' ? 'active' : item.status === 'ARCHIVED' ? 'locked' : 'draft']">{{ contentStatusLabel[item.status] }}</span></td><td>{{ new Date(item.updatedAt).toLocaleString() }}</td><td class="content-actions"><button v-if="canManageContent" class="table-action" type="button" @click="editContent(item)">编辑</button><button v-if="canManageContent && item.status === 'DRAFT'" class="table-action" type="button" @click="changeContentStatus(item, 'PUBLISHED')">发布</button><button v-if="canManageContent && item.status === 'PUBLISHED'" class="table-action" type="button" @click="changeContentStatus(item, 'ARCHIVED')">归档</button></td></tr></tbody></table><div v-if="!contentItems.length" class="empty">暂无内容，请先创建草稿</div></div>
      </section>
    </main>
  </div>
</template>
