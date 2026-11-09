import React from 'react';
import { View, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import HeaderIcons from '../components/HeaderIcons';
import ChatCard from '../components/ChatCard';

const DUMMY_CHATS = [
  {
    id: '1',
    name: 'Alexandre (Dev Lead)',
    lastMessage: 'Le commit pour l API Supabase est pushé !',
    time: '14:32',
    unreadCount: 2,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  {
    id: '2',
    name: 'Sarah (Startup Founder)',
    lastMessage: 'Dispo pour un call visio sur Agora ?',
    time: '12:15',
    unreadCount: 0,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header avec icônes interactives pure */}
      <HeaderIcons onNavigate={(screen) => console.log('Navigation vers :', screen)} />

      {/* 2. Liste des discussions sous forme de cartes */}
      <FlatList
        data={DUMMY_CHATS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatCard
            name={item.name}
            lastMessage={item.lastMessage}
            time={item.time}
            unreadCount={item.unreadCount}
            avatar={item.avatar}
            onPress={() => console.log('Ouvrir la conversation avec', item.name)}
          />
        )}
        contentContainerStyle={{ paddingTop: 10 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
});