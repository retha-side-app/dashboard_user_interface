import { supabase } from '../lib/supabase';
import type { CourseContent, CourseStep, CourseDay, CourseWeek } from './types/course';
import type { Quiz } from './types/quiz';

export const courseContentService = {
  async getCourseContent(courseId: string): Promise<CourseContent> {
    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    // Get course weeks
    const { data: weeks, error: weeksError } = await supabase
      .from('course_weeks')
      .select('*')
      .eq('course_id', courseId)
      .order('week_number');

    if (weeksError) throw weeksError;

    // Get days for all weeks
    const weekIds = weeks.map(w => w.id);
    const { data: days, error: daysError } = await supabase
      .from('course_days')
      .select('*')
      .in('week_id', weekIds)
      .order('day_number');

    if (daysError) throw daysError;

    // Get steps for all days
    const dayIds = days.map(d => d.id);
    
    // First get all steps
    const { data: steps, error: stepsError } = await supabase
      .from('course_steps')
      .select('*')
      .in('day_id', dayIds)
      .order('step_number');

    if (stepsError) throw stepsError;

    // Then get quiz data separately for steps that have quizzes
    const quizSteps = steps.filter(step => step.quiz_id);
    let quizData: Record<string, Quiz> = {};

    if (quizSteps.length > 0) {
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          passing_score,
          is_required,
          questions:quiz_questions (
            id,
            question,
            order_number,
            answers:quiz_answers (
              id,
              answer,
              is_correct
            )
          )
        `)
        .in('id', quizSteps.map(s => s.quiz_id));

      if (quizzesError) throw quizzesError;

      // Create a map of quiz data
      quizData = quizzes.reduce((acc, quiz) => ({
        ...acc,
        [quiz.id]: {
          ...quiz,
          questions: quiz.questions.sort((a, b) => a.order_number - b.order_number)
        }
      }), {});
    }

    // Get user's quiz submissions
    const { data: { user } } = await supabase.auth.getUser();
    let quizSubmissions = [];
    
    if (user && quizSteps.length > 0) {
      const { data: submissions, error: submissionsError } = await supabase
        .from('quiz_submissions')
        .select('*')
        .in('quiz_id', quizSteps.map(s => s.quiz_id))
        .eq('user_id', user.id);

      if (submissionsError) throw submissionsError;
      quizSubmissions = submissions || [];
    }

    // Calculate progress
    const totalRequiredSteps = steps.filter(s => s.is_required).length;
    const completedSteps = quizSubmissions.filter(s => s.passed).length;
    const progress = totalRequiredSteps > 0 
      ? Math.round((completedSteps / totalRequiredSteps) * 100) 
      : 0;

    // Organize data into nested structure
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
              quiz: step.quiz_id ? {
                ...quizData[step.quiz_id],
                step_id: step.id // Add step_id to the quiz for reference
              } : undefined
            }))
        }))
    }));

    return {
      title: course.title,
      progress,
      weeks: organizedWeeks
    };
  },

  findNextStep(
    weeks: CourseWeek[],
    currentWeek: CourseWeek,
    currentDay: CourseDay,
    currentStep: CourseStep
  ): { week: CourseWeek; day: CourseDay; step: CourseStep } | null {
    // Find current indices
    const weekIndex = weeks.findIndex(w => w.id === currentWeek.id);
    const dayIndex = currentWeek.days.findIndex(d => d.id === currentDay.id);
    const stepIndex = currentDay.steps.findIndex(s => s.id === currentStep.id);

    // Try next step in current day
    if (stepIndex < currentDay.steps.length - 1) {
      return {
        week: currentWeek,
        day: currentDay,
        step: currentDay.steps[stepIndex + 1]
      };
    }

    // Try first step of next day in current week
    if (dayIndex < currentWeek.days.length - 1) {
      const nextDay = currentWeek.days[dayIndex + 1];
      if (nextDay.steps.length > 0) {
        return {
          week: currentWeek,
          day: nextDay,
          step: nextDay.steps[0]
        };
      }
    }

    // Try first step of first day in next week
    if (weekIndex < weeks.length - 1) {
      const nextWeek = weeks[weekIndex + 1];
      if (nextWeek.days.length > 0 && nextWeek.days[0].steps.length > 0) {
        return {
          week: nextWeek,
          day: nextWeek.days[0],
          step: nextWeek.days[0].steps[0]
        };
      }
    }

    return null;
  },

  findPreviousStep(
    weeks: CourseWeek[],
    currentWeek: CourseWeek,
    currentDay: CourseDay,
    currentStep: CourseStep
  ): { week: CourseWeek; day: CourseDay; step: CourseStep } | null {
    // Find current indices
    const weekIndex = weeks.findIndex(w => w.id === currentWeek.id);
    const dayIndex = currentWeek.days.findIndex(d => d.id === currentDay.id);
    const stepIndex = currentDay.steps.findIndex(s => s.id === currentStep.id);

    // Try previous step in current day
    if (stepIndex > 0) {
      return {
        week: currentWeek,
        day: currentDay,
        step: currentDay.steps[stepIndex - 1]
      };
    }

    // Try last step of previous day in current week
    if (dayIndex > 0) {
      const prevDay = currentWeek.days[dayIndex - 1];
      if (prevDay.steps.length > 0) {
        return {
          week: currentWeek,
          day: prevDay,
          step: prevDay.steps[prevDay.steps.length - 1]
        };
      }
    }

    // Try last step of last day in previous week
    if (weekIndex > 0) {
      const prevWeek = weeks[weekIndex - 1];
      if (prevWeek.days.length > 0) {
        const lastDay = prevWeek.days[prevWeek.days.length - 1];
        if (lastDay.steps.length > 0) {
          return {
            week: prevWeek,
            day: lastDay,
            step: lastDay.steps[lastDay.steps.length - 1]
          };
        }
      }
    }

    return null;
  },

  async submitQuizAnswers(quizId: string, answers: Record<string, string>) {
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

export { type Quiz };