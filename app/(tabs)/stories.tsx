// app/(tabs)/stories.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface StoryAccount {
  id: string;
  name: string;
  initials: string;
  roleOrTime: string;
  accentColor: string;
  isOwn?: boolean;
  caption: string;
}

const STORY_ACCOUNTS: StoryAccount[] = [
  {
    id: '1',
    name: 'Your story',
    initials: 'You',
    roleOrTime: 'Tap to add',
    accentColor: Colors.cyanPrimary,
    isOwn: true,
    caption: 'Share a quick update with your team for the next 24 hours.',
  },
  {
    id: '2',
    name: 'Design',
    initials: 'PD',
    roleOrTime: '2h ago',
    accentColor: Colors.purpleAi,
    caption:
      'New tokens are live — every accent now passes AA on the card surface.',
  },
  {
    id: '3',
    name: 'Kodjo',
    initials: 'KO',
    roleOrTime: '3h ago',
    accentColor: Colors.success,
    caption:
      'Voice notes now include instant transcript previews right in the thread.',
  },
  {
    id: '4',
    name: 'Finance',
    initials: 'FN',
    roleOrTime: '5h ago',
    accentColor: Colors.warning,
    caption: 'Q4 budget checkpoint completed — ready for sign-off.',
  },
  {
    id: '5',
    name: 'Amina',
    initials: 'AM',
    roleOrTime: '6h ago',
    accentColor: Colors.blueInfo,
    caption: 'Updated deck slides uploaded to the shared workspace.',
  },
];

export default function StoriesScreen() {
  const [selectedId, setSelectedId] = useState<string>('2');
  const [reply, setReply] = useState('');

  const activeAccount =
    STORY_ACCOUNTS.find((acc) => acc.id === selectedId) ?? STORY_ACCOUNTS[1];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Centered Brand Header */}
      <View style={styles.topBrandBar}>
        <Text style={styles.brandTitle}>BizSphere</Text>
      </View>

      {/* White Divider Between BizSphere and Stories */}
      <View style={styles.whiteDivider} />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Stories</Text>
        <Text style={styles.sectionSubtitle}>Your team, last 24 hours</Text>
      </View>

      {/* Accounts Ring Rail — Name Centered Directly Under Each Icon */}
      <View style={styles.railWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ringRail}
        >
          {STORY_ACCOUNTS.map((account) => {
            const isSelected = account.id === selectedId;
            return (
              <TouchableOpacity
                key={account.id}
                style={styles.accountColumn}
                activeOpacity={0.85}
                onPress={() => setSelectedId(account.id)}
              >
                <View
                  style={[
                    styles.ringOuter,
                    isSelected && { borderColor: account.accentColor },
                  ]}
                >
                  <View
                    style={[
                      styles.avatarInner,
                      { backgroundColor: `${account.accentColor}22` },
                    ]}
                  >
                    {account.isOwn ? (
                      <Ionicons
                        name="add"
                        size={22}
                        color={account.accentColor}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.avatarText,
                          { color: account.accentColor },
                        ]}
                      >
                        {account.initials}
                      </Text>
                    )}
                  </View>
                </View>

                <Text
                  style={[
                    styles.accountName,
                    isSelected && styles.accountNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {account.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Story Viewer Card */}
      <View style={styles.viewerCard}>
        <View style={styles.progressRow}>
          <View
            style={[
              styles.progressSegment,
              { backgroundColor: activeAccount.accentColor },
            ]}
          />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>

        <View style={styles.viewerHeader}>
          <View
            style={[
              styles.viewerAvatar,
              { backgroundColor: `${activeAccount.accentColor}22` },
            ]}
          >
            <Text
              style={[
                styles.viewerAvatarText,
                { color: activeAccount.accentColor },
              ]}
            >
              {activeAccount.initials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.viewerAuthor}>{activeAccount.name}</Text>
            <Text style={styles.viewerTime}>{activeAccount.roleOrTime}</Text>
          </View>
        </View>

        <View style={styles.viewerCenter}>
          <View style={styles.captionBox}>
            <View style={styles.captionBadge}>
              <Ionicons
                name="closed-captioning"
                size={14}
                color={Colors.cyanPrimary}
              />
              <Text style={styles.captionBadgeText}>CAPTIONS ON</Text>
            </View>
            <Text style={styles.captionCopy}>{activeAccount.caption}</Text>
          </View>
        </View>

        <View style={styles.replyRow}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Reply to ${activeAccount.name}...`}
            placeholderTextColor={Colors.textSecondary}
            value={reply}
            onChangeText={setReply}
          />
          <TouchableOpacity
            style={styles.sendBtn}
            activeOpacity={0.85}
            onPress={() => setReply('')}
          >
            <Ionicons name="send" size={18} color={Colors.base} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const topCameraOffset =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 14 : 18;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
  },
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
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  railWrapper: {
    paddingVertical: Spacing.grid * 1.5,
  },
  ringRail: {
    paddingHorizontal: Spacing.gutter,
    gap: Spacing.cardGap,
  },
  accountColumn: {
    width: 72,
    alignItems: 'center',
  },
  ringOuter: {
    width: 60,
    height: 60,
    borderRadius: Spacing.radiusPill,
    borderWidth: 2,
    borderColor: Colors.line,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.bodyStrong,
    fontSize: 16,
  },
  accountName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    width: '100%',
  },
  accountNameActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  viewerCard: {
    flex: 1,
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.grid,
    marginBottom: Spacing.gutter,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
    justifyContent: 'space-between',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.line,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.grid * 2.5,
    marginTop: Spacing.cardGap,
  },
  viewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerAvatarText: {
    ...Typography.label,
    fontWeight: '700',
  },
  viewerAuthor: {
    ...Typography.bodyStrong,
    color: Colors.textPrimary,
  },
  viewerTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  viewerCenter: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: Spacing.gutter,
  },
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
  captionCopy: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  replyRow: {
    flexDirection: 'row',
    gap: Spacing.grid * 2,
  },
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