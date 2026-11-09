import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HeaderIcons({ onNavigate }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onNavigate('ChatGroup')} style={styles.iconBtn}>
        <Ionicons name="chatbubbles-outline" size={26} color="#3B82F6" />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onNavigate('Stories')} style={styles.iconBtn}>
        <Ionicons name="ellipse-outline" size={26} color="#8B5CF6" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onNavigate('Reels')} style={styles.iconBtn}>
        <MaterialCommunityIcons name="movie-play-outline" size={26} color="#3B82F6" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onNavigate('NewReel')} style={styles.iconBtn}>
        <Ionicons name="add-circle-outline" size={28} color="#8B5CF6" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  iconBtn: {
    padding: 8,
  },
});