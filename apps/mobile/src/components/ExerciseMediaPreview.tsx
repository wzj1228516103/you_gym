import { useEffect, useState } from 'react';
import { Image, ImageStyle, Linking, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Box, Dumbbell, ImageOff, Play } from 'lucide-react-native';
import { API_BASE_URL } from '../services/api';
import { colors, spacing, typography } from '../theme';

export type ExerciseMediaKind = 'image' | 'gif' | 'video' | 'model';

export function normalizeExerciseMediaUrl(url: string | null | undefined) {
  if (!url) return undefined;
  const value = url.trim();
  if (!value) return undefined;
  if (/^(?:https?:)?\/\//i.test(value)) return value.startsWith('//') ? `https:${value}` : value;
  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
}

export function inferExerciseMediaKind(resourceType?: string, url?: string, contentType?: string): ExerciseMediaKind {
  const type = `${resourceType ?? ''} ${contentType ?? ''}`.toLowerCase();
  const extension = (url ?? '').split('?')[0].toLowerCase();
  if (type.includes('model') || /\.(?:glb|gltf|obj|fbx)$/i.test(extension)) return 'model';
  if (type.includes('video') || /\.(?:mp4|mov|m4v|webm|avi)$/i.test(extension)) return 'video';
  if (type.includes('gif') || extension.endsWith('.gif')) return 'gif';
  return 'image';
}

export function ExerciseMediaPreview({
  url,
  kind = 'image',
  style,
  imageStyle,
  interactive = false,
  accessibilityLabel = '动作媒体',
}: {
  url?: string | null;
  kind?: ExerciseMediaKind;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  interactive?: boolean;
  accessibilityLabel?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [kind, url]);
  const resolvedUrl = normalizeExerciseMediaUrl(url);
  const canRenderImage = kind === 'image' || kind === 'gif';
  const fallback = failed || !resolvedUrl;

  if (canRenderImage && !fallback) {
    return (
      <View style={[styles.root, style]}>
        <Image
          source={{ uri: resolvedUrl }}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, imageStyle]}
          onError={() => setFailed(true)}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    );
  }

  const isPlayable = Boolean(resolvedUrl) && interactive && (kind === 'video' || kind === 'model');
  const Icon = failed ? ImageOff : kind === 'model' ? Box : kind === 'video' ? Play : Dumbbell;
  const label = failed ? '媒体加载失败' : !resolvedUrl ? '暂无动作媒体' : kind === 'model' ? '3D 模型资源' : kind === 'video' ? '视频资源' : kind === 'gif' ? 'GIF 演示' : '动作图片';
  const fallbackContent = (
    <View style={[styles.root, styles.fallback, style]} accessibilityLabel={accessibilityLabel}>
      <Icon size={34} color={failed ? colors.textTertiary : colors.muscle} strokeWidth={1.6} />
      <Text style={styles.fallbackLabel}>{label}</Text>
      {isPlayable ? <Text style={styles.fallbackHint}>点击打开资源</Text> : null}
    </View>
  );
  if (!isPlayable) return fallbackContent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`打开${label}`}
      onPress={() => { if (resolvedUrl) void Linking.openURL(resolvedUrl).catch(() => undefined); }}
      style={[styles.root, styles.fallback, style]}
    >
      <Icon size={34} color={colors.primary} strokeWidth={1.6} />
      <Text style={styles.fallbackLabel}>{label}</Text>
      <Text style={styles.fallbackHint}>点击打开资源</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  fallback: { gap: spacing.x1, padding: spacing.x2 },
  fallbackLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  fallbackHint: { ...typography.eyebrow, color: colors.primary, textAlign: 'center' },
});
