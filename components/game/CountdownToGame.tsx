"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/stores/gameStore";

interface CountdownToGameProps {
  className?: string;
}

export default function CountdownToGame({
  className = "",
}: CountdownToGameProps) {
  const { countdown } = useGameStore();

  return (
  <section
      className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 overflow-hidden relative ${className}`}
    >
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            rotate: 180,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-orange-500/8 to-red-500/8 rounded-full blur-xl"
        />
      </div>

      {/* Header Text */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 py-2">
          Get Ready!
        </h1>
        <p className="text-xl text-slate-300">เกมจะเริ่มใน...</p>
      </motion.div>

      {/* Enhanced Countdown Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative flex items-center justify-center mb-12 z-10"
        style={{ height: "300px" }}
      >
        {/* Multiple Pulsing Rings */}
        <motion.div
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.4, 0.1, 0.4],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute w-80 h-80 border-2 border-emerald-400/30 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 2, 1.2],
            opacity: [0.3, 0.05, 0.3],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          className="absolute w-96 h-96 border border-blue-400/20 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.4, 2.2, 1.4],
            opacity: [0.2, 0.03, 0.2],
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          className="absolute w-[28rem] h-[28rem] border border-purple-400/15 rounded-full"
        />

        {/* Main Countdown Number */}
        <AnimatePresence>
          <motion.div
            key={countdown}
            initial={{
              opacity: 0,
              scale: 0.3,
              rotateY: 90,
              z: -100,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateY: 0,
              z: 0,
            }}
            exit={{
              opacity: 0,
              scale: 1.5,
              rotateY: -90,
              z: 100,
              position: "absolute",
            }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              scale: { duration: 0.6 },
              rotateY: { duration: 0.8 },
            }}
            className="absolute"
          >
            <div className="relative">
              {/* Number Glow Effect */}
              <div className="absolute inset-0 text-[200px] sm:text-[250px] lg:text-[300px] font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent blur-sm opacity-50 scale-110">
                {countdown}
              </div>

              {/* Main Number */}
              <div className="relative text-[200px] sm:text-[250px] lg:text-[300px] font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
                {countdown}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Particle Effects */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
            animate={{
              x: [0, Math.cos((i * 45 * Math.PI) / 180) * 150],
              y: [0, Math.sin((i * 45 * Math.PI) / 180) * 150],
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>

      {/* Enhanced Bottom Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-center relative z-10"
      >
        <div className="text-2xl sm:text-3xl text-slate-300 mb-4 font-medium">
          🎮 เกมจะเริ่มในไม่ช้า...
        </div>
        <div className="text-lg text-slate-400">
          เตรียมพร้อมสำหรับความท้าทาย!
        </div>
      </motion.div>

      {/* Floating Action Indicators */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="flex justify-center mt-8 space-x-4 relative z-10"
      >
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </motion.div>
  </section>
  );
}
