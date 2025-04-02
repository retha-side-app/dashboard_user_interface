import React, { useState, useEffect } from 'react';
import { gameService } from '../../../../services/gameService';
import type { Flashcard } from '../../../../services/types/games';
import FlashcardComponent from './Flashcard';

interface FlashcardGameProps {
  stepId: string;
}

const FlashcardGame: React.FC<FlashcardGameProps> = ({ stepId }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFlashcards();
  }, [stepId]);

  const loadFlashcards = async () => {
    try {
      const data = await gameService.getFlashcards(stepId);
      setFlashcards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 md:h-64 bg-gray-200 rounded-[5px]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-[5px] text-sm">
        {error}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center text-secondary p-4 text-sm">
        No flashcards available for this step.
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center mb-2 md:mb-4">
        <p className="text-secondary text-sm">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
      </div>

      <FlashcardComponent
        flashcard={flashcards[currentIndex]}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={currentIndex < flashcards.length - 1}
        hasPrevious={currentIndex > 0}
      />
    </div>
  );
};

export default FlashcardGame;