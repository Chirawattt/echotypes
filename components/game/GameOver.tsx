"use client";
import { useState } from "react";
import { FaClock, FaKeyboard, FaTrophy, FaUndo, FaHome, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Word } from "@/lib/types";
import IncorrectWordsModal from "./IncorrectWordsModal";

export default function GameOver({ modeId, words, handleRestartGame, gameStyle, totalChallengeScore, sessionBestStreak, bestWpmAllStyles, bestStreakAllStyles, timeSpent }: {
    modeId: string;
    words: Word[];
    difficultyId: string;
    handleRestartGame: () => void;
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
    
    // Use timeSpent prop or fallback to 0:0 if not provided
    const displayTimeSpent = timeSpent ?? { minutes: 0, seconds: 0 };

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
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center min-h-screen bg-[#101010] text-white p-2 sm:p-4 pt-20 sm:pt-28" 
            style={{ fontFamily: "'Caveat Brush', cursive" }}
        >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="w-full max-w-xl lg:max-w-7xl px-2 sm:px-4 mt-2 sm:mt-5 mb-4 sm:mb-8" > 
                <h2 className="text-3xl sm:text-4xl lg:text-5xl text-center opacity-80">Result</h2> 
            </motion.div >

            {/* Unified Layout for All Modes */}
            <div className="w-full max-w-6xl mb-8 sm:mb-15 mt-6 sm:mt-10 px-2 sm:px-4">
                
                {/* Main Score Display */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Final Score - Most Prominent */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-green-500/20 to-green-600/10 rounded-2xl p-6 sm:p-8 border border-green-500/30 lg:col-span-2">
                        <FaTrophy className="text-5xl sm:text-6xl lg:text-7xl text-green-400 mb-3" />
                        <div className="text-6xl sm:text-7xl lg:text-9xl mb-3 text-green-400 font-bold drop-shadow-lg">
                            {displayScore}
                            {scoreUnit && <span className="text-3xl sm:text-4xl text-green-300 ml-2">{scoreUnit}</span>}
                        </div>
                        <span className="text-green-300 text-xl sm:text-2xl lg:text-3xl tracking-wider text-center font-bold">
                            {scoreLabel}
                        </span>
                        <div className="text-sm sm:text-base text-green-200/80 mt-2 text-center">
                            🏁 {modeId === 'typing' ? 'Race Complete! Final Result' : 'Challenge Complete!'}
                        </div>
                    </div>

                    {/* WPM Display - Only for Typing Mode */}
                    {modeId === 'typing' ? (
                        <div className="flex flex-col items-center bg-gradient-to-b from-blue-500/20 to-blue-600/10 rounded-2xl p-6 sm:p-8 border border-blue-500/30">
                            <FaKeyboard className="text-4xl sm:text-5xl lg:text-6xl text-blue-400 mb-3" />
                            <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 text-blue-400 font-bold">{wpm}</div>
                            <span className="text-blue-300 text-lg sm:text-xl tracking-wider text-center">WPM</span>
                            <div className="text-xs sm:text-sm text-blue-200/70 mt-2 text-center">
                                Words Per Minute
                            </div>
                        </div>
                    ) : (
                        /* Time Display for Other Modes */
                        <div className="flex flex-col items-center bg-gradient-to-b from-blue-500/20 to-blue-600/10 rounded-2xl p-6 sm:p-8 border border-blue-500/30">
                            <FaClock className="text-4xl sm:text-5xl lg:text-6xl text-blue-400 mb-3" />
                            <div className="flex items-center gap-2 mb-2">
                                <div className="text-center">
                                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-400">{String(displayTimeSpent.minutes).padStart(2, '0')}</div>
                                    <div className="text-sm text-blue-300/70">min</div>
                                </div>
                                <div className="text-2xl sm:text-3xl lg:text-4xl text-blue-400 font-bold">:</div>
                                <div className="text-center">
                                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-400">{String(displayTimeSpent.seconds).padStart(2, '0')}</div>
                                    <div className="text-sm text-blue-300/70">sec</div>
                                </div>
                            </div>
                            <span className="text-blue-300 text-lg sm:text-xl tracking-wider text-center">TIME SPENT</span>
                        </div>
                    )}
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                    
                    {/* This Round Best Streak */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-orange-500/20 to-orange-600/10 rounded-2xl p-4 sm:p-6 border border-orange-500/30">
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 text-orange-400 font-bold">{thisRoundBestStreak}</div>
                        <span className="text-orange-300 text-sm sm:text-base tracking-wider text-center">THIS ROUND</span>
                        <div className="text-xs text-orange-200/70 mt-1 text-center">
                            Best streak this game
                        </div>
                    </div>

                    {/* Correct Words/Answers */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-green-500/20 to-green-600/10 rounded-2xl p-4 sm:p-6 border border-green-500/30">
                        <div className="text-3xl mb-2">
                            {modeId === 'typing' ? '⚡' : modeId === 'echo' ? '🔊' : modeId === 'memory' ? '🧠' : '💭'}
                        </div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 text-green-400 font-bold">{score}</div>
                        <span className="text-green-300 text-sm sm:text-base tracking-wider text-center">
                            {modeId === 'typing' && gameStyle === 'challenge' ? 'NITRO BOOSTS' : 
                             modeId === 'typing' ? 'CORRECT WORDS' :
                             modeId === 'echo' ? 'CORRECT ECHOES' :
                             modeId === 'memory' ? 'REMEMBERED WORDS' :
                             'CORRECT ANSWERS'}
                        </span>
                        <div className="text-xs text-green-200/70 mt-1 text-center">
                            {modeId === 'typing' && gameStyle === 'challenge' ? 'Energy refills' : 
                             modeId === 'typing' ? 'Words typed correctly' :
                             modeId === 'echo' ? 'Words echoed back' :
                             modeId === 'memory' ? 'Words recalled' :
                             'Questions answered'}
                        </div>
                    </div>

                    {/* Mistakes */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-red-500/20 to-red-600/10 rounded-2xl p-4 sm:p-6 border border-red-500/30">
                        <div className="text-3xl mb-2">💥</div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 text-red-400 font-bold">{incorrectWords.length}</div>
                        <span className="text-red-300 text-sm sm:text-base tracking-wider text-center">
                            {modeId === 'typing' && gameStyle === 'challenge' ? 'COLLISIONS' : 'MISTAKES'}
                        </span>
                        <div className="text-xs text-red-200/70 mt-1 text-center">
                            {modeId === 'typing' && gameStyle === 'challenge' ? 'Energy crashes' : 'Incorrect attempts'}
                        </div>
                    </div>

                    {/* Personal Best - Mode-specific */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-amber-500/20 to-amber-600/10 rounded-2xl p-4 sm:p-6 border border-amber-500/30">
                        <FaTrophy className="text-3xl sm:text-4xl text-amber-400 mb-2" />
                        <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 text-amber-400 font-bold">
                            {gameStyle === 'challenge' ? displayHighScore : 
                             (modeId === 'typing' ? (bestWpmAllStyles || 0) : currentModeStats.highScore)}
                            {gameStyle === 'challenge' && <span className="text-xl text-amber-300 ml-1">pts</span>}
                            {modeId === 'typing' && gameStyle !== 'challenge' && <span className="text-xl text-amber-300 ml-1">WPM</span>}
                        </div>
                        <span className="text-amber-300 text-sm sm:text-base tracking-wider text-center">PERSONAL BEST</span>
                        <div className="text-xs text-amber-200/70 mt-1 text-center">
                            {gameStyle === 'challenge' ? 'Best challenge score' : 
                             modeId === 'typing' ? `Best WPM in ${modeId} mode` : 
                             `Best score in ${modeId} mode`}
                        </div>
                    </div>

                    {/* All-Time Best Streak for this mode+style */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-purple-500/20 to-purple-600/10 rounded-2xl p-4 sm:p-6 border border-purple-500/30">
                        <div className="text-3xl mb-2">👑</div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 text-purple-400 font-bold">{allTimeBestStreak}</div>
                        <span className="text-purple-300 text-sm sm:text-base tracking-wider text-center">BEST STREAK</span>
                        <div className="text-xs text-purple-200/70 mt-1 text-center">
                            {allTimeBestStreak === thisRoundBestStreak && thisRoundBestStreak > databaseBestStreak ? 
                                `New record in ${modeId} mode! 🎉` : 
                                `Best in ${modeId} mode`
                            }
                        </div>
                    </div>
                </div>

                {/* Performance Summary */}
                {gameStyle === 'challenge' && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                        <div className="text-center">
                            <div className="text-lg sm:text-xl text-purple-300 mb-2">
                                🏁 {modeId === 'typing' ? 'Race Summary' : 'Challenge Summary'}
                            </div>
                            <div className="text-sm sm:text-base text-gray-300">
                                {modeId === 'typing' ? 
                                    `You survived ${score} energy refills before depletion • ` :
                                    `You completed ${score} correct answers • `
                                }
                                Accuracy: {score > 0 ? Math.round((score / (score + incorrectWords.length)) * 100) : 0}% • 
                                {thisRoundBestStreak > 0 && ` Max streak: ${thisRoundBestStreak} consecutive hits`}
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Stats for Non-Typing Modes */}
                {modeId !== 'typing' && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">


                        {/* WPM for Non-Typing Modes (if applicable) */}
                        {wpm > 0 && (
                            <div className="flex items-center justify-center bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                                <div className="text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">{wpm}</div>
                                    <div className="text-sm text-blue-300">Words Per Minute</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {incorrectWords.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="w-full max-w-4xl mb-6 sm:mb-8"
                >
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-4 sm:mb-6 text-red-400 flex items-center justify-center gap-2 sm:gap-3 px-2">
                            <span className="text-red-500">❌</span>
                            <span>Review Your Mistakes</span>
                            <span className="text-red-500">❌</span>
                        </h2>
                        <p className="text-neutral-400 mb-6">
                            You made {incorrectWords.length} mistake{incorrectWords.length > 1 ? 's' : ''} during this {modeId} challenge.
                        </p>
                        <Button
                            onClick={() => setShowIncorrectWordsModal(true)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg flex items-center justify-center gap-3 mx-auto shadow-xl border border-red-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        >
                            <FaExclamationTriangle className="text-xl" />
                            <span>View Mistakes ({incorrectWords.length})</span>
                        </Button>
                    </div>
                </motion.div>
            )}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 mb-6 sm:mb-8 px-2 sm:px-0 w-full max-w-md sm:max-w-none items-center justify-center" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                <Button 
                    onClick={() => router.push('/')} 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 px-12 rounded-2xl text-xl flex items-center justify-center gap-3 w-full sm:w-auto shadow-xl border border-green-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-green-500/25"
                > 
                    <FaHome className="text-xl" /> 
                    <span>หน้าแรก</span> 
                </Button> 
                <Button 
                    onClick={handleRestartGame} 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-6 px-12 rounded-2xl text-xl flex items-center justify-center gap-3 w-full sm:w-auto shadow-xl border border-blue-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25"
                >
                    <FaUndo className="text-xl" /> 
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