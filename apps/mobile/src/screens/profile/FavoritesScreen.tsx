import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bookmark, BookmarkX, ChevronRight, SearchX } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader, Tag } from '../../components/ui';
import { ExerciseMediaPreview, inferExerciseMediaKind } from '../../components/ExerciseMediaPreview';
import { useAppState } from '../../state/AppState';
import { useAuthState } from '../../state/AuthState';
import { loadSyncedFavoriteExerciseIds, toggleFavoriteExercise } from '../../services/favorites';
import { trackEvent } from '../../services/analytics';
import { colors, radius, spacing, typography } from '../../theme';
import type { Exercise, ProfileStackParamList } from '../../types';
import { ExerciseDetailContent } from '../anatomy/ExerciseDetailScreen';

type ListProps = NativeStackScreenProps<ProfileStackParamList, 'Favorites'>;
type DetailProps = NativeStackScreenProps<ProfileStackParamList, 'FavoriteExerciseDetail'>;

export function FavoritesScreen({ navigation }: ListProps) {
  const { exercises } = useAppState();
  const { user, guest, token } = useAuthState();
  const scope = user?.id ?? (guest ? 'guest' : 'guest');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    trackEvent('screen_viewed', { screen: 'favorites', favoriteScope: user?.id ? 'user' : 'guest' }, { screenId: 'favorites' });
    setLoading(true);
    void loadSyncedFavoriteExerciseIds(scope, token).then((ids) => { if (active) setFavoriteIds(ids); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [scope, token]));

  const favoriteExercises = useMemo(() => {
    const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    return favoriteIds.map((id) => byId.get(id)).filter((exercise): exercise is Exercise => Boolean(exercise));
  }, [exercises, favoriteIds]);

  return <AppScreen>
    <ScreenHeader title="我的收藏" onBack={navigation.goBack} />
    {!loading && favoriteExercises.length > 0 ? <View style={styles.summary}><Text style={styles.summaryText}>{favoriteExercises.length} 个动作</Text><Text style={styles.summaryHint}>点击卡片查看详情</Text></View> : null}
    {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
    {!loading && favoriteExercises.length === 0 ? <Card style={styles.emptyCard}><View style={styles.emptyIcon}><SearchX size={32} color={colors.textSecondary} /></View><Text style={styles.emptyTitle}>还没有收藏动作</Text><Text style={styles.emptyBody}>在动作筛选或动作详情中收藏后，会集中显示在这里。</Text></Card> : null}
    {favoriteExercises.map((exercise) => <FavoriteRow key={exercise.id} exercise={exercise} onPress={() => navigation.navigate('FavoriteExerciseDetail', { exerciseId: exercise.id })} onRemove={async () => {
      setFavoriteIds((current) => current.filter((id) => id !== exercise.id));
      try {
        await toggleFavoriteExercise(scope, exercise.id, token);
        trackEvent('exercise_unfavorited', { exerciseId: exercise.id }, { screenId: 'favorites' });
      } catch {
        setFavoriteIds((current) => [exercise.id, ...current]);
      }
    }} />)}
  </AppScreen>;
}

function FavoriteRow({ exercise, onPress, onRemove }: { exercise: Exercise; onPress: () => void; onRemove: () => void }) {
  const thumbnail = exercise.mediaResources?.find((resource) => resource.resourceType === 'THUMBNAIL_IMAGE')?.resourceUrl ?? exercise.mediaUrl;
  const resource = exercise.mediaResources?.find((item) => item.resourceUrl === thumbnail);
  return <Card onPress={onPress} accessibilityLabel={`查看${exercise.name}`} style={styles.row}><View style={styles.art}><ExerciseMediaPreview url={thumbnail} kind={inferExerciseMediaKind(resource?.resourceType, thumbnail)} style={StyleSheet.absoluteFill} accessibilityLabel={`${exercise.name}缩略图`} /></View><View style={styles.copy}><Text style={styles.name} numberOfLines={1}>{exercise.name}</Text><Text style={styles.meta} numberOfLines={1}>{exercise.target} · {exercise.equipment}</Text><View style={styles.tags}><Tag>{exercise.level}</Tag><View style={styles.saved}><Bookmark size={13} color={colors.primary} fill={colors.primary} /><Text style={styles.savedText}>已收藏</Text></View></View></View><Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel={`取消收藏${exercise.name}`} onPress={(event) => { event.stopPropagation(); onRemove(); }} style={styles.removeButton}><BookmarkX size={19} color={colors.textSecondary} /></Pressable><ChevronRight size={18} color={colors.textTertiary} /></Card>;
}

export function FavoriteExerciseDetailScreen({ navigation, route }: DetailProps) {
  return <ExerciseDetailContent exerciseId={route.params.exerciseId} onBack={navigation.goBack} />;
}

const styles = StyleSheet.create({
  loading: { marginTop: spacing.x5 },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.x3 },
  summaryText: { ...typography.caption, color: colors.text, fontWeight: '700' },
  summaryHint: { ...typography.caption, color: colors.textTertiary },
  emptyCard: { alignItems: 'center', gap: spacing.x3, marginTop: spacing.x8, paddingVertical: spacing.x8 },
  emptyIcon: { width: 68, height: 68, borderRadius: radius.pill, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...typography.cardTitle, color: colors.text },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', maxWidth: 300 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginBottom: spacing.x2, padding: spacing.x3 },
  art: { width: 68, height: 68, borderRadius: radius.control, backgroundColor: colors.control, overflow: 'hidden' },
  copy: { flex: 1, minWidth: 0 },
  name: { ...typography.listTitle, color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2, marginTop: spacing.x2 },
  saved: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  savedText: { ...typography.eyebrow, color: colors.primary },
  removeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
});
