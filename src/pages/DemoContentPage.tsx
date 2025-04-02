import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { courseService } from '../services/courseService';
import { courseContentService } from '../services/courseContentService';
import TextContent from '../components/course/content/TextContent';
import type { CourseContent, CourseWeek, CourseDay, CourseStep } from '../services/types/course';
import { supabase } from '../lib/supabase';

// Define a simplified interface for flashcards
interface Flashcard {
  id: string;
  step_id: string;
  english_word: string;
  turkish_word: string;
  example_sentence: string;
  pronunciation_url: string | null;
}

// Simple Flashcard Component
const SimpleFlashcard: React.FC<{ flashcard: Flashcard }> = ({ flashcard }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 transform hover:shadow-lg"
      onClick={() => setFlipped(!flipped)}
      style={{ minHeight: '200px' }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {!flipped ? (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">{flashcard.english_word}</h3>
            <p className="text-gray-500 text-sm">Click to see translation</p>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">{flashcard.turkish_word}</h3>
            <p className="text-gray-600 italic mt-4">{flashcard.example_sentence}</p>
            <p className="text-gray-500 text-sm mt-4">Click to see English</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Flashcard Deck Component
const FlashcardDeck: React.FC<{ flashcards: Flashcard[] }> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (flashcards.length === 0) {
    return <div className="text-center text-gray-500">No flashcards available</div>;
  }

  return (
    <div className="space-y-4">
      <SimpleFlashcard flashcard={flashcards[currentIndex]} />
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        
        <div className="flex space-x-2">
          <button
            onClick={goToPrevious}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Previous
          </button>
          <button
            onClick={goToNext}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const DemoContentPage: React.FC = () => {
  const { courseId, stepId } = useParams<{ courseId: string; stepId?: string }>();
  const navigate = useNavigate();
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [currentStep, setCurrentStep] = useState<CourseStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [hasFlashcards, setHasFlashcards] = useState(false);

  // Function to fetch flashcards for a step
  const fetchFlashcards = async (stepId: string) => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('step_id', stepId);

      if (error) throw error;
      
      console.log('Fetched flashcards:', data);
      setFlashcards(data || []);
      setHasFlashcards(data && data.length > 0);
      
      return data;
    } catch (err) {
      console.error('Error fetching flashcards:', err);
      setFlashcards([]);
      setHasFlashcards(false);
      return [];
    }
  };

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        if (!courseId) return;

        // Verify this is a demo course
        const course = await courseService.getCourseById(courseId);
        
        // Check if course exists
        if (!course) {
          navigate('/businessclass-demo');
          return;
        }

        // Fetch course content
        const content = await courseContentService.getCourseContent(courseId);
        setCourseContent(content);

        // If no specific step is selected, get the first step
        if (!stepId && content.weeks.length > 0 && content.weeks[0].days.length > 0) {
          const firstStep = content.weeks[0].days[0].steps[0];
          if (firstStep) {
            navigate(`/businessclass-demo/${courseId}/content/${firstStep.id}`);
            return;
          }
        }

        // If stepId is provided, find that step in the content
        if (stepId && content) {
          // Find the step in the content
          let foundStep: CourseStep | null = null;
          
          // Search through all weeks, days, and steps to find the matching step
          for (const week of content.weeks) {
            for (const day of week.days) {
              const step = day.steps.find(s => s.id === stepId);
              if (step) {
                foundStep = step;
                break;
              }
            }
            if (foundStep) break;
          }
          
          if (foundStep) {
            // Set the current step
            setCurrentStep(foundStep);
            
            // Fetch flashcards for this step
            await fetchFlashcards(stepId);
          }
        }
      } catch (err) {
        console.error('Error fetching demo course content:', err);
        setError('Failed to load course content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [courseId, stepId, navigate]);

  const handleStepClick = (stepId: string) => {
    navigate(`/businessclass-demo/${courseId}/content/${stepId}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 p-4 rounded-[5px] text-red-700">
            {error}
          </div>
        </div>
      </MainLayout>
    );
  }

  // Determine content type to display
  const renderStepContent = () => {
    if (!currentStep) return null;

    // Check step type or content to determine what to render
    if (currentStep.step_type === 'text' || !currentStep.step_type) {
      return <TextContent content={currentStep.content || ''} />;
    }
    
    // For other step types, we could add more conditions here
    return <TextContent content={currentStep.content || ''} />;
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course Navigation Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            <div className="space-y-4">
              {courseContent?.weeks.map((week: CourseWeek) => (
                <div key={week.id} className="space-y-2">
                  <h3 className="font-medium text-gray-900">
                    Week {week.week_number}: {week.title}
                  </h3>
                  {week.days.map((day: CourseDay) => (
                    <div key={day.id} className="pl-4 space-y-1">
                      <h4 className="text-sm font-medium text-gray-700">
                        Day {day.day_number}: {day.title}
                      </h4>
                      <div className="pl-4 space-y-1">
                        {day.steps.map((step: CourseStep) => (
                          <button
                            key={step.id}
                            onClick={() => handleStepClick(step.id)}
                            className={`text-sm w-full text-left px-2 py-1 rounded ${
                              stepId === step.id
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {step.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {currentStep ? (
              <div className="space-y-6 md:space-y-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h1 className="text-2xl font-bold mb-6">{currentStep.title}</h1>
                  {renderStepContent()}
                </div>

                {/* Flashcards - conditionally rendered based on hasFlashcards */}
                {hasFlashcards && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6">
                      Flashcards
                    </h2>
                    <FlashcardDeck flashcards={flashcards} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                Select a lesson to start learning
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DemoContentPage; 