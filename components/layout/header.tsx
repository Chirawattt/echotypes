"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { globalCleanup } from "@/lib/cleanup";
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();

    // Do not render header on the home page
    if (pathname === '/') {
        return null;
    }

    const handleBackClick = () => {
        // Clean up all audio, timers, speech synthesis, and state
        globalCleanup();
        
        // Navigate back in history
        router.back();
    };

    const handleHomeClick = () => {
        // Clean up all audio, timers, speech synthesis, and state
        globalCleanup();
        
        // Navigate to home page
        router.push('/');
    };

    return (
        <header className="w-full flex justify-between items-center py-4 sm:py-6 absolute top-0 left-1/2 transform -translate-x-1/2 z-50 px-4 sm:px-6 max-w-5xl">

            {/* Back Button */}
            <motion.button
                onClick={handleBackClick}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-300 group py-3 px-4 -mx-4 rounded-lg hover:bg-white/5"
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <FaArrowLeft className="text-lg group-hover:text-red-400 transition-colors duration-300" />
                <span
                    className="text-lg font-medium group-hover:text-red-400 transition-colors duration-300"
                    style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
                >
                    Back
                </span>
            </motion.button>

            {/* Logo - Center */}
            <div
                className="absolute left-1/2 transform -translate-x-1/2 text-3xl opacity-60 cursor-pointer hover:opacity-100 transition-opacity duration-300"
                style={{ fontFamily: "'Caveat Brush', cursive" }}
                onClick={handleHomeClick}
                title="Go to Home Page"
            >
                EchoTypes
            </div>

            {/* Right spacer to balance layout */}
            <div className="w-[120px]"></div>
        </header>
    );
} 