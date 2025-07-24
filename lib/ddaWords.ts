// DDA Words Helper Functions - Updated for database integration
// ฟังก์ชันช่วยสำหรับการดึงคำศัพท์ผ่านระบบ DDA

import { Word } from './types';
import { getGameSessionWords } from './words-new';
import { mapLevelToFileName } from './difficultyHelpers';

// ฟังก์ชันดึงคำศัพท์ตามระดับ DDA (async version for database)
export const getDdaWords = async (difficultyLevel: number): Promise<Word[]> => {
    const fileName = mapLevelToFileName(difficultyLevel);
    return await getGameSessionWords(fileName, 50); // Fetch more words for DDA
};

// Simple word cache for DDA system to enable synchronous access
const ddaWordCache: { [level: string]: Word[] } = {};

// Word history tracking for C2 level to avoid immediate repeats
const c2WordHistory: Set<string> = new Set();
const C2_HISTORY_LIMIT = 50; // Remember last 50 words to avoid repeats

// Pre-populate DDA word cache from database
export const preloadDdaWords = async (): Promise<void> => {
    
    // Preload all CEFR levels for DDA use
    const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
    
    for (const level of levels) {
        try {
            const words = await getGameSessionWords(level, 100); // Get more words for variety
            ddaWordCache[level] = words;
        } catch (error) {
            console.error(`❌ Failed to cache words for level ${level}:`, error);
            ddaWordCache[level] = [];
        }
    }
    
};

// ฟังก์ชันดึงคำศัพท์แบบสุ่มตามระดับ DDA - Uses cached words for synchronous access
export const getDdaGameSessionWords = (difficultyLevel: number): Word[] => {
    // Validate difficulty level range
    if (difficultyLevel < 1 || difficultyLevel > 6) {
        console.error(`❌ Invalid difficulty level: ${difficultyLevel}. Must be between 1-6.`);
        difficultyLevel = Math.max(1, Math.min(6, difficultyLevel)); // Clamp to valid range
    }

    const fileName = mapLevelToFileName(difficultyLevel);
    
    // Get words from cache
    const cachedWords = ddaWordCache[fileName] || [];
    
    if (cachedWords.length === 0) {
        console.warn(`⚠️ No cached words available for level ${fileName}. Cache may not be loaded.`);
        // Try to return words from A1 as fallback
        const fallbackWords = ddaWordCache['a1'] || [];
        if (fallbackWords.length > 0) {
            console.warn(`🔄 Using A1 words as fallback for level ${fileName}`);
            const shuffled = [...fallbackWords].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, 20);
        }
        return [];
    }
    
    // Special handling for C2 level to reduce repetition
    if (difficultyLevel === 6) {
        return getC2WordsWithVariety(cachedWords);
    }
    
    // For other levels, use standard shuffling
    const shuffled = [...cachedWords].sort(() => Math.random() - 0.5);
    const sessionWords = shuffled.slice(0, 20);
    
    return sessionWords;
};

// Enhanced C2 word selection with variety and mixed difficulty
const getC2WordsWithVariety = (c2Words: Word[]): Word[] => {
    const sessionSize = 20;
    let selectedWords: Word[] = [];
    
    // Try to get fresh words (not in recent history)
    const availableWords = c2Words.filter(word => !c2WordHistory.has(word.word.toLowerCase()));
    
    if (availableWords.length >= sessionSize) {
        // Enough fresh words available
        const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
        selectedWords = shuffled.slice(0, sessionSize);
    } else {
        // Mix fresh words with some from history, plus lower level words for variety
        const freshWords = [...availableWords].sort(() => Math.random() - 0.5);
        
        // Add some C1 words for variety (30% of session)
        const c1Words = ddaWordCache['c1'] || [];
        const c1Count = Math.min(6, Math.floor(sessionSize * 0.3));
        const c1Selected = c1Words.length > 0 
            ? [...c1Words].sort(() => Math.random() - 0.5).slice(0, c1Count)
            : [];
        
        // Fill remaining slots with C2 words (including some from history if needed)
        const remainingSlots = sessionSize - freshWords.length - c1Selected.length;
        const historyWords = remainingSlots > 0 
            ? [...c2Words].sort(() => Math.random() - 0.5).slice(0, remainingSlots)
            : [];
        
        selectedWords = [...freshWords, ...c1Selected, ...historyWords];
        
        // Shuffle the final mix
        selectedWords = selectedWords.sort(() => Math.random() - 0.5);
        
        console.log(`🎯 C2 Enhanced: ${freshWords.length} fresh C2, ${c1Selected.length} C1, ${historyWords.length} repeat C2`);
    }
    
    // Update word history
    selectedWords.forEach(word => {
        c2WordHistory.add(word.word.toLowerCase());
    });
    
    // Limit history size
    if (c2WordHistory.size > C2_HISTORY_LIMIT) {
        const historyArray = Array.from(c2WordHistory);
        const toRemove = historyArray.slice(0, c2WordHistory.size - C2_HISTORY_LIMIT);
        toRemove.forEach(word => c2WordHistory.delete(word));
    }
    
    return selectedWords.slice(0, sessionSize);
};

// ฟังก์ชันดึงคำศัพท์แบบ "Smoothing" - ผสมระดับความยาก
// เพื่อให้การเปลี่ยนระดับนุ่มนวลขึ้น
export const getDdaWordsSmoothed = async (
    currentLevel: number, 
    previousLevel: number | null = null,
    smoothingRatio: number = 0.3
): Promise<Word[]> => {
    const currentWords = await getDdaWords(currentLevel);
    
    // หากไม่มีระดับก่อนหน้า หรือ smoothingRatio เป็น 0 ให้ใช้คำจากระดับปัจจุบันทั้งหมด
    if (!previousLevel || smoothingRatio === 0 || currentLevel === previousLevel) {
        return currentWords;
    }
    
    const previousWords = await getDdaWords(previousLevel);
    const currentRatio = 1 - smoothingRatio;
    
    // คำนวณจำนวนคำที่จะเอาจากแต่ละระดับ
    const currentWordCount = Math.floor(currentWords.length * currentRatio);
    const previousWordCount = Math.floor(previousWords.length * smoothingRatio);
    
    // สุ่มคำจากแต่ละระดับ
    const shuffledCurrentWords = [...currentWords].sort(() => Math.random() - 0.5);
    const shuffledPreviousWords = [...previousWords].sort(() => Math.random() - 0.5);
    
    // รวมคำจากทั้งสองระดับ
    const mixedWords = [
        ...shuffledCurrentWords.slice(0, currentWordCount),
        ...shuffledPreviousWords.slice(0, previousWordCount)
    ];
    
    // สุ่มคำที่รวมแล้วอีกครั้ง
    return mixedWords.sort(() => Math.random() - 0.5);
};

// ฟังก์ชันดึงคำศัพท์เดียวแบบสุ่มตามระดับ DDA
export const getRandomDdaWord = async (difficultyLevel: number): Promise<Word | null> => {
    const words = await getDdaWords(difficultyLevel);
    if (words.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
};

// ฟังก์ชันดึงคำศัพท์หลายๆ คำแบบสุ่มตามระดับ DDA
export const getRandomDdaWords = async (difficultyLevel: number, count: number): Promise<Word[]> => {
    const words = await getDdaWords(difficultyLevel);
    if (words.length === 0) return [];
    
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, words.length));
};

// ฟังก์ชันเช็คว่าระดับที่ระบุมีคำศัพท์หรือไม่
export const hasDdaWords = async (difficultyLevel: number): Promise<boolean> => {
    const words = await getDdaWords(difficultyLevel);
    return words.length > 0;
};

// ฟังก์ชันหาจำนวนคำในระดับ DDA
export const getDdaWordCount = async (difficultyLevel: number): Promise<number> => {
    const words = await getDdaWords(difficultyLevel);
    return words.length;
};

// Check if player should be offered C2 mastery completion
export const shouldOfferC2Completion = (totalWordsPlayed: number, streakCount: number): boolean => {
    // Offer completion after significant C2 gameplay
    const MASTERY_WORD_THRESHOLD = 100; // After 100 words at C2
    const MASTERY_STREAK_THRESHOLD = 15; // With good streak performance
    
    return totalWordsPlayed >= MASTERY_WORD_THRESHOLD && streakCount >= MASTERY_STREAK_THRESHOLD;
};

// Clear C2 word history (for new games)
export const clearC2WordHistory = (): void => {
    c2WordHistory.clear();
    console.log('🔄 C2 word history cleared for new session');
};
