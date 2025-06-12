import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export interface MessageWithProfiles extends Message {
  sender: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  receiver: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  user: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  last_message: Message | null;
  unread_count: number;
}

export class MessagesService {
  // Send a message
  static async sendMessage(message: MessageInsert): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;

      return { message: data, error: null };
    } catch (error) {
      console.error('Send message error:', error);
      return { message: null, error: error as Error };
    }
  }

  // Get conversation between two users
  static async getConversation(userId1: string, userId2: string, limit = 50): Promise<{ messages: MessageWithProfiles[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          receiver:profiles!messages_receiver_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return { messages: data as MessageWithProfiles[], error: null };
    } catch (error) {
      console.error('Get conversation error:', error);
      return { messages: [], error: error as Error };
    }
  }

  // Get all conversations for a user (simplified version without complex function)
  static async getConversations(userId: string): Promise<{ conversations: Conversation[]; error: Error | null }> {
    try {
      // Get all messages where user is sender or receiver
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          receiver:profiles!messages_receiver_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by conversation partner
      const conversationMap = new Map<string, {
        user: { id: string; display_name: string | null; avatar_url: string | null };
        last_message: Message | null;
        unread_count: number;
      }>();

      messages?.forEach((message: any) => {
        const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        const partner = message.sender_id === userId ? message.receiver : message.sender;

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            user: partner,
            last_message: message,
            unread_count: 0
          });
        }

        // Count unread messages (messages sent to current user that are unread)
        if (message.receiver_id === userId && !message.is_read) {
          const conversation = conversationMap.get(partnerId)!;
          conversation.unread_count++;
        }
      });

      const conversations = Array.from(conversationMap.values());

      return { conversations, error: null };
    } catch (error) {
      console.error('Get conversations error:', error);
      return { conversations: [], error: error as Error };
    }
  }

  // Mark messages as read
  static async markAsRead(messageIds: string[]): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { error: error as Error };
    }
  }

  // Mark conversation as read
  static async markConversationAsRead(currentUserId: string, otherUserId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', currentUserId)
        .eq('is_read', false);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Mark conversation as read error:', error);
      return { error: error as Error };
    }
  }

  // Subscribe to new messages in a conversation
  static subscribeToConversation(userId1: string, userId2: string, callback: (message: Message) => void) {
    return supabase
      .channel(`conversation:${userId1}:${userId2}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1}))`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  // Subscribe to all messages for a user
  static subscribeToUserMessages(userId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`user_messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }
}