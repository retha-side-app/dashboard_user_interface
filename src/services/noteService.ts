import { supabase } from '../lib/supabase';
import type { UserNote, CreateNoteParams, UpdateNoteParams } from './types/notes';

export const noteService = {
  /**
   * Get all notes for a specific step for the current user
   */
  async getStepNotes(stepId: string): Promise<UserNote[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('step_id', stepId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new note for the current user
   */
  async createNote(params: CreateNoteParams): Promise<UserNote> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_notes')
      .insert({
        user_id: user.id,
        step_id: params.step_id,
        content: params.content
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing note
   */
  async updateNote(noteId: string, params: UpdateNoteParams): Promise<UserNote> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_notes')
      .update({
        content: params.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .eq('user_id', user.id) // Ensure user can only update their own notes
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id); // Ensure user can only delete their own notes

    if (error) throw error;
  }
};