import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY_PREFIX = 'you-gym:favorite-exercises:v1:';

function key(scope: string) {
  return `${FAVORITES_KEY_PREFIX}${scope || 'guest'}`;
}

export async function loadFavoriteExerciseIds(scope: string) {
  try {
    const raw = await AsyncStorage.getItem(key(scope));
    if (!raw) return [];
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))).slice(0, 500);
  } catch {
    return [];
  }
}

export async function saveFavoriteExerciseIds(scope: string, ids: string[]) {
  try {
    await AsyncStorage.setItem(key(scope), JSON.stringify(Array.from(new Set(ids)).slice(0, 500)));
  } catch {
    // Favorites are a convenience feature; storage failures must not block navigation.
  }
}

export async function toggleFavoriteExercise(scope: string, exerciseId: string) {
  const current = await loadFavoriteExerciseIds(scope);
  const next = current.includes(exerciseId)
    ? current.filter((id) => id !== exerciseId)
    : [exerciseId, ...current];
  await saveFavoriteExerciseIds(scope, next);
  return { saved: next.includes(exerciseId), ids: next };
}
