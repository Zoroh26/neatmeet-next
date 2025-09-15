'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
// Removed legacy useAuth import
import { 
    FaHome, 
    FaUsers, 
    FaBuilding, 
    FaUserPlus, 
    FaCalendarAlt, 
    FaUserCircle, 
    FaSignOutAlt,
    FaUser, 
    FaKey, 
    FaChevronDown,
} from 'react-icons/fa'
import {useAuthStore} from '../store/authStore'

const classes = {
    // Main navbar styles
    main: 'bg-white border-b-4 border-black fixed top-0 left-0 w-full z-50',
    container: 'max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8',
    navWrapper: 'flex justify-between items-center h-16',
    
    // Logo
    logoContainer: 'flex-shrink-0 cursor-pointer',
    logo: 'text-3xl font-black text-red-500 uppercase transform -skew-x-3',
    
    // Desktop Navigation
    desktopNav: 'hidden xl:flex items-center space-x-2',
    navList: 'flex space-x-2',
    
    // Right section with dark mode and user profile
    rightSection: 'flex items-center gap-2',
    
    // Dark Mode Toggle Button
    darkModeButton: 'bg-white hover:bg-gray-100  text-black p-3   cursor-pointer',
    
    // User Profile Container
    userProfileContainer: 'relative',
    userProfileButton: 'flex items-center gap-3  hover:bg-gray-100 px-4  font-black text-black uppercase tracking-wide  transition-all duration-200 cursor-pointer',
    
    // User Avatar
    userAvatar: 'w-10 h-10 bg-red-500 border-2 border-black rounded-full flex items-center justify-center text-white font-black text-sm',
    
     // User Info Section
    userInfo: 'flex flex-col items-start',
    userName: 'font-black text-base text-black leading-tight',
    userRole: ' py-0.5 -mt-0.5 text-xs tracking-wide text-red-500',
    dropdownIcon: 'text-black transition-transform duration-200',
    
    // Dropdown Menu
    dropdownMenu: 'absolute right-0 top-full mt-2 w-64 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] z-50',
    dropdownHeader: 'bg-red-500 border-b-4 border-black p-4',
    dropdownHeaderText: 'text-white font-black uppercase tracking-wide text-sm',
    dropdownBody: 'p-2',
    dropdownItem: 'flex items-center gap-3 w-full p-3 text-left font-bold text-black hover:bg-gray-100 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_#000] transition-all duration-200 mb-1',
    dropdownItemIcon: 'text-red-500',
    dropdownItemText: 'uppercase tracking-wide text-sm',
    
    // Logout Button (special styling)
    logoutButton: 'flex items-center gap-3 w-full p-3 text-left font-black text-white bg-red-500 hover:bg-red-600 border-2 border-black hover:shadow-[2px_2px_0px_0px_#000] transition-all duration-200 uppercase tracking-wide text-sm',
    
    // Mobile menu styles
    mobileMenuButton: 'xl:hidden',
    menuButton: 'text-black border-4 border-black p-2 bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200',
    mobileNav: 'xl:hidden border-t-4 border-black bg-white',
    mobileNavList: 'px-2 pt-2 pb-3 space-y-1',
}

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const {user, isLoggedIn, logout, hasHydrated} = useAuthStore()
    // Removed legacy logout

    // Initialize auth store from session on mount
    // checkSession is now called globally in ClientLayout
    // Define all navigation items with their allowed roles and React Icons
    const allNavItems = [
        { 
            name: 'Home', 
            href: '/', 
            roles: ['admin', 'employee'], 
            icon: <FaHome className="text-lg" />
        },
        { 
            name: 'Employees', 
            href: '/employees', 
            roles: ['admin'], 
            icon: <FaUsers className="text-lg" />
        },
        { 
            name: 'Rooms', 
            href: '/rooms', 
            roles: ['admin'], 
            icon: <FaBuilding className="text-lg" />
        },
        { 
            name: 'bookings', 
            href: '/bookings', 
            roles: ['admin','employee'], 
            icon: <FaCalendarAlt className="text-lg" />
        },
      
    ]

    // Filter navigation items based on user role
    const navItems = user 
        ? allNavItems.filter(item => item.roles.includes(user.role))
        : []

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        if (typeof window !== 'undefined') {
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
        return undefined;
    }, [])

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true'
        setDarkMode(savedDarkMode)
        if (savedDarkMode && typeof window !== 'undefined') {
            document.documentElement.classList.add('dark')
        }
    }, [])

    // Function to get proper styling based on active state
    const getNavLinkClass = (href: string) => {
        const isActive = pathname === href;
        return isActive 
            ? 'text-white font-black px-5 py-2 text-sm uppercase tracking-wide border-2 border-black bg-red-500 shadow-[2px_2px_0px_0px_#000] transition-all duration-200 flex items-center gap-2'
            : 'text-black font-black px-5 py-2 text-sm uppercase tracking-wide border-2 border-black bg-white hover:bg-red-500 hover:text-white transition-all duration-200 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center gap-2'
    }

    const getMobileNavLinkClass = (href: string) => {
        const isActive = pathname === href;
        return isActive 
            ? 'block text-white font-black px-4 py-2 text-sm uppercase tracking-wide border-2 border-black bg-red-500 shadow-[2px_2px_0px_0px_#000] flex items-center gap-2'
            : 'block text-black font-black px-4 py-2 text-sm uppercase tracking-wide border-2 border-black bg-white hover:bg-red-500 hover:text-white transition-all duration-200 shadow-[2px_2px_0px_0px_#000] flex items-center gap-2'
    }

    // Toggle dropdown
    const toggleDropdown = () => {
        setShowDropdown(prev => !prev)
    }

    // Toggle dark mode
    const toggleDarkMode = () => {
        console.log('🌙 Toggling dark mode...')
        setDarkMode(prev => {
            const newMode = !prev
            // Add dark class to document root
            if (typeof window !== 'undefined') {
                if (newMode) {
                    document.documentElement.classList.add('dark')
                    localStorage.setItem('darkMode', 'true')
                } else {
                    document.documentElement.classList.remove('dark')
                    localStorage.setItem('darkMode', 'false')
                }
            }
            return newMode
        })
    }

    // Handle logout
    const handleLogout = async () => {
        setShowDropdown(false);
        
        // Clear both auth systems
        logout(); // Zustand store
    logout(); // Zustand authStore logout
        
        // Force immediate redirect
        router.replace('/login');
    }

   

    // Get user initials for avatar
    

    const handleLogoClick = () => {
        if (user) {
            router.push('/')
        } else {
            router.push('/login')
        }
    }

    return (
        <nav className={classes.main}>
            <div className={classes.container}>
                <div className={classes.navWrapper}>
                    {/* Neo Brutal Logo */}
                    <div className={classes.logoContainer}>
                        <div onClick={handleLogoClick}>
                            <h1 className={classes.logo}>Neat<span className='text-black'>Meet</span></h1>
                        </div>
                    </div>

                    {/* Desktop Navigation - Role-based filtering with React Icons */}
                    <div className={classes.desktopNav}>
                        <div className={classes.navList}>
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={getNavLinkClass(item.href)}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Section - Dark Mode + User Profile */}
                    <div className={classes.rightSection}>
                       
                        {/* User Info */}
                        <div className="hidden xl:flex items-center gap-4">
                            {hasHydrated && user ? (
                                <div className={classes.userProfileContainer} ref={dropdownRef}>
                                    <button
                                        onClick={toggleDropdown}
                                        className={classes.userProfileButton}
                                        aria-haspopup="true"
                                        aria-expanded={showDropdown}
                                    >
                                        {/* User Avatar */}
                                        <div className={classes.userAvatar}>
                                            { <FaUser />}
                                        </div>
                                        
                                        {/* User Name */}
                                         <div className={classes.userInfo}>
                                            <span className={classes.userName}>
                                                {user?.name || 'User'}
                                            </span>
                                            <span className={classes.userRole}>
                                                {user.role}
                                            </span>
                                        </div>
                                        
                                        {/* Dropdown Icon */}
                                        <FaChevronDown 
                                            className={`${classes.dropdownIcon} ${showDropdown ? 'rotate-180' : ''}`}
                                            size={14}
                                        />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <div className={classes.dropdownMenu}>
                                            <div className={classes.dropdownBody}>
                                                {/* My Bookings - all users */}
                                                <button
                                                    onClick={() => router.push('/mybookings')}
                                                    className={classes.dropdownItem}
                                                >
                                                    <FaCalendarAlt className={classes.dropdownItemIcon} />
                                                    <span className={classes.dropdownItemText}>
                                                        My bookings
                                                    </span>
                                                </button>

                                               
                                                {/* Change Password - all users */}
                                                <button
                                                    onClick={() => router.push('/changepassword')}
                                                    className={classes.dropdownItem}
                                                >
                                                    <FaKey className={classes.dropdownItemIcon} />
                                                    <span className={classes.dropdownItemText}>
                                                        Change Password
                                                    </span>
                                                </button>

                                                {/* Logout Button */}
                                                <button
                                                    onClick={handleLogout}
                                                    className={classes.logoutButton}
                                                >
                                                    <FaSignOutAlt />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : hasHydrated ? (
                                <Link 
                                    href="/login" 
                                    className="bg-red-500 text-white px-4 py-2 border-2 border-black font-black hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_#000] uppercase text-sm"
                                >
                                    Login
                                </Link>
                            ) : null}
                        </div>
                         {/* Dark Mode Toggle Button */}
                        {/*<button
                            onClick={toggleDarkMode}
                            className={classes.darkModeButton}
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                        </button>*/}

                    </div>

                    {/* Mobile Menu Button */}
                    <div className={classes.mobileMenuButton}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={classes.menuButton}
                            aria-label="Toggle mobile menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation - Role-based filtering with React Icons */}
                {isMenuOpen && (
                    <div className={classes.mobileNav}>
                        <div className={classes.mobileNavList}>
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={getMobileNavLinkClass(item.href)}
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                    }}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                            
                            {/* Mobile User Info */}
                            <div className="border-t-2 border-black pt-4 mt-4">
                                {hasHydrated && user ? (
                                    <div className="space-y-2">
                                        <div className="text-sm font-bold text-black flex items-center gap-2">
                                            <FaUserCircle className="text-red-500 text-xl" />
                                            {user.name} ({user.role})
                                        </div>
                                        <button
                                            onClick={() => {
                                                handleLogout()
                                                setIsMenuOpen(false)
                                            }}
                                            className="w-full bg-red-500 text-white px-4 py-2 border-2 border-black font-black hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_#000] uppercase text-sm flex items-center justify-center gap-2"
                                        >
                                            <FaSignOutAlt />
                                            Logout
                                        </button>
                                    </div>
                                ) : hasHydrated ? (
                                    <Link 
                                        href="/login" 
                                        className="block w-full bg-red-500 text-white px-4 py-2 border-2 border-black font-black hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_#000] uppercase text-sm text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default NavBar
