import EchoMode from '@/components/game/modes/EchoMode';
import TypingMode from '@/components/game/modes/TypingMode';
import MeaningMatchMode from '@/components/game/modes/MeaningMatchMode';
import MemoryMode from '@/components/game/modes/MemoryMode';

interface Word {
    word: string;
    meaning?: string;
}

interface GameModeRendererProps {
    modeId: string;
    words: Word[];
    currentWordIndex: number;
    isTransitioning: boolean;
    onSpeak: (text: string, onEnd?: () => void) => SpeechSynthesisUtterance | null;
    gameStyle: 'practice' | 'challenge';
    onTimeUp: () => void;
    speechUtterance: SpeechSynthesisUtterance | null;
    onCountdownChange: (isCountingDown: boolean) => void;
    onTimerReady: (stopTimer: () => void) => void;
    onTimeLeftChange: (timeLeft: number) => void;
    isWordVisible: boolean;
    promptText: string;
    // Memory mode specific
    onMemoryTimeUp?: () => void;
    onMemoryTimeLeftChange?: (timeLeft: number) => void;
    // Meaning match mode specific
    onMeaningMatchTimeUp?: () => void;
    onMeaningMatchTimeLeftChange?: (timeLeft: number) => void;
}

export default function GameModeRenderer({
    modeId,
    words,
    currentWordIndex,
    isTransitioning,
    onSpeak,
    gameStyle,
    onTimeUp,
    speechUtterance,
    onCountdownChange,
    onTimerReady,
    onTimeLeftChange,
    isWordVisible,
    promptText,
    onMemoryTimeUp,
    onMemoryTimeLeftChange,
    onMeaningMatchTimeUp,
    onMeaningMatchTimeLeftChange
}: GameModeRendererProps) {
    if (modeId === 'echo') {
        return (
            <EchoMode
                currentWord={words[currentWordIndex]?.word}
                isTransitioning={isTransitioning}
                onSpeak={onSpeak}
                gameStyle={gameStyle}
                currentWordIndex={currentWordIndex}
                onTimeUp={onTimeUp}
                speechUtterance={speechUtterance}
                onCountdownChange={onCountdownChange}
                onTimerReady={onTimerReady}
                onTimeLeftChange={onTimeLeftChange}
            />
        );
    }

    if (modeId === 'typing') {
        return (
            <TypingMode
                currentWord={words[currentWordIndex]?.word}
                currentWordIndex={currentWordIndex}
            />
        );
    }

    if (modeId === 'meaning-match') {
        return (
            <MeaningMatchMode
                currentWordMeaning={words[currentWordIndex]?.meaning || ''}
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
                currentWord={words[currentWordIndex]?.word}
                currentWordIndex={currentWordIndex}
                isWordVisible={isWordVisible}
                promptText={promptText}
                gameStyle={gameStyle}
                onTimeUp={onMemoryTimeUp || onTimeUp}
                onTimeLeftChange={onMemoryTimeLeftChange || onTimeLeftChange}
            />
        );
    }

    return null;
}
