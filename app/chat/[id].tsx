// app/chat/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
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
import { ChatMessage, useChats } from '../../src/store/chatStore';
import { useAppTheme } from '../../src/store/themeStore';

export default function ChatDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    draft?: string;
  }>();

  const chatId = params.id ?? '22222222-2222-2222-2222-222222222222';
  const { threads, messagesByChat, markAsRead, sendMessage } = useChats();

  const currentThread = threads.find((t) => t.id === chatId);
  const titleName = params.name ?? currentThread?.name ?? 'Conversation';

  const [draft, setDraft] = useState(params.draft ?? '');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const messages = messagesByChat[chatId] ?? [];

  useEffect(() => {
    markAsRead(chatId);
  }, [chatId, markAsRead]);

  useEffect(() => {
    if (params.draft) {
      setDraft(params.draft);
    }
  }, [params.draft]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(chatId, draft);
    setDraft('');
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.base }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {titleName}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {currentThread?.isGroup ? 'Group channel' : 'Direct message'}
          </Text>
        </View>

        <View style={styles.rightSpacer} />
      </View>

      <View
        style={[styles.whiteDivider, { backgroundColor: colors.divider }]}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContent}
          ListEmptyComponent={
            <StateView
              variant="empty"
              icon="chatbubbles-outline"
              title="Aucun message dans ce fil"
              description="Envoie le premier message pour démarrer la discussion."
            />
          }
          renderItem={({ item }) => {
            const isMe = item.sender === 'me';
            return (
              <View
                style={[
                  styles.bubble,
                  isMe
                    ? {
                        alignSelf: 'flex-end',
                        backgroundColor: colors.myBubbleBg,
                        borderColor: colors.myBubbleBorder,
                      }
                    : {
                        alignSelf: 'flex-start',
                        backgroundColor: colors.card,
                        borderColor: colors.line,
                      },
                ]}
              >
                {!isMe && item.senderName && (
                  <Text
                    style={[styles.senderLabel, { color: colors.cyanPrimary }]}
                  >
                    {item.senderName}
                  </Text>
                )}
                <Text
                  style={[styles.bubbleText, { color: colors.textPrimary }]}
                >
                  {item.text}
                </Text>
                <Text
                  style={[styles.bubbleTime, { color: colors.textSecondary }]}
                >
                  {item.time} {isMe ? '✓✓' : ''}
                </Text>
              </View>
            );
          }}
        />

        <View
          style={[
            styles.composerBar,
            {
              borderTopColor: colors.line,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.line,
                color: colors.textPrimary,
              },
            ]}
            placeholder="Write a message..."
            placeholderTextColor={colors.textSecondary}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.cyanPrimary }]}
            activeOpacity={0.85}
            onPress={handleSend}
          >
            <Ionicons name="send" size={20} color="#080F13" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const topCameraOffset =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 16;

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    paddingTop: topCameraOffset,
    paddingBottom: Spacing.grid * 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Spacing.radiusPill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: { ...Typography.heading, fontSize: 18 },
  headerSub: { ...Typography.caption, marginTop: 2 },
  rightSpacer: { width: 40 },
  whiteDivider: { height: 1, opacity: 0.9 },
  messagesContent: {
    padding: Spacing.gutter,
    paddingBottom: 24,
    gap: 12,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: 18,
    padding: Spacing.cardPadding,
    borderWidth: 1,
  },
  senderLabel: {
    ...Typography.caption,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleText: { ...Typography.body },
  bubbleTime: {
    ...Typography.caption,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.grid * 2,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: 10,
    ...Typography.body,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: Spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});