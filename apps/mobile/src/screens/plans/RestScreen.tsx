import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BellRing, Minus, Plus, Volume2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppScreen, Card, PrimaryButton, ScreenHeader } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { PlanStackParamList } from '../../types';

type Props = NativeStackScreenProps<PlanStackParamList, 'Rest'>;

export function RestScreen({ navigation, route }: Props) {
  const total = route.params.seconds;
  const [seconds, setSeconds] = useState(total);
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return (
    <AppScreen scroll={false} contentStyle={styles.content}>
      <ScreenHeader title="休息中" onBack={navigation.goBack} />
      <View style={styles.timerWrap}>
        <Svg width={260} height={260} viewBox="0 0 260 260">
          <Circle cx="130" cy="130" r="112" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
          <Circle cx="130" cy="130" r="112" stroke={colors.primary} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 112}`} strokeDashoffset={`${2 * Math.PI * 112 * (1 - seconds / total)}`} transform="rotate(-90 130 130)" />
        </Svg>
        <Text style={styles.timer}>{formatTime(seconds)}</Text>
      </View>
      <Text style={styles.next}>下一组开始</Text>
      <Text style={styles.nextMeta}>第 2 组 · 80kg × 8–12 次</Text>
      <View style={styles.adjustRow}><Pressable onPress={() => setSeconds((value) => Math.max(0, value - 10))} style={styles.adjust}><Minus size={20} color={colors.text} /><Text style={styles.adjustText}>10s</Text></Pressable><Pressable onPress={() => setSeconds((value) => value + 10)} style={styles.adjust}><Plus size={20} color={colors.text} /><Text style={styles.adjustText}>10s</Text></Pressable></View>
      <Card style={styles.soundCard}><Volume2 size={20} color={colors.primary} /><View style={styles.soundCopy}><Text style={styles.soundTitle}>休息结束提示</Text><Text style={styles.soundMeta}>脉冲音效 2 · 震动开启</Text></View><BellRing size={20} color={colors.textSecondary} /></Card>
      <PrimaryButton label="跳过休息" onPress={navigation.goBack} style={styles.skip} />
    </AppScreen>
  );
}

function formatTime(value: number) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingBottom: spacing.x6 },
  timerWrap: { width: 270, height: 270, alignItems: 'center', justifyContent: 'center', marginTop: spacing.x6 },
  timer: { position: 'absolute', ...typography.pageTitle, fontSize: 52, lineHeight: 60, color: colors.text, fontVariant: ['tabular-nums'] },
  next: { ...typography.cardTitle, color: colors.text, marginTop: spacing.x5 },
  nextMeta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.x1 },
  adjustRow: { flexDirection: 'row', gap: spacing.x4, marginTop: spacing.x5 },
  adjust: { width: 92, height: 46, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.control, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.x1 },
  adjustText: { ...typography.support, color: colors.text },
  soundCard: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginTop: spacing.x6 },
  soundCopy: { flex: 1 },
  soundTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  soundMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  skip: { width: '100%', marginTop: 'auto' },
});
