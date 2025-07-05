import { create } from 'zustand';
import { Word } from '@/lib/words/types';
import { ScoreCalculation } from '@/lib/scoring';

export type GameStatus = 'countdown' | 'playing' | 'gameOver';

export interface IncorrectWord {
    correct: string;
    incorrect: string;
}

interface GameState {
    // Game status and basic state
    status: GameStatus;
    countdown: number;
    words: Word[];
    currentWordIndex: number;
    userInput: string;
    score: number;
    lives: number;

    // Visual feedback states
    isWrong: boolean;
    isCorrect: boolean;
    isTransitioning: boolean;

    // Timer states
    timeLeft: number;
    startTime: Date | null;
    timeSpent: { minutes: number; seconds: number };
    currentTime: { minutes: number; seconds: number };
    highScore: number;
    wpm: number;

    // Memory mode specific
    isWordVisible: boolean;
    promptText: string;

    // Game data
    incorrectWords: IncorrectWord[];

    // Streak system
    streakCount: number;
    bestStreak: number;

    // Challenge Mode Scoring
    totalChallengeScore: number;
    lastScoreCalculation: ScoreCalculation | null;

    // Actions
    setStatus: (status: GameStatus) => void;
    setCountdown: (countdown: number) => void;
    setWords: (words: Word[]) => void;
    setCurrentWordIndex: (index: number) => void;
    setUserInput: (input: string) => void;
    setScore: (score: number | ((prev: number) => number)) => void;
    setLives: (lives: number | ((prev: number) => number)) => void;
    setIsWrong: (isWrong: boolean) => void;
    setIsCorrect: (isCorrect: boolean) => void;
    setIsTransitioning: (isTransitioning: boolean) => void;
    setTimeLeft: (timeLeft: number | ((prev: number) => number)) => void;
    setStartTime: (startTime: Date | null) => void;
    setTimeSpent: (timeSpent: { minutes: number; seconds: number }) => void;
    setCurrentTime: (currentTime: { minutes: number; seconds: number }) => void;
    setHighScore: (highScore: number) => void;
    setWpm: (wpm: number) => void;
    setIsWordVisible: (isWordVisible: boolean) => void;
    setPromptText: (promptText: string) => void;
    setIncorrectWords: (incorrectWords: IncorrectWord[] | ((prev: IncorrectWord[]) => IncorrectWord[])) => void;

    // Streak actions
    setStreakCount: (count: number) => void;
    setBestStreak: (count: number) => void;
    incrementStreak: () => void;
    resetStreak: () => void;

    // Challenge Mode Scoring actions
    setTotalChallengeScore: (score: number | ((prev: number) => number)) => void;
    setLastScoreCalculation: (calculation: ScoreCalculation | null) => void;
    addChallengeScore: (calculation: ScoreCalculation) => void;
    resetChallengeScore: () => void;

    // Complex actions
    incrementWordIndex: () => void;
    decrementTimeLeft: () => number;
    addIncorrectWord: (word: IncorrectWord) => void;
    resetGame: () => void;
    initializeGame: (words: Word[]) => void;
}

const TYPING_MODE_DURATION = 60;

export const useGameStore = create<GameState>((set, get) => ({
    // Initial state
    status: 'countdown',
    countdown: 0,
    words: [],
    currentWordIndex: 0,
    userInput: '',
    score: 0,
    lives: 3,
    isWrong: false,
    isCorrect: false,
    isTransitioning: false,
    timeLeft: TYPING_MODE_DURATION,
    startTime: null,
    timeSpent: { minutes: 0, seconds: 0 },
    currentTime: { minutes: 0, seconds: 0 },
    highScore: 0,
    wpm: 0,
    isWordVisible: false,
    promptText: '',
    incorrectWords: [],
    streakCount: 0,
    bestStreak: 0,
    totalChallengeScore: 0,
    lastScoreCalculation: null,

    // Basic setters
    setStatus: (status) => set({ status }),
    setCountdown: (countdown) => set({ countdown }),
    setWords: (words) => set({ words }),
    setCurrentWordIndex: (index) => set({ currentWordIndex: index }),
    setUserInput: (input) => set({ userInput: input }),
    setScore: (score) => set((state) => ({
        score: typeof score === 'function' ? score(state.score) : score
    })),
    setLives: (lives) => set((state) => ({
        lives: typeof lives === 'function' ? lives(state.lives) : lives
    })),
    setIsWrong: (isWrong) => set({ isWrong }),
    setIsCorrect: (isCorrect) => set({ isCorrect }),
    setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
    setTimeLeft: (timeLeft) => set((state) => ({
        timeLeft: typeof timeLeft === 'function' ? timeLeft(state.timeLeft) : timeLeft
    })),
    setStartTime: (startTime) => set({ startTime }),
    setTimeSpent: (timeSpent) => set({ timeSpent }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setHighScore: (highScore) => set({ highScore }),
    setWpm: (wpm) => set({ wpm }),
    setIsWordVisible: (isWordVisible) => set({ isWordVisible }),
    setPromptText: (promptText) => set({ promptText }),
    setIncorrectWords: (incorrectWords) => set((state) => ({
        incorrectWords: typeof incorrectWords === 'function' ? incorrectWords(state.incorrectWords) : incorrectWords
    })),

    // Streak actions
    setStreakCount: (count) => set({ streakCount: count }),
    setBestStreak: (count) => set({ bestStreak: count }),
    incrementStreak: () => set((state) => {
        const newStreak = state.streakCount + 1;
        return {
            streakCount: newStreak,
            bestStreak: Math.max(state.bestStreak, newStreak)
        };
    }),
    resetStreak: () => set({ streakCount: 0 }),

    // Challenge Mode Scoring actions
    setTotalChallengeScore: (score) => set((state) => ({
        totalChallengeScore: typeof score === 'function' ? score(state.totalChallengeScore) : score
    })),
    setLastScoreCalculation: (calculation) => set({ lastScoreCalculation: calculation }),
    addChallengeScore: (calculation) => set((state) => ({
        totalChallengeScore: state.totalChallengeScore + calculation.finalScore,
        lastScoreCalculation: calculation
    })),
    resetChallengeScore: () => set({ 
        totalChallengeScore: 0,
        lastScoreCalculation: null
    }),

    // Complex actions
    incrementWordIndex: () => set((state) => ({
        currentWordIndex: state.currentWordIndex + 1
    })),

    decrementTimeLeft: () => {
        const state = get();
        const newTimeLeft = state.timeLeft - 1;
        set({ timeLeft: newTimeLeft });
        return newTimeLeft;
    },

    addIncorrectWord: (word) => set((state) => ({
        incorrectWords: [...state.incorrectWords, word]
    })),

    resetGame: () => set({
        status: 'countdown',
        countdown: 3,
        currentWordIndex: 0,
        userInput: '',
        score: 0,
        lives: 3,
        isWrong: false,
        isCorrect: false,
        isTransitioning: false,
        timeLeft: TYPING_MODE_DURATION,
        startTime: null,
        timeSpent: { minutes: 0, seconds: 0 },
        currentTime: { minutes: 0, seconds: 0 },
        wpm: 0,
        isWordVisible: false,
        promptText: '',
        incorrectWords: [],
        streakCount: 0,
        totalChallengeScore: 0,
        lastScoreCalculation: null,
        // Note: bestStreak is preserved across game resets
    }),

    initializeGame: (words) => set({
        words,
        status: 'countdown',
        countdown: 3,
        currentWordIndex: 0,
        userInput: '',
        score: 0,
        lives: 3,
        isWrong: false,
        isCorrect: false,
        isTransitioning: false,
        timeLeft: TYPING_MODE_DURATION,
        startTime: null,
        timeSpent: { minutes: 0, seconds: 0 },
        currentTime: { minutes: 0, seconds: 0 },
        wpm: 0,
        isWordVisible: false,
        promptText: '',
        incorrectWords: [],
        streakCount: 0,
        totalChallengeScore: 0,
        lastScoreCalculation: null,
        // Note: bestStreak is preserved across game initializations
    }),
}));
