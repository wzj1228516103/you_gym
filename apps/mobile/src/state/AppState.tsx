import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { anatomyNodes as localAnatomyNodes, exercises } from '../data/mockData';
import { mergeAnatomyNodes } from '../data/anatomyMerge';
import { fetchAnatomyTree } from '../services/api';
import type { AnatomyNode, Exercise } from '../types';

type AppStateValue = {
  selectedNodeId: string;
  setSelectedNodeId: (id: string) => void;
  todayExerciseIds: string[];
  addExercise: (id: string) => void;
  selectedNode: AnatomyNode;
  anatomyNodes: AnatomyNode[];
  exercises: Exercise[];
  anatomySynced: boolean;
  todayExercises: Exercise[];
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [anatomyNodes, setAnatomyNodes] = useState(localAnatomyNodes);
  const [anatomySynced, setAnatomySynced] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(localAnatomyNodes[0].id);
  const [todayExerciseIds, setTodayExerciseIds] = useState(['smith-squat', 'leg-press']);
  const selectedNode = anatomyNodes.find((node) => node.id === selectedNodeId) ?? anatomyNodes[0];
  const todayExercises = exercises.filter((exercise) => todayExerciseIds.includes(exercise.id));

  useEffect(() => {
    let active = true;
    void fetchAnatomyTree().then(({ items }) => {
      if (!active) return;
      const merged = mergeAnatomyNodes(localAnatomyNodes, items);
      if (merged.length) {
        setAnatomyNodes(merged);
        setSelectedNodeId((current) => merged.some((node) => node.id === current) ? current : merged[0].id);
        setAnatomySynced(true);
      }
    }).catch(() => { if (active) setAnatomySynced(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo<AppStateValue>(() => ({
    selectedNodeId,
    setSelectedNodeId,
    todayExerciseIds,
    addExercise: (id) => setTodayExerciseIds((current) => current.includes(id) ? current : [...current, id]),
    selectedNode,
    anatomyNodes,
    exercises,
    anatomySynced,
    todayExercises,
  }), [anatomyNodes, anatomySynced, selectedNode, selectedNodeId, todayExerciseIds, todayExercises]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
