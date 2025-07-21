"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { globalCleanup } from '@/lib/cleanup';
import { calculateViewTime } from '@/lib/memoryModeConfig';
import LoadingWords from '@/components/game/LoadingWords';
import CountdownToGame from '@/components/game/CountdownToGame';
import GameOver from '@/components/game/GameOver';
import GameOverOverlay from '@/components/game/GameOverOverlay';
import GameHeader from '@/components/game/GameHeader';
import GameTimer from '@/components/game/GameTimer';
import StreakGlowEffects from '@/components/game/StreakGlowEffects';
import GameModeRenderer from '@/components/game/GameModeRenderer';
import GameInput from '@/components/game/GameInput';
import VirtualKeyboard from '@/components/game/VirtualKeyboard';
import HeatLevelNotification from '@/components/game/HeatLevelNotification';

export default function DDAGamePlayPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { modeId } = params as { modeId: string };
    const difficultyId = 'dda'; // This page is specifically for DDA gameplay

    // Device detection for virtual keyboard
    const { isMobile } = useDeviceDetection();

    // State to manage game over transition
    const [showGameOverOverlay, setShowGameOverOverlay] = useState(false);
    const [showFinalGameOver, setShowFinalGameOver] = useState(false);

    // Get game style from URL search params
    const gameStyle = (searchParams.get('style') as 'practice' | 'challenge') || 'practice';
    
    // Get selected time from URL params for typing practice mode
    const timeParam = searchParams.get('time');
    const selectedTime = timeParam 
        ? (timeParam === 'unlimited' ? null : parseInt(timeParam)) 
        : undefined;

    // Use custom hook for all game logic - supports both DDA and regular difficulties
    const gameLogic = useGameLogic({ 
        modeId, 
        difficultyId, // This can be 'dda' or 'a1', 'a2', etc.
        gameStyle,
        selectedTime: selectedTime 
    });
    
    // Extract specific values for overdrive system
    const { heatLevel, correctWordsCount, isOverdriveTransitioning } = gameLogic;

    // Virtual Keyboard Handler for Mobile Devices
    const handleVirtualKeyPress = (button: string) => {
        if (button === '{bksp}') {
            // Logic to remove the last character from userInput state
            const newValue = gameLogic.userInput.slice(0, -1);
            const syntheticEvent = {
                target: { value: newValue }
            } as React.ChangeEvent<HTMLInputElement>;
            gameLogic.handleUserInputChange(syntheticEvent);
        } else if (button === '{enter}') {
            // Logic to submit the answer
            const syntheticEvent = {
                preventDefault: () => {}
            } as React.FormEvent;
            gameLogic.handleFormSubmit(syntheticEvent);
        } else if (button === '{space}') {
            const newValue = gameLogic.userInput + ' ';
            const syntheticEvent = {
                target: { value: newValue }
            } as React.ChangeEvent<HTMLInputElement>;
            gameLogic.handleUserInputChange(syntheticEvent);
        } else if (button !== '{shift}') {
            // Append regular characters
            const newValue = gameLogic.userInput + button;
            const syntheticEvent = {
                target: { value: newValue }
            } as React.ChangeEvent<HTMLInputElement>;
            gameLogic.handleUserInputChange(syntheticEvent);
        }
    };

    // Handle game over transition with delay
    useEffect(() => {
        if (gameLogic.status === 'gameOver' && !showGameOverOverlay && !showFinalGameOver) {
            // Delay for 2 seconds to let player see the final result
            const gameOverTimer = setTimeout(() => {
                setShowGameOverOverlay(true);
                setShowFinalGameOver(false);
            }, 2000); // 2 seconds delay

            return () => clearTimeout(gameOverTimer);
        }
    }, [gameLogic.status, showGameOverOverlay, showFinalGameOver]);

    // Reset game over states when game restarts
    useEffect(() => {
        if (gameLogic.status === 'countdown' || gameLogic.status === 'playing') {
            setShowGameOverOverlay(false);
            setShowFinalGameOver(false);
        }
    }, [gameLogic.status]);

    const handleOverlayComplete = () => {
        // Add a small delay before starting the fade out
        setTimeout(() => {
            setShowGameOverOverlay(false);
            // Add another small delay before showing final game over
            setTimeout(() => {
                setShowFinalGameOver(true);
            }, 300);
        }, 100);
    };

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            globalCleanup();
        };
    }, []);


    // Early returns for special states
    if (gameLogic.status === 'loading') {
        return <LoadingWords />;
    }

    if (gameLogic.status === 'countdown') {
        return <CountdownToGame />;
    }

    if (gameLogic.status === 'gameOver') {
        return (
            <AnimatePresence mode="wait">
                {!showGameOverOverlay && !showFinalGameOver && (
                    <motion.div
                        key="game-over-delay"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center"
                    >
                        {/* Enhanced Animated Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-xl"
                            />
                            <motion.div
                                animate={{
                                    rotate: -360,
                                    scale: [1.1, 1, 1.1]
                                }}
                                transition={{
                                    duration: 25,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"
                            />
                        </div>
                        
                        {/* Dim overlay during game over delay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            className="absolute inset-0 bg-black z-10"
                        />
                        
                        {/* Game content with final state */}
                        <section className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto text-center px-6 py-8 relative z-20">
                            {/* Game Mode Renderer showing final state */}
                            <GameModeRenderer
                                modeId={modeId}
                                gameStyle={gameStyle}
                                words={gameLogic.words}
                                currentWordIndex={gameLogic.currentWordIndex}
                                isTransitioning={gameLogic.isTransitioning}
                                isWordVisible={gameLogic.isWordVisible}
                                promptText={gameLogic.promptText}
                                usedSpeakAgain={gameLogic.usedSpeakAgain}
                                onSpeak={gameLogic.speak}
                                onTimeUp={gameLogic.handleEchoTimeUp}
                                speechUtterance={gameLogic.currentUtteranceRef.current}
                                onCountdownChange={gameLogic.setIsEchoCountingDown}
                                onTimerReady={gameLogic.handleEchoTimerReady}
                                onTimeLeftChange={gameLogic.handleEchoTimeLeftChange}
                                onMemoryTimeUp={gameLogic.handleMemoryTimeUp}
                                onMemoryTimeLeftChange={gameLogic.handleMemoryTimeLeftChange}
                                onMemoryTimerReady={gameLogic.handleMemoryTimerReady}
                                setSpeakAgainUsed={gameLogic.handleSpeakAgainUsed}
                                energy={gameLogic.energy}
                                maxEnergy={gameLogic.maxEnergy}
                                isLowEnergy={gameLogic.isLowEnergy}
                                heatLevel={modeId === 'typing' && gameStyle === 'challenge' ? heatLevel : undefined}
                                correctWordsCount={modeId === 'typing' && gameStyle === 'challenge' ? correctWordsCount : undefined}
                                isOverdriveTransitioning={modeId === 'typing' && gameStyle === 'challenge' ? isOverdriveTransitioning : undefined}
                                totalChallengeScore={gameStyle === 'challenge' ? gameLogic.totalChallengeScore : undefined}
                                streakCount={gameStyle === 'challenge' ? gameLogic.streakCount : undefined}
                                ddaLevel={modeId === 'memory' && gameStyle === 'challenge' ? gameLogic.currentDifficultyLevel : undefined}
                                viewingTime={modeId === 'memory' && gameStyle === 'challenge' ? calculateViewTime(gameLogic.currentDifficultyLevel || 1) : undefined}
                            />
                            
                            {/* Game Over Preparation Indicator */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 text-center"
                            >
                                <motion.p
                                    className="text-white/70 text-lg font-medium mb-2"
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    🎯 Game Complete!
                                </motion.p>
                                <motion.div
                                    className="flex items-center justify-center gap-1"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                                    <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                </motion.div>
                            </motion.div>
                        </section>
                    </motion.div>
                )}
                {showGameOverOverlay && (
                    <GameOverOverlay 
                        key="overlay"
                        gameStyle={gameStyle}
                        onAnimationComplete={handleOverlayComplete}
                    />
                )}
                {showFinalGameOver && (
                    <GameOver
                        key="gameover"
                        modeId={modeId}
                        words={gameLogic.words}
                        difficultyId={difficultyId}
                        handleRestartGame={gameLogic.handleRestartGame}
                        handleHomeNavigation={gameLogic.handleHomeNavigation}
                        gameStyle={gameStyle}
                        totalChallengeScore={gameLogic.totalChallengeScore}
                        sessionBestStreak={gameLogic.bestStreak}
                        databaseBestStreak={gameLogic.databaseBestStreak}
                        bestWpmAllStyles={gameLogic.bestWpmAllStyles}
                        bestStreakAllStyles={gameLogic.bestStreakAllStyles}
                        timeSpent={gameLogic.timeSpent}
                    />
                )}
            </AnimatePresence>
        );
    }

    if (!gameLogic.words || gameLogic.words.length === 0) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-[#101010] text-white">
                Loading...
            </main>
        );
    }

    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-10 px-4 overflow-hidden relative">

            {/* Enhanced Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        rotate: -360,
                        scale: [1.1, 1, 1.1]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        rotate: 180,
                        scale: [1, 1.3, 1]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-orange-500/8 to-red-500/8 rounded-full blur-xl"
                />
            </div>

            {/* Streak Glow Effects */}
            <StreakGlowEffects streakCount={gameLogic.streakCount} />

            {/* Game Header */}
            <GameHeader
                modeId={modeId}
                lives={gameLogic.lives}
                timeLeft={gameLogic.timeLeft}
                score={gameLogic.score}
                gameStyle={gameStyle}
                totalWordsPlayed={gameLogic.totalWordsPlayed}
            />

            {/* Game Timer for non-typing modes */}
            <GameTimer modeId={modeId} currentTime={gameLogic.currentTime} />

            {/* Main Game Content */}
            <section className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto text-center px-6 py-8 relative z-10">

                {/* Game Mode Renderer */}
                <GameModeRenderer
                    modeId={modeId}
                    gameStyle={gameStyle}
                    words={gameLogic.words}
                    currentWordIndex={gameLogic.currentWordIndex}
                    isTransitioning={gameLogic.isTransitioning}
                    isWordVisible={gameLogic.isWordVisible}
                    promptText={gameLogic.promptText}
                    usedSpeakAgain={gameLogic.usedSpeakAgain}
                    onSpeak={gameLogic.speak}
                    onTimeUp={gameLogic.handleEchoTimeUp}
                    speechUtterance={gameLogic.currentUtteranceRef.current}
                    onCountdownChange={gameLogic.setIsEchoCountingDown}
                    onTimerReady={gameLogic.handleEchoTimerReady}
                    onTimeLeftChange={gameLogic.handleEchoTimeLeftChange}
                    onMemoryTimeUp={gameLogic.handleMemoryTimeUp}
                    onMemoryTimeLeftChange={gameLogic.handleMemoryTimeLeftChange}
                    onMemoryTimerReady={gameLogic.handleMemoryTimerReady}
                    setSpeakAgainUsed={gameLogic.handleSpeakAgainUsed}
                    energy={gameLogic.energy}
                    maxEnergy={gameLogic.maxEnergy}
                    isLowEnergy={gameLogic.isLowEnergy}
                    heatLevel={modeId === 'typing' && gameStyle === 'challenge' ? heatLevel : undefined}
                    correctWordsCount={modeId === 'typing' && gameStyle === 'challenge' ? correctWordsCount : undefined}
                    isOverdriveTransitioning={modeId === 'typing' && gameStyle === 'challenge' ? isOverdriveTransitioning : undefined}
                    totalChallengeScore={gameStyle === 'challenge' ? gameLogic.totalChallengeScore : undefined}
                    streakCount={gameStyle === 'challenge' ? gameLogic.streakCount : undefined}
                    ddaLevel={modeId === 'memory' && gameStyle === 'challenge' && difficultyId === 'dda' ? gameLogic.currentDifficultyLevel : undefined}
                    viewingTime={modeId === 'memory' && gameStyle === 'challenge' && difficultyId === 'dda' ? calculateViewTime(gameLogic.currentDifficultyLevel || 1) : undefined}
                />

                {/* Game Input */}
                <GameInput
                    ref={gameLogic.inputRef}
                    userInput={gameLogic.userInput}
                    onInputChange={gameLogic.handleUserInputChange}
                    onSubmit={gameLogic.handleFormSubmit}
                    isWrong={gameLogic.isWrong}
                    isCorrect={gameLogic.isCorrect}
                    isTransitioning={gameLogic.isTransitioning}
                    isDisabled={
                        (gameLogic.isTransitioning ||
                            (modeId === 'memory' && gameLogic.isWordVisible) ||
                            (modeId === 'echo' && gameStyle === 'challenge' && !gameLogic.isEchoCountingDown)) &&
                        modeId !== 'typing'
                    }
                    currentWordIndex={gameLogic.currentWordIndex}
                />

                {/* Finish Game Button for Unlimited Time Mode */}
                {gameLogic.isUnlimitedTime && gameLogic.status === 'playing' && (
                    <motion.button
                        onClick={gameLogic.handleFinishGame}
                        className="mt-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-10 rounded-3xl text-lg flex items-center gap-3 shadow-xl border border-red-400/30 backdrop-blur-sm transition-all duration-300"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                    >
                        <span>🏁</span>
                        <span>Finish Game</span>
                    </motion.button>
                )}

                {/* Heat Level Notification for Typing Challenge */}
                {modeId === 'typing' && gameStyle === 'challenge' && (
                    <HeatLevelNotification 
                        heatLevel={heatLevel}
                    />
                )}
                
            </section>

            {/* Virtual Keyboard for Mobile Devices */}
            {isMobile && (
                <VirtualKeyboard onKeyPress={handleVirtualKeyPress} />
            )}

        </main>
    );
}