import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { normalizeAppDeepLink, openAppDeepLink } from '../services/notificationLinks';

function readDeepLink(response: Notifications.NotificationResponse) {
  return normalizeAppDeepLink(response.notification.request.content.data?.deepLink);
}

function openResponse(response: Notifications.NotificationResponse) {
  const deepLink = readDeepLink(response);
  if (deepLink) void openAppDeepLink(deepLink);
}

export function NotificationNavigationBootstrap() {
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const subscription = Notifications.addNotificationResponseReceivedListener(openResponse);
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        setTimeout(() => {
          openResponse(response);
          void Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
        }, 0);
      }
    }).catch(() => undefined);
    return () => subscription.remove();
  }, []);

  return null;
}
