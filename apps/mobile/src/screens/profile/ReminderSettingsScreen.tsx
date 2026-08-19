import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BellRing, TimerReset, Utensils } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader, SettingRow } from '../../components/ui';
import { colors, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ReminderSettings'>;

export function ReminderSettingsScreen({ navigation }: Props) {
  const [training, setTraining] = useState(false);
  const [nutrition, setNutrition] = useState(false);
  const [restSound, setRestSound] = useState(false);
  return (
    <AppScreen>
      <ScreenHeader title="提醒设置" onBack={navigation.goBack} />
      <Text style={styles.pending}>提醒服务暂未启用，当前更改不会保存。</Text>
      <Card style={styles.group}>
        <SettingRow icon={BellRing} title="训练提醒" toggle enabled={training} onToggle={setTraining} />
      </Card>
      <Card style={styles.group}>
        <SettingRow icon={Utensils} title="饮食记录提醒" toggle enabled={nutrition} onToggle={setNutrition} />
      </Card>
      <Card style={styles.group}>
        <SettingRow icon={TimerReset} title="休息计时声音" toggle enabled={restSound} onToggle={setRestSound} />
      </Card>
      <Text style={styles.note}>普通训练和饮食提醒只使用本地通知或 Push。阿里云短信仅用于验证码、账号安全和重要通知。</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing.x3, paddingVertical: 0 },
  pending: { ...typography.caption, color: colors.warning, marginBottom: spacing.x4 },
  note: { ...typography.caption, color: colors.textSecondary, paddingHorizontal: spacing.x2, marginTop: spacing.x2 },
});
