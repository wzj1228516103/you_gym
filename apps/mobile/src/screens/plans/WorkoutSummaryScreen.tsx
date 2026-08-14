import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, Dumbbell, Flame, Trophy } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, PrimaryButton, SecondaryButton } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'WorkoutSummary'>;

export function WorkoutSummaryScreen({ navigation }: Props) {
  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.trophy}><Trophy size={52} color={colors.textInverse} strokeWidth={2.2} /></View>
      <Text style={styles.title}>训练完成</Text>
      <Text style={styles.subtitle}>本次训练已经可靠保存</Text>
      <View style={styles.metricRow}><SummaryMetric label="训练时长" value="45:32" /><SummaryMetric label="总组数" value="16" /><SummaryMetric label="总容量" value="6,240 kg" /></View>
      <Card style={styles.performance}>
        <Text style={styles.sectionTitle}>本次表现</Text>
        <View style={styles.performanceRow}><Check size={18} color={colors.primary} /><Text style={styles.performanceText}>完成度 100%</Text></View>
        <View style={styles.performanceRow}><Dumbbell size={18} color={colors.primary} /><Text style={styles.performanceText}>平均 RPE 7.2</Text></View>
        <View style={styles.performanceRow}><Flame size={18} color={colors.primary} /><Text style={styles.performanceText}>消耗约 620 kcal</Text></View>
      </Card>
      <Card style={styles.muscleCard}><Text style={styles.sectionTitle}>主要训练部位</Text><Text style={styles.muscles}>胸大肌 · 三角肌前束 · 肱三头肌</Text></Card>
      <PrimaryButton label="返回训练计划" onPress={() => navigation.popToTop()} style={styles.primary} />
      <SecondaryButton label="查看详细数据" onPress={() => undefined} />
    </AppScreen>
  );
}

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
