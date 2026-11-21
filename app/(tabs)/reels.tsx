// app/(tabs)/reels.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function ReelsScreen() {
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Centered Brand Header */}
      <View style={styles.topBrandBar}>
        <Text style={styles.brandTitle}>BizSphere</Text>
      </View>

      {/* White Divider */}
      <View style={styles.whiteDivider} />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reels</Text>
        <Text style={styles.sectionSubtitle}>Short updates with captions on</Text>
      </View>

      {/* Top Overlay Controls */}
      <View style={styles.topBar}>
        <View style={styles.pillBadge}>
          <Ionicons name="sparkles" size={14} color={Colors.cyanPrimary} />
          <Text style={styles.pillText}>For you</Text>
        </View>
        <TouchableOpacity
          style={styles.pillBadge}
          activeOpacity={0.85}
          onPress={() => setMuted(!muted)}
        >
          <Ionicons
            name={muted ? 'volume-mute' : 'volume-high'}
            size={16}
            color={Colors.textPrimary}
          />
          <Text style={styles.pillText}>{muted ? 'Muted' : 'Sound on'}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Stage */}
      <View style={styles.stage}>
        <View style={styles.captionOverlay}>
          <Text style={styles.burnedCaption}>
            “The first screen now asks one question, not five.”
          </Text>
        </View>

        {/* Right Action Rail */}
        <View style={styles.actionRail}>
          <TouchableOpacity
            style={styles.railBtn}
            activeOpacity={0.85}
            onPress={() => setLiked(!liked)}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={28}
              color={liked ? Colors.danger : Colors.textPrimary}
            />
            <Text style={styles.railCount}>{liked ? 249 : 248}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.railBtn} activeOpacity={0.85}>
            <Ionicons
              name="chatbubble-outline"
              size={26}
              color={Colors.textPrimary}
            />
            <Text style={styles.railCount}>31</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.railBtn} activeOpacity={0.85}>
            <Ionicons
              name="share-social-outline"
              size={26}
              color={Colors.textPrimary}
            />
            <Text style={styles.railCount}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Author Meta */}
        <View style={styles.authorBlock}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>KO</Text>
            </View>
            <Text style={styles.authorName}>Kodjo Owona</Text>
          </View>
          <Text style={styles.reelDesc}>
            How we cut onboarding from 9 steps to 4 — 40 seconds.
          </Text>
        </View>
      </View>
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
  sectionHeader: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.grid * 2.5,
    paddingBottom: Spacing.grid,
  },
  sectionTitle: { ...Typography.title, color: Colors.textPrimary },
  sectionSubtitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.grid * 2,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  pillText: { ...Typography.label, color: Colors.textPrimary },
  stage: {
    flex: 1,
    marginHorizontal: Spacing.gutter,
    marginBottom: Spacing.gutter,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
    justifyContent: 'flex-end',
  },
  captionOverlay: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.gutter,
    marginRight: 56,
  },
  burnedCaption: { ...Typography.bodyStrong, color: Colors.textPrimary },
  actionRail: {
    position: 'absolute',
    right: Spacing.cardPadding,
    bottom: 110,
    gap: Spacing.gutter,
    alignItems: 'center',
  },
  railBtn: { alignItems: 'center', minWidth: Spacing.minTapTarget },
  railCount: { ...Typography.caption, color: Colors.textPrimary, marginTop: 4 },
  authorBlock: { gap: Spacing.grid * 2 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.grid * 2.5 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radiusPill,
    backgroundColor: `${Colors.blueInfo}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.label, color: Colors.blueInfo, fontWeight: '700' },
  authorName: { ...Typography.bodyStrong, color: Colors.textPrimary },
  reelDesc: { ...Typography.body, color: Colors.textSecondary },
});