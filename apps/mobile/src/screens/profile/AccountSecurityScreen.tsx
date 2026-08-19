import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronRight, KeyRound, LogOut, ShieldCheck, Smartphone, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader, SettingRow } from '../../components/ui';
import { useAuthState } from '../../state/AuthState';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AccountSecurity'>;

export function AccountSecurityScreen({ navigation }: Props) {
  const { user, logout } = useAuthState();
  const [biometric, setBiometric] = useState(true);
  const maskedPhone = user?.phone ? `${user.phone.slice(0, 3)} **** ${user.phone.slice(-4)}` : '-';
  return <AppScreen contentStyle={styles.content}>
    <ScreenHeader title="账号与安全" onBack={navigation.goBack} />
    <Card style={styles.status}><View style={styles.statusIcon}><ShieldCheck size={23} color={colors.success} /></View><View style={styles.statusCopy}><Text style={styles.statusTitle}>账号安全状态良好</Text><Text style={styles.statusText}>已绑定手机号 · 最近登录正常</Text></View></Card>
    <Text style={styles.sectionTitle}>账号信息</Text><Card style={styles.group}><SettingRow icon={Smartphone} title="手机号" value={maskedPhone} onPress={() => undefined} /><SettingRow icon={KeyRound} title="修改密码" onPress={() => undefined} /><SettingRow icon={Smartphone} title="登录设备" value="当前设备" onPress={() => undefined} /></Card>
    <Text style={styles.sectionTitle}>登录保护</Text><Card style={styles.group}><SettingRow icon={ShieldCheck} title="生物识别登录" toggle enabled={biometric} onToggle={setBiometric} /><SettingRow title="短信验证码" value="仅登录与重要通知" onPress={() => undefined} /></Card>
    <Text style={styles.sectionTitle}>数据操作</Text><Card style={styles.group}><ActionRow icon={LogOut} title="退出登录" onPress={() => Alert.alert('退出登录', '确定退出当前账号吗？', [{ text: '取消', style: 'cancel' }, { text: '退出', style: 'destructive', onPress: () => { void logout(); } }])} /><ActionRow icon={Trash2} title="删除账号" danger onPress={() => Alert.alert('删除账号', '删除账号功能将在数据保留策略确定后开放。')} /></Card>
    <Text style={styles.note}>短信服务仅用于验证码、账号安全和重要通知。</Text>
  </AppScreen>;
}

function ActionRow({ icon: Icon, title, danger, onPress }: { icon: typeof LogOut; title: string; danger?: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}><Icon size={19} color={danger ? colors.error : colors.textSecondary} /><Text style={[styles.actionTitle, danger && styles.danger]}>{title}</Text><ChevronRight size={17} color={colors.textTertiary} /></Pressable>; }

const styles = StyleSheet.create({ content: { paddingBottom: spacing.x8 }, status: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3 }, statusIcon: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: 'rgba(50,215,75,0.12)', alignItems: 'center', justifyContent: 'center' }, statusCopy: { flex: 1 }, statusTitle: { ...typography.listTitle, color: colors.text }, statusText: { ...typography.caption, color: colors.textSecondary, marginTop: 2 }, sectionTitle: { ...typography.cardTitle, color: colors.text, marginTop: spacing.x5, marginBottom: spacing.x3 }, group: { paddingVertical: 0 }, actionRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider }, actionTitle: { flex: 1, ...typography.body, color: colors.text }, danger: { color: colors.error }, note: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x4, paddingHorizontal: spacing.x2 }, pressed: { opacity: 0.78 } });
