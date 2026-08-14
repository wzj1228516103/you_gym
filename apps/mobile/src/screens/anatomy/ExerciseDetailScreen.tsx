import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, Bookmark, Check, Dumbbell, Play, ShieldCheck, Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, PrimaryButton, ScreenHeader, SectionHeader, Tag } from '../../components/ui';
import { exercises } from '../../data/mockData';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, typography } from '../../theme';
import type { AnatomyStackParamList } from '../../types';

type Props = NativeStackScreenProps<AnatomyStackParamList, 'ExerciseDetail'>;

export function ExerciseDetailScreen({ navigation, route }: Props) {
  const exercise = exercises.find((item) => item.id === route.params.exerciseId) ?? exercises[0];
  const { addExercise, todayExerciseIds } = useAppState();
  const [saved, setSaved] = useState(false);
  const added = todayExerciseIds.includes(exercise.id);

  return (
    <AppScreen>
      <ScreenHeader title="动作详情" onBack={navigation.goBack} actions={<IconButton icon={Bookmark} label="收藏动作" active={saved} size={42} onPress={() => setSaved((value) => !value)} />} />

      <View style={styles.titleRow}>
        <View style={styles.titleCopy}><Text style={styles.title}>{exercise.name}</Text><Text style={styles.english}>{exercise.nameEn}</Text></View>
        <Tag tone="primary">{exercise.level}</Tag>
      </View>
      <View style={styles.metaRow}><Tag>{exercise.target}</Tag><Tag>{exercise.equipment}</Tag><Tag>{exercise.location}</Tag></View>

      <View style={styles.media}>
        <Dumbbell size={76} color={colors.muscle} strokeWidth={1.4} />
        <View style={styles.playButton}><Play size={24} color={colors.text} fill={colors.text} /></View>
        <Text style={styles.mediaNote}>动作媒体待授权 · 当前显示训练占位</Text>
      </View>

      <View style={styles.ratingRow}><Star size={16} color={colors.warning} fill={colors.warning} /><Text style={styles.rating}>{exercise.rating}</Text><Text style={styles.ratingMeta}>专业内容已审核</Text></View>

      <View style={styles.parameterGrid}>
        <Parameter label="组数" value={`${exercise.sets}`} />
        <Parameter label="次数" value={exercise.reps} />
        <Parameter label="休息" value={`${exercise.restSeconds}s`} />
      </View>

      <SectionHeader title="标准动作步骤" />
      <Card style={styles.listCard}>{exercise.steps.map((step, index) => <View key={step} style={styles.stepRow}><View style={styles.stepIndex}><Text style={styles.stepIndexText}>{index + 1}</Text></View><Text style={styles.stepText}>{step}</Text></View>)}</Card>

      <SectionHeader title="常见错误" />
      <Card style={styles.listCard}>{exercise.mistakes.map((mistake) => <View key={mistake} style={styles.bulletRow}><AlertTriangle size={17} color={colors.warning} /><Text style={styles.bulletText}>{mistake}</Text></View>)}</Card>

      <SectionHeader title="安全提示" />
      <Card style={styles.safetyCard}><ShieldCheck size={21} color={colors.success} /><Text style={styles.safetyText}>{exercise.safety}</Text></Card>

      <PrimaryButton label={added ? '已加入今日训练' : '加入今日训练'} icon={added ? Check : undefined} onPress={() => addExercise(exercise.id)} disabled={added} style={styles.addButton} />
    </AppScreen>
  );
}

function Parameter({ label, value }: { label: string; value: string }) {
  return <View style={styles.parameter}><Text style={styles.parameterLabel}>{label}</Text><Text style={styles.parameterValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.x3 },
  titleCopy: { flex: 1 },
  title: { ...typography.sectionTitle, color: colors.text },
  english: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x1 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2, marginTop: spacing.x3 },
  media: { height: 230, borderRadius: radius.card, backgroundColor: '#0D0E11', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: spacing.x5, overflow: 'hidden' },
  playButton: { position: 'absolute', width: 56, height: 56, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.72)', borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  mediaNote: { ...typography.caption, color: colors.textTertiary, position: 'absolute', left: spacing.x3, bottom: spacing.x3 },
  ratingRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.x2 },
  rating: { ...typography.body, color: colors.warning, fontWeight: '700' },
  ratingMeta: { ...typography.caption, color: colors.textSecondary, marginLeft: 'auto' },
  parameterGrid: { flexDirection: 'row', gap: spacing.x2 },
  parameter: { flex: 1, minHeight: 74, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  parameterLabel: { ...typography.caption, color: colors.textSecondary },
  parameterValue: { ...typography.cardTitle, color: colors.text, marginTop: spacing.x1 },
  listCard: { gap: spacing.x3 },
  stepRow: { flexDirection: 'row', gap: spacing.x3, alignItems: 'flex-start' },
  stepIndex: { width: 24, height: 24, borderRadius: radius.pill, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  stepIndexText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  stepText: { flex: 1, ...typography.body, color: colors.textSecondary },
  bulletRow: { flexDirection: 'row', gap: spacing.x3, alignItems: 'center' },
  bulletText: { flex: 1, ...typography.body, color: colors.textSecondary },
  safetyCard: { flexDirection: 'row', gap: spacing.x3, alignItems: 'flex-start', borderColor: 'rgba(50,215,75,0.20)' },
  safetyText: { flex: 1, ...typography.body, color: colors.textSecondary },
  addButton: { marginTop: spacing.x6 },
});
