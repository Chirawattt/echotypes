"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaVolumeUp, FaKeyboard, FaBrain, FaTrophy, FaClock, FaGamepad, FaStar } from "react-icons/fa";

// Define a type for our game modes
interface GameMode {
    id: string;
    name: string;
    icon: React.ElementType;
    descriptionThai: string;
    descriptionEng: string;
    features: string[];
    difficulty: string;
    estimatedTime: string;
    bestFor: string;
    bgGradient: string;
    iconColor: string;
    glowColor: string;
}

// Define available game modes with enhanced information
const gameModes: GameMode[] = [
    {
        id: "echo",
        name: "Echo Mode",
        icon: FaVolumeUp,
        descriptionThai: "ฟังเสียงคำศัพท์แล้วพิมพ์ตาม",
        descriptionEng: "ฝึกฟังและพิมพ์ตามที่ได้ยิน - เหมาะสำหรับการพัฒนาทักษะการฟัง",
        features: ["🎧 การเรียนรู้จากเสียง", "📝 ฝึกการสะกดคำ", "🎯 ฝึกการออกเสียง", "⏱️ ความท้าทายเวลา"],
        difficulty: "ระดับเริ่มต้นถึงขั้นสูง",
        estimatedTime: "5-15 นาที",
        bestFor: "การฟังและการสะกดคำ",
        bgGradient: "from-blue-500/20 to-cyan-500/10",
        iconColor: "text-blue-400",
        glowColor: "rgba(59, 130, 246, 0.3)"
    },
    {
        id: "typing",
        name: "Typing Mode",
        icon: FaKeyboard,
        descriptionThai: "ฝึกพิมพ์คำศัพท์ให้เร็วและแม่นยำ",
        descriptionEng: "ฝึกพิมพ์แบบเร่งด่วนเพื่อเพิ่มความเร็วและความถูกต้องของคำศัพท์",
        features: ["⚡ ฝึกความเร็ว", "🎯 ติดตามความแม่นยำ", "📊 คำนวณ WPM", "🔥 ความท้าทายไนโตร"],
        difficulty: "ทุกระดับ",
        estimatedTime: "3-10 นาที",
        bestFor: "ความเร็วและความแม่นยำ",
        bgGradient: "from-green-500/20 to-emerald-500/10",
        iconColor: "text-green-400",
        glowColor: "rgba(34, 197, 94, 0.3)"
    },
    {
        id: "memory",
        name: "Memory Mode",
        icon: FaBrain,
        descriptionThai: "ทดสอบความจำคำศัพท์",
        descriptionEng: "ทดสอบความสามารถในการจำคำศัพท์และทักษะความจำ",
        features: ["🧠 ฝึกความจำ", "📚 สร้างคลังคำศัพท์", "🔄 การทบทวนแบบมีระยะ", "💡 การจดจำคำศัพท์"],
        difficulty: "ระดับกลางถึงผู้เชี่ยวชาญ",
        estimatedTime: "10-20 นาที",
        bestFor: "ความจำและคำศัพท์",
        bgGradient: "from-purple-500/20 to-violet-500/10",
        iconColor: "text-purple-400",
        glowColor: "rgba(168, 85, 247, 0.3)"
    }
];

export default function ModeSelectPage() {
    const router = useRouter();
    const [currentModeIndex, setCurrentModeIndex] = useState(0);

    const selectedMode = gameModes[currentModeIndex];

    const handleNextMode = () => {
        setCurrentModeIndex((prevIndex) => (prevIndex + 1) % gameModes.length);
    }

    const handlePrevMode = () => {
        setCurrentModeIndex((prevIndex) => (prevIndex - 1 + gameModes.length) % gameModes.length);
    }

    const handleStartSelectedMode = () => {
        // Use DDA as default difficulty for simplified structure
        router.push(`/play/${selectedMode.id}/dda`);
    }

    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-20 px-4 overflow-hidden">
            
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-12"
            >
                <motion.h1
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    Choose Your Mode
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-xl text-slate-300 max-w-2xl mx-auto"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    เลือกโหมดที่เหมาะสมกับระดับและเป้าหมายของคุณ
                </motion.p>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 w-full max-w-7xl flex flex-col items-center">
                
                {/* Mode Navigation */}
                <div className="flex items-center justify-center w-full mb-8">
                    {/* Previous Button */}
                    <motion.button
                        onClick={handlePrevMode}
                        className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/15 hover:bg-white/10 transition-all duration-300 mr-8"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={currentModeIndex === 0}
                        style={{ opacity: currentModeIndex === 0 ? 0.3 : 1 }}
                    >
                        <FaChevronLeft className="text-2xl text-white" />
                    </motion.button>

                    {/* Mode Indicators */}
                    <div className="flex gap-3">
                        {gameModes.map((_, index) => (
                            <motion.div
                                key={index}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === currentModeIndex 
                                        ? 'bg-emerald-400 scale-125' 
                                        : 'bg-white/20'
                                }`}
                                onClick={() => setCurrentModeIndex(index)}
                                whileHover={{ scale: 1.2 }}
                                style={{ cursor: 'pointer' }}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <motion.button
                        onClick={handleNextMode}
                        className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/15 hover:bg-white/10 transition-all duration-300 ml-8"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={currentModeIndex === gameModes.length - 1}
                        style={{ opacity: currentModeIndex === gameModes.length - 1 ? 0.3 : 1 }}
                    >
                        <FaChevronRight className="text-2xl text-white" />
                    </motion.button>
                </div>

                {/* Mode Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedMode.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-4xl"
                    >
                        <div className={`bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/15 ${selectedMode.bgGradient} shadow-2xl`}>
                            
                            {/* Mode Header */}
                            <div className="text-center mb-8">
                                <motion.div
                                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
                                    whileHover={{ scale: 1.1, rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <selectedMode.icon className={`text-5xl ${selectedMode.iconColor}`} />
                                </motion.div>
                                
                                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    {selectedMode.name}
                                </h2>
                                
                                <p className="text-xl text-slate-300 mb-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    {selectedMode.descriptionThai}
                                </p>
                                
                                <p className="text-lg text-slate-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    {selectedMode.descriptionEng}
                                </p>
                            </div>

                            {/* Mode Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                
                                {/* Features */}
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        <FaStar className="text-yellow-400" />
                                        Features
                                    </h3>
                                    <ul className="space-y-3">
                                        {selectedMode.features.map((feature, index) => (
                                            <motion.li
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="text-slate-300 text-lg flex items-center gap-2"
                                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                            >
                                                <span className="text-sm">{feature}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Game Info */}
                                <div className="space-y-4">
                                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                            <FaGamepad className="text-green-400" />
                                            Game Information
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>ระดับความยาก:</span>
                                                <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{selectedMode.difficulty}</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400 flex items-center gap-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                                    <FaClock className="text-blue-400" />
                                                    ระยะเวลา:
                                                </span>
                                                <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{selectedMode.estimatedTime}</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400 flex items-center gap-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                                    <FaTrophy className="text-yellow-400" />
                                                    เหมาะสำหรับ:
                                                </span>
                                                <span className="text-white font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>{selectedMode.bestFor}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Start Button */}
                            <div className="text-center">
                                <motion.button
                                    onClick={handleStartSelectedMode}
                                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-5 px-12 rounded-2xl text-xl backdrop-blur-sm border border-emerald-400/30 transition-all duration-300 shadow-lg"
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    เริ่มเล่น {selectedMode.name}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Mode Selection Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-12 mb-8 text-center max-w-3xl"
            >
                <p className="text-slate-400 text-lg" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                    💡 <strong>เคล็ดลับ:</strong> เริ่มต้นด้วย Echo Mode ถ้าคุณเป็นมือใหม่กับคำศัพท์ภาษาอังกฤษ 
                    หรือลองโหมดความจำสำหรับการสร้างคลังคำศัพท์ขั้นสูง!
                </p>
            </motion.div>
        </main>
    );
}