import { DarkTheme, LinkingOptions, NavigationContainer, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Accessibility, ClipboardList, MessagesSquare, Soup, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppState as NativeAppState, Platform } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthScreen } from './src/screens/auth/AuthScreen';
import { OtpScreen } from './src/screens/auth/OtpScreen';
import { OnboardingScreen } from './src/screens/auth/OnboardingScreen';
import { AnatomyHomeScreen } from './src/screens/anatomy/AnatomyHomeScreen';
import { ExerciseDetailScreen } from './src/screens/anatomy/ExerciseDetailScreen';
import { ExerciseFilterScreen } from './src/screens/anatomy/ExerciseFilterScreen';
import { PlanDetailScreen } from './src/screens/plans/PlanDetailScreen';
import { PlanHomeScreen } from './src/screens/plans/PlanHomeScreen';
import { PlanLibraryScreen } from './src/screens/plans/PlanLibraryScreen';
import { QuickWorkoutScreen } from './src/screens/plans/QuickWorkoutScreen';
import { QuickWorkoutExerciseDetailScreen } from './src/screens/plans/QuickWorkoutExerciseDetailScreen';
import { HistoryScreen } from './src/screens/plans/HistoryScreen';
import { RestScreen } from './src/screens/plans/RestScreen';
import { WorkoutScreen } from './src/screens/plans/WorkoutScreen';
import { WorkoutSummaryScreen } from './src/screens/plans/WorkoutSummaryScreen';
import { FoodDetailScreen } from './src/screens/nutrition/FoodDetailScreen';
import { FoodSearchScreen } from './src/screens/nutrition/FoodSearchScreen';
import { NutritionHomeScreen } from './src/screens/nutrition/NutritionHomeScreen';
import { NutritionGoalScreen } from './src/screens/nutrition/NutritionGoalScreen';
import { AccountSecurityScreen } from './src/screens/profile/AccountSecurityScreen';
import { BodyDataScreen } from './src/screens/profile/BodyDataScreen';
import { FavoritesScreen, FavoriteExerciseDetailScreen } from './src/screens/profile/FavoritesScreen';
import { HelpScreen } from './src/screens/profile/HelpScreen';
import { NotificationsScreen } from './src/screens/profile/NotificationsScreen';
import { ProfileHomeScreen } from './src/screens/profile/ProfileHomeScreen';
import { ReminderSettingsScreen } from './src/screens/profile/ReminderSettingsScreen';
import { StorageScreen } from './src/screens/profile/StorageScreen';
import { CommunityHomeScreen } from './src/screens/community/CommunityHomeScreen';
import { flushAnalyticsEventsToApi, startAnalyticsSession, trackEvent } from './src/services/analytics';
import { AppStateProvider } from './src/state/AppState';
import { AuthStateProvider } from './src/state/AuthState';
import { ReminderNotificationBootstrap } from './src/components/ReminderNotificationBootstrap';
import { NotificationNavigationBootstrap } from './src/components/NotificationNavigationBootstrap';
import { useAuthState } from './src/state/AuthState';
import { colors, radius, spacing, typography } from './src/theme';
import type { AnatomyStackParamList, CommunityStackParamList, MainTabParamList, NutritionStackParamList, PlanStackParamList, ProfileStackParamList, RootStackParamList } from './src/types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AnatomyStack = createNativeStackNavigator<AnatomyStackParamList>();
const PlanStack = createNativeStackNavigator<PlanStackParamList>();
const NutritionStack = createNativeStackNavigator<NutritionStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: colors.primary, background: colors.background, card: colors.card, text: colors.text, border: colors.border, notification: colors.muscle },
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['yougym://'],
  config: {
    screens: {
      Auth: 'auth',
      Otp: 'otp',
      Onboarding: 'onboarding',
      Main: {
        screens: {
          AnatomyTab: { screens: { AnatomyHome: 'anatomy' } },
          PlansTab: { screens: { PlanHome: 'plans' } },
          NutritionTab: { screens: { NutritionHome: 'nutrition' } },
          CommunityTab: { screens: { CommunityHome: 'community' } },
          ProfileTab: { screens: { ProfileHome: 'profile', Notifications: 'notifications' } },
        },
      },
    },
  },
};

function AnatomyNavigator() {
  return <AnatomyStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><AnatomyStack.Screen name="AnatomyHome" component={AnatomyHomeScreen} /><AnatomyStack.Screen name="ExerciseFilter" component={ExerciseFilterScreen} /><AnatomyStack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} /></AnatomyStack.Navigator>;
}

function PlanNavigator() {
  return <PlanStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><PlanStack.Screen name="PlanHome" component={PlanHomeScreen} /><PlanStack.Screen name="PlanLibrary" component={PlanLibraryScreen} /><PlanStack.Screen name="PlanDetail" component={PlanDetailScreen} /><PlanStack.Screen name="QuickWorkout" component={QuickWorkoutScreen} /><PlanStack.Screen name="ExerciseDetail" component={QuickWorkoutExerciseDetailScreen} /><PlanStack.Screen name="History" component={HistoryScreen} /><PlanStack.Screen name="Workout" component={WorkoutScreen} /><PlanStack.Screen name="Rest" component={RestScreen} /><PlanStack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} /></PlanStack.Navigator>;
}

function NutritionNavigator() {
  return <NutritionStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><NutritionStack.Screen name="NutritionHome" component={NutritionHomeScreen} /><NutritionStack.Screen name="FoodSearch" component={FoodSearchScreen} /><NutritionStack.Screen name="FoodDetail" component={FoodDetailScreen} /><NutritionStack.Screen name="NutritionGoal" component={NutritionGoalScreen} /></NutritionStack.Navigator>;
}

function ProfileNavigator() {
  return <ProfileStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><ProfileStack.Screen name="ProfileHome" component={ProfileHomeScreen} /><ProfileStack.Screen name="Favorites" component={FavoritesScreen} /><ProfileStack.Screen name="FavoriteExerciseDetail" component={FavoriteExerciseDetailScreen} /><ProfileStack.Screen name="BodyData" component={BodyDataScreen} /><ProfileStack.Screen name="Notifications" component={NotificationsScreen} /><ProfileStack.Screen name="ReminderSettings" component={ReminderSettingsScreen} /><ProfileStack.Screen name="Storage" component={StorageScreen} /><ProfileStack.Screen name="Help" component={HelpScreen} /><ProfileStack.Screen name="AccountSecurity" component={AccountSecurityScreen} /></ProfileStack.Navigator>;
}

function CommunityNavigator() {
  return <CommunityStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><CommunityStack.Screen name="CommunityHome" component={CommunityHomeScreen} /></CommunityStack.Navigator>;
}

function MainTabs() {
  return (
    <Tab.Navigator initialRouteName="AnatomyTab" screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="AnatomyTab" component={AnatomyNavigator} options={{ title: '人体' }} />
      <Tab.Screen name="PlansTab" component={PlanNavigator} options={{ title: '训练计划' }} />
      <Tab.Screen name="NutritionTab" component={NutritionNavigator} options={{ title: '饮食管理' }} />
      <Tab.Screen name="CommunityTab" component={CommunityNavigator} options={{ title: '社区' }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: '个人' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { loading, token, guest } = useAuthState();
  if (loading) return <View style={styles.loading}><Text style={styles.loadingText}>YOU GYM</Text></View>;
  return (
    <RootStack.Navigator key={token || guest ? 'main' : 'auth'} initialRouteName={token || guest ? 'Main' : 'Auth'} screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.background } }}>
      <RootStack.Screen name="Auth" component={AuthScreen} />
      <RootStack.Screen name="Otp" component={OtpScreen} />
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      <RootStack.Screen name="Main" component={MainTabs} />
    </RootStack.Navigator>
  );
}

function TabBar({ state, descriptors, navigation }: any) {
  const activeRoute = state.routes[state.index];
  if ((activeRoute.state?.index ?? 0) > 0) return null;
  const icons = [Accessibility, ClipboardList, Soup, MessagesSquare, UserRound];
  return (
    <View style={styles.tabBarOuter}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const Icon = icons[index];
          const label = descriptors[route.key].options.title ?? route.name;
          return (
            <Pressable key={route.key} accessibilityRole="button" accessibilityLabel={label} onPress={() => {
              if (route.name === 'CommunityTab') trackEvent('community_tab_clicked', { source: 'main_tab' }, { screenId: 'main_tab_bar' });
              navigation.navigate(route.name);
            }} style={styles.tabItemWrap}>
              <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
                <Icon size={21} color={focused ? colors.primary : colors.textTertiary} strokeWidth={focused ? 2.4 : 1.8} />
                <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  useEffect(() => {
    startAnalyticsSession();
    const flush = () => { void flushAnalyticsEventsToApi().catch(() => undefined); };
    flush();
    if (Platform.OS === 'web') return undefined;
    const subscription = NativeAppState.addEventListener('change', (state) => {
      if (state === 'active' || state === 'inactive' || state === 'background') flush();
    });
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthStateProvider>
      <ReminderNotificationBootstrap />
      <NotificationNavigationBootstrap />
      <AppStateProvider>
        <NavigationContainer linking={linking} theme={navigationTheme}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AppStateProvider>
      </AuthStateProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loadingText: { ...typography.pageTitle, color: colors.primary },
  tabBarOuter: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.x4, paddingBottom: spacing.x2, backgroundColor: 'transparent' },
  tabBar: { height: 72, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(26,26,29,0.97)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.x2 },
  tabItemWrap: { flex: 1, height: 58, position: 'relative' },
  tabItem: { flex: 1, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabItemFocused: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder },
  tabLabel: { ...typography.eyebrow, color: colors.textTertiary },
  tabLabelFocused: { color: colors.primary },
});
