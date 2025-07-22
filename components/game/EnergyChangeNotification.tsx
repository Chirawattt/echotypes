"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaBolt, FaMinus } from 'react-icons/fa';

interface EnergyChangeNotificationProps {
    lastEnergyChange: number; // Positive for increase, negative for decrease
    trigger: number; // Counter to trigger the animation
}

export default function EnergyChangeNotification({ lastEnergyChange, trigger }: EnergyChangeNotificationProps) {
    const [showNotification, setShowNotification] = useState(false);
    const [energyChange, setEnergyChange] = useState(0);

    useEffect(() => {
        if (trigger > 0 && lastEnergyChange !== 0) {
            setEnergyChange(lastEnergyChange);
            setShowNotification(true);

            // Hide notification after 1.5 seconds (faster than score notifications)
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [lastEnergyChange, trigger]);

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