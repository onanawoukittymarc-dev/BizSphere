// app/(tabs)/meet.tsx
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { createAgoraMeetController } from '../../src/services/agoraMeetService';

interface ScheduledMeeting {
  id: string;
  channelName: string;
  title: string;
  meta: string;
  initials: string;
  accentColor: string;
}

interface ParticipantTile {
  id: string;
  name: string;
  initials: string;
  speaking: boolean;
  color: string;
}

const INITIAL_MEETINGS: ScheduledMeeting[] = [
  {
    id: 'm-1',
    channelName: 'weekly-design-review',
    title: 'Weekly design review',
    meta: '10:00 · 5 people',
    initials: 'PD',
    accentColor: Colors.purpleAi,
  },
];

const INITIAL_PARTICIPANTS: ParticipantTile[] = [
  { id: '1', name: 'Amina', initials: 'AM', speaking: false, color: Colors.cyanPrimary },
  { id: '2', name: 'Luc', initials: 'PD', speaking: false, color: Colors.purpleAi },
  { id: '3', name: 'Kodjo', initials: 'KO', speaking: true, color: Colors.cyanPrimary },
  { id: '4', name: 'You', initials: 'You', speaking: false, color: Colors.blueInfo },
];

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function MeetScreen() {
  const controllerRef = useRef(createAgoraMeetController());

  const [meetings, setMeetings] = useState<ScheduledMeeting[]>(INITIAL_MEETINGS);
  const [activeMeeting, setActiveMeeting] = useState<ScheduledMeeting>({
    id: 'm-1',
    channelName: 'weekly-design-review',
    title: 'Weekly design review',
    meta: '10:00 · 5 people',
    initials: 'PD',
    accentColor: Colors.purpleAi,
  });

  const [inCall, setInCall] = useState(false);
  const [sessionMode, setSessionMode] = useState<'agora-native' | 'expo-go-sim'>('expo-go-sim');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [participants, setParticipants] = useState<ParticipantTile[]>(INITIAL_PARTICIPANTS);

  // Join with code/link modal
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');

  useEffect(() => {
    if (!inCall) {
      setCallSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    const speakerCycle = setInterval(() => {
      setParticipants((prev) => {
        const currentIdx = prev.findIndex((p) => p.speaking);
        const nextIdx = (currentIdx + 1) % prev.length;
        return prev.map((p, idx) => ({
          ...p,
          speaking: idx === nextIdx,
        }));
      });
    }, 3500);

    return () => {
      clearInterval(timer);
      clearInterval(speakerCycle);
    };
  }, [inCall]);

  const handleJoinMeeting = async (meeting: ScheduledMeeting) => {
    setActiveMeeting(meeting);
    const res = await controllerRef.current.joinRoom({
      channelName: meeting.channelName,
    });
    setSessionMode(res.mode);
    setHandRaised(false);
    setInCall(true);
  };

  const handleLeaveMeeting = async () => {
    await controllerRef.current.leaveRoom();
    setInCall(false);
    setHandRaised(false);
  };

  const handleToggleMic = async () => {
    const nextMic = !micOn;
    setMicOn(nextMic);
    await controllerRef.current.setMicrophoneMuted(!nextMic);
  };

  const handleToggleCam = async () => {
    const nextCam = !camOn;
    setCamOn(nextCam);
    await controllerRef.current.setCameraEnabled(nextCam);
  };

  const handleJoinByCode = async () => {
    const cleaned = roomCodeInput.trim();
    if (!cleaned) {
      Alert.alert('Code requis', 'Entre un code ou un nom de salle pour rejoindre.');
      return;
    }

    const slug = cleaned
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-|-$/g, '') || 'bizsphere-room';

    const customMeeting: ScheduledMeeting = {
      id: `custom-${Date.now()}`,
      channelName: slug,
      title: cleaned,
      meta: 'Live room · Agora ready',
      initials: cleaned.slice(0, 2).toUpperCase(),
      accentColor: Colors.cyanPrimary,
    };

    setCodeModalVisible(false);
    setRoomCodeInput('');
    await handleJoinMeeting(customMeeting);
  };

  const activeSpeaker = participants.find((p) => p.speaking)?.name ?? 'Kodjo';

  if (inCall) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBrandBar}>
          <Text style={styles.brandTitle}>BizSphere</Text>
        </View>
        <View style={styles.whiteDivider} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{activeMeeting.title}</Text>
          <Text style={styles.sectionSubtitle}>
            {formatDuration(callSeconds)} · {participants.length} participants ·{' '}
            {sessionMode === 'agora-native' ? 'Agora RTC' : 'Preview mode'}
          </Text>
        </View>

        <View style={styles.grid}>
          {participants.map((p) => (
            <View
              key={p.id}
              style={[styles.tile, p.speaking && styles.tileSpeaking]}
            >
              <View style={[styles.tileAvatar, { backgroundColor: `${p.color}22` }]}>
                <Text style={[styles.tileInitials, { color: p.color }]}>
                  {p.initials}
                </Text>
              </View>
              <Text style={styles.tileName}>
                {p.name}
                {p.id === '4' && handRaised ? ' ✋' : ''}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.statusPill}>
          <View style={styles.greenDot} />
          <Text style={styles.statusText}>
            Speaking: {activeSpeaker} · captions on
          </Text>
        </View>

        <View style={styles.callControls}>
          <TouchableOpacity
            style={[styles.controlCircle, !micOn && styles.controlCircleMuted]}
            activeOpacity={0.85}
            onPress={handleToggleMic}
          >
            <Ionicons
              name={micOn ? 'mic' : 'mic-off'}
              size={22}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlCircle, !camOn && styles.controlCircleMuted]}
            activeOpacity={0.85}
            onPress={handleToggleCam}
          >
            <Ionicons
              name={camOn ? 'videocam' : 'videocam-off'}
              size={22}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlCircle,
              handRaised && styles.controlCircleActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setHandRaised(!handRaised)}
          >
            <Ionicons
              name={handRaised ? 'hand-left' : 'hand-left-outline'}
              size={22}
              color={handRaised ? Colors.base : Colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.leaveBtn}
            activeOpacity={0.85}
            onPress={handleLeaveMeeting}
          >
            <Text style={styles.leaveText}>Leave</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.sectionTitle}>Meet</Text>
        <Text style={styles.sectionSubtitle}>
          Ready to join · Agora channel bridge
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.lobbyScroll}>
        <View style={styles.previewCard}>
          <View style={styles.previewAvatar}>
            <Text style={styles.previewInitials}>You</Text>
          </View>
          <Text style={styles.previewLabel}>
            {camOn ? 'Camera preview ready' : 'Camera is off'} ·{' '}
            {micOn ? 'Mic on' : 'Mic muted'}
          </Text>
        </View>

        <View style={styles.lobbyToggles}>
          <TouchableOpacity
            style={[styles.toggleBtn, micOn && styles.toggleBtnActive]}
            activeOpacity={0.85}
            onPress={handleToggleMic}
          >
            <Ionicons
              name={micOn ? 'mic' : 'mic-off'}
              size={22}
              color={micOn ? Colors.base : Colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, camOn && styles.toggleBtnActive]}
            activeOpacity={0.85}
            onPress={handleToggleCam}
          >
            <Ionicons
              name={camOn ? 'videocam' : 'videocam-off'}
              size={22}
              color={camOn ? Colors.base : Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.joinBtn}
          activeOpacity={0.85}
          onPress={() => handleJoinMeeting(activeMeeting)}
        >
          <Text style={styles.joinBtnText}>Join now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          activeOpacity={0.85}
          onPress={() => setCodeModalVisible(true)}
        >
          <Ionicons name="link-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.linkBtnText}>Join with a link or code</Text>
        </TouchableOpacity>

        <View style={styles.upcomingSection}>
          <Text style={styles.sectionLabel}>STARTING SOON</Text>

          {meetings.length === 0 ? (
            <StateView
              variant="empty"
              icon="videocam-off-outline"
              title="Aucune réunion planifiée"
              description="Rejoins une salle par code ou recharge les sessions."
              actionLabel="Recharger"
              onAction={() => setMeetings(INITIAL_MEETINGS)}
            />
          ) : (
            meetings.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.upcomingCard}
                activeOpacity={0.85}
                onPress={() => handleJoinMeeting(item)}
              >
                <View
                  style={[
                    styles.upcomingAvatar,
                    { backgroundColor: `${item.accentColor}22` },
                  ]}
                >
                  <Text
                    style={[
                      styles.upcomingInitials,
                      { color: item.accentColor },
                    ]}
                  >
                    {item.initials}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upcomingTitle}>{item.title}</Text>
                  <Text style={styles.upcomingMeta}>{item.meta}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal: Join with Link or Code */}
      <Modal
        visible={codeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCodeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Join with a code</Text>
            <Text style={styles.modalDesc}>
              Saisis un nom de canal ou un code de réunion pour entrer dans la salle.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: archtek-sync-01"
              placeholderTextColor={Colors.textSecondary}
              value={roomCodeInput}
              onChangeText={setRoomCodeInput}
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setCodeModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleJoinByCode}
              >
                <Text style={styles.modalConfirmText}>Rejoindre</Text>
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
    paddingBottom: Spacing.grid * 2,
  },
  sectionTitle: { ...Typography.title, color: Colors.textPrimary },
  sectionSubtitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  lobbyScroll: { paddingBottom: Spacing.gutter * 2 },
  previewCard: {
    height: 190,
    marginHorizontal: Spacing.gutter,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: Spacing.radiusPill,
    backgroundColor: `${Colors.cyanPrimary}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.grid * 3,
  },
  previewInitials: { ...Typography.heading, color: Colors.cyanPrimary },
  previewLabel: { ...Typography.caption, color: Colors.textSecondary },
  lobbyToggles: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.gutter,
    marginTop: Spacing.gutter,
  },
  toggleBtn: {
    width: 52,
    height: 52,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.cyanPrimary,
    borderColor: Colors.cyanPrimary,
  },
  joinBtn: {
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.gutter,
    minHeight: 48,
    borderRadius: Spacing.radiusMd,
    backgroundColor: Colors.cyanPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: { ...Typography.bodyStrong, color: Colors.base },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.cardGap,
    minHeight: Spacing.minTapTarget,
    borderRadius: Spacing.radiusMd,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  linkBtnText: { ...Typography.label, color: Colors.textSecondary },
  upcomingSection: { padding: Spacing.gutter, marginTop: Spacing.grid * 2 },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.grid * 2,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.grid * 3,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
  },
  upcomingAvatar: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingInitials: { ...Typography.bodyStrong },
  upcomingTitle: { ...Typography.bodyStrong, color: Colors.textPrimary },
  upcomingMeta: { ...Typography.label, color: Colors.textSecondary },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.gutter,
    gap: Spacing.cardGap,
  },
  tile: {
    width: '48%',
    height: '47%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSpeaking: { borderWidth: 2, borderColor: Colors.cyanPrimary },
  tileAvatar: {
    width: 56,
    height: 56,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.grid * 2,
  },
  tileInitials: { ...Typography.heading },
  tileName: { ...Typography.label, color: Colors.textPrimary },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: Spacing.cardGap,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  statusText: { ...Typography.caption, color: Colors.textPrimary },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.gutter,
  },
  controlCircle: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlCircleMuted: {
    borderColor: Colors.danger,
  },
  controlCircleActive: {
    backgroundColor: Colors.cyanPrimary,
    borderColor: Colors.cyanPrimary,
  },
  leaveBtn: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveText: { ...Typography.bodyStrong, color: Colors.base },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: Spacing.gutter,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
    gap: 12,
  },
  modalTitle: { ...Typography.heading, color: Colors.textPrimary },
  modalDesc: { ...Typography.label, color: Colors.textSecondary },
  modalInput: {
    height: 46,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Spacing.radiusMd,
    paddingHorizontal: Spacing.gutter,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  modalCancel: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: Spacing.radiusMd,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: { ...Typography.label, color: Colors.textSecondary },
  modalConfirm: {
    minHeight: 42,
    paddingHorizontal: 20,
    borderRadius: Spacing.radiusMd,
    backgroundColor: Colors.cyanPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    ...Typography.label,
    color: Colors.base,
    fontWeight: '700',
  },
});