// src/pages/instructor/MessagingPage.tsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { instructorService } from '../../services/instructor/instructorService';
import InstructorSidebar from '../../components/instructor/InstructorSidebar';
import { MessagingProvider } from '../../context/MessagingContext';
import ConversationList from '../../components/messaging/ConversationList';
import MessageThread from '../../components/messaging/MessageThread';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const MessagingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
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
    return <LoadingSpinner />;
  }

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen gradient-bg">
      <InstructorSidebar onCollapse={(collapsed) => setIsSidebarCollapsed(collapsed)} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            
            <div className="h-[calc(80vh-10rem)] min-h-[500px] bg-white rounded-lg shadow overflow-hidden">
              <MessagingProvider>
                <div className="flex h-full">
                  {/* Conversations sidebar */}
                  <div className="w-1/3 border-r border-gray-200 h-full overflow-y-auto">
                    <ConversationList />
                  </div>
                  
                  {/* Message thread */}
                  <div className="w-2/3 h-full flex flex-col">
                    <MessageThread />
                  </div>
                </div>
              </MessagingProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;