import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell, BellRing, ChevronRight, Database, Download, Dumbbell, Flame, Goal, Medal, Scale, ShieldCheck, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, Metric, ProgressBar, ScreenHeader, SectionHeader, Tag } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export function ProfileHomeScreen({ navigation }: Props) {
  return (
    <AppScreen>
      <ScreenHeader title="个人" actions={<IconButton icon={BellRing} label="通知中心" size={42} onPress={() => navigation.navigate('Notifications')} />} />
      <View style={styles.profileHeader}>
        <View style={styles.avatar}><UserRound size={34} color={colors.primary} /></View>
        <View style={styles.profileCopy}><View style={styles.nameRow}><Text style={styles.name}>健身爱好者</Text><Tag tone="primary">Lv.28</Tag></View><Text style={styles.streak}>连续训练：23 天</Text></View>
        <ChevronRight size={18} color={colors.textTertiary} />
      </View>
      <Card style={styles.metricCard}><Metric label="体重" value="72.5 kg" /><View style={styles.metricDivider} /><Metric label="体脂率" value="16.3%" /><View style={styles.metricDivider} /><Metric label="累计训练" value="86 次" /></Card>

      <Card style={styles.planCard}>
        <View style={styles.planTop}><View><Text style={styles.cardEyebrow}>当前计划</Text><Text style={styles.planTitle}>推拉腿三分化</Text></View><Dumbbell size={30} color={colors.muscle} /></View>
        <Text style={styles.planMeta}>第 4 周 · 进行中</Text>
        <View style={styles.planProgress}><Text style={styles.progressText}>本周完成 4 / 6 次</Text><Text style={styles.progressText}>67%</Text></View>
        <ProgressBar value={4 / 6} />
      </Card>

      <SectionHeader title="本月成就" />
      <View style={styles.achievementRow}><Achievement icon={Flame} label="连续 7 天" tone="#FF7A45" /><Achievement icon={Medal} label="完成 100 组" tone={colors.warning} /><Achievement icon={Scale} label="容量 +100kg" tone={colors.muscle} /></View>

      <SectionHeader title="数据与设置" />
      <View style={styles.menu}>
        <MenuRow icon={Database} label="身体数据" value="查看趋势" onPress={() => navigation.navigate('BodyData')} />
        <MenuRow icon={Goal} label="目标与经验" value="增肌 · 新手" />
        <MenuRow icon={Bell} label="提醒设置" value="已开启" onPress={() => navigation.navigate('ReminderSettings')} />
        <MenuRow icon={Download} label="下载与缓存" value="3.2 GB" onPress={() => navigation.navigate('Storage')} />
        <MenuRow icon={ShieldCheck} label="账号与隐私" onPress={() => navigation.navigate('AccountSecurity')} />
        <MenuRow icon={Bell} label="帮助与反馈" value="查看常见问题" onPress={() => navigation.navigate('Help')} />
      </View>
    </AppScreen>
  );
}

function Achievement({ icon: Icon, label, tone }: { icon: typeof Flame; label: string; tone: string }) {
  return <View style={styles.achievement}><View style={[styles.achievementIcon, { borderColor: tone }]}><Icon size={22} color={tone} /></View><Text style={styles.achievementLabel}>{label}</Text></View>;
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
  planCard: { marginTop: spacing.x3, gap: spacing.x2 },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEyebrow: { ...typography.eyebrow, color: colors.primary },
  planTitle: { ...typography.cardTitle, color: colors.text, marginTop: 2 },
  planMeta: { ...typography.caption, color: colors.textSecondary },
  planProgress: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.x2 },
  progressText: { ...typography.caption, color: colors.textSecondary },
  achievementRow: { flexDirection: 'row', gap: spacing.x2 },
  achievement: { flex: 1, minHeight: 104, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', gap: spacing.x2 },
  achievementIcon: { width: 44, height: 44, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  achievementLabel: { ...typography.eyebrow, color: colors.text, textAlign: 'center' },
  menu: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' },
  menuRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, paddingHorizontal: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuLabel: { flex: 1, ...typography.body, color: colors.text },
  menuValue: { ...typography.caption, color: colors.textSecondary },
  pressed: { opacity: 0.78 },
});
