// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
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
import { Colors, Spacing, Typography } from '../../constants/theme';

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

export default function ChatsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Direct' | 'Groups'>('All');

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
        onPress={() =>
          router.push({
            pathname: '/chat/[id]',
            params: {
              id: '22222222-2222-2222-2222-222222222222',
              name: 'IA Assistant',
            },
          })
        }
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
});