'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FaCalendarAlt, FaHistory, FaTrash, FaEye, FaPlus, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GenericTable } from '../../components/GenericTable';
import RoomSearch from '../../components/RoomSearch';
import { Booking } from '../../types/booking';
import BookingService from '../../services/BookingServices';
import { useAuth } from '../../context/AuthContext';
import { useBookingStore } from '../../store/bookingStore';

// Zod schema for booking validation
const bookingSchema = z.object({
    description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
}).refine((data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return start < end;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Simple date formatter function
const formatDateTime = (date: Date | string | null | undefined): string => {
    if (!date) return 'N/A';
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }
        
        return dateObj.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

const classes = {
    // Container
    Container: 'min-h-screen bg-white relative',
    BackgroundElements: 'absolute inset-0 pointer-events-none overflow-hidden',
    BgShape1: 'absolute top-20 right-20 w-8 h-8 bg-red-500 opacity-20 transform rotate-45',
    BgShape2: 'absolute bottom-40 left-20 w-6 h-6 bg-red-500 opacity-15',
    
    Content: 'mx-auto sm:px-16 px-4 py-16 relative z-10',
    
    // Header Styles
    Header: 'flex justify-between items-center mb-12 -mt-8 ssm:gap-0 gap-12',
    HeaderLeft: 'flex flex-col',
    Title: 'sm:text-5xl text-2xl font-black text-black uppercase tracking-widest transform -skew-x-3 mb-2 leading-none',
    TitleAccent: 'text-red-500',
    Subtitle: 'sm:text-lg text-sm font-bold text-white bg-red-500 border-4 border-black px-4 py-2 inline-block shadow-[4px_4px_0px_0px_#000] uppercase tracking-wide transform',
    
    // Add Booking Button
    AddButton: 'bg-red-500 hover:bg-red-600 border-4 border-black text-white font-black sm:py-4 leading-none py-2 sm:px-8 px-2 uppercase tracking-widest text-lg shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center gap-3',
    
    // Tab Styles
    TabContainer: 'flex gap-2 mb-6',
    Tab: 'px-6 py-3 font-black uppercase tracking-wide border-4 border-black transition-all duration-200 cursor-pointer',
    ActiveTab: 'bg-red-500 text-white shadow-[4px_4px_0px_0px_#000]',
    InactiveTab: 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000]',
    
    // Search Input
    Input: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold placeholder-gray-500 focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] transition-all duration-200',
    
    // Messages
    ErrorMessage: 'bg-red-100 border-4 border-red-500 text-red-700 px-4 py-3 font-black uppercase tracking-wide mb-4 shadow-[4px_4px_0px_0px_#ef4444]',
    SuccessMessage: 'bg-green-100 border-4 border-green-500 text-green-700 px-4 py-3 font-black uppercase tracking-wide mb-4 shadow-[4px_4px_0px_0px_#22c55e]',
    
    // Action buttons
    ActionButton: 'p-2 border-2 border-black font-black transition-all duration-200 hover:shadow-[2px_2px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5',
    ViewButton: 'bg-blue-500 hover:bg-blue-600 text-white',
    DeleteButton: 'bg-red-500 hover:bg-red-600 text-white',
    
    // Modal styles
    ModalOverlay: 'fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4',
    ModalContent: 'bg-white border-4 border-black max-w-md w-full shadow-[12px_12px_0px_0px_#000] py-6 px-4 ',
    ModalHeader: 'flex justify-between items-center mb-6',
    ModalTitle: 'text-2xl font-black text-black uppercase tracking-wide',
    CloseButton: 'text-gray-600 hover:text-red-500 text-2xl cursor-pointer',
    FormGroup: 'mb-4',
    Label: 'block text-black font-black text-sm uppercase tracking-wide mb-2',
    FormInput: 'w-full bg-white border-4 border-black px-2 py-3 text-black font-bold placeholder-gray-500 focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] transition-all duration-200',
    TextArea: 'w-full bg-white border-4 border-black px-2 py-3 text-black font-bold placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all duration-200 resize-none h-24',
    ButtonGroup: 'flex gap-3 justify-end mt-6',
    ConfirmButton: 'bg-red-500 hover:bg-red-600 border-4 border-black text-white font-black py-3 px-6 uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200',
    CancelModalButton: 'bg-gray-200 hover:bg-gray-300 border-4 border-black text-black font-black py-3 px-6 uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200',
};

const BookingsPage: React.FC = () => {
    // Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(10);
    const { user } = useAuth();
    
    // Use Zustand store for bookings
    const { 
        bookings, 
        loading: bookingsLoading, 
        error: bookingsError, 
        fetchAllBookings,
        createBooking: createBookingInStore,
        clearError
    } = useBookingStore();
    
    // Set up Modal
    useEffect(() => {
        if (typeof window !== 'undefined') {
            Modal.setAppElement('body');
        }
    }, []);
    // Fetch all bookings when component mounts (available to all authenticated users)
    useEffect(() => {
        fetchAllBookings();
    }, [fetchAllBookings]);

    // Handle store errors
    useEffect(() => {
        if (bookingsError) {
            toast.error(`❌ ${bookingsError}`, {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                className: 'toast-error',
            });
            clearError();
        }
    }, [bookingsError, clearError]);
    
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [globalFilter, setGlobalFilter] = useState('');
    const [roomFilter, setRoomFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showRoomSearch, setShowRoomSearch] = useState(false);
    const [bookingCreationLoading, setBookingCreationLoading] = useState(false);
    const [bookingModal, setBookingModal] = useState<{
        isOpen: boolean;
        room: any;
        timeSlot: any;
    }>({
        isOpen: false,
        room: null,
        timeSlot: null,
    });
    
    // React Hook Form with Zod validation
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            description: '',
            startTime: '',
            endTime: '',
        },
    });

    // Watch description field to sync with state
    const watchedDescription = watch('description');

    // Handle booking creation
    const handleCreateBooking = async (bookingData: any) => {
        setBookingCreationLoading(true);
        try {
            // Use store's createBooking method
            await createBookingInStore(bookingData);
            
            setBookingModal({ isOpen: false, room: null, timeSlot: null });
            reset();
            setShowRoomSearch(false);
            
            // Neo-brutalism success toast
            toast.success('🎉 Booking created successfully!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                className: 'toast-success',
            });
        } catch (error: any) {
            console.error('Booking error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create booking';
            
            // Neo-brutalism error toast
            toast.error(`❌ ${errorMessage}`, {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                className: 'toast-error',
            });
        } finally {
            setBookingCreationLoading(false);
        }
    };

    // Split bookings into upcoming and past
    const { upcomingBookings, pastBookings } = useMemo(() => {
        const now = new Date();
        // Filter out any undefined/null bookings and ensure they have required properties
        const validBookings = bookings.filter(booking => 
            booking && 
            booking.startTime && 
            (typeof booking.startTime === 'string' || booking.startTime instanceof Date)
        );
        // Debug log: print all booking start times and current date
        console.log('🕒 Current date:', now.toISOString());
        validBookings.forEach((booking, idx) => {
            console.log(`Booking #${idx}: startTime=${booking.startTime}, parsed=${new Date(booking.startTime).toISOString()}`);
        });
        const upcoming = validBookings.filter(booking => {
            try {
                const bookingStartTime = new Date(booking.startTime);
                return bookingStartTime > now;
            } catch (error) {
                console.warn('Invalid startTime for booking:', booking);
                return false;
            }
        });
        const past = validBookings.filter(booking => {
            try {
                return new Date(booking.startTime) <= now;
            } catch (error) {
                console.warn('Invalid startTime for booking:', booking);
                return false;
            }
        });
        console.log('📊 Bookings split results:', {
            total: validBookings.length,
            upcoming: upcoming.length,
            past: past.length
        });
        return { upcomingBookings: upcoming, pastBookings: past };
    }, [bookings]);

    const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

    // Filter bookings based on search and dropdowns
    const filteredBookings = useMemo(() => {
        let filtered = currentBookings;
        if (globalFilter) {
            filtered = filtered.filter(booking =>
                booking && (
                    (booking.roomName && booking.roomName.toLowerCase().includes(globalFilter.toLowerCase())) ||
                    (booking.bookedBy && booking.bookedBy.toLowerCase().includes(globalFilter.toLowerCase())) ||
                    (booking.description && booking.description.toLowerCase().includes(globalFilter.toLowerCase()))
                )
            );
        }
        if (roomFilter) {
            filtered = filtered.filter(booking => booking && booking.roomName === roomFilter);
        }
        if (statusFilter) {
            filtered = filtered.filter(booking => booking && booking.status === statusFilter);
        }
        return filtered;
    }, [currentBookings, globalFilter, roomFilter, statusFilter]);

    // Pagination logic
    const totalItems = filteredBookings.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setPageIndex(0);
    }, [globalFilter, roomFilter, statusFilter, activeTab]);

  
    const handleBookRoom = (room: any, timeSlot: any) => {
        console.log('📝 Booking room with data:', { room, timeSlot });
        
        // Open booking modal with room and time slot details
        setBookingModal({
            isOpen: true,
            room: room,
            timeSlot: timeSlot,
        });
        
        // Reset form and set default values
        reset();
        
        // Auto-fill the time fields if timeSlot has the data
        // The timeSlot from RoomSearch uses start_time and end_time (underscore format)
        if (timeSlot?.start_time && timeSlot?.end_time) {
            const formatTimeForInput = (date: Date | string) => {
                const dateObj = typeof date === 'string' ? new Date(date) : date;
                // Use local timezone formatting to avoid UTC conversion
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };
            
            setValue('startTime', formatTimeForInput(timeSlot.start_time));
            setValue('endTime', formatTimeForInput(timeSlot.end_time));
        } else {
            console.warn('⚠️ TimeSlot missing start_time or end_time:', timeSlot);
        }
    };

    const handleConfirmBooking = (data: BookingFormData) => {
        if (!bookingModal.room || !bookingModal.timeSlot || !user) return;

        // Extract roomId from bookingModal.room
        let roomId = bookingModal.room._id;
        if (!roomId) {
            roomId = bookingModal.room.id || bookingModal.room.roomId || bookingModal.room.room_id;
        }

        console.log('🏠 Full room object:', bookingModal.room);
        console.log('🔑 Available room properties:', Object.keys(bookingModal.room));

        // Format the booking data according to API requirements
        // Create Date objects to validate, but preserve original datetime-local strings for API
        const startDateTime = new Date(data.startTime);
        const endDateTime = new Date(data.endTime);

        // Extract date in local timezone to avoid UTC conversion issues
        const localDate = data.startTime.split('T')[0]; // Extract YYYY-MM-DD from datetime-local input
        
        // Preserve local time as string, do not append 'Z'
        const preserveLocalTime = (datetimeLocal: string): string => {
            // Just return the string as-is, with seconds and milliseconds
            return datetimeLocal + ':00.000';
        };

        const bookingData = {
            room_id: roomId,
            date: localDate, // Use local date without UTC conversion
            start_time: preserveLocalTime(data.startTime), // Preserve local time
            end_time: preserveLocalTime(data.endTime), // Preserve local time
            purpose: data.description,
        };

        console.log('🚀 Submitting booking data:', bookingData);
        console.log('🆔 Using room ID:', roomId, 'Type:', typeof roomId, 'Length:', roomId?.length);
        console.log('📅 Formatted times:', {
            originalStart: data.startTime,
            originalEnd: data.endTime,
            localDate: localDate,
            preservedStartTime: preserveLocalTime(data.startTime),
            preservedEndTime: preserveLocalTime(data.endTime),
            oldIsoStart: startDateTime.toISOString(),
            oldIsoEnd: endDateTime.toISOString()
        });
        handleCreateBooking(bookingData);
    };

    const columns: ColumnDef<Booking>[] = useMemo(() => [
        {
            accessorKey: 'roomName',
            header: 'Room No',
            cell: ({ row }) => (
                <div className="bg-red-500 text-white px-2 py-1 border-2 border-black font-black text-xs uppercase shadow-[1px_1px_0px_0px_#000] w-fit">
                    {row.original.roomName}
                </div>
            ),
        },
        {
            accessorKey: 'bookedBy',
            header: 'Booked By',
            cell: ({ row }) => (
                <div className="font-bold text-gray-700">
                    {row.original.bookedBy}
                </div>
            ),
        },
        {
            accessorKey: 'startTime',
            header: 'Date & Time',
            cell: ({ row }) => (
                <div className="font-bold text-black">
                    <div>{formatDateTime(row.original.startTime)}</div>
                    <div className="text-sm text-gray-600">to {formatDateTime(row.original.endTime)}</div>
                </div>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <div className="text-gray-600 max-w-48 truncate">
                    {row.original.description || 'No description'}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <div className={`px-2 py-1 border-2 border-black font-black text-xs uppercase shadow-[1px_1px_0px_0px_#000] w-fit ${
                    row.original.status === 'active' ? 'bg-green-500 text-white' :
                    row.original.status === 'completed' ? 'bg-gray-500 text-white' :
                    'bg-red-500 text-white'
                }`}>
                    {row.original.status}
                </div>
            ),
        },
    // ...no actions or createdAt column...
    ], []);

    if (bookingsLoading) {
        return (
            <div className={classes.Container}>
                <div className={classes.Content}>
                    <div className="text-center py-16">
                        <div className="text-2xl font-black text-gray-600 uppercase tracking-wide">
                            Loading bookings...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Remove error display since we handle it via toast

    return (
        <div className={classes.Container}>
            {/* Background Elements */}
            <div className={classes.BackgroundElements}>
                <div className={classes.BgShape1}></div>
                <div className={classes.BgShape2}></div>
            </div>

            <div className={classes.Content}>
                {/* Header */}
                <div className={classes.Header}>
                    <div className={classes.HeaderLeft}>
                        <h1 className={classes.Title}>
                            <span className={classes.TitleAccent}>All Bookings</span>
                        </h1>
                        <p className={classes.Subtitle}>Manage All Meeting Schedules</p>
                    </div>
                    <button 
                        onClick={() => setShowRoomSearch(!showRoomSearch)}
                        className={classes.AddButton}
                    >
                        <FaPlus />
                        <span className="hidden sm:inline">New Booking</span>
                    </button>
                </div>

                {/* Room Search - Show when creating new booking */}
                {showRoomSearch && (
                    <div className="mb-8">
                        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-4 relative">
                            <button
                                onClick={() => setShowRoomSearch(false)}
                                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 border-2 border-black font-black"
                            >
                                ✕
                            </button>
                            <RoomSearch
                                onBookRoom={handleBookRoom}
                            />
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className={classes.TabContainer}>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`${classes.Tab} ${
                            activeTab === 'upcoming' ? classes.ActiveTab : classes.InactiveTab
                        }`}
                    >
                        <FaCalendarAlt className="inline mr-2" />
                        Upcoming ({upcomingBookings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`${classes.Tab} ${
                            activeTab === 'past' ? classes.ActiveTab : classes.InactiveTab
                        }`}
                    >
                        <FaHistory className="inline mr-2" />
                        Past ({pastBookings.length})
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className={classes.Input}
                    />
                    <select
                        value={roomFilter}
                        onChange={e => setRoomFilter(e.target.value)}
                        className={classes.Input}
                        style={{ minWidth: 150 }}
                    >
                        <option value="">All Rooms</option>
                        {[...new Set(currentBookings.map(b => b.roomName).filter(Boolean))].map(roomName => (
                            <option key={roomName} value={roomName}>{roomName}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className={classes.Input}
                        style={{ minWidth: 150 }}
                    >
                        <option value="">All Statuses</option>
                        {[...new Set(currentBookings.map(b => b.status).filter(Boolean))].map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <GenericTable
                    data={paginatedBookings}
                    columns={columns}
                    loading={bookingsLoading}
                    error={bookingsError ? 'Error loading bookings' : undefined}
                />

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        
                        <button
                            className={classes.CancelModalButton}
                            onClick={() => setPageIndex(pageIndex - 1)}
                            disabled={pageIndex === 0}
                        >
                            {'<'}
                        </button>
                        <button
                            className={classes.CancelModalButton}
                            onClick={() => setPageIndex(pageIndex + 1)}
                            disabled={pageIndex >= totalPages - 1}
                        >
                            {'>'}
                        </button>
                        
                    </div>
                    <span>
                        Page{' '}
                        <strong>
                            {pageIndex + 1} of {totalPages}
                        </strong>
                    </span>
                   
                </div>
            </div>

            {/* Booking Modal */}
            <Modal
                isOpen={bookingModal.isOpen}
                onRequestClose={() => setBookingModal({ isOpen: false, room: null, timeSlot: null })}
                className={classes.ModalContent}
                overlayClassName={classes.ModalOverlay}
            >
                <div className={classes.ModalHeader}>
                    <h2 className={classes.ModalTitle}>Confirm Booking</h2>
                    <button
                        onClick={() => setBookingModal({ isOpen: false, room: null, timeSlot: null })}
                        className={classes.CloseButton}
                    >
                        <FaTimes />
                    </button>
                </div>

                {bookingModal.room && bookingModal.timeSlot && (
                    <form onSubmit={handleSubmit(handleConfirmBooking)}>
                        <div className="mb-4 p-4 bg-gray-100 border-2 border-black">
                            <h3 className="font-black text-lg mb-2">{bookingModal.room.name}</h3>
                            <p className="text-sm font-bold text-gray-700">
                                 {bookingModal.room.location}
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                                Capacity: {bookingModal.room.capacity}
                            </p>
                        </div>

                        {/* Time Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className={classes.FormGroup}>
                                <label className={classes.Label}>Start Time *</label>
                                <input
                                    type="datetime-local"
                                    {...register('startTime')}
                                    className={`${classes.FormInput} ${errors.startTime ? 'border-red-500 shadow-[4px_4px_0px_0px_#ef4444]' : ''}`}
                                />
                                {errors.startTime && (
                                    <p className="text-red-500 font-black text-xs uppercase tracking-wide mt-1 bg-red-100 border-2 border-red-500 px-2 py-1">
                                        {errors.startTime.message}
                                    </p>
                                )}
                            </div>

                            <div className={classes.FormGroup}>
                                <label className={classes.Label}>End Time *</label>
                                <input
                                    type="datetime-local"
                                    {...register('endTime')}
                                    className={`${classes.FormInput} ${errors.endTime ? 'border-red-500 shadow-[4px_4px_0px_0px_#ef4444]' : ''}`}
                                />
                                {errors.endTime && (
                                    <p className="text-red-500 font-black text-xs uppercase tracking-wide mt-1 bg-red-100 border-2 border-red-500 px-2 py-1">
                                        {errors.endTime.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className={classes.FormGroup}>
                            <label className={classes.Label}>Description *</label>
                            <textarea
                                {...register('description')}
                                placeholder="Enter meeting purpose or description..."
                                className={`${classes.TextArea} ${errors.description ? 'border-red-500 shadow-[4px_4px_0px_0px_#ef4444]' : ''}`}
                            />
                            {errors.description && (
                                <p className="text-red-500 font-black text-xs uppercase tracking-wide mt-1 bg-red-100 border-2 border-red-500 px-2 py-1">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        <div className={classes.ButtonGroup}>
                            <button
                                type="button"
                                onClick={() => {
                                    setBookingModal({ isOpen: false, room: null, timeSlot: null });
                                    reset();
                                }}
                                className={classes.CancelModalButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={bookingCreationLoading}
                                className={classes.ConfirmButton}
                            >
                                {bookingCreationLoading ? 'Booking...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
            
            {/* Toast Container with Neo-Brutalism Styles */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                className="neo-brutalism-toast-container"
            />
        </div>
    );
};

export default BookingsPage;
