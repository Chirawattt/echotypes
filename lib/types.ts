// Shared types for word data
export interface Word {
    word: string;
    type?: string;
    meaning: string;
}

// Game session data for individual game records
export interface GameSession {
    id: number;
    user_id: string;
    game_mode: string;
    game_style: string;
    score: number;
    streak: number;
    words_correct: number;
    words_incorrect: number;
    wpm?: number;
    time_spent_seconds: number;
    challenge_total_score?: number;
    played_at: string;
    created_at: string;
}

// Personal best records (GameScores table)
export interface GameScore {
    id: number;
    user_id: string;
    game_mode: string;
    game_style: string;
    score: number;
    highest_streak: number;
    words_correct: number;
    words_incorrect: number;
    wpm?: number;
    time_spent_seconds: number;
    challenge_total_score?: number;
    created_at: string;
    updated_at: string;
}

// Aggregated session statistics
export interface SessionStats {
    user_id: string;
    game_mode: string;
    game_style: string;
    total_games: number;
    total_words_correct: number;
    total_words_incorrect: number;
    total_time_spent: number;
    average_accuracy: number;
    best_score: number;
    best_streak: number;
    best_wpm?: number;
    best_challenge_score?: number;
    first_played: string;
    last_played: string;
}

// Overall user statistics
export interface UserStats {
    totalGames: number;
    totalWordsCorrect: number;
    totalWordsIncorrect: number;
    totalTimeSpent: number;
    overallAccuracy: number;
    bestStreak: number;
}

// Score submission data
export interface ScoreSubmission {
    gameMode: string;
    gameStyle: string;
    score: number;
    streak: number;
    wordsCorrect: number;
    wordsIncorrect: number;
    wpm?: number;
    timeSpentSeconds: number;
    challengeTotalScore?: number;
}