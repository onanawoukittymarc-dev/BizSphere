// app/(tabs)/reels.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  SafeAreaView,
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
      {/* Top Overlay */}
      <View style={styles.topBar}>
        <View style={styles.pillBadge}>
          <Ionicons name="sparkles" size={14} color={Colors.cyanPrimary} />
          <Text style={styles.pillText}>For you</Text>
        </View>
        <TouchableOpacity
          style={styles.pillBadge}
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

      {/* Main Content Area */}
      <View style={styles.stage}>
        {/* Burned-in Whisper Captions */}
        <View style={styles.captionOverlay}>
          <Text style={styles.burnedCaption}>
            “The first screen now asks one question, not five.”
          </Text>
        </View>

        {/* Right Action Rail */}
        <View style={styles.actionRail}>
          <TouchableOpacity
            style={styles.railBtn}
            onPress={() => setLiked(!liked)}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={28}
              color={liked ? Colors.danger : Colors.textPrimary}
            />
            <Text style={styles.railCount}>{liked ? 249 : 248}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.railBtn}>
            <Ionicons
              name="chatbubble-outline"
              size={26}
              color={Colors.textPrimary}
            />
            <Text style={styles.railCount}>31</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.railBtn}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.base },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.gutter,
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
    margin: Spacing.gutter,
    marginTop: 0,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
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