import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell, BellRing, ChevronRight, Database, Download, Goal, ShieldCheck, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, Metric, ScreenHeader, SectionHeader, Tag } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';
import { useAuthState } from '../../state/AuthState';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export function ProfileHomeScreen({ navigation }: Props) {
  const { user, guest } = useAuthState();
  return (
    <AppScreen>
      <ScreenHeader title="个人" actions={<IconButton icon={BellRing} label="通知中心" size={42} onPress={() => navigation.navigate('Notifications')} />} />
      <View style={styles.profileHeader}>
        <View style={styles.avatar}><UserRound size={34} color={colors.primary} /></View>
        <View style={styles.profileCopy}><View style={styles.nameRow}><Text style={styles.name}>{guest ? '游客' : user?.nickname ?? '健身爱好者'}</Text><Tag tone="primary">{guest ? '访客' : '已登录'}</Tag></View><Text style={styles.streak}>{user?.goal ? `目标：${user.goal}` : '完善资料后获得个性化建议'}</Text></View>
        <ChevronRight size={18} color={colors.textTertiary} />
      </View>
      <Card style={styles.metricCard}><Metric label="体重" value={user?.weightKg ? `${user.weightKg} kg` : '-'} /><View style={styles.metricDivider} /><Metric label="体脂率" value={user?.bodyFatPct ? `${user.bodyFatPct}%` : '-'} /><View style={styles.metricDivider} /><Metric label="账号" value={guest ? '游客' : '正常'} /></Card>

      <SectionHeader title="数据与设置" />
      <View style={styles.menu}>
        <MenuRow icon={Database} label="身体数据" value="查看趋势" onPress={() => navigation.navigate('BodyData')} />
        <MenuRow icon={Goal} label="目标与经验" value={[user?.goal, user?.experienceLevel].filter(Boolean).join(' · ') || '未设置'} />
        <MenuRow icon={Bell} label="提醒设置" value="尚未同步" onPress={() => navigation.navigate('ReminderSettings')} />
        <MenuRow icon={Download} label="下载与缓存" value="查看本机" onPress={() => navigation.navigate('Storage')} />
        <MenuRow icon={ShieldCheck} label="账号与隐私" onPress={() => navigation.navigate('AccountSecurity')} />
        <MenuRow icon={Bell} label="帮助与反馈" value="查看常见问题" onPress={() => navigation.navigate('Help')} />
      </View>
    </AppScreen>
  );
}

function MenuRow({ icon: Icon, label, value, onPress }: { icon: typeof Database; label: string; value?: string; onPress?: () => void }) {
  return <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}><Icon size={19} color={colors.textSecondary} /><Text style={styles.menuLabel}>{label}</Text>{value ? <Text style={styles.menuValue}>{value}</Text> : null}<ChevronRight size={17} color={colors.textTertiary} /></Pressable>;
}

const styles = StyleSheet.create({
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3 },
  avatar: { width: 64, height: 64, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primaryBorder, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  profileCopy: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2, flexWrap: 'wrap' },
  name: { ...typography.cardTitle, color: colors.text },
  streak: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x1 },
  metricCard: { flexDirection: 'row', marginTop: spacing.x5, paddingHorizontal: spacing.x2 },
  metricDivider: { width: 1, height: 38, backgroundColor: colors.divider, alignSelf: 'center' },
  menu: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' },
  menuRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, paddingHorizontal: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuLabel: { flex: 1, ...typography.body, color: colors.text },
  menuValue: { ...typography.caption, color: colors.textSecondary },
  pressed: { opacity: 0.78 },
});
