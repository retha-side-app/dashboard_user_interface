import React, { useState, useEffect } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import type { Flashcard as FlashcardType } from '../../../../services/types/games';
import { gameService } from '../../../../services/gameService';

interface FlashcardProps {
  flashcard: FlashcardType;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({
  flashcard,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [pronunciationUrl, setPronunciationUrl] = useState<string | null>(flashcard.pronunciation_url);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when flashcard changes
    setIsFlipped(false);
    setPronunciationUrl(flashcard.pronunciation_url);
    setAudioError(null);
  }, [flashcard]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const playPronunciation = async () => {
    if (isGeneratingAudio) return;

    try {
      setAudioError(null);
      
      // If we already have a pronunciation URL, play it
      if (pronunciationUrl) {
        const audio = new Audio(pronunciationUrl);
        audio.play();
        return;
      }
      
      // Otherwise, generate one
      setIsGeneratingAudio(true);
      const url = await gameService.generatePronunciation(flashcard.id, flashcard.english_word);
      setPronunciationUrl(url);
      
      // Play the newly generated audio
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('Failed to play pronunciation:', err);
      setAudioError('Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="w-full max-w-sm md:max-w-lg mx-auto">
      <div
        className={`relative h-48 md:h-64 cursor-pointer perspective-1000 transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front side */}
        <div
          className={`absolute inset-0 bg-white rounded-[5px] shadow-md p-4 md:p-6 flex flex-col items-center justify-center backface-hidden ${
            isFlipped ? 'hidden' : ''
          }`}
        >
          <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">
            {flashcard.english_word}
          </h3>
          
          {flashcard.example_sentence && (
            <p className="text-secondary text-sm md:text-base text-center mt-2 md:mt-4">
              {flashcard.example_sentence}
            </p>
          )}
          
          <div className="absolute bottom-3 left-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playPronunciation();
              }}
              disabled={isGeneratingAudio}
              className={`text-secondary hover:text-primary transition-colors ${isGeneratingAudio ? 'cursor-wait' : ''}`}
            >
              {isGeneratingAudio ? (
                <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
              ) : (
                <Volume2 className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.5} />
              )}
            </button>
            {audioError && (
              <p className="text-xs text-red-500 mt-2">{audioError}</p>
            )}
          </div>
        </div>

        {/* Back side */}
        <div
          className={`absolute inset-0 bg-white rounded-[5px] shadow-md p-4 md:p-6 flex flex-col items-center justify-center backface-hidden rotate-y-180 ${
            !isFlipped ? 'hidden' : ''
          }`}
        >
          <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">
            {flashcard.turkish_word}
          </h3>
        </div>
      </div>

      <div className="flex justify-between mt-4 md:mt-6">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-[#aeaeae] text-white rounded-[5px] hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-[#151523] text-white rounded-[5px] hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Flashcard;