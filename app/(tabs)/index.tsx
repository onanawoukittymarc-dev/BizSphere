// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StateView } from '../../components/StateView';
import { Spacing, Typography } from '../../constants/theme';
import { useChats } from '../../src/store/chatStore';
import { useAppTheme } from '../../src/store/themeStore';

export default function ChatsScreen() {
  const router = useRouter();
  const { threads, createThread } = useChats();
  const { colors } = useAppTheme();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Direct' | 'Groups'>('All');

  const [newChatVisible, setNewChatVisible] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatIsGroup, setNewChatIsGroup] = useState(false);

  const totalUnread = useMemo(
    () => threads.reduce((acc, t) => acc + t.unread, 0),
    [threads]
  );

  const filteredChats = useMemo(() => {
    return threads.filter((item) => {
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
  }, [threads, search, filter]);

  const handleOpenThread = (id: string, name: string) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id, name },
    });
  };

  const handleCreateDiscussion = () => {
    const clean = newChatName.trim();
    if (!clean) return;
    const created = createThread(clean, newChatIsGroup);
    setNewChatName('');
    setNewChatIsGroup(false);
    setNewChatVisible(false);
    handleOpenThread(created.id, created.name);
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

      <View style={styles.chatsHeader}>
        <Text style={[styles.chatsTitle, { color: colors.textPrimary }]}>
          Chats
        </Text>
        <Text style={[styles.chatsSubtitle, { color: colors.textSecondary }]}>
          {totalUnread} unread · {threads.length} threads
        </Text>
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search people, groups, messages"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View
        style={[
          styles.segmentContainer,
          { backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      >
        {(['All', 'Direct', 'Groups'] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.segmentTab,
                isActive && { backgroundColor: colors.segmentActive },
              ]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color: isActive
                      ? colors.textPrimary
                      : colors.textSecondary,
                  },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <StateView
            variant="empty"
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
            style={[
              styles.chatCard,
              { backgroundColor: colors.card, borderColor: colors.line },
            ]}
            activeOpacity={0.85}
            onPress={() => handleOpenThread(item.id, item.name)}
          >
            <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <Text
                  style={[styles.chatName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  style={[styles.chatTime, { color: colors.textSecondary }]}
                >
                  {item.time}
                </Text>
              </View>

              <View style={styles.cardBottomRow}>
                <Text
                  style={[styles.chatPreview, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.preview}
                </Text>
                {item.unread > 0 && (
                  <View
                    style={[
                      styles.unreadBadge,
                      { backgroundColor: colors.cyanPrimary },
                    ]}
                  >
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={[styles.aiFab, { backgroundColor: colors.purpleAi }]}
        activeOpacity={0.85}
        onPress={() =>
          handleOpenThread(
            '22222222-2222-2222-2222-222222222222',
            'Amina Mbarga'
          )
        }
      >
        <Ionicons name="sparkles" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.cyanPrimary }]}
        activeOpacity={0.85}
        onPress={() => setNewChatVisible(true)}
      >
        <Ionicons name="add" size={30} color="#080F13" />
      </TouchableOpacity>

      <Modal
        visible={newChatVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNewChatVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.line },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Nouvelle discussion
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: colors.textSecondary }]}
            >
              Crée un fil direct ou un groupe de travail.
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
              placeholder="Nom de la personne ou du groupe..."
              placeholderTextColor={colors.textSecondary}
              value={newChatName}
              onChangeText={setNewChatName}
              autoFocus
            />

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: !newChatIsGroup
                      ? colors.cyanPrimary
                      : colors.surface,
                    borderColor: !newChatIsGroup
                      ? colors.cyanPrimary
                      : colors.line,
                  },
                ]}
                onPress={() => setNewChatIsGroup(false)}
              >
                <Text
                  style={[
                    styles.typeText,
                    {
                      color: !newChatIsGroup
                        ? '#080F13'
                        : colors.textSecondary,
                      fontWeight: !newChatIsGroup ? '700' : '500',
                    },
                  ]}
                >
                  Direct
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: newChatIsGroup
                      ? colors.cyanPrimary
                      : colors.surface,
                    borderColor: newChatIsGroup
                      ? colors.cyanPrimary
                      : colors.line,
                  },
                ]}
                onPress={() => setNewChatIsGroup(true)}
              >
                <Text
                  style={[
                    styles.typeText,
                    {
                      color: newChatIsGroup
                        ? '#080F13'
                        : colors.textSecondary,
                      fontWeight: newChatIsGroup ? '700' : '500',
                    },
                  ]}
                >
                  Group
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => setNewChatVisible(false)}
              >
                <Text
                  style={[styles.cancelText, { color: colors.textSecondary }]}
                >
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createBtn,
                  { backgroundColor: colors.cyanPrimary },
                ]}
                onPress={handleCreateDiscussion}
              >
                <Text style={styles.createText}>Créer</Text>
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
  whiteDivider: {
    height: 1,
    opacity: 0.9,
  },
  chatsHeader: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.grid * 2.5,
    paddingBottom: Spacing.grid * 2,
  },
  chatsTitle: { ...Typography.title },
  chatsSubtitle: { ...Typography.label, marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    marginHorizontal: Spacing.gutter,
    paddingHorizontal: Spacing.gutter,
    height: 48,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    marginLeft: Spacing.grid * 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
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
  segmentText: {
    ...Typography.bodyStrong,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: Spacing.gutter,
    paddingBottom: 155,
    gap: Spacing.cardGap,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
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
    color: '#FFFFFF',
    fontSize: 18,
  },
  cardBody: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    ...Typography.bodyStrong,
    fontSize: 17,
    flex: 1,
    marginRight: 8,
  },
  chatTime: { ...Typography.caption, fontSize: 13 },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreview: {
    ...Typography.label,
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    ...Typography.caption,
    color: '#080F13',
    fontWeight: '700',
  },
  aiFab: {
    position: 'absolute',
    right: Spacing.gutter * 1.25 + 6,
    bottom: Spacing.gutter * 1.5 + 76,
    width: 52,
    height: 52,
    borderRadius: Spacing.radiusPill,
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
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  modalSubtitle: { ...Typography.label },
  modalInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: Spacing.radiusMd,
    paddingHorizontal: Spacing.gutter,
    ...Typography.body,
  },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: {
    flex: 1,
    height: 38,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: { ...Typography.label },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { ...Typography.label },
  createBtn: {
    minHeight: 42,
    paddingHorizontal: 20,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    ...Typography.label,
    color: '#080F13',
    fontWeight: '700',
  },
});