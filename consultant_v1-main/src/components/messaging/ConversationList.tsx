// src/components/messaging/ConversationList.tsx
import React from 'react';
import { useMessaging } from '../../context/MessagingContext';
import { useAuth } from '../../components/layout/useAuth';
import { MessageSquarePlus } from 'lucide-react';
import InstructorNewConversationButton from './InstructorNewConversationButton';

const ConversationList: React.FC = () => {
  const { 
    conversations, 
    currentConversation, 
    isLoading, 
    error, 
    selectConversation 
  } = useMessaging();
  
  const { userData } = useAuth();
  
  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-primary">Conversations</h2>
          <InstructorNewConversationButton />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-[5px]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-primary">Conversations</h2>
        <InstructorNewConversationButton />
      </div>
      
      {error && (
        <div className="m-4 bg-red-50 p-3 rounded-[5px] text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
            <MessageSquarePlus size={48} className="text-gray-300 mb-3" />
            <p className="text-center">No conversations yet.</p>
            <p className="text-center text-sm">Start a new conversation using the button above.</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            // Determine if the current user is the student or instructor
            const isUserStudent = userData?.id === conversation.user_id;
            const otherPerson = isUserStudent ? conversation.instructor : conversation.user;
            
            // Determine unread count based on user role
            const unreadCount = isUserStudent 
              ? conversation.unread_user_count 
              : conversation.unread_instructor_count;
              
            // Format last message time safely without date-fns
            let lastMessageTime = '';
            try {
              if (conversation.last_message && conversation.last_message.created_at) {
                const messageDate = new Date(conversation.last_message.created_at);
                if (!isNaN(messageDate.getTime())) {
                  lastMessageTime = messageDate.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                }
              }
            } catch (err) {
              console.error("Error formatting date:", err);
              // If date parsing fails, don't show time
              lastMessageTime = '';
            }

            // Get profile picture URL safely
            let profilePicUrl = null;
            if (otherPerson?.profile_pic_url) {
              // Use your environment variable for Supabase URL
              profilePicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/user-media/${otherPerson.profile_pic_url}`;
            }
              
            return (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  currentConversation?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => selectConversation(conversation.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {profilePicUrl ? (
                      <img 
                        src={profilePicUrl} 
                        alt={otherPerson?.full_name || ''}
                        className="w-10 h-10 rounded-[5px] mr-3 object-cover" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-[5px] bg-primary text-white flex items-center justify-center mr-3">
                        {otherPerson?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium text-primary flex items-center">
                        {otherPerson?.full_name || 'Unknown'}
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-0.5 text-center">
                            {unreadCount}
                          </span>
                        )}
                      </h3>
                      
                      {conversation.last_message && (
                        <p className="text-sm text-secondary truncate max-w-xs">
                          {conversation.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {lastMessageTime && (
                    <span className="text-xs text-secondary">{lastMessageTime}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;