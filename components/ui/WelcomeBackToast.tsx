import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaStar } from 'react-icons/fa';

interface WelcomeBackToastProps {
    show: boolean;
    userName?: string;
    onClose: () => void;
}

export default function WelcomeBackToast({ show, userName, onClose }: WelcomeBackToastProps) {
    // Auto-hide after 5 seconds
    React.useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 max-w-sm z-50">
            <AnimatePresence mode="wait">
                {show && (
                    <motion.div
                        key="welcome-toast"
                        initial={{ opacity: 0, scale: 0.8, y: -100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ 
                            opacity: 0, 
                            scale: 0.8, 
                            y: -100,
                            transition: { duration: 0.3, ease: "easeInOut" }
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut"
                        }}
                        className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-400/30 rounded-2xl p-4 shadow-2xl"
                        onClick={onClose}
                    >
                        {/* Header with Icon */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="flex items-center gap-3 mb-3"
                        >
                            <div className="relative">
                                <FaUserCircle className="text-2xl text-green-400" />
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                    className="absolute -top-1 -right-1"
                                >
                                    <FaStar className="text-yellow-400 text-sm" />
                                </motion.div>
                            </div>
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="text-lg font-bold text-green-300"
                                style={{ fontFamily: "'Caveat Brush', cursive" }}
                            >
                                Welcome Back!
                            </motion.h3>
                        </motion.div>

                        {/* Welcome Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className="space-y-2"
                        >
                            <p 
                                className="text-white font-medium"
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                {userName ? `สวัสดี ${userName}!` : 'สวัสดีครับ!'}
                            </p>
                            <p 
                                className="text-green-200/80 text-sm"
                                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                            >
                                พร้อมฝึกคำศัพท์ภาษาอังกฤษแล้วหรือยัง? 🎯
                            </p>
                        </motion.div>

                        {/* Progress Bar Animation */}
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5, ease: "linear" }}
                            className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-4"
                        />

                        {/* Close Hint */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                            className="text-xs text-green-300/60 mt-2 text-center"
                            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                        >
                            กดเพื่อปิด
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}