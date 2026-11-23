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
import { Spacing, Typography } from '../../constants/theme';
import { createAgoraMeetController } from '../../src/services/agoraMeetService';
import { useAppTheme } from '../../src/store/themeStore';

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

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function MeetScreen() {
  const { colors } = useAppTheme();
  const controllerRef = useRef(createAgoraMeetController());

  const defaultMeetings: ScheduledMeeting[] = [
    {
      id: 'm-1',
      channelName: 'weekly-design-review',
      title: 'Weekly design review',
      meta: '10:00 · 5 people',
      initials: 'PD',
      accentColor: colors.purpleAi,
    },
  ];

  const [meetings, setMeetings] = useState<ScheduledMeeting[]>(defaultMeetings);
  const [activeMeeting, setActiveMeeting] = useState<ScheduledMeeting>(
    defaultMeetings[0]
  );

  const [inCall, setInCall] = useState(false);
  const [sessionMode, setSessionMode] = useState<
    'agora-native' | 'expo-go-sim'
  >('expo-go-sim');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [participants, setParticipants] = useState<ParticipantTile[]>([
    {
      id: '1',
      name: 'Amina',
      initials: 'AM',
      speaking: false,
      color: colors.cyanPrimary,
    },
    {
      id: '2',
      name: 'Luc',
      initials: 'PD',
      speaking: false,
      color: colors.purpleAi,
    },
    {
      id: '3',
      name: 'Kodjo',
      initials: 'KO',
      speaking: true,
      color: colors.cyanPrimary,
    },
    {
      id: '4',
      name: 'You',
      initials: 'You',
      speaking: false,
      color: colors.blueInfo,
    },
  ]);

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
      Alert.alert(
        'Code requis',
        'Entre un code ou un nom de salle pour rejoindre.'
      );
      return;
    }

    const slug =
      cleaned
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/^-|-$/g, '') || 'bizsphere-room';

    const customMeeting: ScheduledMeeting = {
      id: `custom-${Date.now()}`,
      channelName: slug,
      title: cleaned,
      meta: 'Live room · Agora ready',
      initials: cleaned.slice(0, 2).toUpperCase(),
      accentColor: colors.cyanPrimary,
    };

    setCodeModalVisible(false);
    setRoomCodeInput('');
    await handleJoinMeeting(customMeeting);
  };

  const activeSpeaker = participants.find((p) => p.speaking)?.name ?? 'Kodjo';

  if (inCall) {
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
            {activeMeeting.title}
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            {formatDuration(callSeconds)} · {participants.length} participants ·{' '}
            {sessionMode === 'agora-native' ? 'Agora RTC' : 'Preview mode'}
          </Text>
        </View>

        <View style={styles.grid}>
          {participants.map((p) => (
            <View
              key={p.id}
              style={[
                styles.tile,
                {
                  backgroundColor: colors.card,
                  borderColor: p.speaking ? colors.cyanPrimary : colors.line,
                  borderWidth: p.speaking ? 2 : 1,
                },
              ]}
            >
              <View
                style={[styles.tileAvatar, { backgroundColor: `${p.color}22` }]}
              >
                <Text style={[styles.tileInitials, { color: p.color }]}>
                  {p.initials}
                </Text>
              </View>
              <Text style={[styles.tileName, { color: colors.textPrimary }]}>
                {p.name}
                {p.id === '4' && handRaised ? ' ✋' : ''}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.statusPill,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
        >
          <View
            style={[styles.greenDot, { backgroundColor: colors.success }]}
          />
          <Text style={[styles.statusText, { color: colors.textPrimary }]}>
            Speaking: {activeSpeaker} · captions on
          </Text>
        </View>

        <View style={styles.callControls}>
          <TouchableOpacity
            style={[
              styles.controlCircle,
              {
                backgroundColor: colors.card,
                borderColor: !micOn ? colors.danger : colors.line,
              },
            ]}
            activeOpacity={0.85}
            onPress={handleToggleMic}
          >
            <Ionicons
              name={micOn ? 'mic' : 'mic-off'}
              size={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlCircle,
              {
                backgroundColor: colors.card,
                borderColor: !camOn ? colors.danger : colors.line,
              },
            ]}
            activeOpacity={0.85}
            onPress={handleToggleCam}
          >
            <Ionicons
              name={camOn ? 'videocam' : 'videocam-off'}
              size={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlCircle,
              {
                backgroundColor: handRaised ? colors.cyanPrimary : colors.card,
                borderColor: handRaised ? colors.cyanPrimary : colors.line,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => setHandRaised(!handRaised)}
          >
            <Ionicons
              name={handRaised ? 'hand-left' : 'hand-left-outline'}
              size={22}
              color={handRaised ? '#080F13' : colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.leaveBtn, { backgroundColor: colors.danger }]}
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
          Meet
        </Text>
        <Text
          style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
        >
          Ready to join · Agora channel bridge
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.lobbyScroll}>
        <View
          style={[
            styles.previewCard,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
        >
          <View
            style={[
              styles.previewAvatar,
              { backgroundColor: `${colors.cyanPrimary}22` },
            ]}
          >
            <Text
              style={[styles.previewInitials, { color: colors.cyanPrimary }]}
            >
              You
            </Text>
          </View>
          <Text
            style={[styles.previewLabel, { color: colors.textSecondary }]}
          >
            {camOn ? 'Camera preview ready' : 'Camera is off'} ·{' '}
            {micOn ? 'Mic on' : 'Mic muted'}
          </Text>
        </View>

        <View style={styles.lobbyToggles}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              {
                backgroundColor: micOn ? colors.cyanPrimary : colors.card,
                borderColor: micOn ? colors.cyanPrimary : colors.line,
              },
            ]}
            activeOpacity={0.85}
            onPress={handleToggleMic}
          >
            <Ionicons
              name={micOn ? 'mic' : 'mic-off'}
              size={22}
              color={micOn ? '#080F13' : colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              {
                backgroundColor: camOn ? colors.cyanPrimary : colors.card,
                borderColor: camOn ? colors.cyanPrimary : colors.line,
              },
            ]}
            activeOpacity={0.85}
            onPress={handleToggleCam}
          >
            <Ionicons
              name={camOn ? 'videocam' : 'videocam-off'}
              size={22}
              color={camOn ? '#080F13' : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.joinBtn, { backgroundColor: colors.cyanPrimary }]}
          activeOpacity={0.85}
          onPress={() => handleJoinMeeting(activeMeeting)}
        >
          <Text style={styles.joinBtnText}>Join now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.linkBtn,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
          activeOpacity={0.85}
          onPress={() => setCodeModalVisible(true)}
        >
          <Ionicons
            name="link-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text style={[styles.linkBtnText, { color: colors.textSecondary }]}>
            Join with a link or code
          </Text>
        </TouchableOpacity>

        <View style={styles.upcomingSection}>
          <Text
            style={[styles.sectionLabel, { color: colors.textSecondary }]}
          >
            STARTING SOON
          </Text>

          {meetings.length === 0 ? (
            <StateView
              variant="empty"
              icon="videocam-off-outline"
              title="Aucune réunion planifiée"
              description="Rejoins une salle par code ou recharge les sessions."
              actionLabel="Recharger"
              onAction={() => setMeetings(defaultMeetings)}
            />
          ) : (
            meetings.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.upcomingCard,
                  { backgroundColor: colors.card, borderColor: colors.line },
                ]}
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
                  <Text
                    style={[
                      styles.upcomingTitle,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.upcomingMeta,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.meta}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={codeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCodeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.line },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Join with a code
            </Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              Saisis un nom de canal ou un code de réunion pour entrer dans la
              salle.
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
              placeholder="Ex: archtek-sync-01"
              placeholderTextColor={colors.textSecondary}
              value={roomCodeInput}
              onChangeText={setRoomCodeInput}
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[
                  styles.modalCancel,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => setCodeModalVisible(false)}
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
                  styles.modalConfirm,
                  { backgroundColor: colors.cyanPrimary },
                ]}
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
    paddingBottom: Spacing.grid * 2,
  },
  sectionTitle: { ...Typography.title },
  sectionSubtitle: { ...Typography.label, marginTop: 2 },
  lobbyScroll: { paddingBottom: Spacing.gutter * 2 },
  previewCard: {
    height: 190,
    marginHorizontal: Spacing.gutter,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.grid * 3,
  },
  previewInitials: { ...Typography.heading },
  previewLabel: { ...Typography.caption },
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtn: {
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.gutter,
    minHeight: 48,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: { ...Typography.bodyStrong, color: '#080F13' },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.cardGap,
    minHeight: Spacing.minTapTarget,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
  },
  linkBtnText: { ...Typography.label },
  upcomingSection: { padding: Spacing.gutter, marginTop: Spacing.grid * 2 },
  sectionLabel: { ...Typography.caption, marginBottom: Spacing.grid * 2 },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.grid * 3,
    borderRadius: 20,
    borderWidth: 1,
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
  upcomingTitle: { ...Typography.bodyStrong },
  upcomingMeta: { ...Typography.label },
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileAvatar: {
    width: 56,
    height: 56,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.grid * 2,
  },
  tileInitials: { ...Typography.heading },
  tileName: { ...Typography.label },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: Spacing.radiusPill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: Spacing.cardGap,
  },
  greenDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...Typography.caption },
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveBtn: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveText: { ...Typography.bodyStrong, color: '#FFFFFF' },
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
    height: 46,
    borderWidth: 1,
    borderRadius: Spacing.radiusMd,
    paddingHorizontal: Spacing.gutter,
    ...Typography.body,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: { ...Typography.label },
  modalConfirm: {
    minHeight: 42,
    paddingHorizontal: 20,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    ...Typography.label,
    color: '#080F13',
    fontWeight: '700',
  },
});