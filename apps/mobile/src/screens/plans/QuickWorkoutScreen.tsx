import { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Check,
  Dumbbell,
  Home,
  Minus,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Trees,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, Chip, PrimaryButton, ScreenHeader, Tag } from '../../components/ui';
import { exercises } from '../../data/mockData';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'QuickWorkout'>;

const targets = ['胸部', '背部', '肩部', '手臂', '核心', '臀腿'];

export function QuickWorkoutScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [venue, setVenue] = useState('健身房');
  const [equipment, setEquipment] = useState(['哑铃', '杠铃', '器械']);
  const [target, setTarget] = useState('胸部');
  const [selectedIds, setSelectedIds] = useState(['incline-dumbbell-press', 'push-up', 'dumbbell-shoulder-press']);
  const [sets, setSets] = useState(4);

  const selectedExercises = useMemo(
    () => exercises.filter((exercise) => selectedIds.includes(exercise.id)),
    [selectedIds],
  );
  const recommendedExercises = useMemo(() => {
    const matchers: Record<string, string[]> = {
      胸部: ['胸', '三角肌'],
      背部: ['背'],
      肩部: ['三角肌'],
      手臂: ['肱', '二头', '三头'],
      核心: ['核心', '腹'],
      臀腿: ['股', '臀', '腓'],
    };
    const matches = matchers[target] ?? [];
    const filtered = exercises.filter((exercise) => matches.some((keyword) => exercise.target.includes(keyword)));
    return filtered.length > 0 ? filtered : exercises.slice(0, 6);
  }, [target]);

  const toggleEquipment = (value: string) => {
    setEquipment((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const toggleExercise = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const next = () => {
    if (step < 5) setStep((current) => current + 1);
    else navigation.replace('Workout');
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader title="快速训练" eyebrow="QUICK WORKOUT" onBack={step === 1 ? navigation.goBack : () => setStep((current) => current - 1)} />
      <View style={styles.stepRow}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.stepItem}>
            <View style={[styles.stepDot, item <= step && styles.stepDotActive]}>
              {item < step ? <Check size={13} color={colors.textInverse} strokeWidth={3} /> : <Text style={[styles.stepNumber, item <= step && styles.stepNumberActive]}>{item}</Text>}
            </View>
            {item < 5 ? <View style={[styles.stepLine, item < step && styles.stepLineActive]} /> : null}
          </View>
        ))}
      </View>

      {step === 1 ? (
        <>
          <Text style={styles.title}>选择场地与器械</Text>
          <Text style={styles.subtitle}>根据你的训练环境筛选可执行动作。</Text>
          <View style={styles.venueGrid}>
            <Choice icon={Dumbbell} label="健身房" active={venue === '健身房'} onPress={() => setVenue('健身房')} />
            <Choice icon={Home} label="家庭" active={venue === '家庭'} onPress={() => setVenue('家庭')} />
            <Choice icon={Trees} label="户外" active={venue === '户外'} onPress={() => setVenue('户外')} />
          </View>
          <Text style={styles.sectionLabel}>可用器械</Text>
          <View style={styles.chipWrap}>
            {['自重', '哑铃', '杠铃', '器械', '弹力带', '壶铃'].map((item) => <Chip key={item} label={item} active={equipment.includes(item)} onPress={() => toggleEquipment(item)} />)}
          </View>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Text style={styles.title}>选择目标肌群</Text>
          <Text style={styles.subtitle}>本次训练优先安排一个主要肌群。</Text>
          <View style={styles.targetStage}>
            <View style={styles.bodySilhouette}>
              <View style={styles.bodyHead} />
              <View style={styles.bodyTorso}>
                <View style={[styles.bodyHighlight, target === '胸部' && styles.bodyHighlightActive]} />
              </View>
              <View style={styles.bodyLegs}><View style={styles.bodyLeg} /><View style={styles.bodyLeg} /></View>
            </View>
            <View style={styles.targetPath}><Text style={styles.targetPathLabel}>本次目标</Text><Text style={styles.targetPathValue}>{target} · 主要肌群</Text></View>
          </View>
          <View style={styles.chipWrap}>
            {targets.map((item) => <Chip key={item} label={item} active={target === item} onPress={() => setTarget(item)} />)}
          </View>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <Text style={styles.title}>选择动作</Text>
          <Text style={styles.subtitle}>已根据 {venue}、{target} 和可用器械完成推荐。</Text>
          {recommendedExercises.map((exercise) => {
            const active = selectedIds.includes(exercise.id);
            return (
              <Pressable key={exercise.id} onPress={() => toggleExercise(exercise.id)} style={[styles.exerciseRow, active && styles.exerciseRowActive]}>
                <View style={styles.exerciseArt}><Dumbbell size={23} color={active ? colors.primary : colors.textSecondary} /></View>
                <View style={styles.exerciseCopy}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseMeta}>{exercise.target} · {exercise.equipment} · {exercise.rating.toFixed(1)} 分</Text></View>
                <View style={[styles.checkBox, active && styles.checkBoxActive]}>{active ? <Check size={15} color={colors.textInverse} strokeWidth={3} /> : null}</View>
              </Pressable>
            );
          })}
        </>
      ) : null}

      {step === 4 ? (
        <>
          <Text style={styles.title}>调整训练参数</Text>
          <Text style={styles.subtitle}>统一设置组数、次数范围和组间休息。</Text>
          <Card style={styles.parameterCard}>
            <Parameter label="组数" value={`${sets}`} onMinus={() => setSets(Math.max(1, sets - 1))} onPlus={() => setSets(Math.min(8, sets + 1))} />
            <Parameter label="次数" value="8–12" />
            <Parameter label="休息" value="90 秒" />
            <Parameter label="强度" value="中等 · RPE 7–8" />
          </Card>
          <View style={styles.infoRow}><SlidersHorizontal size={18} color={colors.primary} /><Text style={styles.infoText}>训练中仍可单独调整每个动作的重量、次数和休息时间。</Text></View>
        </>
      ) : null}

      {step === 5 ? (
        <>
          <Text style={styles.title}>训练已生成</Text>
          <Text style={styles.subtitle}>确认顺序后即可开始，预计用时约 45 分钟。</Text>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryTop}><View><Text style={styles.summaryEyebrow}>{venue} · {target}</Text><Text style={styles.summaryTitle}>临时训练计划</Text></View><Tag tone="primary">{selectedExercises.length} 个动作</Tag></View>
            {selectedExercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.summaryRow}>
                <Text style={styles.summaryIndex}>{index + 1}</Text>
                <View style={styles.summaryCopy}><Text style={styles.summaryName}>{exercise.name}</Text><Text style={styles.summaryMeta}>{sets} 组 · {exercise.reps} · 休息 {exercise.restSeconds} 秒</Text></View>
              </View>
            ))}
          </Card>
          <View style={styles.generatedTip}><Sparkles size={18} color={colors.primary} /><Text style={styles.infoText}>这次训练不会自动修改正在执行的长期计划。</Text></View>
        </>
      ) : null}

      <PrimaryButton label={step === 5 ? '开始训练' : '下一步'} onPress={next} disabled={step === 3 && selectedIds.length === 0} style={styles.nextButton} />
    </AppScreen>
  );
}

function Choice({ icon: Icon, label, active, onPress }: { icon: typeof Dumbbell; label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceActive]}><Icon size={25} color={active ? colors.primary : colors.textSecondary} /><Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{label}</Text></Pressable>;
}

function Parameter({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus?: () => void; onPlus?: () => void }) {
  return (
    <View style={styles.parameterRow}>
      <Text style={styles.parameterLabel}>{label}</Text>
      <View style={styles.parameterControl}>
        {onMinus ? <Pressable onPress={onMinus} style={styles.stepperButton}><Minus size={17} color={colors.text} /></Pressable> : null}
        <Text style={styles.parameterValue}>{value}</Text>
        {onPlus ? <Pressable onPress={onPlus} style={styles.stepperButton}><Plus size={17} color={colors.text} /></Pressable> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.x8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.x6 },
  stepItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 26, height: 26, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  stepNumber: { ...typography.eyebrow, color: colors.textTertiary },
  stepNumberActive: { color: colors.textInverse },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.divider },
  stepLineActive: { backgroundColor: colors.primary },
  title: { ...typography.sectionTitle, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.x1, marginBottom: spacing.x5 },
  venueGrid: { flexDirection: 'row', gap: spacing.x2 },
  choice: { flex: 1, minHeight: 92, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', gap: spacing.x2 },
  choiceActive: { borderColor: colors.primaryBorder, backgroundColor: colors.primarySoft },
  choiceLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  choiceLabelActive: { color: colors.primary },
  sectionLabel: { ...typography.listTitle, color: colors.text, marginTop: spacing.x6, marginBottom: spacing.x3 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2 },
  targetStage: { minHeight: 280, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.anatomyStage, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.x4, overflow: 'hidden' },
  bodySilhouette: { alignItems: 'center' },
  bodyHead: { width: 44, height: 52, borderRadius: 22, backgroundColor: colors.anatomyBase, borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)' },
  bodyTorso: { width: 112, height: 112, marginTop: 3, borderRadius: 38, backgroundColor: '#697789', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', alignItems: 'center', paddingTop: 14 },
  bodyHighlight: { width: 82, height: 32, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)' },
  bodyHighlightActive: { backgroundColor: colors.muscle },
  bodyLegs: { flexDirection: 'row', gap: 7, marginTop: 2 },
  bodyLeg: { width: 42, height: 88, borderRadius: 18, backgroundColor: '#697789', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)' },
  targetPath: { position: 'absolute', left: spacing.x4, bottom: spacing.x4 },
  targetPathLabel: { ...typography.eyebrow, color: colors.textSecondary },
  targetPathValue: { ...typography.listTitle, color: colors.text, marginTop: 2 },
  exerciseRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  exerciseRowActive: { borderBottomColor: colors.primaryBorder },
  exerciseArt: { width: 48, height: 48, borderRadius: radius.control, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  exerciseCopy: { flex: 1, minWidth: 0 },
  exerciseName: { ...typography.listTitle, color: colors.text },
  exerciseMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  checkBox: { width: 24, height: 24, borderRadius: radius.small, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkBoxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  parameterCard: { paddingVertical: 0 },
  parameterRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  parameterLabel: { ...typography.body, color: colors.textSecondary },
  parameterControl: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.x2 },
  parameterValue: { minWidth: 88, ...typography.listTitle, color: colors.text, textAlign: 'center' },
  stepperButton: { width: 44, height: 44, borderRadius: radius.control, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.x3, marginTop: spacing.x4 },
  infoText: { flex: 1, ...typography.caption, color: colors.textSecondary },
  summaryCard: { paddingVertical: spacing.x2 },
  summaryTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.x3, paddingVertical: spacing.x3 },
  summaryEyebrow: { ...typography.eyebrow, color: colors.primary },
  summaryTitle: { ...typography.cardTitle, color: colors.text, marginTop: 2 },
  summaryRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, borderTopWidth: 1, borderTopColor: colors.divider },
  summaryIndex: { width: 28, ...typography.listTitle, color: colors.primary, textAlign: 'center' },
  summaryCopy: { flex: 1 },
  summaryName: { ...typography.listTitle, color: colors.text },
  summaryMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  generatedTip: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginTop: spacing.x4 },
  nextButton: { marginTop: spacing.x6 },
});
