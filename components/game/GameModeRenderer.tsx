import EchoMode from '@/components/game/modes/EchoMode';
import TypingMode from '@/components/game/modes/TypingMode';
import MeaningMatchMode from '@/components/game/modes/MeaningMatchMode';
import MemoryMode from '@/components/game/modes/MemoryMode';
import { HeatLevel } from '@/hooks/useOverdriveSystem';

interface Word {
    word: string;
    meaning?: string;
}

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
    // Meaning match mode specific
    onMeaningMatchTimeUp?: () => void;
    onMeaningMatchTimeLeftChange?: (timeLeft: number) => void;
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
    onMeaningMatchTimeUp,
    onMeaningMatchTimeLeftChange,
    energy,
    maxEnergy,
    isLowEnergy,
    heatLevel,
    correctWordsCount,
    totalChallengeScore,
    streakCount,
    ddaLevel,
    viewingTime
}: GameModeRendererProps) {
    // Don't render any content during DDA transition to prevent word flashing
    const currentWord = (!words[currentWordIndex]) 
        ? '' 
        : words[currentWordIndex]?.word;
    
    const currentWordMeaning = (!words[currentWordIndex]) 
        ? '' 
        : words[currentWordIndex]?.meaning || '';

    if (modeId === 'echo') {
        return (
            <EchoMode
                currentWord={currentWord}
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
                currentWord={currentWord}
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
            />
        );
    }

    if (modeId === 'meaning-match') {
        return (
            <MeaningMatchMode
                currentWordMeaning={currentWordMeaning}
                currentWordIndex={currentWordIndex}
                gameStyle={gameStyle}
                onTimeUp={onMeaningMatchTimeUp || onTimeUp}
                onTimeLeftChange={onMeaningMatchTimeLeftChange || onTimeLeftChange}
            />
        );
    }

    if (modeId === 'memory') {
        return (
            <MemoryMode
                currentWord={currentWord}
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
