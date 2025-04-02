import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CourseHero from '../components/courses/CourseHero';
import { Course, courseService } from '../services/courseService';

const DemoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        const data = await courseService.getCourseById(id);
        // Verify this is a demo course
        if (!data.is_demo) {
          navigate('/businessclass-demo');
          return;
        }
        setCourse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="aspect-video bg-gray-200 rounded-[5px]"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 p-4 rounded-[5px] text-red-700">
            {error || 'Course not found'}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseHero course={course} />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Start Learning Now</h2>
              <p className="text-gray-600 mb-6">
                This is a demo course. You can start learning right away!
              </p>
              <button
                onClick={() => navigate(`/businessclass-demo/${id}/content`)}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors"
              >
                Start Course
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DemoDetailPage; 