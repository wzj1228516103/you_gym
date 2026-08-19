import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_BASE_URL } from './api';

const STORAGE_KEY = 'you-gym:analytics-events:v1';
const ANALYTICS_ID_STORAGE_KEY = 'you-gym:analytics-anonymous-id:v1';
const MAX_PENDING_EVENTS = 100;
const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION ?? '0.1.0';

export type AnalyticsEventName =
  | 'community_tab_clicked'
  | 'community_screen_viewed'
  | 'screen_viewed'
  | 'body_region_selected'
  | 'muscle_group_selected'
  | 'muscle_selected'
  | 'exercise_filter_opened'
  | 'exercise_detail_viewed'
  | 'workout_started'
  | 'workout_completed'
  | 'nutrition_screen_viewed'
  | 'nutrition_food_search_opened'
  | 'nutrition_item_selected'
  | 'nutrition_meal_recorded'
  | 'training_checkin_completed'
  | 'analytics_upload_failed';

export type AnalyticsEvent = {
  eventId: string;
  eventName: AnalyticsEventName;
  eventVersion: number;
  userId: string | null;
  analyticsUserId: string | null;
  sessionId: string;
  occurredAt: string;
  platform: string;
  appVersion: string;
  screenId?: string;
  properties: Record<string, string | number | boolean | null>;
};

export type TrackEventOptions = {
  screenId?: string;
};

let analyticsUserId: string | null = null;
let anonymousAnalyticsId = createId('anonymous');
let anonymousIdentityReady: Promise<void> | null = null;
let sessionId = createId('session');
let persistenceQueue: Promise<unknown> = Promise.resolve();

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const next = persistenceQueue.then(task, task);
  persistenceQueue = next.catch(() => undefined);
  return next;
}

function ensureAnonymousAnalyticsId() {
  if (anonymousIdentityReady) return anonymousIdentityReady;
  anonymousIdentityReady = AsyncStorage.getItem(ANALYTICS_ID_STORAGE_KEY)
    .then(async (stored) => {
      if (stored && /^anonymous_[a-z0-9_]+$/i.test(stored)) {
        anonymousAnalyticsId = stored;
        return;
      }
      await AsyncStorage.setItem(ANALYTICS_ID_STORAGE_KEY, anonymousAnalyticsId);
    })
    .catch(() => undefined);
  return anonymousIdentityReady;
}

async function readEvents() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [] as AnalyticsEvent[];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed as AnalyticsEvent[] : [];
  } catch {
    return [] as AnalyticsEvent[];
  }
}

export function setAnalyticsUser(userId: string | null) {
  analyticsUserId = userId;
}

export function trackEvent(eventName: AnalyticsEventName, properties: AnalyticsEvent['properties'] = {}, options: TrackEventOptions = {}) {
  void enqueue(async () => {
    await ensureAnonymousAnalyticsId();
    const event: AnalyticsEvent = {
      eventId: createId('event'),
      eventName,
      eventVersion: 1,
      userId: analyticsUserId,
      analyticsUserId: analyticsUserId ?? anonymousAnalyticsId,
      sessionId,
      occurredAt: new Date().toISOString(),
      platform: Platform.OS,
      appVersion: APP_VERSION,
      screenId: options.screenId,
      properties,
    };
    const events = await readEvents();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...events, event].slice(-MAX_PENDING_EVENTS)));
  });
  void flushAnalyticsEventsToApi().catch(() => undefined);
}

export function startAnalyticsSession() {
  sessionId = createId('session');
}

export function getPendingAnalyticsEvents() {
  return enqueue(readEvents);
}

export function flushAnalyticsEvents(sender: (events: AnalyticsEvent[]) => Promise<void>) {
  return enqueue(async () => {
    const events = await readEvents();
    if (events.length === 0) return 0;
    await sender(events);
    await AsyncStorage.removeItem(STORAGE_KEY);
    return events.length;
  });
}

export function flushAnalyticsEventsToApi() {
  return flushAnalyticsEvents(async (events) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/analytics/events:batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
    if (!response.ok) throw new Error(`analytics upload failed: ${response.status}`);
  });
}
