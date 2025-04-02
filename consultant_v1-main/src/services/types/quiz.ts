import React from 'react';

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
  is_required: boolean;
  questions: QuizQuestion[];
  step_id?: string; // Added step_id to track which step this quiz belongs to
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  order_number: number;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  answer: string;
  is_correct: boolean;
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: Record<string, string>;
  score: number;
  passed: boolean;
}