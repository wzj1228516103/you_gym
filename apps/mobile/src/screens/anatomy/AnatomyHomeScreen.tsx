import { useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Animated, Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Layers3, LocateFixed, RotateCcw, Search, Settings2, X } from 'lucide-react-native';
import { AppScreen, Card, IconButton, PrimaryButton, ScreenHeader, SegmentedControl, Tag } from '../../components/ui';
import { anatomyNodes, regions } from '../../data/mockData';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, typography } from '../../theme';
import type { AnatomyStackParamList, Gender } from '../../types';

type Props = NativeStackScreenProps<AnatomyStackParamList, 'AnatomyHome'>;
const anatomyAsset = require('../../../assets/anatomy/anatomy-front-back.png');

export function AnatomyHomeScreen({ navigation }: Props) {
  const { selectedNode, selectedNodeId, setSelectedNodeId } = useAppState();
  const [gender, setGender] = useState<Gender>('male');
  const [panel, setPanel] = useState<'regions' | 'locate' | 'settings' | null>(null);
  const focus = useRef(new Animated.Value(0)).current;
  const selectedTop = Number.parseFloat(selectedNode.hotspot.top);
  const selectedLeft = Number.parseFloat(selectedNode.hotspot.left);

  useEffect(() => {
    focus.stopAnimation();
    focus.setValue(0);
    Animated.timing(focus, { toValue: 1, duration: 520, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [focus, selectedNodeId]);

  const modelTransform = useMemo(() => ({
    transform: [
      { scale: focus.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) },
      { translateY: focus.interpolate({ inputRange: [0, 1], outputRange: [0, selectedTop < 40 ? 8 : selectedTop > 58 ? -8 : 0] }) },
      { translateX: focus.interpolate({ inputRange: [0, 1], outputRange: [0, selectedLeft > 50 ? -5 : 5] }) },
    ],
  }), [focus, selectedLeft, selectedTop]);

  const chooseNode = (id: string) => {
    setSelectedNodeId(id);
    setPanel(null);
  };

  const chooseRegion = (region: string) => {
    const node = region === '全身' ? anatomyNodes[0] : anatomyNodes.find((item) => item.region === region);
    if (node) chooseNode(node.id);
  };

  return (
    <AppScreen scroll={false} contentStyle={styles.content}>
      <ScreenHeader
        title="人体探索"
        actions={(
          <>
            <IconButton icon={Search} label="搜索肌肉" size={42} onPress={() => setPanel('regions')} />
            <IconButton icon={LocateFixed} label="快速定位" size={42} onPress={() => setPanel('locate')} />
            <IconButton icon={Settings2} label="模型设置" size={42} onPress={() => setPanel('settings')} />
          </>
        )}
      />

      <View style={styles.topControls}>
        <Pressable accessibilityRole="button" onPress={() => setPanel('regions')} style={styles.regionButton}>
          <Text style={styles.regionLabel}>身体区域</Text>
          <Text style={styles.regionValue}>{selectedNode.region} ▾</Text>
        </Pressable>
        <SegmentedControl options={[{ label: '男性', value: 'male' }, { label: '女性', value: 'female' }]} value={gender} onChange={setGender} />
      </View>

      <View style={styles.stage}>
        <Animated.View style={[styles.modelWrap, modelTransform]}>
          <Image source={anatomyAsset} resizeMode="contain" style={[styles.modelImage, gender === 'female' && styles.femaleModel]} accessibilityLabel={`${gender === 'male' ? '男性' : '女性'}正面与背面肌肉图`} />
          {anatomyNodes.map((node) => {
            const selected = node.id === selectedNodeId;
            return (
              <Pressable
                key={node.id}
                accessibilityRole="button"
                accessibilityLabel={`${node.muscle}${node.part}`}
                accessibilityState={{ selected }}
                onPress={() => chooseNode(node.id)}
                style={[styles.hotspot, node.hotspot, selected && styles.hotspotSelected]}
              >
                {selected ? <Animated.View style={[styles.hotspotPulse, { opacity: focus }]} /> : null}
              </Pressable>
            );
          })}
        </Animated.View>

        <View style={styles.stageTools}>
          <IconButton icon={Layers3} label="显示表层肌肉" active size={40} />
          <IconButton icon={RotateCcw} label="重置全身视图" size={40} onPress={() => chooseNode(anatomyNodes[0].id)} />
        </View>
        <Text style={styles.stageStatus}>{gender === 'male' ? '男性' : '女性'} · 正面 / 背面 · 表层肌肉</Text>
      </View>

      <Card style={styles.selectionCard}>
        <View style={styles.selectionTop}>
          <View style={styles.selectionCopy}>
            <View style={styles.selectionTitleRow}>
              <View style={styles.muscleDot} />
              <Text style={styles.selectionTitle}>{selectedNode.muscle}（{selectedNode.part}）</Text>
              <Tag tone="muscle">可训练</Tag>
            </View>
            <Text style={styles.selectionEnglish}>{selectedNode.nameEn}</Text>
          </View>
          <Text style={styles.sideLabel}>{selectedNode.side === 'front' ? '正面' : '背面'}</Text>
        </View>
        <Text style={styles.path}>{selectedNode.region} → {selectedNode.group} → {selectedNode.muscle} → {selectedNode.part}</Text>
        <View style={styles.functionRow}>
          {selectedNode.functions.map((item) => <Tag key={item}>{item}</Tag>)}
        </View>
        <PrimaryButton label={`查看匹配动作（${selectedNode.exerciseIds.length}）`} onPress={() => navigation.navigate('ExerciseFilter', { nodeId: selectedNode.id })} />
      </Card>

      <Panel visible={panel === 'regions'} title="选择身体区域" onClose={() => setPanel(null)}>
        <View style={styles.regionGrid}>{regions.map((region) => <Pressable key={region} onPress={() => chooseRegion(region)} style={[styles.panelOption, selectedNode.region === region && styles.panelOptionActive]}><Text style={[styles.panelOptionText, selectedNode.region === region && styles.panelOptionTextActive]}>{region}</Text></Pressable>)}</View>
      </Panel>

      <Panel visible={panel === 'locate'} title="快速定位" onClose={() => setPanel(null)}>
        <Text style={styles.panelHint}>按训练目标定位常用肌群</Text>
        <View style={styles.regionGrid}>{anatomyNodes.map((node) => <Pressable key={node.id} onPress={() => chooseNode(node.id)} style={styles.locateOption}><Text style={styles.locateTitle}>{node.muscle}</Text><Text style={styles.locateMeta}>{node.region} · {node.part}</Text></Pressable>)}</View>
      </Panel>

      <Panel visible={panel === 'settings'} title="人体设置" onClose={() => setPanel(null)}>
        <Text style={styles.panelLabel}>模型性别</Text>
        <SegmentedControl options={[{ label: '男性', value: 'male' }, { label: '女性', value: 'female' }]} value={gender} onChange={setGender} />
        <Text style={styles.panelLabel}>显示层级</Text>
        <View style={styles.layerRow}><Tag tone="primary">表层肌肉</Tag><Tag>深层（后续）</Tag><Tag>骨骼（后续）</Tag></View>
      </Panel>
    </AppScreen>
  );
}

function Panel({ visible, title, children, onClose }: { visible: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <View style={styles.panelHeader}><Text style={styles.panelTitle}>{title}</Text><IconButton icon={X} label="关闭" size={40} onPress={onClose} /></View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.x2, paddingBottom: 98 },
  topControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2, marginBottom: spacing.x3 },
  regionButton: { minHeight: 50, flex: 1, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, paddingHorizontal: spacing.x3, justifyContent: 'center' },
  regionLabel: { ...typography.caption, color: colors.textTertiary },
  regionValue: { ...typography.body, color: colors.text, fontWeight: '700', marginTop: 1 },
  stage: { flex: 1, minHeight: 300, maxHeight: 410, borderRadius: radius.card, backgroundColor: colors.anatomyStage, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  modelWrap: { width: '100%', aspectRatio: 396 / 365, position: 'relative' },
  modelImage: { width: '100%', height: '100%' },
  femaleModel: { opacity: 0.91 },
  hotspot: { position: 'absolute', borderRadius: radius.pill, borderWidth: 1, borderColor: 'transparent' },
  hotspotSelected: { backgroundColor: 'rgba(255,45,85,0.45)', borderColor: '#FF87A0', shadowColor: colors.muscle, shadowRadius: 14, shadowOpacity: 0.8, elevation: 8 },
  hotspotPulse: { ...StyleSheet.absoluteFill, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.muscle },
  stageTools: { position: 'absolute', right: spacing.x2, top: spacing.x2, gap: spacing.x2 },
  stageStatus: { ...typography.caption, color: colors.textSecondary, position: 'absolute', left: spacing.x3, bottom: spacing.x2 },
  selectionCard: { marginTop: spacing.x3, gap: spacing.x3 },
  selectionTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.x3 },
  selectionCopy: { flex: 1 },
  selectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2, flexWrap: 'wrap' },
  muscleDot: { width: 9, height: 9, borderRadius: radius.pill, backgroundColor: colors.muscle, shadowColor: colors.muscle, shadowRadius: 8, shadowOpacity: 0.9 },
  selectionTitle: { ...typography.cardTitle, color: colors.text },
  selectionEnglish: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x1, marginLeft: 17 },
  sideLabel: { ...typography.caption, color: colors.primary },
  path: { ...typography.caption, color: colors.textSecondary },
  functionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.72)' },
  panel: { width: '100%', maxWidth: 430, alignSelf: 'center', borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.sheet, padding: spacing.x5, paddingBottom: 40, gap: spacing.x4 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { ...typography.sectionTitle, color: colors.text },
  panelHint: { ...typography.body, color: colors.textSecondary },
  panelLabel: { ...typography.body, color: colors.text, fontWeight: '700', marginTop: spacing.x2 },
  regionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2 },
  panelOption: { width: '31%', minHeight: 48, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.x2 },
  panelOptionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  panelOptionText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', textAlign: 'center' },
  panelOptionTextActive: { color: colors.primary },
  locateOption: { width: '48%', minHeight: 64, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, justifyContent: 'center', padding: spacing.x3 },
  locateTitle: { ...typography.listTitle, color: colors.text },
  locateMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  layerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2 },
});
