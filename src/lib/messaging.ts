import { supabase } from './supabase';
import { Message } from '../types';

export interface CreateMessageData {
  receiverId: string;
  content: string;
}

// Send a new message
export async function sendMessage(messageData: CreateMessageData): Promise<Message | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Insert message into database
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: messageData.receiverId,
        content: messageData.content,
        read: false
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    // Transform to Message type
    const transformedMessage: Message = {
      id: newMessage.id,
      senderId: newMessage.sender_id,
      receiverId: newMessage.receiver_id,
      content: newMessage.content,
      timestamp: newMessage.created_at,
      read: newMessage.read
    };

    return transformedMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

// Get messages between two users
export async function getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Transform to Message type
    const transformedMessages: Message[] = (messages || []).map(message => ({
      id: message.id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      content: message.content,
      timestamp: message.created_at,
      read: message.read
    }));

    return transformedMessages;
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

// Mark messages as read
export async function markMessagesAsRead(messageIds: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .in('id', messageIds);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
}

// Get recent conversations for a user
export async function getRecentConversations(userId: string): Promise<any[]> {
  try {
    // Get latest message for each conversation
    const { data: conversations, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, profile_photo_url),
        receiver:profiles!messages_receiver_id_fkey(id, name, profile_photo_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Group by conversation partner and get latest message
    const conversationMap = new Map();
    
    (conversations || []).forEach(message => {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partner: message.sender_id === userId ? message.receiver : message.sender,
          latestMessage: message,
          unreadCount: 0
        });
      }
      
      // Count unread messages from partner
      if (message.receiver_id === userId && !message.read) {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    return Array.from(conversationMap.values());
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

// Subscribe to new messages for real-time updates
export function subscribeToMessages(
  userId: string,
  onNewMessage: (message: Message) => void
) {
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      },
      (payload) => {
        const newMessage: Message = {
          id: payload.new.id,
          senderId: payload.new.sender_id,
          receiverId: payload.new.receiver_id,
          content: payload.new.content,
          timestamp: payload.new.created_at,
          read: payload.new.read
        };
        onNewMessage(newMessage);
      }
    )
    .subscribe();

  return subscription;
}