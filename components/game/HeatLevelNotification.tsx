"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { HeatLevel } from '@/hooks/useOverdriveSystem';

interface HeatLevelNotificationProps {
    heatLevel: HeatLevel | null;
    onAnimationComplete?: () => void;
}

export default function HeatLevelNotification({ heatLevel, onAnimationComplete }: HeatLevelNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (heatLevel && heatLevel.level > 1) {
            setIsVisible(true);
            
            // Auto hide after 2 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
                onAnimationComplete?.();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [heatLevel, onAnimationComplete]);

    if (!heatLevel || heatLevel.level <= 1) return null;

    const getNotificationText = (level: number) => {
        switch (level) {
            case 2: return "HEAT UP! 🔥";
            case 3: return "DANGER ZONE! ⚠️";
            case 4: return "OVERDRIVE! 🚨";
            default: return "HEAT UP!";
        }
    };

    const getNotificationStyle = (level: number) => {
        switch (level) {
            case 2: 
                return {
                    text: "text-orange-400",
                    bg: "bg-orange-500/20",
                    border: "border-orange-500/50",
                    shadow: "shadow-orange-500/30"
                };
            case 3: 
                return {
                    text: "text-red-400", 
                    bg: "bg-red-500/20",
                    border: "border-red-500/50",
                    shadow: "shadow-red-500/30"
                };
            case 4: 
                return {
                    text: "text-red-500",
                    bg: "bg-gradient-to-r from-red-500/20 to-yellow-500/20",
                    border: "border-red-500/70",
                    shadow: "shadow-red-500/50"
                };
            default: 
                return {
                    text: "text-blue-400",
                    bg: "bg-blue-500/20", 
                    border: "border-blue-500/50",
                    shadow: "shadow-blue-500/30"
                };
        }
    };

    const style = getNotificationStyle(heatLevel.level);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: -50 }}
                    animate={{ 
                        opacity: 1, 
                        scale: [0.5, 1.1, 1], 
                        y: 0,
                        rotate: heatLevel.level === 4 ? [0, 2, -2, 0] : 0
                    }}
                    exit={{ opacity: 0, scale: 0.8, y: -30 }}
                    transition={{ 
                        duration: 0.6,
                        scale: { times: [0, 0.7, 1] },
                        rotate: { duration: 0.3, repeat: heatLevel.level === 4 ? 3 : 0 }
                    }}
                    className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 
                               px-6 py-3 rounded-lg border-2 backdrop-blur-sm
                               ${style.bg} ${style.border} ${style.text}
                               shadow-lg ${style.shadow}`}
                >
                    <motion.div
                        animate={heatLevel.level >= 3 ? {
                            scale: [1, 1.05, 1],
                            textShadow: [
                                '0 0 5px currentColor',
                                '0 0 15px currentColor', 
                                '0 0 5px currentColor'
                            ]
                        } : {}}
                        transition={{
                            duration: 0.5,
                            repeat: heatLevel.level >= 3 ? Infinity : 0
                        }}
                        className="text-xl sm:text-2xl font-bold text-center"
                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                    >
                        {getNotificationText(heatLevel.level)}
                    </motion.div>
                    
                    <motion.div
                        className="text-xs sm:text-sm text-center mt-1 opacity-80"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        {heatLevel.name}
                    </motion.div>

                    {/* Fire particles for level 3+ */}
                    {heatLevel.level >= 3 && (
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-orange-400 rounded-full"
                                    style={{
                                        left: `${20 + i * 12}%`,
                                        top: '10%'
                                    }}
                                    animate={{
                                        y: [0, -10, -20],
                                        opacity: [1, 0.8, 0],
                                        scale: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.1
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
