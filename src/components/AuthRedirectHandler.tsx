'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

// Define routes outside component to prevent recreation on every render
const adminRoutes = ['/admin', '/employees', '/rooms'];
const authRoutes = ['/admin', '/employees', '/rooms', '/bookings', '/mybookings', '/employeepage', '/dashboard', '/changepassword'];

export default function AuthRedirectHandler({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoggedIn, hasHydrated } = useAuthStore();

    useEffect(() => {
        // Don't run redirects until store has hydrated to prevent loops
        if (!hasHydrated) {
            return;
        }

        // Handle authentication redirects
        if (authRoutes.includes(pathname)) {
            if (!isLoggedIn || !user) {
                router.replace('/login');
                return;
            }

            if (user.isInitialPassword === true && pathname !== '/changepassword') {
                router.replace('/changepassword');
                return;
            }

            // Check admin-only routes
            if (adminRoutes.includes(pathname) && user.role !== 'admin') {
                router.replace('/');
                return;
            }
        }

        // Handle guest-only routes (login, root)
        if (pathname === '/login' || pathname === '/') {
            if (isLoggedIn && user) {
                if (user.isInitialPassword === true) {
                    router.replace('/changepassword');
                } else {
                    // All authenticated users go to dashboard
                    router.replace('/');
                }
            } else if (pathname === '/' && (!isLoggedIn || !user)) {
                // Redirect unauthenticated users from root to login
                router.replace('/login');
            }
        }
    }, [pathname, user, isLoggedIn, hasHydrated, router]);

    // Show loading screen until hydration is complete
    if (!hasHydrated) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl font-bold">Loading...</div>
            </div>
        );
    }

    // For auth routes without proper access, don't render children (avoid flash)
    if (authRoutes.includes(pathname)) {
        if (!user) {
            return null; // Redirecting to login
        }

        if (user.isInitialPassword === true && pathname !== '/changepassword') {
            return null; // Redirecting to change password
        }

        if (adminRoutes.includes(pathname) && user.role !== 'admin') {
            return null; // Redirecting to employee page
        }
    }

    // For guest routes when user is logged in, don't render children
    if ((pathname === '/login' || pathname === '/') && isLoggedIn && user) {
        return null; // Redirecting based on role
    }

    // For root route when user is not logged in, don't render children (redirecting to login)
    if (pathname === '/' && (!isLoggedIn || !user)) {
        return null; // Redirecting to login
    }

    return <>{children}</>;
}
