import { useEffect } from 'react';
import { useGameStore } from '@/lib/stores/gameStore';
import { Word } from '@/lib/words/types';

interface UseGameModesProps {
    modeId: string;
    status: string;
    currentWordIndex: number;
    words: Word[];
    speak: (text: string, onEnd?: () => void) => SpeechSynthesisUtterance | null;
    isDdaUpdating: boolean;
    ddaLevelJustChanged: boolean;
    isDdaBlocked: () => {
        isBlocked: boolean;
        isTimeBlocked: boolean;
        isTransitionBlocked?: boolean;
        blockTimeRemaining: number;
    };
    lastSpokenWordRef: React.MutableRefObject<string>;
    lastSpeechTimeRef: React.MutableRefObject<number>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    cancelSpeech: () => void;
}

export function useGameModes({
    modeId,
    status,
    currentWordIndex,
    words,
    speak,
    isDdaUpdating,
    ddaLevelJustChanged,
    isDdaBlocked,
    lastSpokenWordRef,
    lastSpeechTimeRef,
    inputRef,
    cancelSpeech
}: UseGameModesProps) {
    const {
        setIsWordVisible,
        setPromptText
    } = useGameStore();

    // Echo mode speech logic
    useEffect(() => {
        if (status === 'playing' && words.length > 0 && modeId === 'echo') {
            const currentWord = words[currentWordIndex]?.word;
            const now = Date.now();
            
            // Check if we're in DDA block period
            const blockStatus = isDdaBlocked();
            
            // Prevent speaking the same word twice or if no word available
            if (!currentWord || lastSpokenWordRef.current === currentWord) {
                return;
            }
            
            // MAIN PROTECTION: Block ALL speech during ANY DDA transition
            if (blockStatus.isBlocked) {
                return;
            }
            
            // Prevent rapid fire speech
            const minSpeechInterval = 200; // Minimal interval for responsiveness
            if (now - (lastSpeechTimeRef.current || 0) < minSpeechInterval) {
                return;
            }
            
            // Clear any pending speech synthesis before speaking new word
            cancelSpeech();

            if (lastSpokenWordRef.current) {
                lastSpokenWordRef.current = currentWord;
            }
            if (lastSpeechTimeRef.current !== undefined) {
                lastSpeechTimeRef.current = now;
            }
            speak(currentWord);
            inputRef.current?.focus();
        }
    }, [status, currentWordIndex, words, speak, modeId, isDdaUpdating, ddaLevelJustChanged, isDdaBlocked, lastSpokenWordRef, lastSpeechTimeRef, inputRef, cancelSpeech]);

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
