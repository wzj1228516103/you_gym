import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BellRing, CheckCheck, ChevronRight, CircleAlert, Dumbbell, Utensils } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader, SegmentedControl, Tag } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Notifications'>;

const items = [
  { icon: Dumbbell, title: '计划更新', text: '你的推拉腿三分化已更新至 v2.1', time: '10:30', tone: 'primary' as const, unread: true },
  { icon: BellRing, title: '训练提醒', text: '今天安排：上肢推 · 18:30 开始', time: '09:00', tone: 'muscle' as const, unread: true },
  { icon: Utensils, title: '饮食提醒', text: '午餐记录已超过 12 小时', time: '昨天', tone: 'neutral' as const, unread: false },
  { icon: CircleAlert, title: '资源下载完成', text: '动作视频包 · 力量训练已下载完成', time: '08/12', tone: 'neutral' as const, unread: false },
];

export function NotificationsScreen({ navigation }: Props) {
  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader title="通知中心" onBack={navigation.goBack} actions={<Pressable accessibilityRole="button" accessibilityLabel="全部标记已读"><CheckCheck size={21} color={colors.primary} /></Pressable>} />
      <SegmentedControl options={[{ label: '全部', value: 'all' }, { label: '未读 2', value: 'unread' }, { label: '系统', value: 'system' }]} value="all" onChange={() => undefined} />
      <View style={styles.list}>
        {items.map(({ icon: Icon, title, text, time, tone, unread }) => <Card key={title} style={styles.item}><View style={[styles.itemIcon, tone === 'primary' && styles.primaryIcon, tone === 'muscle' && styles.muscleIcon]}><Icon size={19} color={tone === 'muscle' ? colors.muscle : colors.primary} /></View><View style={styles.itemCopy}><View style={styles.titleRow}><Text style={styles.itemTitle}>{title}</Text>{unread ? <Tag tone={tone === 'muscle' ? 'muscle' : 'primary'}>未读</Tag> : null}</View><Text style={styles.itemText}>{text}</Text></View><Text style={styles.itemTime}>{time}</Text></Card>)}
      </View>
      <View style={styles.footer}><BellRing size={18} color={colors.textTertiary} /><Text style={styles.footerText}>重要通知会保留在这里；普通训练提醒可在提醒设置中调整。</Text><ChevronRight size={16} color={colors.textTertiary} /></View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.x8 },
  list: { gap: spacing.x2, marginTop: spacing.x5 },
  item: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, padding: spacing.x3 },
  itemIcon: { width: 42, height: 42, borderRadius: radius.control, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  primaryIcon: { backgroundColor: colors.primarySoft },
  muscleIcon: { backgroundColor: 'rgba(255,45,85,0.12)' },
  itemCopy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2 },
  itemTitle: { ...typography.listTitle, color: colors.text },
  itemText: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  itemTime: { ...typography.eyebrow, color: colors.textTertiary, alignSelf: 'flex-start' },
  footer: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.x2, marginTop: spacing.x5 },
  footerText: { flex: 1, ...typography.caption, color: colors.textSecondary },
});
