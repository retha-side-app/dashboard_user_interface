import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { announcementService } from '../../../services/announcementService';
import type { GroupMessage, CourseGroup } from '../../../services/types/announcement';
import AnnouncementItem from './AnnouncementItem';

interface AnnouncementsContentProps {
  courseId: string;
  onBack: () => void;
}

const AnnouncementsContent: React.FC<AnnouncementsContentProps> = ({
  courseId,
  onBack
}) => {
  const [userGroup, setUserGroup] = useState<CourseGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!courseId) return;
    
    const loadMessages = async () => {
      try {
        setLoading(true);
        // First get the user's group for this course
        const group = await announcementService.getUserGroupForCourse(courseId);
        setUserGroup(group);
        
        // If the user is in a group, get the messages
        if (group) {
          const groupMessages = await announcementService.getGroupMessages(group.id);
          setMessages(groupMessages);
        }
      } catch (err) {
        console.error('Failed to load group messages:', err);
        setError('Failed to load group messages');
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
  }, [courseId]);

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="mr-4 text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-primary flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" strokeWidth={1.5} />
            {userGroup ? `Group: ${userGroup.name}` : 'Group Messages'}
          </h2>
        </div>
      </div>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 rounded-[5px] p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-[5px] text-red-700">
          {error}
        </div>
      ) : !userGroup ? (
        <div className="bg-yellow-50 p-4 rounded-[5px] text-yellow-700">
          You are not a member of any group for this course.
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-[5px] text-secondary text-center">
          No announcements yet.
        </div>
      ) : (
        <div>
          {messages.map(message => (
            <AnnouncementItem
              key={message.id}
              announcement={message}
              isExpanded={!!expandedMessages[message.id]}
              onToggle={() => toggleMessageExpansion(message.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsContent;