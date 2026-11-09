import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MessageBubble({ message, isMe, onAction }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={[styles.wrapper, isMe ? styles.wrapperMe : styles.wrapperOther]}>
      {/* Menu horizontal flottant déclenché par clic long */}
      {showMenu && (
        <View style={styles.horizontalMenu}>
          <TouchableOpacity onPress={() => { onAction('copy', message); setShowMenu(false); }}>
            <Ionicons name="copy-outline" size={18} color="#F8FAFC" style={styles.menuIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onAction('edit', message); setShowMenu(false); }}>
            <Ionicons name="pencil-outline" size={18} color="#F8FAFC" style={styles.menuIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onAction('delete', message); setShowMenu(false); }}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" style={styles.menuIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onAction('forward', message); setShowMenu(false); }}>
            <Ionicons name="share-social-outline" size={18} color="#F8FAFC" style={styles.menuIcon} />
          </TouchableOpacity>
        </View>
      )}

      {/* Bulle de message */}
      <TouchableOpacity 
        onLongPress={() => setShowMenu(!showMenu)}
        activeOpacity={0.8}
        style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
      >
        <Text style={styles.text}>{message.content}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  wrapperMe: { alignItems: 'flex-end' },
  wrapperOther: { alignItems: 'flex-start' },
  bubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  bubbleMe: { backgroundColor: '#3B82F6', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#1E293B', borderBottomLeftRadius: 4 },
  text: { color: '#F8FAFC', fontSize: 15 },
  horizontalMenu: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 5,
  },
  menuIcon: { marginHorizontal: 8 },
});