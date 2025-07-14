"use client";
import { FaClock, FaKeyboard, FaTrophy, FaUndo, FaHome } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Word } from "@/lib/words/types";

export default function GameOver({ modeId, words, difficultyId, handleRestartGame, gameStyle, totalChallengeScore }: {
    modeId: string;
    words: Word[];
    difficultyId: string;
    handleRestartGame: () => void;
    gameStyle?: 'practice' | 'challenge';
    totalChallengeScore?: number;
}) {

    const router = useRouter();
    const { timeSpent, wpm, score, highScore, incorrectWords, bestStreak } = useGameStore();
    // Remove useAudio and sound playing from GameOver - moved to GameOverOverlay

    // Use challenge score if in challenge mode, otherwise use regular score
    const displayScore = gameStyle === 'challenge' ? (totalChallengeScore || 0) : score;
    const scoreLabel = gameStyle === 'challenge' ? 'CHALLENGE SCORE' : 'SCORE';
    const scoreUnit = gameStyle === 'challenge' ? 'pts' : '';

    // For high score, we need to handle challenge mode differently
    const displayHighScore = gameStyle === 'challenge' ? 
        (typeof localStorage !== 'undefined' ? 
            parseInt(localStorage.getItem(`challengeHighScore_${modeId}_${difficultyId}`) || '0') : 0) : 
        highScore;

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
                                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-400">{String(timeSpent.minutes).padStart(2, '0')}</div>
                                    <div className="text-sm text-blue-300/70">min</div>
                                </div>
                                <div className="text-2xl sm:text-3xl lg:text-4xl text-blue-400 font-bold">:</div>
                                <div className="text-center">
                                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-400">{String(timeSpent.seconds).padStart(2, '0')}</div>
                                    <div className="text-sm text-blue-300/70">sec</div>
                                </div>
                            </div>
                            <span className="text-blue-300 text-lg sm:text-xl tracking-wider text-center">TIME SPENT</span>
                        </div>
                    )}
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    
                    {/* Highest Streak - Show for all modes */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-orange-500/20 to-orange-600/10 rounded-2xl p-4 sm:p-6 border border-orange-500/30">
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 text-orange-400 font-bold">{bestStreak}</div>
                        <span className="text-orange-300 text-sm sm:text-base tracking-wider text-center">HIGHEST STREAK</span>
                        <div className="text-xs text-orange-200/70 mt-1 text-center">
                            Max consecutive hits
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

                    {/* Personal Best */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-amber-500/20 to-amber-600/10 rounded-2xl p-4 sm:p-6 border border-amber-500/30">
                        <FaTrophy className="text-3xl sm:text-4xl text-amber-400 mb-2" />
                        <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 text-amber-400 font-bold">
                            {displayHighScore}
                            {gameStyle === 'challenge' && <span className="text-xl text-amber-300 ml-1">pts</span>}
                        </div>
                        <span className="text-amber-300 text-sm sm:text-base tracking-wider text-center">PERSONAL BEST</span>
                        <div className="text-xs text-amber-200/70 mt-1 text-center">
                            {gameStyle === 'challenge' ? 'Best challenge score' : 
                             modeId === 'typing' ? 'Best WPM achieved' : 'Best score achieved'}
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
                                {bestStreak > 0 && ` Max streak: ${bestStreak} consecutive hits`}
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Stats for Non-Typing Modes */}
                {modeId !== 'typing' && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Total Words/Questions */}
                        <div className="flex items-center justify-center bg-gradient-to-r from-neutral-500/10 to-neutral-600/10 rounded-xl p-4 border border-neutral-500/20">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                    {difficultyId === 'endless' ? score : words.length}
                                </div>
                                <div className="text-sm text-neutral-400">
                                    {difficultyId === 'endless' ? 
                                        (modeId === 'echo' ? 'Words Echoed' : 
                                         modeId === 'memory' ? 'Words Remembered' : 'Questions Completed') :
                                        (modeId === 'echo' ? 'Total Echo Challenges' : 
                                         modeId === 'memory' ? 'Total Memory Challenges' : 'Total Questions')
                                    }
                                </div>
                            </div>
                        </div>

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
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="w-full max-w-4xl mb-6 sm:mb-8"
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-4 sm:mb-6 lg:mb-8 text-center text-red-400 flex items-center justify-center gap-2 sm:gap-3 px-2">
                            <span className="text-red-500">❌</span>
                            <span className="text-center">Incorrect Words</span>
                            <span className="text-red-500">❌</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-4">
                            {incorrectWords.map((word, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 rounded-2xl p-4 sm:p-6 shadow-2xl border border-neutral-700/50 backdrop-blur-sm hover:shadow-red-500/10 transition-all duration-300"
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                >
                                    {/* Correct Answer */}
                                    <div className="mb-3 sm:mb-4">
                                        <div className="text-xs sm:text-sm text-green-400/80 mb-1 flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Correct Answer
                                        </div>
                                        <div className="text-xl sm:text-2xl lg:text-3xl text-green-400 font-bold bg-green-400/10 rounded-lg py-2 px-3 sm:px-4 border border-green-400/30 break-all">
                                            {word.correct}
                                        </div>
                                    </div>

                                    {/* Your Answer */}
                                    <div>
                                        <div className="text-xs sm:text-sm text-red-400/80 mb-1 flex items-center gap-2">
                                            <span className="text-red-500">✗</span>
                                            Your Answer
                                        </div>
                                        <div className="text-lg sm:text-xl lg:text-2xl text-red-400 font-medium bg-red-400/10 rounded-lg py-2 px-3 sm:px-4 border border-red-400/30 break-all">
                                            {word.incorrect}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 mb-6 sm:mb-8 px-2 sm:px-0 w-full max-w-md sm:max-w-none items-center justify-center" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                <Button onClick={() => router.push('/')} 
                    className="bg-[#86D95C] hover:bg-[#78C351] text-black font-bold py-4 sm:py-6 px-8 sm:px-12 rounded-md text-lg sm:text-xl flex items-center justify-center gap-2 text-center cursor-pointer w-full sm:w-auto"> 
                        <FaHome className="text-base sm:text-lg" /> <span>หน้าแรก</span> 
                </Button> 
                <Button onClick={handleRestartGame} 
                    className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-4 sm:py-6 px-8 sm:px-12 rounded-md text-lg sm:text-xl flex items-center justify-center gap-2 text-center cursor-pointer w-full sm:w-auto">
                        <FaUndo className="text-base sm:text-lg" /> <span>เริ่มใหม่</span> 
                </Button> 
                
            </div>
        </motion.main>
    )
}