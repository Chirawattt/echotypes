"use client";

import { FaPlay } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Import useRouter

export default function Home() {
  const router = useRouter(); // Initialize useRouter

  const handleStartGame = () => {
    // Navigate to the game page or another page
    // For now, let's log to console or navigate to a placeholder
    router.push('/mode-select');
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#101010] text-white">
      {/* Centered Content */}
      <div className="flex-grow flex flex-col items-center justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-8xl font-bold" style={{ fontFamily: "'Caveat Brush', cursive" }}>
            EchoTypes
          </h1>
          <p className="text-2xl mt-4 opacity-85" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>เกมฝึกคำศัพท์ภาษาอังกฤษ</p>
        </motion.div>
      </div>

      {/* Bottom Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }} // Changed y to 50 for upward animation
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center mb-20" // Added padding-bottom
      >
        <button
          onClick={handleStartGame}
          className="focus:outline-none hover:scale-80 transition-transform duration-750 ease-in-out"
          title="Start Game"
          aria-label="Start game"
        >
          <FaPlay className="text-red-500 text-7xl md:text-8xl cursor-pointer hover:text-red-400 transition-colors" />
        </button>
        <p className="mt-3 md:mt-4 text-base md:text-lg opacity-65" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>(กดปุ่มเพื่อเริ่มเกม)</p>
      </motion.div>
    </main>
  );
}
