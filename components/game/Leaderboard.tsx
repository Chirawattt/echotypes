'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserScores, type LeaderboardEntry, type GameScore } from '@/lib/database';

interface LeaderboardProps {
  gameMode: 'echo' | 'memory' | 'typing';
  gameStyle: 'practice' | 'challenge';
  limit?: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  filters: {
    gameMode: string;
    gameStyle: string;
    limit: number;
  };
}

export default function Leaderboard({ gameMode, gameStyle, limit = 10 }: LeaderboardProps) {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userScore, setUserScore] = useState<GameScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch leaderboard
        const params = new URLSearchParams({
          gameMode,
          gameStyle,
          limit: limit.toString(),
        });

        const response = await fetch(`/api/leaderboard?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data: LeaderboardResponse = await response.json();
        setLeaderboard(data.leaderboard);

        // Fetch user's personal score if authenticated
        if (session?.user) {
          const userScores = await getUserScores({ gameMode, gameStyle });
          setUserScore(userScores[0] || null);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gameMode, gameStyle, limit, session]);

  const formatGameMode = (mode: string) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  const formatGameStyle = (style: string) => {
    return style.charAt(0).toUpperCase() + style.slice(1);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Leaderboard</h3>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Leaderboard</h3>
        <div className="text-red-400 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">Leaderboard</h3>
        <p className="text-gray-400 text-sm">
          {formatGameMode(gameMode)} • {formatGameStyle(gameStyle)}
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No scores yet. Be the first to play!
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={`${entry.player_name}-${entry.created_at}`}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0
                  ? 'bg-yellow-600/20 border border-yellow-500/50'
                  : index === 1
                  ? 'bg-gray-600/20 border border-gray-500/50'
                  : index === 2
                  ? 'bg-orange-600/20 border border-orange-500/50'
                  : 'bg-gray-700/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-yellow-500 text-black'
                    : index === 1
                    ? 'bg-gray-400 text-black'
                    : index === 2
                    ? 'bg-orange-500 text-black'
                    : 'bg-gray-600 text-white'
                }`}>
                  {entry.rank}
                </div>
                <div>
                  <div className="text-white font-medium">{entry.player_name}</div>
                  <div className="text-gray-400 text-sm">
                    {gameMode === 'typing' && entry.wpm && `${entry.wpm} WPM • `}
                    Streak: {entry.highest_streak}
                    {gameStyle === 'challenge' && entry.challenge_total_score && 
                      ` • Challenge: ${entry.challenge_total_score}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-lg">{entry.score}</div>
                <div className="text-gray-400 text-sm">
                  {new Date(entry.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User's personal score (if not in top list) */}
      {session?.user && userScore && !leaderboard.some(entry => entry.player_name === session.user?.name) && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Your Best Score:</div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-600/20 border border-blue-500/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white">
                You
              </div>
              <div>
                <div className="text-white font-medium">{session.user.name}</div>
                <div className="text-gray-400 text-sm">
                  {gameMode === 'typing' && userScore.wpm && `${userScore.wpm} WPM • `}
                  Streak: {userScore.highest_streak}
                  {gameStyle === 'challenge' && userScore.challenge_total_score && 
                    ` • Challenge: ${userScore.challenge_total_score}`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-lg">{userScore.score}</div>
              <div className="text-gray-400 text-sm">
                {new Date(userScore.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}