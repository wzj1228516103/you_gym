import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookOpen, ChevronRight, CircleHelp, MessageCircle, ShieldCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Help'>;

const faqs = ['如何开始第一次训练？', '如何记录重量和次数？', '如何调整训练提醒？', '如何删除或导出我的数据？'];

export function HelpScreen({ navigation }: Props) {
  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader title="帮助与反馈" onBack={navigation.goBack} />
      <Card style={styles.hero}><View style={styles.heroIcon}><CircleHelp size={28} color={colors.primary} /></View><Text style={styles.heroTitle}>需要一些帮助？</Text><Text style={styles.heroText}>先看看常见问题，或者把你遇到的情况告诉我们。</Text></Card>
      <Text style={styles.sectionTitle}>常见问题</Text>
      <View style={styles.list}>{faqs.map((faq) => <Pressable key={faq} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><BookOpen size={18} color={colors.primary} /><Text style={styles.rowText}>{faq}</Text><ChevronRight size={17} color={colors.textTertiary} /></Pressable>)}</View>
      <Text style={styles.sectionTitle}>联系我们</Text>
      <Card style={styles.contact}><Contact icon={MessageCircle} title="提交反馈" text="告诉我们功能问题或使用建议" /><Contact icon={ShieldCheck} title="账号与隐私" text="查看数据安全与隐私说明" /></Card>
      <Text style={styles.version}>工作日 09:00–18:00 · 通常会在 1 个工作日内回复</Text>
    </AppScreen>
  );
}

function Contact({ icon: Icon, title, text }: { icon: typeof MessageCircle; title: string; text: string }) {
  return <Pressable style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}><View style={styles.contactIcon}><Icon size={19} color={colors.primary} /></View><View style={styles.contactCopy}><Text style={styles.contactTitle}>{title}</Text><Text style={styles.contactText}>{text}</Text></View><ChevronRight size={17} color={colors.textTertiary} /></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.x8 },
  hero: { alignItems: 'center', paddingVertical: spacing.x6, marginBottom: spacing.x2 },
  heroIcon: { width: 58, height: 58, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { ...typography.cardTitle, color: colors.text, marginTop: spacing.x3 },
  heroText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.x1 },
  sectionTitle: { ...typography.cardTitle, color: colors.text, marginTop: spacing.x5, marginBottom: spacing.x3 },
  list: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' },
  row: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, paddingHorizontal: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowText: { flex: 1, ...typography.body, color: colors.text },
  contact: { paddingVertical: 0 },
  contactRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  contactIcon: { width: 40, height: 40, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  contactCopy: { flex: 1 },
  contactTitle: { ...typography.listTitle, color: colors.text },
  contactText: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  version: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.x4, textAlign: 'center' },
  pressed: { opacity: 0.78 },
});
