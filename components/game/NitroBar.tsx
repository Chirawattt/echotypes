"use client";

import { motion } from "framer-motion";
import { HeatLevel } from "@/hooks/useOverdriveSystem";

interface NitroBarProps {
  energy: number;
  maxEnergy: number;
  isLowEnergy: boolean;
  heatLevel?: HeatLevel;
  isOverdriveTransitioning?: boolean;
}

export default function NitroBar({
  energy,
  maxEnergy,
  isLowEnergy,
  heatLevel,
}: NitroBarProps) {
  // Calculate energy percentage
  const energyPercentage = Math.max(0, (energy / maxEnergy) * 100);

  // Use heat level colors or default to normal colors
  const barGradient =
    heatLevel?.bgColor || "from-blue-500 via-blue-400 to-blue-500";
  const bgColor = isLowEnergy
    ? "bg-red-500/20 text-red-300"
    : heatLevel?.level && heatLevel.level > 2
    ? "bg-red-500/20 text-red-300"
    : "bg-blue-500/20 text-blue-300";

  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
      {/* Nitro Bar Label */}
      <div className="flex justify-between items-center mb-2">
        <motion.h3
          className="text-lg sm:text-xl font-bold text-white"
          style={{ fontFamily: "'Caveat Brush', cursive" }}
          animate={
            isLowEnergy
              ? {
                  color: ["#ef4444", "#ffffff", "#ef4444"],
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={{ duration: 0.5, repeat: isLowEnergy ? Infinity : 0 }}
        >
          ⚡ NITRO ENERGY
        </motion.h3>
        <motion.div
          className={`text-sm sm:text-base font-medium px-2 py-1 rounded ${bgColor}`}
          animate={
            isLowEnergy || (heatLevel?.level && heatLevel.level > 2)
              ? {
                  backgroundColor: [
                    "rgba(239, 68, 68, 0.2)",
                    "rgba(239, 68, 68, 0.4)",
                    "rgba(239, 68, 68, 0.2)",
                  ],
                  scale: [1, 1.05],
                }
              : {
                  scale: 1,
                }
          }
          transition={{
            backgroundColor: {
              duration: 0.3,
              repeat:
                isLowEnergy || (heatLevel?.level && heatLevel.level > 2)
                  ? Infinity
                  : 0,
            },
            scale: {
              duration: 0.3,
              repeat:
                isLowEnergy || (heatLevel?.level && heatLevel.level > 2)
                  ? Infinity
                  : 0,
              repeatType: "reverse",
            },
          }}
        >
          {Math.round(energy)} pts
        </motion.div>
      </div>

      {/* Nitro Bar Container */}
      <div className="relative">
        {/* Background Bar */}
        <div className="w-full h-6 sm:h-8 bg-gray-800/50 rounded-full border-2 border-gray-600/50 overflow-hidden">
          {/* Energy Fill */}
          <motion.div
            className={`h-full rounded-full relative bg-gradient-to-r ${barGradient}`}
            animate={{
              width: `${energyPercentage}%`,
              opacity:
                isLowEnergy || heatLevel?.effects.hasPulse ? [0.6, 1, 0.6] : 1,
              scale: heatLevel?.effects.hasShake ? [1, 1.002, 1] : 1,
              boxShadow: isLowEnergy
                ? [
                    "0 0 10px rgba(239, 68, 68, 0.5)",
                    "0 0 20px rgba(239, 68, 68, 0.8)",
                    "0 0 10px rgba(239, 68, 68, 0.5)",
                  ]
                : heatLevel?.level === 4
                ? [
                    "0 0 15px rgba(255, 69, 0, 0.8)",
                    "0 0 30px rgba(255, 165, 0, 0.6)",
                    "0 0 15px rgba(255, 69, 0, 0.8)",
                  ]
                : heatLevel?.level === 3
                ? ["0 0 10px rgba(239, 68, 68, 0.6)"]
                : heatLevel?.level === 2
                ? ["0 0 10px rgba(251, 146, 60, 0.6)"]
                : ["0 0 10px rgba(59, 130, 246, 0.5)"],
            }}
            transition={{
              width: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                mass: 0.8,
              },
              opacity: {
                duration: isLowEnergy || heatLevel?.effects.hasPulse ? 0.4 : 1,
                repeat:
                  isLowEnergy || heatLevel?.effects.hasPulse ? Infinity : 0,
              },
              scale: {
                duration: heatLevel?.effects.hasShake ? 0.1 : 1,
                repeat: heatLevel?.effects.hasShake ? Infinity : 0,
              },
              boxShadow: {
                duration:
                  isLowEnergy || (heatLevel?.level && heatLevel.level > 2)
                    ? 0.4
                    : 1,
                repeat:
                  isLowEnergy || (heatLevel?.level && heatLevel.level > 2)
                    ? Infinity
                    : 0,
              },
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse" />
          </motion.div>
        </div>

        {/* Critical Warning Overlay */}
        {isLowEnergy && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0, 0.3, 0],
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            <div className="w-full h-6 sm:h-8 bg-red-500/30 rounded-full border-2 border-red-400/50" />
          </motion.div>
        )}

        {/* Energy level markers */}
        <div className="absolute inset-0 flex justify-between items-center px-1">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-0.5 h-2 sm:h-3 bg-gray-500/30" />
          ))}
        </div>
      </div>

      {/* Critical Warning Text */}
      {isLowEnergy && (
        <motion.div
          className="text-center mt-2"
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          <span
            className="text-red-400 font-bold text-sm sm:text-base"
            style={{ fontFamily: "'Caveat Brush', cursive" }}
          >
            ⚠️ CRITICAL ENERGY LEVEL! ⚠️
          </span>
        </motion.div>
      )}

      <source src="/sounds/incorrect.mp3" type="audio/mpeg" />
    </div>
  );
}
