"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaVolumeUp, FaKeyboard, FaBrain, FaLightbulb, FaArrowLeft, FaPlay, FaTimes, FaGamepad, FaTrophy, FaGraduationCap, FaFire } from "react-icons/fa";
import { getDifficultyInfo } from "@/lib/words-new";

// Interface สำหรับข้อมูลโหมด
interface ModeInfo {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
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
                color: 'text-blue-400',
                gradientFrom: 'from-blue-400',
                gradientTo: 'to-blue-600'
            };
        case 'typing':
            return {
                id: 'typing',
                name: 'Typing Mode',
                icon: FaKeyboard,
                description: 'ฝึกพิมพ์คำศัพท์ให้เร็วและแม่นยำ',
                color: 'text-green-400',
                gradientFrom: 'from-green-400',
                gradientTo: 'to-green-600'
            };
        case 'memory':
            return {
                id: 'memory',
                name: 'Memory Mode',
                icon: FaBrain,
                description: 'ทดสอบความจำคำศัพท์',
                color: 'text-purple-400',
                gradientFrom: 'from-purple-400',
                gradientTo: 'to-purple-600'
            };
        case 'meaning-match':
            return {
                id: 'meaning-match',
                name: 'Meaning Match',
                icon: FaLightbulb,
                description: 'อ่านความหมายแล้วตอบคำศัพท์',
                color: 'text-orange-400',
                gradientFrom: 'from-orange-400',
                gradientTo: 'to-orange-600'
            };
        default:
            return {
                id: 'default',
                name: 'Game Mode',
                icon: FaGamepad,
                description: 'เล่นเกมเพื่อฝึกคำศัพท์',
                color: 'text-gray-400',
                gradientFrom: 'from-gray-400',
                gradientTo: 'to-gray-600'
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
                    title: "ฟังเสียงคำศัพท์อย่างตั้งใจ",
                    description: "กดปุ่มลำโพงหรือรอให้ระบบเล่นเสียงคำศัพท์ ฟังอย่างตั้งใจและจดจำการออกเสียง",
                    icon: FaVolumeUp,
                },
                {
                    stepNumber: "2",
                    title: "พิมพ์คำที่ได้ยินทันที",
                    description: "พิมพ์คำศัพท์ที่ได้ยินลงในช่องข้อความ ไม่ต้องกังวลกับตัวเล็ก-ใหญ่",
                    icon: FaKeyboard,
                },
                {
                    stepNumber: "3",
                    title: "ระบบให้ผลลัพธ์ทันที",
                    description: "หากตอบถูกจะแสดงเครื่องหมายถูกสีเขียว หากผิดจะแสดงคำตอบที่ถูกต้อง",
                    icon: FaTrophy,
                }
            ];
        case 'typing':
            return [
                {
                    stepNumber: "1",
                    title: "เตรียมความพร้อมสำหรับการพิมพ์",
                    description: "วางนิ้วในตำแหน่งที่ถูกต้อง คำศัพท์จะแสดงบนหน้าจอและเริ่มจับเวลา 60 วินาทีทันที",
                    icon: FaKeyboard,
                },
                {
                    stepNumber: "2",
                    title: "พิมพ์ให้เร็วและแม่นยำ",
                    description: "พิมพ์คำศัพท์ที่แสดงให้เร็วที่สุดแต่ยังคงความแม่นยำ ระบบจะคำนวณ WPM แบบเรียลไทม์",
                    icon: FaFire,
                },
                {
                    stepNumber: "3",
                    title: "ท้าทายตัวเองให้ดีขึ้น",
                    description: "เมื่อหมดเวลา ดูผลลัพธ์ WPM สูงสุดและเฉลี่ย พยายามทำลายสถิติของตัวเอง",
                    icon: FaTrophy,
                }
            ];
        case 'memory':
            return [
                {
                    stepNumber: "1",
                    title: "สังเกตคำศัพท์ให้ละเอียด",
                    description: "คำศัพท์จะแสดงเป็นเวลา 2 วินาที มองดูอย่างตั้งใจและพยายามจำให้ได้",
                    icon: FaBrain,
                },
                {
                    stepNumber: "2",
                    title: "จำคำในใจขณะนับถอยหลัง",
                    description: "เมื่อคำหายไป จะมีการนับถอยหลัง ใช้เวลานี้ในการทบทวนคำที่เห็น",
                    icon: FaFire,
                },
                {
                    stepNumber: "3",
                    title: "พิมพ์ตามที่จำได้",
                    description: "พิมพ์คำศัพท์ที่จำได้ลงในช่อง ใช้เวลาคิดให้ดีก่อนพิมพ์",
                    icon: FaKeyboard,
                }
            ];
        case 'meaning-match':
            return [
                {
                    stepNumber: "1",
                    title: "อ่านความหมายอย่างละเอียด",
                    description: "อ่านความหมายที่แสดงบนหน้าจอให้เข้าใจ ลองคิดถึงคำที่เกี่ยวข้อง",
                    icon: FaLightbulb,
                },
                {
                    stepNumber: "2",
                    title: "ใช้ความรู้ในการเดาคำ",
                    description: "จากความหมายที่อ่าน ใช้ความรู้คำศัพท์ในการคิดหาคำภาษาอังกฤษที่ตรงกัน",
                    icon: FaBrain,
                },
                {
                    stepNumber: "3",
                    title: "เรียนรู้จากคำตอบ",
                    description: "ไม่ว่าจะตอบถูกหรือผิด ระบบจะแสดงคำตอบที่ถูกต้องเพื่อเรียนรู้",
                    icon: FaTrophy,
                }
            ];
        default:
            return [];
    }
};

export default function PreGamePage() {
    const router = useRouter();
    const params = useParams();
    const modeId = params.modeId as string;
    const difficultyId = params.difficultyId as string;

    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [selectedGameStyle, setSelectedGameStyle] = useState<'practice' | 'challenge'>('challenge');

    const modeInfo = getModeInfo(modeId);
    const howToPlaySteps = getHowToPlaySteps(modeId);
    const difficultyInfo = getDifficultyInfo(difficultyId);

    const handleGoBack = () => {
        router.back();
    };

    const handleStartGame = () => {
        // Updated to new route structure
        router.push(`/play/${modeId}/${difficultyId}/game?style=${selectedGameStyle}`);
    };

    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#1A0A1A] text-white pt-10 px-4 overflow-hidden relative">

            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mt-6 relative z-10"
            >
                <motion.button
                    onClick={handleGoBack}
                    className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-300 group py-3 px-4 -mx-4 rounded-lg hover:bg-white/5"
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaArrowLeft className="text-lg group-hover:text-red-400 transition-colors duration-300" />
                    <span
                        className="text-lg font-medium group-hover:text-red-400 transition-colors duration-300"
                        style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    >
                        Back
                    </span>
                </motion.button>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
                {/* Game Confirmation Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-2xl mb-12"
                >
                    {/* Title */}
                    <h1
                        className="text-5xl text-center bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-8 font-bold py-1"
                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                    >
                        Ready to Play?
                    </h1>

                    {/* Game Details Card */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                        <div className="flex items-center justify-center mb-6">
                            <div className={`bg-gradient-to-br ${modeInfo.gradientFrom} ${modeInfo.gradientTo} p-6 rounded-2xl shadow-lg`}>
                                <modeInfo.icon className="text-5xl text-white" />
                            </div>
                        </div>

                        <div className="text-center">
                            <h2
                                className="text-3xl text-white font-bold mb-2"
                                style={{ fontFamily: "'Caveat Brush', cursive" }}
                            >
                                {modeInfo.name}
                            </h2>
                            <p
                                className="text-lg text-neutral-300 mb-4"
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                {modeInfo.description}
                            </p>
                            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${modeInfo.gradientFrom} ${modeInfo.gradientTo} text-white font-medium`}>
                                {difficultyInfo.difficulty.toUpperCase()} - {difficultyInfo.wordCount} คำ
                            </div>
                        </div>

                        {/* How to Play Button */}
                        <div className="flex justify-center mt-6">
                            <motion.button
                                onClick={() => setShowHowToPlay(true)}
                                className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium underline decoration-dotted underline-offset-4"
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                วิธีการเล่น
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Game Style Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full max-w-4xl"
                >
                    <h3
                        className="text-3xl text-center text-white mb-8 font-bold"
                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                    >
                        Choose Your Style
                    </h3>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Practice Mode */}
                        <motion.button
                            onClick={() => setSelectedGameStyle('practice')}
                            className={`relative p-8 rounded-3xl border-2 transition-all duration-300 overflow-hidden ${selectedGameStyle === 'practice'
                                ? 'border-blue-400 bg-gradient-to-br from-blue-500/20 to-blue-600/30 shadow-xl shadow-blue-500/20'
                                : 'border-white/30 bg-white/5 hover:border-blue-400/50 hover:bg-white/10'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <motion.div
                                    animate={{
                                        scale: selectedGameStyle === 'practice' ? [1, 1.1, 1] : 1
                                    }}
                                    transition={{ duration: 2, repeat: selectedGameStyle === 'practice' ? Infinity : 0 }}
                                >
                                    <FaGraduationCap className={`text-5xl mb-4 transition-all duration-300 ${selectedGameStyle === 'practice'
                                        ? 'text-blue-400 drop-shadow-lg filter brightness-110'
                                        : 'text-white/70'
                                        }`} />
                                </motion.div>
                                <h4
                                    className={`text-2xl font-bold mb-2 transition-all duration-300 ${selectedGameStyle === 'practice'
                                        ? 'text-blue-400 drop-shadow-sm'
                                        : 'text-white'
                                        }`}
                                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                                >
                                    Practice Mode
                                </h4>
                                <p
                                    className={`text-sm leading-relaxed transition-all duration-300 ${selectedGameStyle === 'practice'
                                        ? 'text-blue-100'
                                        : 'text-neutral-300'
                                        }`}
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                >
                                    📖 เล่นสบายๆ, ไม่มีจับเวลา 🪶
                                </p>
                            </div>

                            {/* Selected Checkmark */}
                            {selectedGameStyle === 'practice' && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="absolute top-4 right-4 bg-blue-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg"
                                >
                                    ✓
                                </motion.div>
                            )}
                        </motion.button>

                        {/* Challenge Mode */}
                        <motion.button
                            onClick={() => setSelectedGameStyle('challenge')}
                            className={`relative p-8 rounded-3xl border-2 transition-all duration-300 ${selectedGameStyle === 'challenge'
                                ? 'border-orange-400 bg-gradient-to-br from-orange-500/20 to-red-500/30 shadow-xl shadow-orange-500/30'
                                : 'border-orange-400/50 bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:border-orange-400 hover:from-orange-500/20 hover:to-red-500/20'
                                }`}
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(251, 146, 60, 0.3)" }}
                            whileTap={{ scale: 0.98 }}
                        >

                            {/* Recommended Badge */}
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                แนะนำ
                            </div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <motion.div
                                    animate={{
                                        scale: selectedGameStyle === 'challenge' ? [1, 1.1, 1] : 1,
                                        rotate: selectedGameStyle === 'challenge' ? [0, 5, -5, 0] : 0
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: selectedGameStyle === 'challenge' ? Infinity : 0,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <FaFire className={`text-5xl mb-4 transition-all duration-300 ${selectedGameStyle === 'challenge'
                                        ? 'text-orange-400 drop-shadow-lg filter brightness-110'
                                        : 'text-orange-400/70'
                                        }`} />
                                </motion.div>
                                <h4
                                    className={`text-2xl font-bold mb-2 transition-all duration-300 ${selectedGameStyle === 'challenge'
                                        ? 'text-orange-400 drop-shadow-sm'
                                        : 'text-orange-300'
                                        }`}
                                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                                >
                                    Challenge Mode
                                </h4>
                                <p
                                    className={`text-sm leading-relaxed transition-all duration-300 ${selectedGameStyle === 'challenge'
                                        ? 'text-orange-100'
                                        : 'text-neutral-200'
                                        }`}
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                >
                                    🏆 จับเวลา, คิดคะแนน, ท้าทาย! ⚡️
                                </p>
                            </div>



                            {/* Selected Checkmark */}
                            {selectedGameStyle === 'challenge' && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="absolute top-4 right-4 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-20"
                                >
                                    ✓
                                </motion.div>
                            )}

                            {/* Sparkle Effects for Challenge Mode */}
                            {selectedGameStyle === 'challenge' && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0, 1, 0],
                                                x: [0, Math.random() * 100 - 50],
                                                y: [0, Math.random() * 100 - 50]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.3,
                                                ease: "easeOut"
                                            }}
                                            className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange-400 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.button>
                    </div>

                    {/* Start Game Button */}
                    <div className="flex justify-center mt-12">
                        <motion.button
                            onClick={handleStartGame}
                            className={`relative group focus:outline-none bg-gradient-to-r ${modeInfo.gradientFrom} ${modeInfo.gradientTo} text-white font-bold py-4 px-12 rounded-2xl text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/30 flex items-center gap-3`}
                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>เริ่มเล่น</span>
                            <FaPlay className="text-lg" />
                        </motion.button>
                    </div>
                </motion.div>
            </div >

            {/* How to Play Modal */}
            <AnimatePresence>
                {
                    showHowToPlay && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowHowToPlay(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3
                                        className={`text-3xl font-bold ${modeInfo.color}`}
                                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                                    >
                                        How to Play: {modeInfo.name}
                                    </h3>
                                    <button
                                        onClick={() => setShowHowToPlay(false)}
                                        className="text-white/70 hover:text-white transition-colors duration-300 p-2"
                                    >
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>

                                {/* Steps */}
                                <div className="space-y-6">
                                    {howToPlaySteps.map((step, index) => (
                                        <div key={index} className="flex items-start space-x-4">
                                            <div className={`flex-shrink-0 bg-gradient-to-r ${modeInfo.gradientFrom} ${modeInfo.gradientTo} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm`}>
                                                {step.stepNumber}
                                            </div>
                                            <div className="flex-1">
                                                <h4
                                                    className="text-lg font-bold text-white mb-2"
                                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                                >
                                                    {step.title}
                                                </h4>
                                                <p
                                                    className="text-neutral-300 leading-relaxed"
                                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                                >
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </main >
    );
}
