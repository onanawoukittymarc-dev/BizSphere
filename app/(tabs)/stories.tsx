// app/(tabs)/stories.tsx
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Modal,
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
import { StateView } from '../../components/StateView';
import { Spacing, Typography } from '../../constants/theme';
import { useAppTheme } from '../../src/store/themeStore';

interface StorySegment {
  id: string;
  caption: string;
  timeLabel: string;
}

interface StoryAccount {
  id: string;
  name: string;
  initials: string;
  roleOrTime: string;
  accentColor: string;
  isOwn?: boolean;
  segments: StorySegment[];
}

export default function StoriesScreen() {
  const { colors } = useAppTheme();

  const initialAccounts: StoryAccount[] = useMemo(
    () => [
      {
        id: '1',
        name: 'Your story',
        initials: 'You',
        roleOrTime: 'Tap to add',
        accentColor: colors.cyanPrimary,
        isOwn: true,
        segments: [
          {
            id: 's-1-a',
            caption: 'Share a quick update with your team for the next 24 hours.',
            timeLabel: 'Just now',
          },
        ],
      },
      {
        id: '2',
        name: 'Design',
        initials: 'PD',
        roleOrTime: '2h ago',
        accentColor: colors.purpleAi,
        segments: [
          {
            id: 's-2-a',
            caption:
              'New tokens are live — every accent now passes AA on the card surface.',
            timeLabel: '2h ago',
          },
          {
            id: 's-2-b',
            caption:
              'Calm Command Center spacing is unified across Chats, Stories, and Meet.',
            timeLabel: '1h ago',
          },
          {
            id: 's-2-c',
            caption: 'Ready for mobile review before tonight’s sprint check-in.',
            timeLabel: '45m ago',
          },
        ],
      },
      {
        id: '3',
        name: 'Kodjo',
        initials: 'KO',
        roleOrTime: '3h ago',
        accentColor: colors.success,
        segments: [
          {
            id: 's-3-a',
            caption:
              'Voice notes now include instant transcript previews right in the thread.',
            timeLabel: '3h ago',
          },
        ],
      },
      {
        id: '4',
        name: 'Finance',
        initials: 'FN',
        roleOrTime: '5h ago',
        accentColor: colors.warning,
        segments: [
          {
            id: 's-4-a',
            caption: 'Q4 budget checkpoint completed — ready for sign-off.',
            timeLabel: '5h ago',
          },
        ],
      },
      {
        id: '5',
        name: 'Amina',
        initials: 'AM',
        roleOrTime: '6h ago',
        accentColor: colors.blueInfo,
        segments: [
          {
            id: 's-5-a',
            caption: 'Updated deck slides uploaded to the shared workspace.',
            timeLabel: '6h ago',
          },
        ],
      },
    ],
    [colors]
  );

  const [accounts, setAccounts] = useState<StoryAccount[]>(initialAccounts);
  const [selectedId, setSelectedId] = useState<string>('2');
  const [segmentIndex, setSegmentIndex] = useState<number>(0);
  const [reply, setReply] = useState('');
  const [sentFeedback, setSentFeedback] = useState<string | null>(null);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newCaption, setNewCaption] = useState('');

  const activeAccount = useMemo(() => {
    return accounts.find((acc) => acc.id === selectedId) ?? accounts[0] ?? null;
  }, [accounts, selectedId]);

  const activeSegment = useMemo(() => {
    if (!activeAccount || activeAccount.segments.length === 0) return null;
    const safeIdx = Math.min(segmentIndex, activeAccount.segments.length - 1);
    return activeAccount.segments[safeIdx];
  }, [activeAccount, segmentIndex]);

  const handleSelectAccount = (account: StoryAccount) => {
    setSentFeedback(null);
    setSelectedId(account.id);
    setSegmentIndex(0);
  };

  const handleNextSegment = () => {
    if (!activeAccount) return;
    setSentFeedback(null);
    if (segmentIndex + 1 < activeAccount.segments.length) {
      setSegmentIndex((prev) => prev + 1);
      return;
    }

    const currentIdx = accounts.findIndex((a) => a.id === activeAccount.id);
    const nextAccount = accounts[(currentIdx + 1) % accounts.length];
    if (nextAccount) {
      setSelectedId(nextAccount.id);
      setSegmentIndex(0);
    }
  };

  const handlePrevSegment = () => {
    if (!activeAccount) return;
    setSentFeedback(null);
    if (segmentIndex > 0) {
      setSegmentIndex((prev) => prev - 1);
    }
  };

  const handleSendReply = () => {
    const trimmed = reply.trim();
    if (!trimmed || !activeAccount) return;
    setSentFeedback(`Reply sent to ${activeAccount.name}: "${trimmed}"`);
    setReply('');
  };

  const handlePublishStory = () => {
    const clean = newCaption.trim();
    if (!clean) return;

    const newSeg: StorySegment = {
      id: `own-${Date.now()}`,
      caption: clean,
      timeLabel: 'Just now',
    };

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.isOwn
          ? {
              ...acc,
              roleOrTime: 'Just now',
              segments: [newSeg, ...acc.segments.filter((s) => s.id !== 's-1-a')],
            }
          : acc
      )
    );

    setNewCaption('');
    setCreateModalVisible(false);
    setSelectedId('1');
    setSegmentIndex(0);
    setSentFeedback('Your story update is now live for 24h.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.base }]}>
      <View style={styles.topBrandBar}>
        <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
          BizSphere
        </Text>
      </View>

      <View
        style={[styles.whiteDivider, { backgroundColor: colors.divider }]}
      />

      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Stories
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Your team, last 24 hours
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addStoryBtn,
            { backgroundColor: colors.cyanPrimary },
          ]}
          activeOpacity={0.85}
          onPress={() => setCreateModalVisible(true)}
        >
          <Ionicons name="add" size={18} color="#080F13" />
          <Text style={styles.addStoryText}>New story</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.railWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ringRail}
        >
          {accounts.map((account) => {
            const isSelected = account.id === activeAccount?.id;
            return (
              <TouchableOpacity
                key={account.id}
                style={styles.accountColumn}
                activeOpacity={0.85}
                onPress={() => handleSelectAccount(account)}
              >
                <View
                  style={[
                    styles.ringOuter,
                    {
                      borderColor: isSelected
                        ? account.accentColor
                        : colors.line,
                    },
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
                    {
                      color: isSelected
                        ? colors.textPrimary
                        : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
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

      {!activeAccount || !activeSegment ? (
        <View style={styles.emptyWrap}>
          <StateView
            variant="empty"
            icon="albums-outline"
            title="Aucune story disponible"
            description="Publie une story ou recharge les mises à jour de l'équipe."
            actionLabel="Recharger"
            onAction={() => {
              setAccounts(initialAccounts);
              setSelectedId('2');
              setSegmentIndex(0);
            }}
          />
        </View>
      ) : (
        <View
          style={[
            styles.viewerCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <View style={styles.progressRow}>
            {activeAccount.segments.map((seg, idx) => {
              const filled = idx <= segmentIndex;
              return (
                <TouchableOpacity
                  key={seg.id}
                  style={styles.progressTouch}
                  onPress={() => {
                    setSentFeedback(null);
                    setSegmentIndex(idx);
                  }}
                >
                  <View
                    style={[
                      styles.progressSegment,
                      {
                        backgroundColor: filled
                          ? activeAccount.accentColor
                          : colors.line,
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
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
              <Text
                style={[styles.viewerAuthor, { color: colors.textPrimary }]}
              >
                {activeAccount.name}
              </Text>
              <Text
                style={[styles.viewerTime, { color: colors.textSecondary }]}
              >
                {activeSegment.timeLabel}
              </Text>
            </View>

            <View style={styles.navArrows}>
              <TouchableOpacity
                style={[
                  styles.arrowBtn,
                  { backgroundColor: colors.surface, borderColor: colors.line },
                ]}
                onPress={handlePrevSegment}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.arrowBtn,
                  { backgroundColor: colors.surface, borderColor: colors.line },
                ]}
                onPress={handleNextSegment}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewerCenter}
            activeOpacity={0.95}
            onPress={handleNextSegment}
          >
            <View
              style={[
                styles.captionBox,
                { backgroundColor: colors.surface, borderColor: colors.line },
              ]}
            >
              <View style={styles.captionBadge}>
                <Ionicons
                  name="closed-captioning"
                  size={14}
                  color={colors.cyanPrimary}
                />
                <Text
                  style={[
                    styles.captionBadgeText,
                    { color: colors.cyanPrimary },
                  ]}
                >
                  CAPTIONS ON
                </Text>
              </View>
              <Text
                style={[styles.captionCopy, { color: colors.textPrimary }]}
              >
                {activeSegment.caption}
              </Text>
            </View>

            {sentFeedback && (
              <View
                style={[
                  styles.feedbackBanner,
                  {
                    backgroundColor: `${colors.success}18`,
                    borderColor: `${colors.success}55`,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.success}
                />
                <Text
                  style={[styles.feedbackText, { color: colors.textPrimary }]}
                >
                  {sentFeedback}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.replyRow}>
            <TextInput
              style={[
                styles.replyInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.line,
                  color: colors.textPrimary,
                },
              ]}
              placeholder={`Reply to ${activeAccount.name}...`}
              placeholderTextColor={colors.textSecondary}
              value={reply}
              onChangeText={setReply}
              onSubmitEditing={handleSendReply}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: colors.cyanPrimary },
              ]}
              activeOpacity={0.85}
              onPress={handleSendReply}
            >
              <Ionicons name="send" size={18} color="#080F13" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.line },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Nouvelle story (24h)
            </Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              Partage une mise à jour rapide avec ton équipe.
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.line,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Ex: Sprint review prêt pour 15h..."
              placeholderTextColor={colors.textSecondary}
              value={newCaption}
              onChangeText={setNewCaption}
              multiline
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[
                  styles.modalCancel,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text
                  style={[
                    styles.modalCancelText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalPublish,
                  { backgroundColor: colors.cyanPrimary },
                ]}
                onPress={handlePublishStory}
              >
                <Text style={styles.modalPublishText}>Publier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const topCameraOffset =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 14 : 18;

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBrandBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingTop: topCameraOffset,
    paddingBottom: Spacing.grid * 2.5,
  },
  brandTitle: {
    ...Typography.heading,
    textAlign: 'center',
  },
  whiteDivider: { height: 1, opacity: 0.9 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.grid * 2.5,
    paddingBottom: Spacing.grid,
  },
  sectionTitle: { ...Typography.title },
  sectionSubtitle: { ...Typography.label, marginTop: 2 },
  addStoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Spacing.radiusPill,
  },
  addStoryText: {
    ...Typography.caption,
    color: '#080F13',
    fontWeight: '700',
  },
  railWrapper: { paddingVertical: Spacing.grid * 1.5 },
  ringRail: { paddingHorizontal: Spacing.gutter, gap: Spacing.cardGap },
  accountColumn: { width: 72, alignItems: 'center' },
  ringOuter: {
    width: 60,
    height: 60,
    borderRadius: Spacing.radiusPill,
    borderWidth: 2,
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
  avatarText: { ...Typography.bodyStrong, fontSize: 16 },
  accountName: {
    ...Typography.caption,
    textAlign: 'center',
    width: '100%',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.gutter,
  },
  viewerCard: {
    flex: 1,
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.grid,
    marginBottom: Spacing.gutter,
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.cardPadding,
    justifyContent: 'space-between',
  },
  progressRow: { flexDirection: 'row', gap: 6 },
  progressTouch: { flex: 1, paddingVertical: 4 },
  progressSegment: { height: 3, borderRadius: 2 },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.grid * 2.5,
    marginTop: Spacing.grid,
  },
  viewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerAvatarText: { ...Typography.label, fontWeight: '700' },
  viewerAuthor: { ...Typography.bodyStrong },
  viewerTime: { ...Typography.caption },
  navArrows: { flexDirection: 'row', gap: 6 },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: Spacing.radiusPill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCenter: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: Spacing.gutter,
    gap: 10,
  },
  captionBox: {
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    padding: Spacing.cardPadding,
  },
  captionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  captionBadgeText: { ...Typography.caption, fontWeight: '700' },
  captionCopy: { ...Typography.body },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: Spacing.radiusMd,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  feedbackText: { ...Typography.caption, flex: 1 },
  replyRow: { flexDirection: 'row', gap: Spacing.grid * 2 },
  replyInput: {
    flex: 1,
    minHeight: Spacing.minTapTarget,
    borderRadius: Spacing.radiusPill,
    borderWidth: 1,
    paddingHorizontal: Spacing.gutter,
    ...Typography.body,
  },
  sendBtn: {
    width: Spacing.minTapTarget,
    height: Spacing.minTapTarget,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: Spacing.gutter,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.cardPadding,
    gap: 12,
  },
  modalTitle: { ...Typography.heading },
  modalDesc: { ...Typography.label },
  modalInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: Spacing.radiusMd,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: 10,
    ...Typography.body,
    textAlignVertical: 'top',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  modalCancel: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: { ...Typography.label },
  modalPublish: {
    minHeight: 42,
    paddingHorizontal: 20,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPublishText: {
    ...Typography.label,
    color: '#080F13',
    fontWeight: '700',
  },
});