import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarDays, ChevronRight, Dumbbell, Flame, TrendingUp } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { AppScreen, Card, Metric, ScreenHeader, SegmentedControl, Tag } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'History'>;
type ViewMode = 'history' | 'trend';

const records = [
  { day: '14', title: '推拉腿三分化 · 推', meta: '48 分钟 · 12,450 kg', kcal: '620 kcal' },
  { day: '12', title: '上肢力量', meta: '65 分钟 · 8,420 kg', kcal: '580 kcal' },
  { day: '10', title: '臀腿基础', meta: '55 分钟 · 7,270 kg', kcal: '460 kcal' },
];

const calendarDays = Array.from({ length: 35 }, (_, index) => index < 2 || index >= 33 ? '' : `${index - 1}`);
const activeDays = new Set(['6', '8', '10', '12', '14', '20', '25', '27']);

export function HistoryScreen({ navigation }: Props) {
  const [mode, setMode] = useState<ViewMode>('history');
  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader title="训练记录" onBack={navigation.goBack} />
      <SegmentedControl options={[{ label: '历史记录', value: 'history' }, { label: '趋势分析', value: 'trend' }]} value={mode} onChange={setMode} />

      {mode === 'history' ? (
        <>
          <View style={styles.monthHeader}><Text style={styles.month}>2026年8月</Text><Tag tone="primary">本月 8 次</Tag></View>
          <Card style={styles.calendarCard}>
            <View style={styles.weekRow}>{['日', '一', '二', '三', '四', '五', '六'].map((day) => <Text key={day} style={styles.weekDay}>{day}</Text>)}</View>
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => <View key={`${day}-${index}`} style={styles.dayCell}>{day ? <View style={[styles.dayDot, activeDays.has(day) && styles.dayDotActive, day === '14' && styles.dayDotSelected]}><Text style={[styles.dayText, activeDays.has(day) && styles.dayTextActive]}>{day}</Text></View> : null}</View>)}
            </View>
          </Card>

          <Text style={styles.sectionTitle}>8月14日 · 周四</Text>
          {records.map((record) => (
            <Card key={record.day} style={styles.recordCard}>
              <View style={styles.recordIcon}><Dumbbell size={22} color={colors.primary} /></View>
              <View style={styles.recordCopy}><Text style={styles.recordTitle}>{record.title}</Text><Text style={styles.recordMeta}>{record.meta}</Text><Text style={styles.recordKcal}>{record.kcal}</Text></View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </Card>
          ))}
        </>
      ) : (
        <>
          <View style={styles.periodRow}><Tag tone="primary">近 3 个月</Tag><Text style={styles.periodHint}>较上周期增加 18.6%</Text></View>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}><View><Text style={styles.chartLabel}>总训练容量</Text><Text style={styles.chartValue}>45,620 kg</Text></View><TrendingUp size={23} color={colors.primary} /></View>
            <Svg width="100%" height={190} viewBox="0 0 330 190">
              {[28, 68, 108, 148].map((y) => <Line key={y} x1="0" y1={y} x2="330" y2={y} stroke={colors.divider} strokeWidth="1" />)}
              <Path d="M4 154 C30 135 52 143 78 116 S126 128 153 96 S205 105 230 75 S282 76 326 35" fill="none" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
              {[[4,154],[78,116],[153,96],[230,75],[326,35]].map(([x,y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={colors.primary} stroke={colors.text} strokeWidth="1" />)}
            </Svg>
            <Text style={styles.chartSummary}>训练容量连续 5 周上升，当前增幅处于稳健范围。</Text>
          </Card>

          <View style={styles.metricRow}><Card style={styles.metricCard}><Metric label="训练次数" value="18 次" accent /></Card><Card style={styles.metricCard}><Metric label="总时长" value="16.4 h" /></Card></View>
          <Card style={styles.strengthCard}>
            <View style={styles.strengthHeader}><Flame size={20} color={colors.muscle} /><Text style={styles.sectionTitleInline}>个人力量记录</Text></View>
            <StrengthRow name="深蹲 1RM" value="120 kg" change="+5 kg" />
            <StrengthRow name="卧推 1RM" value="100 kg" change="+2.5 kg" />
            <StrengthRow name="硬拉 1RM" value="140 kg" change="+7.5 kg" />
          </Card>
        </>
      )}
    </AppScreen>
  );
}

function StrengthRow({ name, value, change }: { name: string; value: string; change: string }) {
  return <View style={styles.strengthRow}><Text style={styles.strengthName}>{name}</Text><Text style={styles.strengthValue}>{value}</Text><Text style={styles.strengthChange}>{change}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.x8 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.x5, marginBottom: spacing.x3 },
  month: { ...typography.cardTitle, color: colors.text },
  calendarCard: { padding: spacing.x3 },
  weekRow: { flexDirection: 'row' },
  weekDay: { flex: 1, ...typography.eyebrow, color: colors.textTertiary, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.x2 },
  dayCell: { width: '14.285%', height: 42, alignItems: 'center', justifyContent: 'center' },
  dayDot: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  dayDotActive: { backgroundColor: colors.primarySoft },
  dayDotSelected: { backgroundColor: colors.primary },
  dayText: { ...typography.caption, color: colors.textSecondary },
  dayTextActive: { color: colors.textInverse, fontWeight: '700' },
  sectionTitle: { ...typography.listTitle, color: colors.text, marginTop: spacing.x5, marginBottom: spacing.x3 },
  recordCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginBottom: spacing.x2, padding: spacing.x3 },
  recordIcon: { width: 48, height: 48, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  recordCopy: { flex: 1 },
  recordTitle: { ...typography.listTitle, color: colors.text },
  recordMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  recordKcal: { ...typography.eyebrow, color: colors.primary, marginTop: spacing.x1 },
  periodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.x5, marginBottom: spacing.x3 },
  periodHint: { ...typography.caption, color: colors.primary },
  chartCard: { paddingBottom: spacing.x3 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartLabel: { ...typography.caption, color: colors.textSecondary },
  chartValue: { ...typography.sectionTitle, color: colors.primary, marginTop: 2 },
  chartSummary: { ...typography.caption, color: colors.textSecondary },
  metricRow: { flexDirection: 'row', gap: spacing.x2, marginTop: spacing.x3 },
  metricCard: { flex: 1, minHeight: 94, justifyContent: 'center' },
  strengthCard: { marginTop: spacing.x3, paddingVertical: spacing.x2 },
  strengthHeader: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: spacing.x2 },
  sectionTitleInline: { ...typography.listTitle, color: colors.text },
  strengthRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.divider },
  strengthName: { flex: 1, ...typography.body, color: colors.text },
  strengthValue: { ...typography.listTitle, color: colors.text },
  strengthChange: { width: 70, ...typography.caption, color: colors.primary, textAlign: 'right' },
});
