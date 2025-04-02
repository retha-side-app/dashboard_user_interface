// src/components/messaging/MessageNotificationBadge.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messagingService } from '../../services/messagingService';
import { supabase } from '../../lib/supabase';
import { MessageCircle } from 'lucide-react';

interface MessageNotificationBadgeProps {
  className?: string;
}

const MessageNotificationBadge: React.FC<MessageNotificationBadgeProps> = ({ className = '' }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Get initial unread count
    const fetchUnreadCount = async () => {
      try {
        setIsLoading(true);
        const count = await messagingService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUnreadCount();
    
    // Subscribe to conversation updates to update badge in real-time
    const channel = supabase
      .channel('conversations_unread_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();
      
    return () => {
      channel.unsubscribe();
    };
  }, []);
  
  return (
    <Link 
      to="/messages" 
      className={`relative flex items-center ${className}`}
    >
      <MessageCircle strokeWidth={1} size={20} className="text-current" />
      <span className="ml-2">Messages</span>
      
      {!isLoading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default MessageNotificationBadge;