import React, { useState, useEffect } from 'react';
import { gameService } from '../../../../services/gameService';
import type { MatchingGameWord, Card, GameStats } from '../../../../services/types/games';
import Word from './Word';

interface MatchingGameProps {
  stepId: string;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ stepId }) => {
  const [words, setWords] = useState<MatchingGameWord[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    attempts: 0,
    matches: 0,
    startTime: Date.now(),
    endTime: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWords();
  }, [stepId]);

  const loadWords = async () => {
    try {
      const data = await gameService.getMatchingGameWords(stepId);
      if (!data || data.length === 0) {
        setError('No words available for this matching game.');
        return;
      }
      setWords(data);
      initializeGame(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  const initializeGame = (words: MatchingGameWord[]) => {
    const cards: Card[] = [];
    
    words.forEach((word) => {
      // English card
      cards.push({
        id: `en-${word.id}`,
        word: word.english_word,
        isFlipped: false,
        isMatched: false,
        language: 'en',
        matchId: word.id
      });
      
      // Turkish card
      cards.push({
        id: `tr-${word.id}`,
        word: word.turkish_word,
        isFlipped: false,
        isMatched: false,
        language: 'tr',
        matchId: word.id
      });
    });

    // Shuffle cards
    const shuffledCards = cards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    resetGame();
  };

  const resetGame = () => {
    setMatchedPairs(0);
    setFlippedCards([]);
    setGameStats({
      attempts: 0,
      matches: 0,
      startTime: Date.now(),
      endTime: null
    });
  };

  const handleCardSelect = (selectedCard: Card) => {
    if (isChecking || selectedCard.isMatched || flippedCards.length === 2) return;

    // Don't allow selecting the same card twice
    if (flippedCards.find(card => card.id === selectedCard.id)) return;

    // Flip the card
    const updatedCards = cards.map(card =>
      card.id === selectedCard.id ? { ...card, isFlipped: true } : card
    );
    setCards(updatedCards);

    // Add to flipped cards
    const newFlippedCards = [...flippedCards, selectedCard];
    setFlippedCards(newFlippedCards);

    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setTimeout(() => checkMatch(newFlippedCards), 1000);
    }
  };

  const checkMatch = (currentFlippedCards: Card[]) => {
    if (currentFlippedCards.length !== 2) {
      setIsChecking(false);
      setFlippedCards([]);
      return;
    }

    const [first, second] = currentFlippedCards;
    
    // Ensure both cards exist and have different languages
    const isValidMatch = first && second && first.language !== second.language;
    const match = isValidMatch && first.matchId === second.matchId;

    const updatedCards = cards.map(card =>
      card.id === first.id || card.id === second.id
        ? { ...card, isFlipped: false, isMatched: match }
        : card
    );

    setCards(updatedCards);
    setFlippedCards([]);
    setIsChecking(false);

    if (match) {
      const newMatchedPairs = matchedPairs + 1;
      setMatchedPairs(newMatchedPairs);
      
      setGameStats(prev => ({
        ...prev,
        matches: prev.matches + 1,
        endTime: newMatchedPairs === words.length ? Date.now() : null
      }));
    }

    setGameStats(prev => ({
      ...prev,
      attempts: prev.attempts + 1
    }));
  };

  const handleRestart = () => {
    initializeGame(words);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-[5px]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-[5px]">
        {error}
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center text-secondary p-4">
        No words available for this matching game.
      </div>
    );
  }

  // Determine grid columns based on number of cards and screen size
  const getGridCols = () => {
    const totalCards = cards.length;
    if (window.innerWidth < 640) { // Mobile
      return Math.min(3, Math.ceil(Math.sqrt(totalCards)));
    } else {
      return Math.ceil(Math.sqrt(totalCards));
    }
  };
  
  const gridCols = getGridCols();
  const isGameComplete = matchedPairs === words.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleRestart}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-primary text-white text-sm rounded-[5px] hover:bg-opacity-90"
        >
          Restart Game
        </button>
      </div>

      <div
        className={`grid gap-2 md:gap-4`}
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {cards.map((card) => (
          <Word
            key={card.id}
            card={card}
            onSelect={handleCardSelect}
            disabled={isChecking || card.isMatched || card.isFlipped}
          />
        ))}
      </div>

      {isGameComplete && (
        <div className="text-center bg-green-50 p-4 md:p-6 rounded-[5px]">
          <h3 className="text-lg md:text-xl font-bold text-green-700 mb-2">
            Congratulations!
          </h3>
          <p className="text-green-600 text-sm md:text-base">
            You completed the game in {gameStats.attempts} attempts!
          </p>
          <p className="text-green-600 text-sm md:text-base">
            Time: {Math.round((gameStats.endTime! - gameStats.startTime) / 1000)} seconds
          </p>
        </div>
      )}
    </div>
  );
};

export default MatchingGame;