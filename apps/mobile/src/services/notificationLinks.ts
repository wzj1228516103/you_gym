import { Linking } from 'react-native';

const APP_DEEP_LINK_PATTERN = /^yougym:\/\/[a-z0-9][a-z0-9-]*(?:[/?#].*)?$/i;

export function normalizeAppDeepLink(value: unknown) {
  if (typeof value !== 'string') return null;
  const deepLink = value.trim();
  return APP_DEEP_LINK_PATTERN.test(deepLink) ? deepLink : null;
}

export async function openAppDeepLink(value: unknown) {
  const deepLink = normalizeAppDeepLink(value);
  if (!deepLink) return false;
  try {
    await Linking.openURL(deepLink);
    return true;
  } catch {
    return false;
  }
}
