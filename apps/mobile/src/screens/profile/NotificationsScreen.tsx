import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BellRing } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader title="通知中心" onBack={navigation.goBack} />
      <Card style={styles.empty}>
        <View style={styles.icon}><BellRing size={32} color={colors.textSecondary} /></View>
        <Text style={styles.title}>暂无通知</Text>
        <Text style={styles.body}>通知服务暂未启用。</Text>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.x8 },
  empty: { alignItems: 'center', gap: spacing.x3, paddingVertical: spacing.x10 },
  icon: { width: 72, height: 72, borderRadius: radius.pill, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.cardTitle, color: colors.text },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center', maxWidth: 320 },
});
