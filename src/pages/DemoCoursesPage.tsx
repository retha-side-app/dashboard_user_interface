import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration_weeks: number;
  price: number;
}

const SUPABASE_URL = 'https://qcheujnnqocejocjyvpf.supabase.co';
// Using a placeholder image service for the default thumbnail
const DEFAULT_THUMBNAIL = 'https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image';

const DemoCoursesPage: React.FC = () => {
  const [demoCourses, setDemoCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getImageUrl = (thumbnailPath: string) => {
    if (!thumbnailPath) {
      return DEFAULT_THUMBNAIL;
    }
    
    // If it's already a full URL, return it
    if (thumbnailPath.startsWith('http')) {
      return thumbnailPath;
    }
    
    // Extract just the filename if it includes the 'thumbnails/' prefix
    const filename = thumbnailPath.includes('thumbnails/') 
      ? thumbnailPath.split('thumbnails/')[1] 
      : thumbnailPath;
    
    // Construct the full Supabase URL with the correct structure
    return `${SUPABASE_URL}/storage/v1/object/public/course-content/thumbnails/${filename}`;
  };

  useEffect(() => {
    const fetchDemoCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_demo', true)
          .eq('is_published', true);

        if (error) throw error;

        console.log('Fetched demo courses:', data);
        if (data) {
          data.forEach(course => {
            console.log(`Course "${course.title}" thumbnail path:`, course.thumbnail_url);
          });
        }

        setDemoCourses(data || []);
      } catch (err) {
        console.error('Error fetching demo courses:', err);
        setError('Failed to load demo courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDemoCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Demo Courses</h1>
      
      {demoCourses.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No demo courses available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoCourses.map((course) => {
            const imageUrl = getImageUrl(course.thumbnail_url);
            
            return (
              <Link
                to={`/businessclass-demo/${course.id}`}
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative w-full pt-[56.25%] bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={course.title}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== DEFAULT_THUMBNAIL) {
                        target.src = DEFAULT_THUMBNAIL;
                      }
                    }}
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{course.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">
                      {course.duration_weeks} {course.duration_weeks === 1 ? 'week' : 'weeks'}
                    </span>
                    <span className="text-primary font-semibold">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DemoCoursesPage; 