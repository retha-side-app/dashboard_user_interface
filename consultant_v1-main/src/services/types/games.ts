export interface Flashcard {
  id: string;
  step_id: string;
  english_word: string;
  turkish_word: string;
  example_sentence: string | null;
  pronunciation_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchingGameWord {
  id: string;
  step_id: string;
  english_word: string;
  turkish_word: string;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  word: string;
  isFlipped: boolean;
  isMatched: boolean;
  language: 'en' | 'tr';
  matchId: string;
}

export interface GameStats {
  attempts: number;
  matches: number;
  startTime: number;
  endTime: number | null;
}