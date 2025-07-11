"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameLogic } from '@/hooks';
import { globalCleanup } from '@/lib/cleanup';
import CountdownToGame from '@/components/game/CountdownToGame';
import GameOver from '@/components/game/GameOver';
import GameHeader from '@/components/game/GameHeader';
import GameTimer from '@/components/game/GameTimer';
import StreakDisplay from '@/components/game/StreakDisplay';
import StreakGlowEffects from '@/components/game/StreakGlowEffects';
import ScoreBreakdownToast from '@/components/game/ScoreBreakdownToast';
import GameModeRenderer from '@/components/game/GameModeRenderer';
import GameInput from '@/components/game/GameInput';
import GameEffects from '@/components/game/GameEffects';
import StreakCelebration from '@/components/game/StreakCelebration';
import DdaDebug from '@/components/game/DdaDebug';

export default function GamePlayPage() {
    const router = useRouter();
    const params = useParams();
    const { modeId, difficultyId } = params as { modeId: string, difficultyId: string };

    // Get game style from URL search params
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const gameStyle = searchParams.get('style') as 'practice' | 'challenge' || 'practice';

    // Use custom hook for all game logic
    const gameLogic = useGameLogic({ modeId, difficultyId, gameStyle });

    // Handle go back action
    const handleGoBack = () => {
        globalCleanup();
        gameLogic.resetGame();
        gameLogic.setWords([]);
        router.back();
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
            <GameOver
                modeId={modeId}
                words={gameLogic.words}
                difficultyId={difficultyId}
                handleRestartGame={gameLogic.handleRestartGame}
                gameStyle={gameStyle}
                totalChallengeScore={gameLogic.totalChallengeScore}
            />
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
            
            {/* DDA Debug Component (Development only) */}
            <DdaDebug 
                currentDifficultyLevel={gameLogic.currentDifficultyLevel}
                performanceScore={gameLogic.performanceScore}
                gameStyle={gameStyle}
                modeId={modeId}
            />

            {/* Streak Glow Effects */}
            <StreakGlowEffects streakCount={gameLogic.streakCount} />

            {/* Game Header */}
            <GameHeader
                onGoBack={handleGoBack}
                currentWordIndex={gameLogic.currentWordIndex}
                difficultyId={difficultyId}
                modeId={modeId}
                lives={gameLogic.lives}
                timeLeft={gameLogic.timeLeft}
                score={gameLogic.score}
                gameStyle={gameStyle}
            />

            {/* Game Timer for non-typing modes */}
            <GameTimer modeId={modeId} currentTime={gameLogic.currentTime} />



            {/* Main Game Content */}
            <section className="flex-1 flex flex-col items-center justify-center w-full text-center relative z-10 px-3 py-2 min-h-0 max-w-xl lg:max-w-7xl ">

                {/* Streak Display */}
                <div className="flex justify-center items-center relative z-10 shrink-0">
                    <StreakDisplay />
                </div>

                {/* Game Mode Renderer */}
                <GameModeRenderer
                    modeId={modeId}
                    gameStyle={gameStyle}
                    words={gameLogic.words}
                    currentWordIndex={gameLogic.currentWordIndex}
                    isTransitioning={gameLogic.isTransitioning}
                    isWordVisible={gameLogic.isWordVisible}
                    promptText={gameLogic.promptText}
                    onSpeak={gameLogic.speak}
                    onTimeUp={gameLogic.handleEchoTimeUp}
                    speechUtterance={gameLogic.currentUtteranceRef.current}
                    onCountdownChange={gameLogic.setIsEchoCountingDown}
                    onTimerReady={gameLogic.handleEchoTimerReady}
                    onTimeLeftChange={gameLogic.handleEchoTimeLeftChange}
                    onMemoryTimeUp={gameLogic.handleMemoryTimeUp}
                    onMemoryTimeLeftChange={gameLogic.handleMemoryTimeLeftChange}
                    onMeaningMatchTimeUp={gameLogic.handleMeaningMatchTimeUp}
                    onMeaningMatchTimeLeftChange={gameLogic.handleMeaningMatchTimeLeftChange}
                />

                {/* Score Breakdown Toast */}
                <ScoreBreakdownToast
                    gameStyle={gameStyle}
                    lastScoreCalculation={gameLogic.lastScoreCalculation}
                    showScoreBreakdown={gameLogic.showScoreBreakdown}
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

                {/* Game Effects */}
                <GameEffects
                    isCorrect={gameLogic.isCorrect}
                    isWrong={gameLogic.isWrong}
                    score={gameLogic.score}
                />

                {/* Streak Celebration */}
                <StreakCelebration />
            </section>
        </main>
    );
}