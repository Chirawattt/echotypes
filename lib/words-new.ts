// Main words module - imports all difficulty levels
import { Word } from './words/types';
import { a1Words } from './words/a1';
import { a2Words } from './words/a2';
import { b1Words } from './words/b1';
import { b2Words } from './words/b2';
import { c1Words } from './words/c1';
import { c2Words } from './words/c2';

// Re-export the Word type for external use
export type { Word };

// Organize words by difficulty level
const words = {
    a1: a1Words,
    a2: a2Words,
    b1: b1Words,
    b2: b2Words,
    c1: c1Words,
    c2: c2Words,
};

// Function to get words based on difficulty
export const getWords = (difficulty: string): Word[] => {
    switch (difficulty) {
        case 'a1':
            return words.a1;
        case 'a2':
            return words.a2;
        case 'b1':
            return words.b1;
        case 'b2':
            return words.b2;
        case 'c1':
            return words.c1;
        case 'c2':
            return words.c2;
        case 'endless':
            // Combine all vocabulary from A1 to C2
            return [
                ...words.a1,
                ...words.a2,
                ...words.b1,
                ...words.b2,
                ...words.c1,
                ...words.c2
            ];
        default:
            return words.a1;
    }
};

// Utility function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Function to get shuffled words for a game session
export const getGameSessionWords = (difficulty: string): Word[] => {
    const wordList = getWords(difficulty);
    return shuffleArray(wordList);
};

// Additional utility functions for better organization
export const getWordCount = (difficulty: string): number => {
    return getWords(difficulty).length;
};

export const getAllDifficulties = (): string[] => {
    return ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'endless'];
};

export const getDifficultyInfo = (difficulty: string) => {
    const counts = {
        a1: words.a1.length,
        a2: words.a2.length,
        b1: words.b1.length,
        b2: words.b2.length,
        c1: words.c1.length,
        c2: words.c2.length,
        endless: words.a1.length + words.a2.length + words.b1.length + words.b2.length + words.c1.length + words.c2.length
    };

    return {
        difficulty,
        wordCount: counts[difficulty as keyof typeof counts] || 0,
        isEndless: difficulty === 'endless'
    };
};
