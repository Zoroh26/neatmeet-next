'use client';
import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { AdminComponent } from '../../components/AdminComponent';
import { EmployeeComponent } from '../../components/EmployeeComponent';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isLoggedIn, hasHydrated } = useAuthStore();
  const router = useRouter();

  // Initialize store from session on mount
  // checkSession is now called globally in ClientLayout

  // Redirect to login if not authenticated
  useEffect(() => {
    // Wait for hydration
    if (!hasHydrated) return;

    if (!isLoggedIn || !user) {
      router.replace('/login');
      return;
    }

    // Redirect to change password if initial password
    if (user.isInitialPassword === true) {
      router.replace('/changepassword');
      return;
    }
  }, [user, isLoggedIn, hasHydrated, router]);

  // Show loading during hydration or while redirecting
  if (!hasHydrated || !isLoggedIn || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  // Redirect to change password if needed
  if (user.isInitialPassword === true) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-bold">Redirecting to change password...</div>
      </div>
    );
  }

  // Role-based conditional rendering
  return (
    <>
      {user.role === 'admin' && <AdminComponent />}
      {user.role === 'employee' && <EmployeeComponent />}
      {user.role !== 'admin' && user.role !== 'employee' && (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl font-bold text-red-600">
            Invalid user role. Please contact administrator.
          </div>
        </div>
      )}
    </>
  );
}
