export type Gender = 'male' | 'female';
export type BodySide = 'front' | 'back' | 'both';

export type AnatomyNode = {
  id: string;
  moduleId?: string;
  color?: string;
  region: string;
  group: string;
  muscle: string;
  part: string;
  nameEn: string;
  displayName?: string;
  side: BodySide;
  hotspot: { left: `${number}%`; top: `${number}%`; width: `${number}%`; height: `${number}%`; radius?: number };
  hotspots?: { left: `${number}%`; top: `${number}%`; width: `${number}%`; height: `${number}%`; radius?: number }[];
  functions: string[];
  exerciseIds: string[];
};

export type Exercise = {
  id: string;
  name: string;
  nameEn: string;
  target: string;
  targetCodes?: string[];
  equipment: string;
  location: string;
  level: '新手' | '初级' | '中级';
  rating: number;
  sets: number;
  reps: string;
  restSeconds: number;
  steps: string[];
  mistakes: string[];
  safety: string;
  sourceId?: string;
  mediaUrl?: string;
  mediaResources?: { id: string; resourceType: string; viewLabel: string; resourceUrl: string }[];
  sourceNote?: string;
};

export type RootStackParamList = {
  Auth: undefined;
  Otp: { phone: string; purpose: 'LOGIN' | 'REGISTER'; mockMode: boolean };
  Onboarding: undefined;
  Main: undefined;
};

export type AnatomyStackParamList = {
  AnatomyHome: undefined;
  ExerciseFilter: { nodeId: string };
  ExerciseDetail: { exerciseId: string; nodeId?: string };
};

export type PlanStackParamList = {
  PlanHome: undefined;
  PlanLibrary: undefined;
  PlanDetail: { planId: string };
  QuickWorkout: undefined;
  ExerciseDetail: { exerciseId: string };
  History: undefined;
  Workout: { planId?: string } | undefined;
  Rest: { seconds: number; setNumber?: number; weight?: number; reps?: number; exerciseName?: string };
  WorkoutSummary: { planId?: string; title?: string; durationSeconds?: number; totalSets?: number; plannedSets?: number; totalVolume?: number; calories?: number; muscles?: string[] } | undefined;
};

export type NutritionStackParamList = {
  NutritionHome: undefined;
  FoodSearch: undefined;
  FoodDetail: { foodId: string };
  NutritionGoal: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Favorites: undefined;
  FavoriteExerciseDetail: { exerciseId: string };
  BodyData: undefined;
  Notifications: undefined;
  ReminderSettings: undefined;
  Storage: undefined;
  Help: undefined;
  AccountSecurity: undefined;
};

export type AnatomyTreeNode = {
  id: string;
  parentId: string;
  code: string;
  nameZh: string;
  nameEn: string;
  level: number;
  view: string;
  side: string;
  assetPath: string;
  children: AnatomyTreeNode[];
};

export type CommunityStackParamList = {
  CommunityHome: undefined;
};

export type MainTabParamList = {
  AnatomyTab: undefined;
  PlansTab: undefined;
  NutritionTab: undefined;
  CommunityTab: undefined;
  ProfileTab: undefined;
};
