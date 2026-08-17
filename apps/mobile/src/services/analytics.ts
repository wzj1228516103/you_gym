import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'you-gym:analytics-events:v1';
const MAX_PENDING_EVENTS = 100;

export type AnalyticsEventName = 'community_tab_clicked' | 'community_screen_viewed';

export type AnalyticsEvent = {
  eventId: string;
  eventName: AnalyticsEventName;
  userId: string | null;
  sessionId: string;
  occurredAt: string;
  properties: Record<string, string | number | boolean | null>;
};

let analyticsUserId: string | null = null;
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

export function trackEvent(eventName: AnalyticsEventName, properties: AnalyticsEvent['properties'] = {}) {
  const event: AnalyticsEvent = {
    eventId: createId('event'),
    eventName,
    userId: analyticsUserId,
    sessionId,
    occurredAt: new Date().toISOString(),
    properties,
  };

  void enqueue(async () => {
    const events = await readEvents();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...events, event].slice(-MAX_PENDING_EVENTS)));
  });
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
