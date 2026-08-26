import { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Bookmark, ChevronRight, SearchX, SlidersHorizontal } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, Chip, IconButton, ScreenHeader, Tag } from '../../components/ui';
import { ExerciseMediaPreview, inferExerciseMediaKind } from '../../components/ExerciseMediaPreview';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, typography } from '../../theme';
import { trackEvent } from '../../services/analytics';
import { loadFavoriteExerciseIds, toggleFavoriteExercise } from '../../services/favorites';
import { useAuthState } from '../../state/AuthState';
import type { AnatomyStackParamList } from '../../types';

type Props = NativeStackScreenProps<AnatomyStackParamList, 'ExerciseFilter'>;

export function ExerciseFilterScreen({ navigation, route }: Props) {
  const { anatomyNodes, exercises } = useAppState();
  const { user, guest } = useAuthState();
  const favoriteScope = user?.id ?? (guest ? 'guest' : 'guest');
  const node = anatomyNodes.find((item) => item.id === route.params.nodeId) ?? anatomyNodes[0];
  useEffect(() => {
    trackEvent('screen_viewed', { nodeId: node.id, muscle: node.muscle }, { screenId: 'exercise_filter' });
  }, [node.id, node.muscle]);
  const locations = ['全部', ...Array.from(new Set(exercises.map((exercise) => exercise.location)))];
  const equipmentOptions = ['全部', ...Array.from(new Set(exercises.map((exercise) => exercise.equipment)))];
  const [location, setLocation] = useState('全部');
  const [equipment, setEquipment] = useState('全部');
  const [level, setLevel] = useState('全部');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  useFocusEffect(useCallback(() => {
    let active = true;
    void loadFavoriteExerciseIds(favoriteScope).then((ids) => { if (active) setBookmarked(ids); });
    return () => { active = false; };
  }, [favoriteScope]));

  const results = useMemo(() => exercises.filter((exercise) => (
    node.exerciseIds.includes(exercise.id)
    && (location === '全部' || exercise.location === location)
    && (equipment === '全部' || exercise.equipment === equipment)
    && (level === '全部' || exercise.level === level)
  )).sort((a, b) => node.exerciseIds.indexOf(a.id) - node.exerciseIds.indexOf(b.id)), [equipment, exercises, level, location, node.exerciseIds]);

  return (
    <AppScreen>
      <ScreenHeader title="动作筛选" onBack={navigation.goBack} actions={<IconButton icon={SlidersHorizontal} label="筛选" size={42} />} />
      <View style={styles.targetRow}><Text style={styles.targetLabel}>当前目标</Text><Tag tone="muscle">{node.muscle} · {node.part}</Tag></View>

      <FilterRow title="场地" values={locations} value={location} onChange={setLocation} />
      <FilterRow title="器械" values={equipmentOptions} value={equipment} onChange={setEquipment} />
      <FilterRow title="难度" values={['全部', '新手', '初级', '中级']} value={level} onChange={setLevel} />

      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>找到 {results.length} 个动作</Text>
        <Tag>数据库动作</Tag>
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
          <View style={styles.exerciseArt}><ExerciseThumbnail exercise={exercise} /></View>
          <View style={styles.exerciseCopy}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseMeta}>{exercise.equipment} · {exercise.target}</Text>
            <View style={styles.ratingRow}>{exercise.rating > 0 ? <Text style={styles.rating}>{exercise.rating} 分</Text> : null}<Tag>{exercise.level}</Tag></View>
          </View>
          <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel={bookmarked.includes(exercise.id) ? `取消收藏${exercise.name}` : `收藏${exercise.name}`} onPress={(event) => {
            event.stopPropagation();
            const saved = !bookmarked.includes(exercise.id);
            setBookmarked((current) => saved ? [exercise.id, ...current] : current.filter((id) => id !== exercise.id));
            void toggleFavoriteExercise(favoriteScope, exercise.id).catch(() => {
              setBookmarked((current) => saved ? current.filter((id) => id !== exercise.id) : [exercise.id, ...current]);
            });
            trackEvent(saved ? 'exercise_favorited' : 'exercise_unfavorited', { exerciseId: exercise.id }, { screenId: 'exercise_filter' });
          }}>
            <Bookmark size={20} color={bookmarked.includes(exercise.id) ? colors.primary : colors.textSecondary} fill={bookmarked.includes(exercise.id) ? colors.primary : 'transparent'} />
          </Pressable>
          <ChevronRight size={18} color={colors.textTertiary} />
        </Card>
      ))}
    </AppScreen>
  );
}

function ExerciseThumbnail({ exercise }: { exercise: import('../../types').Exercise }) {
  const thumbnail = exercise.mediaResources?.find((resource) => resource.resourceType === 'THUMBNAIL_IMAGE')?.resourceUrl ?? exercise.mediaUrl;
  const resource = exercise.mediaResources?.find((candidate) => candidate.resourceUrl === thumbnail);
  return <ExerciseMediaPreview url={thumbnail} kind={inferExerciseMediaKind(resource?.resourceType, thumbnail)} style={StyleSheet.absoluteFill} accessibilityLabel={`${exercise.name}缩略图`} />;
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
