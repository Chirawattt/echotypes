import { supabase } from './supabase';

export interface GameScoreData {
  gameMode: 'echo' | 'memory' | 'typing';
  difficulty: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' | 'dda';
  gameStyle: 'practice' | 'challenge';
  score: number;
  highestStreak: number;
  wordsCorrect: number;
  wordsIncorrect: number;
  wpm?: number;
  timeSpentSeconds: number;
  challengeTotalScore?: number;
}

export interface GameScore {
  id: number;
  user_id: string;
  game_mode: string;
  difficulty: string;
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

export interface LeaderboardEntry {
  player_name: string;
  game_mode: string;
  difficulty: string;
  game_style: string;
  score: number;
  highest_streak: number;
  wpm?: number;
  challenge_total_score?: number;
  created_at: string;
  rank: number;
}

/**
 * Submit a game score to the database
 */
export async function submitGameScore(scoreData: GameScoreData): Promise<{
  success: boolean;
  isNewHighScore?: boolean;
  isBetterStreak?: boolean;
  message: string;
}> {
  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit score');
    }

    return {
      success: true,
      isNewHighScore: result.isNewHighScore,
      isBetterStreak: result.isBetterStreak,
      message: result.message,
    };
  } catch (error) {
    console.error('Error submitting score:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit score',
    };
  }
}

/**
 * Get user's scores with optional filtering
 */
export async function getUserScores(filters?: {
  gameMode?: string;
  difficulty?: string;
  gameStyle?: string;
}): Promise<GameScore[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.gameMode) params.append('gameMode', filters.gameMode);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.gameStyle) params.append('gameStyle', filters.gameStyle);

    const response = await fetch(`/api/scores?${params.toString()}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch scores');
    }

    return result.scores || [];
  } catch (error) {
    console.error('Error fetching user scores:', error);
    return [];
  }
}

/**
 * Get leaderboard data for a specific game mode and difficulty
 */
export async function getLeaderboard(
  gameMode: string,
  difficulty: string,
  gameStyle: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('public_leaderboard')
      .select('*')
      .eq('game_mode', gameMode)
      .eq('difficulty', difficulty)
      .eq('game_style', gameStyle)
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get user's personal best for a specific game configuration
 */
export async function getPersonalBest(
  gameMode: string,
  difficulty: string,
  gameStyle: string
): Promise<GameScore | null> {
  try {
    const scores = await getUserScores({ gameMode, difficulty, gameStyle });
    return scores[0] || null; // Already sorted by score DESC
  } catch (error) {
    console.error('Error fetching personal best:', error);
    return null;
  }
}

/**
 * Get user's overall statistics across all games
 */
export async function getUserStats(): Promise<{
  totalGames: number;
  totalWordsCorrect: number;
  totalWordsIncorrect: number;
  bestOverallScore: number;
  bestOverallStreak: number;
  favoriteMode: string;
}> {
  try {
    const scores = await getUserScores();
    
    if (scores.length === 0) {
      return {
        totalGames: 0,
        totalWordsCorrect: 0,
        totalWordsIncorrect: 0,
        bestOverallScore: 0,
        bestOverallStreak: 0,
        favoriteMode: 'echo',
      };
    }

    const totalGames = scores.length;
    const totalWordsCorrect = scores.reduce((sum, score) => sum + score.words_correct, 0);
    const totalWordsIncorrect = scores.reduce((sum, score) => sum + score.words_incorrect, 0);
    const bestOverallScore = Math.max(...scores.map(score => score.score));
    const bestOverallStreak = Math.max(...scores.map(score => score.highest_streak));

    // Find favorite mode (most played)
    const modeCount = scores.reduce((count, score) => {
      count[score.game_mode] = (count[score.game_mode] || 0) + 1;
      return count;
    }, {} as Record<string, number>);

    const favoriteMode = Object.entries(modeCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'echo';

    return {
      totalGames,
      totalWordsCorrect,
      totalWordsIncorrect,
      bestOverallScore,
      bestOverallStreak,
      favoriteMode,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalGames: 0,
      totalWordsCorrect: 0,
      totalWordsIncorrect: 0,
      bestOverallScore: 0,
      bestOverallStreak: 0,
      favoriteMode: 'echo',
    };
  }
}

/**
 * Check if user has achieved any new milestones
 */
export async function checkMilestones(newScore: GameScoreData): Promise<{
  newMilestones: string[];
}> {
  try {
    const stats = await getUserStats();
    const milestones: string[] = [];

    // Score milestones
    if (newScore.score >= 50 && stats.bestOverallScore < 50) {
      milestones.push('First 50 words!');
    }
    if (newScore.score >= 100 && stats.bestOverallScore < 100) {
      milestones.push('Century scorer!');
    }

    // Streak milestones
    if (newScore.highestStreak >= 10 && stats.bestOverallStreak < 10) {
      milestones.push('Streak master!');
    }
    if (newScore.highestStreak >= 25 && stats.bestOverallStreak < 25) {
      milestones.push('Unstoppable!');
    }

    // WPM milestones (typing mode only)
    if (newScore.wpm && newScore.wpm >= 40) {
      milestones.push('Speed demon!');
    }

    return { newMilestones: milestones };
  } catch (error) {
    console.error('Error checking milestones:', error);
    return { newMilestones: [] };
  }
}