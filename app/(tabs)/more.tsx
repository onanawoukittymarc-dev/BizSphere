// app/(tabs)/more.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StateView } from '../../components/StateView';
import { Spacing, Typography } from '../../constants/theme';
import { useAppTheme } from '../../src/store/themeStore';

interface AccountProfile {
  name: string;
  about: string;
  phone: string;
  email: string;
  role: string;
  photoUri: string | null;
  avatarBg: string;
}

const AVATAR_SWATCHES = ['#0E7490', '#7C3AED', '#059669', '#2563EB', '#D97706'];

function getSafeImagePicker(): any | null {
  try {
    return require('expo-image-picker');
  } catch {
    return null;
  }
}

export default function MoreScreen() {
  const { themeMode, setThemeMode, colors } = useAppTheme();

  const [profile, setProfile] = useState<AccountProfile>({
    name: 'Marc Stephane',
    about: 'Deep work · Calm Command Center',
    phone: '+237 6 90 00 00 00',
    email: 'marc.stephane@bizsphere.app',
    role: 'COO · BizSphere Workspace',
    photoUri: null,
    avatarBg: '#0E7490',
  });

  const [pushAlerts, setPushAlerts] = useState(true);
  const [aiDigests, setAiDigests] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [alwaysCaptions, setAlwaysCaptions] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftAbout, setDraftAbout] = useState(profile.about);
  const [draftPhone, setDraftPhone] = useState(profile.phone);
  const [draftEmail, setDraftEmail] = useState(profile.email);
  const [draftPhotoUri, setDraftPhotoUri] = useState<string | null>(
    profile.photoUri
  );
  const [draftAvatarBg, setDraftAvatarBg] = useState(profile.avatarBg);

  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const openEditProfile = () => {
    setDraftName(profile.name);
    setDraftAbout(profile.about);
    setDraftPhone(profile.phone);
    setDraftEmail(profile.email);
    setDraftPhotoUri(profile.photoUri);
    setDraftAvatarBg(profile.avatarBg);
    setEditModalVisible(true);
  };

  const handlePickPhoto = async () => {
    const picker = getSafeImagePicker();
    if (!picker || !picker.launchImageLibraryAsync) {
      Alert.alert(
        'Sélecteur photo',
        'Choisis une couleur d’avatar ci-dessous ou installe expo-image-picker pour importer une image depuis la galerie.'
      );
      return;
    }

    try {
      if (picker.requestMediaLibraryPermissionsAsync) {
        const perm = await picker.requestMediaLibraryPermissionsAsync();
        if (perm && perm.granted === false) {
          Alert.alert(
            'Permission refusée',
            'Autorise l’accès à la galerie pour choisir une photo de profil.'
          );
          return;
        }
      }

      const result = await picker.launchImageLibraryAsync({
        mediaTypes: picker.MediaTypeOptions?.Images ?? ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setDraftPhotoUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert(
        'Galerie indisponible',
        'Impossible d’ouvrir la galerie photo dans cet environnement.'
      );
    }
  };

  const handleSaveProfile = () => {
    const cleanName = draftName.trim();
    if (!cleanName) {
      Alert.alert('Nom requis', 'Entre un nom valide pour ton compte.');
      return;
    }

    setProfile({
      name: cleanName,
      about: draftAbout.trim() || 'Available on BizSphere',
      phone: draftPhone.trim() || profile.phone,
      email: draftEmail.trim() || profile.email,
      role: profile.role,
      photoUri: draftPhotoUri,
      avatarBg: draftAvatarBg,
    });
    setEditModalVisible(false);
    setFeedbackBanner('Informations du compte et photo de profil enregistrées.');
  };

  const handleExportSummary = async () => {
    const summaryText = [
      `BizSphere Workspace Summary`,
      `Name: ${profile.name} (${profile.role})`,
      `About: ${profile.about}`,
      `Phone: ${profile.phone} · Email: ${profile.email}`,
      `Theme: ${themeMode.toUpperCase()}`,
      `Preferences: Push=${pushAlerts ? 'ON' : 'OFF'}, AI Digests=${aiDigests ? 'ON' : 'OFF'}, Focus=${focusMode ? 'ON' : 'OFF'}, Captions=${alwaysCaptions ? 'ON' : 'OFF'}, ReducedMotion=${reducedMotion ? 'ON' : 'OFF'}`,
    ].join('\n');

    try {
      await Share.share({ message: summaryText });
      setFeedbackBanner('Résumé exporté avec succès.');
    } catch {
      Alert.alert('Export impossible', 'Le partage n’a pas pu être ouvert.');
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Réinitialiser les préférences',
      'Veux-tu rétablir les paramètres par défaut de BizSphere ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => {
            setThemeMode('dark');
            setPushAlerts(true);
            setAiDigests(true);
            setFocusMode(false);
            setAlwaysCaptions(true);
            setReducedMotion(false);
            setFeedbackBanner('Paramètres rétablis par défaut.');
          },
        },
      ]
    );
  };

  const initials =
    profile.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'MS';

  const draftInitials =
    draftName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'MS';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.base }]}>
      <View style={styles.topBrandBar}>
        <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
          BizSphere
        </Text>
      </View>

      <View style={[styles.topDivider, { backgroundColor: colors.divider }]} />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          More
        </Text>
        <Text
          style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
        >
          Account, appearance, preferences, and accessibility
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {feedbackBanner && (
          <View
            style={[
              styles.feedbackCard,
              {
                backgroundColor: `${colors.success}18`,
                borderColor: `${colors.success}55`,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.success}
            />
            <Text style={[styles.feedbackText, { color: colors.textPrimary }]}>
              {feedbackBanner}
            </Text>
            <TouchableOpacity onPress={() => setFeedbackBanner(null)}>
              <Ionicons
                name="close"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
          ACCOUNT & PROFILE
        </Text>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <View style={styles.profileTop}>
            <TouchableOpacity
              style={[
                styles.profileAvatarWrap,
                {
                  backgroundColor: profile.photoUri
                    ? colors.surface
                    : profile.avatarBg,
                  borderColor: colors.cyanPrimary,
                },
              ]}
              activeOpacity={0.85}
              onPress={openEditProfile}
            >
              {profile.photoUri ? (
                <Image
                  source={{ uri: profile.photoUri }}
                  style={styles.profilePhoto}
                />
              ) : (
                <Text style={styles.profileInitials}>{initials}</Text>
              )}
              <View
                style={[
                  styles.cameraBadge,
                  {
                    backgroundColor: colors.cyanPrimary,
                    borderColor: colors.card,
                  },
                ]}
              >
                <Ionicons name="camera" size={13} color="#080F13" />
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text
                style={[styles.profileName, { color: colors.textPrimary }]}
              >
                {profile.name}
              </Text>
              <Text style={[styles.profileRole, { color: colors.purpleAi }]}>
                {profile.role}
              </Text>
              <Text
                style={[styles.profileStatus, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {profile.about}
              </Text>
            </View>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: colors.line }]} />

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.cyanPrimary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  About
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {profile.about}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="call-outline"
                size={18}
                color={colors.cyanPrimary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  Phone
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {profile.phone}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={colors.cyanPrimary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  Email
                </Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {profile.email}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: colors.cyanPrimary }]}
            activeOpacity={0.85}
            onPress={openEditProfile}
          >
            <Ionicons name="create-outline" size={16} color="#080F13" />
            <Text style={styles.editBtnText}>Edit profile & photo</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
          APPEARANCE (DARK / LIGHT)
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <View style={styles.themeCardInner}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={themeMode === 'dark' ? 'moon' : 'sunny'}
                size={20}
                color={
                  themeMode === 'dark' ? colors.purpleAi : colors.cyanPrimary
                }
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.settingTitle, { color: colors.textPrimary }]}
                >
                  Color theme
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  Apply Dark or Light mode across all BizSphere screens
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.themeSwitchGroup,
                { backgroundColor: colors.base, borderColor: colors.line },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === 'dark' && {
                    backgroundColor: colors.cyanPrimary,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setThemeMode('dark');
                  setFeedbackBanner('Thème sombre (Dark) appliqué partout.');
                }}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        themeMode === 'dark'
                          ? '#080F13'
                          : colors.textSecondary,
                      fontWeight: themeMode === 'dark' ? '700' : '500',
                    },
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === 'light' && {
                    backgroundColor: colors.cyanPrimary,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setThemeMode('light');
                  setFeedbackBanner('Thème clair (Light) appliqué partout.');
                }}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        themeMode === 'light'
                          ? '#080F13'
                          : colors.textSecondary,
                      fontWeight: themeMode === 'light' ? '700' : '500',
                    },
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
          NOTIFICATIONS & ASSISTANT
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.cyanPrimary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.settingTitle, { color: colors.textPrimary }]}
                >
                  Push notifications
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  Alerts for direct messages, mentions, and reminders
                </Text>
              </View>
            </View>
            <Switch
              value={pushAlerts}
              onValueChange={setPushAlerts}
              trackColor={{ false: colors.line, true: colors.cyanPrimary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: colors.line }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="sparkles-outline"
                size={20}
                color={colors.purpleAi}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.settingTitle, { color: colors.textPrimary }]}
                >
                  AI thread digests
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  Quick summaries and draft suggestions in Ask mode
                </Text>
              </View>
            </View>
            <Switch
              value={aiDigests}
              onValueChange={setAiDigests}
              trackColor={{ false: colors.line, true: colors.purpleAi }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: colors.line }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="moon-outline"
                size={20}
                color={colors.blueInfo}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.settingTitle, { color: colors.textPrimary }]}
                >
                  Calm focus mode
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  Keep non-urgent pings quiet during deep work blocks
                </Text>
              </View>
            </View>
            <Switch
              value={focusMode}
              onValueChange={setFocusMode}
              trackColor={{ false: colors.line, true: colors.blueInfo }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
          ACCESSIBILITY & ENVIRONMENT
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="closed-captioning-outline"
                size={20}
                color={colors.cyanPrimary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.settingTitle, { color: colors.textPrimary }]}
                >
                  Captions always on
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  Display captions across Stories, Reels, and Meet
                </Text>
              </View>
            </View>
            <Switch
              value={alwaysCaptions}
              onValueChange={setAlwaysCaptions}
              trackColor={{ false: colors.line, true: colors.cyanPrimary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: colors.line }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="speedometer-outline"
                size={20}
                color={colors.textSecondary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.settingTitle, { color: colors.textPrimary }]}
                >
                  Reduced motion
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  Minimize transitions for lighter device load
                </Text>
              </View>
            </View>
            <Switch
              value={reducedMotion}
              onValueChange={setReducedMotion}
              trackColor={{ false: colors.line, true: colors.cyanPrimary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
          DATA & ACTIONS
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.85}
            onPress={handleExportSummary}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="share-outline"
                size={20}
                color={colors.cyanPrimary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.settingTitle, { color: colors.textPrimary }]}
                >
                  Export workspace summary
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  Share current profile and preference snapshot
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: colors.line }]} />

          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.85}
            onPress={handleResetDefaults}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="refresh-outline"
                size={20}
                color={colors.danger}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.danger }]}>
                  Reset preferences
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.textSecondary }]}
                >
                  Restore default settings on this device
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {false && (
          <StateView
            variant="empty"
            icon="information-circle-outline"
            title="Aucune donnée supplémentaire"
            description="Tout est synchronisé."
          />
        )}

        <View style={styles.footerInfo}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            BizSphere · Expo Go runtime ·{' '}
            {themeMode === 'dark' ? 'Dark' : 'Light'} mode
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile & Photo Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.card, borderColor: colors.line },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Edit profile & photo
              </Text>
              <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
                Update your profile picture, name, about status, and contact
                info.
              </Text>

              <View style={styles.photoEditorSection}>
                <View
                  style={[
                    styles.largeAvatarPreview,
                    {
                      backgroundColor: draftPhotoUri
                        ? colors.surface
                        : draftAvatarBg,
                      borderColor: colors.cyanPrimary,
                    },
                  ]}
                >
                  {draftPhotoUri ? (
                    <Image
                      source={{ uri: draftPhotoUri }}
                      style={styles.largePhotoImg}
                    />
                  ) : (
                    <Text style={styles.largeAvatarInitials}>
                      {draftInitials}
                    </Text>
                  )}
                </View>

                <View style={styles.photoButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.photoActionBtn,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.line,
                      },
                    ]}
                    onPress={handlePickPhoto}
                  >
                    <Ionicons
                      name="image-outline"
                      size={16}
                      color={colors.cyanPrimary}
                    />
                    <Text
                      style={[
                        styles.photoActionText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      Choose photo
                    </Text>
                  </TouchableOpacity>

                  {draftPhotoUri && (
                    <TouchableOpacity
                      style={[
                        styles.photoActionBtn,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.line,
                        },
                      ]}
                      onPress={() => setDraftPhotoUri(null)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={colors.danger}
                      />
                      <Text
                        style={[
                          styles.photoActionText,
                          { color: colors.danger },
                        ]}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.swatchRow}>
                  {AVATAR_SWATCHES.map((hex) => {
                    const selected = !draftPhotoUri && draftAvatarBg === hex;
                    return (
                      <TouchableOpacity
                        key={hex}
                        style={[
                          styles.swatchDot,
                          { backgroundColor: hex },
                          selected && {
                            borderWidth: 3,
                            borderColor: colors.textPrimary,
                          },
                        ]}
                        onPress={() => {
                          setDraftPhotoUri(null);
                          setDraftAvatarBg(hex);
                        }}
                      />
                    );
                  })}
                </View>
              </View>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.line,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Display name"
                placeholderTextColor={colors.textSecondary}
                value={draftName}
                onChangeText={setDraftName}
              />

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.line,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="About (status)"
                placeholderTextColor={colors.textSecondary}
                value={draftAbout}
                onChangeText={setDraftAbout}
              />

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.line,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                value={draftPhone}
                onChangeText={setDraftPhone}
              />

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.line,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Email address"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={draftEmail}
                onChangeText={setDraftEmail}
              />

              <View style={styles.modalRow}>
                <TouchableOpacity
                  style={[
                    styles.modalCancel,
                    { backgroundColor: colors.surface },
                  ]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text
                    style={[
                      styles.modalCancelText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSave,
                    { backgroundColor: colors.cyanPrimary },
                  ]}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  topDivider: {
    height: 1,
    opacity: 0.9,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.grid * 2.5,
    paddingBottom: Spacing.grid * 1.5,
  },
  sectionTitle: { ...Typography.title },
  sectionSubtitle: { ...Typography.label, marginTop: 2 },
  scrollContent: {
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.gutter * 2.5,
    gap: 12,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: Spacing.radiusMd,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  feedbackText: { ...Typography.caption, flex: 1 },
  groupLabel: {
    ...Typography.caption,
    marginTop: 4,
    marginLeft: 2,
  },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.cardPadding,
    gap: 14,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: Spacing.radiusPill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: Spacing.radiusPill,
  },
  profileInitials: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontSize: 20,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { ...Typography.bodyStrong, fontSize: 17 },
  profileRole: { ...Typography.caption, fontWeight: '600', marginTop: 2 },
  profileStatus: { ...Typography.caption, marginTop: 2 },
  infoList: { gap: 12 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: { ...Typography.caption },
  infoValue: { ...Typography.body, fontSize: 15, marginTop: 1 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 42,
    borderRadius: Spacing.radiusMd,
  },
  editBtnText: {
    ...Typography.label,
    color: '#080F13',
    fontWeight: '700',
  },
  cardGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.cardPadding,
    gap: 10,
  },
  themeSwitchGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Spacing.radiusMd,
    padding: 3,
    gap: 4,
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Spacing.radiusSm,
  },
  themeOptionText: { ...Typography.caption },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.cardPadding,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.cardPadding,
    gap: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTitle: { ...Typography.bodyStrong, fontSize: 15 },
  settingDesc: { ...Typography.caption, marginTop: 2 },
  rowDivider: {
    height: 1,
    marginHorizontal: Spacing.cardPadding,
  },
  footerInfo: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: { ...Typography.caption },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
  },
  modalScroll: {
    flexGrow: 1,
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
  photoEditorSection: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  largeAvatarPreview: {
    width: 84,
    height: 84,
    borderRadius: Spacing.radiusPill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  largePhotoImg: {
    width: 84,
    height: 84,
    borderRadius: Spacing.radiusPill,
  },
  largeAvatarInitials: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontSize: 26,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
  },
  photoActionText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  swatchDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
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
  modalSave: {
    minHeight: 42,
    paddingHorizontal: 20,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    ...Typography.label,
    color: '#080F13',
    fontWeight: '700',
  },
});