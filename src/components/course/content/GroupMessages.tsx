import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { announcementService } from '../../../services/announcementService';
import type { GroupMessage, CourseGroup } from '../../../services/types/announcement';

interface GroupMessagesProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const GroupMessages: React.FC<GroupMessagesProps> = ({
  courseId,
  isOpen,
  onClose
}) => {
  const [userGroup, setUserGroup] = useState<CourseGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !courseId) return;
    
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
  }, [courseId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[5px] shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-primary flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" strokeWidth={1.5} />
            {userGroup ? `Group: ${userGroup.name}` : 'Group Messages'}
          </h2>
          <button 
            onClick={onClose}
            className="text-secondary hover:text-primary p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
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
            <div className="text-center text-red-500 p-4">{error}</div>
          ) : !userGroup ? (
            <div className="text-center text-secondary p-4">
              You are not a member of any group for this course.
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-secondary p-4">
              No messages in this group yet.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`p-4 rounded-[5px] ${
                    message.message_type === 'announcement' 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-primary capitalize">
                      {message.message_type}
                    </span>
                    <span className="text-xs text-secondary">
                      {announcementService.formatAnnouncementDate(message.created_at)}
                    </span>
                  </div>
                  <p className="text-secondary whitespace-pre-wrap">{message.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupMessages;