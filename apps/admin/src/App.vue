<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  Activity, Apple, BarChart3, BookOpen, ChevronRight, ClipboardCheck,
  Dumbbell, FileClock, LayoutDashboard, RefreshCw, Settings, Upload,
  UserRound, UsersRound,
} from '@lucide/vue';
import AdminAuthView from './AdminAuthView.vue';
import DashboardChart from './components/DashboardChart.vue';
import {
  createAdminAccount, createContent, downloadAnalyticsCsv, downloadAnalyticsUsersCsv, downloadNutritionCsv, fetchAdminAccounts, fetchAdminAnatomyNodes, fetchAdminSessions,
  fetchAdminSession, fetchAnalyticsDashboard, fetchAnalyticsEvents, fetchAnalyticsSummary, fetchAuditLogs, fetchAnalyticsUsers, fetchContent, fetchNutritionDashboard,
  deleteContent, deleteContentMedia, logoutAdmin, revokeAdminSession, revokeOtherAdminSessions, updateAdminAccount, updateContent, updateContentStatus, uploadContentMedia,
  fetchAdminExerciseCatalog, updateAdminExerciseCatalog, fetchAdminFoodCatalog, createFoodCatalogItem, updateFoodCatalogItem, updateFoodCatalogStatus, deleteFoodCatalogItem,
  fetchAppNutrition, fetchAppUsers, fetchAppWorkouts,
  type AdminAccount, type AdminRole, type AdminSessionView, type AnalyticsDashboard, type AnalyticsEvent, type AnalyticsUser, type NutritionDashboard, type AppUser, type WorkoutRecord, type NutritionRecord, type ExerciseCatalogItem, type FoodCatalogItem, type FoodCatalogInput,
  type AnalyticsSummary, type AuditLog, type AnatomyNode, type ContentItem, type ContentMediaAsset, type ContentStatus, type ContentType, type ExerciseCatalogInput,
  resolveMediaUrl,
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
const exerciseCatalogItems = ref<ExerciseCatalogItem[]>([]);
const exerciseCatalogTotal = ref(0);
const exerciseEditingId = ref<string | null>(null);
const exerciseFormOpen = ref(false);
const exerciseLoading = ref(false);
const exerciseForm = ref<ExerciseCatalogInput>({ nameZh: '', nameEn: '', targetMuscles: [], equipment: '', location: '健身房', difficultyLevel: 'UNSPECIFIED', recommendedReps: '', recommendedSets: '', restSecondsMin: null, restSecondsMax: null, sourceNote: '' });
const exerciseTargetsText = ref('');
const nutrition = ref<NutritionDashboard | null>(null);
const analyticsUsers = ref<AnalyticsUser[]>([]);
const appUsers = ref<AppUser[]>([]);
const appWorkouts = ref<WorkoutRecord[]>([]);
const appNutrition = ref<NutritionRecord[]>([]);
const foodCatalogItems = ref<FoodCatalogItem[]>([]);
const foodSearch = ref('');
const foodStatusFilter = ref<FoodCatalogItem['status'] | ''>('');
const foodFormOpen = ref(false);
const foodEditingId = ref<string | null>(null);
const foodLoading = ref(false);
const foodUploading = ref(false);
const foodUploadProgress = ref(0);
const foodUploadMessage = ref('');
const foodUploadFailures = ref<{ fileName: string; error: string }[]>([]);
const foodRemovedAssets = ref<ContentMediaAsset[]>([]);
const foodUploadedInForm = ref<ContentMediaAsset[]>([]);
const foodUploadInput = ref<HTMLInputElement | null>(null);
const foodForm = ref<FoodCatalogInput>({ name: '', serving: '100g', calories: 0, protein: 0, carbs: 0, fat: 0, source: 'YOU GYM', status: 'ACTIVE', mediaUrl: '', mediaAssets: [] });
const userSearch = ref('');
const contentStatusFilter = ref<ContentStatus | ''>('');
const contentTypeFilter = ref<ContentType | ''>('');
const contentSearch = ref('');
const contentFormOpen = ref(false);
const contentEditingId = ref<string | null>(null);
const contentLoading = ref(false);
const contentUploading = ref(false);
const contentUploadProgress = ref(0);
const contentUploadMessage = ref('');
const contentUploadFailures = ref<{ fileName: string; error: string }[]>([]);
const contentDropActive = ref(false);
const contentRemovedAssets = ref<ContentMediaAsset[]>([]);
const contentUploadedInForm = ref<ContentMediaAsset[]>([]);
const contentUploadInput = ref<HTMLInputElement | null>(null);
const contentForm = ref({ title: '', contentType: 'ARTICLE' as ContentType, summary: '', body: '', mediaUrl: '', mediaAssets: [] as ContentMediaAsset[], anatomyNodeId: '' });
const accountForm = ref({ username: '', displayName: '', password: '', role: 'EMPLOYEE' as AdminRole });
const accountLoading = ref(false);
const previewMedia = ref<{ url: string; label: string; kind: 'image' | 'video' } | null>(null);

type AdminModule = 'dashboard' | 'analytics' | 'users' | 'nutrition' | 'content' | 'anatomy' | 'review' | 'system' | 'audit';
const moduleFromHash = (): AdminModule => {
  const candidate = window.location.hash.replace(/^#\/?/, '') as AdminModule;
  return ['dashboard', 'analytics', 'users', 'nutrition', 'content', 'anatomy', 'review', 'system', 'audit'].includes(candidate) ? candidate : 'dashboard';
};
const activeModule = ref<AdminModule>(moduleFromHash());
const moduleMeta: Record<AdminModule, { eyebrow: string; title: string; description: string }> = {
  dashboard: { eyebrow: 'OPERATIONS OVERVIEW', title: '运营仪表盘', description: '聚合关键指标和业务趋势' },
  analytics: { eyebrow: 'BEHAVIOR ANALYTICS', title: '数据分析', description: '查看事件汇总和最新埋点明细' },
  users: { eyebrow: 'USER OPERATIONS', title: '用户管理', description: '管理 App 用户和用户行为数据' },
  nutrition: { eyebrow: 'NUTRITION OPERATIONS', title: '饮食管理', description: '查看饮食行为和餐次记录数据' },
  content: { eyebrow: 'CONTENT OPERATIONS', title: '内容中心', description: '管理文章、视频、动图和 3D 资源' },
  anatomy: { eyebrow: 'ANATOMY CATALOG', title: '解剖中心', description: '查看身体区域和肌群分级目录' },
  review: { eyebrow: 'CONTENT REVIEW', title: '审核中心', description: '内容审核与举报处置工作台' },
  system: { eyebrow: 'SYSTEM ACCESS', title: '系统管理', description: '管理后台账号、角色和登录会话' },
  audit: { eyebrow: 'AUDIT TRAIL', title: '审计日志', description: '追踪后台关键管理操作' },
};
const currentModuleMeta = computed(() => moduleMeta[activeModule.value]);
function navigateTo(module: AdminModule) {
  window.location.hash = `/${module}`;
  activeModule.value = module;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function syncModuleFromHash() { activeModule.value = moduleFromHash(); }

const totalEvents = computed(() => dashboard.value?.kpis.eventCount ?? 0);
const totalUsers = computed(() => dashboard.value?.kpis.uniqueDevices ?? 0);
const totalSessions = computed(() => dashboard.value?.kpis.sessionCount ?? 0);
const eventTypeCount = computed(() => dashboard.value?.eventDistribution.length ?? 0);
const canExport = computed(() => permissions.value.includes('ANALYTICS_EXPORT'));
const canReadAudit = computed(() => permissions.value.includes('AUDIT_READ'));
const canReadContent = computed(() => permissions.value.includes('CONTENT_READ'));
const canManageContent = computed(() => permissions.value.includes('CONTENT_MANAGE'));
const canReadAnalytics = computed(() => permissions.value.includes('ANALYTICS_READ'));
const canManageCatalog = computed(() => permissions.value.includes('CATALOG_MANAGE'));
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
function isVideoUrl(url: string | null | undefined) { return /\.(mp4|mov|avi|webm|mkv)(?:\?|$)/i.test(url ?? ''); }
function isImageUrl(url: string | null | undefined) { return /\.(jpg|jpeg|png|gif|bmp|webp)(?:\?|$)/i.test(url ?? ''); }
function resetContentForm() { contentEditingId.value = null; contentFormOpen.value = false; contentUploadMessage.value = ''; contentUploadFailures.value = []; contentUploadProgress.value = 0; contentRemovedAssets.value = []; contentUploadedInForm.value = []; contentForm.value = { title: '', contentType: 'ARTICLE', summary: '', body: '', mediaUrl: '', mediaAssets: [], anatomyNodeId: '' }; }
function editContent(item: ContentItem) { contentEditingId.value = item.id; contentFormOpen.value = true; contentUploadMessage.value = ''; contentUploadFailures.value = []; contentUploadProgress.value = 0; contentRemovedAssets.value = []; contentUploadedInForm.value = []; contentForm.value = { title: item.title, contentType: item.contentType, summary: item.summary ?? '', body: item.body ?? '', mediaUrl: item.mediaUrl ?? '', mediaAssets: [...(item.mediaAssets ?? [])], anatomyNodeId: item.anatomyNodeId ?? '' }; }
async function refreshContent() {
  if (!canReadContent.value) return;
  const search = contentSearch.value.trim() || undefined;
  const [content, exercises] = await Promise.all([
    fetchContent(token.value, { status: contentStatusFilter.value || undefined, contentType: contentTypeFilter.value || undefined, search }),
    fetchAdminExerciseCatalog(token.value, search),
  ]);
  contentItems.value = content.items;
  exerciseCatalogItems.value = exercises.items;
  exerciseCatalogTotal.value = exercises.total;
}
async function refreshExerciseCatalog() {
  if (!canReadContent.value) return;
  const result = await fetchAdminExerciseCatalog(token.value, contentSearch.value.trim() || undefined);
  exerciseCatalogItems.value = result.items;
  exerciseCatalogTotal.value = result.total;
}
function resetExerciseForm() {
  exerciseEditingId.value = null;
  exerciseFormOpen.value = false;
  exerciseForm.value = { nameZh: '', nameEn: '', targetMuscles: [], equipment: '', location: '健身房', difficultyLevel: 'UNSPECIFIED', recommendedReps: '', recommendedSets: '', restSecondsMin: null, restSecondsMax: null, sourceNote: '' };
  exerciseTargetsText.value = '';
}
function editExercise(item: ExerciseCatalogItem) {
  exerciseEditingId.value = item.id;
  exerciseFormOpen.value = true;
  exerciseForm.value = { nameZh: item.nameZh, nameEn: item.nameEn ?? '', targetMuscles: [...item.targetMuscles], equipment: item.equipment ?? '', location: item.location ?? '健身房', difficultyLevel: item.difficultyLevel ?? 'UNSPECIFIED', recommendedReps: item.recommendedReps ?? '', recommendedSets: item.recommendedSets == null ? '' : String(item.recommendedSets), restSecondsMin: item.restSecondsMin, restSecondsMax: item.restSecondsMax, sourceNote: item.sourceNote ?? '' };
  exerciseTargetsText.value = item.targetMuscles.join(', ');
}
async function saveExercise() {
  if (!exerciseEditingId.value) return;
  const targets = exerciseTargetsText.value.split(/[、,\n]+/).flatMap((value) => value.split(',')).map((item) => item.trim()).filter(Boolean);
  if (!targets.length) { error.value = '至少填写一个目标肌群代码'; return; }
  exerciseLoading.value = true;
  try {
    await updateAdminExerciseCatalog(token.value, exerciseEditingId.value, { ...exerciseForm.value, targetMuscles: Array.from(new Set(targets)) });
    resetExerciseForm();
    await refreshExerciseCatalog();
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '更新动作失败'; }
  finally { exerciseLoading.value = false; }
}
function openMediaPreview(url: string, label: string, kind?: 'image' | 'video') {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return;
  previewMedia.value = { url: resolved, label, kind: kind ?? (isVideoUrl(url) ? 'video' : 'image') };
}
function closeMediaPreview() { previewMedia.value = null; }
function handleMediaPreviewClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest('.catalog-resource-strip a');
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (!anchor.querySelector('img, video')) return;
  event.preventDefault();
  openMediaPreview(anchor.href, anchor.title || '媒体预览', Boolean(anchor.querySelector('video')) ? 'video' : undefined);
}
async function refreshFoodCatalog() { if (!canReadAnalytics.value) return; foodCatalogItems.value = (await fetchAdminFoodCatalog(token.value, foodSearch.value.trim() || undefined, foodStatusFilter.value || undefined)).items; }

function resetFoodForm() {
  foodEditingId.value = null;
  foodFormOpen.value = false;
  foodUploadMessage.value = '';
  foodUploadFailures.value = [];
  foodUploadProgress.value = 0;
  foodRemovedAssets.value = [];
  foodUploadedInForm.value = [];
  foodForm.value = { name: '', serving: '100g', calories: 0, protein: 0, carbs: 0, fat: 0, source: 'YOU GYM', status: 'ACTIVE', mediaUrl: '', mediaAssets: [] };
}
function editFood(item: FoodCatalogItem) {
  foodEditingId.value = item.id;
  foodFormOpen.value = true;
  foodUploadMessage.value = '';
  foodUploadFailures.value = [];
  foodUploadProgress.value = 0;
  foodRemovedAssets.value = [];
  foodUploadedInForm.value = [];
  foodForm.value = { id: item.id, name: item.name, serving: item.serving, calories: Number(item.calories), protein: Number(item.protein), carbs: Number(item.carbs), fat: Number(item.fat), source: item.source, status: item.status, mediaUrl: item.mediaUrl ?? '', mediaAssets: [...(item.mediaAssets ?? [])] };
}
function startNewFood() { resetFoodForm(); foodFormOpen.value = true; }
async function saveFood() {
  foodLoading.value = true;
  error.value = '';
  const uploaded = [...foodUploadedInForm.value];
  try {
    if (foodEditingId.value) await updateFoodCatalogItem(token.value, foodEditingId.value, foodForm.value);
    else await createFoodCatalogItem(token.value, foodForm.value);
    const removed = [...foodRemovedAssets.value];
    resetFoodForm();
    await refreshFoodCatalog();
    const cleanup = await cleanupContentAssets(removed);
    if (!cleanup) error.value = '食物已保存，但部分未使用媒体资源清理失败';
  } catch (cause) {
    const cleanup = await cleanupContentAssets(uploaded);
    error.value = cause instanceof Error ? cause.message : '保存食物失败';
    if (!cleanup) error.value += '；部分未保存媒体资源清理失败';
  }
  finally { foodLoading.value = false; }
}
async function changeFoodStatus(item: FoodCatalogItem, status: FoodCatalogItem['status']) {
  try { await updateFoodCatalogStatus(token.value, item.id, status); await refreshFoodCatalog(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '更新食物状态失败'; }
}
async function removeFood(item: FoodCatalogItem) {
  if (!window.confirm(`确认删除“${item.name}”吗？该食物将不再出现在 App 食物搜索中。`)) return;
  try { await deleteFoodCatalogItem(token.value, item.id); await refreshFoodCatalog(); const cleanup = await cleanupContentAssets(item.mediaAssets ?? []); if (!cleanup) error.value = '食物已删除，但部分媒体资源清理失败'; }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '删除食物失败'; }
}
async function cleanupContentAssets(assets: ContentMediaAsset[]) {
  if (!assets.length) return true;
  const cleanup = await Promise.allSettled(assets.map((asset) => deleteContentMedia(token.value, asset.objectName)));
  return cleanup.every((result) => result.status === 'fulfilled');
}
async function saveContent() {
  contentLoading.value = true;
  error.value = '';
  const uploaded = [...contentUploadedInForm.value];
  try {
    if (contentEditingId.value) await updateContent(token.value, contentEditingId.value, contentForm.value);
    else await createContent(token.value, contentForm.value);
    const removed = [...contentRemovedAssets.value];
    const cleanup = await cleanupContentAssets(removed);
    resetContentForm();
    await refreshContent();
    if (!cleanup) error.value = '内容已保存，但部分未使用资源清理失败';
  } catch (cause) {
    const cleanupSucceeded = await cleanupContentAssets(uploaded);
    error.value = cause instanceof Error ? cause.message : '保存内容失败';
    if (!cleanupSucceeded) error.value += '；部分未保存资源清理失败';
  } finally { contentLoading.value = false; }
}
async function discardContentForm() {
  const cleanupSucceeded = await cleanupContentAssets([...contentUploadedInForm.value]);
  if (!cleanupSucceeded) error.value = '部分未保存资源清理失败';
  resetContentForm();
}
async function startNewContent() { await discardContentForm(); contentFormOpen.value = true; }
async function changeContentStatus(item: ContentItem, status: ContentStatus) { try { await updateContentStatus(token.value, item.id, status); await refreshContent(); } catch (cause) { error.value = cause instanceof Error ? cause.message : '更新内容状态失败'; } }
async function removeContent(item: ContentItem) {
  if (!window.confirm(`确认删除“${item.title}”吗？此操作不可撤销。`)) return;
  try {
    const result = await deleteContent(token.value, item.id);
    const cleanupSucceeded = await cleanupContentAssets(result.mediaAssets ?? []);
    await refreshContent();
    if (!cleanupSucceeded) error.value = '内容已删除，但部分媒体资源清理失败';
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '删除内容失败'; }
}
const contentAllowedExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'mp4', 'mov', 'avi', 'webm', 'mkv', 'glb', 'gltf', 'fbx', 'obj', 'stl', 'usdz', 'pdf', 'zip', 'json']);
function contentFileExtension(file: File) { return file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() ?? '' : ''; }
function validateContentFiles(files: File[]) {
  const valid: File[] = [];
  const failures: { fileName: string; error: string }[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    const key = `${file.name}:${file.size}:${file.lastModified}`;
    const extension = contentFileExtension(file);
    if (seen.has(key)) { failures.push({ fileName: file.name, error: '重复选择' }); continue; }
    seen.add(key);
    if (!contentAllowedExtensions.has(extension)) failures.push({ fileName: file.name, error: '不支持的文件格式' });
    else if (file.size > 50 * 1024 * 1024) failures.push({ fileName: file.name, error: '单个文件超过 50MB' });
    else valid.push(file);
  }
  return { valid, failures };
}
async function uploadContentFiles(files: File[]) {
  if (!files.length) return;
  const remaining = 10 - contentForm.value.mediaAssets.length;
  if (files.length > remaining) { contentUploadMessage.value = `本次最多还能上传 ${remaining} 个资源`; return; }
  const checked = validateContentFiles(files);
  contentUploadFailures.value = checked.failures;
  if (!checked.valid.length) { contentUploadMessage.value = checked.failures.length ? '没有可上传的资源' : '请选择资源'; return; }
  contentUploading.value = true; contentUploadProgress.value = 0; contentUploadMessage.value = '';
  try {
    const result = await uploadContentMedia(token.value, checked.valid, (progress) => { contentUploadProgress.value = progress; });
    contentForm.value.mediaAssets.push(...result.uploadedFiles);
    contentUploadedInForm.value.push(...result.uploadedFiles);
    contentUploadFailures.value.push(...result.failedFiles);
    if (!contentForm.value.mediaUrl && result.uploadedFiles[0]) contentForm.value.mediaUrl = result.uploadedFiles[0].url;
    const first = result.uploadedFiles[0];
    if (first) {
      const name = first.fileName.toLowerCase();
      if (first.fileType.startsWith('video/')) contentForm.value.contentType = 'VIDEO';
      else if (first.fileType === 'image/gif') contentForm.value.contentType = 'GIF';
      else if (/\.(glb|gltf|fbx|obj|stl|usdz)$/.test(name)) contentForm.value.contentType = 'MODEL_3D';
    }
    contentUploadMessage.value = contentUploadFailures.value.length
      ? `成功 ${result.uploadedCount} 个，失败 ${contentUploadFailures.value.length} 个`
      : `已上传 ${result.uploadedCount} 个资源`;
  } catch (cause) { contentUploadMessage.value = cause instanceof Error ? cause.message : '资源上传失败'; }
  finally { contentUploading.value = false; contentUploadProgress.value = 100; }
}
async function handleContentFiles(event: Event) { const input = event.target as HTMLInputElement; const files = Array.from(input.files ?? []); input.value = ''; await uploadContentFiles(files); }
async function handleContentDrop(event: DragEvent) { contentDropActive.value = false; await uploadContentFiles(Array.from(event.dataTransfer?.files ?? [])); }
function removeContentMedia(index: number) { const [asset] = contentForm.value.mediaAssets.splice(index, 1); if (asset && !contentRemovedAssets.value.some((item) => item.objectName === asset.objectName)) contentRemovedAssets.value.push(asset); contentForm.value.mediaUrl = contentForm.value.mediaAssets[0]?.url ?? ''; }
async function uploadFoodFiles(files: File[]) {
  if (!files.length) return;
  const remaining = 10 - (foodForm.value.mediaAssets?.length ?? 0);
  if (files.length > remaining) { foodUploadMessage.value = `本次最多还能上传 ${remaining} 个资源`; return; }
  const checked = validateContentFiles(files);
  foodUploadFailures.value = checked.failures;
  if (!checked.valid.length) { foodUploadMessage.value = checked.failures.length ? '没有可上传的资源' : '请选择资源'; return; }
  foodUploading.value = true; foodUploadProgress.value = 0; foodUploadMessage.value = '';
  try {
    const result = await uploadContentMedia(token.value, checked.valid, (progress) => { foodUploadProgress.value = progress; });
    if (!foodForm.value.mediaAssets) foodForm.value.mediaAssets = [];
    foodForm.value.mediaAssets.push(...result.uploadedFiles);
    foodUploadedInForm.value.push(...result.uploadedFiles);
    foodUploadFailures.value.push(...result.failedFiles);
    if (!foodForm.value.mediaUrl && result.uploadedFiles[0]) foodForm.value.mediaUrl = result.uploadedFiles[0].url;
    foodUploadMessage.value = foodUploadFailures.value.length ? `成功 ${result.uploadedCount} 个，失败 ${foodUploadFailures.value.length} 个` : `已上传 ${result.uploadedCount} 个资源`;
  } catch (cause) { foodUploadMessage.value = cause instanceof Error ? cause.message : '资源上传失败'; }
  finally { foodUploading.value = false; foodUploadProgress.value = 100; }
}
async function handleFoodFiles(event: Event) { const input = event.target as HTMLInputElement; const files = Array.from(input.files ?? []); input.value = ''; await uploadFoodFiles(files); }
function removeFoodMedia(index: number) { const [asset] = (foodForm.value.mediaAssets ?? []).splice(index, 1); if (asset && !foodRemovedAssets.value.some((item) => item.objectName === asset.objectName)) foodRemovedAssets.value.push(asset); foodForm.value.mediaUrl = foodForm.value.mediaAssets?.[0]?.url ?? ''; }

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
const nutritionTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['饮食事件', '匿名用户'], textStyle: { color: '#a5acb8' } },
  grid: { left: 42, right: 18, top: 38, bottom: 28 },
  xAxis: { type: 'category', data: nutrition.value?.trend.map((point) => point.date.slice(5)) ?? [], axisLabel: { color: '#8c95a3' } },
  yAxis: { type: 'value', minInterval: 1, axisLabel: { color: '#8c95a3' } },
  series: [
    { name: '饮食事件', type: 'line', smooth: true, showSymbol: false, data: nutrition.value?.trend.map((point) => point.eventCount) ?? [], lineStyle: { color: '#ffb020', width: 2 }, itemStyle: { color: '#ffb020' } },
    { name: '匿名用户', type: 'line', smooth: true, showSymbol: false, data: nutrition.value?.trend.map((point) => point.uniqueUsers) ?? [], lineStyle: { color: '#35e6e8', width: 2 }, itemStyle: { color: '#35e6e8' } },
  ],
} as const));

async function refresh() {
  loading.value = true;
  error.value = '';
  try {
    const session = await fetchAdminSession(token.value);
    role.value = session.role;
    permissions.value = session.permissions;
    const { from, to } = rangeBounds();
    const [nextDashboard, nextSummary, nextEvents, nextAudit, nextAccounts, nextSessions, nextAnatomy, nextContent, nextExercises, nextNutrition, nextUsers, nextAppUsers, nextAppWorkouts, nextAppNutrition, nextFoods] = await Promise.all([
      fetchAnalyticsDashboard(token.value, from, to),
      fetchAnalyticsSummary(token.value, from, to),
      fetchAnalyticsEvents(token.value, selectedEvent.value || undefined),
      session.permissions.includes('AUDIT_READ') ? fetchAuditLogs(token.value) : Promise.resolve({ items: [] as AuditLog[] }),
      session.permissions.includes('ADMIN_ACCOUNT_MANAGE') ? fetchAdminAccounts(token.value) : Promise.resolve({ items: [] as AdminAccount[] }),
      session.permissions.includes('ADMIN_ACCOUNT_MANAGE') ? fetchAdminSessions(token.value) : Promise.resolve({ items: [] as AdminSessionView[] }),
      session.permissions.includes('ANALYTICS_READ') ? fetchAdminAnatomyNodes(token.value) : Promise.resolve({ version: 1, items: [] as AnatomyNode[] }),
      session.permissions.includes('CONTENT_READ') ? fetchContent(token.value, { status: contentStatusFilter.value || undefined, contentType: contentTypeFilter.value || undefined, search: contentSearch.value.trim() || undefined }) : Promise.resolve({ items: [] as ContentItem[] }),
      session.permissions.includes('CONTENT_READ') ? fetchAdminExerciseCatalog(token.value, contentSearch.value.trim() || undefined) : Promise.resolve({ source: 'exercise_catalog', total: 0, items: [] as ExerciseCatalogItem[] }),
      session.permissions.includes('ANALYTICS_READ') ? fetchNutritionDashboard(token.value, from, to) : Promise.resolve(null),
      session.permissions.includes('ANALYTICS_READ') ? fetchAnalyticsUsers(token.value, from, to, userSearch.value.trim() || undefined) : Promise.resolve({ items: [] as AnalyticsUser[] }),
      session.permissions.includes('ANALYTICS_READ') ? fetchAppUsers(token.value) : Promise.resolve({ items: [] as AppUser[] }),
      session.permissions.includes('ANALYTICS_READ') ? fetchAppWorkouts(token.value) : Promise.resolve({ items: [] as WorkoutRecord[] }),
      session.permissions.includes('ANALYTICS_READ') ? fetchAppNutrition(token.value) : Promise.resolve({ items: [] as NutritionRecord[] }),
      session.permissions.includes('ANALYTICS_READ') ? fetchAdminFoodCatalog(token.value, foodSearch.value.trim() || undefined, foodStatusFilter.value || undefined) : Promise.resolve({ items: [] as FoodCatalogItem[] }),
    ]);
    dashboard.value = nextDashboard;
    summary.value = nextSummary;
    events.value = nextEvents.items;
    auditLogs.value = nextAudit.items;
    adminAccounts.value = nextAccounts.items;
    adminSessions.value = nextSessions.items;
    anatomyNodes.value = nextAnatomy.items;
    contentItems.value = nextContent.items;
    exerciseCatalogItems.value = nextExercises.items;
    exerciseCatalogTotal.value = nextExercises.total;
    nutrition.value = nextNutrition;
    analyticsUsers.value = nextUsers.items;
    appUsers.value = nextAppUsers.items;
    appWorkouts.value = nextAppWorkouts.items;
    appNutrition.value = nextAppNutrition.items;
    foodCatalogItems.value = nextFoods.items;
    lastUpdated.value = new Date().toLocaleString();
  } catch (cause) {
    role.value = null; permissions.value = []; dashboard.value = null; summary.value = null; events.value = [];
    auditLogs.value = []; adminAccounts.value = []; adminSessions.value = []; anatomyNodes.value = []; contentItems.value = []; exerciseCatalogItems.value = []; exerciseCatalogTotal.value = 0; nutrition.value = null; analyticsUsers.value = []; appUsers.value = []; appWorkouts.value = []; appNutrition.value = []; foodCatalogItems.value = [];
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
async function logout() { const current = token.value; try { if (isSession.value) await logoutAdmin(current); } finally { localStorage.removeItem(sessionStorageKey); token.value = ''; role.value = null; permissions.value = []; dashboard.value = null; summary.value = null; events.value = []; auditLogs.value = []; adminSessions.value = []; anatomyNodes.value = []; contentItems.value = []; exerciseCatalogItems.value = []; exerciseCatalogTotal.value = 0; nutrition.value = null; analyticsUsers.value = []; appUsers.value = []; appWorkouts.value = []; appNutrition.value = []; foodCatalogItems.value = []; } }
async function downloadCsv() { try { if (!canExport.value) return; const blob = await downloadAnalyticsCsv(token.value); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'analytics-events.csv'; anchor.click(); URL.revokeObjectURL(url); } catch (cause) { error.value = cause instanceof Error ? cause.message : '导出失败'; } }
async function downloadNutritionEventsCsv() { try { if (!canExport.value) return; const blob = await downloadNutritionCsv(token.value); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'nutrition-events.csv'; anchor.click(); URL.revokeObjectURL(url); } catch (cause) { error.value = cause instanceof Error ? cause.message : '饮食数据导出失败'; } }
async function downloadUsersCsv() { try { if (!canExport.value) return; const blob = await downloadAnalyticsUsersCsv(token.value); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'analytics-users.csv'; anchor.click(); URL.revokeObjectURL(url); } catch (cause) { error.value = cause instanceof Error ? cause.message : '用户数据导出失败'; } }
onMounted(() => {
  window.addEventListener('hashchange', syncModuleFromHash);
  document.addEventListener('click', handleMediaPreviewClick);
  if (!window.location.hash) window.history.replaceState(null, '', '#/dashboard');
  if (token.value) void refresh();
});
onBeforeUnmount(() => { window.removeEventListener('hashchange', syncModuleFromHash); document.removeEventListener('click', handleMediaPreviewClick); });
</script>

<template>
  <AdminAuthView v-if="!role" @authenticated="handleAuthenticated" />
  <div v-else class="shell">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">YG</span><span>YOU GYM</span></div>
      <nav class="nav" aria-label="后台导航">
        <button :class="['nav-item', { active: activeModule === 'dashboard' }]" type="button" @click="navigateTo('dashboard')"><LayoutDashboard :size="17" /><span class="nav-label">仪表盘</span></button>
        <button v-if="canReadAnalytics" :class="['nav-item', { active: activeModule === 'analytics' }]" type="button" @click="navigateTo('analytics')"><BarChart3 :size="17" /><span class="nav-label">数据分析</span></button>
        <button v-if="canReadAnalytics" :class="['nav-item', { active: activeModule === 'users' }]" type="button" @click="navigateTo('users')"><UsersRound :size="17" /><span class="nav-label">用户管理</span></button>
        <button v-if="canReadAnalytics" :class="['nav-item', { active: activeModule === 'nutrition' }]" type="button" @click="navigateTo('nutrition')"><Apple :size="17" /><span class="nav-label">饮食管理</span></button>
        <button v-if="canReadContent" :class="['nav-item', { active: activeModule === 'content' }]" type="button" @click="navigateTo('content')"><BookOpen :size="17" /><span class="nav-label">内容中心</span></button>
        <button v-if="role !== 'EMPLOYEE'" :class="['nav-item', { active: activeModule === 'anatomy' }]" type="button" @click="navigateTo('anatomy')"><Dumbbell :size="17" /><span class="nav-label">解剖中心</span></button>
        <button v-if="role !== 'EMPLOYEE'" :class="['nav-item', { active: activeModule === 'review' }]" type="button" @click="navigateTo('review')"><ClipboardCheck :size="17" /><span class="nav-label">审核中心</span><span class="nav-badge">预留</span></button>
        <button v-if="role === 'SUPER_ADMIN'" :class="['nav-item', { active: activeModule === 'system' }]" type="button" @click="navigateTo('system')"><Settings :size="17" /><span class="nav-label">系统管理</span></button>
        <button v-if="canReadAudit" :class="['nav-item', { active: activeModule === 'audit' }]" type="button" @click="navigateTo('audit')"><FileClock :size="17" /><span class="nav-label">审计日志</span></button>
      </nav>
      <div class="sidebar-footer">本地开发环境<br /><small>RBAC 权限已启用</small></div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div><p class="eyebrow">{{ currentModuleMeta.eyebrow }}</p><h1>{{ currentModuleMeta.title }}</h1><p class="page-description">{{ currentModuleMeta.description }}</p></div>
        <div class="header-meta"><span class="role-badge">{{ roleLabel }}</span><div class="environment">LOCAL</div></div>
      </header>
      <div class="toolbar module-toolbar" aria-label="页面操作">
        <button class="button primary icon-text-button" type="button" :disabled="loading" @click="refresh"><RefreshCw :size="15" :class="{ spinning: loading }" />{{ loading ? '加载中…' : '刷新数据' }}</button>
        <label v-if="['dashboard', 'analytics', 'nutrition'].includes(activeModule)" class="range-control">时间范围<select v-model.number="rangeDays" aria-label="选择数据时间范围" @change="refresh"><option :value="7">近 7 天</option><option :value="30">近 30 天</option><option :value="90">近 90 天</option></select></label>
        <button v-if="activeModule === 'analytics' && canExport" class="button" type="button" :disabled="!summary" @click="downloadCsv">导出 CSV</button>
        <button class="button toolbar-logout" type="button" @click="logout">退出会话</button>
      </div>
      <p v-if="error" class="alert" role="alert">{{ error }}</p><p v-else-if="lastUpdated" class="updated">最近更新：{{ lastUpdated }}</p>
      <section v-if="activeModule === 'dashboard'" class="stats" aria-label="汇总指标">
        <article class="stat metric-stat"><span class="metric-icon lime"><Activity :size="20" /></span><div><span>事件总量</span><strong>{{ totalEvents }}</strong><small>当前时间窗口内</small></div></article>
        <article class="stat metric-stat"><span class="metric-icon cyan"><UserRound :size="20" /></span><div><span>匿名设备</span><strong>{{ totalUsers }}</strong><small>按匿名 ID 去重</small></div></article>
        <article class="stat metric-stat"><span class="metric-icon blue"><UsersRound :size="20" /></span><div><span>会话数</span><strong>{{ totalSessions }}</strong><small>按 session ID 去重</small></div></article>
        <article class="stat metric-stat"><span class="metric-icon amber"><Upload :size="20" /></span><div><span>上传失败率</span><strong>{{ ((dashboard?.kpis.uploadFailureRate ?? 0) * 100).toFixed(1) }}%</strong><small>{{ dashboard?.kpis.uploadFailureCount ?? 0 }} 次失败</small></div></article>
      </section>
      <section v-if="activeModule === 'dashboard'" class="dashboard-grid">
        <article class="panel chart-panel chart-wide"><div class="panel-heading"><div><p class="eyebrow">DAILY TREND</p><h2>每日趋势</h2></div><span class="panel-note">事件与匿名设备</span></div><DashboardChart :option="trendOption" :empty="!dashboard?.trend.length" /></article>
        <article class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">EVENT RANKING</p><h2>事件类型排行</h2></div><span class="panel-note">{{ eventTypeCount }} 类</span></div><DashboardChart :option="eventOption" :empty="!dashboard?.eventDistribution.length" /></article>
        <article class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">ANATOMY RANKING</p><h2>热门解剖区域</h2></div></div><DashboardChart :option="anatomyOption" :empty="!dashboard?.anatomyRanking.length" /></article>
        <article class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">ANATOMY FUNNEL</p><h2>解剖行为漏斗</h2></div><span class="panel-note">训练事件接入后自动增长</span></div><DashboardChart :option="funnelOption" :empty="!dashboard?.funnel.some((item) => item.eventCount)" /></article>
        <article class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">PLATFORM MIX</p><h2>平台分布</h2></div></div><DashboardChart :option="platformOption" :empty="!dashboard?.platformDistribution.length" /></article>
      </section>
      <section v-if="activeModule === 'dashboard'" class="quick-access" aria-label="快捷入口">
        <button v-if="canReadAnalytics" type="button" @click="navigateTo('users')"><span class="quick-icon"><UsersRound :size="20" /></span><span><strong>用户管理</strong><small>{{ appUsers.length }} 个注册账户</small></span><ChevronRight :size="17" /></button>
        <button v-if="canReadContent" type="button" @click="navigateTo('content')"><span class="quick-icon"><BookOpen :size="20" /></span><span><strong>内容中心</strong><small>{{ contentItems.length }} 条内容</small></span><ChevronRight :size="17" /></button>
        <button v-if="canReadAnalytics" type="button" @click="navigateTo('nutrition')"><span class="quick-icon"><Apple :size="20" /></span><span><strong>饮食管理</strong><small>{{ appNutrition.length }} 条饮食记录</small></span><ChevronRight :size="17" /></button>
      </section>
      <section v-if="activeModule === 'analytics'" class="content-grid module-content-grid">
        <article class="panel"><div class="panel-heading"><div><p class="eyebrow">EVENT SUMMARY</p><h2>事件明细</h2></div></div><div v-if="summary?.items.length" class="summary-list"><div v-for="item in summary.items" :key="item.eventName" class="summary-row"><div class="summary-name"><strong>{{ item.eventName }}</strong><span>{{ item.uniqueUsers }} 个匿名设备</span></div><strong>{{ item.eventCount }}</strong></div></div><div v-else class="empty">暂无事件数据</div></article>
        <article class="panel"><div class="panel-heading"><div><p class="eyebrow">RECENT EVENTS</p><h2>最近事件</h2></div><select v-model="selectedEvent" aria-label="按事件名称筛选" @change="refresh"><option value="">全部事件</option><option v-for="item in summary?.items ?? []" :key="item.eventName" :value="item.eventName">{{ item.eventName }}</option></select></div><div class="table-wrap"><table><thead><tr><th>事件</th><th>屏幕</th><th>平台</th><th>发生时间</th></tr></thead><tbody><tr v-for="event in events" :key="event.eventId"><td><strong>{{ event.eventName }}</strong><small>{{ event.analyticsUserId ?? '未标识' }}</small></td><td>{{ event.screenId ?? '-' }}</td><td>{{ event.platform ?? '-' }}</td><td>{{ new Date(event.occurredAt).toLocaleString() }}</td></tr></tbody></table><div v-if="!events.length" class="empty">暂无匹配事件</div></div></article>
      </section>
      <section v-if="activeModule === 'users' && canReadAnalytics" class="panel audit-panel users-center module-panel">
        <div class="panel-heading"><div><p class="eyebrow">USER DIRECTORY</p><h2>用户数据管理</h2></div><div class="content-actions"><span class="panel-note">匿名行为目录 · {{ analyticsUsers.length }} 个用户</span><button v-if="canExport" class="button" type="button" @click="downloadUsersCsv">导出用户 CSV</button></div></div>
        <p class="panel-note user-data-note">当前版本按分析 ID 聚合用户行为，不包含手机号、姓名等个人信息。接入 App 用户表后，这里可扩展账号状态、注册来源和登录设备管理。</p>
        <div class="content-toolbar user-toolbar"><input v-model="userSearch" placeholder="搜索匿名用户 ID" aria-label="搜索用户" @keyup.enter="refresh" /><button class="button" type="button" @click="refresh">查询</button></div>
        <div class="table-wrap"><table><thead><tr><th>用户 ID</th><th>用户类型</th><th>事件数</th><th>首次访问</th><th>最近访问</th><th>平台</th></tr></thead><tbody><tr v-for="user in analyticsUsers" :key="user.analyticsUserId"><td><strong>{{ user.analyticsUserId }}</strong></td><td><span :class="['status', user.analyticsUserId.startsWith('anonymous_') ? 'draft' : 'active']">{{ user.analyticsUserId.startsWith('anonymous_') ? '游客' : '已识别' }}</span></td><td>{{ user.eventCount }}</td><td>{{ new Date(user.firstSeen).toLocaleString() }}</td><td>{{ new Date(user.lastSeen).toLocaleString() }}</td><td>{{ user.platform ?? '-' }}</td></tr></tbody></table><div v-if="!analyticsUsers.length" class="empty">暂无用户行为数据</div></div>
      </section>
      <section v-if="activeModule === 'users' && canReadAnalytics" class="panel audit-panel users-center module-panel">
        <div class="panel-heading"><div><p class="eyebrow">APP USER ACCOUNTS</p><h2>App 用户数据</h2></div><span class="panel-note">{{ appUsers.length }} 个注册账户</span></div>
        <div class="table-wrap"><table><thead><tr><th>手机号</th><th>昵称</th><th>目标</th><th>经验</th><th>状态</th><th>注册时间</th><th>最近登录</th></tr></thead><tbody><tr v-for="user in appUsers" :key="user.id"><td><strong>{{ user.phone }}</strong></td><td>{{ user.nickname }}</td><td>{{ user.goal || '-' }}</td><td>{{ user.experienceLevel || '-' }}</td><td><span class="status active">{{ user.status }}</span></td><td>{{ new Date(user.createdAt).toLocaleString() }}</td><td>{{ user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-' }}</td></tr></tbody></table><div v-if="!appUsers.length" class="empty">暂无 App 注册用户</div></div>
        <div class="content-grid"><article class="panel"><div class="panel-heading"><div><p class="eyebrow">WORKOUT RECORDS</p><h2>训练记录</h2></div><span class="panel-note">{{ appWorkouts.length }} 条</span></div><div class="table-wrap"><table><thead><tr><th>用户</th><th>训练</th><th>时长</th><th>组数</th><th>容量</th><th>完成时间</th></tr></thead><tbody><tr v-for="item in appWorkouts" :key="item.id"><td>{{ item.userId.slice(0, 8) }}</td><td>{{ item.title }}</td><td>{{ Math.round(item.durationSeconds / 60) }} 分钟</td><td>{{ item.totalSets }}</td><td>{{ item.totalVolume }}</td><td>{{ new Date(item.completedAt).toLocaleString() }}</td></tr></tbody></table><div v-if="!appWorkouts.length" class="empty">暂无训练记录</div></div></article><article class="panel"><div class="panel-heading"><div><p class="eyebrow">NUTRITION RECORDS</p><h2>饮食记录</h2></div><span class="panel-note">{{ appNutrition.length }} 条</span></div><div class="table-wrap"><table><thead><tr><th>用户</th><th>餐次</th><th>热量</th><th>蛋白质</th><th>食物数</th><th>记录时间</th></tr></thead><tbody><tr v-for="item in appNutrition" :key="item.id"><td>{{ item.userId.slice(0, 8) }}</td><td>{{ item.mealName }}</td><td>{{ item.calories }} kcal</td><td>{{ item.proteinG }} g</td><td>{{ item.foodCount }}</td><td>{{ new Date(item.recordedAt).toLocaleString() }}</td></tr></tbody></table><div v-if="!appNutrition.length" class="empty">暂无饮食记录</div></div></article></div>
      </section>
      <section v-if="activeModule === 'nutrition' && canReadAnalytics" class="panel audit-panel nutrition-center module-panel">
        <div class="panel-heading"><div><p class="eyebrow">NUTRITION OPERATIONS</p><h2>饮食管理</h2></div><div class="content-actions"><span class="panel-note">行为数据 · {{ nutrition?.kpis.eventCount ?? 0 }} 条</span><button v-if="canExport" class="button" type="button" @click="downloadNutritionEventsCsv">导出饮食 CSV</button></div></div>
        <div class="stats nutrition-stats">
          <article class="stat"><span>饮食页访问</span><strong>{{ nutrition?.kpis.screenViews ?? 0 }}</strong><small>nutrition_screen_viewed</small></article>
          <article class="stat"><span>食物搜索</span><strong>{{ nutrition?.kpis.foodSearches ?? 0 }}</strong><small>nutrition_food_search_opened</small></article>
          <article class="stat"><span>食物选择</span><strong>{{ nutrition?.kpis.itemSelections ?? 0 }}</strong><small>nutrition_item_selected</small></article>
          <article class="stat"><span>餐次记录</span><strong>{{ nutrition?.kpis.mealRecords ?? 0 }}</strong><small>nutrition_meal_recorded</small></article>
        </div>
        <div class="panel catalog-panel">
          <div class="panel-heading"><div><p class="eyebrow">FOOD CATALOG</p><h2>食物目录</h2></div><div class="content-actions"><span class="panel-note">{{ foodCatalogItems.length }} 种食物</span><button v-if="canManageCatalog" class="button primary" type="button" @click="startNewFood">新增食物</button></div></div>
          <div class="content-toolbar catalog-toolbar"><input v-model="foodSearch" placeholder="搜索食物或数据来源" aria-label="搜索食物" @keyup.enter="refreshFoodCatalog" /><select v-model="foodStatusFilter" aria-label="按食物状态筛选" @change="refreshFoodCatalog"><option value="">全部状态</option><option value="ACTIVE">已上架</option><option value="INACTIVE">已下架</option></select><button class="button" type="button" @click="refreshFoodCatalog">查询</button></div>
          <form v-if="foodFormOpen && canManageCatalog" class="food-form" aria-label="食物目录表单" @submit.prevent="saveFood">
            <input v-model="foodForm.name" required maxlength="120" placeholder="食物名称" aria-label="食物名称" />
            <input v-model="foodForm.id" maxlength="64" :disabled="Boolean(foodEditingId)" placeholder="食物 ID（可选）" aria-label="食物 ID" />
            <input v-model="foodForm.serving" required maxlength="32" placeholder="份量，如 100g" aria-label="份量" />
            <input v-model="foodForm.source" required maxlength="80" placeholder="数据来源" aria-label="数据来源" />
            <label>热量 <input v-model.number="foodForm.calories" required min="0" step="0.01" type="number" aria-label="每 100g 热量" /></label>
            <label>蛋白质 <input v-model.number="foodForm.protein" required min="0" step="0.01" type="number" aria-label="每 100g 蛋白质" /></label>
            <label>碳水 <input v-model.number="foodForm.carbs" required min="0" step="0.01" type="number" aria-label="每 100g 碳水" /></label>
            <label>脂肪 <input v-model.number="foodForm.fat" required min="0" step="0.01" type="number" aria-label="每 100g 脂肪" /></label>
            <input v-model="foodForm.mediaUrl" type="url" placeholder="外部图片或视频地址（可选）" aria-label="食物媒体地址" />
            <div class="media-uploader food-media-uploader">
              <input ref="foodUploadInput" class="visually-hidden" type="file" multiple accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.mp4,.mov,.avi,.webm,.mkv" @change="handleFoodFiles" />
              <button class="button" type="button" :disabled="foodUploading || (foodForm.mediaAssets?.length ?? 0) >= 10" @click="foodUploadInput?.click()">{{ foodUploading ? `上传中 ${foodUploadProgress}%` : '上传图片 / 视频' }}</button>
              <span>单文件不超过 50MB，最多 10 个</span>
              <progress v-if="foodUploading" class="media-progress" max="100" :value="foodUploadProgress" aria-label="食物媒体上传进度" />
              <small v-if="foodUploadMessage">{{ foodUploadMessage }}</small>
              <ul v-if="foodUploadFailures.length" class="upload-failures"><li v-for="failure in foodUploadFailures" :key="`${failure.fileName}-${failure.error}`">{{ failure.fileName }}：{{ failure.error }}</li></ul>
            </div>
            <div v-if="foodForm.mediaAssets?.length" class="content-media-list food-media-list">
              <div v-for="(asset, index) in foodForm.mediaAssets" :key="asset.objectName" class="content-media-item">
              <img v-if="asset.fileType.startsWith('image/')" :src="resolveMediaUrl(asset.url)" :alt="asset.fileName" @click="openMediaPreview(asset.url, asset.fileName, 'image')" />
                <video v-else-if="asset.fileType.startsWith('video/')" :src="resolveMediaUrl(asset.url)" muted preload="metadata" controls />
                <div v-else class="resource-type">{{ asset.fileName.split('.').pop()?.toUpperCase() }}</div>
                <div><strong>{{ asset.fileName }}</strong><small>{{ (asset.fileSize / 1024 / 1024).toFixed(2) }} MB</small></div>
                <button class="media-remove" type="button" aria-label="移除食物媒体" @click="removeFoodMedia(index)">×</button>
              </div>
            </div>
            <div class="form-actions"><button class="button primary" type="submit" :disabled="foodLoading">{{ foodLoading ? '保存中…' : foodEditingId ? '保存修改' : '创建食物' }}</button><button class="button" type="button" :disabled="foodLoading" @click="resetFoodForm">取消</button></div>
          </form>
          <div class="table-wrap"><table><thead><tr><th>食物</th><th>媒体</th><th>份量</th><th>热量</th><th>蛋白质</th><th>碳水</th><th>脂肪</th><th>来源</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="item in foodCatalogItems" :key="item.id"><td><strong>{{ item.name }}</strong><small>{{ item.id }}</small></td><td><div class="catalog-resource-strip"><template v-for="(asset, index) in item.mediaAssets ?? []" :key="asset.objectName || index"><a :href="resolveMediaUrl(asset.url)" target="_blank" rel="noreferrer" :title="asset.fileName"><img v-if="asset.fileType.startsWith('image/') || isImageUrl(asset.url)" :src="resolveMediaUrl(asset.url)" :alt="asset.fileName" /><video v-else-if="asset.fileType.startsWith('video/') || isVideoUrl(asset.url)" :src="resolveMediaUrl(asset.url)" muted preload="metadata" /><span v-else>{{ asset.fileName.split('.').pop()?.toUpperCase() }}</span></a></template><a v-if="!item.mediaAssets?.length && item.mediaUrl" :href="resolveMediaUrl(item.mediaUrl)" target="_blank" rel="noreferrer" title="打开媒体"><img v-if="isImageUrl(item.mediaUrl)" :src="resolveMediaUrl(item.mediaUrl)" alt="食物媒体" /><video v-else-if="isVideoUrl(item.mediaUrl)" :src="resolveMediaUrl(item.mediaUrl)" muted preload="metadata" /><span v-else>打开</span></a><span v-if="!item.mediaAssets?.length && !item.mediaUrl" class="media-empty">暂无</span></div></td><td>{{ item.serving }}</td><td>{{ item.calories }} kcal</td><td>{{ item.protein }} g</td><td>{{ item.carbs }} g</td><td>{{ item.fat }} g</td><td>{{ item.source }}</td><td><span :class="['status', item.status === 'ACTIVE' ? 'active' : 'locked']">{{ item.status === 'ACTIVE' ? '已上架' : '已下架' }}</span></td><td class="content-actions"><button v-if="canManageCatalog" class="table-action" type="button" @click="editFood(item)">编辑</button><button v-if="canManageCatalog" class="table-action" type="button" @click="changeFoodStatus(item, item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')">{{ item.status === 'ACTIVE' ? '下架' : '上架' }}</button><button v-if="canManageCatalog" class="table-action danger" type="button" @click="removeFood(item)">删除</button></td></tr></tbody></table><div v-if="!foodCatalogItems.length" class="empty">暂无食物目录数据</div></div>
        </div>
        <div class="dashboard-grid nutrition-grid">
          <article class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">NUTRITION TREND</p><h2>饮食行为趋势</h2></div></div><DashboardChart :option="nutritionTrendOption" :empty="!nutrition?.trend.length" /></article>
          <article class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">MEAL DISTRIBUTION</p><h2>餐次记录分布</h2></div></div><div v-if="nutrition?.mealDistribution.length" class="summary-list"><div v-for="item in nutrition.mealDistribution" :key="item.name" class="summary-row"><div class="summary-name"><strong>{{ item.name }}</strong><span>{{ item.uniqueUsers }} 个匿名用户</span></div><strong>{{ item.eventCount }}</strong></div></div><div v-else class="empty">暂无餐次记录</div></article>
        </div>
        <div class="table-wrap"><table><thead><tr><th>时间</th><th>行为</th><th>页面</th><th>平台</th><th>匿名用户</th><th>属性</th></tr></thead><tbody><tr v-for="event in nutrition?.recentEvents ?? []" :key="event.eventId"><td>{{ new Date(event.occurredAt).toLocaleString() }}</td><td><strong>{{ event.eventName }}</strong></td><td>{{ event.screenId ?? '-' }}</td><td>{{ event.platform ?? '-' }}</td><td>{{ event.analyticsUserId ?? '-' }}</td><td class="properties-cell">{{ event.propertiesJson }}</td></tr></tbody></table><div v-if="!nutrition?.recentEvents.length" class="empty">暂无饮食行为数据</div></div>
      </section>
      <section v-if="activeModule === 'anatomy' && role !== 'EMPLOYEE'" class="panel audit-panel module-panel"><div class="panel-heading"><div><p class="eyebrow">ANATOMY CATALOG</p><h2>解剖节点目录</h2></div><span class="panel-note">{{ anatomyNodes.length }} 个节点 · V1</span></div><div class="anatomy-grid"><article v-for="region in anatomyRegions" :key="region.id" class="anatomy-region"><div class="anatomy-region-heading"><strong>{{ region.nameZh }}</strong><small>{{ region.nameEn }}</small></div><div class="anatomy-tags"><span v-for="node in anatomyDescendants(region.id)" :key="node.id" :class="['anatomy-tag', `level-${node.level}`]">{{ node.nameZh }}</span></div></article></div><div v-if="!anatomyNodes.length" class="empty">暂无解剖节点</div></section>
      <section v-if="activeModule === 'review' && role !== 'EMPLOYEE'" class="coming-soon module-panel"><span class="coming-icon"><ClipboardCheck :size="28" /></span><p class="eyebrow">REVIEW WORKSPACE</p><h2>审核工作台正在建设中</h2><p>已为内容审核、举报处理和阿里云内容安全服务预留独立模块。</p></section>
      <section v-if="activeModule === 'audit' && canReadAudit" class="panel audit-panel module-panel"><div class="panel-heading"><div><p class="eyebrow">AUDIT TRAIL</p><h2>最近审计操作</h2></div><span class="panel-note">管理员可见</span></div><div class="table-wrap"><table><thead><tr><th>时间</th><th>操作者</th><th>动作</th><th>资源</th><th>来源 IP</th></tr></thead><tbody><tr v-for="log in auditLogs" :key="log.id"><td>{{ new Date(log.occurredAt).toLocaleString() }}</td><td>{{ log.actorSubject }}<small>{{ log.actorRole }}</small></td><td><strong>{{ log.action }}</strong></td><td>{{ log.resourceType }}</td><td>{{ log.ipAddress ?? '-' }}</td></tr></tbody></table><div v-if="!auditLogs.length" class="empty">暂无审计记录</div></div></section>
      <section v-if="activeModule === 'system' && role === 'SUPER_ADMIN'" class="panel audit-panel module-panel"><div class="panel-heading"><div><p class="eyebrow">SYSTEM ACCESS</p><h2>管理员账号</h2></div><span class="panel-note">超级管理员专属</span></div><form class="account-form" aria-label="创建管理员账号" @submit.prevent="createAccount"><input v-model="accountForm.username" required pattern="[A-Za-z0-9._-]{3,80}" placeholder="用户名" autocomplete="username" /><input v-model="accountForm.displayName" required placeholder="显示名称" /><input v-model="accountForm.password" required minlength="12" type="password" placeholder="初始密码（至少 12 位）" autocomplete="new-password" /><select v-model="accountForm.role"><option value="ADMIN">管理员</option><option value="EMPLOYEE">普通员工</option></select><button class="button primary" type="submit" :disabled="accountLoading">{{ accountLoading ? '创建中…' : '创建账号' }}</button></form><div class="table-wrap"><table><thead><tr><th>用户名</th><th>名称</th><th>角色</th><th>状态</th><th>最后登录</th><th>操作</th></tr></thead><tbody><tr v-for="account in adminAccounts" :key="account.id"><td><strong>{{ account.username }}</strong></td><td>{{ account.displayName }}</td><td>{{ account.role }}</td><td><span :class="['status', account.status === 'ACTIVE' ? 'active' : 'locked']">{{ account.status === 'ACTIVE' ? '正常' : '已锁定' }}</span></td><td>{{ account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : '-' }}</td><td><button class="table-action" type="button" @click="toggleAccount(account)">{{ account.status === 'ACTIVE' ? '锁定' : '解锁' }}</button></td></tr></tbody></table><div v-if="!adminAccounts.length" class="empty">暂无管理员账号</div></div><div class="panel-heading session-heading"><div><p class="eyebrow">ACTIVE SESSIONS</p><h2>管理员会话</h2></div><button class="button" type="button" @click="revokeOtherSessions">撤销其他会话</button></div><div class="table-wrap"><table><thead><tr><th>用户名</th><th>角色</th><th>创建时间</th><th>最后使用</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="session in adminSessions" :key="session.id"><td><strong>{{ session.username }}</strong><small>{{ session.displayName }}</small></td><td>{{ session.role }}</td><td>{{ new Date(session.createdAt).toLocaleString() }}</td><td>{{ new Date(session.lastUsedAt).toLocaleString() }}</td><td><span :class="['status', session.active ? 'active' : 'locked']">{{ session.active ? '使用中' : '已撤销' }}</span></td><td><button v-if="session.active" class="table-action" type="button" @click="revokeSession(session)">撤销</button><span v-else>-</span></td></tr></tbody></table><div v-if="!adminSessions.length" class="empty">暂无会话</div></div></section>
      <section v-if="activeModule === 'content' && canReadContent" class="panel audit-panel content-center module-panel">
        <div class="panel-heading"><div><p class="eyebrow">CONTENT CENTER</p><h2>内容中心</h2></div><span class="panel-note">{{ contentItems.length }} 条内容</span></div>
        <div class="content-toolbar"><input v-model="contentSearch" placeholder="搜索标题或摘要" aria-label="搜索内容" @keyup.enter="refreshContent" /><select v-model="contentStatusFilter" aria-label="按状态筛选" @change="refreshContent"><option value="">全部状态</option><option value="DRAFT">草稿</option><option value="PUBLISHED">已发布</option><option value="ARCHIVED">已归档</option></select><select v-model="contentTypeFilter" aria-label="按类型筛选" @change="refreshContent"><option value="">全部类型</option><option v-for="(label, type) in contentTypeLabel" :key="type" :value="type">{{ label }}</option></select><button v-if="canManageContent" class="button primary" type="button" :disabled="contentLoading || contentUploading" @click="startNewContent">新建内容</button></div>
        <form v-if="contentFormOpen && canManageContent" class="content-form" aria-label="内容编辑表单" @submit.prevent="saveContent">
          <input v-model="contentForm.title" required maxlength="180" placeholder="标题" aria-label="内容标题" />
          <select v-model="contentForm.contentType" aria-label="内容类型"><option v-for="(label, type) in contentTypeLabel" :key="type" :value="type">{{ label }}</option></select>
          <select v-model="contentForm.anatomyNodeId" aria-label="关联解剖节点"><option value="">不关联解剖节点</option><option v-for="node in anatomyNodes.filter((item) => item.level >= 2)" :key="node.id" :value="node.id">{{ node.nameZh }} · {{ node.nameEn }}</option></select>
          <input v-model="contentForm.mediaUrl" type="url" placeholder="外部资源地址（可选）" aria-label="媒体地址" />
            <div class="media-uploader" :class="{ dragging: contentDropActive }" @dragover.prevent="contentDropActive = true" @dragleave.prevent="contentDropActive = false" @drop.prevent="handleContentDrop">
            <input ref="contentUploadInput" class="visually-hidden" type="file" multiple accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.mp4,.mov,.avi,.webm,.mkv,.glb,.gltf,.fbx,.obj,.stl,.usdz,.pdf,.zip,.json" @change="handleContentFiles" />
            <button class="button" type="button" :disabled="contentUploading || contentForm.mediaAssets.length >= 10" @click="contentUploadInput?.click()">{{ contentUploading ? `上传中 ${contentUploadProgress}%` : '上传资源' }}</button>
            <span>单文件不超过 50MB，最多 10 个</span>
            <progress v-if="contentUploading" class="media-progress" max="100" :value="contentUploadProgress" aria-label="资源上传进度" />
            <small v-if="contentUploadMessage">{{ contentUploadMessage }}</small>
            <ul v-if="contentUploadFailures.length" class="upload-failures"><li v-for="failure in contentUploadFailures" :key="`${failure.fileName}-${failure.error}`">{{ failure.fileName }}：{{ failure.error }}</li></ul>
            </div>
          <div v-if="contentForm.mediaAssets.length" class="content-media-list">
            <div v-for="(asset, index) in contentForm.mediaAssets" :key="asset.objectName" class="content-media-item">
              <img v-if="asset.fileType.startsWith('image/')" :src="asset.url" :alt="asset.fileName" @click="openMediaPreview(asset.url, asset.fileName, 'image')" />
              <video v-else-if="asset.fileType.startsWith('video/')" :src="asset.url" muted preload="metadata" />
              <div v-else class="resource-type">{{ asset.fileName.split('.').pop()?.toUpperCase() }}</div>
              <div><strong>{{ asset.fileName }}</strong><small>{{ (asset.fileSize / 1024 / 1024).toFixed(2) }} MB</small></div>
              <button class="media-remove" type="button" aria-label="移除资源" @click="removeContentMedia(index)">×</button>
            </div>
          </div>
          <textarea v-model="contentForm.summary" maxlength="500" placeholder="摘要（可选）" aria-label="内容摘要" />
          <textarea v-model="contentForm.body" rows="5" placeholder="正文或播放说明" aria-label="内容正文" />
          <div class="form-actions"><button class="button primary" type="submit" :disabled="contentLoading || contentUploading">{{ contentLoading ? '保存中…' : '保存草稿' }}</button><button class="button" type="button" :disabled="contentLoading || contentUploading" @click="discardContentForm">取消</button></div>
        </form>
        <div class="table-wrap content-table"><table><thead><tr><th>标题</th><th>类型</th><th>关联肌群</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody><tr v-for="item in contentItems" :key="item.id"><td><strong>{{ item.title }}</strong><small>{{ item.summary || '无摘要' }}</small></td><td>{{ contentTypeLabel[item.contentType] }}</td><td>{{ anatomyNodes.find((node) => node.id === item.anatomyNodeId)?.nameZh || '-' }}</td><td><span :class="['status', item.status === 'PUBLISHED' ? 'active' : item.status === 'ARCHIVED' ? 'locked' : 'draft']">{{ contentStatusLabel[item.status] }}</span></td><td>{{ new Date(item.updatedAt).toLocaleString() }}</td><td class="content-actions"><button v-if="canManageContent" class="table-action" type="button" @click="editContent(item)">编辑</button><button v-if="canManageContent && item.status === 'DRAFT'" class="table-action" type="button" @click="changeContentStatus(item, 'PUBLISHED')">发布</button><button v-if="canManageContent && item.status === 'PUBLISHED'" class="table-action" type="button" @click="changeContentStatus(item, 'ARCHIVED')">归档</button><button v-if="canManageContent && item.status !== 'PUBLISHED'" class="table-action danger" type="button" @click="removeContent(item)">删除</button></td></tr></tbody></table><div v-if="!contentItems.length" class="empty">暂无文章、视频或其他编辑内容</div></div>
        <div class="catalog-panel action-catalog-panel"><div class="panel-heading"><div><p class="eyebrow">EXERCISE CATALOG</p><h2>动作目录</h2></div><span class="panel-note">数据库共 {{ exerciseCatalogTotal }} 个动作 · 当前显示 {{ exerciseCatalogItems.length }} 个</span></div><div class="table-wrap"><table><thead><tr><th>动作</th><th>目标肌群</th><th>器械 / 场地</th><th>训练参数</th><th>资源预览</th><th>来源</th></tr></thead><tbody><tr v-for="item in exerciseCatalogItems" :key="item.id"><td><strong>{{ item.nameZh }}</strong><small>{{ item.nameEn }} · {{ item.id }}</small></td><td>{{ item.targetMuscles.join('、') || '-' }}</td><td>{{ item.equipment || '-' }} / {{ item.location || '-' }}</td><td>{{ item.recommendedSets ? `${item.recommendedSets} 组` : '-' }} · {{ item.recommendedReps || '-' }}<small v-if="item.restSecondsMin">休息 {{ item.restSecondsMin }}-{{ item.restSecondsMax ?? item.restSecondsMin }} 秒</small></td><td><div class="catalog-resource-strip"><a v-for="resource in item.resources" :key="resource.id" :href="resolveMediaUrl(resource.resourceUrl)" target="_blank" rel="noreferrer" :title="resource.viewLabel || resource.resourceType"><img v-if="isImageUrl(resource.resourceUrl)" :src="resolveMediaUrl(resource.resourceUrl)" :alt="resource.viewLabel || resource.resourceType" loading="lazy" /><video v-else-if="isVideoUrl(resource.resourceUrl)" :src="resolveMediaUrl(resource.resourceUrl)" muted preload="none" /><span v-else>{{ resource.resourceType }}</span></a><span v-if="!item.resources.length" class="media-empty">暂无资源</span></div></td><td><small>{{ item.sourceImage || '-' }}</small></td></tr></tbody></table><div v-if="!exerciseCatalogItems.length" class="empty">暂无动作目录数据</div></div></div>
      </section>
       <section v-if="activeModule === 'content' && canManageCatalog" class="panel module-panel exercise-editor-picker">
         <div class="panel-heading"><div><p class="eyebrow">EXERCISE EDITOR</p><h2>动作目录编辑</h2></div><span class="panel-note">选择动作后修改数据库内容</span></div>
         <div class="exercise-picker-list"><button v-for="item in exerciseCatalogItems" :key="item.id" type="button" class="exercise-picker-item" @click="editExercise(item)"><strong>{{ item.nameZh }}</strong><small>{{ item.nameEn }} · {{ item.id }}</small></button></div>
       </section>
       <section v-if="activeModule === 'content' && canManageCatalog && exerciseFormOpen" class="panel module-panel">
        <div class="panel-heading"><div><p class="eyebrow">EDIT EXERCISE</p><h2>编辑动作：{{ exerciseEditingId }}</h2></div></div>
        <form class="exercise-form" aria-label="动作编辑表单" @submit.prevent="saveExercise">
          <input v-model="exerciseForm.nameZh" required maxlength="120" placeholder="动作中文名称" aria-label="动作中文名称" />
          <input v-model="exerciseForm.nameEn" maxlength="160" placeholder="动作英文名称" aria-label="动作英文名称" />
          <input v-model="exerciseTargetsText" required placeholder="目标肌群代码，逗号分隔" aria-label="目标肌群代码" />
          <input v-model="exerciseForm.equipment" maxlength="80" placeholder="器械" aria-label="器械" />
          <input v-model="exerciseForm.location" required maxlength="40" placeholder="场地" aria-label="场地" />
          <input v-model="exerciseForm.difficultyLevel" required maxlength="24" placeholder="难度代码" aria-label="难度代码" />
          <input v-model="exerciseForm.recommendedSets" maxlength="40" placeholder="组数" aria-label="推荐组数" />
          <input v-model="exerciseForm.recommendedReps" maxlength="40" placeholder="次数" aria-label="推荐次数" />
          <input v-model.number="exerciseForm.restSecondsMin" min="0" type="number" placeholder="最短休息秒数" aria-label="最短休息秒数" />
          <input v-model.number="exerciseForm.restSecondsMax" min="0" type="number" placeholder="最长休息秒数" aria-label="最长休息秒数" />
          <textarea v-model="exerciseForm.sourceNote" maxlength="500" placeholder="动作说明" aria-label="动作说明" />
          <div class="form-actions"><button class="button primary" type="submit" :disabled="exerciseLoading">{{ exerciseLoading ? '保存中…' : '保存动作' }}</button><button class="button" type="button" :disabled="exerciseLoading" @click="resetExerciseForm">取消</button></div>
        </form>
      </section>
      <div v-if="previewMedia" class="media-lightbox" role="dialog" aria-modal="true" :aria-label="previewMedia.label" @click.self="closeMediaPreview">
        <button class="media-lightbox-close" type="button" aria-label="关闭预览" @click="closeMediaPreview">×</button>
        <figure><img v-if="previewMedia.kind === 'image'" :src="previewMedia.url" :alt="previewMedia.label" /><video v-else :src="previewMedia.url" controls autoplay /><figcaption>{{ previewMedia.label }}</figcaption></figure>
      </div>
    </main>
  </div>
</template>
