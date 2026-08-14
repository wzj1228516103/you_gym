import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronRight, Dumbbell, Search } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, Chip, IconButton, ScreenHeader, Tag } from '../../components/ui';
import { plans } from '../../data/mockData';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'PlanLibrary'>;

export function PlanLibraryScreen({ navigation }: Props) {
  const [category, setCategory] = useState('全部');
  return (
    <AppScreen>
      <ScreenHeader title="计划库" onBack={navigation.goBack} actions={<IconButton icon={Search} label="搜索计划" size={42} />} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{['全部', '新手', '增肌', '减脂', '家庭', '功能'].map((item) => <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}</ScrollView>
      <View style={styles.countRow}><Text style={styles.count}>精选计划</Text><Text style={styles.countMeta}>{plans.length} 个</Text></View>
      {plans.map((plan) => (
        <Card key={plan.id} onPress={() => navigation.navigate('PlanDetail', { planId: plan.id })} accessibilityLabel={`查看${plan.title}`} style={styles.planCard}>
          <View style={styles.planImage}><Dumbbell size={32} color={colors.muscle} /></View>
          <View style={styles.planCopy}>
            <View style={styles.titleRow}><Text style={styles.title}>{plan.title}</Text><Tag tone="primary">{plan.level}</Tag></View>
            <Text style={styles.meta}>{plan.duration} · {plan.exerciseCount} 个动作</Text>
            <Text style={styles.target}>{plan.target}</Text>
          </View>
          <ChevronRight size={19} color={colors.textTertiary} />
        </Card>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: spacing.x2, paddingBottom: spacing.x3 },
  countRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { ...typography.cardTitle, color: colors.text },
  countMeta: { ...typography.caption, color: colors.textSecondary },
  planCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginBottom: spacing.x2, padding: spacing.x3 },
  planImage: { width: 76, height: 76, flexShrink: 0, borderRadius: radius.card, backgroundColor: '#0E0F12', alignItems: 'center', justifyContent: 'center' },
  planCopy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2, flexWrap: 'wrap' },
  title: { ...typography.listTitle, color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x1 },
  target: { ...typography.caption, color: colors.primary, marginTop: spacing.x2 },
});
