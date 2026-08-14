import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CircleHelp, Dumbbell, Info, Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, PrimaryButton, ScreenHeader, SecondaryButton, Tag } from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'Workout'>;

export function WorkoutScreen({ navigation }: Props) {
  const { todayExercises } = useAppState();
  const exercise = todayExercises[0];
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState(80);
  const [reps, setReps] = useState(8);

  if (!exercise) return null;

  const complete = () => {
    if (currentSet >= exercise.sets) navigation.replace('WorkoutSummary');
    else {
      setCurrentSet((value) => value + 1);
      navigation.navigate('Rest', { seconds: exercise.restSeconds });
    }
  };

  return (
    <AppScreen>
      <ScreenHeader title={exercise.name} onBack={navigation.goBack} actions={<IconButton icon={Info} label="训练信息" size={42} />} />
      <Text style={styles.progress}>第 1 个动作 · 第 {currentSet} / {exercise.sets} 组</Text>
      <View style={styles.media}><Dumbbell size={68} color={colors.muscle} /><Text style={styles.mediaText}>动作示范媒体占位</Text></View>
      <View style={styles.paramTags}><Tag>{exercise.reps}</Tag><Tag>{weight} kg</Tag><Tag>休息 {exercise.restSeconds}s</Tag></View>

      <Card style={styles.controlCard}>
        <Text style={styles.controlLabel}>目标次数</Text>
        <Stepper value={reps} suffix="次" onMinus={() => setReps((value) => Math.max(1, value - 1))} onPlus={() => setReps((value) => value + 1)} />
        <View style={styles.controlDivider} />
        <Text style={styles.controlLabel}>重量</Text>
        <Stepper value={weight} suffix="kg" decimal onMinus={() => setWeight((value) => Math.max(0, value - 2.5))} onPlus={() => setWeight((value) => value + 2.5)} />
      </Card>

      <View style={styles.completedRow}><Text style={styles.completedLabel}>已完成</Text>{Array.from({ length: exercise.sets }, (_, index) => <View key={index} style={[styles.setDot, index < currentSet - 1 && styles.setDotDone, index === currentSet - 1 && styles.setDotCurrent]}><Text style={[styles.setDotText, index <= currentSet - 1 && styles.setDotTextActive]}>{index + 1}</Text></View>)}</View>
      <View style={styles.buttonRow}><SecondaryButton label="结束训练" onPress={() => navigation.replace('WorkoutSummary')} style={styles.endButton} /><PrimaryButton label={currentSet >= exercise.sets ? '完成训练' : '完成本组'} onPress={complete} style={styles.completeButton} /></View>
    </AppScreen>
  );
}

function Stepper({ value, suffix, onMinus, onPlus, decimal = false }: { value: number; suffix: string; onMinus: () => void; onPlus: () => void; decimal?: boolean }) {
  return <View style={styles.stepper}><Pressable accessibilityRole="button" accessibilityLabel="减少" onPress={onMinus} style={styles.stepperButton}><Minus size={22} color={colors.text} /></Pressable><Text style={styles.stepperValue}>{decimal ? value.toFixed(1) : value} <Text style={styles.stepperSuffix}>{suffix}</Text></Text><Pressable accessibilityRole="button" accessibilityLabel="增加" onPress={onPlus} style={styles.stepperButton}><Plus size={22} color={colors.text} /></Pressable></View>;
}

const styles = StyleSheet.create({
  progress: { ...typography.caption, color: colors.textSecondary, marginTop: -spacing.x3, marginBottom: spacing.x3 },
  media: { height: 230, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: '#0E0F12', alignItems: 'center', justifyContent: 'center' },
  mediaText: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.x3 },
  paramTags: { flexDirection: 'row', gap: spacing.x2, marginTop: spacing.x3 },
  controlCard: { marginTop: spacing.x4 },
  controlLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  stepper: { minHeight: 86, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepperButton: { width: 46, height: 46, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  stepperValue: { ...typography.pageTitle, fontSize: 38, color: colors.text },
  stepperSuffix: { ...typography.body, color: colors.textSecondary },
  controlDivider: { height: 1, backgroundColor: colors.divider },
  completedRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.x2 },
  completedLabel: { ...typography.caption, color: colors.textSecondary, marginRight: 'auto' },
  setDot: { width: 32, height: 32, borderRadius: radius.pill, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  setDotDone: { backgroundColor: colors.primary },
  setDotCurrent: { borderWidth: 1, borderColor: colors.primary },
  setDotText: { ...typography.caption, color: colors.textTertiary },
  setDotTextActive: { color: colors.textInverse, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: spacing.x3 },
  endButton: { flex: 0.42 },
  completeButton: { flex: 1 },
});
