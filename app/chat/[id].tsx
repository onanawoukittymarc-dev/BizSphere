// app/chat/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function ConversationScreen() {
  const { name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [showAiBlock, setShowAiBlock] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const smartReply =
    "Agreed — I'll cut slide 6 to a single revenue line and move the segment breakdown to the appendix.";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AM</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{name || 'Amina Mbarga'}</Text>
          <Text style={styles.headerSub}>Online</Text>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push('/(tabs)/meet')}
          accessibilityLabel="Video call"
        >
          <Ionicons name="videocam-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setIsOffline(!isOffline)}
          accessibilityLabel="Toggle offline state"
        >
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Offline Banner (Screen 09) */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color={Colors.warning} />
          <Text style={styles.offlineText}>
            You're offline — messages will send when you reconnect
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.dateDivider}>TODAY</Text>

        {/* Incoming Bubble */}
        <View style={styles.incomingBubble}>
          <Text style={styles.senderTag}>Amina</Text>
          <Text style={styles.bubbleText}>
            Morning — did you get a chance to look at the Q4 deck?
          </Text>
          <Text style={styles.timeText}>9:31</Text>
        </View>

        {/* Outgoing Bubble */}
        <View style={styles.outgoingBubble}>
          <Text style={styles.bubbleText}>
            Yes, halfway through. Slide 6 is the one I want to talk about.
          </Text>
          <Text style={styles.timeTextOutgoing}>9:33 ✓✓</Text>
        </View>

        {/* Voice Note + Whisper Transcript */}
        <View style={styles.incomingBubble}>
          <Text style={styles.bubbleText}>
            Same. The revenue chart is doing too much.
          </Text>
          <Text style={styles.timeText}>9:34</Text>
        </View>

        <View style={styles.incomingBubble}>
          <View style={styles.voiceRow}>
            <TouchableOpacity style={styles.playBtn}>
              <Ionicons name="play" size={16} color={Colors.base} />
            </TouchableOpacity>
            <View style={styles.waveformPlaceholder}>
              <View style={styles.waveBarActive} />
              <View style={styles.waveBarIdle} />
            </View>
            <Text style={styles.timeText}>0:24</Text>
          </View>
          <Text style={styles.transcriptText}>
            "Let's cut it to one line and put the breakdown in the appendix."
          </Text>
        </View>

        {/* AI Block — Attributable & Explicit Insert (Screen 02 & 07) */}
        {showAiBlock && (
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiBadgeRow}>
                <Ionicons name="sparkles" size={14} color={Colors.purpleAi} />
                <Text style={styles.aiBadgeText}>AI-GENERATED · SMART REPLY</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAiBlock(false)}>
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.aiContent}>{smartReply}</Text>
            <View style={styles.aiActions}>
              <TouchableOpacity
                style={styles.aiPrimaryBtn}
                onPress={() => setMessage(smartReply)}
              >
                <Text style={styles.aiPrimaryBtnText}>Insert as my message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aiSecondaryBtn}>
                <Text style={styles.aiSecondaryBtnText}>Regenerate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Composer */}
      <View style={styles.composer}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="add" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor={Colors.textSecondary}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="mic-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendBtn} onPress={() => setMessage('')}>
          <Ionicons name="send" size={18} color={Colors.base} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.grid * 2,
    paddingVertical: Spacing.grid * 2.5,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  iconBtn: {
    width: Spacing.minTapTarget,
    height: Spacing.minTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: Spacing.radiusPill,
    backgroundColor: `${Colors.cyanPrimary}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.grid * 2.5,
  },
  avatarText: { ...Typography.label, color: Colors.cyanPrimary, fontWeight: '700' },
  headerInfo: { flex: 1 },
  headerTitle: { ...Typography.bodyStrong, color: Colors.textPrimary },
  headerSub: { ...Typography.caption, color: Colors.success },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.grid * 2,
    backgroundColor: `${Colors.warning}1A`,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.grid * 2,
  },
  offlineText: { ...Typography.caption, color: Colors.warning, flex: 1 },
  scrollContent: { padding: Spacing.gutter, gap: Spacing.cardGap },
  dateDivider: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.grid,
  },
  incomingBubble: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding * 0.75,
  },
  outgoingBubble: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    backgroundColor: '#13313D',
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: `${Colors.cyanPrimary}44`,
    padding: Spacing.cardPadding * 0.75,
  },
  senderTag: {
    ...Typography.caption,
    color: Colors.cyanPrimary,
    marginBottom: 4,
  },
  bubbleText: { ...Typography.body, color: Colors.textPrimary },
  timeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timeTextOutgoing: {
    ...Typography.caption,
    color: Colors.cyanPrimary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.grid * 2.5,
    marginBottom: Spacing.grid * 2,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.cyanPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformPlaceholder: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.line,
    borderRadius: 2,
    flexDirection: 'row',
  },
  waveBarActive: {
    width: '45%',
    backgroundColor: Colors.cyanPrimary,
    borderRadius: 2,
  },
  waveBarIdle: { flex: 1 },
  transcriptText: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  aiCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.purpleAi,
    padding: Spacing.cardPadding,
    marginTop: Spacing.grid,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.grid * 2,
  },
  aiBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiBadgeText: {
    ...Typography.caption,
    color: Colors.purpleAi,
    fontWeight: '700',
  },
  aiContent: { ...Typography.body, color: Colors.textPrimary, marginBottom: Spacing.cardGap },
  aiActions: { flexDirection: 'row', gap: Spacing.grid * 2 },
  aiPrimaryBtn: {
    flex: 1,
    minHeight: Spacing.minTapTarget,
    backgroundColor: Colors.purpleAi,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.grid * 3,
  },
  aiPrimaryBtnText: { ...Typography.label, color: Colors.base, fontWeight: '700' },
  aiSecondaryBtn: {
    minHeight: Spacing.minTapTarget,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.grid * 3,
  },
  aiSecondaryBtnText: { ...Typography.label, color: Colors.textPrimary },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.grid * 2,
    paddingVertical: Spacing.grid * 2,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    gap: Spacing.grid,
  },
  input: {
    flex: 1,
    minHeight: Spacing.minTapTarget,
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusPill,
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