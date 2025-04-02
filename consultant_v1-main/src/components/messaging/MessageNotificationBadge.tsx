// src/components/messaging/MessageNotificationBadge.tsx
import React, { useEffect, useState } from 'react';
import { messagingService } from '../../services/messagingService';
import { supabase } from '../../lib/supabase';

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
  
  if (isLoading || unreadCount === 0) {
    return null;
  }
  
  return (
    <span className={`bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

export default MessageNotificationBadge;