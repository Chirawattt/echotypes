"use client";

import { motion } from "framer-motion";
import { FaKeyboard, FaBook, FaTag } from "react-icons/fa";
import NitroBar from "../NitroBar";
import { HeatLevel } from "@/hooks/useOverdriveSystem";
import AnimatedNumber from "../AnimatedNumber";
import { Word } from "@/lib/types";

interface TypingModeProps {
  currentWordObject: Word;
  currentWordIndex: number;
  isTransitioning: boolean;
  // Nitro energy props
  energy?: number;
  maxEnergy?: number;
  isLowEnergy?: boolean;
  gameStyle: "practice" | "challenge";
  // Heat level props
  heatLevel?: HeatLevel;
  correctWordsCount?: number;
  // Challenge Mode scoring props
  totalChallengeScore?: number;
  streakCount?: number;
  // Point change notification props
  lastScoreChange?: number;
  scoreChangeCounter?: number;
}

export default function TypingMode({
  currentWordObject,
  currentWordIndex,
  isTransitioning,
  energy,
  maxEnergy,
  isLowEnergy,
  gameStyle,
  heatLevel,
  correctWordsCount,
  totalChallengeScore,
  streakCount,
}: TypingModeProps) {
  // Function to get score color based on streak level
  const getScoreColorByStreak = (streak: number) => {
    if (streak >= 20)
      return "text-yellow-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"; // Unstoppable!
    if (streak >= 10)
      return "text-orange-300 drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]"; // In The Zone!
    if (streak >= 5)
      return "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]"; // On a Roll!
    if (streak >= 2)
      return "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]"; // Warming Up!
    return "text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]"; // Default
  };

  // Don't show any content during DDA transition
  if (isTransitioning) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center text-center mb-3 max-w-4xl"
      >
        {/* Heat Level Display during transition */}
        {gameStyle === "challenge" && heatLevel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.7, y: 0 }}
            className="mb-4 flex items-center justify-center gap-4 px-4 py-2 rounded-lg backdrop-blur-sm bg-black/20 border border-white/10"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-white/50 font-medium">
                Heat Level:
              </span>
              <span
                className={`text-sm sm:text-base font-bold ${heatLevel.color} opacity-70`}
              >
                {heatLevel.name}
              </span>
            </div>

            {correctWordsCount !== undefined && (
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-70">
                <span className="text-white/40">Words:</span>
                <span className="font-bold text-green-400/70">
                  {correctWordsCount}
                </span>
              </div>
            )}
          </motion.div>
        )}

        <div className="mb-3">
          <FaKeyboard className="text-3xl sm:text-4xl lg:text-5xl text-green-400/50 mx-auto mb-2" />
        </div>
        <div className="mb-3">
          <p
            className="text-green-300/50 text-sm sm:text-base lg:text-lg mb-2 font-medium"
            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
          >
            🔄 Transitioning...
          </p>
          <p
            className="text-white/20 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold"
            style={{ fontFamily: "'Caveat Brush', cursive" }}
          >
            ●●●●●
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center mb-3 max-w-4xl">
      {/* Nitro Bar for Typing Challenge Mode - Outside motion.div to prevent re-render */}
      {gameStyle === "challenge" &&
        energy !== undefined &&
        maxEnergy !== undefined &&
        isLowEnergy !== undefined && (
          <NitroBar
            energy={energy}
            maxEnergy={maxEnergy}
            isLowEnergy={isLowEnergy}
            heatLevel={heatLevel}
          />
        )}

      {/* Points Display - for Typing Challenge Mode */}
      {gameStyle === "challenge" &&
        totalChallengeScore !== undefined &&
        streakCount !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-lg p-1 sm:p-2 mb-2 sm:mb-4 text-center"
          >
            <motion.p
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${getScoreColorByStreak(
                streakCount
              )}`}
              animate={
                streakCount >= 5
                  ? {
                      scale: [1, 1.05, 1],
                      textShadow: [
                        "0 0 10px rgba(250,204,21,0.5)",
                        "0 0 20px rgba(250,204,21,0.8)",
                        "0 0 10px rgba(250,204,21,0.5)",
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: streakCount >= 5 ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <AnimatedNumber value={totalChallengeScore || 0} duration={0.6} />{" "}
              pts.
            </motion.p>
          </motion.div>
        )}


      {/* Heat Level Display for Typing Challenge Mode */}
      {gameStyle === "challenge" && heatLevel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-center gap-4 px-4 py-2 rounded-lg backdrop-blur-sm bg-black/20 border border-white/10"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-white/70 font-medium">
              Heat Level:
            </span>
            <motion.span
              className={`text-sm sm:text-base font-bold ${heatLevel.color}`}
              animate={
                heatLevel.level >= 3
                  ? {
                      textShadow: [
                        "0 0 5px currentColor",
                        "0 0 15px currentColor",
                        "0 0 5px currentColor",
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 0.8,
                repeat: heatLevel.level >= 3 ? Infinity : 0,
              }}
            >
              {heatLevel.name}
            </motion.span>
            {heatLevel.level >= 3 && (
              <motion.span
                className="text-orange-400"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                }}
              >
                🔥
              </motion.span>
            )}
            {heatLevel.level === 4 && (
              <motion.span
                className="text-red-500"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                }}
              >
                ⚡
              </motion.span>
            )}
          </div>

          {correctWordsCount !== undefined && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-white/50">Words:</span>
              <motion.span
                className="font-bold text-green-400"
                key={correctWordsCount}
                initial={{ scale: 1.2, color: "#4ade80" }}
                animate={{ scale: 1, color: "#4ade80" }}
                transition={{ duration: 0.3 }}
              >
                {correctWordsCount}
              </motion.span>
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        key={`${currentWordIndex}-typing`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        {/* Main Word Display */}
        <div className="mb-2">
          <p className="text-white text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold">
            {currentWordObject.word}
          </p>
        </div>

        {/* Word Type and Meaning */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 space-y-2 text-center max-w-lg"
        >
          {/* Word Type */}
          {currentWordObject.type && (
            <div className="flex items-center justify-center gap-2 text-amber-300">
              <FaTag className="text-sm" />
              <span className="text-sm sm:text-base font-medium capitalize">
                {currentWordObject.type}
              </span>
            </div>
          )}
          
          {/* Word Meaning */}
          <div className="flex items-center justify-center gap-2 text-blue-300">
            <FaBook className="text-sm" />
            <span className="text-sm sm:text-base font-medium">
              {currentWordObject.meaning}
            </span>
          </div>
        </motion.div>

        {/* Game Mode Instructions */}
        <p className="text-neutral-400 text-xs sm:text-sm lg:text-base">
          {gameStyle === "challenge"
            ? "Keep your energy up! 🔋⚡"
            : "Speed and accuracy matter! 🏃‍♂️💨"}
        </p>
      </motion.div>
    </div>
  );
}
