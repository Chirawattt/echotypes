"use client";

import { FaPlay, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import WelcomeBackToast from "@/components/ui/WelcomeBackToast";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [userRegistered, setUserRegistered] = useState<boolean | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    if (status === 'loading' || isRedirecting) return;
    
    if (!session) {
      setIsRedirecting(true);
      router.push('/auth/signin');
      return;
    }

    checkUserRegistration();
  }, [session, status, isRedirecting]);

  // Detect fresh login from URL parameter
  useEffect(() => {
    if (session && status === 'authenticated' && !hasShownWelcome) {
      const loginTimestamp = searchParams.get('loginTimestamp');
      
      if (loginTimestamp) {
        const now = Date.now();
        const loginTime = parseInt(loginTimestamp);
        
        // If less than 60 seconds since login, show welcome toast
        if (now - loginTime < 60000) {
          setShowWelcomeToast(true);
          setHasShownWelcome(true);
          
          // Clean up URL by removing the timestamp parameter
          const url = new URL(window.location.href);
          url.searchParams.delete('loginTimestamp');
          window.history.replaceState({}, '', url.toString());
        }
      }
    }
  }, [session, status, hasShownWelcome, searchParams]);

  const checkUserRegistration = async () => {
    try {
      const response = await fetch('/api/auth/register');
      const result = await response.json();
      setUserRegistered(result.registered);
      
      if (!result.registered) {
        setIsRedirecting(true);
        router.push('/auth/signup');
      }
    } catch (error) {
      console.error('Error checking user registration:', error);
      setIsRedirecting(true);
      router.push('/auth/signup');
    }
  };

  const handleStartGame = () => {
    router.push('/play');
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  const handleCloseWelcomeToast = () => {
    setShowWelcomeToast(false);
  };

  // Show loading while checking authentication and registration
  if (status === 'loading' || userRegistered === null) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-black to-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden relative">
      {/* Welcome Back Toast */}
      <WelcomeBackToast
        show={showWelcomeToast}
        userName={session?.user?.name || undefined}
        onClose={handleCloseWelcomeToast}
      />
      
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
          className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-xl"
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
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"
        />
      </div>

      {/* Main Content - Centered and Spacious */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 relative z-10">
        
        {/* Hero Section - More Space */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h1
            className="text-8xl sm:text-9xl lg:text-[8rem] font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent py-10"
            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            EchoTypes
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-4"
          >
            <p className="text-3xl sm:text-4xl text-slate-300 font-medium" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
              เกมฝึกคำศัพท์ภาษาอังกฤษ
            </p>
            <p className="text-xl text-slate-400 max-w-xl mx-auto" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
              Learn English vocabulary through interactive games
            </p>
          </motion.div>
        </motion.div>

        {/* Action Buttons - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-8 items-center mb-16"
        >
          {/* Main Play Button - Bigger and More Prominent */}
          <motion.button
            onClick={handleStartGame}
            className="group relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-6 px-16 rounded-3xl text-2xl backdrop-blur-sm border border-emerald-400/30 transition-all duration-300 shadow-lg flex items-center gap-4">
              <FaPlay className="text-xl" />
              <span style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>เริ่มเล่น</span>
            </div>
          </motion.button>

          {/* Profile Button - Smaller, Secondary */}
          <motion.button
            onClick={handleViewProfile}
            className="bg-white/5 backdrop-blur-md hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-2xl text-lg border border-white/15 hover:border-white/25 transition-all duration-300 flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
          >
            <FaUser className="text-lg" />
            <span>โปรไฟล์</span>
          </motion.button>
        </motion.div>

        {/* Welcome Message - Subtle */}
        {session?.user?.name && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-center"
          >
            <p className="text-lg text-slate-400" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
              Welcome back, <span className="font-semibold text-emerald-400">{session.user.name}</span>
            </p>
          </motion.div>
        )}
      </div>

      {/* Simple Footer - Minimal Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="text-center pb-12 relative z-10"
      >
        <p className="text-sm text-slate-500" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
          Three learning modes • CEFR A1-C2 levels
        </p>
      </motion.div>
    </main>
  );
}