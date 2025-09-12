// Migrated from src/app/pages/AdminPage.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaUsers, FaDoorOpen, FaCalendarAlt, FaClock, FaCog, FaPlus } from 'react-icons/fa';
import { MdManageAccounts, MdMeetingRoom, MdBookOnline, MdAnalytics } from 'react-icons/md';
import BookingList from '../../components/BookingList';
import bookingService from '../../services/BookingServices';
import RoomService from '../../services/RoomServices';
import UserService from '../../services/UserServices';
import type { Booking } from '../../types/booking';
import type { Room } from '../../types/index';
import type { Employee } from '../../types/index';
import Modal from 'react-modal';

const classes = {
    Container: 'sm:p-8 p-4 bg-bg-primary min-h-screen',
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

const AdminPage: React.FC = () => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Set app element for react-modal
            setTimeout(() => {
                try {
                    Modal.setAppElement('body');
                } catch (e) {
                    // Ignore if not found
                }
            }, 0);
        }
    }, []);

    const adminActions = [
        {
            icon: MdManageAccounts,
            title: 'Manage Employees',
            description: 'Add, edit, and remove employee accounts',
            action: () => {
                // ...existing code...
                window.location.href = '/employees';
            }
        },
        {
            icon: MdMeetingRoom,
            title: 'Manage Rooms',
            description: 'Configure meeting rooms and amenities',
            action: () => {
                // ...existing code...
                window.location.href = '/rooms';
            }
        },
        {
            icon: MdBookOnline,
            title: 'View All Bookings',
            description: 'Monitor and manage room reservations',
            action: () => {
                // ...existing code...
                window.location.href = '/bookings';
            }
        },
        
    ];

    

    // BookingList data
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
    }, []);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const roomsData = await RoomService.getAllRooms();
                setRooms(roomsData);
            } catch (error) {
                console.error('Failed to fetch rooms:', error);
            }
        };
        const loadBookings = async () => {
            try {
                setBookingsLoading(true);
                const response = await bookingService.getAllBookings();
                
                // Filter out cancelled bookings for admin view
                const activeBookings = response.bookings.filter(booking => 
                    booking.status !== 'cancelled'
                );
                
                // ...existing code...
                
                setBookings(activeBookings);
            } catch (error) {
                console.error('Failed to load bookings:', error);
            } finally {
                setBookingsLoading(false);
            }
        };
        const fetchEmployees = async () => {
            try {
                const employeesData = await UserService.getAllUsers();
                setEmployees(employeesData);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
            }
        };
        fetchRooms();
        fetchEmployees();
        loadBookings();
    }, []);

    // Reload bookings function
    const reloadBookings = async () => {
        try {
            setBookingsLoading(true);
            const response = await bookingService.getAllBookings();
            
            // Filter out cancelled bookings for admin view
            const activeBookings = response.bookings.filter(booking => 
                booking.status !== 'cancelled'
            );
            
           
            
            setBookings(activeBookings);
        } catch (error) {
            console.error('Failed to reload bookings:', error);
        } finally {
            setBookingsLoading(false);
        }
    };

    const getRoomById = (roomId: string): Room | undefined => {
        return rooms.find(room => room.id === roomId);
    };

    const activeBookings = now ? bookings.filter(b => b.endTime && new Date(b.endTime) > now).length : 0;
    const previousBookings = now ? bookings.filter(b => b.endTime && new Date(b.endTime) <= now).length : 0;

    const stats = [
        { icon: FaUsers, number: employees.length, label: 'Total Employees', color: 'text-primary' },
        { icon: FaDoorOpen, number: rooms.length, label: 'Available Rooms', color: 'text-success' },
        { icon: FaCalendarAlt, number: activeBookings, label: 'Upcoming Bookings', color: 'text-info' },
        { icon: FaClock, number: previousBookings, label: 'Previous Bookings', color: 'text-warning' },
    ];

    return (
        <div className={classes.Container}>
            <div className={classes.Header}>
                <h1 className={classes.Title}>Admin Dashboard</h1>
                <p className={classes.Subtitle}>Welcome back, Administrator! Manage your workspace efficiently.</p>
            </div>

            {/* Stats Grid */}
            <div className={classes.StatsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={classes.StatCard}>
                        <div className={classes.StatIcon + ' ' + stat.color}>
                            <stat.icon />
                        </div>
                        <div>
                            <div className={classes.StatNumber}>{stat.number}</div>
                            <div className={classes.StatLabel}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className={classes.QuickActions}>
                <h2 className={classes.SectionTitle}>Admin Actions</h2>
                <div className={classes.ActionsGrid}>
                    {adminActions.map((action, index) => (
                        <div 
                            key={index} 
                            className={classes.ActionCard}
                            onClick={action.action}
                        >
                            <action.icon className={classes.ActionIcon} />
                            <div className='leading-0'>
                                <h3 className={classes.ActionTitle}>{action.title}</h3>
                            <p className={classes.ActionDesc}>{action.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-12">
                <h2 className={classes.SectionTitle}>All Bookings</h2>
                <BookingList
                    bookings={bookings}
                    bookingsLoading={bookingsLoading}
                    getRoomById={getRoomById}
                />
            </div>
        </div>
    );
};

// Wrap the component with auth protection
// Simple export - ConditionalNavBar handles auth
export default AdminPage;

