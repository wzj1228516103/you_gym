import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Camera, ChevronRight, Plus, Utensils } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppScreen, Card, IconButton, PrimaryButton, ScreenHeader, SectionHeader } from '../../components/ui';
import { fetchNutrition, NutritionRecord } from '../../services/api';
import { useAuthState } from '../../state/AuthState';
import { colors, radius, spacing, typography } from '../../theme';
import type { NutritionStackParamList } from '../../types';
import { trackEvent } from '../../services/analytics';

type Props = NativeStackScreenProps<NutritionStackParamList, 'NutritionHome'>;

export function NutritionHomeScreen({ navigation }: Props) {
  const { token, guest } = useAuthState();
  const [records, setRecords] = useState<NutritionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useFocusEffect(useCallback(() => {
    trackEvent('nutrition_screen_viewed', { source: 'main_tab' }, { screenId: 'nutrition_home' });
    if (!token) { setRecords([]); return undefined; }
    let active = true; setLoading(true);
    void fetchNutrition(token).then((result) => { if (active) { setRecords(result.items); setError(null); } }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : '营养记录加载失败'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]));

  const todayRecords = useMemo(() => { const today = new Date().toDateString(); return records.filter((record) => new Date(record.recordedAt).toDateString() === today); }, [records]);
  const calories = todayRecords.reduce((sum, record) => sum + Number(record.calories || 0), 0);
  const protein = todayRecords.reduce((sum, record) => sum + Number(record.proteinG || 0), 0);
  const carbs = todayRecords.reduce((sum, record) => sum + Number(record.carbohydratesG || 0), 0);
  const fat = todayRecords.reduce((sum, record) => sum + Number(record.fatG || 0), 0);
  const goal = 2100;
  const calorieProgress = Math.min(calories / goal, 1);
  const mealRecords = todayRecords.length ? todayRecords : records.slice(0, 4);

  return <AppScreen>
    <ScreenHeader title="今日营养" actions={<IconButton icon={Camera} label="扫描食物" size={42} />} />
    {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Card style={styles.summaryCard}>
      <View style={styles.ringWrap}><Svg width={124} height={124} viewBox="0 0 124 124"><Circle cx="62" cy="62" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" /><Circle cx="62" cy="62" r="50" fill="none" stroke={colors.primary} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * (1 - calorieProgress)}`} transform="rotate(-90 62 62)" /></Svg><View style={styles.ringText}><Text style={styles.ringLabel}>已摄入</Text><Text style={styles.calories}>{calories.toLocaleString()}</Text><Text style={styles.ringGoal}>/ {goal.toLocaleString()} kcal</Text></View></View>
      <View style={styles.macros}><Macro label="蛋白质" value={`${protein.toFixed(1)} / 140g`} progress={Math.min(protein / 140, 1)} color="#FF6688" /><Macro label="碳水" value={`${carbs.toFixed(1)} / 260g`} progress={Math.min(carbs / 260, 1)} color={colors.primary} /><Macro label="脂肪" value={`${fat.toFixed(1)} / 70g`} progress={Math.min(fat / 70, 1)} color={colors.warning} /></View>
    </Card>
    <SectionHeader title="餐次记录" action="编辑目标" />
    <View style={styles.mealList}>{mealRecords.map((meal) => <View key={meal.id} style={styles.mealRow}><View style={styles.mealIcon}><Utensils size={18} color={colors.primary} /></View><View style={styles.mealCopy}><Text style={styles.mealName}>{meal.mealName}</Text><Text style={styles.mealDetail}>{meal.foodCount ? `${meal.foodCount} 种食物` : '已记录营养'}</Text></View><View style={styles.mealRight}><Text style={styles.mealKcal}>{Number(meal.calories).toLocaleString()} kcal</Text><Text style={styles.mealTime}>{new Date(meal.recordedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</Text></View><ChevronRight size={17} color={colors.textTertiary} /></View>)}</View>
    {!loading && mealRecords.length === 0 ? <Card style={styles.emptyCard}><Text style={styles.empty}>{guest ? '游客模式不会同步饮食记录，登录后即可保存。' : '还没有饮食记录，点击下方按钮开始记录。'}</Text></Card> : null}
    <PrimaryButton label="记录食物" icon={Plus} onPress={() => navigation.navigate('FoodSearch')} style={styles.addButton} />
    <SectionHeader title="营养提示" /><Card><Text style={styles.tip}>{todayRecords.length ? '今日记录已同步，继续保持均衡摄入，训练后优先补充蛋白质。' : '记录每餐食物后，这里会根据当天的摄入量展示营养进度。'}</Text></Card>
  </AppScreen>;
}

function Macro({ label, value, progress, color }: { label: string; value: string; progress: number; color: string }) { return <View style={styles.macro}><View style={styles.macroCopy}><Text style={styles.macroLabel}>{label}</Text><Text style={styles.macroValue}>{value}</Text></View><View style={styles.macroTrack}><View style={[styles.macroProgress, { width: `${progress * 100}%`, backgroundColor: color }]} /></View></View>; }

const styles = StyleSheet.create({ summaryCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.x4, padding: spacing.x4 }, ringWrap: { width: 124, height: 124, alignItems: 'center', justifyContent: 'center' }, ringText: { position: 'absolute', alignItems: 'center' }, ringLabel: { ...typography.eyebrow, color: colors.textSecondary }, calories: { ...typography.sectionTitle, color: colors.text, marginTop: 1 }, ringGoal: { ...typography.eyebrow, color: colors.textTertiary }, macros: { flex: 1, gap: spacing.x3 }, macro: { gap: spacing.x1 }, macroCopy: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.x2 }, macroLabel: { ...typography.caption, color: colors.textSecondary }, macroValue: { ...typography.eyebrow, color: colors.text }, macroTrack: { height: 4, borderRadius: radius.pill, backgroundColor: colors.divider, overflow: 'hidden' }, macroProgress: { height: '100%', borderRadius: radius.pill }, mealList: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' }, mealRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, paddingHorizontal: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider }, mealIcon: { width: 38, height: 38, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, mealCopy: { flex: 1, minWidth: 0 }, mealName: { ...typography.listTitle, color: colors.text }, mealDetail: { ...typography.caption, color: colors.textSecondary, marginTop: 2 }, mealRight: { alignItems: 'flex-end' }, mealKcal: { ...typography.caption, color: colors.text }, mealTime: { ...typography.eyebrow, color: colors.textTertiary, marginTop: 2 }, addButton: { marginTop: spacing.x4 }, tip: { ...typography.body, color: colors.textSecondary }, loading: { marginBottom: spacing.x3 }, error: { ...typography.caption, color: colors.error, marginBottom: spacing.x3 }, emptyCard: { marginTop: spacing.x3 }, empty: { ...typography.body, color: colors.textSecondary }
});
