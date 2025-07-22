import { useRef, useCallback } from 'react';

export function useSpeech() {
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Speech function
    const speak = useCallback((text: string, onEnd?: () => void) => {
        if ( !text || typeof text !== 'string' || text.trim() === '') {
            console.warn('🎤 Speak function called with empty or invalid text');
            return null;
        }
        
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.6;

            currentUtteranceRef.current = utterance;

            utterance.onend = () => {
                if (onEnd) {
                    onEnd();
                }
            };

            utterance.onstart = () => {
                // Speech started
            };

            window.speechSynthesis.speak(utterance);
            return utterance;
        } else {
            return null;
        }
    }, []);

    const cancelSpeech = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, []);

    return {
        currentUtteranceRef,
        speak,
        cancelSpeech
    };
}
