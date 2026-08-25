import { useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Info, Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, PrimaryButton, ScreenHeader, SecondaryButton, Tag } from '../../components/ui';
import { ExerciseMediaPreview, inferExerciseMediaKind, normalizeExerciseMediaUrl } from '../../components/ExerciseMediaPreview';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'Workout'>;

export function WorkoutScreen({ navigation }: Props) {
  const { todayExercises } = useAppState();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(Number(todayExercises[0]?.reps.match(/\d+/)?.[0] ?? 8));
  const [completedSets, setCompletedSets] = useState(0);
  const [completedVolume, setCompletedVolume] = useState(0);
  const startedAt = useRef(Date.now());
  const exercise = todayExercises[exerciseIndex];

  if (!exercise) return null;

  const openSummary = (totalSets: number, totalVolume: number) => {
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    navigation.replace('WorkoutSummary', {
      title: todayExercises.length === 1 ? exercise.name : '组合训练',
      durationSeconds,
      totalSets,
      plannedSets: todayExercises.reduce((sum, item) => sum + item.sets, 0),
      totalVolume: Number(totalVolume.toFixed(1)),
      calories: Math.max(1, Math.round(durationSeconds / 6)),
      muscles: Array.from(new Set(todayExercises.map((item) => item.target))),
    });
  };

  const complete = () => {
    const nextCompletedSets = completedSets + 1;
    const nextCompletedVolume = completedVolume + weight * reps;
    setCompletedSets(nextCompletedSets);
    setCompletedVolume(nextCompletedVolume);
    if (currentSet >= exercise.sets) {
      const nextExercise = todayExercises[exerciseIndex + 1];
      if (!nextExercise) {
        openSummary(nextCompletedSets, nextCompletedVolume);
        return;
      }
      const nextReps = Number(nextExercise.reps.match(/\d+/)?.[0] ?? 8);
      setExerciseIndex((value) => value + 1);
      setCurrentSet(1);
      setWeight(0);
      setReps(nextReps);
      navigation.navigate('Rest', { seconds: nextExercise.restSeconds, setNumber: 1, weight: 0, reps: nextReps, exerciseName: nextExercise.name });
    }
    else {
      setCurrentSet((value) => value + 1);
      navigation.navigate('Rest', { seconds: exercise.restSeconds, setNumber: currentSet + 1, weight, reps, exerciseName: exercise.name });
    }
  };

  return (
    <AppScreen>
      <ScreenHeader title={exercise.name} onBack={navigation.goBack} actions={<IconButton icon={Info} label="训练信息" size={42} />} />
      <Text style={styles.progress}>第 {exerciseIndex + 1} / {todayExercises.length} 个动作 · 第 {currentSet} / {exercise.sets} 组</Text>
      <View style={styles.media}>
        <ExerciseMediaPreview
          url={normalizeExerciseMediaUrl(exercise.mediaUrl)}
          kind={inferExerciseMediaKind(exercise.mediaResources?.find((resource) => normalizeExerciseMediaUrl(resource.resourceUrl) === normalizeExerciseMediaUrl(exercise.mediaUrl))?.resourceType, exercise.mediaUrl)}
          style={StyleSheet.absoluteFill}
          interactive
          accessibilityLabel={`${exercise.name}媒体`}
        />
        <Text style={styles.mediaText}>{exercise.mediaUrl ? '动作目录媒体' : '暂无动作媒体'}</Text>
      </View>
      <View style={styles.paramTags}><Tag>{exercise.reps}</Tag><Tag>{weight} kg</Tag><Tag>休息 {exercise.restSeconds}s</Tag></View>

      <Card style={styles.controlCard}>
        <Text style={styles.controlLabel}>目标次数</Text>
        <Stepper value={reps} suffix="次" onMinus={() => setReps((value) => Math.max(1, value - 1))} onPlus={() => setReps((value) => value + 1)} />
        <View style={styles.controlDivider} />
        <Text style={styles.controlLabel}>重量</Text>
        <Stepper value={weight} suffix="kg" decimal onMinus={() => setWeight((value) => Math.max(0, value - 2.5))} onPlus={() => setWeight((value) => value + 2.5)} />
      </Card>

      <View style={styles.completedRow}><Text style={styles.completedLabel}>已完成</Text>{Array.from({ length: exercise.sets }, (_, index) => <View key={index} style={[styles.setDot, index < currentSet - 1 && styles.setDotDone, index === currentSet - 1 && styles.setDotCurrent]}><Text style={[styles.setDotText, index <= currentSet - 1 && styles.setDotTextActive]}>{index + 1}</Text></View>)}</View>
      <View style={styles.buttonRow}><SecondaryButton label="结束训练" onPress={() => openSummary(completedSets, completedVolume)} style={styles.endButton} /><PrimaryButton label={currentSet >= exercise.sets && exerciseIndex === todayExercises.length - 1 ? '完成训练' : '完成本组'} onPress={complete} style={styles.completeButton} /></View>
    </AppScreen>
  );
}

function Stepper({ value, suffix, onMinus, onPlus, decimal = false }: { value: number; suffix: string; onMinus: () => void; onPlus: () => void; decimal?: boolean }) {
  return <View style={styles.stepper}><Pressable accessibilityRole="button" accessibilityLabel="减少" onPress={onMinus} style={styles.stepperButton}><Minus size={22} color={colors.text} /></Pressable><Text style={styles.stepperValue}>{decimal ? value.toFixed(1) : value} <Text style={styles.stepperSuffix}>{suffix}</Text></Text><Pressable accessibilityRole="button" accessibilityLabel="增加" onPress={onPlus} style={styles.stepperButton}><Plus size={22} color={colors.text} /></Pressable></View>;
}

const styles = StyleSheet.create({
  progress: { ...typography.caption, color: colors.textSecondary, marginTop: -spacing.x3, marginBottom: spacing.x3 },
  media: { height: 230, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: '#0E0F12', alignItems: 'center', justifyContent: 'center' },
  mediaText: { ...typography.caption, color: colors.textTertiary, position: 'absolute', left: spacing.x3, bottom: spacing.x3, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: spacing.x2, paddingVertical: spacing.x1, borderRadius: radius.small },
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
