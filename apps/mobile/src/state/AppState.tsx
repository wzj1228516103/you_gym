import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { anatomyNodes as localAnatomyNodes, exercises } from '../data/mockData';
import { mergeAnatomyNodes } from '../data/anatomyMerge';
import { translateExerciseName } from '../data/exerciseNameZh';
import { fetchAnatomyTree, fetchExerciseCatalog } from '../services/api';
import type { AnatomyNode, Exercise } from '../types';

type AppStateValue = {
  selectedNodeId: string;
  setSelectedNodeId: (id: string) => void;
  todayExerciseIds: string[];
  addExercise: (id: string) => void;
  replaceTodayExercises: (ids: string[]) => void;
  selectedNode: AnatomyNode;
  anatomyNodes: AnatomyNode[];
  exercises: Exercise[];
  anatomySynced: boolean;
  exerciseCatalogSynced: boolean;
  todayExercises: Exercise[];
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [anatomyNodes, setAnatomyNodes] = useState(localAnatomyNodes);
  const [anatomySynced, setAnatomySynced] = useState(false);
  const [exerciseCatalogSynced, setExerciseCatalogSynced] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(localAnatomyNodes[0].id);
  const [todayExerciseIds, setTodayExerciseIds] = useState<string[]>([]);
  const [catalogExercises, setCatalogExercises] = useState<Exercise[]>([]);
  const selectedNode = anatomyNodes.find((node) => node.id === selectedNodeId) ?? anatomyNodes[0];
  const activeExercises = exerciseCatalogSynced ? catalogExercises : exercises;
  const todayExercises = activeExercises.filter((exercise) => todayExerciseIds.includes(exercise.id));

  useEffect(() => {
    let active = true;
    void Promise.allSettled([fetchAnatomyTree(), fetchExerciseCatalog()]).then(([treeResult, catalogResult]) => {
      if (!active) return;
      if (treeResult.status === 'fulfilled') {
        const merged = mergeAnatomyNodes(localAnatomyNodes, treeResult.value.items);
        if (merged.length) {
          setAnatomyNodes(merged);
          setSelectedNodeId((current) => merged.some((node) => node.id === current) ? current : merged[0].id);
          setAnatomySynced(true);
        }
      }
      if (catalogResult.status === 'fulfilled') {
        const normalized = catalogResult.value.items.map(toExercise);
        if (normalized.length) {
          setCatalogExercises(normalized);
        } else {
          setCatalogExercises([]);
        }
        setExerciseCatalogSynced(true);
        setAnatomyNodes((current) => current.map((node) => ({
          ...node,
          exerciseIds: normalized.filter((exercise) => matchesAnatomyNode(exercise, node)).map((exercise) => exercise.id),
        })));
      }
    });
    return () => { active = false; };
  }, []);

  const value = useMemo<AppStateValue>(() => ({
    selectedNodeId,
    setSelectedNodeId,
    todayExerciseIds,
    addExercise: (id) => setTodayExerciseIds((current) => current.includes(id) ? current : [...current, id]),
    replaceTodayExercises: (ids) => setTodayExerciseIds(Array.from(new Set(ids))),
    selectedNode,
    anatomyNodes,
    exercises: activeExercises,
    anatomySynced,
    exerciseCatalogSynced,
    todayExercises,
  }), [activeExercises, anatomyNodes, anatomySynced, exerciseCatalogSynced, selectedNode, selectedNodeId, todayExerciseIds, todayExercises]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

function matchesAnatomyNode(exercise: Exercise, node: AnatomyNode) {
  const nodeId = node.id.toLowerCase();
  const targetCodes = (exercise.targetCodes ?? []).map((code) => code.toLowerCase());
  const aliases: Record<string, string[]> = {
    'pectoralis-major': ['muscle.pectoralis-major', 'muscle.chest', 'pectoralis-major', 'pectoralis', 'chest'],
    'serratus-anterior': ['muscle.serratus-anterior', 'serratus-anterior', 'serratus'],
    'latissimus-dorsi': ['muscle.latissimus-dorsi', 'latissimus-dorsi', 'latissimus', 'lats'],
    'erector-spinae': ['muscle.erector-spinae', 'erector-spinae', 'erector spinae', 'lower back'],
    'trapezius': ['muscle.trapezius', 'trapezius', 'traps'],
    'deltoid': ['muscle.deltoid', 'deltoid', 'delts', 'shoulders'],
    'biceps': ['muscle.biceps-brachii', 'muscle.biceps', 'biceps-brachii', 'biceps'],
    'triceps': ['muscle.triceps-brachii', 'muscle.triceps', 'triceps-brachii', 'triceps'],
    'forearm': ['muscle.forearm', 'forearm', 'wrist'],
    'rectus-abdominis': ['muscle.rectus-abdominis', 'rectus-abdominis', 'abs', 'abdominals'],
    'external-oblique': ['muscle.external-oblique', 'external-oblique', 'oblique', 'obliques'],
    'hip-flexor': ['muscle.hip-flexors', 'muscle.hip-flexor', 'hip-flexors', 'hip-flexor'],
    'gluteus-maximus': ['muscle.gluteus-maximus', 'gluteus-maximus', 'glutes'],
    'gluteus-medius': ['muscle.gluteus-medius', 'gluteus-medius'],
    'hamstrings': ['muscle.hamstrings', 'hamstrings'],
    'quadriceps': ['muscle.quadriceps', 'quadriceps', 'quads'],
    'vastus-lateralis': ['muscle.quadriceps', 'muscle.vastus-lateralis', 'quadriceps', 'quads'],
    'rectus-femoris': ['muscle.quadriceps', 'muscle.rectus-femoris', 'quadriceps', 'quads'],
    'adductors': ['muscle.adductors', 'adductors'],
    'tibialis-anterior': ['muscle.tibialis-anterior', 'tibialis-anterior', 'tibialis', 'shins'],
    'gastrocnemius': ['muscle.gastrocnemius', 'gastrocnemius', 'calves', 'calf'],
    'soleus': ['muscle.soleus', 'soleus', 'calves', 'calf'],
  };
  const aliasesForNode = Object.entries(aliases).find(([key]) => nodeId.includes(key))?.[1] ?? [nodeId, node.muscle.toLowerCase(), node.part.toLowerCase()];
  const codeMatches = targetCodes.some((code) => aliasesForNode.some((alias) => code === alias || code.startsWith(`${alias}.`) || alias.startsWith(`${code}.`)));
  if (codeMatches) return true;
  const searchableText = `${exercise.target ?? ''} ${exercise.name} ${exercise.nameEn}`.toLowerCase();
  return aliasesForNode.some((alias) => searchableText.includes(alias));
}

const legacyExerciseIds: Record<string, string> = {
  'ex-001-barbell-bench-press': 'barbell-bench-press',
  'ex-002-dumbbell-bench-press': 'dumbbell-bench-press',
  'ex-003-incline-dumbbell-bench-press': 'incline-dumbbell-press',
  'ex-004-parallel-bar-dip': 'parallel-bar-dip',
  'ex-005-pull-up': 'pull-up',
  'ex-006-lat-pulldown': 'lat-pulldown',
  'ex-007-seated-cable-row': 'seated-cable-row',
  'ex-008-deadlift': 'romanian-deadlift',
  'ex-009-squat': 'smith-squat',
  'ex-010-forward-lunge': 'forward-lunge',
  'ex-011-leg-press': 'leg-press',
  'ex-012-leg-curl': 'leg-curl',
  'ex-013-standing-shoulder-press': 'dumbbell-shoulder-press',
  'ex-014-lateral-raise': 'lateral-raise',
  'ex-015-biceps-curl': 'biceps-curl',
  'ex-016-supine-crunch': 'supine-crunch',
  'ex-017-push-up': 'push-up',
};

function toExercise(item: import('../services/api').ExerciseCatalogItem): Exercise {
  const level = item.difficultyLevel === '高级' ? '中级' : item.difficultyLevel === '初级' ? '初级' : '新手';
  const resource = item.resources.find((candidate) => candidate.resourceType === 'CARD_IMAGE') ?? item.resources[0];
  return {
    id: legacyExerciseIds[item.id] ?? item.id,
    sourceId: item.id,
    name: translateExerciseName(item.nameZh || item.nameEn),
    nameEn: item.nameEn,
    target: item.targetMuscles.map((muscle) => muscleLabels[muscle] ?? muscle).join('、'),
    targetCodes: item.targetMuscles,
    equipment: item.equipment,
    location: item.location,
    level,
    rating: 0,
    sets: normalizeSetCount(item.recommendedSets),
    reps: item.recommendedReps ?? '8-12',
    restSeconds: item.restSecondsMin ?? 60,
    steps: item.stepLabels,
    mistakes: [],
    safety: item.sourceNote ?? '请根据自身情况选择可控重量，出现疼痛时停止动作。',
    mediaUrl: resource?.resourceUrl,
    mediaResources: item.resources.map((candidate) => ({
      id: candidate.id,
      resourceType: candidate.resourceType,
      viewLabel: candidate.viewLabel,
      resourceUrl: candidate.resourceUrl,
    })),
    sourceNote: item.sourceNote ?? undefined,
  };
}

function normalizeSetCount(value: string | number | null | undefined) {
  const numericValue = typeof value === 'number' ? value : Number(String(value ?? '').match(/\d+(?:\.\d+)?/)?.[0]);
  if (!Number.isFinite(numericValue)) return 3;
  return Math.max(1, Math.min(20, Math.round(numericValue)));
}

const muscleLabels: Record<string, string> = {
  'muscle.chest': '胸部',
  'muscle.chest.upper': '上胸',
  'muscle.chest.lower': '下胸',
  'muscle.pectoralis-major': '胸大肌',
  'muscle.pectoralis-major.upper': '上胸',
  'muscle.pectoralis-major.lower': '下胸',
  'muscle.serratus-anterior': '前锯肌',
  'muscle.back': '背部',
  'muscle.latissimus-dorsi': '背阔肌',
  'muscle.trapezius': '斜方肌',
  'muscle.trapezius.upper': '斜方肌上束',
  'muscle.trapezius.middle': '斜方肌中束',
  'muscle.trapezius.lower': '斜方肌下束',
  'muscle.erector-spinae': '竖脊肌',
  'muscle.deltoid': '三角肌',
  'muscle.deltoid.anterior': '三角肌前束',
  'muscle.deltoid.middle': '三角肌中束',
  'muscle.deltoid.posterior': '三角肌后束',
  'muscle.biceps': '肱二头肌',
  'muscle.biceps-brachii': '肱二头肌',
  'muscle.triceps': '肱三头肌',
  'muscle.triceps-brachii': '肱三头肌',
  'muscle.rectus-abdominis': '腹直肌',
  'muscle.gluteus-maximus': '臀大肌',
  'muscle.gluteus-medius': '臀中肌',
  'muscle.hamstrings': '腘绳肌',
  'muscle.quadriceps': '股四头肌',
  'muscle.adductors': '大腿内收肌',
  'muscle.tibialis-anterior': '胫骨前肌',
  'muscle.gastrocnemius': '腓肠肌',
  'muscle.soleus': '比目鱼肌',
  'muscle.core': '核心',
  'muscle.hip-flexors': '髋屈肌',
  'muscle.external-oblique': '腹外斜肌',
  'muscle.ankle-stabilizers': '踝关节稳定肌',
  'muscle.shoulders': '肩部',
  'dataset.serratus-anterior': '前锯肌',
  'dataset.obliques': '腹斜肌',
  'dataset.hip-flexors': '髋屈肌',
  'dataset.ankle-stabilizers': '踝关节稳定肌',
  'dataset.shoulders': '肩部',
  'dataset.erector-spinae': '竖脊肌',
  'dataset.gluteus-medius': '臀中肌',
  'dataset.piriformis': '梨状肌',
};

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
