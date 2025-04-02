// src/context/MessagingContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { messagingService } from '../services/messagingService';
import { Conversation, Message, ConversationWithDetails } from '../services/types/messaging';
import { useAuth } from '../components/layout/useAuth';

interface MessagingContextType {
  conversations: ConversationWithDetails[];
  currentConversation: ConversationWithDetails | null;
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  startConversation: (userId: string, instructorId: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userData } = useAuth();
  
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationsChannel, setConversationsChannel] = useState<RealtimeChannel | null>(null);
  const [messagesChannel, setMessagesChannel] = useState<RealtimeChannel | null>(null);

  // Load conversations on mount and when user changes
  useEffect(() => {
    if (!userData) return;
    
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const data = await messagingService.getConversations();
        setConversations(data);
        
        const count = await messagingService.getUnreadCount();
        setUnreadCount(count);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversations();
    
    // Subscribe to conversation updates
    const channel = messagingService.subscribeToConversations((updatedConversation) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === updatedConversation.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ...updatedConversation
          };
          return updated;
        }
        return prev;
      });
      
      if (currentConversation?.id === updatedConversation.id) {
        setCurrentConversation(prev => prev ? {
          ...prev,
          ...updatedConversation
        } : null);
      }
      
      // Update unread count
      messagingService.getUnreadCount().then(setUnreadCount);
    });
    
    setConversationsChannel(channel);
    
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [userData]);
  
  // Unsubscribe from previous message channel when conversation changes
  useEffect(() => {
    return () => {
      if (messagesChannel) {
        messagesChannel.unsubscribe();
      }
    };
  }, [messagesChannel]);
  
  const selectConversation = async (conversationId: string) => {
    try {
      setIsLoading(true);
      
      // Find conversation in existing state
      const selected = conversations.find(c => c.id === conversationId);
      if (!selected) throw new Error('Conversation not found');
      
      setCurrentConversation(selected);
      
      // Load messages
      const messagesData = await messagingService.getMessages(conversationId);
      setMessages(messagesData);
      
      // Mark messages as read
      await messagingService.markAsRead(conversationId);
      
      // Subscribe to new messages
      if (messagesChannel) {
        messagesChannel.unsubscribe();
      }
      
      const newChannel = messagingService.subscribeToMessages(conversationId, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        
        // If the message is not from the current user, mark it as read
        if (newMessage.sender_id !== userData?.id) {
          messagingService.markAsRead(conversationId);
        }
      });
      
      setMessagesChannel(newChannel);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startConversation = async (userId: string, instructorId: string) => {
    try {
      setIsLoading(true);
      
      // Get or create conversation
      const conversation = await messagingService.getOrCreateConversation(userId, instructorId);
      
      // Refresh conversations list
      const updatedConversations = await messagingService.getConversations();
      setConversations(updatedConversations);
      
      // Select the new conversation
      await selectConversation(conversation.id);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendMessage = async (content: string) => {
    if (!currentConversation) {
      setError('No conversation selected');
      return;
    }
    
    try {
      await messagingService.sendMessage(currentConversation.id, content);
      // The subscription will handle adding the new message to the state
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };
  
  const value = {
    conversations,
    currentConversation,
    messages,
    unreadCount,
    isLoading,
    error,
    sendMessage,
    selectConversation,
    startConversation
  };
  
  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};