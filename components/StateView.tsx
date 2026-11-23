// components/StateView.tsx
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Spacing, Typography } from '../constants/theme';
import { useAppTheme } from '../src/store/themeStore';

export type StateViewVariant = 'empty' | 'loading' | 'error';

interface StateViewProps {
  variant?: StateViewVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StateView({
  variant = 'empty',
  icon = 'alert-circle-outline',
  title,
  description,
  actionLabel,
  onAction,
}: StateViewProps) {
  const { colors } = useAppTheme();

  const accentColor =
    variant === 'error'
      ? colors.danger
      : variant === 'loading'
      ? colors.purpleAi
      : colors.cyanPrimary;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.line },
      ]}
    >
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: `${accentColor}1A`, borderColor: `${accentColor}44` },
        ]}
      >
        {variant === 'loading' ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : (
          <Ionicons name={icon} size={28} color={accentColor} />
        )}
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>

      {actionLabel && onAction && variant !== 'loading' && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: accentColor }]}
          activeOpacity={0.85}
          onPress={onAction}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: Spacing.gutter * 1.5,
    paddingHorizontal: Spacing.gutter,
    marginVertical: Spacing.grid * 2,
    gap: 10,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: Spacing.radiusPill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    ...Typography.bodyStrong,
    fontSize: 17,
    textAlign: 'center',
  },
  description: {
    ...Typography.label,
    textAlign: 'center',
    maxWidth: 280,
  },
  actionBtn: {
    marginTop: 8,
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});