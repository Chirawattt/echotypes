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
    const { timeSpent, wpm, score, highScore, incorrectWords } = useGameStore();

    // Use challenge score if in challenge mode, otherwise use regular score
    const displayScore = gameStyle === 'challenge' ? (totalChallengeScore || 0) : score;
    const scoreLabel = gameStyle === 'challenge' ? 'CHALLENGE SCORE' : 'SCORE';
    const scoreUnit = gameStyle === 'challenge' ? 'pts' : '';

    // For high score, we need to handle challenge mode differently
    const displayHighScore = gameStyle === 'challenge' ? 
        (typeof localStorage !== 'undefined' ? 
            parseInt(localStorage.getItem(`challengeHighScore_${modeId}_${difficultyId}`) || '0') : 0) : 
        highScore;
    const highScoreLabel = gameStyle === 'challenge' ? 'CHALLENGE HIGH' : 'HIGH SCORE';

    return (
        <main className="flex flex-col items-center min-h-screen bg-[#101010] text-white p-2 sm:p-4 pt-20 sm:pt-28" style={{ fontFamily: "'Caveat Brush', cursive" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="w-full max-w-xl lg:max-w-7xl px-2 sm:px-4 mt-2 sm:mt-5 mb-4 sm:mb-8" > 
                <h2 className="text-3xl sm:text-4xl lg:text-5xl text-center opacity-80">Result</h2> 
            </motion.div >

            {/* Conditional Grid Layout for Typing vs Other Modes */}
            {modeId === 'typing' ? (
                // Typing Mode: Clean 3-column layout (Time, WPM, High Score) - stacks on mobile
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mb-8 sm:mb-15 mt-6 sm:mt-10 px-2 sm:px-4 text-center place-items-center gap-4 sm:gap-6 lg:gap-12">
                    <div className="flex flex-col items-center bg-gradient-to-b from-blue-500/20 to-blue-600/10 rounded-2xl p-4 sm:p-6 border border-blue-500/30 w-full max-w-sm">
                        <FaClock className="text-3xl sm:text-4xl lg:text-5xl text-blue-400 mb-2 sm:mb-3" />
                        <span className="text-blue-300 text-sm sm:text-base lg:text-lg tracking-wider mb-2">TIME SPENT</span>
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400">{String(timeSpent.minutes).padStart(2, '0')}</div>
                                <div className="text-xs sm:text-sm text-blue-300/70">min</div>
                            </div>
                            <div className="text-xl sm:text-2xl lg:text-3xl text-blue-400 font-bold">:</div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400">{String(timeSpent.seconds).padStart(2, '0')}</div>
                                <div className="text-xs sm:text-sm text-blue-300/70">sec</div>
                            </div>
                        </div>
                    </div>

                    {/* Main WPM Display - Larger and More Prominent */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-green-500/20 to-green-600/10 rounded-2xl p-6 sm:p-8 border border-green-500/30 w-full max-w-sm sm:col-span-2 lg:col-span-1">
                        <FaKeyboard className="text-4xl sm:text-5xl lg:text-6xl text-green-400 mb-2 sm:mb-3" />
                        <div className="text-5xl sm:text-6xl lg:text-8xl mb-2 text-green-400 font-bold drop-shadow-lg">{wpm}</div>
                        <span className="text-green-300 text-base sm:text-lg lg:text-xl tracking-wider text-center">WORDS PER MINUTE</span>
                        <div className="text-xs sm:text-sm text-neutral-500 mt-2 text-center">
                            {gameStyle === 'challenge' ? 
                                `${score} words typed correctly` : 
                                `${score} words typed correctly`
                            }
                        </div>
                    </div>

                    <div className="flex items-start justify-center gap-3 sm:gap-4 w-full max-w-sm sm:col-span-2 lg:col-span-1">
                        <div className="flex flex-col items-center text-neutral-300 mr-2">
                            <FaTrophy className="text-4xl sm:text-5xl lg:text-6xl text-amber-400" />
                            <span className="text-sm sm:text-base lg:text-lg text-neutral-400">best speed</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-3xl sm:text-4xl lg:text-5xl mb-1 text-amber-400 font-bold">{highScore}</div>
                            <span className="text-neutral-400 text-sm sm:text-base lg:text-lg">WPM</span>
                        </div>
                    </div>
                </div>
            ) : (
                // Other Modes: 4-column layout with improved time display - responsive grid
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-5xl mb-8 sm:mb-15 mt-6 sm:mt-10 px-2 sm:px-4 text-center place-items-center">
                    {/* Time Spent - Beautiful Card Design */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-blue-500/20 to-blue-600/10 rounded-2xl p-4 sm:p-6 border border-blue-500/30 w-full max-w-sm">
                        <FaClock className="text-3xl sm:text-4xl lg:text-5xl text-blue-400 mb-2 sm:mb-3" />
                        <span className="text-blue-300 text-sm sm:text-base lg:text-lg tracking-wider mb-2 sm:mb-3 text-center">TIME SPENT</span>
                        <div className="flex items-center gap-2">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400">{String(timeSpent.minutes).padStart(2, '0')}</div>
                                <div className="text-xs sm:text-sm text-blue-300/70">min</div>
                            </div>
                            <div className="text-xl sm:text-2xl lg:text-3xl text-blue-400 font-bold">:</div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400">{String(timeSpent.seconds).padStart(2, '0')}</div>
                                <div className="text-xs sm:text-sm text-blue-300/70">sec</div>
                            </div>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-neutral-600/20 to-neutral-700/10 rounded-2xl p-4 sm:p-6 border border-neutral-500/30 w-full max-w-sm">
                        <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 text-white font-bold">
                            {displayScore}
                            {scoreUnit && <span className="text-2xl sm:text-3xl text-neutral-400 ml-2">{scoreUnit}</span>}
                        </div>
                        <span className="text-neutral-400 text-sm sm:text-base lg:text-lg tracking-wider text-center">{scoreLabel}</span>
                        {gameStyle === 'challenge' && (
                            <div className="text-xs sm:text-sm text-neutral-500 mt-2 text-center">
                                {score} words correct
                            </div>
                        )}
                    </div>

                    {/* Total Words */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-neutral-600/20 to-neutral-700/10 rounded-2xl p-4 sm:p-6 border border-neutral-500/30 w-full max-w-sm">
                        <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 text-white font-bold">{difficultyId === 'endless' ? score : words.length}</div>
                        <span className="text-neutral-400 text-sm sm:text-base lg:text-lg tracking-wider text-center">{difficultyId === 'endless' ? 'WORDS COMPLETED' : 'TOTAL WORDS'}</span>
                    </div>

                    {/* High Score */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-amber-500/20 to-amber-600/10 rounded-2xl p-4 sm:p-6 border border-amber-500/30 w-full max-w-sm">
                        <FaTrophy className="text-3xl sm:text-4xl text-amber-400 mb-2" />
                        <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 text-amber-400 font-bold">
                            {displayHighScore}
                            {gameStyle === 'challenge' && <span className="text-2xl sm:text-3xl text-amber-300 ml-2">pts</span>}
                        </div>
                        <span className="text-amber-300 text-sm sm:text-base lg:text-lg tracking-wider text-center">{highScoreLabel}</span>
                    </div>
                </div>
            )}
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
        </main>
    )
}