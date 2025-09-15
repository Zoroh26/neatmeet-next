// Component version of AdminPage
'use client';
import React, { useEffect, useState } from 'react';
import { FaUsers, FaDoorOpen, FaCalendarAlt, FaClock, FaCog, FaPlus } from 'react-icons/fa';
import { MdManageAccounts, MdMeetingRoom, MdBookOnline, MdAnalytics } from 'react-icons/md';
import BookingList from './BookingList';
import bookingService from '../services/BookingServices';
import RoomService from '../services/RoomServices';
import UserService from '../services/UserServices';
import type { Booking } from '../types/booking';
import type { Room } from '../types/index';
import type { Employee } from '../types/index';
import Modal from 'react-modal';
import { useRouter } from 'next/navigation';

const classes = {
    Container: 'sm:p-8 p-4 bg-bg-primary min-h-screen pt-16',
    Header: 'mb-8',
    Title: 'sm:text-4xl text-3xl font-black text-text-primary mb-2 uppercase tracking-widest',
    Subtitle: 'text-lg  text-text-secondary font-bold uppercase tracking-wide mb-8',
    
    // Stats Grid
    StatsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8',
    StatCard: 'bg-surface border-4 border-border hover:border-[#fa2d37] p-6 shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#fa2d37] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300',
    StatIcon: 'text-4xl mb-4',
    StatNumber: 'text-3xl font-black text-text-primary mb-2',
    StatLabel: 'text-text-secondary font-bold uppercase tracking-wide text-sm',
    
    // Quick Actions
    QuickActions: 'mb-8',
    SectionTitle: 'text-2xl font-black text-text-primary mb-6 uppercase tracking-widest',
    ActionsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    ActionCard: 'bg-surface flex flex-row gap-4 justify-center items-center border-4 border-border p-6 text-center hover:bg-surface-hover transition-colors cursor-pointer shadow-[6px_6px_0px_0px_#000] hover:shadow-[10px_10px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1',
    ActionIcon: 'text-5xl text-primary -ml-4',
    ActionTitle: 'text-lg font-bold text-text-primary uppercase tracking-wide mb-2',
    ActionDesc: 'text-text-secondary text-sm font-bold -mt-2',
    
    // Recent Activity
    RecentActivity: 'bg-surface border-4 border-border p-6 shadow-[8px_8px_0px_0px_#000]',
    ActivityItem: 'flex items-center p-3 border-b border-border-light last:border-b-0',
    ActivityIcon: 'text-xl text-primary mr-4',
    ActivityText: 'text-text-primary font-bold',
    ActivityTime: 'text-text-muted text-sm ml-auto',
};

export const AdminComponent: React.FC = () => {
    const router = useRouter();
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                try {
                    Modal.setAppElement('body');
                } catch (error) {
                    console.warn('Modal.setAppElement failed:', error);
                }
            }, 100);
        }
    }, []);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [bookingsData, roomsData, employeesData] = await Promise.all([
                    bookingService.getAllBookings(),
                    RoomService.getAllRooms(),
                    UserService.getAllUsers()
                ]);
                
                setBookings(bookingsData.bookings || []);
                setRooms(roomsData || []);
                setEmployees(employeesData || []);
            } catch (err: any) {
                console.error('Failed to fetch admin data:', err);
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const stats = [
         {
            icon: <FaUsers className="text-blue-500" />,
            number: employees.length,
            label: 'Total Employees',
        },
        {
            icon: <MdMeetingRoom className="text-green-500" />,
            number: rooms.length,
            label: 'Meeting Rooms',
        },
        {
            icon: <FaCalendarAlt className="text-orange-500" />,
            number: bookings.filter(b => new Date(b.startTime) > new Date()).length,
            label: 'Upcoming Meetings',
        },
        {
            icon: <FaClock className="text-purple-500" />,
            number: bookings.filter(b => new Date(b.startTime) <= new Date()).length,
            label: 'Past Meetings',
        },
       
    ];

    const quickActions = [
        {
            icon: <MdManageAccounts />,
            title: 'Manage Employees',
            description: 'Add, edit, or remove employees',
            onClick: () => router.push('/employees'),
        },
        {
            icon: <MdMeetingRoom />,
            title: 'Manage Rooms',
            description: 'Configure meeting rooms',
            onClick: () => router.push('/rooms'),
        },
        {
            icon: <MdBookOnline />,
            title: 'View All Bookings',
            description: 'Monitor all room bookings',
            onClick: () => router.push('/bookings'),
        },
    ];

    if (loading) {
        return (
            <div className={classes.Container}>
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-2xl font-bold">Loading admin dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.Container}>
            {/* Header */}
            <div className={classes.Header}>
                <h1 className={classes.Title}>Admin Dashboard</h1>
                <p className={classes.Subtitle}>System Overview & Management</p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border-4 border-red-500 text-red-700 px-6 py-4 mb-6 font-bold">
                    Error: {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className={classes.StatsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={classes.StatCard}>
                        <div className={classes.StatIcon}>{stat.icon}</div>
                        <div className={classes.StatNumber}>{stat.number}</div>
                        <div className={classes.StatLabel}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className={classes.QuickActions}>
                <h2 className={classes.SectionTitle}>Quick Actions</h2>
                <div className={classes.ActionsGrid}>
                    {quickActions.map((action, index) => (
                        <div
                            key={index}
                            className={classes.ActionCard}
                            onClick={action.onClick}
                        >
                            <div className={classes.ActionIcon}>{action.icon}</div>
                            <div className="flex flex-col items-start">
                                <div className={classes.ActionTitle}>{action.title}</div>
                                <div className={classes.ActionDesc}>{action.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            
        </div>
    );
};
