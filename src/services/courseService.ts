import { supabase } from '../lib/supabase';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructor_id: string;
  created_at: string;
  duration_weeks: number;
}

// Cache for courses
const courseCache = new Map<string, Course>();
const allCoursesCache = {
  data: null as Course[] | null,
  timestamp: 0,
  maxAge: 5 * 60 * 1000, // 5 minutes
};

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    // Check if we have a valid cache
    const now = Date.now();
    if (
      allCoursesCache.data && 
      now - allCoursesCache.timestamp < allCoursesCache.maxAge
    ) {
      return allCoursesCache.data;
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Update cache
    allCoursesCache.data = data || [];
    allCoursesCache.timestamp = now;
    
    // Also update individual course cache
    data?.forEach(course => {
      courseCache.set(course.id, course);
    });
    
    return data || [];
  },

  async getCourseById(id: string): Promise<Course> {
    // Check if we have it in cache
    if (courseCache.has(id)) {
      return courseCache.get(id)!;
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Course not found');
    
    // Update cache
    courseCache.set(id, data);
    
    return data;
  },
  
  // Clear cache method for when data might be stale
  clearCache() {
    courseCache.clear();
    allCoursesCache.data = null;
    allCoursesCache.timestamp = 0;
  }
};