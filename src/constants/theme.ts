// constants/theme.ts
export const Colors = {
  // Surfaces & text - dark
  base: '#080F13',
  surface: '#131A20',
  card: '#1E2538',
  line: '#263648',
  textPrimary: '#F1F5F9',
  textSecondary: '#8BB3C7',
  textTertiary: '#7CB6A3',

  // Accents
  cyanPrimary: '#22D3EE',
  blueInfo: '#3B82F6',
  purpleAi: '#A78BFA',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
};

export const Spacing = {
  grid: 4,
  gutter: 16,
  cardPadding: 16,
  cardGap: 12,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusPill: 999,
  minTapTarget: 44,
  bodyFloor: 16,
};

export const Typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};