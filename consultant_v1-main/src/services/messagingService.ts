// src/services/messagingService.ts
import { supabase } from '../lib/supabase';
import { Conversation, Message, ConversationWithDetails } from './types/messaging';

export const messagingService = {
  /**
   * Get all conversations for the current user (student or instructor)
   */
  async getConversations(): Promise<ConversationWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user:user_id(*),
        instructor:instructor_id(*),
        last_message:messages(
          *,
          sender:sender_id(*)
        )
      `)
      .or(`user_id.eq.${user.id},instructor_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })
      .limit(1, { foreignTable: 'messages' });
      
    if (error) throw error;
    return data || [];
  },
  
  /**
   * Get or create a conversation between a user and instructor
   */
  async getOrCreateConversation(
    userId: string, 
    instructorId: string
  ): Promise<Conversation> {
    // First, try to find existing conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .match({ user_id: userId, instructor_id: instructorId })
      .single();
      
    if (existing) return existing;
    
    // If not found, create a new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({ 
        user_id: userId, 
        instructor_id: instructorId 
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  /**
   * Get all messages in a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data || [];
  },
  
  /**
   * Send a new message
   */
  async sendMessage(
    conversationId: string, 
    content: string
  ): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  /**
   * Mark all messages in a conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabase.rpc(
      'mark_messages_as_read',
      {
        p_conversation_id: conversationId,
        p_user_id: user.id
      }
    );
    
    if (error) throw error;
  },
  
  /**
   * Get all unread message counts for the current user
   */
  async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    const isInstructor = userData?.role === 'instructor';
    
    const { data, error } = await supabase
      .from('conversations')
      .select(isInstructor ? 'unread_instructor_count' : 'unread_user_count')
      .eq(isInstructor ? 'instructor_id' : 'user_id', user.id);
      
    if (error) throw error;
    
    return data?.reduce((sum, conversation) => 
      sum + (isInstructor ? conversation.unread_instructor_count : conversation.unread_user_count), 0) || 0;
  },

  async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  },
  
  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  },
  
  /**
   * Subscribe to conversation updates (unread counts, etc.)
   */
  subscribeToConversations(callback: (conversation: Conversation) => void) {
    return supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          callback(payload.new as Conversation);
        }
      )
      .subscribe();
  }
};