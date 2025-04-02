import React from 'react';
import { MessageSquare } from 'lucide-react';
import { GroupMessage } from '../../../services/types/announcement';
import { announcementService } from '../../../services/announcementService';

interface AnnouncementItemProps {
  announcement: GroupMessage;
  isExpanded: boolean;
  onToggle: () => void;
}

const AnnouncementItem: React.FC<AnnouncementItemProps> = ({
  announcement,
  isExpanded,
  onToggle,
}) => {
  // Format the date for display
  const formattedDate = announcementService.formatAnnouncementDate(announcement.created_at);
  
  // Truncate the message if it's not expanded
  const truncatedMessage = !isExpanded && announcement.message.length > 100
    ? `${announcement.message.substring(0, 100)}...`
    : announcement.message;

  return (
    <div className={`bg-white rounded-[5px] shadow-sm p-4 mb-4 ${
      announcement.message_type === 'announcement' 
        ? 'border-l-4 border-blue-500' 
        : ''
    }`}>
      <div className="flex items-start">
        <div className="bg-primary/10 p-2 rounded-full mr-3">
          <MessageSquare className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-primary capitalize">{announcement.message_type}</h3>
            <span className="text-xs text-secondary">{formattedDate}</span>
          </div>
          <p className="text-secondary text-sm whitespace-pre-wrap">
            {truncatedMessage}
          </p>
          {announcement.message.length > 100 && (
            <button
              onClick={onToggle}
              className="text-xs text-primary mt-2 hover:underline"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementItem;