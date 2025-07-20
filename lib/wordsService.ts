import { Word } from "@/lib/types";

interface WordsApiResponse {
  words: Word[];
  count: number;
  level: string;
}

/**
 * Fetch words from the database API for a specific CEFR level
 * @param level - CEFR level (a1, a2, b1, b2, c1, c2)
 * @param limit - Number of words to fetch (default: 20 for game sessions)
 * @returns Promise<Word[]> - Array of words for the game
 */
export async function fetchWordsFromDatabase(
  level: string,
  limit: number = 20
): Promise<Word[]> {
  try {
    const response = await fetch(`/api/words?level=${level}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to fetch words: ${errorData.error || response.statusText}`
      );
    }

    const data: WordsApiResponse = await response.json();

    return data.words;
  } catch (error) {
    console.error(`❌ Error fetching words for level ${level}:`, error);

    // Return empty array as fallback to prevent game crashes
    console.warn(`⚠️ Returning empty array as fallback for level ${level}`);
    return [];
  }
}

/**
 * Shuffle an array of words for randomized gameplay
 * @param words - Array of words to shuffle
 * @returns Word[] - Shuffled array of words
 */
export function shuffleWords(words: Word[]): Word[] {
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get words for a game session - fetches from database and shuffles
 * @param level - CEFR level (a1, a2, b1, b2, c1, c2)
 * @param sessionSize - Number of words for the game session (default: 20)
 * @returns Promise<Word[]> - Shuffled array of words ready for gameplay
 */
export async function getGameSessionWords(
  level: string,
  sessionSize: number = 20
): Promise<Word[]> {
  try {
    // Fetch more words than needed for better randomization
    const fetchLimit = Math.max(sessionSize * 2, 50); // Fetch 2x session size or minimum 50
    const words = await fetchWordsFromDatabase(level, fetchLimit);

    if (words.length === 0) {
      console.error(`❌ No words available for level ${level}`);
      return [];
    }

    // Shuffle and take only the needed amount
    const shuffledWords = shuffleWords(words);
    const sessionWords = shuffledWords.slice(0, sessionSize);

    return sessionWords;
  } catch (error) {
    console.error(`❌ Error preparing game session for level ${level}:`, error);
    return [];
  }
}
