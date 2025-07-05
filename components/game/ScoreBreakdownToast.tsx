import { motion, AnimatePresence } from 'framer-motion';

interface ScoreCalculation {
    baseScore: number;
    timeBonus: number;
    difficultyMultiplier: number;
    streakBonus: number;
    finalScore: number;
}

interface ScoreBreakdownToastProps {
    gameStyle: 'practice' | 'challenge';
    lastScoreCalculation: ScoreCalculation | null;
    showScoreBreakdown: boolean;
}

export default function ScoreBreakdownToast({
    gameStyle,
    lastScoreCalculation,
    showScoreBreakdown
}: ScoreBreakdownToastProps) {
    if (gameStyle !== 'challenge' || !lastScoreCalculation || !showScoreBreakdown) {
        return null;
    }

    return (
        <AnimatePresence>
            <div className="absolute top-0 right-4 max-w-xs z-20 space-y-2">
                {/* Base Score */}
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{
                        duration: 0.4,
                        delay: 0.1,
                        exit: { duration: 0.3, delay: 0 }
                    }}
                    className="text-cyan-400 font-bold text-lg flex items-center justify-end drop-shadow-lg"
                >
                    +{lastScoreCalculation.baseScore} (base)
                </motion.div>

                {/* Time Bonus */}
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{
                        duration: 0.4,
                        delay: 0.3,
                        exit: { duration: 0.3, delay: 0.2 }
                    }}
                    className="text-cyan-400 font-bold text-lg flex items-center justify-end drop-shadow-lg"
                >
                    +{lastScoreCalculation.timeBonus} (time)
                </motion.div>

                {/* Difficulty Multiplier */}
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{
                        duration: 0.4,
                        delay: 0.5,
                        exit: { duration: 0.3, delay: 0.4 }
                    }}
                    className="text-cyan-400 font-bold text-lg flex items-center justify-end drop-shadow-lg"
                >
                    ×{lastScoreCalculation.difficultyMultiplier} (difficulty)
                </motion.div>

                {/* Streak Bonus */}
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{
                        duration: 0.4,
                        delay: 0.7,
                        exit: { duration: 0.3, delay: 0.6 }
                    }}
                    className="text-cyan-400 font-bold text-lg flex items-center justify-end drop-shadow-lg"
                >
                    +{lastScoreCalculation.streakBonus} (streak)
                </motion.div>

                {/* Final Score */}
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{
                        duration: 0.4,
                        delay: 0.9,
                        exit: { duration: 0.3, delay: 0.8 }
                    }}
                    className="text-cyan-400 font-bold text-xl flex items-center justify-end pt-2 mt-2 drop-shadow-lg"
                >
                    = {lastScoreCalculation.finalScore} pts
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
