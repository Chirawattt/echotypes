"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/stores/gameStore";
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaUser, FaSignOutAlt, FaGoogle, FaUserCircle, FaTrophy } from 'react-icons/fa';
import { useAuth } from '@/providers/AuthContext';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { session, status, signIn, signOut } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { globalCleanup } = useGameStore();

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Do not render header on the home page
    if (pathname === '/') {
        return null;
    }
    
    // Do not render back button on the home page and on the sign-in page
    if (pathname === '/auth/signin') {
        return null;
    }


    const handleBackClick = () => {
        // Clear all localStorage game data
        if (typeof window !== 'undefined') {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('-timeSpent')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        // Cancel any pending speech
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        
        // Reset all game state
        globalCleanup();
        
        // Navigate back in history
        router.back();
    };

    const handleHomeClick = () => {
        // Clear all localStorage game data
        if (typeof window !== 'undefined') {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('-timeSpent')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        // Cancel any pending speech
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        
        // Reset all game state
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
                >
                    Back
                </span>
            </motion.button>

            {/* Logo - Center */}
            <div
                className="absolute left-1/2 transform -translate-x-1/2 text-3xl opacity-60 cursor-pointer hover:opacity-100 transition-opacity duration-300"
                onClick={handleHomeClick}
                title="Go to Home Page"
            >
                EchoTypes
            </div>

            {/* Authentication Section - Right */}
            <div className="flex items-center space-x-4">
                {status === "loading" ? (
                    <motion.div 
                        className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                ) : session ? (
                    <div className="relative" ref={userMenuRef}>
                        {/* User Avatar - Clickable */}
                        <motion.button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-colors duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {session.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user?.name || 'User'}
                                    width={36}
                                    height={36}
                                    className="rounded-full border-2 border-white/30 hover:border-white/50 transition-colors duration-300"
                                />
                            ) : (
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white/30 hover:border-white/50 transition-colors duration-300">
                                    <FaUser className="text-white text-sm" />
                                </div>
                            )}
                        </motion.button>

                        {/* User Dropdown Menu */}
                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 overflow-hidden z-50"
                                >
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-200/20">
                                        <p 
                                            className="text-gray-800 font-medium text-sm"
                                        >
                                            {session.user?.name || 'User'}
                                        </p>
                                        <p className="text-gray-600 text-xs mt-1">
                                            {session.user?.email}
                                        </p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                router.push('/profile');
                                            }}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 text-left"
                                        >
                                            <FaUserCircle className="text-sm" />
                                            <span 
                                                className="text-sm font-medium"
                                            >
                                                Profile
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                router.push('/leaderboard');
                                            }}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors duration-200 text-left"
                                        >
                                            <FaTrophy className="text-sm" />
                                            <span 
                                                className="text-sm font-medium"
                                            >
                                                Leaderboard
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                signOut();
                                            }}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 text-left"
                                        >
                                            <FaSignOutAlt className="text-sm" />
                                            <span 
                                                className="text-sm font-medium"
                                            >
                                                Sign Out
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* Login Button */
                    <motion.button
                        onClick={signIn}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <FaGoogle className="text-sm" />
                        <span 
                            className="text-sm font-medium"
                        >
                            Sign In
                        </span>
                    </motion.button>
                )}
            </div>
        </header>
    );
} 