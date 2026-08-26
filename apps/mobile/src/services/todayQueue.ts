import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'you-gym:today-exercises:v1:';
const MAX_QUEUE_SIZE = 50;

function storageKey(scope: string) {
  return `${KEY_PREFIX}${scope || 'guest'}`;
}

export async function loadTodayExerciseIds(scope: string) {
  try {
    const raw = await AsyncStorage.getItem(storageKey(scope));
    if (!raw) return [];
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))).slice(0, MAX_QUEUE_SIZE);
  } catch {
    return [];
  }
}

export async function saveTodayExerciseIds(scope: string, ids: string[]) {
  try {
    await AsyncStorage.setItem(storageKey(scope), JSON.stringify(Array.from(new Set(ids)).slice(0, MAX_QUEUE_SIZE)));
  } catch {
    // Queue persistence is best effort and must not interrupt a workout.
  }
}
