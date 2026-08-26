import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bookmark, ChevronRight, Dumbbell, SearchX } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader, Tag } from '../../components/ui';
import { ExerciseMediaPreview, inferExerciseMediaKind } from '../../components/ExerciseMediaPreview';
import { useAppState } from '../../state/AppState';
import { useAuthState } from '../../state/AuthState';
import { loadFavoriteExerciseIds } from '../../services/favorites';
import { colors, radius, spacing, typography } from '../../theme';
import type { Exercise, ProfileStackParamList } from '../../types';
import { ExerciseDetailContent } from '../anatomy/ExerciseDetailScreen';

type ListProps = NativeStackScreenProps<ProfileStackParamList, 'Favorites'>;
type DetailProps = NativeStackScreenProps<ProfileStackParamList, 'FavoriteExerciseDetail'>;

export function FavoritesScreen({ navigation }: ListProps) {
  const { exercises } = useAppState();
  const { user, guest } = useAuthState();
  const scope = user?.id ?? (guest ? 'guest' : 'guest');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    void loadFavoriteExerciseIds(scope).then((ids) => { if (active) setFavoriteIds(ids); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [scope]));

  const favoriteExercises = useMemo(() => {
    const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    return favoriteIds.map((id) => byId.get(id)).filter((exercise): exercise is Exercise => Boolean(exercise));
  }, [exercises, favoriteIds]);

  return <AppScreen>
    <ScreenHeader title="我的收藏" onBack={navigation.goBack} />
    {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
    {!loading && favoriteExercises.length === 0 ? <Card style={styles.emptyCard}><View style={styles.emptyIcon}><SearchX size={32} color={colors.textSecondary} /></View><Text style={styles.emptyTitle}>还没有收藏动作</Text><Text style={styles.emptyBody}>在动作筛选或动作详情中收藏后，会集中显示在这里。</Text></Card> : null}
    {favoriteExercises.map((exercise) => <FavoriteRow key={exercise.id} exercise={exercise} onPress={() => navigation.navigate('FavoriteExerciseDetail', { exerciseId: exercise.id })} />)}
  </AppScreen>;
}

function FavoriteRow({ exercise, onPress }: { exercise: Exercise; onPress: () => void }) {
  const thumbnail = exercise.mediaResources?.find((resource) => resource.resourceType === 'THUMBNAIL_IMAGE')?.resourceUrl ?? exercise.mediaUrl;
  const resource = exercise.mediaResources?.find((item) => item.resourceUrl === thumbnail);
  return <Card onPress={onPress} accessibilityLabel={`查看${exercise.name}`} style={styles.row}><View style={styles.art}><ExerciseMediaPreview url={thumbnail} kind={inferExerciseMediaKind(resource?.resourceType, thumbnail)} style={StyleSheet.absoluteFill} accessibilityLabel={`${exercise.name}缩略图`} /></View><View style={styles.copy}><Text style={styles.name} numberOfLines={1}>{exercise.name}</Text><Text style={styles.meta} numberOfLines={1}>{exercise.target} · {exercise.equipment}</Text><View style={styles.tags}><Tag>{exercise.level}</Tag><View style={styles.saved}><Bookmark size={13} color={colors.primary} fill={colors.primary} /><Text style={styles.savedText}>已收藏</Text></View></View></View><ChevronRight size={18} color={colors.textTertiary} /></Card>;
}

export function FavoriteExerciseDetailScreen({ navigation, route }: DetailProps) {
  return <ExerciseDetailContent exerciseId={route.params.exerciseId} onBack={navigation.goBack} />;
}

const styles = StyleSheet.create({
  loading: { marginTop: spacing.x5 },
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
});
