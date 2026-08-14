import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { anatomyNodes, exercises } from '../data/mockData';

type AppStateValue = {
  selectedNodeId: string;
  setSelectedNodeId: (id: string) => void;
  todayExerciseIds: string[];
  addExercise: (id: string) => void;
  selectedNode: (typeof anatomyNodes)[number];
  todayExercises: typeof exercises;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [selectedNodeId, setSelectedNodeId] = useState(anatomyNodes[0].id);
  const [todayExerciseIds, setTodayExerciseIds] = useState(['smith-squat', 'leg-press']);
  const selectedNode = anatomyNodes.find((node) => node.id === selectedNodeId) ?? anatomyNodes[0];
  const todayExercises = exercises.filter((exercise) => todayExerciseIds.includes(exercise.id));

  const value = useMemo<AppStateValue>(() => ({
    selectedNodeId,
    setSelectedNodeId,
    todayExerciseIds,
    addExercise: (id) => setTodayExerciseIds((current) => current.includes(id) ? current : [...current, id]),
    selectedNode,
    todayExercises,
  }), [selectedNode, selectedNodeId, todayExerciseIds, todayExercises]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
