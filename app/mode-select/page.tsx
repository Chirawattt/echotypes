"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaVolumeUp, FaKeyboard, FaBrain, FaLightbulb } from "react-icons/fa";


// Define a type for our game modes
interface GameMode {
    id: string;
    name: string;
    icon: React.ElementType;
    descriptionThai: string;
    descriptionEng: string;
    fontFamily?: string; // Optional: if a mode name needs a specific font
}

// Define available game modes
const gameModes: GameMode[] = [
    {
        id: "echo",
        name: "Echo Mode",
        icon: FaVolumeUp,
        descriptionThai: "ฟังเสียงคำศัพท์แล้วพิมพ์ตาม",
        descriptionEng: "ฝึกทักษะการฟัง (Listening Comprehension) และการสะกดคำ (Spelling) ไปพร้อมกัน",
        fontFamily: "'Caveat Brush', cursive",
    },
    {
        id: "typing",
        name: "Typing Mode",
        icon: FaKeyboard,
        descriptionThai: "ฝึกพิมพ์คำศัพท์ให้เร็วและแม่นยำ",
        descriptionEng: "Improve your typing speed and accuracy with English vocabulary.",
        fontFamily: "'Caveat Brush', cursive",
    },
    {
        id: "memory",
        name: "Memory Mode",
        icon: FaBrain,
        descriptionThai: "ทดสอบความจำคำศัพท์",
        descriptionEng: "Test your vocabulary retention.",
        fontFamily: "'Caveat Brush', cursive",
    },
    {
        id: "meaning-match",
        name: "Meaning Match",
        icon: FaLightbulb,
        descriptionThai: "อ่านความหมายแล้วตอบคำศัพท์",
        descriptionEng: "Read the defunition and type the correct vocabulary word.",
        fontFamily: "'Caveat Brush', cursive",
    }
]

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
        // Navigate to the actual game page for the selected mode
        console.log(`Starting game in ${selectedMode.name} mode`);
        router.push(`/game/${selectedMode.id}/difficulty`); // Placeholder, you'll create this route
    }

    const isFirstMode = currentModeIndex === 0;
    const isLastMode = currentModeIndex === gameModes.length - 1;

    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#1A0A1A] text-white pt-10 px-4 overflow-hidden relative">
            {/* Animated Background Elements - Similar to Home page */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        rotate: -360,
                        scale: [1.1, 1, 1.1]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        y: [-20, 20, -20],
                        x: [-10, 10, -10]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-green-500/5 to-teal-500/5 rounded-full blur-lg"
                />
            </div>

            {/* Mode Selecting Title */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mt-10 relative z-10"
            >
                <motion.h2
                    className="text-6xl text-center bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-2xl"
                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                    animate={{
                        textShadow: [
                            "0 0 20px rgba(239, 68, 68, 0.3)",
                            "0 0 40px rgba(239, 68, 68, 0.5)",
                            "0 0 20px rgba(239, 68, 68, 0.3)"
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Choose Your Mode
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-xl text-center mt-3 bg-gradient-to-r from-neutral-300 to-neutral-400 bg-clip-text text-transparent"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    เลือกโหมดที่ใช่สำหรับคุณ
                </motion.p>
            </motion.div>

            {/* Mode Carousel */}
            <motion.div
                key={selectedMode.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-grow flex-col items-center justify-center w-full max-w-6xl relative z-10"
            >
                {/* Mode Name */}
                <motion.h3
                    className="text-5xl mb-8 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent font-bold py-2"
                    style={{ fontFamily: selectedMode.fontFamily }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {selectedMode.name}
                </motion.h3>

                {/* Selector Container */}
                <div className="flex items-center justify-between w-full mb-10 sm:mb-12">
                    {/* Previous Button - Hidden when first mode */}
                    {!isFirstMode && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5 }}
                            onClick={handlePrevMode}
                            className="p-4 hover:scale-110 transition-all duration-300 focus:outline-none cursor-pointer group"
                            aria-label="Previous Mode"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-full border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-white/30 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                                <FaChevronLeft className="text-6xl text-blue-400 group-hover:text-blue-300 transition-all duration-300" />
                            </div>
                        </motion.button>
                    )}

                    {/* Spacer when first mode - Same size as button */}
                    {isFirstMode && (
                        <div className="p-4">
                            <div className="p-6 rounded-full">
                                <div className="text-6xl opacity-0">
                                    <FaChevronLeft />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mode Details - Enhanced Card */}
                    <motion.div
                        key={`${selectedMode.id}-details`}
                        initial={{ opacity: 0, y: 30, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col items-center text-center"
                    >
                        <motion.div
                            className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl"
                            whileHover={{ scale: 1.05, y: -10 }}
                            transition={{ duration: 0.3 }}
                            animate={{
                                boxShadow: [
                                    "0 20px 60px rgba(255, 255, 255, 0.1)",
                                    "0 25px 80px rgba(255, 255, 255, 0.15)",
                                    "0 20px 60px rgba(255, 255, 255, 0.1)"
                                ]
                            }}
                        >
                            {/* Glowing background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 rounded-3xl blur-xl opacity-50" />

                            <motion.div
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative z-10"
                            >
                                <selectedMode.icon className="text-[180px] bg-gradient-to-br from-red-400 to-orange-400 bg-clip-text drop-shadow-2xl" />
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Spacer when last mode - Same size as button */}
                    {isLastMode && (
                        <div className="p-4">
                            <div className="p-6 rounded-full">
                                <div className="text-6xl opacity-0">
                                    <FaChevronRight />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Next Button - Hidden when last mode */}
                    {!isLastMode && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.5 }}
                            onClick={handleNextMode}
                            className="p-4 hover:scale-110 transition-all duration-300 focus:outline-none cursor-pointer group"
                            aria-label="Next Mode"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-full border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-white/30 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                                <FaChevronRight className="text-6xl text-purple-400 group-hover:text-purple-300 transition-all duration-300" />
                            </div>
                        </motion.button>
                    )}
                </div>

                {/* Mode Description - Enhanced */}
                <motion.div
                    key={`${selectedMode.id}-description`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center px-4 max-w-3xl"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    <motion.p
                        className="text-3xl mb-3 bg-gradient-to-r from-white to-neutral-200 bg-clip-text text-transparent font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        {selectedMode.descriptionThai}
                    </motion.p>
                    <motion.p
                        className="text-lg bg-gradient-to-r from-neutral-300 to-neutral-400 bg-clip-text text-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        {selectedMode.descriptionEng}
                    </motion.p>
                </motion.div>
            </motion.div>

            {/* Enhanced Start Button */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-8 sm:mt-12 mb-10 sm:mb-20 flex justify-center w-full max-w-4xl relative z-10"
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.button
                        onClick={handleStartSelectedMode}
                        className="relative group focus:outline-none rounded-2xl cursor-pointer"
                        animate={{
                            boxShadow: [
                                "0 0 20px rgba(239, 68, 68, 0.3)",
                                "0 0 40px rgba(239, 68, 68, 0.6)",
                                "0 0 20px rgba(239, 68, 68, 0.3)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {/* Glowing Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />

                        {/* Main Button */}
                        <div className="relative bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-6 px-16 rounded-2xl text-2xl shadow-2xl group-hover:from-red-400 group-hover:to-orange-400 transition-all duration-300 border border-white/20"
                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                            <span className="relative z-10">เลือกโหมดนี้</span>
                        </div>
                    </motion.button>
                </motion.div>
            </motion.div>
        </main>
    );
}

