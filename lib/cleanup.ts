/**
 * Global cleanup utility for clearing all audio, timers, and state
 * when navigating away from the game or returning to home
 * 
 * Available functions:
 * - globalCleanup(): Complete cleanup of all resources
 * - stopAllAudio(): Stop all audio elements
 * - stopCountdownAudio(): Stop countdown audio specifically
 * - cancelAllTimers(): Clear all tracked timers
 * - cancelSpeechSynthesis(): Cancel speech synthesis
 * - trackTimeout/trackInterval(): Enhanced timer tracking
 * - registerAudioRef/unregisterAudioRef(): Track audio refs for cleanup
 */

import React from 'react';

// Store for tracking audio refs that need to be cleaned up
const audioRefs: Set<React.RefObject<HTMLAudioElement | null>> = new Set();

// Store for tracking active timers and intervals
const activeTimeouts: Set<number> = new Set();
const activeIntervals: Set<number> = new Set();

// Function to register audio refs for cleanup
export const registerAudioRef = (ref: React.RefObject<HTMLAudioElement | null>) => {
    audioRefs.add(ref);
};

// Function to unregister audio refs
export const unregisterAudioRef = (ref: React.RefObject<HTMLAudioElement | null>) => {
    audioRefs.delete(ref);
};

// Function to stop all registered audio refs
export const stopAllRegisteredAudio = () => {
    audioRefs.forEach(ref => {
        if (ref.current && !ref.current.paused) {
            ref.current.pause();
            ref.current.currentTime = 0;
        }
    });
};

// Enhanced setTimeout and setInterval that track their IDs
export const trackTimeout = (callback: () => void, delay: number): number => {
    const id = window.setTimeout(() => {
        activeTimeouts.delete(id);
        callback();
    }, delay);
    activeTimeouts.add(id);
    return id;
};

export const trackInterval = (callback: () => void, interval: number): number => {
    const id = window.setInterval(callback, interval);
    activeIntervals.add(id);
    return id;
};

export const clearTrackedTimeout = (id: number): void => {
    window.clearTimeout(id);
    activeTimeouts.delete(id);
};

export const clearTrackedInterval = (id: number): void => {
    window.clearInterval(id);
    activeIntervals.delete(id);
};

export const globalCleanup = () => {
    // Cancel any ongoing speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    // Stop all audio elements including countdown audio
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
        // Also stop any loading audio
        audio.load();
    });

    // Also stop any HTML5 audio that might be playing
    const allAudioElements = document.getElementsByTagName('audio');
    for (let i = 0; i < allAudioElements.length; i++) {
        const audio = allAudioElements[i];
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    // Specifically stop countdown audio
    stopCountdownAudio();
    
    // Stop all registered audio refs
    stopAllRegisteredAudio();

    // Clear all tracked timeouts and intervals
    activeTimeouts.forEach(id => window.clearTimeout(id));
    activeIntervals.forEach(id => window.clearInterval(id));
    activeTimeouts.clear();
    activeIntervals.clear();

    // For existing timers that aren't tracked, do a limited cleanup
    // This is safer than clearing all possible IDs
    const recentTimeoutIds = 100; // Only clear recent IDs
    const recentIntervalIds = 100;
    
    const highestTimeoutId = window.setTimeout(() => {}, 0);
    window.clearTimeout(highestTimeoutId);
    
    for (let i = Math.max(0, highestTimeoutId - recentTimeoutIds); i < highestTimeoutId; i++) {
        window.clearTimeout(i);
    }

    const highestIntervalId = window.setInterval(() => {}, 0);
    window.clearInterval(highestIntervalId);
    
    for (let i = Math.max(0, highestIntervalId - recentIntervalIds); i < highestIntervalId; i++) {
        window.clearInterval(i);
    }

    // Clear any animation frames
    const animationId = window.requestAnimationFrame(() => {});
    window.cancelAnimationFrame(animationId);
};

export const stopAllAudio = () => {
    // Stop all audio elements including countdown audio
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
        // Also stop any loading audio
        audio.load();
    });

    // Also stop any HTML5 audio that might be playing
    const allAudioElements = document.getElementsByTagName('audio');
    for (let i = 0; i < allAudioElements.length; i++) {
        const audio = allAudioElements[i];
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
};

export const cancelAllTimers = () => {
    // Clear all tracked timeouts and intervals
    activeTimeouts.forEach(id => window.clearTimeout(id));
    activeIntervals.forEach(id => window.clearInterval(id));
    activeTimeouts.clear();
    activeIntervals.clear();
};

export const cancelSpeechSynthesis = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
};

export const stopCountdownAudio = () => {
    // Stop countdown audio specifically
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        // Check if it's countdown audio by source
        if (audio.src.includes('countdown') || audio.src.includes('count')) {
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    });
    
    // Also check all audio elements that might be created via new Audio()
    const allAudioElements = document.getElementsByTagName('audio');
    for (let i = 0; i < allAudioElements.length; i++) {
        const audio = allAudioElements[i];
        if (audio.src.includes('countdown') || audio.src.includes('count')) {
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }
    
    // Stop all registered audio refs (including countdownAudioRef)
    stopAllRegisteredAudio();
};
