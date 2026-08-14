import { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronRight, Search, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen, Card, Chip, IconButton, ScreenHeader } from '../../components/ui';
import { foods } from '../../data/mockData';
import { colors, radius, spacing, typography } from '../../theme';
import type { NutritionStackParamList } from '../../types';

type Props = NativeStackScreenProps<NutritionStackParamList, 'FoodSearch'>;

export function FoodSearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('鸡胸肉');
  const [tab, setTab] = useState('全部');
  const results = useMemo(() => foods.filter((food) => food.name.includes(query.trim()) || !query.trim()), [query]);
  return (
    <AppScreen keyboard>
      <ScreenHeader title="食物搜索" onBack={navigation.goBack} />
      <View style={styles.searchBox}><Search size={19} color={colors.textSecondary} /><TextInput value={query} onChangeText={setQuery} placeholder="搜索食物" placeholderTextColor={colors.textTertiary} style={styles.input} />{query ? <IconButton icon={X} label="清除搜索" size={34} onPress={() => setQuery('')} /> : null}</View>
      <View style={styles.tabs}>{['全部', '食物', '食谱', '我的'].map((item) => <Chip key={item} label={item} active={tab === item} onPress={() => setTab(item)} />)}</View>
      <Text style={styles.count}>找到 {results.length} 个结果</Text>
      {results.map((food) => (
        <Card key={food.id} onPress={() => navigation.navigate('FoodDetail', { foodId: food.id })} accessibilityLabel={`查看${food.name}`} style={styles.foodCard}>
          <View style={styles.foodArt}><Text style={styles.foodEmoji}>◉</Text></View>
          <View style={styles.foodCopy}><Text style={styles.foodName}>{food.name}</Text><Text style={styles.foodMeta}>{food.serving} · {food.calories} kcal</Text></View>
          <Text style={styles.source}>{food.source}</Text>
          <ChevronRight size={17} color={colors.textTertiary} />
        </Card>
      ))}
      <Pressable style={styles.customButton}><Text style={styles.customText}>添加自定义食物</Text></Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchBox: { minHeight: 50, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, flexDirection: 'row', alignItems: 'center', gap: spacing.x2, paddingLeft: spacing.x3 },
  input: { flex: 1, minHeight: 48, ...typography.body, color: colors.text, outlineStyle: 'none' } as never,
  tabs: { flexDirection: 'row', gap: spacing.x2, marginTop: spacing.x3 },
  count: { ...typography.caption, color: colors.textSecondary, marginVertical: spacing.x4 },
  foodCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginBottom: spacing.x2, padding: spacing.x3 },
  foodArt: { width: 56, height: 56, borderRadius: radius.card, backgroundColor: '#20230F', alignItems: 'center', justifyContent: 'center' },
  foodEmoji: { fontSize: 25, color: colors.primary },
  foodCopy: { flex: 1 },
  foodName: { ...typography.listTitle, color: colors.text },
  foodMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  source: { ...typography.eyebrow, color: colors.textTertiary },
  customButton: { minHeight: 48, borderRadius: radius.control, borderWidth: 1, borderColor: colors.primaryBorder, alignItems: 'center', justifyContent: 'center', marginTop: spacing.x3 },
  customText: { ...typography.button, color: colors.primary },
});
