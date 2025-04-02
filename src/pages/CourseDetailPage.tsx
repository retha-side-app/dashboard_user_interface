import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CourseHero from '../components/courses/CourseHero';
import CourseEnrollCard from '../components/courses/CourseEnrollCard';
import { Course, courseService } from '../services/courseService';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        const data = await courseService.getCourseById(id);
        setCourse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

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
          <CourseHero course={course} />
          <div className="lg:col-span-1">
            <CourseEnrollCard course={course} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetailPage;