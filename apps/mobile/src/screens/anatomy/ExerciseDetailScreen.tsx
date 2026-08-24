import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, Bookmark, Check, Dumbbell, ShieldCheck, Star } from 'lucide-react-native';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, PrimaryButton, ScreenHeader, SectionHeader, Tag } from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { serverAnatomyId } from '../../data/anatomyMerge';
import { colors, radius, spacing, typography } from '../../theme';
import { trackEvent } from '../../services/analytics';
import { API_BASE_URL, ExerciseContent, fetchExercise, fetchPublishedExerciseContent } from '../../services/api';
import { translateExerciseName } from '../../data/exerciseNameZh';
import type { AnatomyStackParamList } from '../../types';

type Props = NativeStackScreenProps<AnatomyStackParamList, 'ExerciseDetail'>;

export function ExerciseDetailScreen({ navigation, route }: Props) {
  return <ExerciseDetailContent exerciseId={route.params.exerciseId} nodeId={route.params.nodeId} onBack={navigation.goBack} />;
}

export function ExerciseDetailContent({ exerciseId, nodeId, onBack }: { exerciseId: string; nodeId?: string; onBack: () => void }) {
  const { addExercise, todayExerciseIds, exercises } = useAppState();
  const exercise = exercises.find((item) => item.id === exerciseId) ?? exercises[0];
  const [saved, setSaved] = useState(false);
  const [content, setContent] = useState<ExerciseContent | null>(null);
  const [catalogExercise, setCatalogExercise] = useState<import('../../services/api').ExerciseCatalogItem | null>(null);
  const [selectedResourceUrl, setSelectedResourceUrl] = useState<string | null>(null);
  const added = todayExerciseIds.includes(exercise.id);
  const normalizeMediaUrl = (url: string | null | undefined) => !url ? undefined : url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const catalogMediaUrl = normalizeMediaUrl(exercise.mediaUrl);
  const mediaResources = catalogExercise?.resources ?? exercise.mediaResources ?? [];
  const displayName = translateExerciseName(catalogExercise?.nameZh ?? exercise.name);
  const displaySteps = catalogExercise?.datasetDetail?.instructionSteps?.zh?.length ? catalogExercise.datasetDetail.instructionSteps.zh : exercise.steps;
  const activeMediaUrl = selectedResourceUrl ?? content?.mediaUrl ?? catalogMediaUrl;

  useEffect(() => {
    trackEvent('exercise_detail_viewed', { exerciseId: exercise.id, name: displayName }, { screenId: 'exercise_detail' });
    let active = true;
    void fetchExercise(exercise.sourceId ?? exercise.id).then((item) => {
      if (!active) return;
      setCatalogExercise(item);
      const firstResource = item.resources.find((resource) => resource.resourceType === 'THUMBNAIL_IMAGE') ?? item.resources[0];
      if (firstResource) setSelectedResourceUrl(normalizeMediaUrl(firstResource.resourceUrl) ?? null);
    }).catch(() => { if (active) setCatalogExercise(null); });
    void fetchPublishedExerciseContent(displayName, nodeId ? serverAnatomyId(nodeId) : undefined).then(({ items }) => {
      if (!active) return;
      const match = nodeId ? items[0] : items.find((item) => item.title === displayName);
      setContent(match ?? null);
    }).catch(() => { if (active) setContent(null); });
    return () => { active = false; };
  }, [displayName, exercise.id, exercise.sourceId, nodeId]);

  return (
    <AppScreen>
      <ScreenHeader title="动作详情" onBack={onBack} actions={<IconButton icon={Bookmark} label="收藏动作" active={saved} size={42} onPress={() => setSaved((value) => !value)} />} />

      <View style={styles.titleRow}>
        <View style={styles.titleCopy}><Text style={styles.title}>{displayName}</Text><Text style={styles.english}>{exercise.nameEn}</Text></View>
        <Tag tone="primary">{exercise.level}</Tag>
      </View>
      <View style={styles.metaRow}><Tag>{exercise.target}</Tag><Tag>{exercise.equipment}</Tag><Tag>{exercise.location}</Tag></View>

      <View style={styles.media}>
        {activeMediaUrl ? <Image source={{ uri: activeMediaUrl }} resizeMode="cover" style={styles.mediaImage} /> : <Dumbbell size={76} color={colors.muscle} strokeWidth={1.4} />}
        <Text style={styles.mediaNote}>{selectedResourceUrl?.toLowerCase().includes('.gif') ? '动作演示 GIF · 自动播放' : content ? `${content.contentType === 'VIDEO' ? '视频' : content.contentType === 'GIF' ? 'GIF' : content.contentType === 'MODEL_3D' ? '3D 模型' : '训练内容'} · 已发布` : '动作图片'}</Text>
      </View>
      {mediaResources.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaResourceRow}>
        {mediaResources.map((resource) => {
          const resourceUrl = normalizeMediaUrl(resource.resourceUrl) ?? resource.resourceUrl;
          const selected = selectedResourceUrl === resource.resourceUrl || selectedResourceUrl === resourceUrl;
          const isGif = resource.resourceType === 'ANIMATION_GIF' || resource.resourceUrl.toLowerCase().includes('.gif');
          return <Pressable key={resource.id} accessibilityRole="button" accessibilityLabel={`查看${isGif ? '动作演示 GIF' : '动作图片'}`} onPress={() => setSelectedResourceUrl(resourceUrl)} style={[styles.mediaResource, selected && styles.mediaResourceSelected]}>
            <Image source={{ uri: resourceUrl }} resizeMode="cover" style={styles.mediaResourceImage} />
            <Text style={styles.mediaResourceLabel}>{isGif ? 'GIF 演示' : '动作图片'}</Text>
          </Pressable>;
        })}
      </ScrollView> : null}

      <View style={styles.ratingRow}>{exercise.rating > 0 ? <><Star size={16} color={colors.warning} fill={colors.warning} /><Text style={styles.rating}>{exercise.rating}</Text></> : <Text style={styles.rating}>数据库动作目录</Text>}<Text style={styles.ratingMeta}>{exercise.sourceId ? '来自动作目录' : '本地兼容数据'}</Text></View>

      <View style={styles.parameterGrid}>
        <Parameter label="组数" value={`${exercise.sets}`} />
        <Parameter label="次数" value={exercise.reps} />
        <Parameter label="休息" value={`${exercise.restSeconds}s`} />
      </View>

      <SectionHeader title="标准动作步骤" />
      <Card style={styles.listCard}>{displaySteps.map((step, index) => <View key={`${index}-${step}`} style={styles.stepRow}><View style={styles.stepIndex}><Text style={styles.stepIndexText}>{index + 1}</Text></View><Text style={styles.stepText}>{step}</Text></View>)}</Card>

      {content?.summary || content?.body ? <><SectionHeader title="教练补充" /><Card style={styles.contentCard}>{content.summary ? <Text style={styles.contentSummary}>{content.summary}</Text> : null}{content.body ? <Text style={styles.contentBody}>{content.body}</Text> : null}</Card></> : null}

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
  mediaImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  mediaNote: { ...typography.caption, color: colors.textTertiary, position: 'absolute', left: spacing.x3, bottom: spacing.x3 },
  mediaResourceRow: { gap: spacing.x2, paddingTop: spacing.x3 },
  mediaResource: { width: 92, height: 72, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, overflow: 'hidden' },
  mediaResourceSelected: { borderColor: colors.primary, borderWidth: 2 },
  mediaResourceImage: { width: '100%', height: '100%' },
  mediaResourceLabel: { position: 'absolute', left: 4, right: 4, bottom: 4, ...typography.eyebrow, color: colors.text, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.62)', paddingVertical: 2 },
  ratingRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.x2 },
  rating: { ...typography.body, color: colors.warning, fontWeight: '700' },
  ratingMeta: { ...typography.caption, color: colors.textSecondary, marginLeft: 'auto' },
  parameterGrid: { flexDirection: 'row', gap: spacing.x2 },
  parameter: { flex: 1, minHeight: 74, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  parameterLabel: { ...typography.caption, color: colors.textSecondary },
  parameterValue: { ...typography.cardTitle, color: colors.text, marginTop: spacing.x1 },
  listCard: { gap: spacing.x3 },
  contentCard: { gap: spacing.x3 },
  contentSummary: { ...typography.listTitle, color: colors.text },
  contentBody: { ...typography.body, color: colors.textSecondary },
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
