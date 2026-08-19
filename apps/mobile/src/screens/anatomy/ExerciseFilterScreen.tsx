import { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bookmark, ChevronRight, Dumbbell, SearchX, SlidersHorizontal, Star } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, Chip, IconButton, ScreenHeader, Tag } from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, typography } from '../../theme';
import { trackEvent } from '../../services/analytics';
import type { AnatomyStackParamList } from '../../types';

type Props = NativeStackScreenProps<AnatomyStackParamList, 'ExerciseFilter'>;

export function ExerciseFilterScreen({ navigation, route }: Props) {
  const { anatomyNodes, exercises } = useAppState();
  const node = anatomyNodes.find((item) => item.id === route.params.nodeId) ?? anatomyNodes[0];
  useEffect(() => {
    trackEvent('screen_viewed', { nodeId: node.id, muscle: node.muscle }, { screenId: 'exercise_filter' });
  }, [node.id, node.muscle]);
  const locations = ['全部', ...Array.from(new Set(exercises.map((exercise) => exercise.location)))];
  const equipmentOptions = ['全部', ...Array.from(new Set(exercises.map((exercise) => exercise.equipment)))];
  const [location, setLocation] = useState('全部');
  const [equipment, setEquipment] = useState('全部');
  const [level, setLevel] = useState('全部');
  const [sort, setSort] = useState<'推荐' | '评分'>('推荐');
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const results = useMemo(() => exercises.filter((exercise) => (
    node.exerciseIds.includes(exercise.id)
    && (location === '全部' || exercise.location === location)
    && (equipment === '全部' || exercise.equipment === equipment)
    && (level === '全部' || exercise.level === level)
  )).sort((a, b) => sort === '评分' ? b.rating - a.rating : node.exerciseIds.indexOf(a.id) - node.exerciseIds.indexOf(b.id)), [equipment, level, location, node.exerciseIds, sort]);

  return (
    <AppScreen>
      <ScreenHeader title="动作筛选" onBack={navigation.goBack} actions={<IconButton icon={SlidersHorizontal} label="筛选" size={42} />} />
      <View style={styles.targetRow}><Text style={styles.targetLabel}>当前目标</Text><Tag tone="muscle">{node.muscle} · {node.part}</Tag></View>

      <FilterRow title="场地" values={locations} value={location} onChange={setLocation} />
      <FilterRow title="器械" values={equipmentOptions} value={equipment} onChange={setEquipment} />
      <FilterRow title="难度" values={['全部', '新手', '初级', '中级']} value={level} onChange={setLevel} />

      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>找到 {results.length} 个动作</Text>
        <View style={styles.sortRow}>{(['推荐', '评分'] as const).map((item) => <Chip key={item} label={item} active={sort === item} onPress={() => setSort(item)} />)}</View>
      </View>

      {results.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIcon}><SearchX size={36} color={colors.textSecondary} /></View>
          <Text style={styles.emptyTitle}>未找到匹配动作</Text>
          <Text style={styles.emptyBody}>当前筛选条件过于严格，请尝试放宽场地、器械或难度条件。</Text>
          <Pressable onPress={() => { setLocation('全部'); setEquipment('全部'); setLevel('全部'); }} style={styles.resetButton}><Text style={styles.resetText}>重置筛选</Text></Pressable>
        </Card>
      ) : results.map((exercise) => (
        <Card key={exercise.id} onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: exercise.id, nodeId: node.id })} accessibilityLabel={`查看${exercise.name}`} style={styles.exerciseCard}>
          <View style={styles.exerciseArt}><Dumbbell size={28} color={colors.muscle} /></View>
          <View style={styles.exerciseCopy}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseMeta}>{exercise.equipment} · {exercise.target}</Text>
            <View style={styles.ratingRow}><Star size={13} color={colors.warning} fill={colors.warning} /><Text style={styles.rating}>{exercise.rating}</Text><Tag>{exercise.level}</Tag></View>
          </View>
          <Pressable hitSlop={10} onPress={(event) => { event.stopPropagation(); setBookmarked((current) => current.includes(exercise.id) ? current.filter((id) => id !== exercise.id) : [...current, exercise.id]); }}>
            <Bookmark size={20} color={bookmarked.includes(exercise.id) ? colors.primary : colors.textSecondary} fill={bookmarked.includes(exercise.id) ? colors.primary : 'transparent'} />
          </Pressable>
          <ChevronRight size={18} color={colors.textTertiary} />
        </Card>
      ))}
    </AppScreen>
  );
}

function FilterRow({ title, values, value, onChange }: { title: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>{values.map((item) => <Chip key={item} label={item} active={value === item} onPress={() => onChange(item)} />)}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  targetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  targetLabel: { ...typography.body, color: colors.textSecondary },
  filterBlock: { marginTop: spacing.x4, gap: spacing.x2 },
  filterTitle: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  filterScroll: { gap: spacing.x2 },
  resultHeader: { minHeight: 58, marginTop: spacing.x4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultCount: { ...typography.body, color: colors.text, fontWeight: '700' },
  sortRow: { flexDirection: 'row', gap: spacing.x2 },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginBottom: spacing.x2, padding: spacing.x3 },
  exerciseArt: { width: 64, height: 64, flexShrink: 0, borderRadius: radius.card, backgroundColor: '#0E0F12', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,45,85,0.22)' },
  exerciseCopy: { flex: 1, minWidth: 0 },
  exerciseName: { ...typography.listTitle, color: colors.text },
  exerciseMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.x1, marginTop: spacing.x2 },
  rating: { ...typography.caption, color: colors.warning, fontWeight: '700', marginRight: spacing.x2 },
  emptyCard: { alignItems: 'center', marginTop: spacing.x8, gap: spacing.x3, paddingVertical: spacing.x8 },
  emptyIcon: { width: 72, height: 72, borderRadius: radius.pill, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...typography.cardTitle, color: colors.text },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', maxWidth: 280 },
  resetButton: { minHeight: 44, borderRadius: radius.control, borderWidth: 1, borderColor: colors.primaryBorder, paddingHorizontal: spacing.x5, alignItems: 'center', justifyContent: 'center' },
  resetText: { ...typography.button, color: colors.primary },
});
