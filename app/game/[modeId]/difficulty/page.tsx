"use client";

import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaClock } from "react-icons/fa";
import { getDifficultyInfo } from "@/lib/words-new";

// Define a type for difficulty levels
interface DifficultyLevel {
    id: string;
    name: string;
    level: string;
    description: string;
    highScore: number; // High score for the difficulty level
    time?: { minutes: number; seconds: number };
}

// Define available difficulty levels (example)
const baseDifficultyLevels: Omit<DifficultyLevel, 'highScore' | 'time'>[] = [
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
    },
    {
        id: "endless",
        name: "Endless Mode",
        level: "Endless",
        description: "ท้าทายตัวเองกับคำศัพท์จากทุกระดับ A1-C2 แบบไม่มีที่สิ้นสุด",
    }
];

export default function DifficultySelectedPage() {
    const router = useRouter();
    const params = useParams();
    const modeId = params.modeId as string;
    const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([]);

    useEffect(() => {
        const levelsWithScores = baseDifficultyLevels.map(level => {
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
        setDifficultyLevels(levelsWithScores);
    }, [modeId]);

    const handleSelectDifficulty = (difficultyId: string) => {
        // Navigate to the actual game screen
        router.push(`/game/${modeId}/${difficultyId}/how-to-play`); // Example route
    };

    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#1A0A1A] text-white pt-10 px-4 overflow-hidden relative">
            {/* Simplified Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        rotate: 360
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        rotate: -360
                    }}
                    transition={{
                        duration: 40,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-xl"
                />
            </div>

            {/* Simplified Title Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mt-10 sm:mt-14 mb-12 relative z-10"
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

            {/* Simplified Difficulty Cards */}
            <div className="w-full max-w-6xl space-y-4 px-4 relative z-10">
                {difficultyLevels.map((level, index) => (
                    <motion.div
                        key={level.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        onClick={() => handleSelectDifficulty(level.id)}
                        className="group cursor-pointer"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div className={`relative p-6 rounded-2xl shadow-lg transition-all duration-200 backdrop-blur-sm border ${level.id === 'endless'
                            ? 'bg-gradient-to-br from-purple-500/15 to-pink-500/10 border-purple-500/20 hover:from-purple-500/20 hover:to-pink-500/15'
                            : 'bg-gradient-to-br from-white/8 to-white/4 border-white/15 hover:from-white/12 hover:to-white/8'
                            } hover:shadow-xl`}
                        >
                            {/* Simplified Word Count Badge */}
                            <div className="absolute -top-2 left-6 space-x-3">
                                <div
                                    className={`px-2 py-1 rounded-full mb-2 text-xs ${level.id === 'endless'
                                        ? 'hidden'
                                        : 'bg-blue-500/85 text-white inline-block '
                                        }`}
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                >
                                    {level.level}
                                </div>
                                <div
                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${level.id === 'endless'
                                        ? 'bg-purple-600/80 text-purple-100'
                                        : 'bg-red-500/80 text-white'
                                        }`}
                                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                                >
                                    {level.id === 'endless' ? '∞ Endless' : `${getDifficultyInfo(level.id)?.wordCount} คำ`}

                                </div>
                            </div>

                            <div className="flex w-full justify-between mt-3">
                                {/* Left Side: Level Info */}
                                <div className="flex-1 pr-6">
                                    <h3
                                        className={`text-4xl font-bold py-2 ${level.id === 'endless'
                                            ? 'text-purple-300'
                                            : 'text-white'
                                            }`}
                                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                                    >
                                        {level.name}
                                    </h3>

                                    <p className="text-base text-neutral-300/80" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        {level.description}
                                    </p>
                                </div>

                                {/* Right Side: Simplified Score Display */}
                                <div className="text-right flex-shrink-0 bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                                    <p className="text-xs text-amber-300/80 mb-1" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        คะแนนสูงสุด
                                    </p>
                                    <p
                                        className="text-3xl text-amber-400 font-bold mb-1"
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
            </div>

            {/* Bottom Spacing */}
            <div className="h-16" />
        </main>
    );
}