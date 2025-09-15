'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

import { AdminComponent } from '../components/AdminComponent';
import { EmployeeComponent } from '../components/EmployeeComponent';

export default function DashboardRoot() {
  const { user, isLoggedIn, hasHydrated } = useAuthStore();
  const router = useRouter();
  // ...existing code...

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoggedIn || !user) {
      router.replace('/login');
      return;
    }
    if (user.isInitialPassword) {
      router.replace('/changepassword');
      return;
    }
  }, [hasHydrated, isLoggedIn, user, router]);

  if (!hasHydrated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn || !user || user.isInitialPassword) {
    return null;
  }

  // Render dashboard based on role
  if (user.role === 'admin') {
    return <div className="pt-16"><AdminComponent /></div>;
  }
  return <div className="pt-16"><EmployeeComponent /></div>;
}
