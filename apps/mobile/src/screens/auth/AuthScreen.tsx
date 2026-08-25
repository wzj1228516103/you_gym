import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dumbbell, MessageCircleMore, ShieldCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen, PrimaryButton, SegmentedControl } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { RootStackParamList } from '../../types';
import { sendSmsCode } from '../../services/api';
import { useAuthState } from '../../state/AuthState';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const canSubmit = phone.replace(/\D/g, '').length === 11;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { continueAsGuest } = useAuthState();

  async function requestCode() {
    setLoading(true);
    setError('');
    try {
      const purpose = mode === 'login' ? 'LOGIN' : 'REGISTER';
      const result = await sendSmsCode(`+86${phone.replace(/\D/g, '')}`, purpose);
      navigation.navigate('Otp', { phone, purpose, mockMode: result.mockMode });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '验证码发送失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen keyboard contentStyle={styles.content}>
      <View style={styles.brandBlock}>
        <View style={styles.logoMark}><Dumbbell size={28} color={colors.textInverse} strokeWidth={2.4} /></View>
        <Text style={styles.brand}>YOU <Text style={styles.brandAccent}>GYM</Text></Text>
        <Text style={styles.slogan}>选择目标，看懂肌肉，完成训练，持续记录</Text>
      </View>

      <SegmentedControl
        options={[{ label: '登录', value: 'login' }, { label: '注册', value: 'register' }]}
        value={mode}
        onChange={setMode}
      />

      <View style={styles.phoneField}>
        <Text style={styles.country}>+86</Text>
        <View style={styles.divider} />
        <TextInput
          accessibilityLabel="手机号"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="输入手机号"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
        />
      </View>

      <PrimaryButton label={loading ? '发送中…' : '获取验证码'} disabled={!canSubmit || loading} onPress={() => void requestCode()} />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.agreementRow}>
        <ShieldCheck size={15} color={colors.primary} />
        <Text style={styles.agreement}>继续即表示同意《用户协议》和《隐私政策》</Text>
      </View>

      <View style={styles.previewBlock}>
        <View style={styles.previewLine} />
        <Text style={styles.previewTitle}>先看看产品</Text>
        <View style={styles.previewLine} />
      </View>
      <Pressable accessibilityRole="button" onPress={() => { continueAsGuest(); navigation.replace('Main'); }} style={styles.previewButton}>
        <MessageCircleMore size={22} color={colors.primary} />
        <Text style={styles.previewButtonText}>游客预览</Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', paddingBottom: spacing.x8, gap: spacing.x4 },
  brandBlock: { alignItems: 'center', marginBottom: spacing.x6 },
  logoMark: { width: 56, height: 56, borderRadius: radius.card, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.x4 },
  brand: { ...typography.pageTitle, color: colors.text },
  brandAccent: { color: colors.primary },
  slogan: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.x2, maxWidth: 280 },
  phoneField: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, paddingHorizontal: spacing.x4 },
  country: { ...typography.body, color: colors.text },
  divider: { width: 1, height: 22, backgroundColor: colors.borderStrong, marginHorizontal: spacing.x3 },
  input: { flex: 1, minHeight: 50, ...typography.body, color: colors.text, outlineStyle: 'none' } as never,
  agreementRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.x2 },
  agreement: { ...typography.caption, color: colors.textSecondary },
  previewBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.x3, marginTop: spacing.x5 },
  previewLine: { flex: 1, height: 1, backgroundColor: colors.divider },
  previewTitle: { ...typography.caption, color: colors.textTertiary },
  previewButton: { alignSelf: 'center', minWidth: 112, height: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primaryBorder, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.x2 },
  previewButtonText: { ...typography.support, color: colors.primary, fontWeight: '700' },
  error: { ...typography.caption, color: colors.muscle, textAlign: 'center' },
});
