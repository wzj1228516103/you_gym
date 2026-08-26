import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, BellRing, CheckCheck, Dumbbell, ShieldCheck, Utensils } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, SegmentedControl, ScreenHeader, Tag } from '../../components/ui';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, type UserNotification } from '../../services/api';
import { useAuthState } from '../../state/AuthState';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Notifications'>;
type NotificationFilter = 'ALL' | 'UNREAD';
const typeLabels: Record<string, string> = { SYSTEM: '系统通知', PLAN: '计划更新', RESOURCE: '资源更新', SECURITY: '账号安全', TRAINING: '训练提醒', NUTRITION: '饮食提醒' };

export function NotificationsScreen({ navigation }: Props) {
  const { token, guest } = useAuthState();
  const [filter, setFilter] = useState<NotificationFilter>('ALL');
  const [items, setItems] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!token) { setItems([]); setUnreadCount(0); setLoading(false); return; }
    setLoading(true); setError('');
    try { const result = await fetchNotifications(token, filter === 'UNREAD'); setItems(result.items); setUnreadCount(result.unreadCount); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '通知加载失败'); }
    finally { setLoading(false); }
  }, [filter, token]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const markRead = async (item: UserNotification) => {
    if (!token || item.readAt) return;
    try { const result = await markNotificationRead(token, item.id); setItems((current) => current.map((entry) => entry.id === item.id ? result.notification : entry)); setUnreadCount(result.unreadCount); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '通知状态更新失败'); }
  };
  const markAllRead = async () => {
    if (!token || unreadCount === 0) return;
    try { const result = await markAllNotificationsRead(token); setItems((current) => current.map((item) => item.readAt ? item : { ...item, readAt: new Date().toISOString() })); setUnreadCount(result.unreadCount); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '通知状态更新失败'); }
  };
  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader title="通知中心" onBack={navigation.goBack} actions={<IconButton icon={CheckCheck} label="全部标记为已读" onPress={() => void markAllRead()} active={unreadCount > 0} size={42} />} />
      <View style={styles.summaryRow}><Text style={styles.summary}>{guest ? '游客模式' : unreadCount > 0 ? `${unreadCount} 条未读通知` : '全部已读'}</Text><SegmentedControl options={[{ label: '全部', value: 'ALL' }, { label: '未读', value: 'UNREAD' }]} value={filter} onChange={setFilter} /></View>
      {loading ? <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={styles.stateText}>通知加载中</Text></View> : null}
      {!loading && error ? <Card style={styles.errorCard}><AlertCircle size={20} color={colors.error} /><Text style={styles.errorText}>{error}</Text></Card> : null}
      {!loading && !error && !token ? <EmptyState title="登录后同步通知" body="游客模式下不会伪造通知数据。" /> : null}
      {!loading && !error && token && items.length === 0 ? <EmptyState title={filter === 'UNREAD' ? '暂无未读通知' : '暂无通知'} body="新的计划、资源和账号消息会显示在这里。" /> : null}
      {!loading && !error && items.length > 0 ? <View style={styles.list}>{items.map((item) => <NotificationCard key={item.id} item={item} onPress={() => void markRead(item)} />)}</View> : null}
    </AppScreen>
  );
}

function NotificationCard({ item, onPress }: { item: UserNotification; onPress: () => void }) {
  const Icon = item.type === 'TRAINING' || item.type === 'PLAN' ? Dumbbell : item.type === 'NUTRITION' ? Utensils : item.type === 'SECURITY' ? ShieldCheck : BellRing;
  return <Card style={[styles.item, !item.readAt && styles.unread]} onPress={onPress} accessibilityLabel={`${item.title}${item.readAt ? '' : '，未读'}`}><View style={styles.itemIcon}><Icon size={20} color={item.important ? colors.warning : colors.primary} /></View><View style={styles.itemCopy}><View style={styles.itemHeader}><Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>{!item.readAt ? <View style={styles.dot} /> : null}</View><View style={styles.meta}><Tag tone={item.important ? 'muscle' : 'neutral'}>{typeLabels[item.type] ?? item.type}</Tag><Text style={styles.time}>{formatNotificationTime(item.createdAt)}</Text></View>{item.summary ? <Text style={styles.itemSummary} numberOfLines={3}>{item.summary}</Text> : null}</View></Card>;
}
function EmptyState({ title, body }: { title: string; body: string }) { return <Card style={styles.empty}><View style={styles.emptyIcon}><BellRing size={30} color={colors.textSecondary} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text></Card>; }
function formatNotificationTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
const styles = StyleSheet.create({
  content: { paddingBottom: spacing.x8 }, summaryRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.x3, marginBottom: spacing.x3 }, summary: { ...typography.caption, color: colors.textSecondary, flex: 1 }, list: { gap: spacing.x3 }, item: { flexDirection: 'row', gap: spacing.x3, padding: spacing.x4, borderColor: colors.border }, unread: { borderColor: colors.primaryBorder, backgroundColor: 'rgba(179,255,0,0.06)' }, itemIcon: { width: 40, height: 40, borderRadius: radius.control, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' }, itemCopy: { flex: 1, minWidth: 0 }, itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.x2 }, itemTitle: { ...typography.listTitle, color: colors.text, flex: 1 }, dot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.primary, marginTop: 6 }, meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2, marginTop: spacing.x2 }, time: { ...typography.caption, color: colors.textTertiary }, itemSummary: { ...typography.body, color: colors.textSecondary, marginTop: spacing.x2 }, state: { alignItems: 'center', gap: spacing.x2, paddingVertical: spacing.x10 }, stateText: { ...typography.caption, color: colors.textSecondary }, errorCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2, borderColor: 'rgba(255,69,58,0.4)' }, errorText: { ...typography.body, color: colors.error, flex: 1 }, empty: { alignItems: 'center', gap: spacing.x3, paddingVertical: spacing.x10 }, emptyIcon: { width: 72, height: 72, borderRadius: radius.pill, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { ...typography.cardTitle, color: colors.text }, emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', maxWidth: 320 },
});
