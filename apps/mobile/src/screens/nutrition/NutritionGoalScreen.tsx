import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Target, Trash2 } from 'lucide-react-native';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen, Card, PrimaryButton, ScreenHeader, SecondaryButton } from '../../components/ui';
import { clearNutritionGoal, fetchNutritionGoal, NutritionGoal, saveNutritionGoal } from '../../services/api';
import { clearLocalNutritionGoal, loadLocalNutritionGoal, saveLocalNutritionGoal } from '../../services/nutritionGoals';
import { useAuthState } from '../../state/AuthState';
import { colors, radius, spacing, typography } from '../../theme';
import type { NutritionStackParamList } from '../../types';

type Props = NativeStackScreenProps<NutritionStackParamList, 'NutritionGoal'>;
type GoalForm = { calories: string; proteinG: string; carbohydratesG: string; fatG: string };

export function NutritionGoalScreen({ navigation }: Props) {
  const { token, guest } = useAuthState();
  const [form, setForm] = useState<GoalForm>({ calories: '', proteinG: '', carbohydratesG: '', fatG: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError('');
    setStatus('');
    const load = token
      ? fetchNutritionGoal(token).then((result) => result.goal)
      : loadLocalNutritionGoal();
    void load.then((goal) => {
      if (active) setForm(goal ? toForm(goal) : { calories: '', proteinG: '', carbohydratesG: '', fatG: '' });
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : '营养目标加载失败'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]));

  const update = (key: keyof GoalForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value.replace(/[^0-9.]/g, '') }));
    setError('');
    setStatus('');
  };

  const save = async () => {
    const values = toGoal(form);
    if (!values) { setError('请填写完整的每日营养目标，热量至少 500 kcal。'); return; }
    setSaving(true);
    setError('');
    setStatus('');
    try {
      if (token) await saveNutritionGoal(token, values);
      else await saveLocalNutritionGoal(values);
      setStatus(guest ? '已保存到本机。' : '已保存到账号。');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '营养目标保存失败');
    } finally {
      setSaving(false);
    }
  };

  const clear = () => {
    Alert.alert('清除营养目标', '清除后，饮食首页将不再计算目标进度。', [
      { text: '取消', style: 'cancel' },
      { text: '清除', style: 'destructive', onPress: () => { void doClear(); } },
    ]);
  };

  const doClear = async () => {
    setSaving(true);
    setError('');
    try {
      if (token) await clearNutritionGoal(token);
      else await clearLocalNutritionGoal();
      setForm({ calories: '', proteinG: '', carbohydratesG: '', fatG: '' });
      setStatus('营养目标已清除。');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '营养目标清除失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen keyboard>
      <ScreenHeader title="营养目标" onBack={navigation.goBack} />
      <Card style={styles.intro}>
        <View style={styles.icon}><Target size={24} color={colors.primary} /></View>
        <View style={styles.introCopy}>
          <Text style={styles.introTitle}>设定每日目标</Text>
          <Text style={styles.introBody}>{guest ? '游客目标仅保存在本机。' : '目标会同步到你的账号，并用于饮食进度计算。'}</Text>
        </View>
      </Card>
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>每日摄入</Text>
        <Text style={styles.hint}>填写你希望达到的每日营养目标，不是单餐份量。</Text>
        <GoalInput label="热量" unit="kcal" value={form.calories} onChange={(value) => update('calories', value)} />
        <GoalInput label="蛋白质" unit="g" value={form.proteinG} onChange={(value) => update('proteinG', value)} />
        <GoalInput label="碳水化合物" unit="g" value={form.carbohydratesG} onChange={(value) => update('carbohydratesG', value)} />
        <GoalInput label="脂肪" unit="g" value={form.fatG} onChange={(value) => update('fatG', value)} />
        <Text style={styles.note}>如有特殊健康情况，请先咨询专业人士，再设定饮食目标。</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {status ? <Text style={styles.status}>{status}</Text> : null}
        <PrimaryButton label={saving ? '保存中…' : '保存营养目标'} onPress={() => void save()} disabled={saving || loading} style={styles.saveButton} />
        <SecondaryButton label="清除目标" icon={Trash2} onPress={clear} style={styles.clearButton} />
      </Card>
    </AppScreen>
  );
}

function GoalInput({ label, unit, value, onChange }: { label: string; unit: string; value: string; onChange: (value: string) => void }) {
  return <View style={styles.inputRow}><Text style={styles.inputLabel}>{label}</Text><View style={styles.inputWrap}><TextInput value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="-" placeholderTextColor={colors.textTertiary} style={styles.input} /><Text style={styles.unit}>{unit}</Text></View></View>;
}

function toForm(goal: NutritionGoal): GoalForm { return { calories: String(goal.calories), proteinG: String(goal.proteinG), carbohydratesG: String(goal.carbohydratesG), fatG: String(goal.fatG) }; }
function toGoal(form: GoalForm): Omit<NutritionGoal, 'updatedAt'> | null {
  const values = { calories: Number(form.calories), proteinG: Number(form.proteinG), carbohydratesG: Number(form.carbohydratesG), fatG: Number(form.fatG) };
  return Number.isFinite(values.calories) && values.calories >= 500 && Object.entries(values).filter(([key]) => key !== 'calories').every(([, value]) => Number.isFinite(value) && value > 0) ? values : null;
}

const styles = StyleSheet.create({
  intro: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3 },
  icon: { width: 48, height: 48, borderRadius: radius.control, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  introCopy: { flex: 1, gap: spacing.x1 },
  introTitle: { ...typography.listTitle, color: colors.text },
  introBody: { ...typography.caption, color: colors.textSecondary },
  formCard: { marginTop: spacing.x4 },
  sectionTitle: { ...typography.cardTitle, color: colors.text },
  hint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x1, marginBottom: spacing.x4 },
  inputRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.x3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  inputLabel: { ...typography.body, color: colors.text, flex: 1 },
  inputWrap: { width: 142, minHeight: 42, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.control, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.x3 },
  input: { flex: 1, minHeight: 40, color: colors.text, ...typography.body, textAlign: 'right', outlineStyle: 'none' } as never,
  unit: { ...typography.caption, color: colors.textSecondary, marginLeft: spacing.x2 },
  note: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.x4 },
  error: { ...typography.caption, color: colors.error, marginTop: spacing.x3 },
  status: { ...typography.caption, color: colors.primary, marginTop: spacing.x3 },
  saveButton: { marginTop: spacing.x5 },
  clearButton: { marginTop: spacing.x2 },
});
