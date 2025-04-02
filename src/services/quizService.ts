import { supabase } from '../lib/supabase';
import type { QuizSubmission } from './types/quiz';

export const quizService = {
  async submitQuizAnswers(
    quizId: string,
    answers: Record<string, string>
  ): Promise<QuizSubmission> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get quiz details with correct answers
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions (
          id,
          answers:quiz_answers (
            id,
            is_correct
          )
        )
      `)
      .eq('id', quizId)
      .single();

    if (quizError) throw quizError;

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.answers.find(a => a.is_correct);
      if (correctAnswer && userAnswer === correctAnswer.id) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passing_score;

    // Save submission
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        answers,
        score,
        passed
      })
      .select()
      .single();

    if (submissionError) throw submissionError;
    return submission;
  }
};