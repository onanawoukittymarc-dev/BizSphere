// app/(tabs)/more.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function MoreScreen() {
  const [themeMode, setThemeMode] = useState<'System' | 'Dark' | 'Light'>('Dark');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReaderHints, setScreenReaderHints] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>More</Text>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>ON</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>Ona N.</Text>
              <Text style={styles.profileEmail}>ona@kodinova-group.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </View>
        </View>

        {/* Appearance */}
        <Text style={styles.sectionTitle}>APPEARANCE</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Theme</Text>
            <View style={styles.segmented}>
              {(['System', 'Dark', 'Light'] as const).map((mode) => {
                const active = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.segBtn, active && styles.segBtnActive]}
                    onPress={() => setThemeMode(mode)}
                  >
                    <Text
                      style={[styles.segText, active && styles.segTextActive]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Text size</Text>
            <Text style={styles.rowValue}>Large</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Reduce motion</Text>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ false: Colors.line, true: Colors.cyanPrimary }}
            />
          </View>
        </View>

        {/* Accessibility */}
        <Text style={styles.sectionTitle}>ACCESSIBILITY</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Captions</Text>
            <Text style={styles.rowValueAccent}>Always on</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Screen reader hints</Text>
            <Switch
              value={screenReaderHints}
              onValueChange={setScreenReaderHints}
              trackColor={{ false: Colors.line, true: Colors.cyanPrimary }}
            />
          </View>
        </View>

        {/* Account & Compliance */}
        <Text style={styles.sectionTitle}>ACCOUNT & COMPLIANCE</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Security & devices</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Export my data</Text>
            <Ionicons name="download-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.base },
  content: { padding: Spacing.gutter, gap: Spacing.cardGap },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.grid,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.grid * 2,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.grid * 3 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radiusPill,
    backgroundColor: `${Colors.cyanPrimary}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.bodyStrong, color: Colors.cyanPrimary },
  profileName: { ...Typography.bodyStrong, color: Colors.textPrimary },
  profileEmail: { ...Typography.label, color: Colors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Spacing.minTapTarget,
  },
  rowLabel: { ...Typography.body, color: Colors.textPrimary },
  rowValue: { ...Typography.label, color: Colors.textSecondary },
  rowValueAccent: {
    ...Typography.label,
    color: Colors.cyanPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginVertical: Spacing.grid * 1.5,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    padding: 3,
  },
  segBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Spacing.radiusSm,
  },
  segBtnActive: { backgroundColor: Colors.cyanPrimary },
  segText: { ...Typography.caption, color: Colors.textSecondary },
  segTextActive: { color: Colors.base, fontWeight: '700' },
  badge: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeText: { ...Typography.caption, color: Colors.textPrimary },
});