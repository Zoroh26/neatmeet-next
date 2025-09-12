'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

import { AdminComponent } from '../components/AdminComponent';
import { EmployeeComponent } from '../components/EmployeeComponent';

export default function DashboardRoot() {
  const { user, isLoggedIn, hasHydrated } = useAuthStore();
  const router = useRouter();

  if (!hasHydrated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn || !user) {
    useEffect(() => {
      router.replace('/login');
    }, [router]);
    return null;
  }

  // If user needs to change password, redirect
  if (user.isInitialPassword) {
    useEffect(() => {
      router.replace('/changepassword');
    }, [router]);
    return null;
  }

  // Render dashboard based on role
  if (user.role === 'admin') {
    return <AdminComponent />;
  }
  return <EmployeeComponent />;
}
