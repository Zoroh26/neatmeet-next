// Component version of EmployeePage
'use client';
import React, { useEffect, useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { MdBookOnline } from 'react-icons/md';
import bookingService from '../services/BookingServices';
import RoomService from '../services/RoomServices';
import type { Booking } from '../types/booking';
import type { Room } from '../types/index';
import BookingList from './BookingList';
import { useRouter } from 'next/navigation';

const classes = {
    Container: 'p-8 bg-bg-primary min-h-screen pt-16',
    Header: 'mb-8',
    Title: 'text-4xl font-black text-text-primary mb-2 uppercase tracking-widest',
    Subtitle: 'text-lg text-text-secondary font-bold uppercase tracking-wide mb-8',
    
    // Stats Grid
    StatsGrid: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8',
    StatCard: 'bg-surface border-4 border-border p-6 shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300',
    StatIcon: 'text-4xl mb-4',
    StatNumber: 'text-3xl font-black text-text-primary mb-2',
    StatLabel: 'text-text-secondary font-bold uppercase tracking-wide text-sm',
    
    // Quick Actions
    QuickActions: 'mb-8',
    SectionTitle: 'text-2xl font-black text-text-primary mb-2 uppercase tracking-widest',
    ActionsGrid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    ActionCard: 'bg-surface flex flex-row justify-center items-center gap-4 border-4 border-border p-6 text-center hover:bg-surface-hover transition-colors cursor-pointer shadow-[6px_6px_0px_0px_#000] hover:shadow-[10px_10px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1',
    ActionIcon: 'text-5xl text-primary ',
    ActionTitle: 'text-lg font-bold text-text-primary uppercase tracking-wide mb-2',
    ActionDesc: 'text-text-secondary text-sm font-bold',
    
    // Bookings Section
    BookingsSection: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
    BookingsCard: 'bg-surface border-4 border-border p-6 shadow-[8px_8px_0px_0px_#000]',
    BookingItem: 'flex items-center justify-between p-4 border-b border-border-light last:border-b-0 hover:bg-bg-tertiary transition-colors',
    BookingIcon: 'text-xl text-primary mr-4',
    BookingInfo: 'flex-1',
    BookingTitle: 'font-bold text-text-primary',
    BookingDetails: 'text-text-secondary text-sm',
    BookingTime: 'text-text-muted text-xs',
    
    // Empty State
    EmptyState: 'text-center py-12',
    EmptyIcon: 'text-6xl text-text-muted mx-auto mb-4',
    EmptyText: 'text-text-secondary font-bold text-lg',
    EmptySubtext: 'text-text-muted font-bold',
};

export const EmployeeComponent: React.FC = () => {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [rooms, setRooms] = useState<Room[]>([]);

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
                
                // Filter out cancelled bookings for employee view
                const activeBookings = response.bookings.filter(booking => 
                    booking.status !== 'cancelled'
                );
                
                setBookings(activeBookings);
            } catch (error) {
                console.error('Failed to load bookings:', error);
            } finally {
                setBookingsLoading(false);
            }
        };
        
        fetchRooms();
        loadBookings();
    }, []);

    const getRoomById = (roomId: string): Room | undefined => {
        return rooms.find(room => room.id === roomId);
    };

    const employeeActions = [
        {
            icon: MdBookOnline,
            title: 'Book a Room',
            description: 'Reserve a meeting room for your next session',
            action: () => router.push('/bookings')
        },
        {
            icon: FaHistory,
            title: 'My Bookings',
            description: 'View your past and upcoming reservations',
            action: () => router.push('/mybookings')
        },
    ];

    return (
        <div className={classes.Container}>
            {/* Header */}
            <div className={classes.Header}>
                <h1 className={classes.Title}>Employee Dashboard</h1>
                <p className={classes.Subtitle}>Welcome back! Manage your room bookings and schedule.</p>
            </div>

            {/* Quick Actions */}
            <div className={classes.QuickActions}>
                <h2 className={classes.SectionTitle}>Quick Actions</h2>
                <div className={classes.ActionsGrid}>
                    {employeeActions.map((action, index) => (
                        <div 
                            key={index} 
                            className={classes.ActionCard}
                            onClick={action.action}
                        >
                            <action.icon className={classes.ActionIcon} />
                            <div>
                                <h3 className={classes.ActionTitle}>{action.title}</h3>
                                <p className={classes.ActionDesc}>{action.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bookings Section */}
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
