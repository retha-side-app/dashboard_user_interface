// src/pages/consultant/MessagingPage.tsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { instructorService } from '../../services/instructor/instructorService';
import { MessagingProvider } from '../../context/MessagingContext';
import ConversationList from '../../components/messaging/ConversationList';
import MessageThread from '../../components/messaging/MessageThread';

const MessagingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const hasAccess = await instructorService.isInstructor();
        setIsInstructor(hasAccess);
      } catch (error) {
        console.error('Error checking instructor access:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  return (
    <MessagingProvider>
      <div className="container mx-auto p-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[calc(100vh-8rem)]">
            <div className="w-full md:w-1/3 border-r border-gray-200">
              <ConversationList
                activeConversationId={activeConversationId}
                onSelectConversation={id => setActiveConversationId(id)}
              />
            </div>
            <div className="hidden md:block md:w-2/3">
              <MessageThread conversationId={activeConversationId} />
            </div>
          </div>
        </div>
      </div>
    </MessagingProvider>
  );
};

export default MessagingPage;