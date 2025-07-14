import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useGameStore } from '@/lib/stores/gameStore';
import { mapLevelToDisplayName } from '@/lib/difficultyHelpers';

interface GameHeaderProps {
    onGoBack: () => void;
    difficultyId: string;
    modeId: string;
    lives: number;
    timeLeft: number;
    score: number;
    gameStyle: 'practice' | 'challenge';
    totalWordsPlayed?: number; // เพิ่มสำหรับติดตามจำนวนคำที่เล่นไปแล้วจริงๆ
}

export default function GameHeader({
    onGoBack,
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
        <div className="flex items-center space-x-1 text-xl sm:text-2xl">
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
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mt-6 relative z-10"
            >
                <motion.button
                    onClick={onGoBack}
                    className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-300 group py-3 px-4 -mx-4 rounded-lg hover:bg-white/5"
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaArrowLeft className="text-lg group-hover:text-red-400 transition-colors duration-300" />
                    <span
                        className="text-lg font-medium group-hover:text-red-400 transition-colors duration-300"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        Back
                    </span>
                </motion.button>
            </motion.div>

            {/* Game Info Section - Hearts and Word Count */}
            <section className="w-full flex justify-between items-center pt-6 px-6 sm:px-8 max-w-6xl mx-auto" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-left"
                >
                    <p className="text-sm sm:text-base lg:text-lg font-bold">Words Played: {totalWordsPlayed}</p>
                    <p className="text-xs sm:text-sm uppercase text-blue-300 font-medium">
                        {difficultyId === 'dda' 
                            ? `Level ${mapLevelToDisplayName(currentDifficultyLevel)}`
                            : difficultyId
                        }
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-right"
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
