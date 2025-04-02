import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  profile_pic_url: string | null;
}

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEmail(newEmail: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
  },

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async uploadProfilePicture(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile_pics/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Update the user record with the file path
    await this.updateUser(userId, { profile_pic_url: filePath });

    // Return the complete URL
    return filePath;
  },

  async deleteProfilePicture(userId: string, filePath: string): Promise<void> {
    const { error: deleteError } = await supabase.storage
      .from('user-media')
      .remove([filePath]);

    if (deleteError) throw deleteError;

    await this.updateUser(userId, { profile_pic_url: null });
  },

  getProfilePictureUrl(filePath: string | null): string {
    if (!filePath) return '';

    // Generate the complete Supabase storage URL
    return `${
      import.meta.env.VITE_SUPABASE_URL
    }/storage/v1/object/public/user-media/${filePath}`;
  },

  isInstructor(user: User | null): boolean {
    return user?.role === 'instructor';
  },

  async getStudentsByInstructor(instructorId: string): Promise<any[]> {
    // First, get the instructor_students records
    const { data, error } = await supabase
      .from('instructor_students')
      .select(`
        id,
        student_id,
        course_id,
        assigned_at,
        created_at,
        updated_at
      `)
      .eq('instructor_id', instructorId);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Now fetch the related user data for each student
    const studentIds = data.map(item => item.student_id);
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, profile_pic_url')
      .in('id', studentIds);
      
    if (usersError) throw usersError;
    
    // Fetch course data for each course
    const courseIds = data.map(item => item.course_id);
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .in('id', courseIds);
      
    if (coursesError) throw coursesError;
    
    // Combine the data
    return data.map(item => {
      const user = usersData?.find(u => u.id === item.student_id);
      const course = coursesData?.find(c => c.id === item.course_id);
      
      return {
        ...item,
        users: user || null,
        courses: course || null
      };
    });
  },

  async getCoursesByInstructor(instructorId: string): Promise<any[]> {
    // First, get the instructor_students records to find course IDs
    const { data, error } = await supabase
      .from('instructor_students')
      .select(`
        course_id,
        assigned_at
      `)
      .eq('instructor_id', instructorId);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Extract unique course IDs
    const uniqueCourseIds = [...new Set(data.map(item => item.course_id))];
    
    // Fetch the course details
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id, 
        title, 
        description, 
        thumbnail_url,
        is_published,
        created_at
      `)
      .in('id', uniqueCourseIds);
      
    if (coursesError) throw coursesError;
    
    return coursesData || [];
  }
};