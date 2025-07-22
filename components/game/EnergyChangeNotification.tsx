"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaBolt, FaMinus } from 'react-icons/fa';

interface EnergyChangeNotificationProps {
    lastEnergyChange: number; // Positive for increase, negative for decrease
    trigger: number; // Counter to trigger the animation
    gameKey?: string; // Optional key to reset component when game restarts
    isGameActive?: boolean; // Only show notifications when game is active
}

export default function EnergyChangeNotification({ lastEnergyChange, trigger, gameKey, isGameActive = true }: EnergyChangeNotificationProps) {
    const [showNotification, setShowNotification] = useState(false);
    const [energyChange, setEnergyChange] = useState(0);
    const [previousTrigger, setPreviousTrigger] = useState(0);

    // Reset notification state when game key changes (game restarts)
    useEffect(() => {
        if (gameKey !== undefined) {
            setShowNotification(false);
            setEnergyChange(0);
            setPreviousTrigger(0);
        }
    }, [gameKey]);

    useEffect(() => {
        // Only show notification if:
        // 1. Game is active
        // 2. Trigger has actually increased (indicating a new change)
        // 3. We have a non-zero energy change
        if (isGameActive && trigger > previousTrigger && lastEnergyChange !== 0) {
            setEnergyChange(lastEnergyChange);
            setShowNotification(true);
            setPreviousTrigger(trigger);

            // Hide notification after 1.5 seconds (faster than score notifications)
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [lastEnergyChange, trigger, isGameActive, previousTrigger]);

    const isPositive = energyChange > 0;

    return (
        <AnimatePresence>
            {showNotification && energyChange !== 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ 
                        opacity: [0, 1, 1, 0], 
                        y: [0, -20, -30, -50],
                        scale: [0.5, 1.1, 1, 0.8]
                    }}
                    transition={{ 
                        duration: 1.5, 
                        times: [0, 0.2, 0.8, 1],
                        ease: "easeOut"
                    }}
                    className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                >
                    <div className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-base
                        ${isPositive 
                            ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50' 
                            : 'bg-red-500/30 text-red-300 border border-red-400/50'
                        }
                        backdrop-blur-md shadow-xl
                    `} style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                        {isPositive ? (
                            <>
                                <FaBolt className="text-yellow-400" />
                                <span>+{energyChange.toFixed(1)} ⚡</span>
                            </>
                        ) : (
                            <>
                                <FaMinus className="text-red-400" />
                                <span>{energyChange.toFixed(1)} ⚡</span>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}