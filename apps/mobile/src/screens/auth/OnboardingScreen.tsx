import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, Dumbbell, Goal, Home, MapPin, PersonStanding, Scale, Trophy } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen, Card, Chip, PrimaryButton, SecondaryButton, SegmentedControl } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { RootStackParamList } from '../../types';
import { useAuthState } from '../../state/AuthState';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
type GoalValue = '减脂' | '增肌' | '维持' | '提升体能';

const stepCopy = [
  ['基础身体数据', '帮助我们为你估算训练和营养目标'],
  ['你的训练目标', '选择当前最重要的主要目标'],
  ['你的训练经验', '用于调整动作难度和训练容量'],
  ['常用场地与器械', '可多选，推荐会优先使用可用条件'],
  ['准备就绪', '保存资料后即可从数据库计划库选择训练'],
] as const;

export function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<'male' | 'female' | 'private'>('male');
  const [birthYear, setBirthYear] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [goal, setGoal] = useState<GoalValue>('增肌');
  const [level, setLevel] = useState('新手');
  const [frequency, setFrequency] = useState('4次');
  const [venue, setVenue] = useState('健身房');
  const [equipment, setEquipment] = useState(['哑铃', '杠铃']);
  const [saving, setSaving] = useState(false);
  const { updateProfile, guest } = useAuthState();

  const next = async () => {
    if (step !== 4) { setStep((current) => current + 1); return; }
    if (!guest) {
      setSaving(true);
      try {
        await updateProfile({
          gender,
          birthYear: optionalNumber(birthYear),
          heightCm: optionalNumber(heightCm),
          weightKg: optionalNumber(weightKg),
          bodyFatPct: optionalNumber(bodyFatPct),
          goal,
          experienceLevel: level,
          weeklyFrequency: frequency,
          venue,
          equipment,
        });
      }
      finally { setSaving(false); }
    }
    navigation.replace('Main');
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.stepRow}>
        {stepCopy.map((_, index) => <View key={index} style={[styles.stepDot, index <= step && styles.stepDotActive]} />)}
      </View>
      <Text style={styles.title}>{stepCopy[step][0]}</Text>
      <Text style={styles.subtitle}>{stepCopy[step][1]}</Text>

      <View style={styles.body}>
        {step === 0 ? (
          <>
            <SegmentedControl options={[{ label: '男性', value: 'male' }, { label: '女性', value: 'female' }, { label: '暂不公开', value: 'private' }]} value={gender} onChange={setGender} />
            <DataInputRow label="出生年份" value={birthYear} placeholder="例如 1995" onChangeText={setBirthYear} />
            <DataInputRow label="身高" value={heightCm} placeholder="cm" onChangeText={setHeightCm} />
            <DataInputRow label="体重" value={weightKg} placeholder="kg" onChangeText={setWeightKg} accent />
            <DataInputRow label="体脂率（可选）" value={bodyFatPct} placeholder="%" onChangeText={setBodyFatPct} />
          </>
        ) : null}

        {step === 1 ? (
          <View style={styles.optionList}>
            {([
              ['减脂', '降低体脂，改善体型', Goal], ['增肌', '增加肌肉，改善围度', Dumbbell],
              ['维持', '保持当前体能状态', Scale], ['提升体能', '提高力量、耐力与功能', Trophy],
            ] as const).map(([label, description, Icon]) => (
              <OptionCard key={label} title={label} description={description} active={goal === label} onPress={() => setGoal(label)} icon={Icon} />
            ))}
          </View>
        ) : null}

        {step === 2 ? (
          <>
            <View style={styles.optionList}>
              {['新手', '初级', '中级', '高级'].map((item) => <OptionCard key={item} title={item} description={item === '新手' ? '0–6 个月' : item === '初级' ? '6–24 个月' : item === '中级' ? '2–5 年' : '5 年以上'} active={level === item} onPress={() => setLevel(item)} icon={PersonStanding} compact />)}
            </View>
            <Text style={styles.label}>每周可训练频率</Text>
            <View style={styles.chipRow}>{['2–3次', '4次', '5次', '6+次'].map((item) => <Chip key={item} label={item} active={frequency === item} onPress={() => setFrequency(item)} />)}</View>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <View style={styles.optionList}>
              <OptionCard title="健身房" description="器械完整" active={venue === '健身房'} onPress={() => setVenue('健身房')} icon={Dumbbell} compact />
              <OptionCard title="家庭" description="安静高效" active={venue === '家庭'} onPress={() => setVenue('家庭')} icon={Home} compact />
              <OptionCard title="户外" description="利用公共空间" active={venue === '户外'} onPress={() => setVenue('户外')} icon={MapPin} compact />
            </View>
            <Text style={styles.label}>可用器械（可多选）</Text>
            <View style={styles.chipRow}>{['自重', '哑铃', '杠铃', '壶铃', '弹力带', '器械'].map((item) => <Chip key={item} label={item} active={equipment.includes(item)} onPress={() => setEquipment((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} />)}</View>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <View style={styles.successIcon}><Check size={40} color={colors.textInverse} strokeWidth={3} /></View>
            <Card style={styles.recommendation}>
              <View style={styles.planImage}><Dumbbell size={32} color={colors.muscle} /></View>
              <View style={styles.planCopy}>
                <Text style={styles.planEyebrow}>训练资料</Text>
                <Text style={styles.planTitle}>{goal} · 每周 {frequency}</Text>
                <Text style={styles.planMeta}>{level} · {venue} · {equipment.length} 种可用器械</Text>
              </View>
            </Card>
            <Card style={styles.reasonCard}>
              <Text style={styles.reasonTitle}>推荐依据</Text>
              <Text style={styles.reason}>· 目标：{goal}</Text>
              <Text style={styles.reason}>· 经验：{level}</Text>
              <Text style={styles.reason}>· 场地：{venue}，每周 {frequency}</Text>
            </Card>
          </>
        ) : null}
      </View>

      <View style={styles.footer}>
        {step > 0 && step < 4 ? <SecondaryButton label="上一步" onPress={() => setStep((current) => current - 1)} style={styles.backButton} /> : null}
        <PrimaryButton label={saving ? '保存中…' : step === 4 ? '进入 YOU GYM' : '下一步'} disabled={saving} onPress={() => void next()} style={styles.nextButton} />
      </View>
    </AppScreen>
  );
}

function DataInputRow({ label, value, placeholder, onChangeText, accent = false }: { label: string; value: string; placeholder: string; onChangeText: (value: string) => void; accent?: boolean }) {
  return <View style={styles.dataRow}><Text style={styles.dataLabel}>{label}</Text><TextInput keyboardType="numeric" value={value} placeholder={placeholder} placeholderTextColor={colors.textTertiary} onChangeText={(next) => onChangeText(next.replace(/[^0-9.]/g, ''))} style={[styles.dataValue, accent && styles.dataAccent]} /></View>;
}

function optionalNumber(value: string) {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : null;
}

function OptionCard({ title, description, active, onPress, icon: Icon, compact = false }: { title: string; description: string; active: boolean; onPress: () => void; icon: typeof Goal; compact?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.option, compact && styles.optionCompact, active && styles.optionActive]}>
      <View style={[styles.optionIcon, active && styles.optionIconActive]}><Icon size={21} color={active ? colors.primary : colors.textSecondary} /></View>
      <View style={styles.optionCopy}><Text style={styles.optionTitle}>{title}</Text><Text style={styles.optionDescription}>{description}</Text></View>
      <View style={[styles.check, active && styles.checkActive]}>{active ? <Check size={14} color={colors.textInverse} strokeWidth={3} /> : null}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.x6 },
  stepRow: { flexDirection: 'row', gap: spacing.x2, marginBottom: spacing.x5 },
  stepDot: { flex: 1, height: 3, borderRadius: radius.pill, backgroundColor: colors.divider },
  stepDotActive: { backgroundColor: colors.primary },
  title: { ...typography.pageTitle, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.x2 },
  body: { flex: 1, marginTop: spacing.x6, gap: spacing.x3 },
  dataRow: { minHeight: 58, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.x4 },
  dataLabel: { ...typography.body, color: colors.textSecondary },
  dataValue: { minWidth: 110, ...typography.body, color: colors.text, textAlign: 'right', paddingVertical: spacing.x2 },
  dataAccent: { color: colors.primary, fontWeight: '700' },
  optionList: { gap: spacing.x2 },
  option: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: spacing.x3, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: spacing.x3 },
  optionCompact: { minHeight: 62 },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionIcon: { width: 42, height: 42, borderRadius: radius.control, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  optionIconActive: { backgroundColor: 'rgba(179,255,0,0.10)' },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: { ...typography.listTitle, color: colors.text },
  optionDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  check: { width: 22, height: 22, borderRadius: radius.small, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...typography.body, color: colors.text, fontWeight: '700', marginTop: spacing.x3 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2 },
  successIcon: { width: 82, height: 82, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.x4 },
  recommendation: { flexDirection: 'row', gap: spacing.x3 },
  planImage: { width: 72, height: 72, borderRadius: radius.card, backgroundColor: '#0F1013', alignItems: 'center', justifyContent: 'center' },
  planCopy: { flex: 1, justifyContent: 'center' },
  planEyebrow: { ...typography.eyebrow, color: colors.primary },
  planTitle: { ...typography.listTitle, color: colors.text, marginTop: spacing.x1 },
  planMeta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x1 },
  reasonCard: { gap: spacing.x2 },
  reasonTitle: { ...typography.listTitle, color: colors.text },
  reason: { ...typography.body, color: colors.textSecondary },
  footer: { flexDirection: 'row', gap: spacing.x3, marginTop: spacing.x6 },
  backButton: { flex: 0.42 },
  nextButton: { flex: 1 },
});
