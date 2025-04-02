import React, { useState, useEffect } from 'react';
import type { CourseStep } from '../../../services/types/course';
import type { StepMedia } from '../../../services/types/media';
import { mediaService } from '../../../services/mediaService';
import { gameService } from '../../../services/gameService';
import TextContent from './TextContent';
import QuizContent from './QuizContent';
import MediaContent from './media/MediaContent';
import FlashcardGame from './games/FlashcardGame';
import MatchingGame from './games/MatchingGame';
import StepCompletionButton from './StepCompletionButton';

interface StepContentProps {
  step: CourseStep;
  onComplete?: (passed: boolean) => void;
}

const StepContent: React.FC<StepContentProps> = ({ step, onComplete }) => {
  const [stepMedia, setStepMedia] = useState<StepMedia | null>(null);
  const [hasFlashcards, setHasFlashcards] = useState(false);
  const [hasMatchingGame, setHasMatchingGame] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, [step.id]);

  const loadContent = async () => {
    try {
      // Load all content in parallel
      const [media, flashcards, matchingWords] = await Promise.all([
        mediaService.getStepMedia(step.id),
        gameService.getFlashcards(step.id),
        gameService.getMatchingGameWords(step.id)
      ]);

      setStepMedia(media);
      setHasFlashcards(flashcards.length > 0);
      setHasMatchingGame(matchingWords.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load step content');
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (completed: boolean) => {
    // Pass the completion status up to the parent component
    if (onComplete) {
      onComplete(completed);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 md:h-48 bg-gray-200 rounded-[5px]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-[5px] text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {stepMedia && stepMedia.media.length > 0 && (
        <div className="max-w-full md:max-w-2xl mx-auto">
          <MediaContent media={stepMedia.media} />
        </div>
      )}

      {step.content && (
        <TextContent content={step.content} />
      )}

      {step.step_type === 'quiz' && step.quiz && (
        <QuizContent
          quiz={step.quiz}
          onComplete={handleStepComplete}
        />
      )}

      {hasFlashcards && (
        <div className="bg-white rounded-[5px] shadow-sm p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6">Flashcards</h2>
          <FlashcardGame stepId={step.id} />
        </div>
      )}

      {hasMatchingGame && (
        <div className="bg-white rounded-[5px] shadow-sm p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6">Word Matching Game</h2>
          <MatchingGame stepId={step.id} />
        </div>
      )}

      <div className="flex justify-end pt-4 md:pt-6 border-t border-gray-200">
        <StepCompletionButton
          stepId={step.id}
          onComplete={handleStepComplete}
        />
      </div>
    </div>
  );
};

export default StepContent;