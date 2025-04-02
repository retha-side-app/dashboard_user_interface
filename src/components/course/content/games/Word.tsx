import React from 'react';
import type { Card } from '../../../../services/types/games';

interface WordProps {
  card: Card;
  onSelect: (card: Card) => void;
  disabled: boolean;
}

const Word: React.FC<WordProps> = ({ card, onSelect, disabled }) => {
  const handleClick = () => {
    if (!disabled && !card.isMatched && !card.isFlipped) {
      onSelect(card);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        aspect-square p-1 md:p-2 cursor-pointer transition-all duration-300
        ${card.isMatched ? 'opacity-0 pointer-events-none' : ''}
        ${disabled ? 'cursor-not-allowed' : ''}
      `}
    >
      <div
        className={`
          w-full h-full rounded-[5px] shadow-md transition-transform duration-500
          ${card.isFlipped ? 'rotate-y-180' : ''}
          transform-style-preserve-3d
        `}
      >
        {/* Front side (hidden) */}
        <div
          className={`
            absolute inset-0 bg-[#aeaeae] rounded-[5px] backface-hidden
            flex items-center justify-center
            ${card.isFlipped ? 'hidden' : ''}
          `}
        >
          <span className="text-white text-lg md:text-2xl">?</span>
        </div>

        {/* Back side (word) */}
        <div
          className={`
            absolute inset-0 bg-white rounded-[5px] backface-hidden rotate-y-180
            flex items-center justify-center p-1 md:p-2 text-center
            ${!card.isFlipped ? 'hidden' : ''}
          `}
        >
          <span className="text-primary text-xs md:text-sm font-medium break-words">
            {card.word}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Word;