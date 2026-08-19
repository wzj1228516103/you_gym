import { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, ChevronRight, Plus, Search, Utensils } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppScreen, Card, IconButton, PrimaryButton, ScreenHeader, SectionHeader } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { NutritionStackParamList } from '../../types';
import { trackEvent } from '../../services/analytics';

type Props = NativeStackScreenProps<NutritionStackParamList, 'NutritionHome'>;

const meals = [
  { name: '早餐', detail: '燕麦 · 牛奶 · 鸡蛋', kcal: 428, time: '08:30' },
  { name: '午餐', detail: '鸡胸肉 · 糙米 · 西兰花', kcal: 563, time: '12:30' },
  { name: '加餐', detail: '香蕉 · 坚果', kcal: 150, time: '16:30' },
  { name: '晚餐', detail: '三文鱼 · 土豆 · 沙拉', kcal: 145, time: '19:30' },
];

export function NutritionHomeScreen({ navigation }: Props) {
  useEffect(() => { trackEvent('nutrition_screen_viewed', { source: 'main_tab' }, { screenId: 'nutrition_home' }); }, []);
  return (
    <AppScreen>
      <ScreenHeader title="今日营养" actions={<IconButton icon={Camera} label="扫描食物" size={42} />} />
      <Card style={styles.summaryCard}>
        <View style={styles.ringWrap}>
          <Svg width={124} height={124} viewBox="0 0 124 124">
            <Circle cx="62" cy="62" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <Circle cx="62" cy="62" r="50" fill="none" stroke={colors.primary} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * 0.39}`} transform="rotate(-90 62 62)" />
            <Circle cx="62" cy="62" r="50" fill="none" stroke={colors.muscle} strokeWidth="8" strokeDasharray="52 262" strokeDashoffset="-198" transform="rotate(-90 62 62)" />
          </Svg>
          <View style={styles.ringText}><Text style={styles.ringLabel}>已摄入</Text><Text style={styles.calories}>1,286</Text><Text style={styles.ringGoal}>/ 2,100 kcal</Text></View>
        </View>
        <View style={styles.macros}>
          <Macro label="蛋白质" value="102 / 140g" progress={0.73} color="#FF6688" />
          <Macro label="碳水" value="142 / 260g" progress={0.55} color={colors.primary} />
          <Macro label="脂肪" value="38 / 70g" progress={0.54} color={colors.warning} />
        </View>
      </Card>

      <SectionHeader title="餐次记录" action="编辑目标" />
      <View style={styles.mealList}>
        {meals.map((meal) => (
          <Pressable key={meal.name} onPress={() => navigation.navigate('MealRecord', { mealName: meal.name })} style={({ pressed }) => [styles.mealRow, pressed && styles.pressed]}>
            <View style={styles.mealIcon}><Utensils size={18} color={colors.primary} /></View>
            <View style={styles.mealCopy}><Text style={styles.mealName}>{meal.name}</Text><Text style={styles.mealDetail}>{meal.detail}</Text></View>
            <View style={styles.mealRight}><Text style={styles.mealKcal}>{meal.kcal} kcal</Text><Text style={styles.mealTime}>{meal.time}</Text></View>
            <ChevronRight size={17} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>
      <PrimaryButton label="记录食物" icon={Plus} onPress={() => navigation.navigate('FoodSearch')} style={styles.addButton} />

      <SectionHeader title="营养提示" />
      <Card><Text style={styles.tip}>今天的蛋白质摄入进度良好。晚餐可以优先选择瘦肉、鱼类或豆制品，并补充一份蔬菜。</Text></Card>
    </AppScreen>
  );
}

function Macro({ label, value, progress, color }: { label: string; value: string; progress: number; color: string }) {
  return <View style={styles.macro}><View style={styles.macroCopy}><Text style={styles.macroLabel}>{label}</Text><Text style={styles.macroValue}>{value}</Text></View><View style={styles.macroTrack}><View style={[styles.macroProgress, { width: `${progress * 100}%`, backgroundColor: color }]} /></View></View>;
}

const styles = StyleSheet.create({
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.x4, padding: spacing.x4 },
  ringWrap: { width: 124, height: 124, alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', alignItems: 'center' },
  ringLabel: { ...typography.eyebrow, color: colors.textSecondary },
  calories: { ...typography.sectionTitle, color: colors.text, marginTop: 1 },
  ringGoal: { ...typography.eyebrow, color: colors.textTertiary },
  macros: { flex: 1, gap: spacing.x3 },
  macro: { gap: spacing.x1 },
  macroCopy: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.x2 },
  macroLabel: { ...typography.caption, color: colors.textSecondary },
  macroValue: { ...typography.eyebrow, color: colors.text },
  macroTrack: { height: 4, borderRadius: radius.pill, backgroundColor: colors.divider, overflow: 'hidden' },
  macroProgress: { height: '100%', borderRadius: radius.pill },
  mealList: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' },
  mealRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, paddingHorizontal: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  mealIcon: { width: 38, height: 38, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  mealCopy: { flex: 1, minWidth: 0 },
  mealName: { ...typography.listTitle, color: colors.text },
  mealDetail: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  mealRight: { alignItems: 'flex-end' },
  mealKcal: { ...typography.caption, color: colors.text },
  mealTime: { ...typography.eyebrow, color: colors.textTertiary, marginTop: 2 },
  addButton: { marginTop: spacing.x4 },
  tip: { ...typography.body, color: colors.textSecondary },
  pressed: { opacity: 0.78 },
});
