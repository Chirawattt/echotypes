import { useEffect } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { Word } from '@/lib/words/types';

interface UseGameModesProps {
    modeId: string;
    status: string;
    currentWordIndex: number;
    words: Word[];
    speak: (text: string, onEnd?: () => void) => SpeechSynthesisUtterance | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useGameModes({
    modeId,
    status,
    currentWordIndex,
    words,
    speak,
    inputRef,
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

    // Memory mode word flashing logic
    useEffect(() => {
        if (status === 'playing' && words.length > 0 && modeId === 'memory') {
            setIsWordVisible(true);
            setPromptText('Memorize...');
            if (inputRef.current) inputRef.current.disabled = true;

            const timer = setTimeout(() => {
                setIsWordVisible(false);
                setPromptText('Now type!');
                if (inputRef.current) {
                    inputRef.current.disabled = false;
                    inputRef.current.focus();
                }
            }, 2000); // MEMORY_MODE_FLASH_DURATION

            return () => clearTimeout(timer);
        }
    }, [status, currentWordIndex, words, modeId, setIsWordVisible, setPromptText, inputRef]);

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
