import { supabase } from '../lib/supabase';
import type { GroupMessage, CourseGroup, GroupMember } from './types/announcement';

export const announcementService = {
  /**
   * Get the user's group for a specific course
   */
  async getUserGroupForCourse(courseId: string): Promise<CourseGroup | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // First find all groups for this course
    const { data: courseGroups, error: courseGroupsError } = await supabase
      .from('course_groups')
      .select('id')
      .eq('course_id', courseId);

    if (courseGroupsError) throw courseGroupsError;
    if (!courseGroups || courseGroups.length === 0) return null;

    // Then find which group the user belongs to
    const groupIds = courseGroups.map(group => group.id);
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)
      .in('group_id', groupIds)
      .maybeSingle();

    if (membershipError) throw membershipError;
    if (!membership) return null;

    // Get the full group details
    const { data: group, error: groupError } = await supabase
      .from('course_groups')
      .select('*')
      .eq('id', membership.group_id)
      .single();

    if (groupError) throw groupError;
    return group;
  },

  /**
   * Get all announcements for a specific group
   */
  async getGroupAnnouncements(groupId: string): Promise<GroupMessage[]> {
    const { data, error } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .eq('message_type', 'announcement')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all messages for a specific group
   */
  async getGroupMessages(groupId: string): Promise<GroupMessage[]> {
    const { data, error } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Format the date for display
   */
  formatAnnouncementDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
};