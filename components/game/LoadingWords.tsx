"use client";

import { motion } from 'framer-motion';

export default function LoadingWords() {
    return (
        <div className="relative min-h-screen bg-black flex items-center justify-center">
            {/* Subtle Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gray-300 rounded-full blur-xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    }}
                />
            </div>

            {/* Loading Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center z-10"
            >
                {/* Title */}
                <motion.h1
                    className="text-4xl md:text-6xl font-bold text-white mb-8"
                    style={{ fontFamily: "'Caveat Brush', cursive" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Loading Words
                </motion.h1>

                {/* Loading Animation */}
                <div className="flex justify-center items-center space-x-2 mb-6">
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="w-4 h-4 bg-white rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: index * 0.2,
                            }}
                        />
                    ))}
                </div>

                {/* Loading Text */}
                <motion.p
                    className="text-white/70 text-lg"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                    animate={{
                        opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                >
                    Preparing your vocabulary challenge...
                </motion.p>

                {/* Progress Indicator */}
                <motion.div
                    className="mt-8 w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.div
                        className="h-full bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: 2,
                            ease: "easeInOut",
                            repeat: Infinity,
                        }}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}