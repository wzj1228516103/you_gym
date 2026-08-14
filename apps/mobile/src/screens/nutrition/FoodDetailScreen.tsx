import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Minus, Plus, Utensils } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, PrimaryButton, ScreenHeader, SegmentedControl } from '../../components/ui';
import { foods } from '../../data/mockData';
import { colors, radius, spacing, typography } from '../../theme';
import type { NutritionStackParamList } from '../../types';

type Props = NativeStackScreenProps<NutritionStackParamList, 'FoodDetail'>;

export function FoodDetailScreen({ navigation, route }: Props) {
  const food = foods.find((item) => item.id === route.params.foodId) ?? foods[0];
  const [meal, setMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [grams, setGrams] = useState(150);
  const ratio = grams / 100;
  return (
    <AppScreen>
      <ScreenHeader title={food.name} onBack={navigation.goBack} />
      <View style={styles.hero}><Utensils size={58} color={colors.primary} /><Text style={styles.source}>来源：{food.source}</Text></View>
      <View style={styles.calorieRow}><Text style={styles.calories}>{Math.round(food.calories * ratio)} kcal</Text><Text style={styles.serving}>{grams} g</Text></View>
      <View style={styles.macroRow}><Nutrient label="蛋白质" value={`${(food.protein * ratio).toFixed(1)} g`} /><Nutrient label="碳水" value={`${(food.carbs * ratio).toFixed(1)} g`} /><Nutrient label="脂肪" value={`${(food.fat * ratio).toFixed(1)} g`} /></View>
      <Text style={styles.label}>记录到餐次</Text>
      <SegmentedControl options={[{ label: '早餐', value: 'breakfast' }, { label: '午餐', value: 'lunch' }, { label: '晚餐', value: 'dinner' }, { label: '加餐', value: 'snack' }]} value={meal} onChange={setMeal} />
      <Text style={styles.label}>份量</Text>
      <Card style={styles.stepper}><Pressable onPress={() => setGrams((value) => Math.max(50, value - 50))} style={styles.stepButton}><Minus size={22} color={colors.text} /></Pressable><View style={styles.amount}><Text style={styles.amountValue}>{grams}</Text><Text style={styles.amountUnit}>克</Text></View><Pressable onPress={() => setGrams((value) => value + 50)} style={styles.stepButton}><Plus size={22} color={colors.text} /></Pressable></Card>
      <Card style={styles.note}><Text style={styles.noteTitle}>数据说明</Text><Text style={styles.noteText}>营养数据按所选份量估算，实际数值可能因品牌、烹饪方式和含水量而变化。</Text></Card>
      <PrimaryButton label="加入餐次" onPress={() => navigation.popToTop()} style={styles.add} />
    </AppScreen>
  );
}

function Nutrient({ label, value }: { label: string; value: string }) { return <View style={styles.nutrient}><Text style={styles.nutrientLabel}>{label}</Text><Text style={styles.nutrientValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  hero: { height: 210, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: '#161A0B', alignItems: 'center', justifyContent: 'center' },
  source: { ...typography.caption, color: colors.textSecondary, position: 'absolute', bottom: spacing.x3 },
  calorieRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: spacing.x4 },
  calories: { ...typography.pageTitle, color: colors.text },
  serving: { ...typography.body, color: colors.primary },
  macroRow: { flexDirection: 'row', marginTop: spacing.x3, paddingVertical: spacing.x4, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider },
  nutrient: { flex: 1, alignItems: 'center' },
  nutrientLabel: { ...typography.caption, color: colors.textSecondary },
  nutrientValue: { ...typography.listTitle, color: colors.text, marginTop: spacing.x1 },
  label: { ...typography.body, color: colors.text, fontWeight: '700', marginTop: spacing.x5, marginBottom: spacing.x2 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepButton: { width: 48, height: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  amount: { alignItems: 'center' },
  amountValue: { ...typography.pageTitle, color: colors.text },
  amountUnit: { ...typography.caption, color: colors.textSecondary },
  note: { marginTop: spacing.x5, gap: spacing.x2 },
  noteTitle: { ...typography.listTitle, color: colors.text },
  noteText: { ...typography.body, color: colors.textSecondary },
  add: { marginTop: spacing.x6 },
});
