// app/(tabs)/reels.tsx
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StateView } from '../../components/StateView';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface ReelComment {
  id: string;
  author: string;
  text: string;
  time: string;
}

interface ReelItem {
  id: string;
  feed: 'For you' | 'Following';
  initials: string;
  author: string;
  avatarColor: string;
  caption: string;
  description: string;
  likes: number;
  comments: ReelComment[];
}

const INITIAL_REELS: ReelItem[] = [
  {
    id: 'reel-1',
    feed: 'For you',
    initials: 'KO',
    author: 'Kodjo Owona',
    avatarColor: Colors.blueInfo,
    caption: '“The first screen now asks one question, not five.”',
    description: 'How we cut onboarding from 9 steps to 4 — 40 seconds.',
    likes: 248,
    comments: [
      {
        id: 'c-1',
        author: 'Amina Mbarga',
        text: 'Conversion already feels much cleaner on mobile.',
        time: '14m',
      },
      {
        id: 'c-2',
        author: 'Luc',
        text: 'Let’s keep the copy this concise on the signup flow.',
        time: '6m',
      },
    ],
  },
  {
    id: 'reel-2',
    feed: 'For you',
    initials: 'AM',
    author: 'Amina Mbarga',
    avatarColor: Colors.purpleAi,
    caption: '“Ship small weekly checkpoints instead of waiting for big bangs.”',
    description: 'Inside our 30-minute Friday product & design demo.',
    likes: 184,
    comments: [
      {
        id: 'c-3',
        author: 'Kodjo Owona',
        text: 'Short demos keep everyone aligned before Monday.',
        time: '1h',
      },
    ],
  },
  {
    id: 'reel-3',
    feed: 'Following',
    initials: 'FN',
    author: 'Finance · Ops',
    avatarColor: Colors.cyanPrimary,
    caption: '“Automated invoice tags saved 3 hours of manual sorting.”',
    description: 'Quick walkthrough of our monthly ops checklist.',
    likes: 96,
    comments: [
      {
        id: 'c-4',
        author: 'Sarah Bell',
        text: 'Super helpful template for Q4 closing.',
        time: '2h',
      },
    ],
  },
];

const SWIPE_THRESHOLD = 45;

export default function ReelsScreen() {
  const [reels, setReels] = useState<ReelItem[]>(INITIAL_REELS);
  const [feedFilter, setFeedFilter] = useState<'For you' | 'Following'>('For you');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [muted, setMuted] = useState(true);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  // Comments modal state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');

  const visibleReels = useMemo(() => {
    const filtered = reels.filter((r) => r.feed === feedFilter);
    return filtered.length > 0 ? filtered : reels;
  }, [reels, feedFilter]);

  const activeReel = useMemo(() => {
    if (visibleReels.length === 0) return null;
    const safeIdx =
      ((currentIndex % visibleReels.length) + visibleReels.length) %
      visibleReels.length;
    return visibleReels[safeIdx];
  }, [visibleReels, currentIndex]);

  const handleSwitchFeed = (nextFeed: 'For you' | 'Following') => {
    setFeedFilter(nextFeed);
    setCurrentIndex(0);
  };

  // Slide down -> advance to next reel
  const handleNextReel = () => {
    if (visibleReels.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % visibleReels.length);
  };

  // Slide up -> go back to previous reel
  const handlePrevReel = () => {
    if (visibleReels.length <= 1) return;
    setCurrentIndex(
      (prev) => (prev - 1 + visibleReels.length) % visibleReels.length
    );
  };

  const navHandlersRef = useRef({
    onSwipeDown: handleNextReel,
    onSwipeUp: handlePrevReel,
  });
  navHandlersRef.current = {
    onSwipeDown: handleNextReel,
    onSwipeUp: handlePrevReel,
  };

  const swipeTriggeredRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 14 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderGrant: () => {
        swipeTriggeredRef.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        if (swipeTriggeredRef.current) return;
        if (gestureState.dy > SWIPE_THRESHOLD) {
          swipeTriggeredRef.current = true;
          navHandlersRef.current.onSwipeDown();
        } else if (gestureState.dy < -SWIPE_THRESHOLD) {
          swipeTriggeredRef.current = true;
          navHandlersRef.current.onSwipeUp();
        }
      },
      onPanResponderRelease: () => {
        swipeTriggeredRef.current = false;
      },
      onPanResponderTerminate: () => {
        swipeTriggeredRef.current = false;
      },
    })
  ).current;

  const handleToggleLike = (reelId: string) => {
    setLikedIds((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }));
  };

  const handleShareReel = async (reel: ReelItem) => {
    try {
      await Share.share({
        message: `${reel.author} — ${reel.description} ${reel.caption}`,
      });
    } catch {
      Alert.alert('Partage indisponible', 'Impossible de partager ce Reel.');
    }
  };

  const handleAddComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed || !activeReel) return;

    const entry: ReelComment = {
      id: `c-${Date.now()}`,
      author: 'You',
      text: trimmed,
      time: 'Just now',
    };

    setReels((prev) =>
      prev.map((item) =>
        item.id === activeReel.id
          ? { ...item, comments: [...item.comments, entry] }
          : item
      )
    );
    setNewComment('');
  };

  const isLiked = activeReel ? Boolean(likedIds[activeReel.id]) : false;
  const displayLikes = activeReel
    ? activeReel.likes + (isLiked ? 1 : 0)
    : 0;

  const safeDisplayIndex =
    visibleReels.length > 0
      ? (((currentIndex % visibleReels.length) + visibleReels.length) %
          visibleReels.length) +
        1
      : 0;

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
        <Text style={styles.sectionSubtitle}>
          Swipe down next · swipe up back · {safeDisplayIndex}/{visibleReels.length}
        </Text>
      </View>

      {/* Top Overlay Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[
            styles.pillBadge,
            feedFilter === 'For you' && styles.pillBadgeActive,
          ]}
          activeOpacity={0.85}
          onPress={() =>
            handleSwitchFeed(feedFilter === 'For you' ? 'Following' : 'For you')
          }
        >
          <Ionicons
            name="sparkles"
            size={14}
            color={feedFilter === 'For you' ? Colors.base : Colors.cyanPrimary}
          />
          <Text
            style={[
              styles.pillText,
              feedFilter === 'For you' && styles.pillTextActive,
            ]}
          >
            {feedFilter}
          </Text>
        </TouchableOpacity>

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

      {/* Main Content Stage — Vertical Gesture Surface */}
      {!activeReel ? (
        <View style={styles.emptyWrap}>
          <StateView
            variant="empty"
            icon="film-outline"
            title="Aucun Reel disponible"
            description="Recharge les mises à jour vidéo de l'équipe."
            actionLabel="Recharger"
            onAction={() => {
              setReels(INITIAL_REELS);
              setCurrentIndex(0);
            }}
          />
        </View>
      ) : (
        <View style={styles.stage} {...panResponder.panHandlers}>
          <View style={styles.captionOverlay}>
            <Text style={styles.burnedCaption}>{activeReel.caption}</Text>
          </View>

          {/* Right Action Rail */}
          <View style={styles.actionRail}>
            <TouchableOpacity
              style={styles.railBtn}
              activeOpacity={0.85}
              onPress={() => handleToggleLike(activeReel.id)}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={28}
                color={isLiked ? Colors.danger : Colors.textPrimary}
              />
              <Text style={styles.railCount}>{displayLikes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railBtn}
              activeOpacity={0.85}
              onPress={() => setCommentsOpen(true)}
            >
              <Ionicons
                name="chatbubble-outline"
                size={26}
                color={Colors.textPrimary}
              />
              <Text style={styles.railCount}>{activeReel.comments.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railBtn}
              activeOpacity={0.85}
              onPress={() => handleShareReel(activeReel)}
            >
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
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: `${activeReel.avatarColor}22` },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: activeReel.avatarColor },
                  ]}
                >
                  {activeReel.initials}
                </Text>
              </View>
              <Text style={styles.authorName}>{activeReel.author}</Text>
            </View>
            <Text style={styles.reelDesc}>{activeReel.description}</Text>
          </View>
        </View>
      )}

      {/* Comments Modal */}
      <Modal
        visible={commentsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Comments ({activeReel?.comments.length ?? 0})
              </Text>
              <TouchableOpacity onPress={() => setCommentsOpen(false)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.commentsList}>
              {(activeReel?.comments ?? []).length === 0 ? (
                <StateView
                  variant="empty"
                  icon="chatbubble-ellipses-outline"
                  title="Aucun commentaire"
                  description="Sois le premier à réagir à cette mise à jour."
                />
              ) : (
                activeReel?.comments.map((c) => (
                  <View key={c.id} style={styles.commentItem}>
                    <View style={styles.commentTop}>
                      <Text style={styles.commentAuthor}>{c.author}</Text>
                      <Text style={styles.commentTime}>{c.time}</Text>
                    </View>
                    <Text style={styles.commentBody}>{c.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.commentComposer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor={Colors.textSecondary}
                value={newComment}
                onChangeText={setNewComment}
                onSubmitEditing={handleAddComment}
              />
              <TouchableOpacity
                style={styles.commentSend}
                onPress={handleAddComment}
              >
                <Ionicons name="send" size={18} color={Colors.base} />
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
    alignItems: 'center',
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
  pillBadgeActive: {
    backgroundColor: Colors.cyanPrimary,
    borderColor: Colors.cyanPrimary,
  },
  pillText: { ...Typography.label, color: Colors.textPrimary },
  pillTextActive: { color: Colors.base, fontWeight: '700' },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.gutter,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.label, fontWeight: '700' },
  authorName: { ...Typography.bodyStrong, color: Colors.textPrimary },
  reelDesc: { ...Typography.body, color: Colors.textSecondary },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '75%',
    minHeight: '45%',
    backgroundColor: Colors.base,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingBottom: Spacing.gutter,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.grid * 2.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    ...Typography.bodyStrong,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  commentsList: {
    padding: Spacing.gutter,
    gap: 10,
  },
  commentItem: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 12,
    gap: 4,
  },
  commentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentAuthor: {
    ...Typography.label,
    color: Colors.cyanPrimary,
    fontWeight: '700',
  },
  commentTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  commentBody: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  commentComposer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.gutter,
    paddingTop: 8,
  },
  commentInput: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: Spacing.gutter,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  commentSend: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.cyanPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});