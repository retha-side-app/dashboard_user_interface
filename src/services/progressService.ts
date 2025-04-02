import { supabase } from '../lib/supabase';

export interface StepCompletion {
  id: string;
  user_id: string;
  step_id: string;
  completed_at: string;
  created_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  completed_steps: number;
  total_steps: number;
  progress_percentage: number;
  last_updated_at: string;
  created_at: string;
}

export const progressService = {
  /**
   * Check if the user has already completed a step.
   * @param stepId - The step ID.
   * @returns StepCompletion object if the step is completed, otherwise null.
   */
  async getStepCompletion(stepId: string): Promise<StepCompletion | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated.');
      return null;
    }

    const { data, error } = await supabase
      .from('step_completions')
      .select('id, user_id, step_id, completed_at, created_at')
      .eq('user_id', user.id)
      .eq('step_id', stepId)
      .maybeSingle();

    if (error) {
      console.error('Failed to check step completion:', error);
      throw error;
    }

    return data;
  },

  /**
   * Marks a step as complete by inserting a record into `step_completions`.
   * Also updates the course_progress table.
   * @param stepId - The step ID.
   * @returns StepCompletion object if successful.
   */
  async markStepAsComplete(stepId: string): Promise<StepCompletion> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, get the course ID for this step
    const { data: stepData, error: stepError } = await supabase
      .from('course_steps')
      .select('day_id')
      .eq('id', stepId)
      .single();

    if (stepError) {
      console.error('Failed to get step data:', stepError);
      throw stepError;
    }

    const { data: dayData, error: dayError } = await supabase
      .from('course_days')
      .select('week_id')
      .eq('id', stepData.day_id)
      .single();

    if (dayError) {
      console.error('Failed to get day data:', dayError);
      throw dayError;
    }

    const { data: weekData, error: weekError } = await supabase
      .from('course_weeks')
      .select('course_id')
      .eq('id', dayData.week_id)
      .single();

    if (weekError) {
      console.error('Failed to get week data:', weekError);
      throw weekError;
    }

    const courseId = weekData.course_id;

    // Insert a new record into step_completions
    const { data, error } = await supabase
      .from('step_completions')
      .insert({
        user_id: user.id,
        step_id: stepId,
        completed_at: new Date().toISOString()
      })
      .select('id, user_id, step_id, completed_at, created_at')
      .single();

    if (error) {
      console.error('Failed to mark step as complete:', error);
      throw error;
    }

    // Update course progress
    await this.updateCourseProgress(courseId);

    console.log('Step marked as complete:', data);
    return data;
  },

  /**
   * Marks a step as incomplete by deleting the record from `step_completions`.
   * Also updates the course_progress table.
   * @param stepId - The step ID.
   */
  async markStepAsIncomplete(stepId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, get the course ID for this step
    const { data: stepData, error: stepError } = await supabase
      .from('course_steps')
      .select('day_id')
      .eq('id', stepId)
      .single();

    if (stepError) {
      console.error('Failed to get step data:', stepError);
      throw stepError;
    }

    const { data: dayData, error: dayError } = await supabase
      .from('course_days')
      .select('week_id')
      .eq('id', stepData.day_id)
      .single();

    if (dayError) {
      console.error('Failed to get day data:', dayError);
      throw dayError;
    }

    const { data: weekData, error: weekError } = await supabase
      .from('course_weeks')
      .select('course_id')
      .eq('id', dayData.week_id)
      .single();

    if (weekError) {
      console.error('Failed to get week data:', weekError);
      throw weekError;
    }

    const courseId = weekData.course_id;

    // Attempt to delete the record and confirm deletion
    const { data, error } = await supabase
      .from('step_completions')
      .delete()
      .eq('user_id', user.id)
      .eq('step_id', stepId)
      .select();  // Ensures we fetch the deleted record

    if (error) {
      console.error('Failed to mark step as incomplete:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Step completion record was not deleted.');
    }

    // Update course progress
    await this.updateCourseProgress(courseId);

    console.log('Step marked as incomplete:', data);
  },

  /**
   * Updates the course progress in the course_progress table.
   * @param courseId - The course ID.
   */
  async updateCourseProgress(courseId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get all required steps for this course
    const { data: allSteps, error: stepsError } = await supabase
      .from('course_steps')
      .select(`
        id,
        is_required,
        day:course_days!inner(
          week:course_weeks!inner(
            course_id
          )
        )
      `)
      .eq('day.week.course_id', courseId);

    if (stepsError) {
      console.error('Failed to get course steps:', stepsError);
      throw stepsError;
    }

    // Filter required steps
    const requiredSteps = allSteps.filter(step => step.is_required);
    const totalSteps = requiredSteps.length;

    // Get completed steps
    const { data: completedStepsData, error: completedError } = await supabase
      .from('step_completions')
      .select(`
        step_id,
        step:course_steps!inner(
          day:course_days!inner(
            week:course_weeks!inner(
              course_id
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('step.day.week.course_id', courseId);

    if (completedError) {
      console.error('Failed to get completed steps:', completedError);
      throw completedError;
    }

    // Count completed required steps
    const completedRequiredSteps = completedStepsData.filter(item => {
      const stepId = item.step_id;
      return requiredSteps.some(reqStep => reqStep.id === stepId);
    }).length;

    // Calculate progress percentage
    const progressPercentage = totalSteps > 0 
      ? Math.round((completedRequiredSteps / totalSteps) * 100) 
      : 0;

    // Update or insert course progress
    const { data: existingProgress, error: existingError } = await supabase
      .from('course_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existingError) {
      console.error('Failed to check existing progress:', existingError);
      throw existingError;
    }

    const now = new Date().toISOString();
    
    if (existingProgress) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('course_progress')
        .update({
          completed_steps: completedRequiredSteps,
          total_steps: totalSteps,
          progress_percentage: progressPercentage,
          last_updated_at: now
        })
        .eq('id', existingProgress.id);

      if (updateError) {
        console.error('Failed to update course progress:', updateError);
        throw updateError;
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('course_progress')
        .insert({
          user_id: user.id,
          course_id: courseId,
          completed_steps: completedRequiredSteps,
          total_steps: totalSteps,
          progress_percentage: progressPercentage,
          last_updated_at: now
        });

      if (insertError) {
        console.error('Failed to insert course progress:', insertError);
        throw insertError;
      }
    }
  },

  /**
   * Fetches the user's progress for a specific course.
   * @param courseId - The course ID.
   * @returns CourseProgress object if found, otherwise null.
   */
  async getCourseProgress(courseId: string): Promise<CourseProgress | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated.');
      return null;
    }

    const { data, error } = await supabase
      .from('course_progress')
      .select('id, user_id, course_id, completed_steps, total_steps, progress_percentage, last_updated_at, created_at')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch course progress:', error);
      throw error;
    }

    return data;
  }
};