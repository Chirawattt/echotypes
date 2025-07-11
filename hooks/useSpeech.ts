import { useRef, useCallback } from 'react';

export function useSpeech() {
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Speech function
    const speak = useCallback((text: string, onEnd?: () => void) => {
        console.log('🎤 Speak function called with:', text);
        
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            console.log('🔇 Cancelling previous speech');
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.6;

            currentUtteranceRef.current = utterance;

            utterance.onend = () => {
                console.log('✅ Speech ended for:', text);
                if (onEnd) {
                    onEnd();
                }
            };

            utterance.onstart = () => {
                console.log('🎙️ Speech started for:', text);
            };

            window.speechSynthesis.speak(utterance);
            return utterance;
        } else {
            return null;
        }
    }, []);

    const cancelSpeech = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            console.log('🔇 Cancelling speech synthesis');
            window.speechSynthesis.cancel();
        }
    }, []);

    return {
        currentUtteranceRef,
        speak,
        cancelSpeech
    };
}
