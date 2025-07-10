// DDA Words Helper Functions
// ฟังก์ชันช่วยสำหรับการดึงคำศัพท์ผ่านระบบ DDA

import { Word } from './words/types';
import { getWords, getGameSessionWords } from './words-new';
import { mapLevelToFileName } from './difficultyHelpers';

// ฟังก์ชันดึงคำศัพท์ตามระดับ DDA
export const getDdaWords = (difficultyLevel: number): Word[] => {
    const fileName = mapLevelToFileName(difficultyLevel);
    return getWords(fileName);
};

// ฟังก์ชันดึงคำศัพท์แบบสุ่มตามระดับ DDA
export const getDdaGameSessionWords = (difficultyLevel: number): Word[] => {
    const fileName = mapLevelToFileName(difficultyLevel);
    return getGameSessionWords(fileName);
};

// ฟังก์ชันดึงคำศัพท์แบบ "Smoothing" - ผสมระดับความยาก
// เพื่อให้การเปลี่ยนระดับนุ่มนวลขึ้น
export const getDdaWordsSmoothed = (
    currentLevel: number, 
    previousLevel: number | null = null,
    smoothingRatio: number = 0.3
): Word[] => {
    const currentWords = getDdaWords(currentLevel);
    
    // หากไม่มีระดับก่อนหน้า หรือ smoothingRatio เป็น 0 ให้ใช้คำจากระดับปัจจุบันทั้งหมด
    if (!previousLevel || smoothingRatio === 0 || currentLevel === previousLevel) {
        return currentWords;
    }
    
    const previousWords = getDdaWords(previousLevel);
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
export const getRandomDdaWord = (difficultyLevel: number): Word | null => {
    const words = getDdaWords(difficultyLevel);
    if (words.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
};

// ฟังก์ชันดึงคำศัพท์หลายๆ คำแบบสุ่มตามระดับ DDA
export const getRandomDdaWords = (difficultyLevel: number, count: number): Word[] => {
    const words = getDdaWords(difficultyLevel);
    if (words.length === 0) return [];
    
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, words.length));
};

// ฟังก์ชันเช็คว่าระดับที่ระบุมีคำศัพท์หรือไม่
export const hasDdaWords = (difficultyLevel: number): boolean => {
    const words = getDdaWords(difficultyLevel);
    return words.length > 0;
};

// ฟังก์ชันหาจำนวนคำในระดับ DDA
export const getDdaWordCount = (difficultyLevel: number): number => {
    const words = getDdaWords(difficultyLevel);
    return words.length;
};
