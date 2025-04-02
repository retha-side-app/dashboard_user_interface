// src/components/instructor/StudentCard.tsx
import React from 'react';
import { Mail, BookOpen, MessageCircle } from 'lucide-react';
import { StudentInfo } from '../../services/instructor/instructorService';
import { useNavigate } from 'react-router-dom';
import { messagingService } from '../../services/messagingService';

interface StudentCardProps {
  student: StudentInfo;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const navigate = useNavigate();

  const handleMessageClick = async () => {
    try {
      // Get or create a conversation with this student
      const conversation = await messagingService.getOrCreateConversation(
        student.id, // student is always the user_id
        // Get the current user ID (instructor) from auth
        (await messagingService.getCurrentUserId()) || ''
      );

      // Navigate to the messaging page with this conversation
      navigate(`/consultant-dashboard/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{student.full_name}</h3>
          <div className="flex items-center mt-1 text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span>{student.email}</span>
          </div>
        </div>
        
        {/* Add message button */}
        <button
          onClick={handleMessageClick}
          className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
          title="Message student"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center text-gray-700">
          <BookOpen className="w-4 h-4 mr-2" />
          <span>{student.enrolledCourses.length} Enrolled Courses</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {student.enrolledCourses.map((course) => (
          <div key={course.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              {course.thumbnailUrl && (
                <img
                  src={course.thumbnailUrl}
                  alt={course.courseName}
                  className="w-12 h-12 rounded object-cover mr-3"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{course.courseName}</h4>
                <div className="mt-1">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${course.progress.progressPercentage}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {course.progress.progressPercentage}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.progress.completedSteps} of {course.progress.totalSteps} steps completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCard;