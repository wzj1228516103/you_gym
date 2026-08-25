import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { ArrowLeft, ChevronRight, LucideProps } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing, typography } from '../theme';

export function AppScreen({ children, scroll = true, contentStyle, keyboard = false }: PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  keyboard?: boolean;
}>) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.screenContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : <View style={[styles.screenContent, styles.flex, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {keyboard ? (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {content}
        </KeyboardAvoidingView>
      ) : content}
    </SafeAreaView>
  );
}

export function ScreenHeader({ title, eyebrow, onBack, actions }: {
  title: string;
  eyebrow?: string;
  onBack?: () => void;
  actions?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {onBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={onBack} style={styles.headerBack}>
            <ArrowLeft color={colors.text} size={22} />
          </Pressable>
        ) : null}
        <View style={styles.headerCopy}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        </View>
      </View>
      {actions ? <View style={styles.headerActions}>{actions}</View> : null}
    </View>
  );
}

export function IconButton({ icon: Icon, label, onPress, active = false, size = 46 }: {
  icon: ComponentType<LucideProps>;
  label: string;
  onPress?: () => void;
  active?: boolean;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { width: size, height: size }, active && styles.iconButtonActive, pressed && styles.pressed]}
    >
      <Icon color={active ? colors.primary : colors.text} size={21} strokeWidth={2} />
    </Pressable>
  );
}

export function Card({ children, style, onPress, accessibilityLabel }: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}>) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({ label, onPress, icon: Icon, disabled = false, style }: {
  label: string;
  onPress: () => void;
  icon?: ComponentType<LucideProps>;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, style, disabled && styles.disabled, pressed && styles.primaryPressed]}
    >
      {Icon ? <Icon color={colors.textInverse} size={19} strokeWidth={2.4} /> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, icon: Icon, style }: {
  label: string;
  onPress: () => void;
  icon?: ComponentType<LucideProps>;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondaryButton, style, pressed && styles.pressed]}>
      {Icon ? <Icon color={colors.text} size={18} /> : null}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Pressable onPress={onAction} hitSlop={8}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function Chip({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({ options, value, onChange }: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} accessibilityRole="button" accessibilityLabel={option.label} accessibilityState={{ selected: active }} onPress={() => onChange(option.value)} style={[styles.segment, active && styles.segmentActive]}>
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressBar({ value, color = colors.primary }: { value: number; color?: string }) {
  return (
    <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <View style={[styles.progressValue, { width: `${Math.min(100, Math.max(0, value * 100))}%`, backgroundColor: color }]} />
    </View>
  );
}

export function SettingRow({ icon: Icon, title, value, onPress, toggle, enabled, onToggle }: {
  icon?: ComponentType<LucideProps>;
  title: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  enabled?: boolean;
  onToggle?: (value: boolean) => void;
}) {
  return (
    <Pressable disabled={!onPress && !toggle} onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
      <View style={styles.settingLeft}>
        {Icon ? <Icon size={18} color={colors.textSecondary} /> : null}
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {toggle ? (
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#3A3A40', true: colors.primary }}
          thumbColor={colors.text}
          ios_backgroundColor="#3A3A40"
        />
      ) : (
        <View style={styles.settingValueWrap}>
          {value ? <Text style={styles.settingValue}>{value}</Text> : null}
          {onPress ? <ChevronRight size={17} color={colors.textTertiary} /> : null}
        </View>
      )}
    </Pressable>
  );
}

export function Metric({ label, value, accent = false, valueStyle }: { label: string; value: string; accent?: boolean; valueStyle?: StyleProp<TextStyle> }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, accent && styles.metricAccent, valueStyle]}>{value}</Text>
    </View>
  );
}

export function Tag({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'primary' | 'muscle' }>) {
  return (
    <View style={[styles.tag, tone === 'primary' && styles.tagPrimary, tone === 'muscle' && styles.tagMuscle]}>
      <Text style={[styles.tagText, tone === 'primary' && styles.tagTextPrimary, tone === 'muscle' && styles.tagTextMuscle]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: colors.background },
  screenContent: { flexGrow: 1, paddingHorizontal: spacing.x5, paddingTop: spacing.x3, paddingBottom: 116, backgroundColor: colors.background },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.x4 },
  headerLeft: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
  headerBack: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { ...typography.eyebrow, color: colors.primary, marginBottom: 2 },
  headerTitle: { ...typography.sectionTitle, color: colors.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.x2 },
  iconButton: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.control, borderWidth: 1, borderColor: colors.borderStrong },
  iconButtonActive: { borderColor: colors.primaryBorder, backgroundColor: colors.primarySoft },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.x4, ...shadows.card },
  primaryButton: { minHeight: 50, borderRadius: radius.control, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.x2, paddingHorizontal: spacing.x5 },
  primaryButtonText: { ...typography.button, color: colors.textInverse },
  primaryPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  secondaryButton: { minHeight: 48, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.control, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.x2, paddingHorizontal: spacing.x4 },
  secondaryButtonText: { ...typography.button, color: colors.text },
  disabled: { opacity: 0.36 },
  pressed: { opacity: 0.78 },
  sectionHeader: { minHeight: 44, marginTop: spacing.x5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typography.cardTitle, color: colors.text },
  sectionAction: { ...typography.support, color: colors.primary, fontWeight: '700' },
  chip: { minHeight: 38, paddingHorizontal: spacing.x3, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.control, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  chipTextActive: { color: colors.primary },
  segmented: { flexDirection: 'row', gap: spacing.x1, borderRadius: radius.control, backgroundColor: colors.control, padding: spacing.x1, borderWidth: 1, borderColor: colors.border },
  segment: { minHeight: 38, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.small },
  segmentActive: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder },
  segmentText: { ...typography.support, color: colors.textTertiary, fontWeight: '700' },
  segmentTextActive: { color: colors.primary },
  progressTrack: { height: 5, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressValue: { height: '100%', borderRadius: radius.pill },
  settingRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.x3, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  settingLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.x3 },
  settingTitle: { ...typography.body, color: colors.text },
  settingValueWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.x1 },
  settingValue: { ...typography.caption, color: colors.textSecondary, maxWidth: 160, textAlign: 'right' },
  metric: { flex: 1, alignItems: 'center', justifyContent: 'center', minWidth: 0 },
  metricLabel: { ...typography.caption, color: colors.textSecondary },
  metricValue: { ...typography.cardTitle, color: colors.text, marginTop: spacing.x1 },
  metricAccent: { color: colors.primary },
  tag: { alignSelf: 'flex-start', paddingHorizontal: spacing.x2, paddingVertical: spacing.x1, borderRadius: radius.small, backgroundColor: 'rgba(255,255,255,0.06)' },
  tagPrimary: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder },
  tagMuscle: { backgroundColor: 'rgba(255,45,85,0.12)', borderWidth: 1, borderColor: 'rgba(255,45,85,0.30)' },
  tagText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  tagTextPrimary: { color: colors.primary },
  tagTextMuscle: { color: '#FF6B8B' },
});
