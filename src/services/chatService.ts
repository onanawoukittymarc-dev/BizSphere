// src/services/chatService.ts
import { supabase } from './supabase'; // Assure-toi que ton client supabase est bien exporté depuis ici

// Récupérer l'historique des messages d'une discussion
export async function fetchMessages(chatId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erreur lors du chargement des messages :', error.message);
    return [];
  }

  return data;
}

// Envoyer un nouveau message texte ou audio
// Dans src/services/chatService.ts (fonction sendMessage)
export async function sendMessage(chatId: string, senderId: string, content: string, type = 'text', duration: string | null = null) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        chat_id: chatId,
        sender_id: senderId,
        content: content,
        type: type,
        duration: duration,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Détail complet de l\'erreur Supabase :', JSON.stringify(error, null, 2));
    return null;
  }

  return data;
}