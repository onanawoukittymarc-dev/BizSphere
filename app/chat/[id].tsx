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
import { Colors, Spacing, Typography } from '../../constants/theme';
import { ChatMessage, useChats } from '../../src/store/chatStore';

export default function ChatDetailScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {titleName}
          </Text>
          <Text style={styles.headerSub}>
            {currentThread?.isGroup ? 'Group channel' : 'Direct message'}
          </Text>
        </View>

        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.whiteDivider} />

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
                  isMe ? styles.myBubble : styles.otherBubble,
                ]}
              >
                {!isMe && item.senderName && (
                  <Text style={styles.senderLabel}>{item.senderName}</Text>
                )}
                <Text style={styles.bubbleText}>{item.text}</Text>
                <Text style={styles.bubbleTime}>
                  {item.time} {isMe ? '✓✓' : ''}
                </Text>
              </View>
            );
          }}
        />

        {/* Composer */}
        <View style={styles.composerBar}>
          <TextInput
            style={styles.input}
            placeholder="Write a message..."
            placeholderTextColor={Colors.textSecondary}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={styles.sendBtn}
            activeOpacity={0.85}
            onPress={handleSend}
          >
            <Ionicons name="send" size={20} color={Colors.base} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const topCameraOffset =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  flex: {
    flex: 1,
  },
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.textPrimary,
    fontSize: 18,
  },
  headerSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rightSpacer: {
    width: 40,
  },
  whiteDivider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
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
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#123846',
    borderColor: '#1F637A',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
    borderColor: Colors.line,
  },
  senderLabel: {
    ...Typography.caption,
    color: Colors.cyanPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  bubbleTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
    borderTopColor: Colors.line,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 20,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: 10,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: Spacing.radiusPill,
    backgroundColor: Colors.cyanPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});