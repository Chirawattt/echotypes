import EchoMode from '@/components/game/modes/EchoMode';
import TypingMode from '@/components/game/modes/TypingMode';
import MemoryMode from '@/components/game/modes/MemoryMode';
import { HeatLevel } from '@/hooks/useOverdriveSystem';
import { Word } from '@/lib/types';

interface GameModeRendererProps {
    modeId: string;
    words: Word[];
    currentWordIndex: number;
    isTransitioning: boolean;
    usedSpeakAgain?: boolean; // Prop for Echo mode
    onSpeak: (text: string, onEnd?: () => void) => SpeechSynthesisUtterance | null;
    gameStyle: 'practice' | 'challenge';
    onTimeUp: () => void;
    speechUtterance: SpeechSynthesisUtterance | null;
    onCountdownChange: (isCountingDown: boolean) => void;
    onTimerReady: (stopTimer: () => void) => void;
    onTimeLeftChange: (timeLeft: number) => void;
    isWordVisible: boolean;
    promptText: string;
    // Echo mode specific
    setSpeakAgainUsed: (used: boolean) => void; // Function to set speak again status in parent
    // Memory mode specific
    onMemoryTimeUp?: () => void;
    onMemoryTimeLeftChange?: (timeLeft: number) => void;
    onMemoryTimerReady?: (stopTimer: () => void) => void;
    // Nitro energy props for Typing Challenge
    energy?: number;
    maxEnergy?: number;
    isLowEnergy?: boolean;
    // Overdrive system props for Typing Challenge
    heatLevel?: HeatLevel;
    correctWordsCount?: number;
    isOverdriveTransitioning?: boolean;
    // Challenge Mode scoring props
    totalChallengeScore?: number;
    streakCount?: number;
    // Point change notification props for Typing Challenge
    lastScoreChange?: number;
    scoreChangeCounter?: number;
    // Debug props for Memory Mode
    ddaLevel?: number;
    viewingTime?: number;
}

export default function GameModeRenderer({
    modeId,
    words,
    currentWordIndex,
    isTransitioning,
    usedSpeakAgain,
    onSpeak,
    gameStyle,
    onTimeUp,
    speechUtterance,
    onCountdownChange,
    onTimerReady,
    onTimeLeftChange,
    isWordVisible,
    promptText,
    setSpeakAgainUsed,
    onMemoryTimeUp,
    onMemoryTimeLeftChange,
    onMemoryTimerReady,
    energy,
    maxEnergy,
    isLowEnergy,
    heatLevel,
    correctWordsCount,
    totalChallengeScore,
    streakCount,
    lastScoreChange,
    scoreChangeCounter,
    ddaLevel,
    viewingTime
}: GameModeRendererProps) {
    // Get current word object - create fallback if needed
    const currentWordObject = words[currentWordIndex] || {
        word: '',
        meaning: '',
        type: '',
        level: 'a1'
    };

    if (modeId === 'echo') {
        return (
            <EchoMode
                currentWordObject={currentWordObject}
                isTransitioning={isTransitioning}
                onSpeak={onSpeak}
                gameStyle={gameStyle}
                currentWordIndex={currentWordIndex}
                onTimeUp={onTimeUp}
                speechUtterance={speechUtterance}
                onCountdownChange={onCountdownChange}
                onTimerReady={onTimerReady}
                onTimeLeftChange={onTimeLeftChange}
                usedSpeakAgain={usedSpeakAgain}
                setSpeakAgainUsed={setSpeakAgainUsed}
            />
        );
    }

    if (modeId === 'typing') {
        return (
            <TypingMode
                currentWordObject={currentWordObject}
                currentWordIndex={currentWordIndex}
                isTransitioning={isTransitioning}
                gameStyle={gameStyle}
                energy={energy}
                maxEnergy={maxEnergy}
                isLowEnergy={isLowEnergy}
                heatLevel={heatLevel}
                correctWordsCount={correctWordsCount}
                totalChallengeScore={totalChallengeScore}
                streakCount={streakCount}
                lastScoreChange={lastScoreChange}
                scoreChangeCounter={scoreChangeCounter}
            />
        );
    }

    if (modeId === 'memory') {
        return (
            <MemoryMode
                currentWordObject={currentWordObject}
                currentWordIndex={currentWordIndex}
                isWordVisible={isWordVisible}
                promptText={promptText}
                gameStyle={gameStyle}
                onTimeUp={onMemoryTimeUp || onTimeUp}
                onTimeLeftChange={onMemoryTimeLeftChange || onTimeLeftChange}
                onTimerReady={onMemoryTimerReady}
                ddaLevel={ddaLevel}
                viewingTime={viewingTime}
                streakCount={streakCount}
                totalScore={totalChallengeScore}
            />
        );
    }

    return null;
}
