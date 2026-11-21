// app/(tabs)/stories.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

const RINGS = [
  { id: '1', label: 'Your story', initials: 'You', isAdd: true },
  { id: '2', label: 'Design', initials: 'PD', active: true },
  { id: '3', label: 'Kodjo', initials: 'KO', active: false },
  { id: '4', label: 'Finance', initials: 'FN', active: false },
];

export default function StoriesScreen() {
  const [selected, setSelected] = useState('2');
  const [reply, setReply] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stories</Text>
        <Text style={styles.subtitle}>Your team, last 24 hours</Text>
      </View>

      {/* Ring Rail */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ringRail}
        >
          {RINGS.map((ring) => {
            const isSelected = selected === ring.id;
            return (
              <TouchableOpacity
                key={ring.id}
                style={styles.ringItem}
                onPress={() => setSelected(ring.id)}
              >
                <View
                  style={[
                    styles.ringCircle,
                    isSelected && styles.ringCircleActive,
                  ]}
                >
                  <Text style={styles.ringInitials}>{ring.initials}</Text>
                </View>
                <Text style={styles.ringLabel}>{ring.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Viewer Card */}
      <View style={styles.viewerCard}>
        {/* Segmented Progress */}
        <View style={styles.progressRow}>
          <View style={[styles.progressSegment, styles.progressDone]} />
          <View style={[styles.progressSegment, styles.progressCurrent]} />
          <View style={styles.progressSegment} />
        </View>

        <View style={styles.viewerHeader}>
          <View style={styles.smallAvatar}>
            <Text style={styles.smallAvatarText}>PD</Text>
          </View>
          <View>
            <Text style={styles.viewerAuthor}>Product Design</Text>
            <Text style={styles.viewerTime}>2h ago</Text>
          </View>
        </View>

        <View style={styles.viewerCenter}>
          <View style={styles.captionBox}>
            <View style={styles.captionBadge}>
              <Ionicons name="closed-captioning" size={14} color={Colors.cyanPrimary} />
              <Text style={styles.captionBadgeText}>CAPTIONS ON</Text>
            </View>
            <Text style={styles.captionCopy}>
              New tokens are live — every accent now passes AA on the card surface.
            </Text>
          </View>
        </View>

        <View style={styles.replyRow}>
          <TextInput
            style={styles.replyInput}
            placeholder="Reply to Product Design..."
            placeholderTextColor={Colors.textSecondary}
            value={reply}
            onChangeText={setReply}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => setReply('')}>
            <Ionicons name="send" size={18} color={Colors.base} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.base },
  header: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.gutter,
    paddingBottom: Spacing.grid * 2,
  },
  title: { ...Typography.title, color: Colors.textPrimary },
  subtitle: { ...Typography.label, color: Colors.textSecondary },
  ringRail: {
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.grid * 2,
    gap: Spacing.gutter,
  },
  ringItem: { alignItems: 'center', width: 64 },
  ringCircle: {
    width: 56,
    height: 56,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  ringCircleActive: { borderColor: Colors.cyanPrimary },
  ringInitials: { ...Typography.bodyStrong, color: Colors.textPrimary },
  ringLabel: { ...Typography.caption, color: Colors.textSecondary },
  viewerCard: {
    flex: 1,
    margin: Spacing.gutter,
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
    justifyContent: 'space-between',
  },
  progressRow: { flexDirection: 'row', gap: 6 },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.line,
  },
  progressDone: { backgroundColor: Colors.cyanPrimary },
  progressCurrent: { backgroundColor: Colors.purpleAi },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.grid * 2.5,
    marginTop: Spacing.cardGap,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radiusPill,
    backgroundColor: `${Colors.purpleAi}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAvatarText: { ...Typography.label, color: Colors.purpleAi, fontWeight: '700' },
  viewerAuthor: { ...Typography.bodyStrong, color: Colors.textPrimary },
  viewerTime: { ...Typography.caption, color: Colors.textSecondary },
  viewerCenter: { flex: 1, justifyContent: 'flex-end', marginBottom: Spacing.gutter },
  captionBox: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
  },
  captionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  captionBadgeText: {
    ...Typography.caption,
    color: Colors.cyanPrimary,
    fontWeight: '700',
  },
  captionCopy: { ...Typography.body, color: Colors.textPrimary },
  replyRow: { flexDirection: 'row', gap: Spacing.grid * 2 },
  replyInput: {
    flex: 1,
    minHeight: Spacing.minTapTarget,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusPill,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: Spacing.gutter,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  sendBtn: {
    width: Spacing.minTapTarget,
    height: Spacing.minTapTarget,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.cyanPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});