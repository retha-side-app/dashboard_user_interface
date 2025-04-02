// src/types/messaging.ts
import { User } from '../../services/userService';

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  user_id: string;
  instructor_id: string;
  unread_user_count: number;
  unread_instructor_count: number;
  
  // Joined data (not stored in table)
  user?: User;
  instructor?: User;
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  
  // Joined data (not stored in table)
  sender?: User;
}

export type ConversationWithDetails = Conversation & {
  user: User;
  instructor: User;
  last_message?: Message;
}