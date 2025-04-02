import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Quiz, courseContentService } from '../../../services/courseContentService';
import { useCompletion } from '../../../context/CompletionContext';

interface QuizContentProps {
  quiz: Quiz;
  onComplete: (passed: boolean) => void;
}

interface QuizResult {
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  correctAnswers: Record<string, string>;
}

const QuizContent: React.FC<QuizContentProps> = ({ quiz, onComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { updateStepCompletion } = useCompletion();

  // Get correct answers for each question
  useEffect(() => {
    if (result && !result.correctAnswers) {
      const correctAnswersMap: Record<string, string> = {};
      
      quiz.questions.forEach(question => {
        const correctAnswer = question.answers.find(a => a.is_correct);
        if (correctAnswer) {
          correctAnswersMap[question.id] = correctAnswer.id;
        }
      });
      
      setResult(prev => ({
        ...prev!,
        correctAnswers: correctAnswersMap
      }));
    }
  }, [result, quiz.questions]);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    const unansweredQuestions = quiz.questions.filter(
      q => !selectedAnswers[q.id]
    );

    if (unansweredQuestions.length > 0) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submission = await courseContentService.submitQuizAnswers(
        quiz.id,
        selectedAnswers
      );

      // Create a map of correct answers
      const correctAnswersMap: Record<string, string> = {};
      quiz.questions.forEach(question => {
        const correctAnswer = question.answers.find(a => a.is_correct);
        if (correctAnswer) {
          correctAnswersMap[question.id] = correctAnswer.id;
        }
      });

      setResult({
        score: submission.score,
        passed: submission.passed,
        answers: selectedAnswers,
        correctAnswers: correctAnswersMap
      });

      // Update the completion context if the quiz is passed
      if (submission.passed && quiz.step_id) {
        updateStepCompletion(quiz.step_id, true);
      }

      onComplete(submission.passed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const retakeQuiz = () => {
    setSelectedAnswers({});
    setResult(null);
    setCurrentQuestionIndex(0);
  };

  if (result) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-[5px] shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-primary">Quiz Results</h3>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
              Score: <span className="font-bold">{result.score}%</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {quiz.questions.map((question, index) => {
              const userAnswer = result.answers[question.id];
              const correctAnswer = result.correctAnswers?.[question.id];
              const isCorrect = userAnswer === correctAnswer;
              
              return (
                <div key={question.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start mb-3">
                    <div className="mr-2 mt-0.5">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-[#00bf63]" />
                      ) : (
                        <XCircle className="h-5 w-5 text-[#ff5757]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-primary mb-2">
                        Question {index + 1}: {question.question}
                      </h4>
                      <div className="space-y-2">
                        {question.answers.map(answer => {
                          const isUserSelected = userAnswer === answer.id;
                          const isCorrectAnswer = correctAnswer === answer.id;
                          
                          let bgColor = 'bg-white';
                          let textColor = 'text-secondary';
                          let borderColor = 'border-[#e9e9e9]';
                          
                          if (isUserSelected && isCorrectAnswer) {
                            bgColor = 'bg-green-50';
                            textColor = 'text-[#00bf63]';
                            borderColor = 'border-[#00bf63]';
                          } else if (isUserSelected && !isCorrectAnswer) {
                            bgColor = 'bg-red-50';
                            textColor = 'text-[#ff5757]';
                            borderColor = 'border-[#ff5757]';
                          } else if (isCorrectAnswer) {
                            bgColor = 'bg-green-50';
                            textColor = 'text-[#00bf63]';
                            borderColor = 'border-[#00bf63]';
                          }
                          
                          return (
                            <div 
                              key={answer.id}
                              className={`p-3 rounded-full border ${bgColor} ${textColor} ${borderColor} text-sm`}
                            >
                              {answer.answer}
                              {isUserSelected && !isCorrectAnswer && (
                                <span className="ml-2 text-xs">(Your answer)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={retakeQuiz}
            className="px-4 py-2 bg-primary text-white rounded-[5px] hover:bg-opacity-90"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-[5px] text-sm">
          {error}
        </div>
      )}

      <div className="bg-white p-4 md:p-6 rounded-[5px] shadow-sm">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-base md:text-lg font-medium text-primary">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </h3>
          <div className="flex space-x-1 md:space-x-2">
            {Array.from({ length: quiz.questions.length }).map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full ${
                  index === currentQuestionIndex 
                    ? 'bg-primary' 
                    : selectedAnswers[quiz.questions[index].id] 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <h3 className="text-base md:text-lg font-medium text-primary mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3 mb-8">
          {currentQuestion.answers.map(answer => (
            <button
              key={answer.id}
              onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
              className={`w-full text-left p-3 md:p-4 rounded-full border ${
                selectedAnswers[currentQuestion.id] === answer.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-secondary border-[#e9e9e9] hover:bg-gray-50'
              }`}
            >
              <span className="text-sm md:text-base">{answer.answer}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={goToPreviousQuestion}
            disabled={isFirstQuestion}
            className={`flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-[5px] text-sm ${
              isFirstQuestion
                ? 'text-gray-300 cursor-not-allowed'
                : 'bg-[#aeaeae] text-white hover:bg-opacity-90'
            }`}
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-[#151523] text-white rounded-[5px] hover:bg-opacity-90 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={goToNextQuestion}
              className="flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-[#151523] text-white hover:bg-opacity-90 rounded-[5px] text-sm"
            >
              Next
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizContent;