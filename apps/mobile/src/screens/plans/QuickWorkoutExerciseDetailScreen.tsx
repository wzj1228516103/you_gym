import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExerciseDetailContent } from '../anatomy/ExerciseDetailScreen';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'ExerciseDetail'>;

export function QuickWorkoutExerciseDetailScreen({ navigation, route }: Props) {
  return <ExerciseDetailContent exerciseId={route.params.exerciseId} onBack={navigation.goBack} />;
}
