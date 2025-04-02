import { supabase } from '../lib/supabase';

interface TextToSpeechOptions {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number;
}

export const textToSpeech = async ({
  text,
  voice = 'nova',
  model = 'tts-1',
  speed = 1.0
}: TextToSpeechOptions): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_OPENI;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        speed
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    // Get the audio data as a blob
    const audioBlob = await response.blob();
    
    // Create a file from the blob
    const file = new File([audioBlob], `${text.substring(0, 20).replace(/\s+/g, '_')}.mp3`, { 
      type: 'audio/mpeg' 
    });

    // Upload to Supabase storage
    const filePath = `pronunciations/${Date.now()}_${text.substring(0, 20).replace(/\s+/g, '_')}.mp3`;
    
    const { data, error } = await supabase.storage
      .from('course-content')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Return the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('course-content')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
};

export const generatePronunciation = async (
  flashcardId: string, 
  englishWord: string
): Promise<string> => {
  try {
    // Check if we already have a pronunciation for this flashcard
    const { data: flashcard, error: fetchError } = await supabase
      .from('flashcards')
      .select('pronunciation_url')
      .eq('id', flashcardId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // If we already have a pronunciation URL, return it
    if (flashcard.pronunciation_url) {
      return flashcard.pronunciation_url;
    }
    
    // Generate a new pronunciation
    const pronunciationUrl = await textToSpeech({
      text: englishWord,
      voice: 'nova', // Using a clear voice for language learning
      model: 'tts-1-hd', // Higher quality for better pronunciation
      speed: 0.9 // Slightly slower for better clarity
    });
    
    // Update the flashcard with the new pronunciation URL
    const { error: updateError } = await supabase
      .from('flashcards')
      .update({ pronunciation_url: pronunciationUrl })
      .eq('id', flashcardId);
    
    if (updateError) throw updateError;
    
    return pronunciationUrl;
  } catch (error) {
    console.error('Failed to generate pronunciation:', error);
    throw error;
  }
};