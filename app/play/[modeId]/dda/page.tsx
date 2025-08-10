"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaVolumeUp, FaKeyboard, FaBrain, FaPlay, FaTimes, FaGraduationCap, FaFire, FaClock, FaCog} from "react-icons/fa";
import React from "react";
import { useSession } from "next-auth/react";

// Interface สำหรับข้อมูลโหมด
interface ModeInfo {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
    descriptionEng: string;
    color: string;
    bgGradient: string;
    features: string[];
    tips: string[];
}

// Interface สำหรับขั้นตอนการเล่น
interface HowToPlayStep {
    stepNumber: string;
    title: string;
    description: string;
    icon: React.ElementType;
}

// ข้อมูลของแต่ละโหมด
const getModeInfo = (modeId: string): ModeInfo => {
    switch (modeId) {
        case 'echo':
            return {
                id: 'echo',
                name: 'Echo Mode',
                icon: FaVolumeUp,
                description: 'ฟังเสียงคำศัพท์แล้วพิมพ์ตาม',
                descriptionEng: 'Listen and type what you hear',
                color: 'text-blue-400',
                bgGradient: 'from-blue-500/20 to-cyan-500/10',
                features: ['🎧 เรียนรู้จากเสียง', '📝 ฝึกการออกเสียง', '⏱️ ทักษะการฟัง'],
                tips: ['ใช้หูฟังเพื่อประสบการณ์ที่ดีที่สุด', 'คุณสามารถฟังซ้ำได้หากต้องการ', 'มุ่งเน้นไปที่รูปแบบการออกเสียง']
            };
        case 'typing':
            return {
                id: 'typing',
                name: 'Typing Mode',
                icon: FaKeyboard,
                description: 'ฝึกพิมพ์คำศัพท์ให้เร็วและแม่นยำ',
                descriptionEng: 'Fast typing practice with accuracy tracking',
                color: 'text-green-400',
                bgGradient: 'from-green-500/20 to-emerald-500/10',
                features: ['⚡ ฝึกความเร็ว', '🎯 ติดตามความแม่นยำ', '📊 คำนวณ WPM'],
                tips: ['วางนิ้วไว้ที่แถว Home Row', 'เน้นความแม่นยำก่อน แล้วค่อยเพิ่มความเร็ว', 'พักบ่อยๆ เพื่อไม่ให้เหนื่อยล้า']
            };
        case 'memory':
            return {
                id: 'memory',
                name: 'Memory Mode',
                icon: FaBrain,
                description: 'ทดสอบความจำคำศัพท์',
                descriptionEng: 'Test your vocabulary retention skills',
                color: 'text-purple-400',
                bgGradient: 'from-purple-500/20 to-violet-500/10',
                features: ['🧠 ฝึกความจำ', '📚 สร้างคลังคำศัพท์', '⏳ ฝึกการจดจำแบบจับเวลา'],
                tips: ['มุ่งเน้นไปที่รูปแบบของคำ', 'ใช้เทคนิคการจำด้วยภาพ', 'ฝึกฝนอย่างสม่ำเสมอเพื่อความก้าวหน้า']
            };
        default:
            return {
                id: 'default',
                name: 'Game Mode',
                icon: FaCog,
                description: 'เล่นเกมเพื่อฝึกคำศัพท์',
                descriptionEng: 'Play games to practice vocabulary',
                color: 'text-gray-400',
                bgGradient: 'from-gray-500/20 to-slate-500/10',
                features: ['🎮 การเรียนรู้แบบโต้ตอบ'],
                tips: ['เลือกโหมดที่เหมาะสมกับเป้าหมายของคุณ']
            };
    }
};

// วิธีการเล่นสำหรับแต่ละโหมด
const getHowToPlaySteps = (modeId: string): HowToPlayStep[] => {
    switch (modeId) {
        case 'echo':
            return [
                {
                    stepNumber: "1",
                    title: "ฟังเสียง",
                    description: "กดปุ่มลำโพงหรือรอให้เล่นอัตโนมัติ ฟังการออกเสียงอย่างระมัดระวังและพยายามเข้าใจคำศัพท์",
                    icon: FaVolumeUp,
                },
                {
                    stepNumber: "2",
                    title: "พิมพ์สิ่งที่ได้ยิน",
                    description: "พิมพ์คำที่คุณได้ยินลงในช่องข้อความ ไม่ต้องกังวลเรื่องตัวพิมพ์ใหญ่-เล็ก เน้นไปที่การสะกดให้ถูกต้อง",
                    icon: FaKeyboard,
                },
                {
                    stepNumber: "3",
                    title: "เรียนรู้จากผลลัพธ์",
                    description: "รับคะแนนจากคำตอบที่ถูกต้อง หากผิด คุณจะเห็นการสะกดที่ถูกต้องเพื่อช่วยให้เรียนรู้และจดจำ",
                    icon: FaGraduationCap,
                }
            ];
        case 'typing':
            return [
                {
                    stepNumber: "1",
                    title: "เตรียมท่าพิมพ์",
                    description: "วางนิ้วไว้ที่แถว Home Row ตัวจับเวลาจะเริ่มนับทันทีที่คำแรกปรากฏบนหน้าจอ",
                    icon: FaKeyboard,
                },
                {
                    stepNumber: "2",
                    title: "พิมพ์เร็วและแม่นยำ",
                    description: "พิมพ์คำที่แสดงให้เร็วที่สุดเท่าที่จะทำได้ในขณะที่ยังคงความแม่นยำ WPM ของคุณจะถูกคำนวณแบบเรียลไทม์",
                    icon: FaFire,
                },
                {
                    stepNumber: "3",
                    title: "เอาชนะสถิติของตัวเอง",
                    description: "เมื่อหมดเวลา คุณจะเห็นผล WPM และความแม่นยำ พยายามเอาชนะคะแนนส่วนตัวที่ดีที่สุดของคุณ!",
                    icon: FaGraduationCap,
                }
            ];
        case 'memory':
            return [
                {
                    stepNumber: "1",
                    title: "ศึกษาคำศัพท์",
                    description: "คำศัพท์จะแสดงเป็นเวลาสักครู่ ดูอย่างระมัดระวังและพยายามจำ - ให้ความสำคัญกับการสะกด",
                    icon: FaBrain,
                },
                {
                    stepNumber: "2",
                    title: "จำระหว่างนับถอยหลัง",
                    description: "หลังจากคำศัพท์หายไป ใช้เวลานับถอยหลังเพื่อทบทวนสิ่งที่เห็นในใจ",
                    icon: FaClock,
                },
                {
                    stepNumber: "3",
                    title: "พิมพ์จากความทรงจำ",
                    description: "พิมพ์คำที่คุณจำได้ ใช้เวลาคิดก่อนพิมพ์ - ความแม่นยำสำคัญกว่าความเร็ว",
                    icon: FaKeyboard,
                }
            ];
        default:
            return [];
    }
};

export default function DDAPreGamePage() {
    const router = useRouter();
    const params = useParams();
    const modeId = params.modeId as string;
    const { data: session } = useSession();
    // Everything is DDA now - no need for difficultyId
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [selectedGameStyle, setSelectedGameStyle] = useState<'practice' | 'challenge'>('challenge');
    const [currentStep, setCurrentStep] = useState(0);
    
    // Time selection for typing practice mode
    const [showTimeSelectionModal, setShowTimeSelectionModal] = useState(false);
    const [selectedTime, setSelectedTime] = useState<number | null>(null);

    const modeInfo = getModeInfo(modeId);
    const howToPlaySteps = getHowToPlaySteps(modeId);

    const handleStartGame = () => {
        // Show time selection modal for typing practice mode
        if (modeId === 'typing' && selectedGameStyle === 'practice') {
            setShowTimeSelectionModal(true);
        } else {
            // Navigate to gameplay page (simplified DDA routing)
            router.push(`/play/${modeId}/dda/play?style=${selectedGameStyle}`);
        }
    };

    const handleTimeSelection = (time: number | null) => {
        setSelectedTime(time);
    };

    const handleConfirmTimeSelection = () => {
        setShowTimeSelectionModal(false);
        
        // Navigate with selected time as URL parameter
        const timeParam = selectedTime !== undefined 
            ? (selectedTime === null ? '&time=unlimited' : `&time=${selectedTime}`) 
            : '';
        router.push(`/play/${modeId}/dda/play?style=${selectedGameStyle}${timeParam}`);
    };

    const handleCancelTimeSelection = () => {
        setShowTimeSelectionModal(false);
        setSelectedTime(null);
    };

    const handleCloseHowToPlay = () => {
        setShowHowToPlay(false);
        setCurrentStep(0);
    };

    const handleNextStep = () => {
        if (currentStep < howToPlaySteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleCloseHowToPlay();
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
    <main id="page-main" className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-20 px-4 overflow-hidden relative">
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10 max-w-5xl mx-auto">
                
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1
                        className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent py-5 mb-4"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        Ready to play?
                    </h1>
                    <p className="text-xl text-slate-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                        เตรียมตัวสำหรับการท้าทายคำศัพท์
                    </p>
                </motion.div>

                {/* Mode Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-4xl mb-12"
                >
                    <div className={`bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/15 ${modeInfo.bgGradient} shadow-2xl`}>
                        
                        {/* Mode Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                                <modeInfo.icon className={`text-4xl ${modeInfo.color}`} />
                            </div>
                            
                            <h2 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                {modeInfo.name}
                            </h2>
                            
                            <p className="text-xl text-slate-300 mb-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                {modeInfo.description}
                            </p>
                            
                            <p className="text-lg text-slate-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                {modeInfo.descriptionEng}
                            </p>
                        </div>

                        {/* Features and Tips Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            
                            {/* Features */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h3 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    ✨ Features
                                </h3>
                                <ul className="space-y-2">
                                    {modeInfo.features.map((feature, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            className="text-slate-300 flex items-center gap-2"
                                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                        >
                                            {feature}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Tips */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h3 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    💡 Pro Tips
                                </h3>
                                <ul className="space-y-2">
                                    {modeInfo.tips.map((tip, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + index * 0.1 }}
                                            className="text-slate-300 text-sm"
                                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                        >
                                            • {tip}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Difficulty Info */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center mb-6">
                            <div className="inline-flex items-center gap-2 text-emerald-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                <FaCog className="text-lg" />
                                <span className="font-semibold">ปรับระดับความยากอัตโนมัติ (A1-C2)</span>
                            </div>
                            <p className="text-slate-300 text-sm mt-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                เกมจะปรับระดับความยากโดยอัตโนมัติตามผลการเล่นของคุณ
                            </p>
                        </div>

                        {/* How to Play Button */}
                        <div className="flex justify-center">
                            <motion.button
                                onClick={() => {
                                    setShowHowToPlay(true);
                                    setCurrentStep(0);
                                }}
                                className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium underline decoration-dotted underline-offset-4 text-lg"
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                📖 วิธีการเล่น
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Game Style Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full max-w-4xl mb-12"
                >
                    <h3 className="text-3xl text-center text-white mb-8 font-bold" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                        เลือกสไตล์การเล่น
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Practice Mode */}
                        <motion.button
                            onClick={() => setSelectedGameStyle('practice')}
                            className={`relative p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden ${
                                selectedGameStyle === 'practice'
                                    ? 'bg-white/10 backdrop-blur-md border-blue-400 shadow-xl shadow-blue-500/20'
                                    : 'bg-white/5 backdrop-blur-md border-white/15 hover:border-blue-400/50 hover:bg-white/10'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex flex-col items-center justify-center text-center">
                                <FaGraduationCap className={`text-5xl mb-4 ${selectedGameStyle === 'practice' ? 'text-blue-400' : 'text-white/70'}`} />
                                <h4 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    โหมดฝึกฝน
                                </h4>
                                <p className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    📖 เรียนรู้แบบสบายๆ ไม่มีความกดดันเรื่องเวลา
                                </p>
                            </div>
                            {selectedGameStyle === 'practice' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-4 right-4 bg-blue-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                                >
                                    ✓
                                </motion.div>
                            )}
                        </motion.button>

                        {/* Challenge Mode */}
                        <motion.button
                            onClick={() => setSelectedGameStyle('challenge')}
                            className={`relative p-6 rounded-3xl border-2 transition-all duration-300 ${
                                selectedGameStyle === 'challenge'
                                    ? 'bg-white/10 backdrop-blur-md border-orange-400 shadow-xl shadow-orange-500/20'
                                    : 'bg-white/5 backdrop-blur-md border-orange-400/50 hover:border-orange-400 hover:bg-white/10'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full "
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                แนะนำ
                            </div>
                            
                            <div className="flex flex-col items-center justify-center text-center">
                                <FaFire className={`text-5xl mb-4 ${selectedGameStyle === 'challenge' ? 'text-orange-400' : 'text-orange-400/70'}`} />
                                <h4 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    โหมดท้าทาย
                                </h4>
                                <p className="text-slate-300" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    🏆 การท้าทายแบบจับเวลาพร้อมคะแนน
                                </p>
                            </div>
                            {selectedGameStyle === 'challenge' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-4 right-4 bg-orange-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold z-20"
                                >
                                    ✓
                                </motion.div>
                            )}
                        </motion.button>
                    </div>

                    {/* Start Game Button */}
                    <div className="flex justify-center mt-12">
                        <motion.button
                            onClick={handleStartGame}
                            className={`bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-5 px-12 rounded-3xl text-2xl backdrop-blur-sm border border-emerald-400/30 transition-all duration-300 shadow-lg flex items-center gap-4`}
                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaPlay className="text-xl" />
                            <span>เริ่มเล่น</span>
                        </motion.button>
                    </div>

                    {!session && (
                        <p className="text-center text-slate-500 text-sm mt-4" data-testid="guest-warning">
                            Guest mode: scores aren’t saved. Sign in anytime to track your progress.
                        </p>
                    )}
                </motion.div>
            </div>

            {/* How to Play Modal */}
            <AnimatePresence>
                {showHowToPlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={handleCloseHowToPlay}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white/5 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white/15 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    วิธีการเล่น
                                </h3>
                                <button
                                    onClick={handleCloseHowToPlay}
                                    className="text-white/70 hover:text-red-400 transition-colors duration-300"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            {/* Step Content */}
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className={`bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20`}>
                                        {React.createElement(howToPlaySteps[currentStep].icon, {
                                            className: `text-4xl ${modeInfo.color}`
                                        })}
                                    </div>
                                </div>
                                
                                <div className="mb-2">
                                    <span className={`text-sm font-bold ${modeInfo.color}`}>
                                        Step {howToPlaySteps[currentStep].stepNumber}
                                    </span>
                                </div>
                                
                                <h4 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    {howToPlaySteps[currentStep].title}
                                </h4>
                                
                                <p className="text-slate-300 leading-relaxed" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    {howToPlaySteps[currentStep].description}
                                </p>
                            </div>

                            {/* Step Indicators */}
                            <div className="flex justify-center space-x-2 mb-6">
                                {howToPlaySteps.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-2 w-8 rounded-full transition-all duration-300 ${
                                            index === currentStep ? `bg-gradient-to-r ${modeInfo.bgGradient}` : 'bg-white/20'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between">
                                <button
                                    onClick={handlePrevStep}
                                    disabled={currentStep === 0}
                                    className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                                        currentStep === 0
                                            ? 'text-white/30 cursor-not-allowed'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                >
                                    Previous
                                </button>
                                
                                <button
                                    onClick={handleNextStep}
                                    className={`px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold hover:opacity-90 transition-all duration-300`}
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                >
                                    {currentStep === howToPlaySteps.length - 1 ? 'Got it!' : 'Next'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Time Selection Modal for Typing Practice Mode */}
            <AnimatePresence>
                {showTimeSelectionModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowTimeSelectionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/15 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 
                                className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                Select Practice Time
                            </h2>
                            <p 
                                className="text-lg text-center text-slate-300 mb-8"
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                Choose your preferred practice duration
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {[30, 60, 120, 300].map((seconds) => {
                                    const isSelected = selectedTime === seconds;
                                    return (
                                        <motion.button
                                            key={seconds}
                                            onClick={() => handleTimeSelection(seconds)}
                                            className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col items-center border-2 ${
                                                isSelected 
                                                    ? 'bg-white/10 backdrop-blur-md border-green-400 shadow-lg shadow-green-400/20' 
                                                    : 'bg-white/5 backdrop-blur-md hover:bg-white/10 border-white/15 hover:border-green-400/30'
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
                                                >
                                                    <span className="text-white text-sm">✓</span>
                                                </motion.div>
                                            )}
                                            <span 
                                                className={`text-3xl font-bold mb-1 ${isSelected ? 'text-green-300' : 'text-white'}`}
                                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                            >
                                                {seconds >= 60 ? `${seconds / 60}` : seconds}
                                            </span>
                                            <span 
                                                className="text-sm text-slate-300"
                                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                            >
                                                {seconds >= 60 ? 'min' : 'sec'}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                            
                            <motion.button
                                onClick={() => handleTimeSelection(null)}
                                className={`w-full rounded-2xl p-6 transition-all duration-300 border-2 ${
                                    selectedTime === null 
                                        ? 'bg-white/10 backdrop-blur-md border-amber-400 shadow-lg shadow-amber-400/20' 
                                        : 'bg-white/5 backdrop-blur-md hover:bg-white/10 border-amber-500/25 hover:border-amber-400/40'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {selectedTime === null && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center"
                                    >
                                        <span className="text-white text-sm">✓</span>
                                    </motion.div>
                                )}
                                <div className="text-center">
                                    <span 
                                        className={`text-xl font-bold ${selectedTime === null ? 'text-amber-200' : 'text-amber-300'}`}
                                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                    >
                                        🎯 Unlimited Time
                                    </span>
                                    <p 
                                        className="text-sm text-amber-200/70 mt-1"
                                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                    >
                                        Practice without time limits
                                    </p>
                                </div>
                            </motion.button>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-8">
                                <motion.button
                                    onClick={handleCancelTimeSelection}
                                    className="flex-1 bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/15 hover:border-red-400/50 rounded-xl py-3 px-6 transition-all duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span 
                                        className="text-slate-300 hover:text-red-300 font-semibold"
                                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                    >
                                        Cancel
                                    </span>
                                </motion.button>
                                
                                <motion.button
                                    onClick={handleConfirmTimeSelection}
                                    disabled={selectedTime === undefined}
                                    className={`flex-1 rounded-xl py-3 px-6 transition-all duration-300 ${
                                        selectedTime !== undefined
                                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border border-emerald-400/50'
                                            : 'bg-white/5 border border-white/10 cursor-not-allowed opacity-50'
                                    }`}
                                    whileHover={selectedTime !== undefined ? { scale: 1.02 } : {}}
                                    whileTap={selectedTime !== undefined ? { scale: 0.98 } : {}}
                                >
                                    <span 
                                        className={`font-semibold ${selectedTime !== undefined ? 'text-white' : 'text-gray-400'}`}
                                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                    >
                                        Start Game
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}