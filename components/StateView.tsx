// components/StateView.tsx
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

interface StateViewProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function StateView({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: StateViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <Ionicons name={icon} size={28} color={Colors.cyanPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onAction}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.gutter,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.gutter,
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.grid * 2,
  },
  description: {
    ...Typography.label,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.gutter * 1.5,
  },
  button: {
    minHeight: Spacing.minTapTarget,
    paddingHorizontal: Spacing.gutter * 1.25,
    borderRadius: Spacing.radiusMd,
    backgroundColor: Colors.cyanPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...Typography.bodyStrong,
    color: Colors.base,
  },
});