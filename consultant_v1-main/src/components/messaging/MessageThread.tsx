// src/components/messaging/MessageThread.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import { useAuth } from '../../components/layout/useAuth';
import { userService } from '../../services/userService';
import { Send, MessageSquare } from 'lucide-react';

const MessageThread: React.FC = () => {
  const { 
    currentConversation, 
    messages, 
    isLoading, 
    error, 
    sendMessage 
  } = useMessaging();
  
  const { userData } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    try {
      setIsSending(true);
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsSending(false);
    }
  };
  
  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }
  
  // Determine if the current user is the student or instructor
  const isUserStudent = userData?.id === currentConversation.user_id;
  const otherPerson = isUserStudent ? currentConversation.instructor : currentConversation.user;
  
  // Get profile picture URL
  const profilePicUrl = otherPerson?.profile_pic_url 
    ? userService.getProfilePictureUrl(otherPerson.profile_pic_url)
    : null;
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center">
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
          <h2 className="text-lg font-semibold text-primary">{otherPerson?.full_name || 'Unknown'}</h2>
          <p className="text-sm text-secondary">
            {isUserStudent ? 'Instructor' : 'Student'}
          </p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`h-12 rounded-[5px] ${i % 2 === 0 ? 'bg-blue-200 w-1/2' : 'bg-gray-200 w-2/3'}`}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-3 rounded-[5px] text-red-700 text-sm">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isCurrentUser = message.sender_id === userData?.id;
              
              // Format message time
              let formattedTime = '';
              try {
                if (message.created_at) {
                  const messageDate = new Date(message.created_at);
                  if (!isNaN(messageDate.getTime())) {
                    formattedTime = messageDate.toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit'
                    });
                  }
                }
              } catch (e) {
                // If date parsing fails, don't show time
                formattedTime = '';
              }
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-[5px] px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p>{message.content}</p>
                    {formattedTime && (
                      <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formattedTime}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-200 rounded-l-[5px] px-4 py-2 focus:outline-none focus:border-primary"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-primary text-white px-4 py-2 rounded-r-[5px] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : (
              <>
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;