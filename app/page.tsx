"use client";

import { FaPlay, FaKeyboard, FaBrain, FaVolumeUp, FaLightbulb } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Import useRouter

export default function Home() {
  const router = useRouter(); // Initialize useRouter

  const handleStartGame = () => {
    // Navigate to the game page or another page
    // For now, let's log to console or navigate to a placeholder
    router.push('/play');
  };

  const gameFeatures = [
    { icon: FaKeyboard, label: "Typing", color: "text-green-400" },
    { icon: FaBrain, label: "Memory", color: "text-purple-400" },
    { icon: FaVolumeUp, label: "Echo", color: "text-blue-400" },
    { icon: FaLightbulb, label: "Meaning", color: "text-amber-400" }
  ];

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#1A0A1A] text-white overflow-hidden relative">
      {/* Animated Background Elements */}
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
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-xl"
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
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
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

      {/* Centered Content */}
      <div className="flex-grow flex flex-col items-center justify-center pt-8 px-4 relative z-10 ">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-8xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-2xl pb-4"
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
            EchoTypes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-3xl mt-2 bg-gradient-to-r from-neutral-300 to-neutral-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
          >
            เกมฝึกคำศัพท์ภาษาอังกฤษ
          </motion.p>
        </motion.div>

        {/* Game Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {gameFeatures.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <feature.icon className={`text-3xl md:text-4xl ${feature.color} mb-2`} />
              <span className="text-sm md:text-base text-neutral-300 font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                {feature.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Enhanced Bottom Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="text-center mb-20 relative z-10"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <motion.button
            onClick={handleStartGame}
            className="relative group focus:outline-none rounded-full border border-red-500 hover:border-red-600 transition-all duration-300"
            title="Start Game"
            aria-label="Start game"
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
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />

            {/* Main Button */}
            <div className="relative bg-gradient-to-r from-red-500 to-orange-500 p-6 md:p-8 rounded-full shadow-2xl group-hover:from-red-400 group-hover:to-orange-400 transition-all duration-300">
              <FaPlay className="text-white text-6xl md:text-7xl transform group-hover:scale-110 transition-transform duration-300" />
            </div>
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-6 text-lg md:text-xl text-neutral-400 group-hover:text-neutral-300 transition-colors"
          style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
        >
          <span className="bg-gradient-to-r from-neutral-400 to-neutral-300 bg-clip-text text-transparent">
            กดปุ่มเพื่อเริ่มการเล่น
          </span>
        </motion.p>

        {/* Additional Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-4"
        >
          <p className="text-sm text-neutral-500" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
            ฝึกฝนคำศัพท์ 4 รูปแบบ • A1-C2 Level
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
