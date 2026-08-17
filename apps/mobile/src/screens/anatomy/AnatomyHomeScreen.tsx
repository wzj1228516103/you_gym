import { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Animated, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import { ChevronLeft, ChevronRight, Layers3, LocateFixed, RotateCcw, Search, Settings2, X } from 'lucide-react-native';
import { AppScreen, Card, IconButton, PrimaryButton, ScreenHeader, SegmentedControl, Tag } from '../../components/ui';
import { anatomyNodes, regions } from '../../data/mockData';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, typography } from '../../theme';
import type { AnatomyStackParamList, Gender } from '../../types';

type Props = NativeStackScreenProps<AnatomyStackParamList, 'AnatomyHome'>;

type HitAreaRows = Record<string, number[]>;
type HitAreaData = {
  width: number;
  height: number;
  male: Record<string, HitAreaRows>;
  female: Record<string, HitAreaRows>;
};

const anatomyAssets: Record<Gender, number> = {
  male: require('../../../assets/anatomy/anatomy-color-front-back.png'),
  female: require('../../../assets/anatomy/anatomy-female-front-back.png'),
};

const maleModuleAssets: Record<string, number> = {
  'muscle.neck': require('../../../assets/anatomy/modules/neck-muscles.png'),
  'muscle.trapezius': require('../../../assets/anatomy/modules/trapezius.png'),
  'muscle.deltoid.anterior': require('../../../assets/anatomy/modules/deltoid-anterior.png'),
  'muscle.deltoid.middle': require('../../../assets/anatomy/modules/deltoid-middle.png'),
  'muscle.deltoid.posterior': require('../../../assets/anatomy/modules/deltoid-posterior.png'),
  'muscle.pectoralis-major.clavicular': require('../../../assets/anatomy/modules/pectoralis-major.png'),
  'muscle.pectoralis-major.sternocostal': require('../../../assets/anatomy/modules/pectoralis-major-lower.png'),
  'muscle.biceps-brachii': require('../../../assets/anatomy/modules/biceps-brachii.png'),
  'muscle.triceps-brachii': require('../../../assets/anatomy/modules/triceps-brachii.png'),
  'muscle.forearm': require('../../../assets/anatomy/modules/forearm-muscles.png'),
  'muscle.rectus-abdominis': require('../../../assets/anatomy/modules/rectus-abdominis.png'),
  'muscle.external-oblique': require('../../../assets/anatomy/modules/external-oblique.png'),
  'muscle.hip-flexors': require('../../../assets/anatomy/modules/hip-flexors.png'),
  'muscle.quadriceps.rectus-femoris': require('../../../assets/anatomy/modules/quadriceps.png'),
  'muscle.adductors': require('../../../assets/anatomy/modules/adductors.png'),
  'muscle.latissimus-dorsi': require('../../../assets/anatomy/modules/latissimus-dorsi.png'),
  'muscle.gluteus-maximus': require('../../../assets/anatomy/modules/gluteus-maximus.png'),
  'muscle.gluteus-medius': require('../../../assets/anatomy/modules/gluteus-medius.png'),
  'muscle.hamstrings': require('../../../assets/anatomy/modules/hamstrings.png'),
  'muscle.tibialis-anterior': require('../../../assets/anatomy/modules/tibialis-anterior.png'),
  'muscle.gastrocnemius.medial-head': require('../../../assets/anatomy/modules/gastrocnemius.png'),
};

const femaleModuleAssets: Record<string, number> = {
  'muscle.neck': require('../../../assets/anatomy/female-modules/neck-muscles.png'),
  'muscle.trapezius': require('../../../assets/anatomy/female-modules/trapezius.png'),
  'muscle.deltoid.anterior': require('../../../assets/anatomy/female-modules/deltoid-anterior.png'),
  'muscle.deltoid.middle': require('../../../assets/anatomy/female-modules/deltoid-middle.png'),
  'muscle.deltoid.posterior': require('../../../assets/anatomy/female-modules/deltoid-posterior.png'),
  'muscle.pectoralis-major.clavicular': require('../../../assets/anatomy/female-modules/pectoralis-major.png'),
  'muscle.pectoralis-major.sternocostal': require('../../../assets/anatomy/female-modules/pectoralis-major-lower.png'),
  'muscle.biceps-brachii': require('../../../assets/anatomy/female-modules/biceps-brachii.png'),
  'muscle.triceps-brachii': require('../../../assets/anatomy/female-modules/triceps-brachii.png'),
  'muscle.forearm': require('../../../assets/anatomy/female-modules/forearm-muscles.png'),
  'muscle.rectus-abdominis': require('../../../assets/anatomy/female-modules/rectus-abdominis.png'),
  'muscle.external-oblique': require('../../../assets/anatomy/female-modules/external-oblique.png'),
  'muscle.hip-flexors': require('../../../assets/anatomy/female-modules/hip-flexors.png'),
  'muscle.quadriceps.rectus-femoris': require('../../../assets/anatomy/female-modules/quadriceps.png'),
  'muscle.adductors': require('../../../assets/anatomy/female-modules/adductors.png'),
  'muscle.latissimus-dorsi': require('../../../assets/anatomy/female-modules/latissimus-dorsi.png'),
  'muscle.gluteus-maximus': require('../../../assets/anatomy/female-modules/gluteus-maximus.png'),
  'muscle.gluteus-medius': require('../../../assets/anatomy/female-modules/gluteus-medius.png'),
  'muscle.hamstrings': require('../../../assets/anatomy/female-modules/hamstrings.png'),
  'muscle.tibialis-anterior': require('../../../assets/anatomy/female-modules/tibialis-anterior.png'),
  'muscle.gastrocnemius.medial-head': require('../../../assets/anatomy/female-modules/gastrocnemius.png'),
};

const moduleAssets: Record<Gender, Record<string, number>> = { male: maleModuleAssets, female: femaleModuleAssets };
const hitAreaData = require('../../data/muscle-hit-areas.json') as HitAreaData;

export function AnatomyHomeScreen({ navigation }: Props) {
  const { selectedNode, selectedNodeId, setSelectedNodeId } = useAppState();
  const [gender, setGender] = useState<Gender>('male');
  const [panel, setPanel] = useState<'regions' | 'locate' | 'settings' | null>(null);
  const [regionDrilldown, setRegionDrilldown] = useState<string | null>(null);
  const focus = useRef(new Animated.Value(0)).current;
  const modelSize = useRef({ width: hitAreaData.width, height: hitAreaData.height });
  const anatomyAsset = anatomyAssets[gender];
  const selectedModuleAsset = moduleAssets[gender][selectedNodeId];
  const hasExercises = selectedNode.exerciseIds.length > 0;
  const regionNodes = regionDrilldown
    ? anatomyNodes.filter((node) => regionDrilldown === '全身' || node.region === regionDrilldown)
    : [];

  useEffect(() => {
    focus.stopAnimation();
    focus.setValue(0);
    Animated.timing(focus, { toValue: 1, duration: 520, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [focus, selectedNodeId]);

  const chooseNode = (id: string) => {
    setSelectedNodeId(id);
    setRegionDrilldown(null);
    setPanel(null);
  };

  const openRegionPanel = () => {
    setRegionDrilldown(null);
    setPanel('regions');
  };

  const handleModelPress = (event: GestureResponderEvent) => {
    const nativeEvent = event.nativeEvent as GestureResponderEvent['nativeEvent'] & {
      offsetX?: number;
      offsetY?: number;
    };
    const locationX = nativeEvent.locationX ?? nativeEvent.offsetX;
    const locationY = nativeEvent.locationY ?? nativeEvent.offsetY;
    if (locationX === undefined || locationY === undefined) return;
    const sourceX = Math.round(locationX / modelSize.current.width * hitAreaData.width);
    const sourceY = Math.round(locationY / modelSize.current.height * hitAreaData.height);
    const genderHitAreas = hitAreaData[gender];
    const matchedNode = anatomyNodes.find((node) => {
      const spans = genderHitAreas[node.id]?.[String(sourceY)];
      if (!spans) return false;
      for (let index = 0; index < spans.length; index += 2) {
        if (sourceX >= spans[index] && sourceX <= spans[index + 1]) return true;
      }
      return false;
    });
    if (matchedNode) chooseNode(matchedNode.id);
  };

  const handleModelLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    modelSize.current = { width, height };
  };

  return (
    <AppScreen scroll={false} contentStyle={styles.content}>
      <ScreenHeader
        title="人体探索"
        actions={(
          <>
            <IconButton icon={Search} label="搜索肌肉" size={42} onPress={openRegionPanel} />
            <IconButton icon={LocateFixed} label="快速定位" size={42} onPress={() => setPanel('locate')} />
            <IconButton icon={Settings2} label="模型设置" size={42} onPress={() => setPanel('settings')} />
          </>
        )}
      />

      <View style={styles.topControls}>
        <Pressable accessibilityRole="button" accessibilityLabel="选择身体区域和肌肉" onPress={openRegionPanel} style={styles.regionButton}>
          <Text style={styles.regionLabel}>身体区域</Text>
          <Text style={styles.regionValue}>{selectedNode.region} ▾</Text>
        </Pressable>
        <SegmentedControl options={[{ label: '男性', value: 'male' }, { label: '女性', value: 'female' }]} value={gender} onChange={setGender} />
      </View>

      <View style={styles.stage}>
        <Animated.View style={styles.modelWrap}>
          <Pressable accessibilityRole="button" accessibilityLabel="点击人体肌肉区域进行选择" onLayout={handleModelLayout} onPress={handleModelPress} style={styles.modelPressable}>
            <Image source={anatomyAsset} resizeMode="contain" style={styles.modelImage} accessibilityLabel={`${gender === 'male' ? '男性' : '女性'}正面与背面肌肉图`} />
            {selectedModuleAsset ? (
              <Animated.Image
                source={selectedModuleAsset}
                resizeMode="contain"
                tintColor={colors.primary}
                style={[styles.moduleOverlay, { opacity: focus }]}
              />
            ) : null}
          </Pressable>
        </Animated.View>

        <View style={styles.stageTools}>
          <IconButton icon={Layers3} label="显示表层肌肉" active size={40} />
          <IconButton icon={RotateCcw} label="重置全身视图" size={40} onPress={() => chooseNode(anatomyNodes[0].id)} />
        </View>
        <Text style={styles.stageStatus}>{gender === 'male' ? '男性' : '女性'} · 正面 / 背面 · 精确像素命中</Text>
      </View>

      <Card style={styles.selectionCard}>
        <View style={styles.selectionTop}>
          <View style={styles.selectionCopy}>
            <View style={styles.selectionTitleRow}>
              <View style={[styles.muscleDot, { backgroundColor: selectedNode.color ?? colors.muscle, shadowColor: selectedNode.color ?? colors.muscle }]} />
              <Text style={styles.selectionTitle}>{selectedNode.muscle}（{selectedNode.part}）</Text>
              <Tag tone={hasExercises ? 'muscle' : 'neutral'}>{hasExercises ? '已收录动作' : '待补动作'}</Tag>
            </View>
            <Text style={styles.selectionEnglish}>{selectedNode.nameEn}</Text>
          </View>
          <Text style={styles.sideLabel}>{selectedNode.side === 'front' ? '正面' : selectedNode.side === 'back' ? '背面' : '正面 / 背面'}</Text>
        </View>
        <Text style={styles.path}>{selectedNode.region} → {selectedNode.group} → {selectedNode.muscle} → {selectedNode.part}</Text>
        <View style={styles.functionRow}>
          {selectedNode.functions.map((item) => <Tag key={item}>{item}</Tag>)}
        </View>
        <PrimaryButton
          disabled={!hasExercises}
          label={hasExercises ? `查看匹配动作（${selectedNode.exerciseIds.length}）` : '动作库准备中'}
          onPress={() => navigation.navigate('ExerciseFilter', { nodeId: selectedNode.id })}
        />
      </Card>

      <Panel
        visible={panel === 'regions'}
        title={regionDrilldown ? `${regionDrilldown} · 选择肌肉` : '选择身体区域'}
        onBack={regionDrilldown ? () => setRegionDrilldown(null) : undefined}
        onClose={() => setPanel(null)}
      >
        {regionDrilldown ? (
          <View style={styles.muscleList}>
            {regionNodes.map((node) => {
              const selected = node.id === selectedNodeId;
              return (
                <Pressable
                  key={node.id}
                  accessibilityRole="button"
                  accessibilityLabel={`选择${node.muscle}${node.part}`}
                  accessibilityState={{ selected }}
                  onPress={() => chooseNode(node.id)}
                  style={[styles.muscleOption, selected && styles.muscleOptionActive]}
                >
                  <View style={[styles.muscleOptionDot, { backgroundColor: node.color ?? colors.muscle }]} />
                  <View style={styles.muscleOptionCopy}>
                    <Text style={[styles.muscleOptionName, selected && styles.muscleOptionNameActive]}>{node.muscle} · {node.part}</Text>
                    <Text style={styles.muscleOptionMeta}>{node.nameEn} · {node.side === 'front' ? '正面' : node.side === 'back' ? '背面' : '正面 / 背面'}</Text>
                  </View>
                  <ChevronRight color={selected ? colors.primary : colors.textTertiary} size={18} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.regionGrid}>
            {regions.map((region) => {
              const muscleCount = region === '全身' ? anatomyNodes.length : anatomyNodes.filter((node) => node.region === region).length;
              return (
                <Pressable
                  key={region}
                  accessibilityRole="button"
                  accessibilityLabel={`查看${region}肌肉`}
                  onPress={() => setRegionDrilldown(region)}
                  style={[styles.panelOption, selectedNode.region === region && styles.panelOptionActive]}
                >
                  <Text style={[styles.panelOptionText, selectedNode.region === region && styles.panelOptionTextActive]}>{region}</Text>
                  <Text style={styles.panelOptionCount}>{muscleCount} 个</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </Panel>

      <Panel visible={panel === 'locate'} title="快速定位" onClose={() => setPanel(null)}>
        <Text style={styles.panelHint}>按训练目标定位常用肌群</Text>
        <View style={styles.regionGrid}>{anatomyNodes.map((node) => <Pressable key={node.id} accessibilityRole="button" accessibilityLabel={`定位${node.muscle}${node.part}`} onPress={() => chooseNode(node.id)} style={styles.locateOption}><Text style={styles.locateTitle}>{node.muscle}</Text><Text style={styles.locateMeta}>{node.region} · {node.part}</Text></Pressable>)}</View>
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

function Panel({ visible, title, children, onBack, onClose }: { visible: boolean; title: string; children: React.ReactNode; onBack?: () => void; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          <View style={styles.panelHeader}>
            <View style={styles.panelHeading}>
              {onBack ? <IconButton icon={ChevronLeft} label="返回身体区域" size={40} onPress={onBack} /> : null}
              <Text style={styles.panelTitle}>{title}</Text>
            </View>
            <IconButton icon={X} label="关闭" size={40} onPress={onClose} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelBody}>{children}</ScrollView>
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
  modelWrap: { width: '84%', aspectRatio: 396 / 365, position: 'relative' },
  modelPressable: { width: '100%', height: '100%' },
  modelImage: { width: '100%', height: '100%' },
  moduleOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%' },
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
  panel: { width: '100%', maxWidth: 430, maxHeight: '82%', alignSelf: 'center', borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.sheet, padding: spacing.x5, paddingBottom: 40, gap: spacing.x4 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelHeading: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.x2 },
  panelBody: { gap: spacing.x4, paddingBottom: spacing.x2 },
  panelTitle: { ...typography.sectionTitle, color: colors.text, flexShrink: 1 },
  panelHint: { ...typography.body, color: colors.textSecondary },
  panelLabel: { ...typography.body, color: colors.text, fontWeight: '700', marginTop: spacing.x2 },
  regionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2 },
  panelOption: { width: '31%', minHeight: 58, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.x2 },
  panelOptionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  panelOptionText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', textAlign: 'center' },
  panelOptionTextActive: { color: colors.primary },
  panelOptionCount: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  muscleList: { gap: spacing.x2 },
  muscleOption: { minHeight: 66, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, paddingHorizontal: spacing.x3, flexDirection: 'row', alignItems: 'center', gap: spacing.x3 },
  muscleOptionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  muscleOptionDot: { width: 10, height: 10, borderRadius: radius.pill },
  muscleOptionCopy: { flex: 1, minWidth: 0 },
  muscleOptionName: { ...typography.listTitle, color: colors.text },
  muscleOptionNameActive: { color: colors.primary },
  muscleOptionMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 3 },
  locateOption: { width: '48%', minHeight: 64, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, justifyContent: 'center', padding: spacing.x3 },
  locateTitle: { ...typography.listTitle, color: colors.text },
  locateMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  layerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2 },
});
