import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReminderSettings } from './api';

const LOCAL_SETTINGS_KEY = 'you-gym:reminder-settings:v1';
const TRAINING_NOTIFICATION_ID = 'you-gym-reminder-training';
const NUTRITION_NOTIFICATION_ID = 'you-gym-reminder-nutrition';
const OWNED_NOTIFICATION_IDS = new Set([TRAINING_NOTIFICATION_ID, NUTRITION_NOTIFICATION_ID]);
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type ReminderNotificationSyncResult = {
  supported: boolean;
  scheduled: number;
  permissionDenied?: boolean;
  skippedByQuietHours?: number;
};

export async function syncReminderNotifications(settings: ReminderSettings): Promise<ReminderNotificationSyncResult> {
  if (Platform.OS === 'web') return { supported: false, scheduled: 0 };
  await cancelOwnedNotifications();
  const entries = [
    { enabled: settings.trainingEnabled, time: settings.trainingTime, id: TRAINING_NOTIFICATION_ID, title: '训练提醒', body: '准备好开始今天的训练了吗？', deepLink: 'yougym://plans' },
    { enabled: settings.nutritionEnabled, time: settings.nutritionTime, id: NUTRITION_NOTIFICATION_ID, title: '饮食记录提醒', body: '记录今天的饮食，保持你的营养计划连续性。', deepLink: 'yougym://nutrition' },
  ].filter((entry) => entry.enabled && entry.time && TIME_PATTERN.test(entry.time));
  if (!entries.length) return { supported: true, scheduled: 0 };

  const permission = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: true } });
  if (!permission.granted) return { supported: true, scheduled: 0, permissionDenied: true };
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', { name: '训练与饮食提醒', importance: Notifications.AndroidImportance.DEFAULT, sound: 'default' });
  }
  let scheduled = 0;
  let skippedByQuietHours = 0;
  for (const entry of entries) {
    if (isQuietTime(entry.time!, settings.quietHoursStart, settings.quietHoursEnd)) {
      skippedByQuietHours++;
      continue;
    }
    const [hour, minute] = entry.time!.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      identifier: entry.id,
      content: { title: entry.title, body: entry.body, sound: 'default', data: { deepLink: entry.deepLink, type: entry.id.includes('training') ? 'TRAINING' : 'NUTRITION' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour, minute, repeats: true, timezone: settings.timezone || 'Asia/Shanghai', ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}) },
    });
    scheduled++;
  }
  return { supported: true, scheduled, skippedByQuietHours };
}

export async function loadLocalReminderSettings(): Promise<ReminderSettings> {
  const defaults: ReminderSettings = { trainingEnabled: false, nutritionEnabled: false, restSoundEnabled: false, trainingTime: '08:00', nutritionTime: '12:00', timezone: 'Asia/Shanghai', quietHoursStart: null, quietHoursEnd: null, updatedAt: null };
  try {
    const raw = await AsyncStorage.getItem(LOCAL_SETTINGS_KEY);
    if (!raw) return defaults;
    const value = JSON.parse(raw) as Partial<ReminderSettings>;
    return { ...defaults, ...value, updatedAt: null };
  } catch {
    return defaults;
  }
}

async function cancelOwnedNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((item) => OWNED_NOTIFICATION_IDS.has(item.identifier)).map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

function isQuietTime(time: string, start: string | null, end: string | null) {
  if (!start || !end || !TIME_PATTERN.test(start) || !TIME_PATTERN.test(end)) return false;
  const value = toMinutes(time);
  const from = toMinutes(start);
  const until = toMinutes(end);
  if (from === until) return false;
  return from < until ? value >= from && value < until : value >= from || value < until;
}

function toMinutes(value: string) { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute; }
