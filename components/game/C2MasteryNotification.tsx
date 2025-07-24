"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaStar, FaPlay, FaHome } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface C2MasteryNotificationProps {
    show: boolean;
    totalWordsPlayed: number;
    streakCount: number;
    onContinue: () => void;
    onClose: () => void;
}

export default function C2MasteryNotification({ 
    show, 
    totalWordsPlayed, 
    streakCount, 
    onContinue, 
    onClose 
}: C2MasteryNotificationProps) {
    const router = useRouter();

    const handleGoHome = () => {
        onClose();
        router.push('/');
    };

    const handleNewMode = () => {
        onClose();
        router.push('/play');
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ 
                            type: "spring", 
                            damping: 25, 
                            stiffness: 300,
                            duration: 0.6 
                        }}
                        className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg border border-yellow-400/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
                    >
                        {/* Trophy Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                            className="mb-6"
                        >
                            <FaTrophy className="text-6xl text-yellow-400 mx-auto mb-4" />
                        </motion.div>

                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-3xl font-bold text-yellow-300 mb-4"
                        >
                            🎉 C2 Master! 🎉
                        </motion.h2>

                        {/* Achievement Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="mb-6 space-y-3"
                        >
                            <div className="flex items-center justify-center gap-3 text-white">
                                <FaStar className="text-yellow-400" />
                                <span className="text-lg">คำที่เล่นแล้ว: <strong>{totalWordsPlayed}</strong></span>
                            </div>
                            <div className="flex items-center justify-center gap-3 text-white">
                                <FaStar className="text-yellow-400" />
                                <span className="text-lg">Streak ปัจจุบัน: <strong>{streakCount}</strong></span>
                            </div>
                        </motion.div>

                        {/* Message */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="text-yellow-200 text-lg mb-8"
                        >
                            คุณได้เข้าถึงระดับสูงสุดแล้ว! <br />
                            ต้องการทำอะไรต่อไป?
                        </motion.p>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="space-y-3"
                        >
                            {/* Continue Playing */}
                            <button
                                onClick={onContinue}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 font-medium"
                            >
                                <FaPlay />
                                เล่นต่อที่ C2
                            </button>

                            {/* Try Different Mode */}
                            <button
                                onClick={handleNewMode}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 font-medium"
                            >
                                <FaStar />
                                ลองโหมดอื่น
                            </button>

                            {/* Go Home */}
                            <button
                                onClick={handleGoHome}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg font-medium"
                            >
                                <FaHome />
                                กลับหน้าหลัก
                            </button>
                        </motion.div>

                        {/* Note */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="text-yellow-300/60 text-sm mt-6"
                        >
                            * หากเล่นต่อ คำศัพท์จะผสมระดับ C1-C2 เพื่อความหลากหลาย
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}