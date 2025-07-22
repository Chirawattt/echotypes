"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUser, FaArrowLeft, FaCheck } from 'react-icons/fa';
import Image from 'next/image';

export default function SignUp() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingUser, setCheckingUser] = useState(true);

  const checkUserRegistration = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/register');
      const result = await response.json();
      
      if (result.registered) {
        // User already registered, redirect to home
        router.push('/');
        return;
      }
      
      // Pre-fill display name with Google name if available
      if (session?.user?.name) {
        setDisplayName(session.user.name);
      }
      
      setCheckingUser(false);
    } catch (error) {
      console.error('Error checking user registration:', error);
      setError('Failed to check registration status');
      setCheckingUser(false);
    }
  }, [session, router]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if user is already registered
    checkUserRegistration();
  }, [session, status, router, checkUserRegistration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Registration successful, redirect to home
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/auth/signin');
  };

  if (status === 'loading' || checkingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-neutral-900/90 to-slate-900/90 rounded-3xl shadow-2xl p-8 border border-neutral-700/50 backdrop-blur-sm">
          
          {/* Back Button */}
          <motion.button
            onClick={handleBack}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-300 mb-6 group"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft className="text-sm group-hover:text-blue-400 transition-colors duration-300" />
            <span className="text-sm font-medium group-hover:text-blue-400 transition-colors duration-300">
              Back
            </span>
          </motion.button>

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 
              className="text-4xl text-white mb-2"
              style={{ fontFamily: "'Caveat Brush', cursive" }}
            >
              EchoTypes
            </h1>
            <p 
              className="text-neutral-400 text-lg"
              style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
            >
              Complete your profile
            </p>
          </div>

          {/* User Info */}
          <div className="bg-neutral-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              {session?.user?.image ? (
                <Image 
                  src={session.user.image} 
                  alt="Profile" 
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
              )}
              <div>
                <p className="text-white font-medium">{session?.user?.name}</p>
                <p className="text-neutral-400 text-sm">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6"
            >
              <p className="text-red-300 text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="displayName" 
                className="block text-white font-medium mb-2"
                style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
              >
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-neutral-800/50 border border-neutral-600 rounded-xl px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                placeholder="Enter your display name"
                required
                minLength={2}
                maxLength={50}
                disabled={loading}
              />
              <p className="text-neutral-500 text-xs mt-2">
                This name will be shown on leaderboards
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !displayName.trim()}
              className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-neutral-600 disabled:to-neutral-700 text-white py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-green-500/25 disabled:shadow-none font-medium text-lg"
              whileHover={!loading && displayName.trim() ? { scale: 1.02 } : {}}
              whileTap={!loading && displayName.trim() ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaCheck className="text-xl" />
              )}
              <span style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </span>
            </motion.button>
          </form>

          {/* Terms */}
          <p className="text-neutral-500 text-xs text-center mt-6 leading-relaxed">
            By completing registration, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}