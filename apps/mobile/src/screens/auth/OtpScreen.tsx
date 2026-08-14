import { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen, PrimaryButton, ScreenHeader } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export function OtpScreen({ navigation, route }: Props) {
  const [code, setCode] = useState('');
  const digits = useMemo(() => Array.from({ length: 6 }, (_, index) => code[index] ?? ''), [code]);

  return (
    <AppScreen keyboard contentStyle={styles.content}>
      <ScreenHeader title="输入验证码" onBack={navigation.goBack} />
      <View style={styles.copy}>
        <Text style={styles.body}>验证码已发送至</Text>
        <Text style={styles.phone}>+86 {route.params.phone}</Text>
      </View>

      <View style={styles.codeWrap}>
        {digits.map((digit, index) => (
          <View key={index} style={[styles.codeCell, index === code.length && styles.codeCellActive]}>
            <Text style={styles.codeText}>{digit}</Text>
          </View>
        ))}
        <TextInput
          accessibilityLabel="六位验证码"
          autoFocus
          keyboardType="number-pad"
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
          style={styles.hiddenInput}
        />
      </View>

      <Text style={styles.resend}>53s 后可重新发送</Text>
      <PrimaryButton label="登录" disabled={code.length !== 6} onPress={() => navigation.replace('Onboarding')} />
      <Pressable accessibilityRole="button" onPress={() => setCode('123456')} hitSlop={12}>
        <Text style={styles.demoCode}>使用体验验证码 123456</Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.x5 },
  copy: { alignItems: 'center', marginTop: spacing.x8 },
  body: { ...typography.body, color: colors.textSecondary },
  phone: { ...typography.body, color: colors.text, marginTop: spacing.x1 },
  codeWrap: { position: 'relative', flexDirection: 'row', justifyContent: 'space-between', gap: spacing.x2 },
  codeCell: { flex: 1, aspectRatio: 0.82, maxWidth: 50, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  codeCellActive: { borderColor: colors.primary },
  codeText: { ...typography.sectionTitle, color: colors.text },
  hiddenInput: { ...StyleSheet.absoluteFill, opacity: 0 },
  resend: { ...typography.caption, color: colors.textTertiary, textAlign: 'center' },
  demoCode: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
