"use client";

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaGoogle, FaArrowLeft } from 'react-icons/fa';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    // Auto-redirect to Google sign in if no error
    if (!error) {
      signIn('google');
    }
  }, [error]);

  const handleSignIn = () => {
    signIn('google');
  };

  const handleBack = () => {
    router.back();
  };

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
              Sign in to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6"
            >
              <p className="text-red-300 text-sm text-center">
                {error === 'OAuthSignin' && 'Error occurred during sign in. Please try again.'}
                {error === 'OAuthCallback' && 'Error occurred during authentication. Please try again.'}
                {error === 'OAuthCreateAccount' && 'Could not create account. Please try again.'}
                {error === 'EmailCreateAccount' && 'Could not create account. Please try again.'}
                {error === 'Callback' && 'Error occurred during callback. Please try again.'}
                {error === 'OAuthAccountNotLinked' && 'Account not linked. Please try a different sign in method.'}
                {error === 'EmailSignin' && 'Check your email for the sign in link.'}
                {error === 'CredentialsSignin' && 'Sign in failed. Check your credentials and try again.'}
                {error === 'SessionRequired' && 'Please sign in to access this page.'}
                {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'EmailCreateAccount', 'Callback', 'OAuthAccountNotLinked', 'EmailSignin', 'CredentialsSignin', 'SessionRequired'].includes(error) && 'An error occurred during authentication.'}
              </p>
            </motion.div>
          )}

          {/* Sign In Button */}
          <motion.button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-blue-500/25 font-medium text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaGoogle className="text-xl" />
            <span style={{ fontFamily: "'Playpen Sans Thai', sans-serif" }}>
              Continue with Google
            </span>
          </motion.button>

          {/* Terms */}
          <p className="text-neutral-500 text-xs text-center mt-6 leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
