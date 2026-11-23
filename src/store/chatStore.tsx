// src/store/chatsStore.tsx
import React, { createContext, useCallback, useContext, useState } from 'react';

export interface ChatThread {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  isGroup: boolean;
  avatarBg: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: 'me' | 'other';
  senderName?: string;
  text: string;
  time: string;
  status?: 'sent' | 'read';
}

const INITIAL_THREADS: ChatThread[] = [
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

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  '22222222-2222-2222-2222-222222222222': [
    {
      id: 'm-1',
      chatId: '22222222-2222-2222-2222-222222222222',
      sender: 'other',
      senderName: 'Amina Mbarga',
      text: 'The Q4 deck is ready — can you review slide 6 before noon?',
      time: '9:38',
    },
  ],
  '33333333-3333-3333-3333-333333333333': [
    {
      id: 'm-2',
      chatId: '33333333-3333-3333-3333-333333333333',
      sender: 'other',
      senderName: 'Luc',
      text: 'Luc: pushed the new tokens to the shared Figma library.',
      time: '9:12',
    },
  ],
};

function getNowTimeString(): string {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

interface ChatsContextValue {
  threads: ChatThread[];
  messagesByChat: Record<string, ChatMessage[]>;
  markAsRead: (chatId: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  createThread: (name: string, isGroup?: boolean) => ChatThread;
}

const ChatsContext = createContext<ChatsContextValue | null>(null);

export function ChatsProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [messagesByChat, setMessagesByChat] =
    useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);

  const markAsRead = useCallback((chatId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === chatId && t.unread > 0 ? { ...t, unread: 0 } : t))
    );
  }, []);

  const sendMessage = useCallback((chatId: string, rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    const timeStr = getNowTimeString();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      chatId,
      sender: 'me',
      text,
      time: timeStr,
      status: 'read',
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] ?? []), newMsg],
    }));

    setThreads((prev) =>
      prev.map((t) =>
        t.id === chatId
          ? {
              ...t,
              preview: `You: ${text}`,
              time: timeStr,
            }
          : t
      )
    );
  }, []);

  const createThread = useCallback(
    (rawName: string, isGroup = false): ChatThread => {
      const cleanName = rawName.trim() || 'New Discussion';
      const newThread: ChatThread = {
        id: `thread-${Date.now()}`,
        name: cleanName,
        initials: makeInitials(cleanName),
        preview: 'No messages yet',
        time: getNowTimeString(),
        unread: 0,
        isGroup,
        avatarBg: isGroup ? '#7C3AED' : '#0E7490',
      };

      setThreads((prev) => [newThread, ...prev]);
      setMessagesByChat((prev) => ({
        ...prev,
        [newThread.id]: [],
      }));

      return newThread;
    },
    []
  );

  return (
    <ChatsContext.Provider
      value={{
        threads,
        messagesByChat,
        markAsRead,
        sendMessage,
        createThread,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
}

export function useChats(): ChatsContextValue {
  const ctx = useContext(ChatsContext);
  if (!ctx) {
    throw new Error('useChats must be used inside a ChatsProvider');
  }
  return ctx;
}