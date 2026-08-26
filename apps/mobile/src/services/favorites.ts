import AsyncStorage from '@react-native-async-storage/async-storage';
import { addFavorite, fetchFavoriteIds, removeFavorite, syncFavoriteIds } from './api';

const FAVORITES_KEY_PREFIX = 'you-gym:favorite-exercises:v1:';
const PLAN_FAVORITES_KEY_PREFIX = 'you-gym:favorite-plans:v1:';

function key(scope: string, target: 'exercise' | 'plan' = 'exercise') {
  return `${target === 'plan' ? PLAN_FAVORITES_KEY_PREFIX : FAVORITES_KEY_PREFIX}${scope || 'guest'}`;
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

export async function loadSyncedFavoriteExerciseIds(scope: string, token?: string | null) {
  const local = await loadFavoriteExerciseIds(scope);
  if (!token || scope === 'guest') return local;
  try {
    const remote = (await fetchFavoriteIds(token, 'EXERCISE')).ids;
    await saveFavoriteExerciseIds(scope, remote);
    return remote;
  } catch {
    return local;
  }
}

export async function migrateGuestFavoriteExercises(token: string, userId: string) {
  const guestIds = await loadFavoriteExerciseIds('guest');
  const userIds = await loadFavoriteExerciseIds(userId);
  if (guestIds.length === 0) return userIds;
  const merged = Array.from(new Set([...userIds, ...guestIds])).slice(0, 500);
  const remote = (await syncFavoriteIds(token, 'EXERCISE', merged)).ids;
  await saveFavoriteExerciseIds(userId, remote);
  await AsyncStorage.removeItem(key('guest'));
  return remote;
}

export async function saveFavoriteExerciseIds(scope: string, ids: string[]) {
  try {
    await AsyncStorage.setItem(key(scope), JSON.stringify(Array.from(new Set(ids)).slice(0, 500)));
  } catch {
    // Favorites are a convenience feature; storage failures must not block navigation.
  }
}

export async function loadFavoritePlanIds(scope: string) {
  try {
    const raw = await AsyncStorage.getItem(key(scope, 'plan'));
    if (!raw) return [];
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))).slice(0, 500);
  } catch {
    return [];
  }
}

export async function saveFavoritePlanIds(scope: string, ids: string[]) {
  try { await AsyncStorage.setItem(key(scope, 'plan'), JSON.stringify(Array.from(new Set(ids)).slice(0, 500))); } catch { /* Local favorites must not block navigation. */ }
}

export async function loadSyncedFavoritePlanIds(scope: string, token?: string | null) {
  const local = await loadFavoritePlanIds(scope);
  if (!token || scope === 'guest') return local;
  try {
    const remote = (await fetchFavoriteIds(token, 'PLAN')).ids;
    await saveFavoritePlanIds(scope, remote);
    return remote;
  } catch { return local; }
}

export async function migrateGuestFavoritePlans(token: string, userId: string) {
  const guestIds = await loadFavoritePlanIds('guest');
  const userIds = await loadFavoritePlanIds(userId);
  if (guestIds.length === 0) return userIds;
  const merged = Array.from(new Set([...userIds, ...guestIds])).slice(0, 500);
  const remote = (await syncFavoriteIds(token, 'PLAN', merged)).ids;
  await saveFavoritePlanIds(userId, remote);
  await AsyncStorage.removeItem(key('guest', 'plan'));
  return remote;
}

export async function toggleFavoritePlan(scope: string, planId: string, token?: string | null) {
  const current = await loadFavoritePlanIds(scope);
  const next = current.includes(planId) ? current.filter((id) => id !== planId) : [planId, ...current];
  await saveFavoritePlanIds(scope, next);
  if (token) {
    try {
      if (next.includes(planId)) await addFavorite(token, 'PLAN', planId);
      else await removeFavorite(token, 'PLAN', planId);
    } catch (error) {
      await saveFavoritePlanIds(scope, current);
      throw error;
    }
  }
  return { saved: next.includes(planId), ids: next };
}

export async function toggleFavoriteExercise(scope: string, exerciseId: string, token?: string | null) {
  const current = await loadFavoriteExerciseIds(scope);
  const next = current.includes(exerciseId)
    ? current.filter((id) => id !== exerciseId)
    : [exerciseId, ...current];
  await saveFavoriteExerciseIds(scope, next);
  if (token) {
    try {
      if (next.includes(exerciseId)) await addFavorite(token, 'EXERCISE', exerciseId);
      else await removeFavorite(token, 'EXERCISE', exerciseId);
    } catch (error) {
      await saveFavoriteExerciseIds(scope, current);
      throw error;
    }
  }
  return { saved: next.includes(exerciseId), ids: next };
}
