import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BellRing, Moon, TimerReset, Utensils } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader, SettingRow } from '../../components/ui';
import { colors, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ReminderSettings'>;

export function ReminderSettingsScreen({ navigation }: Props) {
  const [training, setTraining] = useState(true);
  const [nutrition, setNutrition] = useState(true);
  const [restSound, setRestSound] = useState(true);
  return (
    <AppScreen>
      <ScreenHeader title="提醒设置" onBack={navigation.goBack} />
      <Card style={styles.group}>
        <SettingRow icon={BellRing} title="训练提醒" toggle enabled={training} onToggle={setTraining} />
        <SettingRow title="时间" value="18:30" onPress={() => undefined} />
        <SettingRow title="重复" value="每周一、二、四、五、日" onPress={() => undefined} />
      </Card>
      <Card style={styles.group}>
        <SettingRow icon={Utensils} title="饮食记录提醒" toggle enabled={nutrition} onToggle={setNutrition} />
        <SettingRow title="时间" value="12:30、18:30、21:00" onPress={() => undefined} />
        <SettingRow title="重复" value="每天" onPress={() => undefined} />
      </Card>
      <Card style={styles.group}>
        <SettingRow icon={TimerReset} title="休息计时声音" toggle enabled={restSound} onToggle={setRestSound} />
        <SettingRow title="倒计时" value="10 秒" onPress={() => undefined} />
        <SettingRow title="提示音" value="脉冲音效 2" onPress={() => undefined} />
      </Card>
      <Card style={styles.group}>
        <SettingRow icon={Moon} title="免打扰时段" value="22:30 – 07:00" onPress={() => undefined} />
      </Card>
      <Text style={styles.note}>普通训练和饮食提醒只使用本地通知或 Push。阿里云短信仅用于验证码、账号安全和重要通知。</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing.x3, paddingVertical: 0 },
  note: { ...typography.caption, color: colors.textSecondary, paddingHorizontal: spacing.x2, marginTop: spacing.x2 },
});
