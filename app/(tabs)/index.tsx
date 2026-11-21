// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
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
import { Colors, Spacing, Typography } from '../../constants/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface ChatItem {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  isGroup: boolean;
  avatarBg: string;
}

interface AiTurn {
  id: string;
  prompt: string;
  time: string;
  summaryTitle: string;
  bullets: string[];
  sources: string;
}

interface VoiceReminder {
  id: string;
  title: string;
  delaySeconds: number;
  audioUri: string | null;
  durationSec: number;
  scheduledAtLabel: string;
}

const CHATS_DATA: ChatItem[] = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Amina Mbarga',
    initials: 'AM',
    preview: 'The Q4 deck is ready — can ...',
    time: '9:38',
    unread: 2,
    isGroup: false,
    avatarBg: '#0E7490',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Product Design',
    initials: 'PD',
    preview: 'Luc: pushed the new tokens ...',
    time: '9:12',
    unread: 1,
    isGroup: true,
    avatarBg: '#7C3AED',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Kodjo Owona',
    initials: 'KO',
    preview: 'Voice message · 0:24',
    time: '8:55',
    unread: 0,
    isGroup: false,
    avatarBg: '#059669',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Finance · Ops',
    initials: 'FN',
    preview: 'You: invoice approved, t...',
    time: 'Yesterday',
    unread: 0,
    isGroup: true,
    avatarBg: '#D97706',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Sarah Bell',
    initials: 'SB',
    preview: 'Can we move the call t...',
    time: 'Yesterday',
    unread: 0,
    isGroup: false,
    avatarBg: '#2563EB',
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Amina Mbarga',
    initials: 'AM',
    preview: 'Perfect, sending it now.',
    time: 'Mon',
    unread: 0,
    isGroup: false,
    avatarBg: '#0891B2',
  },
];

const INITIAL_AI_TURNS: AiTurn[] = [
  {
    id: 'turn-1',
    prompt:
      'Summarise what the design team decided about the Q4 deck this morning.',
    time: '9:44',
    summaryTitle: 'Three decisions:',
    bullets: [
      '1. Slide 6 becomes a single revenue line.',
      '2. Segment breakdown moves to the appendix.',
      '3. Final review is Thursday 11:00.',
    ],
    sources: 'Sources · Product Design (9:12) · Amina Mbarga (9:34)',
  },
];

export default function ChatsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Direct' | 'Groups'>('All');

  // AI Hub Modal State: null (closed) | 'menu' (Ask / Remind choice) | 'ask' | 'remind'
  const [aiMode, setAiMode] = useState<'menu' | 'ask' | 'remind' | null>(null);

  // Ask (@BizAI) state
  const [aiTurns, setAiTurns] = useState<AiTurn[]>(INITIAL_AI_TURNS);
  const [askInput, setAskInput] = useState('');

  // Remind (Voice Note + System Notification) state
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [lastAudioUri, setLastAudioUri] = useState<string | null>(null);
  const [reminderNote, setReminderNote] = useState('');
  const [delayMinutes, setDelayMinutes] = useState<number>(1);
  const [reminders, setReminders] = useState<VoiceReminder[]>([]);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const filteredChats = useMemo(() => {
    return CHATS_DATA.filter((item) => {
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Direct' && !item.isGroup) ||
        (filter === 'Groups' && item.isGroup);
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.preview.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [search, filter]);

  const buildAiResponse = (question: string): Omit<AiTurn, 'id' | 'prompt' | 'time'> => {
    const cleanQ = question.trim();
    return {
      summaryTitle: 'Key points for your request:',
      bullets: [
        `1. Focus answer on: "${cleanQ}"`,
        '2. Cross-checked against active team context and notes.',
        '3. Ready to insert into any chat or refine further.',
      ],
      sources: 'Sources · BizAI Workspace · Recent Threads',
    };
  };

  const handleSendAsk = () => {
    const trimmed = askInput.trim();
    if (!trimmed) return;
    const generated = buildAiResponse(trimmed);
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    setAiTurns((prev) => [
      ...prev,
      {
        id: `turn-${Date.now()}`,
        prompt: trimmed,
        time: timeStr,
        ...generated,
      },
    ]);
    setAskInput('');
  };

  const handleRegenerateTurn = (turnId: string) => {
    setAiTurns((prev) =>
      prev.map((t) => {
        if (t.id !== turnId) return t;
        const alt = buildAiResponse(`${t.prompt} (refined)`);
        return {
          ...t,
          bullets: [
            '1. Condensed summary with clear action items.',
            '2. Ownership and deadline aligned with team sync.',
            '3. Updated draft ready for quick insertion.',
          ],
          sources: alt.sources,
        };
      })
    );
  };

  const handleInsertToChat = (turn: AiTurn) => {
    const draft = `${turn.summaryTitle}\n${turn.bullets.join('\n')}`;
    setAiMode(null);
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Amina Mbarga',
        draft,
      },
    });
  };

  const startVoiceRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission micro requise',
          'Autorise l’accès au microphone pour enregistrer un rappel vocal.'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setRecordSeconds(0);
      setLastAudioUri(null);
      setIsRecording(true);
    } catch {
      Alert.alert('Erreur audio', 'Impossible de démarrer l’enregistrement vocal.');
    }
  };

  const stopVoiceRecording = async () => {
    try {
      const rec = recordingRef.current;
      if (!rec) return;
      setIsRecording(false);
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;
      setLastAudioUri(uri ?? null);
    } catch {
      setIsRecording(false);
    }
  };

  const playVoiceUri = async (uri: string | null) => {
    if (!uri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      await sound.playAsync();
    } catch {
      Alert.alert('Lecture impossible', 'Aucun fichier audio lisible.');
    }
  };

  const scheduleReminderNotification = async () => {
    const labelText =
      reminderNote.trim() ||
      (lastAudioUri
        ? `Voice reminder (${recordSeconds}s)`
        : 'Task reminder from BizAI');

    const triggerSeconds = Math.max(5, delayMinutes * 60);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'BizAI Reminder',
          body: labelText,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerSeconds,
        },
      });

      const fireDate = new Date(Date.now() + triggerSeconds * 1000);
      const timeLabel = `${fireDate.getHours()}:${String(
        fireDate.getMinutes()
      ).padStart(2, '0')}`;

      const newRem: VoiceReminder = {
        id: `rem-${Date.now()}`,
        title: labelText,
        delaySeconds: triggerSeconds,
        audioUri: lastAudioUri,
        durationSec: recordSeconds,
        scheduledAtLabel: `At ${timeLabel}`,
      };

      setReminders((prev) => [newRem, ...prev]);
      setReminderNote('');
      setLastAudioUri(null);
      setRecordSeconds(0);

      Alert.alert(
        'Rappel programmé',
        `BizAI te rappellera "${labelText}" à ${timeLabel}, même hors de l’application.`
      );
    } catch {
      Alert.alert(
        'Notification non planifiée',
        'Vérifie les autorisations de notifications sur ton appareil.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Centered Brand Header */}
      <View style={styles.topBrandBar}>
        <Text style={styles.brandTitle}>BizSphere</Text>
      </View>

      {/* White Divider Between BizSphere and Chats */}
      <View style={styles.whiteDivider} />

      {/* Original Chats Section Header */}
      <View style={styles.chatsHeader}>
        <Text style={styles.chatsTitle}>Chats</Text>
        <Text style={styles.chatsSubtitle}>4 unread · 2 mentions</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search people, groups, messages"
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Segmented Filter Bar */}
      <View style={styles.segmentContainer}>
        {(['All', 'Direct', 'Groups'] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.segmentTab, isActive && styles.segmentTabActive]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[styles.segmentText, isActive && styles.segmentTextActive]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chat Cards List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <StateView
            icon="search-outline"
            title="Aucune conversation trouvée"
            description="Essaie un autre mot-clé ou réinitialise les filtres."
            actionLabel="Réinitialiser"
            onAction={() => {
              setSearch('');
              setFilter('All');
            }}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/chat/[id]',
                params: { id: item.id, name: item.name },
              })
            }
          >
            <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <Text style={styles.chatName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.chatTime}>{item.time}</Text>
              </View>

              <View style={styles.cardBottomRow}>
                <Text style={styles.chatPreview} numberOfLines={1}>
                  {item.preview}
                </Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating AI Assistant Button Just Above New Chat FAB */}
      <TouchableOpacity
        style={styles.aiFab}
        activeOpacity={0.85}
        onPress={() => setAiMode('menu')}
      >
        <Ionicons name="sparkles" size={24} color={Colors.base} />
      </TouchableOpacity>

      {/* Floating Cyan Add Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: '/chat/[id]',
            params: {
              id: '22222222-2222-2222-2222-222222222222',
              name: 'Nouvelle discussion',
            },
          })
        }
      >
        <Ionicons name="add" size={30} color={Colors.base} />
      </TouchableOpacity>

      {/* AI Assistant Modal: Menu (Ask / Remind) + Ask Screen + Remind Voice Screen */}
      <Modal
        visible={aiMode !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setAiMode(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            {/* Modal Top Bar */}
            <View style={styles.modalTopBar}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="sparkles" size={18} color={Colors.purpleAi} />
                <Text style={styles.modalTitle}>
                  {aiMode === 'menu'
                    ? 'BizAI Assistant'
                    : aiMode === 'ask'
                    ? 'Ask @BizAI'
                    : 'Remind · Voice'}
                </Text>
              </View>

              <View style={styles.modalTopActions}>
                {(aiMode === 'ask' || aiMode === 'remind') && (
                  <TouchableOpacity
                    style={styles.smallSwitchBtn}
                    onPress={() =>
                      setAiMode(aiMode === 'ask' ? 'remind' : 'ask')
                    }
                  >
                    <Text style={styles.smallSwitchText}>
                      {aiMode === 'ask' ? 'Switch to Remind' : 'Switch to Ask'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setAiMode(null)}
                >
                  <Ionicons name="close" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 1) Two Options Choice: Ask & Remind */}
            {aiMode === 'menu' && (
              <View style={styles.menuOptions}>
                <TouchableOpacity
                  style={styles.optionCard}
                  activeOpacity={0.85}
                  onPress={() => setAiMode('ask')}
                >
                  <View style={[styles.optionIconBox, { backgroundColor: '#2E1E5E' }]}>
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={24}
                      color={Colors.purpleAi}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>Ask</Text>
                    <Text style={styles.optionDesc}>
                      Chat with @BizAI and ask any question, summary, or draft.
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionCard}
                  activeOpacity={0.85}
                  onPress={() => setAiMode('remind')}
                >
                  <View style={[styles.optionIconBox, { backgroundColor: '#0C3B4A' }]}>
                    <Ionicons
                      name="mic"
                      size={24}
                      color={Colors.cyanPrimary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>Remind</Text>
                    <Text style={styles.optionDesc}>
                      Leave a voice task and get reminded outside the app like Siri.
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* 2) Ask Mode — Matches BizAI Screenshot */}
            {aiMode === 'ask' && (
              <View style={styles.askContainer}>
                <ScrollView contentContainerStyle={styles.askScroll}>
                  {aiTurns.map((turn) => (
                    <View key={turn.id} style={styles.turnGroup}>
                      {/* User Question Bubble */}
                      <View style={styles.userBubble}>
                        <Text style={styles.userBubbleText}>{turn.prompt}</Text>
                        <Text style={styles.userBubbleMeta}>
                          {turn.time} ✓✓
                        </Text>
                      </View>

                      {/* Purple AI-Generated Card */}
                      <View style={styles.bizAiCard}>
                        <View style={styles.bizAiHeader}>
                          <Ionicons
                            name="sparkles"
                            size={16}
                            color={Colors.purpleAi}
                          />
                          <Text style={styles.bizAiBadge}>
                            AI-GENERATED · FROM 2 CONVERSATIONS
                          </Text>
                        </View>

                        <Text style={styles.bizAiSummaryTitle}>
                          {turn.summaryTitle}
                        </Text>
                        {turn.bullets.map((line, i) => (
                          <Text key={i} style={styles.bizAiBullet}>
                            {line}
                          </Text>
                        ))}

                        <View style={styles.bizAiDivider} />

                        <Text style={styles.bizAiSources}>{turn.sources}</Text>

                        <View style={styles.bizAiActions}>
                          <TouchableOpacity
                            style={styles.insertBtn}
                            activeOpacity={0.85}
                            onPress={() => handleInsertToChat(turn)}
                          >
                            <Text style={styles.insertBtnText}>
                              Insert as my message
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.regenBtn}
                            activeOpacity={0.85}
                            onPress={() => handleRegenerateTurn(turn.id)}
                          >
                            <Text style={styles.regenBtnText}>Regenerate</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}

                  <Text style={styles.disclaimerText}>
                    BizAI can be wrong. Check anything you'll send to a client.
                  </Text>
                </ScrollView>

                {/* Bottom Ask @BizAI Composer */}
                <View style={styles.askComposerRow}>
                  <TextInput
                    style={styles.askInput}
                    placeholder="Ask @BizAI..."
                    placeholderTextColor={Colors.textSecondary}
                    value={askInput}
                    onChangeText={setAskInput}
                    onSubmitEditing={handleSendAsk}
                  />
                  <TouchableOpacity
                    style={styles.askSendFab}
                    activeOpacity={0.85}
                    onPress={handleSendAsk}
                  >
                    <Ionicons name="send" size={20} color={Colors.base} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 3) Remind Mode — Voice Message + Out-of-App Notification */}
            {aiMode === 'remind' && (
              <ScrollView contentContainerStyle={styles.remindScroll}>
                <View style={styles.voiceCard}>
                  <Text style={styles.remindLabel}>
                    RECORD YOUR TASK BY VOICE
                  </Text>
                  <Text style={styles.remindHint}>
                    Speak the task you want BizAI to remind you about, even outside the app.
                  </Text>

                  <View style={styles.recordCenter}>
                    <TouchableOpacity
                      style={[
                        styles.micCircle,
                        isRecording && styles.micCircleRecording,
                      ]}
                      activeOpacity={0.85}
                      onPress={
                        isRecording ? stopVoiceRecording : startVoiceRecording
                      }
                    >
                      <Ionicons
                        name={isRecording ? 'stop' : 'mic'}
                        size={30}
                        color={Colors.base}
                      />
                    </TouchableOpacity>
                    <Text style={styles.timerText}>
                      {isRecording
                        ? `Recording... ${recordSeconds}s`
                        : lastAudioUri
                        ? `Voice note saved (${recordSeconds}s)`
                        : 'Tap mic to record'}
                    </Text>

                    {lastAudioUri && !isRecording && (
                      <TouchableOpacity
                        style={styles.playSampleBtn}
                        onPress={() => playVoiceUri(lastAudioUri)}
                      >
                        <Ionicons
                          name="play"
                          size={16}
                          color={Colors.cyanPrimary}
                        />
                        <Text style={styles.playSampleText}>Listen voice note</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput
                    style={styles.noteInput}
                    placeholder="Optional label (e.g. Call supplier at 3pm)"
                    placeholderTextColor={Colors.textSecondary}
                    value={reminderNote}
                    onChangeText={setReminderNote}
                  />

                  <Text style={styles.remindLabel}>REMIND ME IN</Text>
                  <View style={styles.delayRow}>
                    {[1, 5, 15, 30].map((mins) => {
                      const selected = delayMinutes === mins;
                      return (
                        <TouchableOpacity
                          key={mins}
                          style={[
                            styles.delayChip,
                            selected && styles.delayChipActive,
                          ]}
                          onPress={() => setDelayMinutes(mins)}
                        >
                          <Text
                            style={[
                              styles.delayChipText,
                              selected && styles.delayChipTextActive,
                            ]}
                          >
                            {mins} min
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.scheduleBtn}
                    activeOpacity={0.85}
                    onPress={scheduleReminderNotification}
                  >
                    <Ionicons
                      name="notifications"
                      size={18}
                      color={Colors.base}
                    />
                    <Text style={styles.scheduleBtnText}>
                      Set reminder (even outside app)
                    </Text>
                  </TouchableOpacity>
                </View>

                {reminders.length > 0 && (
                  <View style={styles.savedRemindersBox}>
                    <Text style={styles.remindLabel}>SCHEDULED REMINDERS</Text>
                    {reminders.map((rem) => (
                      <View key={rem.id} style={styles.reminderItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.reminderItemTitle}>
                            {rem.title}
                          </Text>
                          <Text style={styles.reminderItemMeta}>
                            {rem.scheduledAtLabel}
                          </Text>
                        </View>
                        {rem.audioUri && (
                          <TouchableOpacity
                            style={styles.miniPlayBtn}
                            onPress={() => playVoiceUri(rem.audioUri)}
                          >
                            <Ionicons
                              name="volume-high"
                              size={18}
                              color={Colors.cyanPrimary}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  chatsHeader: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.grid * 2.5,
    paddingBottom: Spacing.grid * 2,
  },
  chatsTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  chatsSubtitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.line,
    marginHorizontal: Spacing.gutter,
    paddingHorizontal: Spacing.gutter,
    height: 48,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.grid * 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.line,
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.cardGap,
    marginBottom: Spacing.cardGap,
    padding: 4,
  },
  segmentTab: {
    flex: 1,
    height: 36,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActive: {
    backgroundColor: '#253349',
  },
  segmentText: {
    ...Typography.bodyStrong,
    color: Colors.textSecondary,
    fontSize: 15,
  },
  segmentTextActive: {
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: Spacing.gutter,
    paddingBottom: 155,
    gap: Spacing.cardGap,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.cardGap,
  },
  avatarText: {
    ...Typography.heading,
    color: Colors.textPrimary,
    fontSize: 18,
  },
  cardBody: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    ...Typography.bodyStrong,
    color: Colors.textPrimary,
    fontSize: 17,
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreview: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.cyanPrimary,
    minWidth: 24,
    height: 24,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    ...Typography.caption,
    color: Colors.base,
    fontWeight: '700',
  },
  aiFab: {
    position: 'absolute',
    right: Spacing.gutter * 1.25 + 6,
    bottom: Spacing.gutter * 1.5 + 76,
    width: 52,
    height: 52,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.purpleAi,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fab: {
    position: 'absolute',
    right: Spacing.gutter * 1.25,
    bottom: Spacing.gutter * 1.5,
    width: 64,
    height: 64,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.cyanPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '90%',
    minHeight: '55%',
    backgroundColor: Colors.base,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingBottom: Spacing.gutter,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.grid * 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    ...Typography.bodyStrong,
    color: Colors.textPrimary,
    fontSize: 17,
  },
  modalTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smallSwitchBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Spacing.radiusPill,
  },
  smallSwitchText: {
    ...Typography.caption,
    color: Colors.cyanPrimary,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  menuOptions: {
    padding: Spacing.gutter,
    gap: Spacing.cardGap,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.cardGap,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
  },
  optionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    ...Typography.bodyStrong,
    color: Colors.textPrimary,
    fontSize: 18,
    marginBottom: 4,
  },
  optionDesc: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  askContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  askScroll: {
    padding: Spacing.gutter,
    gap: Spacing.cardGap,
  },
  turnGroup: {
    gap: Spacing.cardGap,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '84%',
    backgroundColor: '#123846',
    borderWidth: 1,
    borderColor: '#1F637A',
    borderRadius: 18,
    padding: Spacing.cardPadding,
  },
  userBubbleText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  userBubbleMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  bizAiCard: {
    backgroundColor: '#1B182E',
    borderWidth: 1.5,
    borderColor: '#6D4AFF',
    borderRadius: 20,
    padding: Spacing.cardPadding,
  },
  bizAiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  bizAiBadge: {
    ...Typography.caption,
    color: Colors.purpleAi,
    fontWeight: '700',
    letterSpacing: 0.4,
    flex: 1,
  },
  bizAiSummaryTitle: {
    ...Typography.bodyStrong,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  bizAiBullet: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bizAiDivider: {
    height: 1,
    backgroundColor: '#362F5E',
    marginVertical: 12,
  },
  bizAiSources: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  bizAiActions: {
    flexDirection: 'row',
    gap: 10,
  },
  insertBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: '#A78BFA',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  insertBtnText: {
    ...Typography.label,
    color: '#0C0A17',
    fontWeight: '700',
  },
  regenBtn: {
    minHeight: 44,
    backgroundColor: '#161424',
    borderWidth: 1,
    borderColor: '#3B355C',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  regenBtnText: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  askComposerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.gutter,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: Colors.base,
  },
  askInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: Spacing.gutter,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  askSendFab: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.cyanPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remindScroll: {
    padding: Spacing.gutter,
    gap: Spacing.cardGap,
  },
  voiceCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
    gap: 12,
  },
  remindLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  remindHint: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  recordCenter: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  micCircle: {
    width: 72,
    height: 72,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.cyanPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micCircleRecording: {
    backgroundColor: Colors.danger,
  },
  timerText: {
    ...Typography.bodyStrong,
    color: Colors.textPrimary,
  },
  playSampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Spacing.radiusPill,
  },
  playSampleText: {
    ...Typography.label,
    color: Colors.cyanPrimary,
    fontWeight: '600',
  },
  noteInput: {
    height: 46,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Spacing.radiusMd,
    paddingHorizontal: Spacing.gutter,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  delayRow: {
    flexDirection: 'row',
    gap: 8,
  },
  delayChip: {
    flex: 1,
    height: 38,
    borderRadius: Spacing.radiusMd,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delayChipActive: {
    backgroundColor: Colors.purpleAi,
    borderColor: Colors.purpleAi,
  },
  delayChipText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  delayChipTextActive: {
    color: Colors.base,
    fontWeight: '700',
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: Spacing.radiusMd,
    backgroundColor: Colors.cyanPrimary,
    marginTop: 4,
  },
  scheduleBtnText: {
    ...Typography.bodyStrong,
    color: Colors.base,
  },
  savedRemindersBox: {
    gap: 10,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
  },
  reminderItemTitle: {
    ...Typography.bodyStrong,
    color: Colors.textPrimary,
  },
  reminderItemMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  miniPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});