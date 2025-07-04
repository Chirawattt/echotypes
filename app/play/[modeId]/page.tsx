"use client";

import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FaClock, FaArrowLeft, FaChevronDown, FaInfinity, FaGraduationCap } from "react-icons/fa";
import { getDifficultyInfo } from "@/lib/words-new";

// Define a type for difficulty levels
interface DifficultyLevel {
    id: string;
    name: string;
    level: string;
    description: string;
    highScore: number;
    time?: { minutes: number; seconds: number };
}

// Separate A1-C2 levels from endless
const standardDifficultyLevels: Omit<DifficultyLevel, 'highScore' | 'time'>[] = [
    {
        id: "a1",
        name: "A1 - Beginner",
        level: "Beginner",
        description: "คำศัพท์พื้นฐานที่ใช้ในชีวิตประจำวัน",
    },
    {
        id: "a2",
        name: "A2 - Elementary",
        level: "Elementary",
        description: "เข้าใจประโยคและสำนวนที่ใช้บ่อย",
    },
    {
        id: "b1",
        name: "B1 - Intermediate",
        level: "Intermediate",
        description: "สนทนาในหัวข้อที่คุ้นเคยและอธิบายความคิดได้",
    },
    {
        id: "b2",
        name: "B2 - Upper-Intermediate",
        level: "Upper-Intermediate",
        description: "เข้าใจเนื้อหาที่ซับซ้อนและสนทนาได้อย่างเป็นธรรมชาติ",
    },
    {
        id: "c1",
        name: "C1 - Advanced",
        level: "Advanced",
        description: "ใช้ภาษาได้อย่างยืดหยุ่นและมีประสิทธิภาพในเชิงสังคมและวิชาการ",
    },
    {
        id: "c2",
        name: "C2 - Proficient",
        level: "Proficient",
        description: "เข้าใจทุกสิ่งที่ได้ยินหรืออ่านได้อย่างง่ายดาย",
    }
];

export default function DifficultySelectedPage() {
    const router = useRouter();
    const params = useParams();
    const modeId = params.modeId as string;
    
    const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([]);
    const [endlessMode, setEndlessMode] = useState<DifficultyLevel | null>(null);
    const [showStandardLevels, setShowStandardLevels] = useState(false);

    useEffect(() => {
        // Process standard levels (A1-C2)
        const standardLevelsWithScores = standardDifficultyLevels.map(level => {
            const storedData = localStorage.getItem(`highScoreData_${modeId}_${level.id}`);
            if (storedData) {
                try {
                    const data = JSON.parse(storedData);
                    return { ...level, highScore: data.score || 0, time: data.time };
                } catch (e) {
                    console.error(`Failed to parse high score for ${level.id}`, e);
                }
            }
            return { ...level, highScore: 0 };
        });
        setDifficultyLevels(standardLevelsWithScores);

        // Process endless mode
        const endlessStoredData = localStorage.getItem(`highScoreData_${modeId}_endless`);
        let endlessScore = 0;
        let endlessTime;
        if (endlessStoredData) {
            try {
                const data = JSON.parse(endlessStoredData);
                endlessScore = data.score || 0;
                endlessTime = data.time;
            } catch (e) {
                console.error('Failed to parse endless mode high score', e);
            }
        }
        
        setEndlessMode({
            id: "endless",
            name: "Endless Mode",
            level: "Endless",
            description: "ท้าทายตัวเองกับคำศัพท์จากทุกระดับ A1-C2 แบบไม่มีที่สิ้นสุด",
            highScore: endlessScore,
            time: endlessTime
        });
    }, [modeId]);

    const handleSelectDifficulty = (difficultyId: string) => {
        router.push(`/play/${modeId}/${difficultyId}/pre-game`);
    };

    const handleGoBack = () => {
        router.back();
    };

    const toggleStandardLevels = () => {
        setShowStandardLevels(!showStandardLevels);
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

            {/* Title Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mb-10 relative z-10"
            >
                <h2
                    className="text-6xl text-center bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent mb-2 py-2"
                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                >
                    Choose Difficulty
                </h2>
                <p
                    className="text-xl text-center text-neutral-300"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    เลือกระดับความยากที่เหมาะกับคุณ
                </p>
            </motion.div>

            {/* Main Options Container */}
            <div className="w-full max-w-4xl space-y-6 px-4 relative z-10">
                
                {/* Endless Mode Card */}
                {endlessMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onClick={() => handleSelectDifficulty('endless')}
                        className="group cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="relative p-8 rounded-3xl shadow-2xl transition-all duration-300 backdrop-blur-sm border bg-gradient-to-br from-purple-500/20 to-pink-500/15 border-purple-500/30 hover:from-purple-500/25 hover:to-pink-500/20 hover:shadow-purple-500/20">
                            
                            {/* Endless Badge */}
                            <div className="absolute -top-3 left-8">
                                <div className="bg-purple-600/90 text-purple-100 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                    <FaInfinity className="inline mr-2" />
                                    Endless Challenge
                                </div>
                            </div>

                            <div className="flex w-full justify-between items-center mt-4">
                                {/* Left Side: Mode Info */}
                                <div className="flex-1 pr-6">
                                    <h3
                                        className="text-5xl font-bold py-2 text-purple-300 mb-2"
                                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                                    >
                                        {endlessMode.name}
                                    </h3>
                                    <p className="text-lg text-purple-200/90 mb-4" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        {endlessMode.description}
                                    </p>
                                    <div className="flex items-center space-x-2 text-purple-300">
                                        <FaInfinity className="text-xl" />
                                        <span className="text-sm font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                            Mixed A1-C2 Levels
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side: Score Display */}
                                <div className="text-right flex-shrink-0 bg-purple-500/20 rounded-2xl p-6 border border-purple-500/30">
                                    <p className="text-sm text-purple-300/80 mb-2" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        คะแนนสูงสุด
                                    </p>
                                    <p
                                        className="text-4xl text-purple-200 font-bold mb-2"
                                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                                    >
                                        {endlessMode.highScore}
                                    </p>
                                    {endlessMode.time && (
                                        <div
                                            className="flex items-center justify-end text-sm text-purple-300/80"
                                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                        >
                                            <FaClock className="mr-2 text-purple-400" />
                                            <span>
                                                {String(endlessMode.time.minutes).padStart(2, '0')}:{String(endlessMode.time.seconds).padStart(2, '0')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Standard Levels Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="space-y-4"
                >
                    {/* Standard Levels Toggle Button */}
                    <motion.button
                        onClick={toggleStandardLevels}
                        className="w-full group cursor-pointer"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div className="relative p-8 rounded-3xl shadow-xl transition-all duration-300 backdrop-blur-sm border bg-gradient-to-br from-blue-500/15 to-cyan-500/10 border-blue-500/25 hover:from-blue-500/20 hover:to-cyan-500/15 hover:shadow-blue-500/15">
                            
                            {/* Standard Badge */}
                            <div className="absolute -top-3 left-8">
                                <div className="bg-blue-600/90 text-blue-100 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                    <FaGraduationCap className="inline mr-2" />
                                    Standard Levels
                                </div>
                            </div>

                            <div className="flex w-full justify-between items-center mt-4">
                                {/* Left Side: Mode Info */}
                                <div className="flex-1 pr-6 text-left">
                                    <h3
                                        className="text-5xl font-bold py-2 text-blue-300 mb-2"
                                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                                    >
                                        Select Difficulty (A1-C2)
                                    </h3>
                                    <p className="text-lg text-blue-200/90 mb-4" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        เลือกระดับความยากตามมาตรฐาน CEFR จาก A1 ถึง C2
                                    </p>
                                    <div className="flex items-center space-x-2 text-blue-300">
                                        <FaGraduationCap className="text-xl" />
                                        <span className="text-sm font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                            6 Levels Available
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side: Toggle Icon */}
                                <div className="text-right flex-shrink-0">
                                    <motion.div
                                        animate={{ rotate: showStandardLevels ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-blue-500/20 rounded-2xl p-6 border border-blue-500/30"
                                    >
                                        <FaChevronDown className="text-3xl text-blue-300" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.button>

                    {/* Expandable Standard Levels */}
                    <AnimatePresence>
                        {showStandardLevels && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-3 pl-4 border-l-2 border-blue-500/30"
                            >
                                {difficultyLevels.map((level, index) => (
                                    <motion.div
                                        key={level.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        onClick={() => handleSelectDifficulty(level.id)}
                                        className="group cursor-pointer"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <div className="relative p-6 rounded-2xl shadow-lg transition-all duration-200 backdrop-blur-sm border bg-gradient-to-br from-white/8 to-white/4 border-white/15 hover:from-white/12 hover:to-white/8 hover:shadow-xl">
                                            
                                            {/* Level Badge */}
                                            <div className="absolute -top-2 left-6 space-x-3">
                                                <div
                                                    className="bg-blue-500/85 text-white inline-block px-3 py-1 rounded-full text-xs font-medium"
                                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                                >
                                                    {level.level}
                                                </div>
                                                <div
                                                    className="bg-green-500/80 text-white inline-block px-3 py-1 rounded-full text-xs font-medium"
                                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                                >
                                                    {getDifficultyInfo(level.id)?.wordCount} คำ
                                                </div>
                                            </div>

                                            <div className="flex w-full justify-between mt-3">
                                                {/* Left Side: Level Info */}
                                                <div className="flex-1 pr-6">
                                                    <h4
                                                        className="text-3xl font-bold py-2 text-white"
                                                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                                                    >
                                                        {level.name}
                                                    </h4>
                                                    <p className="text-sm text-neutral-300/80" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                                        {level.description}
                                                    </p>
                                                </div>

                                                {/* Right Side: Score Display */}
                                                <div className="text-right flex-shrink-0 bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                                                    <p className="text-xs text-amber-300/80 mb-1" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                                        คะแนนสูงสุด
                                                    </p>
                                                    <p
                                                        className="text-2xl text-amber-400 font-bold mb-1"
                                                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                                                    >
                                                        {level.highScore}
                                                    </p>
                                                    {level.time && (
                                                        <div
                                                            className="flex items-center justify-end text-xs text-amber-200/80"
                                                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                                        >
                                                            <FaClock className="mr-1 text-amber-400" />
                                                            <span>
                                                                {String(level.time.minutes).padStart(2, '0')}:{String(level.time.seconds).padStart(2, '0')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Bottom Spacing */}
            <div className="h-16" />
        </main>
    );
}
