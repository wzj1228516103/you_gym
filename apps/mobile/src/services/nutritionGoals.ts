import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NutritionGoal } from './api';

const STORAGE_KEY = 'you-gym:nutrition-goal:v1';

export async function loadLocalNutritionGoal(): Promise<NutritionGoal | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<NutritionGoal>;
    if (![value.calories, value.proteinG, value.carbohydratesG, value.fatG].every((item) => typeof item === 'number' && Number.isFinite(item) && item > 0)) return null;
    return { calories: value.calories!, proteinG: value.proteinG!, carbohydratesG: value.carbohydratesG!, fatG: value.fatG!, updatedAt: null };
  } catch {
    return null;
  }
}

export async function saveLocalNutritionGoal(goal: Omit<NutritionGoal, 'updatedAt'>) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...goal, updatedAt: null }));
}

export async function clearLocalNutritionGoal() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
