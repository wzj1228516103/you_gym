import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CirclePause, Download, Image, Play, Trash2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, Card, IconButton, ProgressBar, ScreenHeader, SectionHeader, Tag } from '../../components/ui';
import { colors, spacing, typography } from '../../theme';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Storage'>;

const resources = [
  { title: '男性 2D 人体素材', size: '18.4 MB', progress: 1, status: '已下载' },
  { title: '女性 2D 人体素材', size: '16.9 MB', progress: 1, status: '已下载' },
  { title: '动作视频包 · 力量训练', size: '1.2 GB / 2.5 GB', progress: 0.48, status: '下载中' },
  { title: '新手训练计划媒体', size: '320 MB', progress: 0.71, status: '已暂停' },
];

export function StorageScreen({ navigation }: Props) {
  return (
    <AppScreen>
      <ScreenHeader title="存储空间" onBack={navigation.goBack} actions={<IconButton icon={Trash2} label="清理缓存" size={42} />} />
      <Card style={styles.summary}><Text style={styles.used}>已用 8.6 GB</Text><Text style={styles.available}>可用 51.4 GB</Text><ProgressBar value={0.14} /></Card>
      <SectionHeader title="本地资源" action="清理缓存" />
      {resources.map((resource) => (
        <Card key={resource.title} style={styles.resource}>
          <View style={styles.resourceIcon}>{resource.title.includes('人体') ? <Image size={21} color={colors.primary} /> : <Download size={21} color={colors.primary} />}</View>
          <View style={styles.resourceCopy}><View style={styles.resourceTitleRow}><Text style={styles.resourceTitle}>{resource.title}</Text><Tag tone={resource.progress === 1 ? 'primary' : 'neutral'}>{resource.status}</Tag></View><Text style={styles.resourceSize}>{resource.size}</Text><ProgressBar value={resource.progress} /></View>
          {resource.progress < 1 ? <IconButton icon={resource.status === '下载中' ? CirclePause : Play} label={resource.status === '下载中' ? '暂停下载' : '继续下载'} size={40} /> : null}
        </Card>
      ))}
      <Text style={styles.note}>人体 2D 基础素材随 App 发布，可离线使用。动作媒体可按需下载并随时清理。</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summary: { gap: spacing.x3 },
  used: { ...typography.sectionTitle, color: colors.text },
  available: { ...typography.caption, color: colors.textSecondary },
  resource: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginBottom: spacing.x2, padding: spacing.x3 },
  resourceIcon: { width: 44, height: 44, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  resourceCopy: { flex: 1, minWidth: 0, gap: spacing.x2 },
  resourceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2, flexWrap: 'wrap' },
  resourceTitle: { ...typography.listTitle, color: colors.text },
  resourceSize: { ...typography.caption, color: colors.textSecondary },
  note: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x4 },
});
