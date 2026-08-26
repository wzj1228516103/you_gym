import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { BellRing, TimerReset, Utensils } from 'lucide-react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen, Card, ScreenHeader, SettingRow } from '../../components/ui';
import { fetchReminderSettings, ReminderSettings, saveReminderSettings } from '../../services/api';
import { syncReminderNotifications } from '../../services/reminderNotifications';
import { useAuthState } from '../../state/AuthState';
import { colors, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ReminderSettings'>;
const LOCAL_SETTINGS_KEY = 'you-gym:reminder-settings:v1';
const defaultSettings: ReminderSettings = { trainingEnabled: false, nutritionEnabled: false, restSoundEnabled: false, trainingTime: '08:00', nutritionTime: '12:00', timezone: 'Asia/Shanghai', quietHoursStart: null, quietHoursEnd: null, updatedAt: null };
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function ReminderSettingsScreen({ navigation }: Props) {
  const { token, guest } = useAuthState();
  const [settings, setSettings] = useState<ReminderSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [timeError, setTimeError] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');
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
  const persist = (next: ReminderSettings) => {
    const sync = (value: ReminderSettings) => syncReminderNotifications(value).then((result) => {
      if (result.permissionDenied) setNotificationStatus('系统通知权限未开启，提醒暂时不会显示。');
      else if (result.skippedByQuietHours) setNotificationStatus(`已安排 ${result.scheduled} 条提醒，${result.skippedByQuietHours} 条因免打扰时段跳过。`);
      else if (result.supported) setNotificationStatus(result.scheduled ? `已安排 ${result.scheduled} 条每日提醒。` : '提醒已关闭。');
    }).catch(() => setNotificationStatus('本机通知暂时不可用，请检查系统权限。'));
    if (token) void saveReminderSettings(token, { trainingEnabled: next.trainingEnabled, nutritionEnabled: next.nutritionEnabled, restSoundEnabled: next.restSoundEnabled, trainingTime: next.trainingTime, nutritionTime: next.nutritionTime, timezone: next.timezone, quietHoursStart: next.quietHoursStart, quietHoursEnd: next.quietHoursEnd }).then((result) => sync(result.settings)).catch(() => { void saveLocalSettings(next); void sync(next); });
    else { void saveLocalSettings(next); void sync(next); }
  };
  const update = (key: 'trainingEnabled' | 'nutritionEnabled' | 'restSoundEnabled', value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    persist(next);
  };
  const updateTime = (key: 'trainingTime' | 'nutritionTime' | 'quietHoursStart' | 'quietHoursEnd', value: string, save = false) => {
    const normalized = value.trim();
    const next = { ...settings, [key]: normalized || null };
    setSettings(next);
    if (save && normalized && !TIME_PATTERN.test(normalized)) { setTimeError('时间请使用 HH:mm 格式'); return; }
    if (save) setTimeError('');
    if (save) persist(next);
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
      <Card style={styles.group}>
        <Text style={styles.groupTitle}>提醒时间</Text>
        <TimeField label="训练提醒" value={settings.trainingTime} onChange={(value) => updateTime('trainingTime', value)} />
        <TimeField label="饮食提醒" value={settings.nutritionTime} onChange={(value) => updateTime('nutritionTime', value)} />
        <Text style={styles.timezone}>时区：{settings.timezone}</Text>
      </Card>
      <Card style={styles.group}>
        <Text style={styles.groupTitle}>免打扰时段（可选）</Text>
        <View style={styles.timeRow}>
          <TimeField label="开始" value={settings.quietHoursStart} onChange={(value) => updateTime('quietHoursStart', value)} />
          <TimeField label="结束" value={settings.quietHoursEnd} onChange={(value) => updateTime('quietHoursEnd', value)} />
        </View>
        <Text style={styles.timezone}>训练和饮食提醒会跳过该时段。</Text>
      </Card>
      {timeError ? <Text style={styles.timeError}>{timeError}</Text> : null}
      <Text style={styles.note}>普通训练和饮食提醒只使用本地通知或 Push。阿里云短信仅用于验证码、账号安全和重要通知。</Text>
      {notificationStatus ? <Text style={styles.status}>{notificationStatus}</Text> : null}
    </AppScreen>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string | null; onChange: (value: string, save?: boolean) => void }) {
  return <View style={styles.timeField}><Text style={styles.timeLabel}>{label}</Text><TextInput value={value ?? ''} onChangeText={(next) => onChange(next)} onEndEditing={(event) => onChange(event.nativeEvent.text, true)} placeholder="HH:mm" placeholderTextColor={colors.textTertiary} keyboardType="numbers-and-punctuation" maxLength={5} style={styles.timeInput} /> </View>;
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
  groupTitle: { ...typography.listTitle, color: colors.text, marginBottom: spacing.x2 },
  timeRow: { flexDirection: 'row', gap: spacing.x3 },
  timeField: { flex: 1, gap: spacing.x1, marginBottom: spacing.x2 },
  timeLabel: { ...typography.caption, color: colors.textSecondary },
  timeInput: { minHeight: 44, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, backgroundColor: colors.control, color: colors.text, paddingHorizontal: spacing.x3, ...typography.body },
  timezone: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.x1 },
  timeError: { ...typography.caption, color: colors.error, paddingHorizontal: spacing.x2, marginTop: -spacing.x1 },
  status: { ...typography.caption, color: colors.primary, paddingHorizontal: spacing.x2, marginTop: spacing.x2 },
});
