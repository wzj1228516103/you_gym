import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarDays, ChevronRight, Dumbbell, Library, Play, Settings2, Zap } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, PrimaryButton, ProgressBar, ScreenHeader, SectionHeader, Tag } from '../../components/ui';
import { plans } from '../../data/mockData';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'PlanHome'>;

export function PlanHomeScreen({ navigation }: Props) {
  const { todayExercises } = useAppState();

  return (
    <AppScreen>
      <ScreenHeader title="训练计划" actions={<IconButton icon={Settings2} label="计划设置" size={42} />} />

      <Card style={styles.todayCard}>
        <View style={styles.cardTop}><View><Text style={styles.eyebrow}>今日训练</Text><Text style={styles.todayTitle}>推 B · 第 2 天</Text></View><Tag tone="primary">进行中</Tag></View>
        <Text style={styles.todayMeta}>第 4 周 · 胸肩力量 · 约 48 分钟</Text>
        <View style={styles.progressCopy}><Text style={styles.progressLabel}>计划进度</Text><Text style={styles.progressLabel}>4 / 6 次</Text></View>
        <ProgressBar value={4 / 6} />
        <PrimaryButton label="开始训练" icon={Play} onPress={() => navigation.navigate('Workout')} style={styles.startButton} />
      </Card>

      <View style={styles.quickRow}>
        <QuickAction icon={Zap} label="快速训练" onPress={() => navigation.navigate('QuickWorkout')} />
        <QuickAction icon={Library} label="计划库" onPress={() => navigation.navigate('PlanLibrary')} />
        <QuickAction icon={CalendarDays} label="历史记录" onPress={() => navigation.navigate('History')} />
      </View>

      <SectionHeader title="今日动作" action={`${todayExercises.length} 个动作`} />
      {todayExercises.map((exercise, index) => (
        <View key={exercise.id} style={styles.exerciseRow}>
          <View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{index + 1}</Text></View>
          <View style={styles.exerciseCopy}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseMeta}>{exercise.sets} 组 · {exercise.reps} · 休息 {exercise.restSeconds}s</Text></View>
          <ChevronRight size={18} color={colors.textTertiary} />
        </View>
      ))}

      <SectionHeader title="推荐计划" action="查看全部" onAction={() => navigation.navigate('PlanLibrary')} />
      {plans.slice(0, 2).map((plan) => (
        <Card key={plan.id} onPress={() => navigation.navigate('PlanDetail', { planId: plan.id })} accessibilityLabel={`查看${plan.title}`} style={styles.planCard}>
          <View style={styles.planArt}><Dumbbell size={26} color={colors.muscle} /></View>
          <View style={styles.planCopy}><Text style={styles.planTitle}>{plan.title}</Text><Text style={styles.planMeta}>{plan.duration} · {plan.level}</Text><Text style={styles.planTarget}>{plan.target}</Text></View>
          <ChevronRight size={18} color={colors.textTertiary} />
        </Card>
      ))}
    </AppScreen>
  );
}

function QuickAction({ icon: Icon, label, onPress }: { icon: typeof Library; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}><Icon size={21} color={colors.primary} /><Text style={styles.quickLabel}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  todayCard: { gap: spacing.x3 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.x3 },
  eyebrow: { ...typography.eyebrow, color: colors.primary },
  todayTitle: { ...typography.sectionTitle, color: colors.text, marginTop: spacing.x1 },
  todayMeta: { ...typography.body, color: colors.textSecondary },
  progressCopy: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { ...typography.caption, color: colors.textSecondary },
  startButton: { marginTop: spacing.x1 },
  quickRow: { flexDirection: 'row', gap: spacing.x2, marginTop: spacing.x3 },
  quickAction: { flex: 1, minHeight: 76, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', gap: spacing.x2 },
  quickLabel: { ...typography.caption, color: colors.text },
  exerciseRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  exerciseNumber: { width: 30, height: 30, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  exerciseNumberText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  exerciseCopy: { flex: 1, minWidth: 0 },
  exerciseName: { ...typography.listTitle, color: colors.text },
  exerciseMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  planCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginBottom: spacing.x2, padding: spacing.x3 },
  planArt: { width: 60, height: 60, borderRadius: radius.card, backgroundColor: '#0E0F12', alignItems: 'center', justifyContent: 'center' },
  planCopy: { flex: 1 },
  planTitle: { ...typography.listTitle, color: colors.text },
  planMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  planTarget: { ...typography.caption, color: colors.primary, marginTop: spacing.x1 },
  pressed: { opacity: 0.78 },
});
