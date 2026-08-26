import { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Activity, ChevronRight, Plus, Ruler, Scale, TrendingDown, X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen, Card, PrimaryButton, ScreenHeader, SegmentedControl } from '../../components/ui';
import { fetchBodyMeasurements, saveBodyMeasurement, type BodyMeasurement } from '../../services/api';
import { useAuthState } from '../../state/AuthState';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'BodyData'>;
type MetricMode = 'weight' | 'fat';

export function BodyDataScreen({ navigation }: Props) {
  const { user, guest, token, updateProfile } = useAuthState();
  const [metric, setMetric] = useState<MetricMode>('weight');
  const [history, setHistory] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ heightCm: '', weightKg: '', bodyFatPct: '', waistCm: '', chestCm: '', hipCm: '', armCm: '' });
  const weight = user?.weightKg;
  const bodyFat = user?.bodyFatPct;
  const height = user?.heightCm;

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    void fetchBodyMeasurements(token).then((result) => { if (active) { setHistory(result.items); setError(''); } }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : '身体数据加载失败'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const chartItems = useMemo(() => history.slice(0, 7).reverse(), [history]);
  const chartValues = chartItems.map((item) => metric === 'weight' ? item.weightKg : item.bodyFatPct).filter((value): value is number => value != null);
  const chartMax = chartValues.length ? Math.max(...chartValues) : 0;
  const chartMin = chartValues.length ? Math.min(...chartValues) : 0;

  const record = async () => {
    const values = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, optionalNumber(value)]));
    if (!Object.values(values).some((value) => value != null)) { setError('至少填写一项身体数据'); return; }
    if (!token) { setError('登录后即可保存身体测量历史'); return; }
    setSaving(true); setError('');
    try {
      const result = await saveBodyMeasurement(token, { ...values, measuredAt: new Date().toISOString() });
      setHistory((current) => [result.measurement, ...current].slice(0, 200));
      const profileValues = Object.fromEntries(['heightCm', 'weightKg', 'bodyFatPct'].map((key) => [key, values[key]]).filter(([, value]) => value != null));
      let profileSyncFailed = false;
      if (Object.keys(profileValues).length) {
        try { await updateProfile(profileValues); } catch { profileSyncFailed = true; }
      }
      setForm({ heightCm: '', weightKg: '', bodyFatPct: '', waistCm: '', chestCm: '', hipCm: '', armCm: '' });
      setFormOpen(false);
      if (profileSyncFailed) setError('测量记录已保存，但当前资料同步失败，请稍后重试。');
    } catch (cause) { setError(cause instanceof Error ? cause.message : '保存身体数据失败'); }
    finally { setSaving(false); }
  };

  return <AppScreen contentStyle={styles.content}>
    <ScreenHeader title="身体数据" onBack={navigation.goBack} actions={formOpen ? <Pressable accessibilityRole="button" accessibilityLabel="关闭记录表单" onPress={() => setFormOpen(false)} style={styles.closeButton}><X size={19} color={colors.textSecondary} /></Pressable> : null} />
    <SegmentedControl options={[{ label: '体重', value: 'weight' }, { label: '体脂率', value: 'fat' }]} value={metric} onChange={setMetric} />
    <Card style={styles.heroCard}><View style={styles.heroTop}><View><Text style={styles.heroLabel}>{metric === 'weight' ? '当前体重' : '当前体脂率'}</Text><Text style={styles.heroValue}>{metric === 'weight' ? (weight != null ? `${weight} kg` : '-') : (bodyFat != null ? `${bodyFat}%` : '-')}</Text></View></View><View style={styles.heroTrend}><TrendingDown size={17} color={colors.success} /><Text style={styles.trendCopy}>{guest ? '游客模式，仅展示本机资料' : '数据来自你的个人资料'}</Text></View></Card>
    {!formOpen ? <PrimaryButton label="记录本次测量" icon={Plus} onPress={() => setFormOpen(true)} style={styles.recordButton} /> : <Card style={styles.formCard}><Text style={styles.sectionTitle}>记录本次测量</Text><Text style={styles.formHint}>填写有变化的指标即可，测量时间使用当前时间。</Text><View style={styles.formGrid}><Input label="身高 cm" value={form.heightCm} onChange={(value) => setForm({ ...form, heightCm: value })} /><Input label="体重 kg" value={form.weightKg} onChange={(value) => setForm({ ...form, weightKg: value })} /><Input label="体脂率 %" value={form.bodyFatPct} onChange={(value) => setForm({ ...form, bodyFatPct: value })} /><Input label="腰围 cm" value={form.waistCm} onChange={(value) => setForm({ ...form, waistCm: value })} /><Input label="胸围 cm" value={form.chestCm} onChange={(value) => setForm({ ...form, chestCm: value })} /><Input label="臀围 cm" value={form.hipCm} onChange={(value) => setForm({ ...form, hipCm: value })} /><Input label="臂围 cm" value={form.armCm} onChange={(value) => setForm({ ...form, armCm: value })} /></View><PrimaryButton label={saving ? '保存中…' : '保存测量记录'} disabled={saving} onPress={() => void record()} /></Card>}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Card style={styles.chartCard}><Text style={styles.sectionTitle}>历史趋势</Text>{loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : chartItems.length && chartValues.length ? <View style={styles.chart}>{chartItems.map((item) => { const value = metric === 'weight' ? item.weightKg : item.bodyFatPct; const ratio = value == null || chartMax === chartMin ? (value == null ? 0 : 0.7) : 0.2 + ((value - chartMin) / (chartMax - chartMin)) * 0.8; return <View key={item.id} style={styles.chartItem}><View style={styles.barTrack}><View style={[styles.bar, { height: `${ratio * 100}%` }]} /></View><Text style={styles.chartValue}>{value != null ? value : '-'}</Text><Text style={styles.chartDate}>{formatDate(item.measuredAt)}</Text></View>; })}</View> : <Text style={styles.emptyChart}>{guest ? '登录后可保存测量记录并查看历史趋势。' : '记录一次测量后，这里会展示你的变化趋势。'}</Text>}</Card>
    <Text style={styles.sectionTitleOutside}>身体指标</Text>
    <View style={styles.metricList}><DataRow icon={Scale} label="体重" value={weight != null ? `${weight} kg` : '-'} meta="来自个人资料" /><DataRow icon={Activity} label="体脂率" value={bodyFat != null ? `${bodyFat}%` : '-'} meta="来自个人资料" /><DataRow icon={Ruler} label="身高" value={height != null ? `${height} cm` : '-'} meta="来自个人资料" /></View>
    <Text style={styles.note}>建议每周在相近时间测量，避免用单日变化判断训练效果。</Text>
  </AppScreen>;
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <View style={styles.inputWrap}><Text style={styles.inputLabel}>{label}</Text><TextInput value={value} keyboardType="decimal-pad" placeholder="-" placeholderTextColor={colors.textTertiary} onChangeText={(next) => onChange(next.replace(/[^0-9.]/g, ''))} style={styles.input} /></View>; }
function DataRow({ icon: Icon, label, value, meta }: { icon: typeof Scale; label: string; value: string; meta: string }) { return <View style={styles.dataRow}><View style={styles.dataIcon}><Icon size={19} color={colors.primary} /></View><View style={styles.dataCopy}><Text style={styles.dataLabel}>{label}</Text><Text style={styles.dataMeta}>{meta}</Text></View><Text style={styles.dataValue}>{value}</Text><ChevronRight size={17} color={colors.textTertiary} /></View>; }
function optionalNumber(value: string) { const parsed = Number(value); return value.trim() && Number.isFinite(parsed) ? parsed : null; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '-' : `${date.getMonth() + 1}/${date.getDate()}`; }

const styles = StyleSheet.create({ content: { paddingBottom: spacing.x8 }, closeButton: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' }, recordButton: { marginTop: spacing.x4 }, heroCard: { marginTop: spacing.x5, gap: spacing.x3 }, heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.x3 }, heroLabel: { ...typography.caption, color: colors.textSecondary }, heroValue: { ...typography.pageTitle, color: colors.text, marginTop: spacing.x1 }, heroTrend: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2 }, trendCopy: { ...typography.caption, color: colors.success }, formCard: { marginTop: spacing.x4, gap: spacing.x3 }, formHint: { ...typography.caption, color: colors.textSecondary }, formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2 }, inputWrap: { width: '48%', gap: spacing.x1 }, inputLabel: { ...typography.caption, color: colors.textSecondary }, input: { minHeight: 42, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.control, color: colors.text, paddingHorizontal: spacing.x3, ...typography.body }, error: { ...typography.caption, color: colors.error, marginTop: spacing.x3 }, chartCard: { marginTop: spacing.x3, gap: spacing.x3 }, sectionTitle: { ...typography.cardTitle, color: colors.text }, loading: { marginVertical: spacing.x5 }, chart: { height: 155, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.x2, paddingTop: spacing.x3 }, chartItem: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }, barTrack: { height: 100, width: '70%', justifyContent: 'flex-end', backgroundColor: colors.control, borderRadius: radius.small, overflow: 'hidden' }, bar: { width: '100%', backgroundColor: colors.primary, borderRadius: radius.small }, chartValue: { ...typography.eyebrow, color: colors.text }, chartDate: { ...typography.eyebrow, color: colors.textTertiary }, emptyChart: { ...typography.body, color: colors.textSecondary }, sectionTitleOutside: { ...typography.cardTitle, color: colors.text, marginTop: spacing.x6, marginBottom: spacing.x3 }, metricList: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' }, dataRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, paddingHorizontal: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider }, dataIcon: { width: 40, height: 40, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, dataCopy: { flex: 1 }, dataLabel: { ...typography.listTitle, color: colors.text }, dataMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 }, dataValue: { ...typography.listTitle, color: colors.text }, note: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x4, paddingHorizontal: spacing.x2 } });
