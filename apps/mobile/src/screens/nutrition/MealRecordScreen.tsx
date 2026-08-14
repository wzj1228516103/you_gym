import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronRight, Plus, Utensils } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, PrimaryButton, ScreenHeader, SectionHeader } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { NutritionStackParamList } from '../../types';

type Props = NativeStackScreenProps<NutritionStackParamList, 'MealRecord'>;

const mealFoods = [
  { name: '鸡胸肉（熟）', amount: '120 g', kcal: 198, meta: '蛋白质 37.2g · 脂肪 4.3g' },
  { name: '糙米饭', amount: '150 g', kcal: 174, meta: '碳水 36.8g · 蛋白质 3.8g' },
  { name: '西兰花', amount: '100 g', kcal: 34, meta: '碳水 6.6g · 膳食纤维 2.6g' },
];

export function MealRecordScreen({ navigation, route }: Props) {
  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader title={route.params.mealName} eyebrow="今日饮食" onBack={navigation.goBack} actions={<Text style={styles.edit}>编辑</Text>} />
      <Card style={styles.summary}><View style={styles.summaryIcon}><Utensils size={24} color={colors.primary} /></View><View style={styles.summaryCopy}><Text style={styles.summaryTitle}>这顿饭记录得很完整</Text><Text style={styles.summaryMeta}>12:30 · 共 406 kcal</Text></View></Card>
      <SectionHeader title="食物明细" action="添加食物" onAction={() => navigation.navigate('FoodSearch')} />
      <View style={styles.foodList}>
        {mealFoods.map((food) => <View key={food.name} style={styles.foodRow}><View style={styles.foodArt}><Utensils size={19} color={colors.textSecondary} /></View><View style={styles.foodCopy}><Text style={styles.foodName}>{food.name}</Text><Text style={styles.foodMeta}>{food.amount} · {food.meta}</Text></View><View style={styles.foodRight}><Text style={styles.foodKcal}>{food.kcal}</Text><Text style={styles.unit}>kcal</Text></View><ChevronRight size={16} color={colors.textTertiary} /></View>)}
      </View>
      <Card style={styles.totalCard}><Text style={styles.totalLabel}>本餐小计</Text><View style={styles.totalRow}><Metric label="热量" value="406 kcal" accent /><Metric label="蛋白质" value="41.0 g" /><Metric label="碳水" value="44.2 g" /><Metric label="脂肪" value="8.8 g" /></View></Card>
      <PrimaryButton label="完成记录" icon={Plus} onPress={navigation.goBack} style={styles.button} />
    </AppScreen>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, accent && styles.metricAccent]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.x8 },
  edit: { ...typography.body, color: colors.primary, fontWeight: '700', padding: spacing.x2 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3 },
  summaryIcon: { width: 52, height: 52, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  summaryCopy: { flex: 1 },
  summaryTitle: { ...typography.listTitle, color: colors.text },
  summaryMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  foodList: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' },
  foodRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, paddingHorizontal: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  foodArt: { width: 44, height: 44, borderRadius: radius.control, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  foodCopy: { flex: 1, minWidth: 0 },
  foodName: { ...typography.listTitle, color: colors.text },
  foodMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  foodRight: { alignItems: 'flex-end' },
  foodKcal: { ...typography.listTitle, color: colors.text },
  unit: { ...typography.eyebrow, color: colors.textTertiary },
  totalCard: { marginTop: spacing.x4 },
  totalLabel: { ...typography.caption, color: colors.textSecondary },
  totalRow: { flexDirection: 'row', marginTop: spacing.x3, gap: spacing.x2 },
  metric: { flex: 1, minWidth: 0 },
  metricLabel: { ...typography.eyebrow, color: colors.textSecondary },
  metricValue: { ...typography.caption, color: colors.text, fontWeight: '700', marginTop: spacing.x1 },
  metricAccent: { color: colors.primary },
  button: { marginTop: spacing.x5 },
});
