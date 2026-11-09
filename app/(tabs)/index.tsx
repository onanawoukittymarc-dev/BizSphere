import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, SafeAreaView, StyleSheet, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Données fictives des discussions individuelles
const INDIVIDUAL_CHATS = [
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

export default function TabIndex() {
  // Par défaut, l'application s'ouvre sur les discussions individuelles (style WhatsApp)
  const [currentTab, setCurrentTab] = useState('chats'); 
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState([
    { id: '1', text: 'Salut ! Bien reçu pour le setup Supabase.', sender: 'other' },
    { id: '2', text: 'Impec, je m occupe de la partie UI maintenant.', sender: 'me' }
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    setMessages([...messages, { id: Date.now().toString(), text: inputText, sender: 'me' }]);
    setInputText('');
  };

  // --- VUE DISCUSSION OUVERTE ---
  if (selectedChat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Image source={{ uri: selectedChat.avatar }} style={styles.chatAvatar} />
          <Text style={styles.chatTitle}>{selectedChat.name}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.bubbleWrapper, item.sender === 'me' ? styles.bubbleMe : styles.bubbleOther]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'flex-end' }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écrire un message..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- VUE PRINCIPALE ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Header supérieur de navigation */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => setCurrentTab('chats')} 
          style={[styles.iconBtn, currentTab === 'chats' && styles.activeIconBtn]}
        >
          <Ionicons name="chatbubbles-outline" size={24} color={currentTab === 'chats' ? '#3B82F6' : '#64748B'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setCurrentTab('groups')} 
          style={[styles.iconBtn, currentTab === 'groups' && styles.activeIconBtn]}
        >
          <Ionicons name="people-outline" size={24} color={currentTab === 'groups' ? '#3B82F6' : '#64748B'} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCurrentTab('stories')} 
          style={[styles.iconBtn, currentTab === 'stories' && styles.activeIconBtn]}
        >
          <Ionicons name="ellipse-outline" size={24} color={currentTab === 'stories' ? '#8B5CF6' : '#64748B'} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCurrentTab('reels')} 
          style={[styles.iconBtn, currentTab === 'reels' && styles.activeIconBtn]}
        >
          <MaterialCommunityIcons name="movie-play-outline" size={24} color={currentTab === 'reels' ? '#3B82F6' : '#64748B'} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCurrentTab('visio')} 
          style={[styles.iconBtn, currentTab === 'visio' && styles.activeIconBtn]}
        >
          <Ionicons name="videocam-outline" size={24} color={currentTab === 'visio' ? '#3B82F6' : '#64748B'} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setCurrentTab('settings')} 
          style={[styles.iconBtn, currentTab === 'settings' && styles.activeIconBtn]}
        >
          <Ionicons name="settings-outline" size={24} color={currentTab === 'settings' ? '#3B82F6' : '#64748B'} />
        </TouchableOpacity>
      </View>

      {/* Contenu de l'onglet : Discussions Individuelles */}
      {currentTab === 'chats' && (
        <FlatList
          data={INDIVIDUAL_CHATS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.7} 
              onPress={() => setSelectedChat(item)}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              
              <View style={styles.infoContainer}>
                <View style={styles.headerRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                
                <View style={styles.messageRow}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        />
      )}

      {/* Vues temporaires pour les autres onglets */}
      {currentTab !== 'chats' && (
        <View style={styles.centeredView}>
          <Text style={styles.placeholderText}>Section {currentTab.toUpperCase()} en cours de chargement...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  activeIconBtn: {
    backgroundColor: '#1E293B',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 18, // Bords bien arrondis
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8, // Espace vide marqué qui sépare chaque carte
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    color: '#64748B',
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    color: '#94A3B8',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0B0F19',
  },
  backBtn: {
    marginRight: 12,
  },
  chatAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  chatTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },
  bubbleWrapper: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: '75%',
  },
  bubbleMe: {
    backgroundColor: '#3B82F6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#0B0F19',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});