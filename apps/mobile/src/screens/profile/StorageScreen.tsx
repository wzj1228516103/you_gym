import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HardDriveDownload } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Storage'>;

export function StorageScreen({ navigation }: Props) {
  return (
    <AppScreen>
      <ScreenHeader title="存储空间" onBack={navigation.goBack} />
      <Card style={styles.empty}>
        <View style={styles.icon}><HardDriveDownload size={32} color={colors.textSecondary} /></View>
        <Text style={styles.title}>暂无离线资源</Text>
        <Text style={styles.body}>离线下载暂未启用。</Text>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: spacing.x3, paddingVertical: spacing.x10 },
  icon: { width: 72, height: 72, borderRadius: radius.pill, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.cardTitle, color: colors.text },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center', maxWidth: 320 },
});
