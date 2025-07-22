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
    const fileName = mapLevelToFileName(difficultyLevel);
    
    
    // Get words from cache
    const cachedWords = ddaWordCache[fileName] || [];
    
    if (cachedWords.length === 0) {
        console.warn(`⚠️ No cached words available for level ${fileName}. Cache may not be loaded.`);
        return [];
    }
    
    // Shuffle and return 20 words for the session
    const shuffled = [...cachedWords].sort(() => Math.random() - 0.5);
    const sessionWords = shuffled.slice(0, 20);
    
    return sessionWords;
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
