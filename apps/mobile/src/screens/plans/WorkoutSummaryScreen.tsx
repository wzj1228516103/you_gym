import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, Dumbbell, Flame, Trophy } from 'lucide-react-native';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';
import { saveWorkout } from '../../services/api';
import { useAuthState } from '../../state/AuthState';
import { trackEvent } from '../../services/analytics';

type Props = NativeStackScreenProps<PlanStackParamList, 'WorkoutSummary'>;

export function WorkoutSummaryScreen({ navigation, route }: Props) {
  const { token } = useAuthState();
  const saved = useRef(false);
  const summary = route.params ?? {};
  const durationSeconds = summary.durationSeconds ?? 0;
  const totalSets = summary.totalSets ?? 0;
  const plannedSets = summary.plannedSets ?? totalSets;
  const totalVolume = summary.totalVolume ?? 0;
  const calories = summary.calories ?? 0;
  const completionPercent = plannedSets > 0 ? Math.min(100, Math.round(totalSets / plannedSets * 100)) : 0;
  const muscles = summary.muscles?.length ? summary.muscles : ['本次训练'];
  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    trackEvent('workout_completed', { durationSeconds, totalSets, totalVolume }, { screenId: 'workout_summary' });
    if (token) void saveWorkout(token, { title: summary.title ?? '今日训练', durationSeconds, totalSets, totalVolume, calories, metadata: { muscles, plannedSets, completionPercent } }).catch((cause) => Alert.alert('训练记录保存失败', cause instanceof Error ? cause.message : '请稍后重试'));
  }, [calories, completionPercent, durationSeconds, muscles, plannedSets, summary.title, token, totalSets, totalVolume]);
  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.trophy}><Trophy size={52} color={colors.textInverse} strokeWidth={2.2} /></View>
      <Text style={styles.title}>训练完成</Text>
      <Text style={styles.subtitle}>本次训练数据已按实际输入生成</Text>
      <View style={styles.metricRow}><SummaryMetric label="训练时长" value={formatDuration(durationSeconds)} /><SummaryMetric label="总组数" value={`${totalSets}`} /><SummaryMetric label="总容量" value={`${totalVolume.toLocaleString()} kg`} /></View>
      <Card style={styles.performance}>
        <Text style={styles.sectionTitle}>本次表现</Text>
        <View style={styles.performanceRow}><Check size={18} color={colors.primary} /><Text style={styles.performanceText}>完成度 {completionPercent}%</Text></View>
        <View style={styles.performanceRow}><Dumbbell size={18} color={colors.primary} /><Text style={styles.performanceText}>动作组数 {totalSets} 组</Text></View>
        <View style={styles.performanceRow}><Flame size={18} color={colors.primary} /><Text style={styles.performanceText}>消耗约 {calories} kcal</Text></View>
      </Card>
      <Card style={styles.muscleCard}><Text style={styles.sectionTitle}>主要训练部位</Text><Text style={styles.muscles}>{muscles.join(' · ')}</Text></Card>
      <PrimaryButton label="返回训练计划" onPress={() => navigation.popToTop()} style={styles.primary} />
      <SecondaryButton label="查看训练记录" onPress={() => navigation.navigate('History')} />
    </AppScreen>
  );
}

function formatDuration(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }

function SummaryMetric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingTop: spacing.x10 },
  trophy: { width: 94, height: 94, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.pageTitle, color: colors.text, marginTop: spacing.x5 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.x2 },
  metricRow: { width: '100%', flexDirection: 'row', marginTop: spacing.x6, paddingVertical: spacing.x4, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider },
  metric: { flex: 1, alignItems: 'center' },
  metricLabel: { ...typography.caption, color: colors.textSecondary },
  metricValue: { ...typography.listTitle, color: colors.text, marginTop: spacing.x1 },
  performance: { width: '100%', marginTop: spacing.x5, gap: spacing.x3 },
  sectionTitle: { ...typography.listTitle, color: colors.text },
  performanceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3 },
  performanceText: { ...typography.body, color: colors.textSecondary },
  muscleCard: { width: '100%', marginTop: spacing.x3, gap: spacing.x2 },
  muscles: { ...typography.body, color: colors.textSecondary },
  primary: { width: '100%', marginTop: spacing.x6, marginBottom: spacing.x3 },
});
