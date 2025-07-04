"use client";
import { FaClock, FaKeyboard, FaTrophy, FaUndo, FaHome } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Word } from "@/lib/words/types";

export default function GameOver({ modeId, words, difficultyId, handleRestartGame }: {
    modeId: string;
    words: Word[];
    difficultyId: string;
    handleRestartGame: () => void;
}) {

    const router = useRouter();
    const { timeSpent, wpm, score, highScore, incorrectWords } = useGameStore();

    return (
        <main className="flex flex-col items-center min-h-screen bg-[#101010] text-white p-4 pt-28" style={{ fontFamily: "'Caveat Brush', cursive" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="w-full max-w-xl lg:max-w-7xl px-4 mt-5 mb-8" > <h2 className="text-5xl text-center opacity-80">Result</h2> </motion.div >

            {/* Conditional Grid Layout for Typing vs Other Modes */}
            {modeId === 'typing' ? (
                // Typing Mode: Clean 3-column layout (Time, WPM, High Score)
                <div className="grid grid-cols-3 w-full max-w-5xl mb-15 mt-10 px-4 text-center place-items-center gap-12">
                    <div className="flex flex-col items-center bg-gradient-to-b from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/30">
                        <FaClock className="text-5xl text-blue-400 mb-3" />
                        <span className="text-blue-300 text-lg tracking-wider mb-2">TIME SPENT</span>
                        <div className="flex items-center justify-center gap-3">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-400">{String(timeSpent.minutes).padStart(2, '0')}</div>
                                <div className="text-sm text-blue-300/70">min</div>
                            </div>
                            <div className="text-3xl text-blue-400 font-bold">:</div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-400">{String(timeSpent.seconds).padStart(2, '0')}</div>
                                <div className="text-sm text-blue-300/70">sec</div>
                            </div>
                        </div>
                    </div>

                    {/* Main WPM Display - Larger and More Prominent */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-green-500/20 to-green-600/10 rounded-2xl p-8 border border-green-500/30">
                        <FaKeyboard className="text-6xl text-green-400 mb-3" />
                        <div className="text-8xl mb-2 text-green-400 font-bold drop-shadow-lg">{wpm}</div>
                        <span className="text-green-300 text-xl tracking-wider">WORDS PER MINUTE</span>
                        <div className="text-sm text-neutral-500 mt-2">
                            {score} words typed correctly
                        </div>
                    </div>

                    <div className="flex items-start justify-center gap-4">
                        <div className="flex flex-col items-center text-neutral-300 mr-2">
                            <FaTrophy className="text-6xl text-amber-400" />
                            <span className="text-lg text-neutral-400">best speed</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-5xl mb-1 text-amber-400 font-bold">{highScore}</div>
                            <span className="text-neutral-400 text-lg">WPM</span>
                        </div>
                    </div>
                </div>
            ) : (
                // Other Modes: 4-column layout with improved time display
                <div className="grid grid-cols-4 gap-6 w-full max-w-5xl mb-15 mt-10 px-4 text-center place-items-center">
                    {/* Time Spent - Beautiful Card Design */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/30 min-w-[200px]">
                        <FaClock className="text-5xl text-blue-400 mb-3" />
                        <span className="text-blue-300 text-lg tracking-wider mb-3">TIME SPENT</span>
                        <div className="flex items-center gap-2">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-400">{String(timeSpent.minutes).padStart(2, '0')}</div>
                                <div className="text-sm text-blue-300/70">min</div>
                            </div>
                            <div className="text-3xl text-blue-400 font-bold">:</div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-400">{String(timeSpent.seconds).padStart(2, '0')}</div>
                                <div className="text-sm text-blue-300/70">sec</div>
                            </div>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-neutral-600/20 to-neutral-700/10 rounded-2xl p-6 border border-neutral-500/30 min-w-[150px]">
                        <div className="text-6xl mb-2 text-white font-bold">{score}</div>
                        <span className="text-neutral-400 text-lg tracking-wider">SCORE</span>
                    </div>

                    {/* Total Words */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-neutral-600/20 to-neutral-700/10 rounded-2xl p-6 border border-neutral-500/30 min-w-[150px]">
                        <div className="text-6xl mb-2 text-white font-bold">{difficultyId === 'endless' ? score : words.length}</div>
                        <span className="text-neutral-400 text-lg tracking-wider text-center">{difficultyId === 'endless' ? 'WORDS COMPLETED' : 'TOTAL WORDS'}</span>
                    </div>

                    {/* High Score */}
                    <div className="flex flex-col items-center bg-gradient-to-b from-amber-500/20 to-amber-600/10 rounded-2xl p-6 border border-amber-500/30 min-w-[150px]">
                        <FaTrophy className="text-4xl text-amber-400 mb-2" />
                        <div className="text-6xl mb-2 text-amber-400 font-bold">{highScore}</div>
                        <span className="text-amber-300 text-lg tracking-wider">HIGH SCORE</span>
                    </div>
                </div>
            )}
            {incorrectWords.length > 0 && (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="w-full max-w-4xl mb-8"
                    >
                        <h2 className="text-4xl mb-8 text-center text-red-400 flex items-center justify-center gap-3">
                            <span className="text-red-500">❌</span>
                            Incorrect Words
                            <span className="text-red-500">❌</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                            {incorrectWords.map((word, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 rounded-2xl p-6 shadow-2xl border border-neutral-700/50 backdrop-blur-sm hover:shadow-red-500/10 transition-all duration-300"
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                >
                                    {/* Correct Answer */}
                                    <div className="mb-4">
                                        <div className="text-sm text-green-400/80 mb-1 flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Correct Answer
                                        </div>
                                        <div className="text-3xl text-green-400 font-bold bg-green-400/10 rounded-lg py-2 px-4 border border-green-400/30">
                                            {word.correct}
                                        </div>
                                    </div>

                                    {/* Your Answer */}
                                    <div>
                                        <div className="text-sm text-red-400/80 mb-1 flex items-center gap-2">
                                            <span className="text-red-500">✗</span>
                                            Your Answer
                                        </div>
                                        <div className="text-2xl text-red-400 font-medium bg-red-400/10 rounded-lg py-2 px-4 border border-red-400/30">
                                            {word.incorrect}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
            <div className="flex space-x-8 mb-8" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}> <Button onClick={handleRestartGame} className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-6 px-12 rounded-md text-xl flex items-center gap-2 text-center cursor-pointer"> <FaUndo /> <span>เริ่มใหม่</span> </Button> <Button onClick={() => router.push('/')} className="bg-[#86D95C] hover:bg-[#78C351] text-black font-bold py-6 px-12 rounded-md text-xl flex items-center gap-2 text-center cursor-pointer"> <FaHome /> <span>หน้าแรก</span> </Button> </div>
        </main>
    )
}