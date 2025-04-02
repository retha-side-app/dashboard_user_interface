import { supabase } from '../lib/supabase';
import { Course } from './courseService';

export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  expires_at: string | null;
  status: string;
  course?: Course;
}

export const enrollmentService = {
  async getUserEnrollments(): Promise<Enrollment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async enrollInCourse(courseId: string): Promise<Enrollment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        course_id: courseId,
        user_id: user.id,
        status: 'active'
      })
      .select(`
        *,
        course:courses(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};