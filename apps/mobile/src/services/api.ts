import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { AnatomyTreeNode } from '../types';

const SESSION_KEY = 'you-gym:app-session:v1';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL
  ?? (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');

export type AppUser = {
  id: string; phone: string; nickname: string; gender: string | null; birthYear: number | null;
  heightCm: number | null; weightKg: number | null; bodyFatPct: number | null; goal: string | null;
  experienceLevel: string | null; weeklyFrequency: string | null; venue: string | null;
  equipment: string[]; status: string; createdAt: string; updatedAt: string; lastLoginAt: string | null;
};

export type WorkoutRecord = {
  id: string; title: string; durationSeconds: number; totalSets: number; totalVolume: number;
  calories: number; completedAt: string;
};

export type NutritionRecord = {
  id: string; mealName: string; calories: number; proteinG: number; carbohydratesG: number;
  fatG: number; foodCount: number; recordedAt: string;
};

export type ExerciseContent = {
  id: string; title: string; contentType: 'ARTICLE' | 'VIDEO' | 'GIF' | 'MODEL_3D' | 'EXERCISE';
  summary: string; body: string; mediaUrl: string; mediaAssets: { url: string; objectName: string; fileName: string; fileSize: number; fileType: string; fileETag: string }[];
  anatomyNodeId: string; publishedAt: string;
};

export type ExerciseCatalogItem = {
  id: string; nameZh: string; nameEn: string; targetMuscles: string[];
  equipment: string; location: string; difficultyLevel: string | null;
  recommendedReps: string | null; recommendedSets: number | null;
  restSecondsMin: number | null; restSecondsMax: number | null;
  angleViews: string[]; stepLabels: string[]; sourceImage: string | null;
  sourcePanel: string | null; sourceNote: string | null;
  resources: { id: string; resourceType: string; viewLabel: string; resourceUrl: string; sortOrder: number; sourceImage: string }[];
  datasetDetail?: {
    instructions?: Record<string, string>;
    instructionSteps?: Record<string, string[]>;
    mediaAttribution?: string;
  };
};

export type PlanSummary = {
  id: string; title: string; description: string; durationLabel: string; level: string;
  target: string; category: string; exerciseCount: number;
};
export type PlanDetail = PlanSummary & {
  exercises: { id: string; nameZh: string; nameEn: string; equipment: string; location: string; sets: number; reps: string; restSeconds: number; sortOrder: number }[];
};
export type FoodItem = { id: string; name: string; serving: string; calories: number; protein: number; carbs: number; fat: number; source: string; mediaUrl?: string | null; mediaAssets?: { url: string; objectName?: string; fileName?: string; fileType?: string }[] };

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.status === 204 ? undefined as T : response.json() as Promise<T>;
  let message = `请求失败 (${response.status})`;
  try { const body = await response.json() as { detail?: string; message?: string }; message = body.detail ?? body.message ?? message; } catch {}
  throw new Error(message);
}

async function request<T>(path: string, init: RequestInit = {}, token?: string | null) {
  return parseResponse<T>(await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  }));
}

export async function loadStoredSession() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as { accessToken: string; user: AppUser }; } catch { return null; }
}
export async function saveSession(session: { accessToken: string; user: AppUser }) { await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
export async function clearSession() { await AsyncStorage.removeItem(SESSION_KEY); }
export function sendSmsCode(phone: string, purpose: 'LOGIN' | 'REGISTER') { return request<{ accepted: boolean; mockMode: boolean; expiresInSeconds: number }>('/api/v1/auth/sms/code', { method: 'POST', body: JSON.stringify({ phone, purpose }) }); }
export function verifySmsCode(phone: string, purpose: 'LOGIN' | 'REGISTER', code: string) { return request<{ accessToken: string; user: AppUser; needsOnboarding: boolean }>('/api/v1/auth/sms/verify', { method: 'POST', body: JSON.stringify({ phone, purpose, code }) }); }
export function logoutApp(token: string) { return request<{ loggedOut: boolean }>('/api/v1/auth/logout', { method: 'POST' }, token); }
export function fetchMe(token: string) { return request<AppUser>('/api/v1/me', {}, token); }
export function updateMe(token: string, input: Partial<AppUser>) { return request<AppUser>('/api/v1/me', { method: 'PATCH', body: JSON.stringify(input) }, token); }
export function saveWorkout(token: string, input: Record<string, unknown>) { return request<{ saved: boolean }>('/api/v1/me/workouts', { method: 'POST', body: JSON.stringify(input) }, token); }
export function saveNutrition(token: string, input: Record<string, unknown>) { return request<{ saved: boolean }>('/api/v1/me/nutrition', { method: 'POST', body: JSON.stringify(input) }, token); }
export function fetchWorkouts(token: string) { return request<{ items: WorkoutRecord[] }>('/api/v1/me/workouts', {}, token); }
export function fetchNutrition(token: string) { return request<{ items: NutritionRecord[] }>('/api/v1/me/nutrition', {}, token); }
export function fetchAnatomyTree(gender: 'male' | 'female' | 'all' = 'all') { return request<{ version: number; gender: string; view: string; items: AnatomyTreeNode[] }>(`/api/v1/anatomy/tree?gender=${gender}&view=all`); }
export function fetchPublishedExerciseContent(search?: string, anatomyNodeId?: string) { const query = new URLSearchParams({ contentType: 'EXERCISE', limit: '20' }); if (search) query.set('search', search); if (anatomyNodeId) query.set('anatomyNodeId', anatomyNodeId); return request<{ items: ExerciseContent[] }>(`/api/v1/content?${query.toString()}`); }
export function fetchExerciseCatalog(search?: string, equipment?: string) { const query = new URLSearchParams({ limit: '2000' }); if (search) query.set('search', search); if (equipment) query.set('equipment', equipment); return request<{ items: ExerciseCatalogItem[]; source: string }>(`/api/v1/exercises?${query.toString()}`); }
export function fetchExercise(id: string) { return request<ExerciseCatalogItem>(`/api/v1/exercises/${encodeURIComponent(id)}`); }
export function fetchPlans(category?: string, search?: string) { const query = new URLSearchParams({ limit: '100' }); if (category && category !== '全部') query.set('category', category); if (search) query.set('search', search); return request<{ items: PlanSummary[] }>(`/api/v1/plans?${query.toString()}`); }
export function fetchPlan(id: string) { return request<PlanDetail>(`/api/v1/plans/${encodeURIComponent(id)}`); }
export function fetchFoods(search?: string, signal?: AbortSignal) { const query = new URLSearchParams({ limit: '100' }); if (search) query.set('search', search); return request<{ items: FoodItem[] }>(`/api/v1/foods?${query.toString()}`, { signal }); }
export function fetchFood(id: string) { return request<FoodItem>(`/api/v1/foods/${encodeURIComponent(id)}`); }
