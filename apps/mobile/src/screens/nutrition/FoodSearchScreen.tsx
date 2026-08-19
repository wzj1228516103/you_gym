import { useCallback, useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, Search, X } from 'lucide-react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen, Card, IconButton, ScreenHeader } from '../../components/ui';
import { fetchFoods, FoodItem } from '../../services/api';
import { colors, radius, spacing, typography } from '../../theme';
import type { NutritionStackParamList } from '../../types';
import { trackEvent } from '../../services/analytics';

type Props = NativeStackScreenProps<NutritionStackParamList, 'FoodSearch'>;

export function FoodSearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('鸡胸肉');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useFocusEffect(useCallback(() => {
    let active = true; setLoading(true);
    void fetchFoods(query).then((result) => { if (active) { setResults(result.items); setError(null); } }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : '食物加载失败'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query]));
  useEffect(() => { trackEvent('nutrition_food_search_opened', { source: 'nutrition_home' }, { screenId: 'food_search' }); }, []);
  return (
    <AppScreen keyboard>
      <ScreenHeader title="食物搜索" onBack={navigation.goBack} />
      <View style={styles.searchBox}><Search size={19} color={colors.textSecondary} /><TextInput value={query} onChangeText={setQuery} placeholder="搜索食物" placeholderTextColor={colors.textTertiary} style={styles.input} />{query ? <IconButton icon={X} label="清除搜索" size={34} onPress={() => setQuery('')} /> : null}</View>
      <Text style={styles.count}>{loading ? '加载中…' : `找到 ${results.length} 个结果`}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {results.map((food) => (
        <Card key={food.id} onPress={() => { trackEvent('nutrition_item_selected', { foodId: food.id, source: 'food_search' }, { screenId: 'food_search' }); navigation.navigate('FoodDetail', { foodId: food.id }); }} accessibilityLabel={`查看${food.name}`} style={styles.foodCard}>
          <View style={styles.foodArt}><Text style={styles.foodEmoji}>◉</Text></View>
          <View style={styles.foodCopy}><Text style={styles.foodName}>{food.name}</Text><Text style={styles.foodMeta}>{food.serving} · {food.calories} kcal</Text></View>
          <Text style={styles.source}>{food.source}</Text>
          <ChevronRight size={17} color={colors.textTertiary} />
        </Card>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchBox: { minHeight: 50, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, flexDirection: 'row', alignItems: 'center', gap: spacing.x2, paddingLeft: spacing.x3 },
  input: { flex: 1, minHeight: 48, ...typography.body, color: colors.text, outlineStyle: 'none' } as never,
  count: { ...typography.caption, color: colors.textSecondary, marginVertical: spacing.x4 },
  foodCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginBottom: spacing.x2, padding: spacing.x3 },
  foodArt: { width: 56, height: 56, borderRadius: radius.card, backgroundColor: '#20230F', alignItems: 'center', justifyContent: 'center' },
  foodEmoji: { fontSize: 25, color: colors.primary },
  foodCopy: { flex: 1 },
  foodName: { ...typography.listTitle, color: colors.text },
  foodMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  source: { ...typography.eyebrow, color: colors.textTertiary },
  error: { ...typography.caption, color: colors.error, marginBottom: spacing.x3 },
});
