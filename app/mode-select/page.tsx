"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaVolumeUp, FaKeyboard, FaBrain } from "react-icons/fa"; // Added more icons for potential future modes
import { Button } from "@/components/ui/button"; // Assuming you might want to use Shadcn Button later


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
        // Example: router.push(`/game/${selectedMode.id}`);
        // For now, let's navigate to a placeholder or back to home
        router.push(`/game/${selectedMode.id}/difficulty`); // Placeholder, you'll create this route
    }

    const isFirstMode = currentModeIndex === 0;
    const isLastMode = currentModeIndex === gameModes.length - 1;

    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-[#101010] text-white pt-10 px-4">
            {/* Mode Selecting Title */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-xl lg:max-w-7xl px-4 mt-20 sm:mt-24" // Increased top and bottom margin
            >
                <h2 className="text-5xl text-center opacity-80" style={{ fontFamily: "'Caveat Brush', cursive" }}>Mode Selecting</h2>
            </motion.div>

            {/* Mode Carousel */}
            <motion.div
                key={selectedMode.id} // Add key for re-animation on mode change
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-grow flex-col items-center justify-center w-full max-w-4xl"
            >
                {/* Mode Name */}
                <h3 className="text-4xl mb-5" style={{ fontFamily: selectedMode.fontFamily }}>
                    {selectedMode.name}
                </h3>

                {/* Selecter Container */}
                <div className="flex items-center justify-between w-full mb-12 sm:mb-16">
                    {/* Previous Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={handlePrevMode}
                        className="p-3 hover:scale-110 transition-all duration-300 focus:outline-none cursor-pointer"
                        aria-label="Previous Mode"
                        disabled={isFirstMode}
                        style={isFirstMode ? { pointerEvents: "none" } : {}}
                    >
                        <FaChevronLeft className={`text-9xl ${isFirstMode ? "opacity-0" : "opacity-75"} hover:opacity-100 transition-all duration-300`} />
                    </motion.button>

                    {/* Mode Details */}
                    <motion.div
                        key={`${selectedMode.id}-details`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex flex-col items-center text-center"
                    >
                        <selectedMode.icon className="text-[220px] mb-6" />
                    </motion.div>

                    {/* Next Button */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleNextMode}
                        className="p-3 hover:scale-110 transition-all duration-300 focus:outline-none cursor-pointer"
                        aria-label="Next Mode"
                        disabled={isLastMode}
                        style={isLastMode ? { pointerEvents: "none" } : {}}
                    >
                        <FaChevronRight className={`text-9xl ${isLastMode ? "opacity-0" : "opacity-75"} hover:opacity-100 transition-all duration-300`} />
                    </motion.button>

                </div>

                {/* Mode Description */}
                <motion.div
                    key={`${selectedMode.id}-description`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center  px-4" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    <p className="text-2xl mb-2">{selectedMode.descriptionThai}</p>
                    <p className="text-xl text-gray-300">{selectedMode.descriptionEng}</p>
                </motion.div>


            </motion.div>
            {/* Start Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 sm:mt-12 mb-10 sm:mb-20 flex justify-center w-full max-w-4xl"
            >
                <Button
                    onClick={handleStartSelectedMode}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-5 sm:py-7 px-10 sm:px-12 rounded-lg text-2xl transition-all shadow-lg hover:shadow-red-500/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    เลือกโหมดนี้
                </Button>
            </motion.div>
        </main >
    )
}

