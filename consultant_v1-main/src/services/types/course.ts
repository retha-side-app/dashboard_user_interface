// Course Content Types
export interface CourseStep {
  id: string;
  step_number: number;
  title: string;
  content: string;
  step_type: 'text' | 'quiz' | 'video' | 'audio';
  is_required: boolean;
  quiz?: Quiz;
}

export interface CourseDay {
  id: string;
  day_number: number;
  title: string;
  description: string;
  has_content: boolean;
  steps: CourseStep[];
}

export interface CourseWeek {
  id: string;
  week_number: number;
  title: string;
  description: string;
  is_published: boolean;
  days: CourseDay[];
}

export interface CourseContent {
  title: string;
  progress: number;
  weeks: CourseWeek[];
}