"use client";
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const RequireGuest = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect logged-in users to dashboard
      if (user.isInitialPassword === true) {
        router.push('/changepassword');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  if (user) {
    return null; // Don't show loading screen, just redirect
  }

  return <>{children}</>;
};

export default RequireGuest;
