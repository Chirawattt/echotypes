"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight, FaVolumeUp, FaBook, FaInfoCircle } from 'react-icons/fa';
import { IncorrectWord } from '@/lib/stores/gameStore';
import { Word } from '@/lib/words/types';

interface IncorrectWordsModalProps {
    isOpen: boolean;
    onClose: () => void;
    incorrectWords: IncorrectWord[];
    words: Word[];
    modeId: string;
}

export default function IncorrectWordsModal({ 
    isOpen, 
    onClose, 
    incorrectWords, 
    words, 
    modeId 
}: IncorrectWordsModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSpeechSynth(window.speechSynthesis);
        }
    }, []);

    // Reset to first item when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    handlePrevious();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    handleNext();
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
                case ' ': // Spacebar to play sound
                    e.preventDefault();
                    handleSpeak(currentWord.correct);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, currentIndex, incorrectWords.length]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!isOpen || incorrectWords.length === 0) return null;

    const currentWord = incorrectWords[currentIndex];
    const wordData = words.find(w => w.word === currentWord.correct);

    const handlePrevious = () => {
        setCurrentIndex(prev => prev > 0 ? prev - 1 : incorrectWords.length - 1);
    };

    const handleNext = () => {
        setCurrentIndex(prev => prev < incorrectWords.length - 1 ? prev + 1 : 0);
    };

    const handleSpeak = (text: string) => {
        if (speechSynth) {
            speechSynth.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynth.speak(utterance);
        }
    };

    const getModeIcon = () => {
        switch (modeId) {
            case 'echo': return '🔊';
            case 'memory': return '🧠';
            case 'typing': return '⚡';
            default: return '💭';
        }
    };

    const getModeTitle = () => {
        switch (modeId) {
            case 'echo': return 'Echo Challenge';
            case 'memory': return 'Memory Challenge';
            case 'typing': return 'Typing Challenge';
            default: return 'Challenge';
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-gradient-to-br from-neutral-900 to-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-700/50 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-neutral-700/50">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{getModeIcon()}</span>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Review Mistakes
                                </h2>
                                <p className="text-sm text-neutral-400">
                                    {getModeTitle()} • {currentIndex + 1} of {incorrectWords.length}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-800 rounded-xl transition-colors duration-200 text-neutral-400 hover:text-white"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Navigation Info */}
                        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-neutral-500">
                            <FaChevronLeft className="text-xs" />
                            <span>Navigate with arrow keys or buttons</span>
                            <FaChevronRight className="text-xs" />
                        </div>

                        {/* Main Word Display */}
                        <div className="text-center mb-8">
                            {/* Correct Answer */}
                            <div className="mb-6">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <span className="text-green-500">✓</span>
                                    <span className="text-sm text-green-400/80 font-medium">Correct Answer</span>
                                </div>
                                <div className="bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6 mb-4">
                                    <div className="flex items-center justify-center gap-4 mb-2">
                                        <h3 className="text-4xl font-bold text-green-400">
                                            {currentWord.correct}
                                        </h3>
                                        <button
                                            onClick={() => handleSpeak(currentWord.correct)}
                                            className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-colors duration-200 text-green-400 hover:text-green-300"
                                        >
                                            <FaVolumeUp className="text-xl" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Your Answer */}
                            <div className="mb-6">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <span className="text-red-500">✗</span>
                                    <span className="text-sm text-red-400/80 font-medium">Your Answer</span>
                                </div>
                                <div className="bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30 rounded-2xl p-6">
                                    <h3 className="text-3xl font-semibold text-red-400">
                                        {currentWord.incorrect || '(No answer)'}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        {wordData && (
                            <div className="space-y-4 mb-6">
                                {/* Word Meaning */}
                                {wordData.meaning && (
                                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaBook className="text-blue-400" />
                                            <span className="text-sm font-medium text-blue-300">Meaning</span>
                                        </div>
                                        <p className="text-neutral-200">{wordData.meaning}</p>
                                    </div>
                                )}

                                {/* Word Example - Not available in current Word type */}
                                {/* Future enhancement: Add example field to Word type */}
                                
                                {/* Additional Info */}
                                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaInfoCircle className="text-amber-400" />
                                        <span className="text-sm font-medium text-amber-300">Learning Tip</span>
                                    </div>
                                    <p className="text-neutral-200 text-sm">
                                        {modeId === 'echo' ? 'Try to focus on the pronunciation and repeat slowly.' :
                                         modeId === 'memory' ? 'Create a mental image or association to remember this word better.' :
                                         modeId === 'typing' ? 'Practice typing this word multiple times to build muscle memory.' :
                                         'Review this word regularly to improve your retention.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Controls */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handlePrevious}
                                disabled={incorrectWords.length <= 1}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200 text-white"
                            >
                                <FaChevronLeft />
                                <span>Previous</span>
                            </button>

                            {/* Progress Indicator */}
                            <div className="flex gap-2">
                                {incorrectWords.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                                            index === currentIndex 
                                                ? 'bg-blue-500' 
                                                : 'bg-neutral-600 hover:bg-neutral-500'
                                        }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={incorrectWords.length <= 1}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200 text-white"
                            >
                                <span>Next</span>
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
