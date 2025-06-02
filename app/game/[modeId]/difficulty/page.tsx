"use client";

import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
// Define a type for difficulty levels
interface DifficultyLevel {
    id: string;
    name: string;
    description: string;
    limitWords: number; // Limit words for the difficulty level
    highScore: number; // High score for the difficulty level
}

// Define available difficulty levels (example)
const difficultyLevels: DifficultyLevel[] = [
    {
        id: "easy",
        name: "Easy",
        description: "คำศัพท์สั้นๆ, คำที่ใช้บ่อยในชีวิตประจำวัน, ความเร็วในการป้อนข้อมูลช้าลง (ถ้ามีจับเวลา), มีคำใบ้ให้ง่ายขึ้นdddddddddddddddddddddddddddddd",
        limitWords: 25,
        highScore: 0
    },
    {
        id: "medium",
        name: "Medium",
        description: "คำศัพท์ที่ใช้บ่อยในชีวิตประจำวัน, ความเร็วในการป้อนข้อมูลปานกลาง, มีคำใบ้ให้ง่ายขึ้น",
        limitWords: 50,
        highScore: 0
    },
    {
        id: "hard",
        name: "Hard",
        description: "คำศัพท์ที่ยากขึ้น, ความเร็วในการป้อนข้อมูลสูงขึ้น, ไม่มีคำใบ้",
        limitWords: 100,
        highScore: 0
    },
    {
        id: "expert",
        name: "Expert",
        description: "คำศัพท์ที่ยากมาก, ความเร็วในการป้อนข้อมูลสูงสุด, ไม่มีคำใบ้",
        limitWords: 200,
        highScore: 0
    }
];

export default function DifficultySelectedPage() {
    const router = useRouter();
    const params = useParams();
    const modeId = params.modeId as string;

    const handleSelectDifficulty = (difficultyId: string) => {
        console.log(`Selected difficulty: ${difficultyId}`);
        // Navigate to the actual game screen
        router.push(`/game/${modeId}/${difficultyId}/how-to-play`); // Example route
        alert(`Selected difficulty: ${difficultyId}`);
    };

    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-[#101010] text-white pt-8 sm:pt-12 px-4 pb-16">
            {/* Navbar */}
            <nav className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-center items-center">
                <div
                    onClick={() => router.push('/')}
                    className="text-2xl sm:text-3xl font-bold cursor-pointer opacity-55 hover:opacity-100 transition-all duration-300"
                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                    title="Go to Home Page"
                    aria-label="Home Page"
                >
                    EchoTypes
                </div>
            </nav>

            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mt-20 sm:mt-24 mb-8 sm:mb-10" // Adjusted margins
            >
                <h2 className="text-4xl text-left opacity-80 font-bold" style={{ fontFamily: "'Caveat Brush', cursive" }}>Difficulty Level</h2>
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
                                        className="text-4xl sm:text-5xl text-white/90 mb-2 font-bold"
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
                                </div>
                            </div>
                        </motion.div>
                    ))
                }
            </div >
        </main >
    );
}