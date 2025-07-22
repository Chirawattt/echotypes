"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface LevelChangeNotificationProps {
    currentLevel: number; // 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2
}

const levelNames = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function LevelChangeNotification({ currentLevel }: LevelChangeNotificationProps) {
    const [previousLevel, setPreviousLevel] = useState<number>(0);
    const [showNotification, setShowNotification] = useState(false);
    const [levelChange, setLevelChange] = useState<'up' | 'down' | null>(null);

    useEffect(() => {
        // Skip first initialization
        if (previousLevel === 0) {
            setPreviousLevel(currentLevel);
            return;
        }

        // Detect level change
        if (currentLevel !== previousLevel) {
            const isLevelUp = currentLevel > previousLevel;
            setLevelChange(isLevelUp ? 'up' : 'down');
            setShowNotification(true);

            // Hide notification after 3 seconds
            const timer = setTimeout(() => {
                setShowNotification(false);
                // Reset level change state and update previous level after animation completes
                setTimeout(() => {
                    setLevelChange(null);
                    setPreviousLevel(currentLevel);
                }, 500);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [currentLevel, previousLevel]);

    const getCurrentLevelName = () => {
        return levelNames[currentLevel - 1] || 'A1';
    };

    const getPreviousLevelName = () => {
        return levelNames[previousLevel - 1] || 'A1';
    };

    return (
        <AnimatePresence>
            {showNotification && levelChange && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ 
                        type: "spring", 
                        damping: 20, 
                        stiffness: 300,
                        duration: 0.5
                    }}
                    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
                >
                    <div className={`
                        px-6 py-4 rounded-2xl backdrop-blur-lg border shadow-2xl
                        flex items-center gap-3 min-w-[200px] justify-center
                        ${levelChange === 'up' 
                            ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/30 text-emerald-300' 
                            : 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400/30 text-orange-300'
                        }
                    `}>
                        <div className="text-center" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            <div className="text-sm font-medium opacity-90 mb-1">
                                {levelChange === 'up' ? 'เลื่อนระดับขึ้น!' : 'ระดับลดลง'}
                            </div>
                            <div className="text-lg font-bold flex items-center gap-2">
                                {levelChange === 'up' ? (
                                    // Level up: A1 → A2 (low to high, left to right)
                                    <>
                                        <span>{getPreviousLevelName()}</span>
                                        <FaArrowRight className="text-emerald-400" />
                                        <span>{getCurrentLevelName()}</span>
                                    </>
                                ) : (
                                    // Level down: A2 ← B1 (low to high, right to left arrow)
                                    <>
                                        <span>{getCurrentLevelName()}</span>
                                        <FaArrowLeft className="text-orange-400" />
                                        <span>{getPreviousLevelName()}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}