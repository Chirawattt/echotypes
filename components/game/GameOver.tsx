"use client";
import { useState } from "react";
import { FaClock, FaKeyboard, FaTrophy, FaUndo, FaHome, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Word } from "@/lib/types";
import IncorrectWordsModal from "./IncorrectWordsModal";

export default function GameOver({ modeId, words, handleRestartGame, handleHomeNavigation, gameStyle, totalChallengeScore, sessionBestStreak, bestWpmAllStyles, bestStreakAllStyles, timeSpent }: {
    modeId: string;
    words: Word[];
    handleRestartGame: () => void;
    handleHomeNavigation?: () => void;
    gameStyle?: 'practice' | 'challenge';
    totalChallengeScore?: number;
    sessionBestStreak?: number;
    databaseBestStreak?: number;
    bestWpmAllStyles?: number;
    bestStreakAllStyles?: number;
    timeSpent?: { minutes: number; seconds: number };
}) {

    const router = useRouter();
    const { wpm, score, highScore, incorrectWords, getModeStats } = useGameStore();
    const [showIncorrectWordsModal, setShowIncorrectWordsModal] = useState(false);
    // Remove useAudio and sound playing from GameOver - moved to GameOverOverlay

    // Get mode-specific statistics (still needed for personal best in some modes)
    const currentModeStats = getModeStats(modeId as 'echo' | 'memory' | 'typing');
    
    // Use best streak across all styles for all modes
    const databaseBestStreak = bestStreakAllStyles ?? 0;
    const thisRoundBestStreak = sessionBestStreak ?? 0;
    
    // Display the higher value between session best streak and database best streak
    const allTimeBestStreak = Math.max(thisRoundBestStreak, databaseBestStreak);
    
    // Use timeSpent prop or retrieve from localStorage if not provided
    const displayTimeSpent = timeSpent ?? (() => {
        if (typeof window !== 'undefined') {
            const gameKey = `${modeId}-${gameStyle}-timeSpent`;
            const storedTime = localStorage.getItem(gameKey);
            if (storedTime) {
                try {
                    return JSON.parse(storedTime);
                } catch (error) {
                    console.error('Error parsing stored timeSpent:', error);
                }
            }
        }
        return { minutes: 0, seconds: 0 };
    })();

    // Use challenge score if in challenge mode, otherwise use regular score
    const displayScore = gameStyle === 'challenge' ? (totalChallengeScore || 0) : score;
    const scoreLabel = gameStyle === 'challenge' ? 'CHALLENGE SCORE' : 'SCORE';
    const scoreUnit = gameStyle === 'challenge' ? 'pts' : '';

    // Use database-fetched high score for both practice and challenge modes
    const displayHighScore = highScore;

    return (
        <motion.main 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 pt-25" 
        >
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, delay: 0.2 }} 
                className="text-center mb-8"
            > 
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                    Game Complete!
                </h1>
                <p className="text-xl text-gray-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                    Here&apos;s how you performed
                </p>
            </motion.div>

            {/* Main Content Container */}
            <div className="w-full max-w-6xl space-y-8">
                
                {/* Main Score Display */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
                    {/* Final Score - Most Prominent */}
                    <div className="lg:col-span-3 bg-white/5 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl">
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-400/30 mb-4">
                                <FaTrophy className="text-3xl text-emerald-400" />
                            </div>
                            <div className="space-y-2">
                                <div className="text-7xl sm:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent leading-none" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    {displayScore}
                                    {scoreUnit && <span className="text-4xl sm:text-5xl text-emerald-400/80 ml-3" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{scoreUnit}</span>}
                                </div>
                                <div className="text-emerald-300 text-2xl sm:text-3xl font-semibold tracking-wide uppercase" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    {scoreLabel}
                                </div>
                                <div className="text-slate-400 text-lg mt-3" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    {modeId === 'typing' ? '🏁 Race Complete!' : '🎯 Challenge Complete!'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* WPM or Time Display */}
                        {modeId === 'typing' ? (
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/15">
                                <div className="text-center space-y-3">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/30">
                                        <FaKeyboard className="text-2xl text-blue-400" />
                                    </div>
                                    <div className="text-5xl font-bold text-blue-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{wpm}</div>
                                    <div className="text-blue-300 text-xl font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>WPM</div>
                                    <div className="text-slate-400 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Words Per Minute</div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/15">
                                <div className="text-center space-y-3">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/30">
                                        <FaClock className="text-2xl text-blue-400" />
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-4xl font-bold text-blue-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        <span>{String(displayTimeSpent.minutes).padStart(2, '0')}</span>
                                        <span className="text-2xl">:</span>
                                        <span>{String(displayTimeSpent.seconds).padStart(2, '0')}</span>
                                    </div>
                                    <div className="text-blue-300 text-xl font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>TIME SPENT</div>
                                    <div className="text-slate-400 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Total Duration</div>
                                </div>
                            </div>
                        )}
                        
                        {/* Best Streak */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/15">
                            <div className="text-center space-y-3">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 border border-orange-400/30">
                                    <span className="text-2xl">🔥</span>
                                </div>
                                <div className="text-4xl font-bold text-orange-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{thisRoundBestStreak}</div>
                                <div className="text-orange-300 text-xl font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>BEST STREAK</div>
                                <div className="text-slate-400 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>This Session</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Correct Words/Answers */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                            <span className="text-2xl">
                                {modeId === 'typing' ? '⚡' : modeId === 'echo' ? '🔊' : modeId === 'memory' ? '🧠' : '💭'}
                            </span>
                        </div>
                        <div className="text-4xl font-bold text-emerald-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{score}</div>
                        <div className="text-emerald-300 text-lg font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            {modeId === 'typing' && gameStyle === 'challenge' ? 'NITRO BOOSTS' : 
                             modeId === 'typing' ? 'CORRECT WORDS' :
                             modeId === 'echo' ? 'CORRECT ECHOES' :
                             modeId === 'memory' ? 'REMEMBERED WORDS' :
                             'CORRECT ANSWERS'}
                        </div>
                        <div className="text-slate-400 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            {modeId === 'typing' && gameStyle === 'challenge' ? 'Energy refills' : 
                             modeId === 'typing' ? 'Words typed correctly' :
                             modeId === 'echo' ? 'Words echoed back' :
                             modeId === 'memory' ? 'Words recalled' :
                             'Questions answered'}
                        </div>
                    </div>

                    {/* Mistakes */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 border border-red-400/30">
                            <span className="text-2xl">💥</span>
                        </div>
                        <div className="text-4xl font-bold text-red-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{incorrectWords.length}</div>
                        <div className="text-red-300 text-lg font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            {modeId === 'typing' && gameStyle === 'challenge' ? 'COLLISIONS' : 'MISTAKES'}
                        </div>
                        <div className="text-slate-400 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            {modeId === 'typing' && gameStyle === 'challenge' ? 'Energy crashes' : 'Incorrect attempts'}
                        </div>
                    </div>

                    {/* Personal Best */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/30">
                            <FaTrophy className="text-2xl text-amber-400" />
                        </div>
                        <div className="text-4xl font-bold text-amber-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            {gameStyle === 'challenge' ? displayHighScore : 
                             (modeId === 'typing' ? (bestWpmAllStyles || 0) : currentModeStats.highScore)}
                            {gameStyle === 'challenge' && <span className="text-xl text-amber-300 ml-1" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>pts</span>}
                            {modeId === 'typing' && gameStyle !== 'challenge' && <span className="text-xl text-amber-300 ml-1" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>WPM</span>}
                        </div>
                        <div className="text-amber-300 text-lg font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>PERSONAL BEST</div>
                        <div className="text-slate-400 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            {gameStyle === 'challenge' ? 'Best challenge score' : 
                             modeId === 'typing' ? `Best WPM in ${modeId} mode` : 
                             `Best score in ${modeId} mode`}
                        </div>
                    </div>

                    {/* All-Time Best Streak */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/30">
                            <span className="text-2xl">👑</span>
                        </div>
                        <div className="text-4xl font-bold text-purple-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{allTimeBestStreak}</div>
                        <div className="text-purple-300 text-lg font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>RECORD STREAK</div>
                        <div className="text-slate-400 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            {allTimeBestStreak === thisRoundBestStreak && thisRoundBestStreak > databaseBestStreak ? 
                                `New ${modeId} record! 🎉` : 
                                `Best in ${modeId} mode`
                            }
                        </div>
                    </div>
                </div>

                {/* Performance Summary */}
                {gameStyle === 'challenge' && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/15">
                        <div className="text-center space-y-4">
                            <h3 className="text-2xl font-semibold text-white flex items-center justify-center gap-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                <span className="text-xl">🏁</span>
                                {modeId === 'typing' ? 'Race Summary' : 'Challenge Summary'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        {modeId === 'typing' ? score : score}
                                    </div>
                                    <div className="text-slate-300 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        {modeId === 'typing' ? 'Energy Refills' : 'Correct Answers'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        {score > 0 ? Math.round((score / (score + incorrectWords.length)) * 100) : 0}%
                                    </div>
                                    <div className="text-slate-300 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Accuracy</div>
                                </div>
                                {thisRoundBestStreak > 0 && (
                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{thisRoundBestStreak}</div>
                                        <div className="text-slate-300 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Max Streak</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Stats for Non-Typing Modes */}
                {modeId !== 'typing' && wpm > 0 && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/15">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/30">
                                <FaKeyboard className="text-2xl text-blue-400" />
                            </div>
                            <div className="text-4xl font-bold text-blue-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{wpm}</div>
                            <div className="text-blue-300 text-xl font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Words Per Minute</div>
                            <div className="text-slate-400 text-sm" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>Typing Speed Bonus</div>
                        </div>
                    </div>
                )}
            </div>
            {incorrectWords.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="w-full max-w-4xl mt-8 mb-8"
                >
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/15 text-center space-y-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-400/30">
                                <FaExclamationTriangle className="text-3xl text-red-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-red-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                Review Your Mistakes
                            </h2>
                            <p className="text-slate-300 text-lg" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                You made {incorrectWords.length} mistake{incorrectWords.length > 1 ? 's' : ''} during this {modeId} session.
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowIncorrectWordsModal(true)}
                            className="bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 text-white font-semibold py-5 px-10 rounded-xl text-xl backdrop-blur-sm border border-red-400/30 transition-all duration-300 hover:scale-105 shadow-lg"
                                                    >
                            <FaExclamationTriangle className="mr-3 text-lg" />
                            <span>View Mistakes ({incorrectWords.length})</span>
                        </Button>
                    </div>
                </motion.div>
            )}
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center mt-8 mb-8" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                <Button 
                    onClick={() => {
                        if (handleHomeNavigation) {
                            handleHomeNavigation();
                        }
                        router.push('/');
                    }} 
                    className="bg-gradient-to-r from-emerald-600/80 to-green-700/80 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-7 px-12 rounded-xl text-xl backdrop-blur-sm border border-emerald-400/30 transition-all duration-300 hover:scale-105 shadow-lg min-w-[200px]"
                                    > 
                    <FaHome className="mr-3 text-lg" /> 
                    <span>หน้าแรก</span> 
                </Button> 
                <Button 
                    onClick={handleRestartGame}
                    className="bg-gradient-to-r from-blue-600/80 to-indigo-700/80 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-7 px-12 rounded-xl text-xl backdrop-blur-sm border border-blue-400/30 transition-all duration-300 hover:scale-105 shadow-lg min-w-[200px]"
                                    >
                    <FaUndo className="mr-3 text-lg" /> 
                    <span>เริ่มใหม่</span> 
                </Button> 
            </div>

            {/* Incorrect Words Modal */}
            <IncorrectWordsModal
                isOpen={showIncorrectWordsModal}
                onClose={() => setShowIncorrectWordsModal(false)}
                incorrectWords={incorrectWords}
                words={words}
                modeId={modeId}
            />
        </motion.main>
    )
}