import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  background: '#000000',
  sheet: '#0A0A0D',
  card: '#17171B',
  control: '#1B1B1E',
  nav: '#1A1A1D',
  primary: '#B3FF00',
  primarySoft: 'rgba(179, 255, 0, 0.14)',
  primaryBorder: 'rgba(179, 255, 0, 0.34)',
  muscle: '#FF2D55',
  muscleWarm: '#FF4B3E',
  cyan: '#35E6E8',
  success: '#32D74B',
  warning: '#FFD60A',
  error: '#FF453A',
  info: '#64D2FF',
  text: '#FFFFFF',
  textSecondary: '#A3A3AD',
  textTertiary: '#777781',
  textInverse: '#050505',
  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',
  divider: 'rgba(255, 255, 255, 0.08)',
  anatomyStage: '#111216',
  anatomyBase: '#9AA8BB',
} as const;

export const spacing = {
  x1: 4,
  x2: 8,
  x3: 12,
  x4: 16,
  x5: 20,
  x6: 24,
  x8: 32,
  x10: 40,
} as const;

export const radius = {
  small: 6,
  control: 8,
  card: 8,
  sheet: 24,
  pill: 999,
} as const;

const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif', web: 'Noto Sans SC, Noto Sans, sans-serif' });

export const typography: Record<string, TextStyle> = {
  pageTitle: { fontFamily, fontSize: 30, lineHeight: 38, fontWeight: '700', letterSpacing: 0 },
  sectionTitle: { fontFamily, fontSize: 20, lineHeight: 28, fontWeight: '700', letterSpacing: 0 },
  cardTitle: { fontFamily, fontSize: 17, lineHeight: 23, fontWeight: '700', letterSpacing: 0 },
  listTitle: { fontFamily, fontSize: 15, lineHeight: 21, fontWeight: '700', letterSpacing: 0 },
  button: { fontFamily, fontSize: 15, lineHeight: 20, fontWeight: '700', letterSpacing: 0 },
  body: { fontFamily, fontSize: 14, lineHeight: 21, fontWeight: '500', letterSpacing: 0 },
  support: { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: '500', letterSpacing: 0 },
  caption: { fontFamily, fontSize: 11, lineHeight: 16, fontWeight: '500', letterSpacing: 0 },
  eyebrow: { fontFamily, fontSize: 10, lineHeight: 15, fontWeight: '700', letterSpacing: 0 },
};

export const shadows: Record<string, ViewStyle> = {
  card: Platform.select({
    web: { boxShadow: '0 12px 28px rgba(0,0,0,0.42)' } as ViewStyle,
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.42, shadowRadius: 14, elevation: 8 },
  }) as ViewStyle,
};
