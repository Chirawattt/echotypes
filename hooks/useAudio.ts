import { useRef, useCallback, useEffect } from 'react';
import { registerAudioRef, unregisterAudioRef } from '@/lib/cleanup';

export function useAudio() {
    // Audio refs
    const keypressAudioRef = useRef<HTMLAudioElement | null>(null);
    const correctAudioRef = useRef<HTMLAudioElement | null>(null);
    const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);
    const completedAudioRef = useRef<HTMLAudioElement | null>(null);
    const countdownAudioRef = useRef<HTMLAudioElement | null>(null);

    // Audio functions
    const playSound = useCallback((audioRef: React.RefObject<HTMLAudioElement | null>, volume = 0.7) => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error(`Error playing sound: ${e}`));
        }
    }, []);

    // Initialize audio
    useEffect(() => {
        keypressAudioRef.current = new Audio('/sounds/keypress.mp3');
        correctAudioRef.current = new Audio('/sounds/correct.mp3');
        incorrectAudioRef.current = new Audio('/sounds/incorrect.mp3');
        completedAudioRef.current = new Audio('/sounds/completed.wav');
        countdownAudioRef.current = new Audio('/sounds/countdown.mp3');

        // Register audio refs for cleanup
        registerAudioRef(keypressAudioRef);
        registerAudioRef(correctAudioRef);
        registerAudioRef(incorrectAudioRef);
        registerAudioRef(completedAudioRef);
        registerAudioRef(countdownAudioRef);

        return () => {
            unregisterAudioRef(keypressAudioRef);
            unregisterAudioRef(correctAudioRef);
            unregisterAudioRef(incorrectAudioRef);
            unregisterAudioRef(completedAudioRef);
            unregisterAudioRef(countdownAudioRef);
        };
    }, []);

    return {
        keypressAudioRef,
        correctAudioRef,
        incorrectAudioRef,
        completedAudioRef,
        countdownAudioRef,
        playSound
    };
}
