import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Activity, ChevronRight, Ruler, Scale, TrendingDown } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, ScreenHeader, SegmentedControl } from '../../components/ui';
import { useAuthState } from '../../state/AuthState';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'BodyData'>;
type MetricMode = 'weight' | 'fat';

export function BodyDataScreen({ navigation }: Props) {
  const { user, guest } = useAuthState();
  const [metric, setMetric] = useState<MetricMode>('weight');
  const weight = user?.weightKg;
  const bodyFat = user?.bodyFatPct;
  const height = user?.heightCm;
  return <AppScreen contentStyle={styles.content}>
    <ScreenHeader title="身体数据" onBack={navigation.goBack} />
    <SegmentedControl options={[{ label: '体重', value: 'weight' }, { label: '体脂率', value: 'fat' }]} value={metric} onChange={setMetric} />
    <Card style={styles.heroCard}><View style={styles.heroTop}><View><Text style={styles.heroLabel}>{metric === 'weight' ? '当前体重' : '当前体脂率'}</Text><Text style={styles.heroValue}>{metric === 'weight' ? (weight != null ? `${weight} kg` : '-') : (bodyFat != null ? `${bodyFat}%` : '-')}</Text></View></View><View style={styles.heroTrend}><TrendingDown size={17} color={colors.success} /><Text style={styles.trendCopy}>{guest ? '游客模式，仅展示本机资料' : '数据来自你的个人资料'}</Text></View></Card>
    <Card style={styles.chartCard}><Text style={styles.sectionTitle}>历史趋势</Text><Text style={styles.emptyChart}>暂未接入身体测量历史，更新体重或体脂后将支持趋势查看。</Text></Card>
    <Text style={styles.sectionTitleOutside}>身体指标</Text>
    <View style={styles.metricList}><DataRow icon={Scale} label="体重" value={weight != null ? `${weight} kg` : '-'} meta="来自个人资料" /><DataRow icon={Activity} label="体脂率" value={bodyFat != null ? `${bodyFat}%` : '-'} meta="来自个人资料" /><DataRow icon={Ruler} label="身高" value={height != null ? `${height} cm` : '-'} meta="来自个人资料" /></View>
    <Text style={styles.note}>建议每周在相近时间测量，避免用单日变化判断训练效果。</Text>
  </AppScreen>;
}

function DataRow({ icon: Icon, label, value, meta }: { icon: typeof Scale; label: string; value: string; meta: string }) { return <View style={styles.dataRow}><View style={styles.dataIcon}><Icon size={19} color={colors.primary} /></View><View style={styles.dataCopy}><Text style={styles.dataLabel}>{label}</Text><Text style={styles.dataMeta}>{meta}</Text></View><Text style={styles.dataValue}>{value}</Text><ChevronRight size={17} color={colors.textTertiary} /></View>; }

const styles = StyleSheet.create({ content: { paddingBottom: spacing.x8 }, heroCard: { marginTop: spacing.x5, gap: spacing.x3 }, heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.x3 }, heroLabel: { ...typography.caption, color: colors.textSecondary }, heroValue: { ...typography.pageTitle, color: colors.text, marginTop: spacing.x1 }, heroTrend: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2 }, trendCopy: { ...typography.caption, color: colors.success }, chartCard: { marginTop: spacing.x3, gap: spacing.x3 }, sectionTitle: { ...typography.cardTitle, color: colors.text }, emptyChart: { ...typography.body, color: colors.textSecondary }, sectionTitleOutside: { ...typography.cardTitle, color: colors.text, marginTop: spacing.x6, marginBottom: spacing.x3 }, metricList: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' }, dataRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, paddingHorizontal: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider }, dataIcon: { width: 40, height: 40, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, dataCopy: { flex: 1 }, dataLabel: { ...typography.listTitle, color: colors.text }, dataMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 }, dataValue: { ...typography.listTitle, color: colors.text }, note: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x4, paddingHorizontal: spacing.x2 } });
