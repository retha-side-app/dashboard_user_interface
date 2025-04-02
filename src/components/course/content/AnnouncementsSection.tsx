import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { announcementService } from '../../../services/announcementService';
import type { CourseGroup } from '../../../services/types/announcement';

interface AnnouncementsSectionProps {
  courseId: string;
  isOpen: boolean;
  onAnnouncementsClick: () => void;
}

const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  courseId,
  isOpen,
  onAnnouncementsClick
}) => {
  const [userGroup, setUserGroup] = useState<CourseGroup | null>(null);
  const [hasAnnouncements, setHasAnnouncements] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    
    const checkAnnouncements = async () => {
      try {
        setLoading(true);
        // First get the user's group for this course
        const group = await announcementService.getUserGroupForCourse(courseId);
        setUserGroup(group);
        
        // If the user is in a group, check if there are any announcements
        if (group) {
          const messages = await announcementService.getGroupAnnouncements(group.id);
          setHasAnnouncements(messages.length > 0);
        }
      } catch (err) {
        console.error('Failed to check announcements:', err);
        setError('Failed to check announcements');
      } finally {
        setLoading(false);
      }
    };
    
    checkAnnouncements();
  }, [courseId]);

  // If the sidebar is closed, don't render anything
  if (!isOpen) return null;

  return (
    <div className="mb-6">
      <button 
        onClick={onAnnouncementsClick}
        className="w-full flex items-center justify-between py-2 px-1 rounded-[5px] hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center w-full">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" strokeWidth={1.5} />
          <h3 className="font-medium text-primary">Announcements</h3>
        </div>
        
        {loading ? (
          <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse"></div>
        ) : hasAnnouncements ? (
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
        ) : null}
      </button>
    </div>
  );
};

export default AnnouncementsSection;