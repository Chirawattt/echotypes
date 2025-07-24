"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CheckRegistration() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const checkUserRegistration = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/register');
      const result = await response.json();
      
      if (result.registered) {
        // User is registered, redirect to home
        router.push('/');
      } else {
        // User needs to complete registration
        router.push('/auth/signup');
      }
    } catch (error) {
      console.error('Error checking user registration:', error);
      // On error, assume user needs to register
      router.push('/auth/signup');
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    checkUserRegistration();
  }, [session, status, router, checkUserRegistration]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  return null;
}