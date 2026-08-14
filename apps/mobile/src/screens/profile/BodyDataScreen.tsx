import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Activity, ChevronRight, Scale, Ruler, TrendingDown, TrendingUp } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { AppScreen, Card, ScreenHeader, SegmentedControl, Tag } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'BodyData'>;
type MetricMode = 'weight' | 'fat';

export function BodyDataScreen({ navigation }: Props) {
  const [metric, setMetric] = useState<MetricMode>('weight');
  const points = metric === 'weight' ? 'M4 133 C34 130 54 120 80 126 S126 116 150 105 S195 111 220 91 S267 88 300 60 S324 56 330 40' : 'M4 48 C37 53 60 47 82 64 S125 58 151 76 S196 67 221 86 S266 77 300 95 S323 93 330 118';
  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader title="身体数据" onBack={navigation.goBack} actions={<Text style={styles.edit}>记录</Text>} />
      <SegmentedControl options={[{ label: '体重', value: 'weight' }, { label: '体脂率', value: 'fat' }]} value={metric} onChange={setMetric} />
      <Card style={styles.heroCard}><View style={styles.heroTop}><View><Text style={styles.heroLabel}>{metric === 'weight' ? '当前体重' : '当前体脂率'}</Text><Text style={styles.heroValue}>{metric === 'weight' ? '72.5 kg' : '16.3%'}</Text></View><Tag tone="primary">较上月 {metric === 'weight' ? '-1.8 kg' : '-0.8%'}</Tag></View><View style={styles.heroTrend}><TrendingDown size={17} color={colors.success} /><Text style={styles.trendCopy}>趋势稳定，正在接近你的目标</Text></View></Card>
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}><Text style={styles.sectionTitle}>近 30 天趋势</Text><Text style={styles.caption}>2026年5月16日</Text></View>
        <Svg width="100%" height={190} viewBox="0 0 334 170">
          {[28, 68, 108, 148].map((y) => <Line key={y} x1="0" y1={y} x2="334" y2={y} stroke={colors.divider} strokeWidth="1" />)}
          <Path d={points} fill="none" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
          <Circle cx="330" cy={metric === 'weight' ? 40 : 118} r="5" fill={colors.primary} stroke={colors.text} strokeWidth="1" />
        </Svg>
        <View style={styles.axis}><Text>5/16</Text><Text>5/23</Text><Text>5/30</Text><Text>6/05</Text></View>
      </Card>
      <Text style={styles.sectionTitleOutside}>身体指标</Text>
      <View style={styles.metricList}>
        <DataRow icon={Scale} label="体重" value="72.5 kg" meta="目标 70 kg" />
        <DataRow icon={Activity} label="体脂率" value="16.3%" meta="目标 15%" />
        <DataRow icon={Ruler} label="身高" value="175 cm" meta="已记录" />
      </View>
      <View style={styles.note}><TrendingUp size={17} color={colors.info} /><Text style={styles.noteText}>建议每周在相近时间测量，避免用单日变化判断训练效果。</Text></View>
    </AppScreen>
  );
}

function DataRow({ icon: Icon, label, value, meta }: { icon: typeof Scale; label: string; value: string; meta: string }) {
  return <View style={styles.dataRow}><View style={styles.dataIcon}><Icon size={19} color={colors.primary} /></View><View style={styles.dataCopy}><Text style={styles.dataLabel}>{label}</Text><Text style={styles.dataMeta}>{meta}</Text></View><Text style={styles.dataValue}>{value}</Text><ChevronRight size={17} color={colors.textTertiary} /></View>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.x8 },
  edit: { ...typography.body, color: colors.primary, fontWeight: '700', padding: spacing.x2 },
  heroCard: { marginTop: spacing.x5, gap: spacing.x3 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.x3 },
  heroLabel: { ...typography.caption, color: colors.textSecondary },
  heroValue: { ...typography.pageTitle, color: colors.text, marginTop: spacing.x1 },
  heroTrend: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2 },
  trendCopy: { ...typography.caption, color: colors.success },
  chartCard: { marginTop: spacing.x3 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.cardTitle, color: colors.text },
  caption: { ...typography.caption, color: colors.textTertiary },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitleOutside: { ...typography.cardTitle, color: colors.text, marginTop: spacing.x6, marginBottom: spacing.x3 },
  metricList: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' },
  dataRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, paddingHorizontal: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  dataIcon: { width: 40, height: 40, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  dataCopy: { flex: 1 },
  dataLabel: { ...typography.listTitle, color: colors.text },
  dataMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  dataValue: { ...typography.listTitle, color: colors.text },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.x2, marginTop: spacing.x4 },
  noteText: { flex: 1, ...typography.caption, color: colors.textSecondary },
});
