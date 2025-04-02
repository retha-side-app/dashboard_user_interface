// src/components/messaging/MessageStudentButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../components/layout/useAuth';
import { messagingService } from '../../services/messagingService';

interface MessageStudentButtonProps {
  studentId: string;
  className?: string;
}

const MessageStudentButton: React.FC<MessageStudentButtonProps> = ({ 
  studentId,
  className = '' 
}) => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const handleClick = async () => {
    try {
      if (!userData?.id || !studentId) {
        return;
      }
      
      // Create/get conversation
      const conversation = await messagingService.getOrCreateConversation(
        studentId, // student is always the user_id
        userData.id // instructor is always the instructor_id
      );
      
      // Navigate to messaging page with a query param for the conversation
      navigate(`/consultant-dashboard/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Error opening message thread:', error);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-[5px] bg-primary text-white hover:bg-opacity-90 transition-colors ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      <span>Message Student</span>
    </button>
  );
};

export default MessageStudentButton;