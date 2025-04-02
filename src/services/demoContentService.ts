// Create a new file demoContentService.ts that doesn't require authentication

import { supabase } from '../lib/supabase';
import type { CourseContent } from './types/course';

export interface DemoCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration_weeks: number;
  price: number;
  is_demo: boolean;
  is_published: boolean;
}

export interface DemoCourseWeek {
  id: string;
  course_id: string;
  week_number: number;
  title: string;
  description: string | null;
}

export interface DemoCourseDay {
  id: string;
  week_id: string;
  day_number: number;
  title: string;
  description: string | null;
}

export interface DemoCourseStep {
  id: string;
  day_id: string;
  step_number: number;
  title: string;
  content: string | null;
  step_type: string;
}

export const demoContentService = {
  async getDemoCourseContent(courseId: string): Promise<CourseContent> {
    console.log('Fetching demo course content for ID:', courseId);
    
    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('title, is_demo')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;
    console.log('Course details:', course);

    if (!course.is_demo) {
      throw new Error('This course is not available in demo mode');
    }

    // Get course weeks
    const { data: weeks, error: weeksError } = await supabase
      .from('course_weeks')
      .select('*')
      .eq('course_id', courseId)
      .order('week_number');

    if (weeksError) throw weeksError;
    console.log('Course weeks:', weeks);

    if (weeks.length === 0) {
      return {
        title: course.title,
        progress: 0,
        weeks: [],
        is_demo: course.is_demo || false
      };
    }

    // Get days for all weeks
    const weekIds = weeks.map(w => w.id);
    const { data: days, error: daysError } = await supabase
      .from('course_days')
      .select('*')
      .in('week_id', weekIds)
      .order('day_number');

    if (daysError) throw daysError;
    console.log('Course days:', days);

    // Get steps for all days
    const dayIds = days.map(d => d.id);
    
    const { data: steps, error: stepsError } = await supabase
      .from('course_steps')
      .select('*')
      .in('day_id', dayIds)
      .order('step_number');

    if (stepsError) throw stepsError;
    console.log('Course steps:', steps);

    // Organize data into nested structure without requiring user data
    const organizedWeeks = weeks.map(week => ({
      ...week,
      days: days
        .filter(day => day.week_id === week.id)
        .map(day => ({
          ...day,
          steps: steps
            .filter(step => step.day_id === day.id)
            .map(step => ({
              ...step,
              quiz: step.quiz_id ? { step_id: step.id } : undefined
            }))
        }))
    }));

    return {
      title: course.title,
      progress: 0, // Demo courses don't track progress
      weeks: organizedWeeks,
      is_demo: true
    };
  },

  // You can copy the findNextStep and findPreviousStep methods from courseContentService
  // as they don't require authentication

  // Fetch demo course structure (weeks, days, steps)
  getDemoCourseStructure: async (courseId: string) => {
    try {
      // Fetch weeks
      const { data: weeks, error: weeksError } = await supabase
        .from('course_weeks')
        .select('*')
        .eq('course_id', courseId)
        .order('week_number');

      if (weeksError) throw weeksError;

      // Fetch days for all weeks
      const weekIds = weeks.map(week => week.id);
      const { data: days, error: daysError } = await supabase
        .from('course_days')
        .select('*')
        .in('week_id', weekIds)
        .order('day_number');

      if (daysError) throw daysError;

      // Fetch steps for all days
      const dayIds = days.map(day => day.id);
      const { data: steps, error: stepsError } = await supabase
        .from('course_steps')
        .select('*')
        .in('day_id', dayIds)
        .order('step_number');

      if (stepsError) throw stepsError;

      // Organize the data into a nested structure
      const structuredData = weeks.map(week => ({
        ...week,
        days: days
          .filter(day => day.week_id === week.id)
          .map(day => ({
            ...day,
            steps: steps.filter(step => step.day_id === day.id)
          }))
      }));

      return structuredData;
    } catch (error) {
      console.error('Error fetching demo course structure:', error);
      throw error;
    }
  },

  // Fetch a specific step's content
  getDemoStepContent: async (stepId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_steps')
        .select('*')
        .eq('id', stepId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching demo step content:', error);
      throw error;
    }
  },

  // Verify if a course is a demo course
  verifyDemoCourse: async (courseId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('is_demo')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return data?.is_demo || false;
    } catch (error) {
      console.error('Error verifying demo course:', error);
      return false;
    }
  }
};