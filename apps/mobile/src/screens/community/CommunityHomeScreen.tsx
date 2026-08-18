import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowUpRight, Clock3, MessagesSquare, Sparkles } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, Tag } from '../../components/ui';
import { trackEvent } from '../../services/analytics';
import { colors, radius, spacing, typography } from '../../theme';
import type { CommunityStackParamList } from '../../types';

type Props = NativeStackScreenProps<CommunityStackParamList, 'CommunityHome'>;

export function CommunityHomeScreen(_: Props) {
  useEffect(() => {
    trackEvent('community_screen_viewed', { source: 'main_tab' }, { screenId: 'community_home' });
  }, []);

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>COMMUNITY</Text>
          <Text style={styles.title}>社区</Text>
        </View>
        <View style={styles.headerIcon}>
          <MessagesSquare size={22} color={colors.primary} />
        </View>
      </View>

      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}><Sparkles size={26} color={colors.primary} /></View>
          <Tag tone="primary">即将上线</Tag>
        </View>
        <Text style={styles.heroTitle}>社区功能敬请期待</Text>
        <Text style={styles.heroCopy}>我们正在打磨更好的训练交流体验，很快与你见面。</Text>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <Clock3 size={17} color={colors.textSecondary} />
          <Text style={styles.metaText}>功能准备中</Text>
          <ArrowUpRight size={17} color={colors.textTertiary} />
        </View>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 132 },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.x5 },
  eyebrow: { ...typography.eyebrow, color: colors.primary, marginBottom: 2 },
  title: { ...typography.pageTitle, color: colors.text },
  headerIcon: { width: 46, height: 46, borderRadius: radius.pill, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder, alignItems: 'center', justifyContent: 'center' },
  hero: { padding: spacing.x5, marginTop: spacing.x2 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroIcon: { width: 56, height: 56, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { ...typography.sectionTitle, color: colors.text, marginTop: spacing.x6 },
  heroCopy: { ...typography.body, color: colors.textSecondary, marginTop: spacing.x2 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.x5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2 },
  metaText: { flex: 1, ...typography.support, color: colors.textSecondary },
});
