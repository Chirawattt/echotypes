"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { globalCleanup } from '@/lib/cleanup';
import { calculateViewTime } from '@/lib/memoryModeConfig';
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

export default function DdaGamePlayPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { modeId } = params as { modeId: string };

    // Device detection for virtual keyboard
    const { isMobile } = useDeviceDetection();

    // State to manage game over transition
    const [showGameOverOverlay, setShowGameOverOverlay] = useState(false);
    const [showFinalGameOver, setShowFinalGameOver] = useState(false);

    // Get game style from URL search params
    const gameStyle = (searchParams.get('style') as 'practice' | 'challenge') || 'practice';

    // Use custom hook for all game logic with DDA difficulty
    const gameLogic = useGameLogic({ modeId, difficultyId: 'dda', gameStyle });
    
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
                        className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"
                    >
                        {/* Animated Background */}
                        {/* <AnimatedBackground /> */}
                        {/* <GameEffects 
                            isCorrect={gameLogic.isCorrect}
                            isWrong={gameLogic.isWrong}
                            score={gameLogic.score}
                        /> */}
                        
                        {/* Dim overlay during game over delay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            className="absolute inset-0 bg-black z-10"
                        />
                        
                        {/* Game content with final state */}
                        <section className="flex-1 flex flex-col items-center justify-center w-full text-center relative z-20 px-3 py-2 min-h-0 max-w-xl lg:max-w-7xl">
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
                        difficultyId="dda"
                        handleRestartGame={gameLogic.handleRestartGame}
                        gameStyle={gameStyle}
                        totalChallengeScore={gameLogic.totalChallengeScore}
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
        <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#1A0A1A] text-white pt-10 px-4 overflow-hidden relative">

            {/* Animated Background */}
            {/* <AnimatedBackground /> */}

            {/* Streak Glow Effects */}
            <StreakGlowEffects streakCount={gameLogic.streakCount} />

            {/* Game Header */}
            <GameHeader
                difficultyId="dda"
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
            <section className="flex-1 flex flex-col items-center justify-center w-full text-center relative z-10 px-3 py-2 min-h-0 max-w-xl lg:max-w-7xl">

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
                    ddaLevel={modeId === 'memory' && gameStyle === 'challenge' ? gameLogic.currentDifficultyLevel : undefined}
                    viewingTime={modeId === 'memory' && gameStyle === 'challenge' ? calculateViewTime(gameLogic.currentDifficultyLevel || 1) : undefined}
                />

                {/* Score Breakdown Toast - Only for non-typing modes */}
                {/* Score Breakdown Toast - For all modes in challenge mode */}
                {/* <ScoreBreakdownToast
                    gameStyle={gameStyle}
                    lastScoreCalculation={gameLogic.lastScoreCalculation}
                    showScoreBreakdown={gameLogic.showScoreBreakdown}
                    modeId={modeId}
                /> */}

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

                {/* Game Effects */}
                {/* <GameEffects
                    isCorrect={gameLogic.isCorrect}
                    isWrong={gameLogic.isWrong}
                    score={gameLogic.score}
                /> */}
                
                {/* Heat Level Notification for Typing Challenge */}
                {modeId === 'typing' && gameStyle === 'challenge' && (
                    <HeatLevelNotification 
                        heatLevel={heatLevel}
                    />
                )}

                {/* Virtual Keyboard for Mobile Devices */}
                {isMobile && (
                    <VirtualKeyboard onKeyPress={handleVirtualKeyPress} />
                )}
            </section>
        </main>
    );
}
