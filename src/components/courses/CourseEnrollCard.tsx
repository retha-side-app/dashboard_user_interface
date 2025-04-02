import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User } from 'lucide-react';
import { Course } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { supabase } from '../../lib/supabase';

interface CourseEnrollCardProps {
  course: Course;
}

const CourseEnrollCard: React.FC<CourseEnrollCardProps> = ({ course }) => {
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkEnrollmentStatus();
  }, [course.id]);

  const checkEnrollmentStatus = async () => {
    try {
      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const enrollments = await enrollmentService.getUserEnrollments();
      setIsEnrolled(enrollments.some(e => e.course_id === course.id));
    } catch (error) {
      setError('Failed to check enrollment status. Please try again.');
      console.error('Failed to check enrollment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setError(null);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      await enrollmentService.enrollInCourse(course.id);
      setIsEnrolled(true);
    } catch (error) {
      setError('Failed to enroll in the course. Please try again.');
      console.error('Failed to enroll:', error);
    }
  };

  const handleStart = () => {
    navigate(`/courses/${course.id}/content`);
  };

  return (
    <div className="bg-white rounded-[5px] shadow-sm p-6 sticky top-8">      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-[5px] text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-[5px] mb-4"></div>
        </div>
      ) : (
        <button 
          onClick={isEnrolled ? handleStart : handleEnroll}
          className="w-full bg-primary text-white rounded-[5px] py-3 font-semibold hover:bg-opacity-90 transition-colors mb-4"
        >
          {isEnrolled ? 'Start Learning' : 'Enroll Now'}
        </button>
      )}
      
      <div className="border-t pt-6 mt-6">
        <h3 className="font-semibold text-primary mb-4">This course includes:</h3>
        <ul className="space-y-3">
          <li className="flex items-center text-secondary">
            <BookOpen className="h-5 w-5 mr-3" strokeWidth={1.5} />
            Full lifetime access
          </li>
          <li className="flex items-center text-secondary">
            <User className="h-5 w-5 mr-3" strokeWidth={1.5} />
            Access on mobile and desktop
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CourseEnrollCard;