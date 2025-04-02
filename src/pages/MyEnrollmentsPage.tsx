import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { Enrollment, enrollmentService } from '../services/enrollmentService';
import { getStorageUrl } from '../lib/utils';
import CourseProgressBar from '../components/courses/CourseProgressBar';
import { progressService } from '../services/progressService';

const MyEnrollmentsPage = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await enrollmentService.getUserEnrollments();
        setEnrollments(data);
        
        // Fetch progress for each enrollment
        const progressPromises = data.map(async (enrollment) => {
          try {
            const progress = await progressService.getCourseProgress(enrollment.course_id);
            return { 
              courseId: enrollment.course_id, 
              progress: progress?.progress_percentage || 0 
            };
          } catch (err) {
            console.error(`Failed to fetch progress for course ${enrollment.course_id}:`, err);
            return { courseId: enrollment.course_id, progress: 0 };
          }
        });
        
        const progressResults = await Promise.all(progressPromises);
        const progressMap: Record<string, number> = {};
        
        progressResults.forEach(result => {
          progressMap[result.courseId] = result.progress;
        });
        
        setProgressData(progressMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch enrollments');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const handleContinue = (courseId: string) => {
    navigate(`/courses/${courseId}/content`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[5px] p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 p-4 rounded-[5px] text-red-700">
            {error}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">My Enrollments</h1>
          <p className="mt-2 text-secondary">Track your progress and continue learning.</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-[5px] p-8 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-secondary mb-4" strokeWidth={1} />
            <h3 className="text-xl font-semibold text-primary mb-2">No enrollments yet</h3>
            <p className="text-secondary mb-6">Start your learning journey by enrolling in a course.</p>
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-[5px] hover:bg-opacity-90"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-[5px] shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 h-48 md:h-auto">
                    <img
                      src={getStorageUrl(enrollment.course?.thumbnail_url || '')}
                      alt={enrollment.course?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-primary">
                        {enrollment.course?.title}
                      </h2>
                      <span className={`px-3 py-1 rounded-[5px] text-sm font-medium ${
                        enrollment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-secondary mb-4">
                      {enrollment.course?.description}
                    </p>
                    
                    {/* Course Progress Bar */}
                    <CourseProgressBar 
                      progress={progressData[enrollment.course_id] || 0} 
                      className="mb-4"
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm text-secondary">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" strokeWidth={1.5} />
                          <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                        </div>
                        {enrollment.course?.duration && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" strokeWidth={1.5} />
                            <span>{enrollment.course.duration}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleContinue(enrollment.course_id)}
                        className="px-4 py-2 bg-primary text-white rounded-[5px] hover:bg-opacity-90 transition-colors"
                      >
                        Devam et
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyEnrollmentsPage;