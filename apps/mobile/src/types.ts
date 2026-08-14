export type Gender = 'male' | 'female';
export type BodySide = 'front' | 'back';

export type AnatomyNode = {
  id: string;
  region: string;
  group: string;
  muscle: string;
  part: string;
  nameEn: string;
  side: BodySide;
  hotspot: { left: `${number}%`; top: `${number}%`; width: `${number}%`; height: `${number}%` };
  functions: string[];
  exerciseIds: string[];
};

export type Exercise = {
  id: string;
  name: string;
  nameEn: string;
  target: string;
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
};

export type RootStackParamList = {
  Auth: undefined;
  Otp: { phone: string };
  Onboarding: undefined;
  Main: undefined;
};

export type AnatomyStackParamList = {
  AnatomyHome: undefined;
  ExerciseFilter: { nodeId: string };
  ExerciseDetail: { exerciseId: string };
};

export type PlanStackParamList = {
  PlanHome: undefined;
  PlanLibrary: undefined;
  PlanDetail: { planId: string };
  QuickWorkout: undefined;
  History: undefined;
  Workout: undefined;
  Rest: { seconds: number };
  WorkoutSummary: undefined;
};

export type NutritionStackParamList = {
  NutritionHome: undefined;
  FoodSearch: undefined;
  FoodDetail: { foodId: string };
  MealRecord: { mealName: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  BodyData: undefined;
  Notifications: undefined;
  ReminderSettings: undefined;
  Storage: undefined;
  Help: undefined;
  AccountSecurity: undefined;
};

export type MainTabParamList = {
  AnatomyTab: undefined;
  PlansTab: undefined;
  NutritionTab: undefined;
  ProfileTab: undefined;
};
