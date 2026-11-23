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
import { Spacing, Typography } from '../../constants/theme';
import { useAppTheme } from '../../src/store/themeStore';

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
  handle: string;
  avatarColor: string;
  caption: string;
  description: string;
  fullTranscript: string;
  hashtags: string[];
  audioTitle: string;
  likes: number;
  comments: ReelComment[];
}

const SWIPE_THRESHOLD = 45;

export default function ReelsScreen() {
  const { colors } = useAppTheme();

  const initialReels: ReelItem[] = useMemo(
    () => [
      {
        id: 'reel-1',
        feed: 'For you',
        initials: 'KO',
        author: 'Kodjo Owona',
        handle: '@kodjo.biz',
        avatarColor: colors.blueInfo,
        caption: '“The first screen now asks one question, not five.”',
        description: 'How we cut onboarding from 9 steps to 4 — 40 seconds.',
        fullTranscript:
          'We removed multi-step profile forms at signup and moved preferences inside workspace setup. First-session completion rose immediately.',
        hashtags: ['#onboarding', '#product', '#ux'],
        audioTitle: 'Original audio · Kodjo Owona',
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
        handle: '@amina.design',
        avatarColor: colors.purpleAi,
        caption:
          '“Ship small weekly checkpoints instead of waiting for big bangs.”',
        description: 'Inside our 30-minute Friday product & design demo.',
        fullTranscript:
          'Every Friday we review real screen flows, token spacing, and user feedback before locking Monday priorities.',
        hashtags: ['#design', '#sprint', '#calm-ui'],
        audioTitle: 'Studio sync · Amina Mbarga',
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
        handle: '@finance.ops',
        avatarColor: colors.cyanPrimary,
        caption: '“Automated invoice tags saved 3 hours of manual sorting.”',
        description: 'Quick walkthrough of our monthly ops checklist.',
        fullTranscript:
          'Standardizing invoice labels by department and vendor keeps monthly reconciliation fast and predictable.',
        hashtags: ['#ops', '#finance', '#workflow'],
        audioTitle: 'Ops brief · Finance · Ops',
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
    ],
    [colors]
  );

  const [reels, setReels] = useState<ReelItem[]>(initialReels);
  const [feedFilter, setFeedFilter] = useState<'For you' | 'Following'>(
    'For you'
  );
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [muted, setMuted] = useState(true);
  const [expandCaption, setExpandCaption] = useState(false);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [followedAuthors, setFollowedAuthors] = useState<
    Record<string, boolean>
  >({
    'Finance · Ops': true,
  });

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);

  const visibleReels = useMemo(() => {
    let list = reels.filter((r) => r.feed === feedFilter);
    if (activeHashtag) {
      const byTag = reels.filter((r) => r.hashtags.includes(activeHashtag));
      if (byTag.length > 0) {
        list = byTag;
      }
    }
    return list;
  }, [reels, feedFilter, activeHashtag]);

  const activeReel = useMemo(() => {
    if (visibleReels.length === 0) return null;
    const safeIdx =
      ((currentIndex % visibleReels.length) + visibleReels.length) %
      visibleReels.length;
    return visibleReels[safeIdx];
  }, [visibleReels, currentIndex]);

  const handleSwitchFeed = (nextFeed: 'For you' | 'Following') => {
    setFeedFilter(nextFeed);
    setActiveHashtag(null);
    setCurrentIndex(0);
    setExpandCaption(false);
  };

  const handleSelectHashtag = (tag: string) => {
    setActiveHashtag((prev) => (prev === tag ? null : tag));
    setCurrentIndex(0);
    setExpandCaption(false);
  };

  const handleNextReel = () => {
    if (visibleReels.length <= 1) return;
    setExpandCaption(false);
    setCurrentIndex((prev) => (prev + 1) % visibleReels.length);
  };

  const handlePrevReel = () => {
    if (visibleReels.length <= 1) return;
    setExpandCaption(false);
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

  const handleToggleSave = (reelId: string) => {
    setSavedIds((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }));
  };

  const handleToggleFollow = (author: string) => {
    setFollowedAuthors((prev) => ({
      ...prev,
      [author]: !prev[author],
    }));
  };

  const handleShareReel = async (reel: ReelItem) => {
    try {
      await Share.share({
        message: `${reel.author} (${reel.handle}) — ${reel.description} ${reel.caption} ${reel.hashtags.join(' ')}`,
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
  const isSaved = activeReel ? Boolean(savedIds[activeReel.id]) : false;
  const isFollowing = activeReel
    ? activeReel.feed === 'Following' ||
      Boolean(followedAuthors[activeReel.author])
    : false;
  const displayLikes = activeReel ? activeReel.likes + (isLiked ? 1 : 0) : 0;

  const safeDisplayIndex =
    visibleReels.length > 0
      ? (((currentIndex % visibleReels.length) + visibleReels.length) %
          visibleReels.length) +
        1
      : 0;

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

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Reels
        </Text>
        <Text
          style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
        >
          Short updates with captions on · {safeDisplayIndex}/
          {visibleReels.length}
        </Text>
      </View>

      <View style={styles.topBar}>
        <View style={styles.leftTopRow}>
          <TouchableOpacity
            style={[
              styles.pillBadge,
              {
                backgroundColor:
                  feedFilter === 'For you' && !activeHashtag
                    ? colors.cyanPrimary
                    : colors.surface,
                borderColor:
                  feedFilter === 'For you' && !activeHashtag
                    ? colors.cyanPrimary
                    : colors.line,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => handleSwitchFeed('For you')}
          >
            <Ionicons
              name="sparkles"
              size={14}
              color={
                feedFilter === 'For you' && !activeHashtag
                  ? '#080F13'
                  : colors.cyanPrimary
              }
            />
            <Text
              style={[
                styles.pillText,
                {
                  color:
                    feedFilter === 'For you' && !activeHashtag
                      ? '#080F13'
                      : colors.textPrimary,
                  fontWeight:
                    feedFilter === 'For you' && !activeHashtag ? '700' : '500',
                },
              ]}
            >
              For you
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pillBadge,
              {
                backgroundColor:
                  feedFilter === 'Following' && !activeHashtag
                    ? colors.cyanPrimary
                    : colors.surface,
                borderColor:
                  feedFilter === 'Following' && !activeHashtag
                    ? colors.cyanPrimary
                    : colors.line,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => handleSwitchFeed('Following')}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color:
                    feedFilter === 'Following' && !activeHashtag
                      ? '#080F13'
                      : colors.textPrimary,
                  fontWeight:
                    feedFilter === 'Following' && !activeHashtag
                      ? '700'
                      : '500',
                },
              ]}
            >
              Following
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.pillBadge,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
          activeOpacity={0.85}
          onPress={() => setMuted(!muted)}
        >
          <Ionicons
            name={muted ? 'volume-mute' : 'volume-high'}
            size={16}
            color={colors.textPrimary}
          />
          <Text style={[styles.pillText, { color: colors.textPrimary }]}>
            {muted ? 'Muted' : 'Sound on'}
          </Text>
        </TouchableOpacity>
      </View>

      {activeHashtag && (
        <View
          style={[
            styles.activeTagBar,
            { backgroundColor: colors.card, borderColor: colors.cyanPrimary },
          ]}
        >
          <Text
            style={[styles.activeTagLabel, { color: colors.cyanPrimary }]}
          >
            Tag: {activeHashtag}
          </Text>
          <TouchableOpacity onPress={() => setActiveHashtag(null)}>
            <Text
              style={[styles.clearTagText, { color: colors.textSecondary }]}
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!activeReel ? (
        <View style={styles.emptyWrap}>
          <StateView
            variant="empty"
            icon="film-outline"
            title="Aucun Reel disponible"
            description="Recharge les mises à jour vidéo de l'équipe."
            actionLabel="Recharger"
            onAction={() => {
              setReels(initialReels);
              setActiveHashtag(null);
              setCurrentIndex(0);
            }}
          />
        </View>
      ) : (
        <View
          style={[
            styles.stage,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.stageTopMeta}>
            <View
              style={[
                styles.reelTagPill,
                { backgroundColor: colors.card, borderColor: colors.line },
              ]}
            >
              <Ionicons name="film" size={13} color={colors.purpleAi} />
              <Text style={[styles.reelTagText, { color: colors.purpleAi }]}>
                BIZ REEL
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.captionToggleChip,
                { backgroundColor: colors.card, borderColor: colors.line },
              ]}
              activeOpacity={0.85}
              onPress={() => setExpandCaption((prev) => !prev)}
            >
              <Ionicons
                name="closed-captioning-outline"
                size={14}
                color={colors.cyanPrimary}
              />
              <Text
                style={[
                  styles.captionToggleText,
                  { color: colors.cyanPrimary },
                ]}
              >
                {expandCaption ? 'Hide caption' : 'Caption'}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.captionOverlay,
              { backgroundColor: colors.card, borderColor: colors.line },
            ]}
          >
            <Text
              style={[styles.burnedCaption, { color: colors.textPrimary }]}
            >
              {activeReel.caption}
            </Text>
            {expandCaption && (
              <Text
                style={[
                  styles.transcriptText,
                  { color: colors.textSecondary },
                ]}
              >
                {activeReel.fullTranscript}
              </Text>
            )}
          </View>

          <View style={styles.actionRail}>
            <TouchableOpacity
              style={styles.railBtn}
              activeOpacity={0.85}
              onPress={() => handleToggleLike(activeReel.id)}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={28}
                color={isLiked ? colors.danger : colors.textPrimary}
              />
              <Text style={[styles.railCount, { color: colors.textPrimary }]}>
                {displayLikes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railBtn}
              activeOpacity={0.85}
              onPress={() => setCommentsOpen(true)}
            >
              <Ionicons
                name="chatbubble-outline"
                size={26}
                color={colors.textPrimary}
              />
              <Text style={[styles.railCount, { color: colors.textPrimary }]}>
                {activeReel.comments.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railBtn}
              activeOpacity={0.85}
              onPress={() => handleToggleSave(activeReel.id)}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={26}
                color={isSaved ? colors.cyanPrimary : colors.textPrimary}
              />
              <Text style={[styles.railCount, { color: colors.textPrimary }]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railBtn}
              activeOpacity={0.85}
              onPress={() => handleShareReel(activeReel)}
            >
              <Ionicons
                name="share-social-outline"
                size={26}
                color={colors.textPrimary}
              />
              <Text style={[styles.railCount, { color: colors.textPrimary }]}>
                Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railBtn}
              activeOpacity={0.85}
              onPress={() => setMoreOpen(true)}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color={colors.textPrimary}
              />
              <Text style={[styles.railCount, { color: colors.textPrimary }]}>
                More
              </Text>
            </TouchableOpacity>
          </View>

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
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.authorName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {activeReel.author}
                </Text>
                <Text
                  style={[styles.handleText, { color: colors.textSecondary }]}
                >
                  {activeReel.handle}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.followChip,
                  {
                    borderColor: colors.cyanPrimary,
                    backgroundColor: isFollowing
                      ? colors.cyanPrimary
                      : 'transparent',
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => handleToggleFollow(activeReel.author)}
              >
                <Text
                  style={[
                    styles.followChipText,
                    {
                      color: isFollowing ? '#080F13' : colors.cyanPrimary,
                    },
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.reelDesc, { color: colors.textSecondary }]}>
              {activeReel.description}
            </Text>

            <View style={styles.hashtagRow}>
              {activeReel.hashtags.map((tag) => {
                const selectedTag = activeHashtag === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.hashtagChip,
                      {
                        backgroundColor: selectedTag
                          ? colors.purpleAi
                          : colors.card,
                        borderColor: selectedTag
                          ? colors.purpleAi
                          : colors.line,
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => handleSelectHashtag(tag)}
                  >
                    <Text
                      style={[
                        styles.hashtagText,
                        {
                          color: selectedTag ? '#FFFFFF' : colors.cyanPrimary,
                        },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.audioStrip}>
              <Ionicons
                name="musical-notes"
                size={14}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.audioText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {activeReel.audioTitle}
              </Text>
            </View>
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
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.base, borderColor: colors.line },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor: colors.line,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Comments ({activeReel?.comments.length ?? 0})
              </Text>
              <TouchableOpacity onPress={() => setCommentsOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
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
                  <View
                    key={c.id}
                    style={[
                      styles.commentItem,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.line,
                      },
                    ]}
                  >
                    <View style={styles.commentTop}>
                      <Text
                        style={[
                          styles.commentAuthor,
                          { color: colors.cyanPrimary },
                        ]}
                      >
                        {c.author}
                      </Text>
                      <Text
                        style={[
                          styles.commentTime,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {c.time}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.commentBody,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {c.text}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.commentComposer}>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.line,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Add a comment..."
                placeholderTextColor={colors.textSecondary}
                value={newComment}
                onChangeText={setNewComment}
                onSubmitEditing={handleAddComment}
              />
              <TouchableOpacity
                style={[
                  styles.commentSend,
                  { backgroundColor: colors.cyanPrimary },
                ]}
                onPress={handleAddComment}
              >
                <Ionicons name="send" size={18} color="#080F13" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* More Options Modal */}
      <Modal
        visible={moreOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMoreOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.moreCard,
              { backgroundColor: colors.card, borderColor: colors.line },
            ]}
          >
            <Text style={[styles.moreTitle, { color: colors.textPrimary }]}>
              Reel options
            </Text>

            <TouchableOpacity
              style={[
                styles.moreOptionRow,
                { backgroundColor: colors.surface, borderColor: colors.line },
              ]}
              onPress={() => {
                if (activeReel) handleToggleSave(activeReel.id);
                setMoreOpen(false);
              }}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={colors.cyanPrimary}
              />
              <Text
                style={[styles.moreOptionText, { color: colors.textPrimary }]}
              >
                {isSaved ? 'Remove from saved' : 'Save Reel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.moreOptionRow,
                { backgroundColor: colors.surface, borderColor: colors.line },
              ]}
              onPress={() => {
                setExpandCaption((prev) => !prev);
                setMoreOpen(false);
              }}
            >
              <Ionicons
                name="closed-captioning-outline"
                size={20}
                color={colors.purpleAi}
              />
              <Text
                style={[styles.moreOptionText, { color: colors.textPrimary }]}
              >
                {expandCaption ? 'Hide full caption' : 'Show full caption'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.moreOptionRow,
                { backgroundColor: colors.surface, borderColor: colors.line },
              ]}
              onPress={() => {
                setMoreOpen(false);
                if (activeReel) handleShareReel(activeReel);
              }}
            >
              <Ionicons
                name="link-outline"
                size={20}
                color={colors.textPrimary}
              />
              <Text
                style={[styles.moreOptionText, { color: colors.textPrimary }]}
              >
                Share Reel link
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.moreCloseBtn,
                { backgroundColor: colors.surface },
              ]}
              onPress={() => setMoreOpen(false)}
            >
              <Text
                style={[
                  styles.moreCloseText,
                  { color: colors.textSecondary },
                ]}
              >
                Close
              </Text>
            </TouchableOpacity>
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
  sectionHeader: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.grid * 2.5,
    paddingBottom: Spacing.grid,
  },
  sectionTitle: { ...Typography.title },
  sectionSubtitle: { ...Typography.label, marginTop: 2 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.grid * 1.5,
  },
  leftTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  pillText: { ...Typography.label },
  activeTagBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.gutter,
    marginBottom: Spacing.grid,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
  },
  activeTagLabel: { ...Typography.caption, fontWeight: '700' },
  clearTagText: { ...Typography.caption },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.gutter,
  },
  stage: {
    flex: 1,
    marginHorizontal: Spacing.gutter,
    marginBottom: Spacing.gutter,
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.cardPadding,
    justifyContent: 'space-between',
  },
  stageTopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reelTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  reelTagText: { ...Typography.caption, fontWeight: '700' },
  captionToggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  captionToggleText: { ...Typography.caption, fontWeight: '600' },
  captionOverlay: {
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    padding: Spacing.cardPadding,
    marginRight: 60,
    gap: 8,
  },
  burnedCaption: { ...Typography.bodyStrong },
  transcriptText: { ...Typography.label, lineHeight: 19 },
  actionRail: {
    position: 'absolute',
    right: Spacing.cardPadding,
    bottom: 130,
    gap: 14,
    alignItems: 'center',
  },
  railBtn: { alignItems: 'center', minWidth: Spacing.minTapTarget },
  railCount: { ...Typography.caption, marginTop: 2 },
  authorBlock: { gap: Spacing.grid * 1.5, marginRight: 60 },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.grid * 2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.label, fontWeight: '700' },
  authorName: { ...Typography.bodyStrong },
  handleText: { ...Typography.caption },
  followChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Spacing.radiusPill,
    borderWidth: 1,
  },
  followChipText: { ...Typography.caption, fontWeight: '700' },
  reelDesc: { ...Typography.body },
  hashtagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  hashtagChip: {
    borderWidth: 1,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hashtagText: { ...Typography.caption, fontWeight: '600' },
  audioStrip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  audioText: { ...Typography.caption, flex: 1 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '75%',
    minHeight: '45%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingBottom: Spacing.gutter,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.grid * 2.5,
    borderBottomWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: { ...Typography.bodyStrong, fontSize: 16 },
  commentsList: { padding: Spacing.gutter, gap: 10 },
  commentItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  commentTop: { flexDirection: 'row', justifyContent: 'space-between' },
  commentAuthor: { ...Typography.label, fontWeight: '700' },
  commentTime: { ...Typography.caption },
  commentBody: { ...Typography.body },
  commentComposer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.gutter,
    paddingTop: 8,
  },
  commentInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: Spacing.gutter,
    ...Typography.body,
  },
  commentSend: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: Spacing.cardPadding,
    gap: 12,
  },
  moreTitle: { ...Typography.heading, marginBottom: 4 },
  moreOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
  },
  moreOptionText: { ...Typography.body },
  moreCloseBtn: {
    minHeight: 44,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  moreCloseText: { ...Typography.bodyStrong },
});