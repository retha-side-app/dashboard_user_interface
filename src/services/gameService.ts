import { supabase } from '../lib/supabase';
import type { Flashcard, MatchingGameWord } from './types/games';
import { generatePronunciation } from '../utils/textToSpeech';

export const gameService = {
  async getFlashcards(stepId: string): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('step_id', stepId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  },

  async getMatchingGameWords(stepId: string): Promise<MatchingGameWord[]> {
    const { data, error } = await supabase
      .from('matching_game_words')
      .select('*')
      .eq('step_id', stepId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  },

  async generatePronunciation(flashcardId: string, englishWord: string): Promise<string> {
    try {
      return await generatePronunciation(flashcardId, englishWord);
    } catch (error) {
      console.error('Failed to generate pronunciation:', error);
      throw error;
    }
  }
};