import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Bookmark, Check, Clock3, Dumbbell } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, PrimaryButton, ScreenHeader, SectionHeader, Tag } from '../../components/ui';
import { fetchPlan, fetchPlanProgress, PlanDetail, PlanProgress, startPlan } from '../../services/api';
import { useAppState } from '../../state/AppState';
import { useAuthState } from '../../state/AuthState';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'PlanDetail'>;

export function PlanDetailScreen({ navigation, route }: Props) {
  const { exercises, replaceTodayExercises } = useAppState();
  const { token } = useAuthState();
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  useFocusEffect(useCallback(() => {
    let active = true;
    void fetchPlan(route.params.planId).then((result) => { if (active) { setPlan(result); setError(null); } }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : '计划加载失败'); });
    if (token) void fetchPlanProgress(token, route.params.planId).then((result) => { if (active) setProgress(result.progress); }).catch(() => { if (active) setProgress(null); });
    else setProgress(null);
    return () => { active = false; };
  }, [route.params.planId, token]));
  if (!plan) return <AppScreen><ScreenHeader title="计划详情" onBack={navigation.goBack} />{error ? <Text style={styles.body}>{error}</Text> : <Text style={styles.body}>计划加载中…</Text>}</AppScreen>;
  return (
    <AppScreen>
      <ScreenHeader title="计划详情" onBack={navigation.goBack} actions={<IconButton icon={Bookmark} label="收藏计划" size={42} />} />
      <View style={styles.hero}><Dumbbell size={54} color={colors.muscle} /><Tag tone="primary">{plan.level}</Tag></View>
      <Text style={styles.title}>{plan.title}</Text>
      <View style={styles.metrics}><Metric icon={Clock3} value={estimateSessionDuration(plan.exercises.length)} label="预计单次时长" /><Metric icon={Dumbbell} value={plan.durationLabel} label="训练频率" /><Metric icon={Check} value={`${plan.exerciseCount} 个`} label="动作数量" /></View>
      <Card style={styles.progressCard}><View style={styles.progressCopy}><Text style={styles.progressTitle}>计划进度</Text><Text style={styles.progressMeta}>{progress?.status === 'ACTIVE' ? `已完成 ${progress.completedSessions} 次训练` : progress?.status === 'COMPLETED' ? `已完成 ${progress.completedSessions} 次训练` : '尚未开始训练'}</Text></View><Tag tone={progress?.status === 'ACTIVE' ? 'primary' : 'neutral'}>{progress?.status === 'ACTIVE' ? '进行中' : progress?.status === 'COMPLETED' ? '已完成' : '未开始'}</Tag></Card>

      <SectionHeader title="计划说明" />
      <Card><Text style={styles.body}>{plan.description}</Text></Card>

      <SectionHeader title="训练动作" />
      {plan.exercises.map((exercise, index) => <View key={exercise.id} style={styles.exerciseRow}><Text style={styles.index}>{index + 1}</Text><View style={styles.exerciseCopy}><Text style={styles.exerciseTitle}>{exercise.nameZh}</Text><Text style={styles.exerciseMeta}>{exercise.sets} 组 · {exercise.reps} · {exercise.restSeconds}s</Text></View></View>)}

      <PrimaryButton label={progress?.status === 'ACTIVE' ? '继续训练' : '开始训练'} onPress={() => {
        const begin = async () => {
          if (token) {
            try { const result = await startPlan(token, plan.id); setProgress(result.progress); }
            catch (cause) { setError(cause instanceof Error ? cause.message : '计划启动失败'); return; }
          }
        const ids = plan.exercises.map((planExercise) => exercises.find((exercise) => exercise.sourceId === planExercise.id || exercise.name === planExercise.nameZh)?.id ?? planExercise.id);
        replaceTodayExercises(ids);
          navigation.navigate('Workout', { planId: plan.id });
        };
        void begin();
      }} style={styles.joinButton} />
    </AppScreen>
  );
}

function Metric({ icon: Icon, value, label }: { icon: typeof Clock3; value: string; label: string }) {
  return <View style={styles.metric}><Icon size={17} color={colors.primary} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  hero: { height: 180, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: '#0E0F12', alignItems: 'center', justifyContent: 'center', gap: spacing.x4 },
  title: { ...typography.sectionTitle, color: colors.text, marginTop: spacing.x4 },
  metrics: { flexDirection: 'row', gap: spacing.x2, marginTop: spacing.x4 },
  metric: { flex: 1, minHeight: 84, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', gap: 2 },
  metricValue: { ...typography.caption, color: colors.text, fontWeight: '700' },
  metricLabel: { ...typography.eyebrow, color: colors.textTertiary },
  body: { ...typography.body, color: colors.textSecondary, flex: 1 },
  exerciseRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  index: { ...typography.body, color: colors.primary, width: 24 },
  exerciseCopy: { flex: 1 },
  exerciseTitle: { ...typography.listTitle, color: colors.text },
  exerciseMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  joinButton: { marginTop: spacing.x6 },
  progressCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.x3, marginTop: spacing.x3 },
  progressCopy: { flex: 1, gap: spacing.x1 },
  progressTitle: { ...typography.listTitle, color: colors.text },
  progressMeta: { ...typography.caption, color: colors.textSecondary },
});

function estimateSessionDuration(exerciseCount: number) {
  const minutes = Math.max(10, exerciseCount * 8);
  return `${minutes} 分钟`;
}
