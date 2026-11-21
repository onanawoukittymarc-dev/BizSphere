// app/(tabs)/meet.tsx
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

const PARTICIPANTS = [
  { id: '1', name: 'Amina', initials: 'AM', speaking: false, color: Colors.cyanPrimary },
  { id: '2', name: 'Luc', initials: 'PD', speaking: false, color: Colors.purpleAi },
  { id: '3', name: 'Kodjo', initials: 'KO', speaking: true, color: Colors.cyanPrimary },
  { id: '4', name: 'You', initials: 'You', speaking: false, color: Colors.blueInfo },
];

export default function MeetScreen() {
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  if (inCall) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Weekly design review</Text>
          <Text style={styles.subtitle}>12:04 · 4 participants</Text>
        </View>

        <View style={styles.grid}>
          {PARTICIPANTS.map((p) => (
            <View
              key={p.id}
              style={[styles.tile, p.speaking && styles.tileSpeaking]}
            >
              <View style={[styles.tileAvatar, { backgroundColor: `${p.color}22` }]}>
                <Text style={[styles.tileInitials, { color: p.color }]}>
                  {p.initials}
                </Text>
              </View>
              <Text style={styles.tileName}>{p.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statusPill}>
          <View style={styles.greenDot} />
          <Text style={styles.statusText}>Connection good · captions on</Text>
        </View>

        <View style={styles.callControls}>
          <TouchableOpacity
            style={styles.controlCircle}
            onPress={() => setMicOn(!micOn)}
          >
            <Ionicons
              name={micOn ? 'mic' : 'mic-off'}
              size={22}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlCircle}
            onPress={() => setCamOn(!camOn)}
          >
            <Ionicons
              name={camOn ? 'videocam' : 'videocam-off'}
              size={22}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlCircle}>
            <Ionicons name="hand-left-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.leaveBtn}
            onPress={() => setInCall(false)}
          >
            <Text style={styles.leaveText}>Leave</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meet</Text>
        <Text style={styles.subtitle}>Ready to join</Text>
      </View>

      <View style={styles.previewCard}>
        <View style={styles.previewAvatar}>
          <Text style={styles.previewInitials}>You</Text>
        </View>
        <Text style={styles.previewLabel}>
          {camOn ? 'Camera preview' : 'Camera is off'}
        </Text>
      </View>

      <View style={styles.lobbyToggles}>
        <TouchableOpacity
          style={[styles.toggleBtn, micOn && styles.toggleBtnActive]}
          onPress={() => setMicOn(!micOn)}
        >
          <Ionicons
            name={micOn ? 'mic' : 'mic-off'}
            size={22}
            color={micOn ? Colors.base : Colors.textPrimary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, camOn && styles.toggleBtnActive]}
          onPress={() => setCamOn(!camOn)}
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
        onPress={() => setInCall(true)}
      >
        <Text style={styles.joinBtnText}>Join now</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBtn}>
        <Ionicons name="link-outline" size={18} color={Colors.textSecondary} />
        <Text style={styles.linkBtnText}>Join with a link or code</Text>
      </TouchableOpacity>

      <View style={styles.upcomingSection}>
        <Text style={styles.sectionLabel}>STARTING SOON</Text>
        <TouchableOpacity
          style={styles.upcomingCard}
          onPress={() => setInCall(true)}
        >
          <View style={styles.upcomingAvatar}>
            <Text style={styles.upcomingInitials}>PD</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.upcomingTitle}>Weekly design review</Text>
            <Text style={styles.upcomingMeta}>10:00 · 5 people</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.base },
  header: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.gutter,
    paddingBottom: Spacing.grid * 3,
  },
  title: { ...Typography.title, color: Colors.textPrimary },
  subtitle: { ...Typography.label, color: Colors.textSecondary },
  previewCard: {
    height: 200,
    marginHorizontal: Spacing.gutter,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
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
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.cardPadding,
  },
  upcomingAvatar: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radiusPill,
    backgroundColor: `${Colors.purpleAi}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingInitials: { ...Typography.bodyStrong, color: Colors.purpleAi },
  upcomingTitle: { ...Typography.bodyStrong, color: Colors.textPrimary },
  upcomingMeta: { ...Typography.label, color: Colors.textSecondary },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.gutter,
    gap: Spacing.cardGap,
  },
  tile: {
    width: '48%',
    height: '47%',
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
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
  leaveBtn: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveText: { ...Typography.bodyStrong, color: Colors.base },
});