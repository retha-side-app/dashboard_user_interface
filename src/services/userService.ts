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
    const { data: { user } } = await supabase.auth.getUser();
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
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/user-media/${filePath}`;
  }
};