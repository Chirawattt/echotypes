import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useGameStore } from '@/lib/stores/gameStore';
import { mapLevelToDisplayName } from '@/lib/difficultyHelpers';
import StreakDisplay from '@/components/game/StreakDisplay';

interface GameHeaderProps {
    difficultyId: string;
    modeId: string;
    lives: number;
    timeLeft: number;
    score: number;
    gameStyle: 'practice' | 'challenge';
    totalWordsPlayed?: number; // เพิ่มสำหรับติดตามจำนวนคำที่เล่นไปแล้วจริงๆ
}

export default function GameHeader({
    difficultyId,
    modeId,
    lives,
    timeLeft,
    score,
    gameStyle,
    totalWordsPlayed = 0 // ค่า default เป็น 0
}: GameHeaderProps) {
    // ดึง DDA state จาก gameStore
    const { currentDifficultyLevel } = useGameStore();

    const renderLives = () => (
        <div className="flex items-center justify-end space-x-1 text-xl sm:text-2xl ">
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 1 }}
                    animate={{
                        scale: i < lives ? 1 : 0.8,
                        opacity: i < lives ? 1 : 0.5
                    }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.2 }}
                >
                    {i < lives ? (
                        <FaHeart className="text-red-500 drop-shadow-lg" />
                    ) : (
                        <FaRegHeart className="text-red-500/50" />
                    )}
                </motion.div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col items-center w-full shrink-0 relative z-10">
            {/* Game Info Section - Words Played, Streak Display, Lives Remaining */}
            <section className="w-full flex justify-between items-center mt-6 pt-20 px-6 sm:px-8 max-w-6xl mx-auto" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                {/* Word Count and Difficulty Level */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-left flex-1"
                >
                    <p className="text-sm sm:text-base lg:text-lg font-bold">Words Played: {totalWordsPlayed}</p>
                    <p className="text-xs sm:text-sm uppercase text-blue-300 font-medium">
                        {difficultyId === 'dda' 
                            ? `Level ${mapLevelToDisplayName(currentDifficultyLevel)}`
                            : difficultyId
                        }
                    </p>
                </motion.div>

                {/* Streak Display - Center */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex-1 flex justify-center"
                >
                    <StreakDisplay className="scale-75 sm:scale-90" />
                </motion.div>

                {/* Lives Remaining */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-right flex flex-1 flex-col justify-end"
                >
                    {modeId !== 'typing' ? (
                        <motion.div
                            animate={{ scale: lives <= 1 ? [1, 1.1, 1] : 1 }}
                            transition={{ duration: 0.5, repeat: lives <= 1 ? Infinity : 0 }}
                        >
                            {renderLives()}
                        </motion.div>
                    ) : gameStyle === 'practice' ? (
                        <motion.div
                            className={`text-2xl sm:text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-amber-400'}`}
                            animate={{ scale: timeLeft <= 10 ? [1, 1.1, 1] : 1 }}
                            transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
                        >
                            {timeLeft}s
                        </motion.div>
                    ) : (
                        // For Typing Challenge Mode, show score instead of timer/lives
                        <motion.div className="text-right">
                            <p className="text-2xl sm:text-3xl font-bold text-green-400">
                                {score}
                            </p>
                            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                                WPM
                            </p>
                        </motion.div>
                    )}
                    {gameStyle === 'practice' && (
                        <p className="text-xl mt-1 font-medium">
                            {score} words
                        </p>
                    )}
                </motion.div>
            </section>
        </div>
    );
}
