// app/(tabs)/more.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
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
      {/* Top Centered Brand Header */}
      <View style={styles.topBrandBar}>
        <Text style={styles.brandTitle}>BizSphere</Text>
      </View>

      {/* White Divider */}
      <View style={styles.whiteDivider} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>More</Text>
          <Text style={styles.sectionSubtitle}>
            Settings, accessibility & workspace
          </Text>
        </View>

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
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
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
                    activeOpacity={0.85}
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
        <Text style={styles.sectionLabel}>ACCESSIBILITY</Text>
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
        <Text style={styles.sectionLabel}>ACCOUNT & COMPLIANCE</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} activeOpacity={0.85}>
            <Text style={styles.rowLabel}>Security & devices</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} activeOpacity={0.85}>
            <Text style={styles.rowLabel}>Export my data</Text>
            <Ionicons name="download-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const topCameraOffset =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 14 : 18;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.base },
  topBrandBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingTop: topCameraOffset,
    paddingBottom: Spacing.grid * 2.5,
  },
  brandTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  whiteDivider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.gutter * 2,
    gap: Spacing.cardGap,
  },
  sectionHeader: {
    paddingTop: Spacing.grid * 2.5,
    paddingBottom: Spacing.grid,
  },
  sectionTitle: { ...Typography.title, color: Colors.textPrimary },
  sectionSubtitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.grid * 2,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
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