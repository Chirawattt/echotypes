"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrophy,
  FaMedal,
  FaCrown,
  FaBolt,
  FaFire,
  FaKeyboard,
  FaBrain,
  FaVolumeUp,
} from "react-icons/fa";

interface LeaderboardEntry {
  player_name: string;
  game_mode: string;
  game_style: string;
  score: number;
  highest_streak: number;
  wpm?: number;
  challenge_total_score?: number;
  created_at: string;
  rank: number;
}

interface LeaderboardFilters {
  gameMode: string;
  gameStyle: string;
}

const gameModes = [
  { id: "echo", name: "Echo Mode", icon: FaVolumeUp, color: "text-blue-400" },
  {
    id: "typing",
    name: "Typing Mode",
    icon: FaKeyboard,
    color: "text-green-400",
  },
    {
    id: "memory",
    name: "Memory Mode",
    icon: FaBrain,
    color: "text-purple-400",
  },
];

const gameStyles = [
  { id: "practice", name: "Practice", color: "text-blue-300" },
  { id: "challenge", name: "Challenge", color: "text-orange-300" },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<LeaderboardFilters>({
    gameMode: "typing",
    gameStyle: "challenge",
  });

  // Fetch data when filters change
  useEffect(() => {
    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          gameMode: filters.gameMode,
          gameStyle: filters.gameStyle,
          limit: "20",
        });

        const response = await fetch(`/api/leaderboard?${params}`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
        } else {
          console.error("Failed to fetch leaderboard");
          setLeaderboard([]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [filters, setFilters, setLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaCrown className="text-yellow-400 text-xl" />;
      case 2:
        return <FaTrophy className="text-gray-300 text-lg" />;
      case 3:
        return <FaMedal className="text-orange-400 text-lg" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400/30";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-300/30";
      case 3:
        return "bg-gradient-to-r from-orange-400/20 to-orange-500/20 border-orange-400/30";
      default:
        return "bg-gradient-to-r from-gray-700/20 to-gray-800/20 border-gray-600/20";
    }
  };

  const getCurrentModeIcon = () => {
    const mode = gameModes.find((m) => m.id === filters.gameMode);
    if (mode) {
      const Icon = mode.icon;
      return <Icon className={`${mode.color} text-2xl`} />;
    }
    return <FaKeyboard className="text-green-400 text-2xl" />;
  };

  const formatScore = (entry: LeaderboardEntry) => {
    if (filters.gameStyle === "challenge" && entry.challenge_total_score) {
      return `${entry.challenge_total_score.toLocaleString()} pts`;
    }
    return `${entry.score} words`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 pt-25">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaTrophy className="text-yellow-400 text-4xl" />
            <h1
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
            >
              Leaderboard
            </h1>
          </div>
          <p
            className="text-gray-300 text-lg"
          >
            แข่งขันกับผู้เล่นคนอื่น ๆ ในระบบปรับความยากอัตโนมัติ (DDA)
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6 mb-8"
        >
          <div className="grid grid-cols-1 gap-6">
            {/* Game Mode */}
            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-3"
              >
                Game Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {gameModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, gameMode: mode.id }))
                      }
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
                        ${
                          filters.gameMode === mode.id
                            ? "bg-white/10 border-white/30 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/8"
                        }
                      `}
                    >
                      <Icon
                        className={`text-xl ${
                          filters.gameMode === mode.id
                            ? mode.color
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className="text-xs font-medium"
                      >
                        {mode.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game Style */}
            <div>
              <label
                className="block text-sm font-medium text-gray-300 mb-3"
              >
                Game Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {gameStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, gameStyle: style.id }))
                    }
                    className={`
                      px-4 py-3 rounded-xl border text-sm font-medium transition-all
                      ${
                        filters.gameStyle === style.id
                          ? "bg-white/10 border-white/30 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/8"
                      }
                    `}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current Selection Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-8 p-4 bg-black/10 backdrop-blur-sm rounded-xl border border-white/10"
        >
          {getCurrentModeIcon()}
          <div className="text-center">
            <div
              className="text-lg font-bold text-white"
            >
              {gameModes.find((m) => m.id === filters.gameMode)?.name} •{" "}
              {gameStyles.find((s) => s.id === filters.gameStyle)?.name}
            </div>
            <div className="text-sm text-gray-400">
              {loading ? "Loading..." : `${leaderboard.length} players`}
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p
                className="text-gray-400"
              >
                Loading leaderboard...
              </p>
            </motion.div>
          ) : leaderboard.length > 0 ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={`${entry.player_name}-${entry.rank}-${entry.created_at}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm
                    ${getRankBg(entry.rank)}
                    hover:bg-white/5 transition-all cursor-pointer
                  `}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <div
                      className="font-bold text-white text-lg"
                    >
                      {entry.player_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{formatDate(entry.created_at)}</span>
                      {entry.highest_streak > 0 && (
                        <>
                          <span>•</span>
                          <FaFire className="text-orange-400" />
                          <span>{entry.highest_streak} streak</span>
                        </>
                      )}
                      {entry.wpm && (
                        <>
                          <span>•</span>
                          <FaBolt className="text-yellow-400" />
                          <span>{entry.wpm} WPM</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div
                      className="text-xl font-bold text-white"
                    >
                      {formatScore(entry)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <FaTrophy className="text-gray-600 text-6xl mx-auto mb-4" />
              <h3
                className="text-xl font-bold text-gray-400 mb-2"
              >
                No scores yet
              </h3>
              <p
                className="text-gray-500"
              >
                Be the first to set a score in this category!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
