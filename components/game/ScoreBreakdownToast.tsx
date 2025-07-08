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
    if (gameStyle !== 'challenge' || !lastScoreCalculation) {
        return null;
    }

    return (
        <div className="absolute -top-5 right-4 max-w-xs z-20">
            <AnimatePresence mode="wait">
                {showScoreBreakdown && (
                    <motion.div
                        key="score-breakdown"
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ 
                            opacity: 0, 
                            scale: 0.8, 
                            x: 20,
                            transition: { duration: 0.5, ease: "easeInOut" }
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut"
                        }}
                        className="space-y-1"
                    >
                        {/* Base Score */}
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.1
                            }}
                            className="text-cyan-400 font-bold text-md flex items-center justify-end drop-shadow-lg"
                        >
                            +{lastScoreCalculation.baseScore} (base)
                        </motion.div>

                        {/* Time Bonus */}
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.3
                            }}
                            className="text-cyan-400 font-bold text-md flex items-center justify-end drop-shadow-lg"
                        >
                            +{lastScoreCalculation.timeBonus} (time)
                        </motion.div>

                        {/* Difficulty Multiplier */}
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.5
                            }}
                            className="text-cyan-400 font-bold text-md flex items-center justify-end drop-shadow-lg"
                        >
                            ×{lastScoreCalculation.difficultyMultiplier} (difficulty)
                        </motion.div>

                        {/* Streak Bonus */}
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.7
                            }}
                            className="text-cyan-400 font-bold text-md flex items-center justify-end drop-shadow-lg"
                        >
                            +{lastScoreCalculation.streakBonus} (streak)
                        </motion.div>

                        {/* Final Score */}
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                delay: 0.9
                            }}
                            className="text-cyan-400 font-bold text-lg flex items-center justify-end pt-2 mt-1 drop-shadow-lg"
                        >
                            = {lastScoreCalculation.finalScore} pts
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
