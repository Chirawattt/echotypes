import { useEffect } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { Word } from '@/lib/words/types';
import { getViewTimeMs } from '@/lib/memoryModeConfig';

interface UseGameModesProps {
    modeId: string;
    status: string;
    currentWordIndex: number;
    words: Word[];
    speak: (text: string, onEnd?: () => void) => SpeechSynthesisUtterance | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    // DDA props for Memory Challenge Mode
    gameStyle?: 'practice' | 'challenge';
    ddaLevel?: number;
}

export function useGameModes({
    modeId,
    status,
    currentWordIndex,
    words,
    speak,
    inputRef,
    gameStyle = 'practice',
    ddaLevel = 1
}: UseGameModesProps) {
    const {
        setIsWordVisible,
        setPromptText
    } = useGameStore();

    // Echo mode speech logic
    useEffect(() => {
        if (status === 'playing' && words.length > 0 && modeId === 'echo' && currentWordIndex >= 0) {
            const currentWord = words[currentWordIndex]?.word;

            speak(currentWord);
            inputRef.current?.focus();
        }
    }, [status, currentWordIndex, words, speak, modeId, inputRef]);

    // Memory mode word flashing logic with dynamic viewing time
    useEffect(() => {
        if (status === 'playing' && words.length > 0 && modeId === 'memory') {
            setIsWordVisible(true);
            setPromptText('Memorize...');
            if (inputRef.current) inputRef.current.disabled = true;

            // Calculate dynamic viewing time for Memory Challenge Mode
            const viewingTimeMs = gameStyle === 'challenge' 
                ? getViewTimeMs(ddaLevel) 
                : 2000; // Default 2 seconds for practice mode

            const timer = setTimeout(() => {
                setIsWordVisible(false);
                setPromptText('Now type!');
                if (inputRef.current) {
                    inputRef.current.disabled = false;
                    inputRef.current.focus();
                }
            }, viewingTimeMs);

            return () => clearTimeout(timer);
        }
    }, [status, currentWordIndex, words, modeId, setIsWordVisible, setPromptText, inputRef, gameStyle, ddaLevel]);

    // Refocus logic for typing and meaning-match modes
    useEffect(() => {
        if (status === 'playing' && (modeId === 'typing' || modeId === 'meaning-match')) {
            inputRef.current?.focus();
        }
    }, [status, currentWordIndex, modeId, inputRef]);

    return {
        // This hook primarily manages side effects, so no return values needed
    };
}
