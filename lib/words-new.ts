// Main words module - now fetches from database instead of local files
import { Word } from './types';
import { getGameSessionWords as fetchGameSessionWords } from './wordsService';

// Re-export the Word type for external use
export type { Word };

/**
 * Get words for a game session from the database
 * This replaces the old file-based system with database fetching
 * @param difficulty - CEFR level (a1, a2, b1, b2, c1, c2)
 * @param sessionSize - Number of words for the game session (default: 20)
 * @returns Promise<Word[]> - Array of shuffled words from the database
 */
export const getGameSessionWords = async (
  difficulty: string, 
  sessionSize: number = 20
): Promise<Word[]> => {
  
  try {
    const words = await fetchGameSessionWords(difficulty, sessionSize);
    
    if (words.length === 0) {
      console.warn(`⚠️ No words returned for difficulty ${difficulty}`);
    }
    
    return words;
  } catch (error) {
    console.error(`❌ Error fetching words for ${difficulty}:`, error);
    return [];
  }
};

/**
 * Get all available difficulty levels
 * @returns string[] - Array of CEFR levels
 */
export const getAllDifficulties = (): string[] => {
  return ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
};

/**
 * Get difficulty information (placeholder for word counts)
 * Note: Word counts are now dynamic from database, so this returns estimated info
 * @param difficulty - CEFR level
 * @returns Object with difficulty info
 */
export const getDifficultyInfo = (difficulty: string) => {
  return {
    difficulty,
    wordCount: 0, // Dynamic from database, will be populated when words are fetched
    isEndless: false
  };
};

/**
 * Legacy function to maintain compatibility with existing code
 * This is now async and fetches from database
 * @deprecated Use getGameSessionWords instead
 */
export const getWords = async (difficulty: string): Promise<Word[]> => {
  console.warn('⚠️ getWords() is deprecated. Use getGameSessionWords() instead.');
  return await getGameSessionWords(difficulty, 50); // Fetch more words for legacy compatibility
};

/**
 * Legacy function to get word count (placeholder)
 * @deprecated Word counts are now dynamic from database
 */
export const getWordCount = (): number => {
  console.warn('⚠️ getWordCount() is deprecated. Word counts are now dynamic from database.');
  return 0; // Placeholder since counts are dynamic
};