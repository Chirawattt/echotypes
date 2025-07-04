"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaVolumeUp, FaClock } from 'react-icons/fa';
import { useEffect, useState, useRef, useCallback } from 'react';

interface EchoModeProps {
    currentWord: string;
    isTransitioning: boolean;
    onSpeak: (text: string) => void;
    gameStyle?: 'practice' | 'challenge';
    currentWordIndex: number;
    onTimeUp?: () => void;
}

export default function EchoMode({ 
    currentWord, 
    isTransitioning, 
    onSpeak, 
    gameStyle = 'practice',
    currentWordIndex,
    onTimeUp 
}: EchoModeProps) {
    const [listenCount, setListenCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(8);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [hasFirstSpeechStarted, setHasFirstSpeechStarted] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    
    // Use refs to avoid stale closure issues
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const timeLeftRef = useRef(8);
    const isCountingDownRef = useRef(false);
    const onTimeUpRef = useRef(onTimeUp);
    const isTransitioningRef = useRef(isTransitioning);
    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Keep refs updated
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    useEffect(() => {
        isTransitioningRef.current = isTransitioning;
    }, [isTransitioning]);

    // Update refs when state changes
    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    useEffect(() => {
        isCountingDownRef.current = isCountingDown;
    }, [isCountingDown]);

    // Countdown function using useCallback with minimal dependencies
    const startCountdown = useCallback(() => {
        if (timerRef.current) {
            console.log('Clearing existing timer');
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        const tick = () => {
            // Use refs to get latest values without dependencies
            // Also check if we're not transitioning to avoid timer running during word changes
            if (timeLeftRef.current > 0 && isCountingDownRef.current && !isTransitioningRef.current) {
                const newTime = timeLeftRef.current - 1;
                console.log(`Timer tick: ${timeLeftRef.current} -> ${newTime}`);
                timeLeftRef.current = newTime;
                setTimeLeft(newTime);
                
                if (newTime > 0) {
                    timerRef.current = setTimeout(tick, 1000);
                } else {
                    console.log('Time is up! Calling onTimeUp');
                    setIsCountingDown(false);
                    // Access the latest onTimeUp via ref
                    if (onTimeUpRef.current) {
                        onTimeUpRef.current();
                    }
                }
            } else {
                console.log('Timer stopped - conditions not met:', { 
                    timeLeft: timeLeftRef.current, 
                    isCountingDown: isCountingDownRef.current,
                    isTransitioning: isTransitioningRef.current
                });
            }
        };

        console.log('Starting new timer with timeLeft:', timeLeftRef.current);
        timerRef.current = setTimeout(tick, 1000);
    }, []); // Empty dependency array - function never changes

    // Reset counters when word changes
    useEffect(() => {
        console.log('Word changed, resetting...');
        
        // Clear all timers immediately
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
            speechTimeoutRef.current = null;
        }
        
        // Set initializing flag to prevent other effects from running
        setIsInitializing(true);
        
        // Reset all states synchronously
        setListenCount(0);
        setTimeLeft(8);
        timeLeftRef.current = 8;
        setIsCountingDown(false);
        isCountingDownRef.current = false;
        setHasFirstSpeechStarted(false);
        
        // Clear initializing flag after a short delay to allow state updates
        setTimeout(() => {
            setIsInitializing(false);
        }, 10);
    }, [currentWordIndex]);

    // Start countdown immediately when first speech begins (auto-play)
    useEffect(() => {
        console.log('First speech effect triggered:', { 
            gameStyle, 
            hasFirstSpeechStarted, 
            isTransitioning, 
            currentWordIndex, 
            isInitializing 
        });
        
        // Don't do anything if we're initializing (resetting state)
        if (isInitializing) {
            console.log('Skipping - currently initializing');
            return;
        }
        
        // Only start first speech countdown if:
        // 1. It's challenge mode
        // 2. First speech hasn't started yet
        // 3. Not transitioning between words
        // 4. Not already counting down (to avoid duplicate timers)
        if (gameStyle === 'challenge' && 
            !hasFirstSpeechStarted && 
            !isTransitioning && 
            !isCountingDown) {
            console.log('Starting first speech countdown...');
            setHasFirstSpeechStarted(true);
            
            // Start countdown after a brief delay for speech to begin
            speechTimeoutRef.current = setTimeout(() => {
                // Double check we're still in the right state before starting countdown
                if (!isTransitioningRef.current) {
                    console.log('Setting isCountingDown to true');
                    setIsCountingDown(true);
                } else {
                    console.log('Aborted countdown - transitioning');
                }
            }, 1500); // Approximate speech duration
        }
    }, [gameStyle, hasFirstSpeechStarted, isTransitioning, isCountingDown, currentWordIndex, isInitializing]);

    // Start timer when counting down begins - only once per countdown session  
    useEffect(() => {
        console.log('Timer effect triggered:', { 
            gameStyle, 
            isCountingDown, 
            isTransitioning, 
            hasFirstSpeechStarted,
            hasExistingTimer: !!timerRef.current,
            currentWordIndex,
            isInitializing
        });
        
        // Don't do anything if we're initializing (resetting state)
        if (isInitializing) {
            console.log('Skipping timer - currently initializing');
            return;
        }
        
        // Only start timer if:
        // 1. It's challenge mode
        // 2. Countdown is active
        // 3. Not transitioning
        // 4. No existing timer
        // 5. First speech has started (to avoid premature timer start)
        if (gameStyle === 'challenge' && 
            isCountingDown && 
            !isTransitioning && 
            !timerRef.current && 
            hasFirstSpeechStarted) {
            console.log('Starting countdown timer...');
            startCountdown();
        }
        
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [gameStyle, isCountingDown, isTransitioning, startCountdown, hasFirstSpeechStarted, currentWordIndex, isInitializing]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (speechTimeoutRef.current) {
                clearTimeout(speechTimeoutRef.current);
            }
        };
    }, []);

    const handleSpeak = () => {
        if (gameStyle === 'challenge' && listenCount >= 1) {
            return; // Prevent speaking more than once in challenge mode
        }

        onSpeak(currentWord);
        
        if (gameStyle === 'challenge') {
            setListenCount(prev => prev + 1);
        }
    };

    const isDisabled = isTransitioning || (gameStyle === 'challenge' && listenCount >= 1);

    return (
        <div className="flex flex-col items-center">
            {/* Timer for Challenge Mode - Always show when in challenge mode */}
            {gameStyle === 'challenge' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 flex flex-col items-center"
                >
                    <div className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                        timeLeft <= 2 ? 'border-red-500 bg-red-500/20' : 'border-orange-500 bg-orange-500/20'
                    }`}>
                        <motion.div
                            animate={{ scale: timeLeft <= 2 ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 0.5, repeat: timeLeft <= 2 ? Infinity : 0 }}
                            className={`text-2xl font-bold ${
                                timeLeft <= 2 ? 'text-red-400' : 'text-orange-400'
                            }`}
                            style={{ fontFamily: "'Caveat Brush', cursive" }}
                        >
                            {timeLeft}
                        </motion.div>
                    </div>
                    <p 
                        className="text-orange-300 text-sm mt-2 font-medium"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        {isCountingDown ? '⏰ Time to answer!' : '🎯 Get ready!'}
                    </p>
                </motion.div>
            )}

            {/* Speaker Button */}
            <motion.button
                onClick={handleSpeak}
                className="flex flex-col items-center group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-3"
                whileHover={{ scale: isDisabled ? 1 : 1.1 }}
                whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                disabled={isDisabled}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={`p-4 sm:p-5 rounded-full transition-all duration-300 ${
                    isDisabled 
                        ? 'bg-gray-500/10 group-hover:bg-gray-500/10' 
                        : 'bg-blue-500/10 group-hover:bg-blue-500/20'
                }`}>
                    <FaVolumeUp className={`text-3xl sm:text-4xl lg:text-5xl transition-colors ${
                        isDisabled ? 'text-gray-500' : 'text-blue-400'
                    }`} />
                </div>
                
                {/* Dynamic button text based on mode and state */}
                <span
                    className={`transition-colors mt-2 text-sm sm:text-base font-medium ${
                        isDisabled 
                            ? 'text-gray-500' 
                            : 'text-blue-300 group-hover:text-blue-200'
                    }`}
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    {gameStyle === 'challenge' ? (
                        listenCount === 0 ? '🔊 Click to hear word' : '🚫 No more listens'
                    ) : (
                        '🔊 Click to hear again'
                    )}
                </span>
                
                {/* Listen count indicator for challenge mode */}
                {gameStyle === 'challenge' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center mt-1 text-xs text-blue-300/80"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        <FaClock className="mr-1" />
                        <span>Listens: {listenCount}/1</span>
                    </motion.div>
                )}
            </motion.button>

            {/* Status messages for challenge mode */}
            <AnimatePresence>
                {gameStyle === 'challenge' && isCountingDown && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-blue-300 text-sm text-center max-w-xs"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        ✨ Type your answer now!
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
