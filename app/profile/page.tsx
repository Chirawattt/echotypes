"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaKeyboard, FaBrain, FaVolumeUp, FaUser, FaTrophy, FaFire, FaClock, FaBullseye, FaArrowLeft, FaChartLine } from 'react-icons/fa';
import Image from 'next/image';
import { UserStats, SessionStats } from '@/lib/types';

interface ModeStats {
  echo: {
    practice: SessionStats | null;
    challenge: SessionStats | null;
  };
  memory: {
    practice: SessionStats | null;
    challenge: SessionStats | null;
  };
  typing: {
    practice: SessionStats | null;
    challenge: SessionStats | null;
  };
}

const gameModeConfig = {
  echo: {
    name: 'Echo Mode',
    icon: FaVolumeUp,
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 to-cyan-500/10',
    borderColor: 'border-blue-400/30'
  },
  typing: {
    name: 'Typing Mode', 
    icon: FaKeyboard,
    color: 'text-green-400',
    bgGradient: 'from-green-500/20 to-emerald-500/10',
    borderColor: 'border-green-400/30'
  },
  memory: {
    name: 'Memory Mode',
    icon: FaBrain,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-violet-500/10',
    borderColor: 'border-purple-400/30'
  }
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [modeStats, setModeStats] = useState<ModeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchUserData();
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile data
      const profileResponse = await fetch('/api/profile');
      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        setUserStats(profileData.stats);
        setModeStats(profileData.modeStats);
      } else {
        console.error('❌ Profile - API returned error:', profileData.error);
      }
    } catch (error) {
      console.error('❌ Profile - Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-black to-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto pt-20">
        


        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 
            className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
          >
            Profile
          </h1>
          <p 
            className="text-xl text-slate-400"
            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
          >
            Your learning journey
          </p>
        </motion.div>

        {/* User Info Card - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/15 rounded-3xl p-8 mb-12 text-center"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full border-4 border-white/20"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border-4 border-white/20">
                  <FaUser className="text-3xl text-white" />
                </div>
              )}
            </div>
            
            <div>
              <h2 
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
              >
                {session?.user?.name || 'Player'}
              </h2>
              <p 
                className="text-slate-300 text-lg"
                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
              >
                {session?.user?.email}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Simple Stats Grid */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-6 text-center">
              <FaTrophy className="text-3xl text-amber-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                {userStats.totalWordsCorrect}
              </div>
              <div className="text-sm text-amber-200" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                Words Learned
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-6 text-center">
              <FaFire className="text-3xl text-red-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                {userStats.bestStreak}
              </div>
              <div className="text-sm text-red-200" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                Best Streak
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-6 text-center">
              <FaClock className="text-3xl text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                {formatTime(userStats.totalTimeSpent)}
              </div>
              <div className="text-sm text-blue-200" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                Time Played
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-6 text-center">
              <FaBullseye className="text-3xl text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                {userStats.overallAccuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-green-200" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                Accuracy
              </div>
            </div>
          </motion.div>
        )}

        {/* Games Played Summary */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-8 text-center mb-12"
          >
            <h3 
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
            >
              Learning Progress
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-emerald-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                  {userStats.totalGames}
                </div>
                <div className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                  Games Completed
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                  {Math.round(userStats.totalWordsCorrect / Math.max(userStats.totalGames, 1))}
                </div>
                <div className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                  Avg Words/Game
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                  {Math.round(userStats.totalTimeSpent / Math.max(userStats.totalGames, 1) / 60)}
                </div>
                <div className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                  Avg Minutes/Game
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Detailed Game Mode Statistics */}
        {modeStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h3 
              className="text-3xl font-bold text-center text-white mb-8"
              style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
            >
              Mode Statistics
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Object.entries(gameModeConfig).map(([modeKey, config], index) => {
                const practiceData = modeStats[modeKey as keyof ModeStats]?.practice;
                const challengeData = modeStats[modeKey as keyof ModeStats]?.challenge;
                
                return (
                  <motion.div
                    key={modeKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/15 ${config.bgGradient}`}
                  >
                    {/* Mode Header */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                        <config.icon className={`text-3xl ${config.color}`} />
                      </div>
                      <h4 className="text-xl font-bold text-white" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                        {config.name}
                      </h4>
                    </div>

                    {/* Practice Mode Stats */}
                    <div className="mb-6">
                      <h5 className="text-lg font-semibold text-white mb-3 flex items-center gap-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                        <FaChartLine className="text-sm" />
                        Practice
                      </h5>
                      {practiceData ? (
                        <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Games:</span>
                            <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{practiceData.total_games}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Best Score:</span>
                            <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{practiceData.best_score}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Best Streak:</span>
                            <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{practiceData.best_streak}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Accuracy:</span>
                            <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{practiceData.average_accuracy.toFixed(1)}%</span>
                          </div>
                          {modeKey === 'typing' && practiceData.best_wpm && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Best WPM:</span>
                              <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{practiceData.best_wpm}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-2 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>No games yet</p>
                      )}
                    </div>

                    {/* Challenge Mode Stats */}
                    <div>
                      <h5 className="text-lg font-semibold text-white mb-3 flex items-center gap-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                        <FaTrophy className="text-sm" />
                        Challenge
                      </h5>
                      {challengeData ? (
                        <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Games:</span>
                            <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{challengeData.total_games}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Best Score:</span>
                            <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{challengeData.best_challenge_score || challengeData.best_score}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Best Streak:</span>
                            <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{challengeData.best_streak}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Accuracy:</span>
                            <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{challengeData.average_accuracy.toFixed(1)}%</span>
                          </div>
                          {modeKey === 'typing' && challengeData.best_wpm && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Best WPM:</span>
                              <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{challengeData.best_wpm}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-2 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>No games yet</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Simple Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <motion.button
            onClick={() => router.push('/play')}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-4 px-12 rounded-2xl text-xl backdrop-blur-sm border border-emerald-400/30 transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
          >
            Continue Learning
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}