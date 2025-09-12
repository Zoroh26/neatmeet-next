"use client";
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.isInitialPassword === true) {
      router.push('/changepassword');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [user, router]);

  // If user is not loaded yet, don't show anything (no loading screen)
  if (!user) {
    return null;
  }

  if (user.isInitialPassword === true) {
    return null;
  }
  
  if (user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}