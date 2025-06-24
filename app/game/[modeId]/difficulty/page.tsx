"use client";

import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaClock } from "react-icons/fa";

// Define a type for difficulty levels
interface DifficultyLevel {
    id: string;
    name: string;
    description: string;
    limitWords: number; // Limit words for the difficulty level
    highScore: number; // High score for the difficulty level
    time?: { minutes: number; seconds: number };
}

// Define available difficulty levels (example)
const baseDifficultyLevels: Omit<DifficultyLevel, 'highScore' | 'time'>[] = [
    {
        id: "easy",
        name: "Easy",
        description: "คำศัพท์สั้นๆ, คำที่ใช้บ่อยในชีวิตประจำวัน, ความเร็วในการป้อนข้อมูลช้าลง (ถ้ามีจับเวลา), มีคำใบ้ให้ง่ายขึ้น",
        limitWords: 25,
    },
    {
        id: "medium",
        name: "Medium",
        description: "คำศัพท์ที่ใช้บ่อยในชีวิตประจำวัน, ความเร็วในการป้อนข้อมูลปานกลาง, มีคำใบ้ให้ง่ายขึ้น",
        limitWords: 50,
    },
    {
        id: "hard",
        name: "Hard",
        description: "คำศัพท์ที่ยากขึ้น, ความเร็วในการป้อนข้อมูลสูงขึ้น, ไม่มีคำใบ้",
        limitWords: 100,
    },
    {
        id: "expert",
        name: "Expert",
        description: "คำศัพท์ที่ยากมาก, ความเร็วในการป้อนข้อมูลสูงสุด, ไม่มีคำใบ้",
        limitWords: 200,
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
        <main className="flex flex-col items-center justify-start min-h-screen bg-[#101010] text-white pt-10 px-4">
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mt-20 sm:mt-24 mb-8 sm:mb-10" // Adjusted margins
            >
                <h2 className="text-5xl text-center opacity-80" style={{ fontFamily: "'Caveat Brush', cursive" }}>Difficulty Level</h2>
            </motion.div >

            {/* Difficulty Cards List */}
            <div className="w-full max-w-7xl space-y-8 px-7" > {/* Increased space-y for more gap */}
                {
                    difficultyLevels.map((level, index) => (
                        <motion.div
                            key={level.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }} // Added a bit more delay
                            onClick={() => handleSelectDifficulty(level.id)}
                            className="bg-neutral-800 p-6 sm:p-8 rounded-xl shadow-lg cursor-pointer hover:bg-neutral-700 transition-all duration-200 flex flex-col relative hover:scale-[1.02] active:scale-[1.01]" // Added relative for absolute positioning inside
                        >
                            {/* Limit Words - Absolute Positioned */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 px-3 py-1 rounded-md shadow-md">
                                <p className="text-sm sm:text-base text-white font-semibold" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                    Max: {level.limitWords} words
                                </p>
                            </div>

                            <div className="flex w-full items-start justify-between mt-4"> {/* Changed items-center to items-start */}
                                {/* Left Side: Level Name and Description */}
                                <div className="flex-1 pr-4">
                                    <h3
                                        className="text-4xl sm:text-5xl text-white/90 mb-2"
                                        style={{ fontFamily: "'Caveat Brush', cursive" }}
                                    >
                                        {level.name}
                                    </h3>
                                    <p className="text-md text-white/60 mt-3" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        {level.description}
                                    </p>
                                </div>

                                {/* Right Side: High Score */}
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm text-white/70" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                        High Score
                                    </p>
                                    <p className="text-3xl sm:text-4xl text-amber-400 font-bold" style={{ fontFamily: "'Caveat Brush', cursive" }}>
                                        {level.highScore}
                                    </p>
                                    {level.time && (
                                        <div className="flex items-center justify-end mt-1 text-sm text-amber-200/80" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                                            <FaClock className="mr-1.5" />
                                            <span>
                                                {String(level.time.minutes).padStart(2, '0')}m :{String(level.time.seconds).padStart(2, '0')}s
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                }
            </div >
        </main >
    );
}