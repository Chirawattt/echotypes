"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaArrowLeft, FaHome } from 'react-icons/fa';
import { Suspense } from 'react';

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return 'There is a problem with the authentication configuration.';
      case 'AccessDenied':
        return 'Access denied. You may not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'Default':
      default:
        return 'An unexpected error occurred during authentication.';
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleRetry = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-neutral-900/90 to-slate-900/90 rounded-3xl shadow-2xl p-8 border border-neutral-700/50 backdrop-blur-sm text-center">
          
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FaExclamationTriangle className="text-red-400 text-2xl" />
          </motion.div>

          {/* Error Title */}
          <h1 
            className="text-3xl text-white mb-4"
            style={{ fontFamily: "'Caveat Brush', cursive" }}
          >
            Authentication Error
          </h1>

          {/* Error Message */}
          <p 
            className="text-neutral-300 text-lg mb-8 leading-relaxed"
            style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}
          >
            {getErrorMessage(error)}
          </p>

          {/* Error Code */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6">
              <p className="text-red-300 text-sm">
                Error Code: <span className="font-mono">{error}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={handleRetry}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-blue-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
                Try Again
              </span>
            </motion.button>

            <div className="flex space-x-2">
              <motion.button
                onClick={handleBack}
                className="flex-1 flex items-center justify-center space-x-2 text-white/70 hover:text-white border border-white/20 hover:border-white/40 py-3 px-4 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaArrowLeft className="text-sm" />
                <span className="text-sm">Back</span>
              </motion.button>

              <motion.button
                onClick={handleHome}
                className="flex-1 flex items-center justify-center space-x-2 text-white/70 hover:text-white border border-white/20 hover:border-white/40 py-3 px-4 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaHome className="text-sm" />
                <span className="text-sm">Home</span>
              </motion.button>
            </div>
          </div>

          {/* Support Message */}
          <p className="text-neutral-500 text-xs mt-6">
            If the problem persists, please contact support.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg" style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
            Loading...
          </p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
