import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { BellRing, TimerReset, Utensils } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader, SettingRow } from '../../components/ui';
import { fetchReminderSettings, ReminderSettings, saveReminderSettings } from '../../services/api';
import { useAuthState } from '../../state/AuthState';
import { colors, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ReminderSettings'>;
const LOCAL_SETTINGS_KEY = 'you-gym:reminder-settings:v1';
const defaultSettings: ReminderSettings = { trainingEnabled: false, nutritionEnabled: false, restSoundEnabled: false, updatedAt: null };

export function ReminderSettingsScreen({ navigation }: Props) {
  const { token, guest } = useAuthState();
  const [settings, setSettings] = useState<ReminderSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    const load = async () => {
      if (token) {
        try { const result = await fetchReminderSettings(token); if (active) setSettings(result.settings); }
        catch { if (active) setSettings(await loadLocalSettings()); }
      } else if (active) setSettings(await loadLocalSettings());
      if (active) setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, [token]));
  const update = (key: 'trainingEnabled' | 'nutritionEnabled' | 'restSoundEnabled', value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    if (token) void saveReminderSettings(token, { trainingEnabled: next.trainingEnabled, nutritionEnabled: next.nutritionEnabled, restSoundEnabled: next.restSoundEnabled }).catch(() => { void saveLocalSettings(next); });
    else void saveLocalSettings(next);
  };
  return (
    <AppScreen>
      <ScreenHeader title="提醒设置" onBack={navigation.goBack} />
      <Text style={styles.pending}>{loading ? '设置加载中…' : guest ? '游客设置仅保存在本机。' : '设置已同步到账号。'}</Text>
      <Card style={styles.group}>
        <SettingRow icon={BellRing} title="训练提醒" toggle enabled={settings.trainingEnabled} onToggle={(value) => update('trainingEnabled', value)} />
      </Card>
      <Card style={styles.group}>
        <SettingRow icon={Utensils} title="饮食记录提醒" toggle enabled={settings.nutritionEnabled} onToggle={(value) => update('nutritionEnabled', value)} />
      </Card>
      <Card style={styles.group}>
        <SettingRow icon={TimerReset} title="休息计时声音" toggle enabled={settings.restSoundEnabled} onToggle={(value) => update('restSoundEnabled', value)} />
      </Card>
      <Text style={styles.note}>普通训练和饮食提醒只使用本地通知或 Push。阿里云短信仅用于验证码、账号安全和重要通知。</Text>
    </AppScreen>
  );
}

async function loadLocalSettings(): Promise<ReminderSettings> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const value = JSON.parse(raw) as Partial<ReminderSettings>;
    return { ...defaultSettings, ...value, updatedAt: null };
  } catch { return defaultSettings; }
}

async function saveLocalSettings(settings: ReminderSettings) {
  try { await AsyncStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings)); } catch { /* Local settings are best effort. */ }
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing.x3, paddingVertical: 0 },
  pending: { ...typography.caption, color: colors.warning, marginBottom: spacing.x4 },
  note: { ...typography.caption, color: colors.textSecondary, paddingHorizontal: spacing.x2, marginTop: spacing.x2 },
});
