import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dumbbell, Flame, TrendingUp } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, Metric, ScreenHeader, SegmentedControl, Tag } from '../../components/ui';
import { fetchWorkouts, WorkoutRecord } from '../../services/api';
import { useAuthState } from '../../state/AuthState';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'History'>;
type ViewMode = 'history' | 'trend';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

export function HistoryScreen({ navigation }: Props) {
  const { token, guest } = useAuthState();
  const [mode, setMode] = useState<ViewMode>('history');
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) { setRecords([]); setError(null); return; }
    setLoading(true);
    try { setRecords((await fetchWorkouts(token)).items); setError(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '训练记录加载失败'); }
    finally { setLoading(false); }
  }, [token]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const now = new Date();
  const monthRecords = useMemo(() => records.filter((record) => {
    const date = new Date(record.completedAt);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }), [records, now.getFullYear(), now.getMonth()]);
  const activeDays = useMemo(() => new Set(monthRecords.map((record) => `${new Date(record.completedAt).getDate()}`)), [monthRecords]);
  const calendarDays = useMemo(() => {
    const leading = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const count = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return [...Array.from({ length: leading }, () => ''), ...Array.from({ length: count }, (_, index) => `${index + 1}`)];
  }, [now.getFullYear(), now.getMonth()]);
  const totalDuration = records.reduce((sum, record) => sum + Number(record.durationSeconds || 0), 0);
  const totalVolume = records.reduce((sum, record) => sum + Number(record.totalVolume || 0), 0);
  const totalCalories = records.reduce((sum, record) => sum + Number(record.calories || 0), 0);

  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader title="训练记录" onBack={navigation.goBack} />
      <SegmentedControl options={[{ label: '历史记录', value: 'history' }, { label: '数据汇总', value: 'trend' }]} value={mode} onChange={setMode} />
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {mode === 'history' ? <>
        <View style={styles.monthHeader}><Text style={styles.month}>{now.getFullYear()}年{now.getMonth() + 1}月</Text><Tag tone="primary">本月 {monthRecords.length} 次</Tag></View>
        <Card style={styles.calendarCard}>
          <View style={styles.weekRow}>{weekDays.map((day) => <Text key={day} style={styles.weekDay}>{day}</Text>)}</View>
          <View style={styles.calendarGrid}>{calendarDays.map((day, index) => <View key={`${day}-${index}`} style={styles.dayCell}>{day ? <View style={[styles.dayDot, activeDays.has(day) && styles.dayDotActive]}><Text style={[styles.dayText, activeDays.has(day) && styles.dayTextActive]}>{day}</Text></View> : null}</View>)}</View>
        </Card>
        <Text style={styles.sectionTitle}>最近训练</Text>
        {!loading && records.length === 0 ? <Card><Text style={styles.empty}>{guest ? '游客模式不会同步训练记录，登录后即可跨设备保存。' : '还没有训练记录，完成一次训练后会显示在这里。'}</Text></Card> : null}
        {records.map((record) => {
          const date = new Date(record.completedAt);
          return <Card key={record.id} style={styles.recordCard}>
            <View style={styles.recordIcon}><Dumbbell size={22} color={colors.primary} /></View>
            <View style={styles.recordCopy}><Text style={styles.recordTitle}>{record.title}</Text><Text style={styles.recordMeta}>{date.toLocaleDateString('zh-CN')} · {Math.round(record.durationSeconds / 60)} 分钟 · {Number(record.totalVolume).toLocaleString()} kg</Text><Text style={styles.recordKcal}>{record.calories} kcal · {record.totalSets} 组</Text></View>
          </Card>;
        })}
      </> : <>
        <View style={styles.periodRow}><Tag tone="primary">全部记录</Tag><Text style={styles.periodHint}>数据来自已同步训练</Text></View>
        <Card style={styles.chartCard}><View style={styles.chartHeader}><View><Text style={styles.chartLabel}>总训练容量</Text><Text style={styles.chartValue}>{totalVolume.toLocaleString()} kg</Text></View><TrendingUp size={23} color={colors.primary} /></View><Text style={styles.chartSummary}>{records.length ? `已累计完成 ${records.length} 次训练，共 ${Math.round(totalDuration / 60)} 分钟。` : '完成训练后，这里会自动生成训练汇总。'}</Text></Card>
        <View style={styles.metricRow}><Card style={styles.metricCard}><Metric label="训练次数" value={`${records.length} 次`} accent /></Card><Card style={styles.metricCard}><Metric label="总时长" value={`${(totalDuration / 3600).toFixed(1)} h`} /></Card></View>
        <Card style={styles.strengthCard}><View style={styles.strengthHeader}><Flame size={20} color={colors.muscle} /><Text style={styles.sectionTitleInline}>训练统计</Text></View><MetricRow label="累计组数" value={`${records.reduce((sum, record) => sum + Number(record.totalSets || 0), 0)} 组`} /><MetricRow label="累计消耗" value={`${totalCalories.toLocaleString()} kcal`} /></Card>
      </>}
    </AppScreen>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) { return <View style={styles.metricLine}><Text style={styles.metricLineLabel}>{label}</Text><Text style={styles.metricLineValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.x8 }, loading: { marginTop: spacing.x3 }, error: { ...typography.caption, color: colors.error, marginTop: spacing.x3 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.x5, marginBottom: spacing.x3 }, month: { ...typography.cardTitle, color: colors.text },
  calendarCard: { padding: spacing.x3 }, weekRow: { flexDirection: 'row' }, weekDay: { flex: 1, ...typography.eyebrow, color: colors.textTertiary, textAlign: 'center' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.x2 }, dayCell: { width: '14.285%', height: 42, alignItems: 'center', justifyContent: 'center' }, dayDot: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }, dayDotActive: { backgroundColor: colors.primary }, dayText: { ...typography.caption, color: colors.textSecondary }, dayTextActive: { color: colors.textInverse, fontWeight: '700' },
  sectionTitle: { ...typography.listTitle, color: colors.text, marginTop: spacing.x5, marginBottom: spacing.x3 }, empty: { ...typography.body, color: colors.textSecondary }, recordCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginBottom: spacing.x2, padding: spacing.x3 }, recordIcon: { width: 48, height: 48, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, recordCopy: { flex: 1 }, recordTitle: { ...typography.listTitle, color: colors.text }, recordMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 }, recordKcal: { ...typography.eyebrow, color: colors.primary, marginTop: spacing.x1 },
  periodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.x5, marginBottom: spacing.x3 }, periodHint: { ...typography.caption, color: colors.textSecondary }, chartCard: { gap: spacing.x4 }, chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, chartLabel: { ...typography.caption, color: colors.textSecondary }, chartValue: { ...typography.sectionTitle, color: colors.primary, marginTop: 2 }, chartSummary: { ...typography.body, color: colors.textSecondary }, metricRow: { flexDirection: 'row', gap: spacing.x2, marginTop: spacing.x3 }, metricCard: { flex: 1, minHeight: 94, justifyContent: 'center' }, strengthCard: { marginTop: spacing.x3, paddingVertical: spacing.x2 }, strengthHeader: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: spacing.x2 }, sectionTitleInline: { ...typography.listTitle, color: colors.text }, metricLine: { minHeight: 56, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.divider }, metricLineLabel: { flex: 1, ...typography.body, color: colors.textSecondary }, metricLineValue: { ...typography.listTitle, color: colors.text },
});
