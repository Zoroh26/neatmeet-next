'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import NavBar from './NavBar';

export default function ConditionalNavBar() {
    const pathname = usePathname();
    const { user } = useAuth();

    // Routes where NavBar should NOT appear
    const noNavBarRoutes = ['/login'];

    // Don't show NavBar on login page or root page
    if (noNavBarRoutes.includes(pathname)) {
        return null;
    }

    // Don't show NavBar if user is not authenticated
    if (!user) {
        return null;
    }

    // Show NavBar for all other authenticated routes
    return <NavBar />;
}
