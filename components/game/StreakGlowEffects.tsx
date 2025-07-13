import { motion } from 'framer-motion';

// Helper function to get streak level
const getStreakLevel = (streak: number) => {
    if (streak >= 20) return 4; // 20+ streak - Unstoppable!
    if (streak >= 10) return 3; // 10-19 streak - In The Zone!
    if (streak >= 5) return 2;  // 5-9 streak - On a Roll!
    if (streak >= 2) return 1;  // 2-4 streak - Warming Up!
    return 0; // 0-1 streak
};

interface StreakGlowEffectsProps {
    streakCount: number;
}

export default function StreakGlowEffects({ streakCount }: StreakGlowEffectsProps) {
    const streakLevel = getStreakLevel(streakCount);
    
    if (streakLevel < 3) {
        return null; // Only show effects for streak level 3+
    }

    const isGolden = streakLevel >= 4;
    const baseColor = isGolden ? 'rgba(255,215,0,0.9)' : 'rgba(251,146,60,0.7)';
    const accentColor = isGolden ? 'rgba(255,165,0,1)' : 'rgba(251,146,60,0.9)';
    const shadowColor = isGolden ? 'rgba(255,215,0,0.6)' : 'rgba(251,146,60,0.5)';

    return (
        <>
            {/* Viewport Edge Effects */}
            {/* Top Edge */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-2 pointer-events-none z-[9999] rounded-b-lg"
                style={{
                    background: `linear-gradient(90deg, transparent, ${baseColor}, ${accentColor}, ${baseColor}, transparent)`,
                    boxShadow: `0 0 30px ${shadowColor}, 0 0 60px ${shadowColor}`
                }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{
                    opacity: [0.4, 1, 0.4],
                    scaleX: [0.9, 1.1, 0.9]
                }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    scaleX: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
            />

            {/* Bottom Edge */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 h-2 pointer-events-none z-[9999] rounded-t-lg"
                style={{
                    background: `linear-gradient(90deg, transparent, ${baseColor}, ${accentColor}, ${baseColor}, transparent)`,
                    boxShadow: `0 0 30px ${shadowColor}, 0 0 60px ${shadowColor}`
                }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{
                    opacity: [0.4, 1, 0.4],
                    scaleX: [0.9, 1.1, 0.9]
                }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 },
                    scaleX: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }
                }}
            />

            {/* Left Edge */}
            <motion.div
                className="fixed top-0 bottom-0 left-0 w-2 pointer-events-none z-[9999] rounded-r-lg"
                style={{
                    background: `linear-gradient(180deg, transparent, ${baseColor}, ${accentColor}, ${baseColor}, transparent)`,
                    boxShadow: `0 0 30px ${shadowColor}, 0 0 60px ${shadowColor}`
                }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{
                    opacity: [0.4, 1, 0.4],
                    scaleY: [0.9, 1.1, 0.9]
                }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
                    scaleY: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
                }}
            />

            {/* Right Edge */}
            <motion.div
                className="fixed top-0 bottom-0 right-0 w-2 pointer-events-none z-[9999] rounded-l-lg"
                style={{
                    background: `linear-gradient(180deg, transparent, ${baseColor}, ${accentColor}, ${baseColor}, transparent)`,
                    boxShadow: `0 0 30px ${shadowColor}, 0 0 60px ${shadowColor}`
                }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{
                    opacity: [0.4, 1, 0.4],
                    scaleY: [0.9, 1.1, 0.9]
                }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 },
                    scaleY: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }
                }}
            />

            
        </>
    );
}
