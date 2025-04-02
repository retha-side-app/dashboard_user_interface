// src/pages/MessagingPage.tsx
import React from 'react';
import { MessageCircle } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { MessagingProvider } from '../context/MessagingContext';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';

const MessagingPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center">
          <MessageCircle className="h-6 w-6 text-primary mr-3" strokeWidth={1.5} />
          <h1 className="text-3xl font-bold text-primary">Messages</h1>
        </div>

        <div className="bg-white rounded-[5px] shadow-sm border border-gray-100 overflow-hidden">
          <MessagingProvider>
            <div className="flex h-[calc(80vh-10rem)] min-h-[500px]">
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
    </MainLayout>
  );
};

export default MessagingPage;