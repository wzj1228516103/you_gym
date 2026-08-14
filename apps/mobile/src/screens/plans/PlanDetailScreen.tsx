import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bookmark, Check, Clock3, Dumbbell, Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, PrimaryButton, ScreenHeader, SectionHeader, Tag } from '../../components/ui';
import { exercises, plans } from '../../data/mockData';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'PlanDetail'>;

export function PlanDetailScreen({ navigation, route }: Props) {
  const plan = plans.find((item) => item.id === route.params.planId) ?? plans[0];
  return (
    <AppScreen>
      <ScreenHeader title="计划详情" onBack={navigation.goBack} actions={<IconButton icon={Bookmark} label="收藏计划" size={42} />} />
      <View style={styles.hero}><Dumbbell size={54} color={colors.muscle} /><Tag tone="primary">{plan.level}</Tag></View>
      <Text style={styles.title}>{plan.title}</Text>
      <View style={styles.rating}><Star size={15} color={colors.warning} fill={colors.warning} /><Text style={styles.ratingText}>4.8（12.6k）</Text></View>
      <View style={styles.metrics}><Metric icon={Clock3} value="55–75 分钟" label="单次时长" /><Metric icon={Dumbbell} value={plan.duration} label="训练频率" /><Metric icon={Check} value={`${plan.exerciseCount} 个`} label="动作数量" /></View>

      <SectionHeader title="计划说明" />
      <Card><Text style={styles.body}>适合希望建立稳定训练习惯的用户，覆盖主要动作模式，并通过逐周增加重复次数或重量实现渐进负荷。</Text></Card>

      <SectionHeader title="第一周 · 第一天" />
      {exercises.slice(0, 4).map((exercise, index) => <View key={exercise.id} style={styles.exerciseRow}><Text style={styles.index}>{index + 1}</Text><View style={styles.exerciseCopy}><Text style={styles.exerciseTitle}>{exercise.name}</Text><Text style={styles.exerciseMeta}>{exercise.sets} 组 · {exercise.reps} · {exercise.restSeconds}s</Text></View></View>)}

      <SectionHeader title="你将获得" />
      <Card style={styles.benefits}>{['清晰的训练日安排', '动作参数和替代方案', '训练记录与趋势'].map((item) => <View key={item} style={styles.benefitRow}><Check size={17} color={colors.primary} /><Text style={styles.body}>{item}</Text></View>)}</Card>
      <PrimaryButton label="加入计划" onPress={() => navigation.navigate('PlanHome')} style={styles.joinButton} />
    </AppScreen>
  );
}

function Metric({ icon: Icon, value, label }: { icon: typeof Clock3; value: string; label: string }) {
  return <View style={styles.metric}><Icon size={17} color={colors.primary} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  hero: { height: 180, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: '#0E0F12', alignItems: 'center', justifyContent: 'center', gap: spacing.x4 },
  title: { ...typography.sectionTitle, color: colors.text, marginTop: spacing.x4 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2, marginTop: spacing.x2 },
  ratingText: { ...typography.caption, color: colors.warning },
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
  benefits: { gap: spacing.x3 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3 },
  joinButton: { marginTop: spacing.x6 },
});
