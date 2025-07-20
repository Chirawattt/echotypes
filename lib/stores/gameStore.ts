import { create } from 'zustand';
import { Word } from '@/lib/types';
import { ScoreCalculation } from '@/lib/scoring';
import { ddaConfig } from '@/lib/ddaConfig';

export type GameStatus = 'loading' | 'countdown' | 'playing' | 'gameOver';

// DDA Types
export interface DdaState {
    currentDifficultyLevel: number; // 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2
    performanceScore: number;       // คะแนนลับสำหรับวัดฟอร์มการเล่น
}

export interface DdaActions {
    updatePerformance: (isCorrect: boolean) => { levelChanged: boolean; newDifficultyLevel: number };
    resetDdaState: () => void;
    setCurrentDifficultyLevel: (level: number) => void;
    setPerformanceScore: (score: number) => void;
}

export interface IncorrectWord {
    correct: string;
    incorrect: string;
}

// Mode-specific statistics
export interface ModeStats {
    highScore: number;
    bestStreak: number;
    totalGamesPlayed: number;
    totalWordsCorrect: number;
    totalWordsMissed: number;
    bestWPM?: number; // Only for typing mode
    bestTime?: { minutes: number; seconds: number }; // Only for non-typing modes
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

    // Streak system (current session)
    streakCount: number;
    bestStreak: number;

    // Mode-specific statistics (persistent)
    modeStats: {
        echo: ModeStats;
        memory: ModeStats;
        typing: ModeStats;
    };

    // Challenge Mode Scoring
    totalChallengeScore: number;
    lastScoreCalculation: ScoreCalculation | null;

    // DDA State
    currentDifficultyLevel: number;
    performanceScore: number;

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

    // Mode-specific statistics actions
    updateModeStats: (mode: 'echo' | 'memory' | 'typing', stats: Partial<ModeStats>) => void;
    getModeStats: (mode: 'echo' | 'memory' | 'typing') => ModeStats;

    // Challenge Mode Scoring actions
    setTotalChallengeScore: (score: number | ((prev: number) => number)) => void;
    setLastScoreCalculation: (calculation: ScoreCalculation | null) => void;
    addChallengeScore: (calculation: ScoreCalculation) => void;
    resetChallengeScore: () => void;

    // DDA Actions
    updatePerformance: (isCorrect: boolean) => { levelChanged: boolean; newDifficultyLevel: number };
    resetDdaState: () => void;
    setCurrentDifficultyLevel: (level: number) => void;
    setPerformanceScore: (score: number) => void;

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
    status: 'loading',
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
    
    // Mode-specific statistics with initial values
    modeStats: {
        echo: {
            highScore: 0,
            bestStreak: 0,
            totalGamesPlayed: 0,
            totalWordsCorrect: 0,
            totalWordsMissed: 0,
            bestTime: { minutes: 0, seconds: 0 }
        },
        memory: {
            highScore: 0,
            bestStreak: 0,
            totalGamesPlayed: 0,
            totalWordsCorrect: 0,
            totalWordsMissed: 0,
            bestTime: { minutes: 0, seconds: 0 }
        },
        typing: {
            highScore: 0,
            bestStreak: 0,
            totalGamesPlayed: 0,
            totalWordsCorrect: 0,
            totalWordsMissed: 0,
            bestWPM: 0
        }
    },
    
    totalChallengeScore: 0,
    lastScoreCalculation: null,
    // DDA Initial state
    currentDifficultyLevel: ddaConfig.INITIAL_DIFFICULTY_LEVEL,
    performanceScore: 0,

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
    setTimeSpent: (timeSpent) => {
        return set({ timeSpent });
    },
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

    // DDA Actions
    updatePerformance: (isCorrect: boolean) => {
        const {
            PERFORMANCE_ON_CORRECT,
            PERFORMANCE_ON_INCORRECT,
            LEVEL_UP_THRESHOLD,
            LEVEL_DOWN_THRESHOLD,
            MAX_DIFFICULTY_LEVEL,
            MIN_DIFFICULTY_LEVEL
        } = ddaConfig;

        const state = get();
        let newPerformanceScore = state.performanceScore + (isCorrect ? PERFORMANCE_ON_CORRECT : PERFORMANCE_ON_INCORRECT);


        // check if performance score is at lowest level and out of bounds
        if (newPerformanceScore < LEVEL_DOWN_THRESHOLD) {
            console.warn('Performance score is below minimum threshold, resetting to level down threshold');
            newPerformanceScore = (LEVEL_DOWN_THRESHOLD + 1);
        } else if (newPerformanceScore > LEVEL_UP_THRESHOLD) {
            newPerformanceScore = LEVEL_UP_THRESHOLD;
        }
        
        let newDifficultyLevel = state.currentDifficultyLevel;
        let levelChanged = false;

        // ตรวจสอบเงื่อนไข Level Up
        if (newPerformanceScore >= LEVEL_UP_THRESHOLD && newDifficultyLevel < MAX_DIFFICULTY_LEVEL) {
            newDifficultyLevel++;
            newPerformanceScore = 0; // รีเซ็ตคะแนนเมื่อเลเวลอัพ
            levelChanged = true;

        }

        // ตรวจสอบเงื่อนไข Level Down
        if (newPerformanceScore <= LEVEL_DOWN_THRESHOLD && newDifficultyLevel > MIN_DIFFICULTY_LEVEL) {
            newDifficultyLevel--;
            newPerformanceScore = 0; // รีเซ็ตคะแนนเมื่อเลเวลลด
            levelChanged = true;
        }

        set({
            currentDifficultyLevel: newDifficultyLevel,
            performanceScore: newPerformanceScore
        });

        return { levelChanged, newDifficultyLevel };
    },
    resetDdaState: () => set({
        currentDifficultyLevel: ddaConfig.INITIAL_DIFFICULTY_LEVEL,
        performanceScore: 0,
    }),
    setCurrentDifficultyLevel: (level) => set({ currentDifficultyLevel: level }),
    setPerformanceScore: (score) => set({ performanceScore: score }),

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

    addIncorrectWord: (word: IncorrectWord) => set((state) => ({
        incorrectWords: [...state.incorrectWords, word]
    })),

    resetGame: () => {

        return set({
            status: 'loading',
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
        bestStreak: 0,
        totalChallengeScore: 0,
        lastScoreCalculation: null,
        // Reset DDA state
        currentDifficultyLevel: ddaConfig.INITIAL_DIFFICULTY_LEVEL,
        performanceScore: 0,
        // Note: bestStreak is preserved across game resets
        });
    },

    initializeGame: (words: Word[]) => {
        return set({
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
        bestStreak: 0, // Reset best streak for new game
        totalChallengeScore: 0,
        lastScoreCalculation: null,
        // Reset DDA state
        currentDifficultyLevel: ddaConfig.INITIAL_DIFFICULTY_LEVEL,
        performanceScore: 0,
        });
    },

    // Mode-specific statistics functions
    updateModeStats: (mode: 'echo' | 'memory' | 'typing', stats: Partial<ModeStats>) => set((state) => ({
        modeStats: {
            ...state.modeStats,
            [mode]: {
                ...state.modeStats[mode],
                ...stats
            }
        }
    })),

    getModeStats: (mode: 'echo' | 'memory' | 'typing') => {
        const state = get();
        return state.modeStats[mode];
    },
}));
