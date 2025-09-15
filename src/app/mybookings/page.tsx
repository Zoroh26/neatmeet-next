'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
    FaTimes,
    FaEdit,
    FaSpinner,
    FaExclamationTriangle,
    FaCheckCircle,
    FaSave
} from 'react-icons/fa';
import { MdMeetingRoom } from 'react-icons/md';
import { GenericTable } from '../../components/GenericTable';
import Modal from 'react-modal';
import RoomService from '../../services/RoomServices';
import type { Room } from '../../types/index';
import type { Booking } from '../../types/booking';
import { useBookingStore } from '../../store/bookingStore';
import { toast } from 'react-toastify';

const classes = {
    // Page Container
    Container: 'sm:p-8 p-4 bg-white min-h-screen mt-16',
    Header: 'text-center mb-12',
    Title: 'text-5xl font-black text-black mb-4 uppercase tracking-widest transform -skew-x-3',
    Subtitle: 'text-xl font-bold text-white bg-red-500 border-4 border-black px-6 py-3 inline-block shadow-[6px_6px_0px_0px_#000] uppercase tracking-wide transform',
    
    // Split Layout
    SplitContainer: 'flex flex-col lg:flex-row gap-8',
    
    // Section Headers
    SectionContainer: 'flex-1 border-4 border-black bg-white shadow-[6px_6px_0px_0px_#000]',
    SectionHeader: 'border-b-4 border-black p-6',
    SectionTitle: 'text-2xl font-black text-black uppercase tracking-wide flex items-center gap-3',
    SectionSubtitle: 'text-sm font-bold text-gray-600 mt-2',
    SectionBody: 'p-6',
    
    // Upcoming Section
    UpcomingHeader: 'bg-green-50',
    UpcomingIcon: 'w-4 h-4 bg-green-600 border-2 border-black',
    
    // Past Section  
    PastHeader: 'bg-gray-100',
    PastIcon: 'w-4 h-4 bg-gray-600 border-2 border-black',
    
    // Bookings List
    BookingsList: 'space-y-4',
    BookingCard: 'bg-white border-3 border-black p-4 shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 relative',
    
    // Past Booking Card - Added gray styling
    PastBookingCard: 'bg-gray-100 border-3 border-gray-500 p-4 shadow-[3px_3px_0px_0px_#6b7280] hover:shadow-[5px_5px_0px_0px_#6b7280] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 relative opacity-80',
    
    // Card Header
    CardHeader: 'flex justify-between items-start mb-3',
    RoomName: 'text-lg font-black text-red-500 uppercase tracking-wide flex items-center gap-2',
    PastRoomName: 'text-lg font-black text-gray-600 uppercase tracking-wide flex items-center gap-2',
    
    // Action Buttons
    CancelButton: 'bg-red-500 hover:bg-red-600 border-3 border-black text-white font-black px-3 py-2 uppercase tracking-wide shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm',
    
    // Card Content
    BookingTime: 'text-black font-bold flex items-center gap-2 bg-green-500 border-2 border-black text-white px-2 py-1 mb-2 inline-block text-sm',
    PastBookingTime: 'text-white font-bold flex items-center gap-2 bg-gray-500 border-2 border-gray-400 px-2 py-1 mb-2 inline-block text-sm',
    BookingDescription: 'text-black font-bold mb-2 flex items-center gap-2 text-sm',
    PastBookingDescription: 'text-gray-700 font-bold mb-2 flex items-center gap-2 text-sm',
    BookingMeta: 'text-xs text-gray-600 font-bold',
    PastBookingMeta: 'text-xs text-gray-500 font-bold',
    
    // Loading & Empty States
    LoadingContainer: 'text-center py-20',
    LoadingSpinner: 'animate-spin text-6xl text-red-500 mx-auto mb-4',
    EmptyContainer: 'text-center py-12 border-2 border-gray-300 bg-gray-50',
    EmptyIcon: 'text-4xl text-gray-400 mx-auto mb-3',
    EmptyTitle: 'text-lg font-black text-gray-600 uppercase tracking-wide mb-2',
    EmptySubtitle: 'text-gray-500 font-bold text-sm',
    
    // Messages
    ErrorMessage: 'bg-red-100 border-4 border-red-500 text-red-700 px-6 py-4 font-black uppercase tracking-wide mb-6 shadow-[4px_4px_0px_0px_#ef4444] max-w-2xl mx-auto',
    SuccessMessage: 'bg-green-100 border-4 border-green-500 text-green-700 px-6 py-4 font-black uppercase tracking-wide mb-6 shadow-[4px_4px_0px_0px_#22c55e] max-w-2xl mx-auto',
    
    // Edit Modal Styles
    ModalOverlay: 'fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4',
    ModalContent: 'bg-white border-4 border-black max-w-2xl w-full shadow-[16px_16px_0px_0px_#000] relative',
    ModalHeader: 'bg-blue-500 border-b-4 border-black p-4 flex justify-between items-center',
    ModalTitle: 'text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3',
    CloseButton: 'text-white hover:text-blue-200 text-2xl cursor-pointer transform hover:scale-110 transition-all duration-200',
    
    // Edit Form Styles
    ModalBody: 'px-8 pt-6',
    Form: 'space-y-6',
    FormGroup: 'space-y-2',
    Label: 'text-black font-black text-sm uppercase tracking-widest',
    Input: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:shadow-[4px_4px_0px_0px_#3b82f6] transition-all duration-200',
    Select: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold focus:outline-none focus:border-blue-500 focus:shadow-[4px_4px_0px_0px_#3b82f6] transition-all duration-200',
    TextArea: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:shadow-[4px_4px_0px_0px_#3b82f6] transition-all duration-200 resize-none',
    
    // Modal Button Group
    ButtonGroup: 'flex justify-end gap-4 py-6',
    CancelModalButton: 'bg-gray-200 hover:bg-gray-300 border-4 border-black text-black font-black py-3 px-6 uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200',
    SaveButton: 'bg-blue-500 hover:bg-blue-600 border-4 border-black text-white font-black py-3 px-8 uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2',
    
    // Edit Button
    EditButton: 'bg-blue-500 hover:bg-blue-600 border-3 border-black text-white font-black px-3 py-2 uppercase tracking-wide shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm',
};

const MyBookings: React.FC = () => {
    // Set app element for accessibility
    useEffect(() => {
        if (typeof window !== 'undefined') {
            Modal.setAppElement('body');
        }
    }, []);

   // Use Zustand booking store for user bookings
   const { 
       userBookings: bookings, 
       loading: bookingsLoading, 
       error: bookingsError, 
       fetchUserBookings, 
       cancelBooking, 
       updateBooking: updateBookingDetails 
   } = useBookingStore();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState<string | null>(null);
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({
        date: '',
        start_time: '',
        end_time: '',
        purpose: ''
    });
    
    // Cancel Confirmation Modal State
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
    
    // Tab state
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    
    const { user } = useAuthStore();

    // Fetch bookings when user is available
    useEffect(() => {
        console.log('MyBookings useEffect: user =', user);
        console.log('MyBookings useEffect: user.id type =', typeof user?.id);
        console.log('MyBookings useEffect: user.id length =', user?.id?.length);
        console.log('MyBookings useEffect: user object keys =', user ? Object.keys(user) : 'no user');
        if (user?.id) {
            console.log('MyBookings useEffect: fetching bookings for user.id =', user.id);
            console.log('MyBookings useEffect: user.id character by character =', user.id.split('').map((c, i) => `${i}:${c}`));
            fetchUserBookings(user.id);
        } else {
            console.log('MyBookings useEffect: user.id not available, skipping fetchUserBookings');
        }
    }, [user, fetchUserBookings]);

    // Load user's bookings and rooms function
    const loadUserData = async () => {
        if (!user?.id) return;
        
        try {
            // Fetch user bookings using Zustand store (this handles its own loading state)
            const bookingsPromise = fetchUserBookings(user.id);
            
            // Fetch rooms data for display
            setRoomsLoading(true);
            const roomsPromise = RoomService.getAllRooms();
            
            // Wait for both to complete
            const [, roomsData] = await Promise.all([bookingsPromise, roomsPromise]);
            setRooms(roomsData);
            
        } catch (error: any) {
            console.error('❌ Failed to load user data:', error);
            // Only handle room loading errors here, booking errors are handled by the store
            if (error.message && !error.message.includes('bookings')) {
                toast.error('Failed to load rooms data: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setRoomsLoading(false);
        }
    };

    // Handle bookings error from store
    useEffect(() => {
        if (bookingsError) {
            toast.error(bookingsError);
        }
    }, [bookingsError]);

    // Load user's bookings and rooms
    useEffect(() => {
        loadUserData();
    }, [user]);

    // Get room by ID
    const getRoomById = (roomId: string): Room | undefined => {
        return rooms.find(room => room.id === roomId || room.id === roomId);
    };

    // Handle booking cancellation - open confirmation modal
    const handleCancelBooking = async (booking: Booking) => {
        setBookingToCancel(booking);
        setIsCancelModalOpen(true);
    };

    // Confirm booking cancellation
    const confirmCancelBooking = async () => {
        if (!bookingToCancel) return;

        setCancelLoading(bookingToCancel._id);

        try {
            // Use the store's cancel booking method
            await cancelBooking(bookingToCancel._id);
            
            toast.success(`Booking for "${bookingToCancel.roomName}" has been cancelled successfully.`);
            
            // No need to refresh - the store already removes the booking
            
        } catch (error: any) {
            console.error('❌ Failed to cancel booking:', error);
            console.error('❌ Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            
            let errorMessage = 'Failed to cancel booking';
            let shouldRemoveFromList = false;
            
            if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to cancel this booking';
            } else if (error.response?.status === 404) {
                errorMessage = 'Booking not found or already cancelled';
                shouldRemoveFromList = true; // Remove from list since it doesn't exist
            } else if (error.response?.status === 400) {
                const responseData = error.response?.data;
                const message = responseData?.message || '';
                const code = responseData?.code || '';
                
                // Check for specific backend codes or messages indicating already cancelled
                if (code === 'INVALID_CANCELLATION' || 
                    message.toLowerCase().includes('already cancelled') ||
                    message.toLowerCase().includes('already canceled') ||
                    message.toLowerCase().includes('already') && message.toLowerCase().includes('cancel')) {
                    errorMessage = 'Booking has already been cancelled';
                    shouldRemoveFromList = true; // Remove from list since it's already cancelled
                } else {
                    errorMessage = message || 'Booking cannot be cancelled';
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            // If booking is already deleted/cancelled, remove it from the frontend list
            if (shouldRemoveFromList && bookingToCancel) {
                // Force a refresh by calling fetchUserBookings to sync with backend state
                if (user?.id) {
                    fetchUserBookings(user.id);
                }
                toast.success('Booking removed from list (was already cancelled)');
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setCancelLoading(null);
            setIsCancelModalOpen(false);
            setBookingToCancel(null);
        }
    };

    // Cancel booking cancellation (close modal)
    const cancelCancelBooking = () => {
        setIsCancelModalOpen(false);
        setBookingToCancel(null);
    };

    // Check if booking can be cancelled (only future bookings that haven't started)
    const canCancelBooking = (booking: Booking): boolean => {
        // First check if the current user owns this booking
        if (!user?.id || booking.userId !== user.id) {
            // ...existing code...
            return false;
        }
        
        const now = new Date();
        // Ensure we're comparing proper Date objects
        const startTime = booking.startTime instanceof Date ? booking.startTime : new Date(booking.startTime);
        // Can only cancel if the booking hasn't started yet
        const timeCheck = startTime > now;
        
    // ...existing code...
        return timeCheck;
    };

    // Handle edit booking
    const handleEditBooking = (booking: Booking) => {
    // ...existing code...
        
        setEditingBooking(booking);
        
        // Format date and time for form inputs
        const startDate = booking.startTime.toISOString().split('T')[0];
        const startTime = booking.startTime.toTimeString().slice(0, 5);
        const endTime = booking.endTime.toTimeString().slice(0, 5);
        
        setEditFormData({
            date: startDate,
            start_time: startTime,
            end_time: endTime,
            purpose: booking.description || ''
        });
        
        setIsEditModalOpen(true);
    };

    // Handle form input changes
    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle save edited booking
    const handleSaveBooking = async () => {
        if (!editingBooking) return;
        
        setEditLoading(true);
        try {
            // Debug user and booking information
            // ...existing code...
            
            // Combine date and time to create proper ISO datetime strings
            const selectedDate = new Date(editFormData.date);
            
            // Parse start time
            const [startHour, startMinute] = editFormData.start_time.split(':').map(Number);
            const startDateTime = new Date(selectedDate);
            startDateTime.setHours(startHour, startMinute, 0, 0);
            
            // Parse end time
            const [endHour, endMinute] = editFormData.end_time.split(':').map(Number);
            const endDateTime = new Date(selectedDate);
            endDateTime.setHours(endHour, endMinute, 0, 0);
            
            const updateData = {
                room_id: editingBooking.roomId,
                date: editFormData.date, // Keep as date string (YYYY-MM-DD)
                start_time: startDateTime.toISOString(), // Full ISO datetime
                end_time: endDateTime.toISOString(), // Full ISO datetime
                purpose: editFormData.purpose || undefined
            };
            
            // Use the store's update booking method
            await updateBookingDetails(editingBooking._id, updateData);
            
            toast.success(`Booking for "${editingBooking.roomName}" has been updated successfully.`);
            
            setIsEditModalOpen(false);
            setEditingBooking(null);
            
        } catch (error: any) {
            console.error('❌ Failed to update booking:', error);
            
            let errorMessage = 'Failed to update booking';
            
            if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to edit this booking';
            } else if (error.response?.status === 404) {
                errorMessage = 'Booking not found';
            } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || 'Invalid booking data';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setEditLoading(false);
        }
    };

    // Cancel edit modal
    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditingBooking(null);
        setEditFormData({
            date: '',
            start_time: '',
            end_time: '',
            purpose: ''
        });
    };

    // Split bookings into upcoming and past using useMemo for performance
    const { upcomingBookings, pastBookings } = useMemo(() => {
        const now = new Date();
        
        const upcoming = bookings.filter(booking => {
            try {
                const startTime = booking.startTime instanceof Date ? booking.startTime : new Date(booking.startTime);
                return startTime > now;
            } catch (error) {
                console.warn('MyBookings - Invalid startTime for booking:', booking);
                return false;
            }
        });
        
        const past = bookings.filter(booking => {
            try {
                const startTime = booking.startTime instanceof Date ? booking.startTime : new Date(booking.startTime);
                return startTime <= now;
            } catch (error) {
                console.warn('MyBookings - Invalid startTime for booking:', booking);
                return false;
            }
        });
        
        console.log('📊 MyBookings - Final results:', {
            total: bookings.length,
            upcoming: upcoming.length,
            past: past.length
        });
        
        return {
            upcomingBookings: upcoming,
            pastBookings: past
        };
    }, [bookings]);
    
    // Table columns for MyBookings - memoized for performance
    const columns = useMemo(() => [
        {
            accessorKey: 'roomName',
            header: 'Room',
            cell: ({ row }: { row: any }) => <div className="bg-red-500 text-white px-2 py-1 border-2 border-black font-black text-xs uppercase shadow-[1px_1px_0px_0px_#000] w-fit">{row.original.roomName}</div>,
        },
        {
            accessorKey: 'bookedBy',
            header: 'Booked By',
            cell: ({ row }: { row: any }) => <div className="font-bold text-gray-700">{row.original.bookedBy || user?.name || 'You'}</div>,
        },
        {
            accessorKey: 'startTime',
            header: 'Date & Time',
            cell: ({ row }: { row: any }) => {
                const [formattedStart, setFormattedStart] = React.useState('');
                const [formattedEnd, setFormattedEnd] = React.useState('');
                React.useEffect(() => {
                    setFormattedStart(new Date(row.original.startTime).toLocaleString());
                    setFormattedEnd(new Date(row.original.endTime).toLocaleString());
                }, [row.original.startTime, row.original.endTime]);
                return <div className="font-bold text-black"><div>{formattedStart}</div><div className="text-sm text-gray-600">to {formattedEnd}</div></div>;
            },
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }: { row: any }) => <div className="text-gray-600 max-w-48 truncate">{row.original.description || 'No description'}</div>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }: { row: any }) => <div className={`px-2 py-1 border-2 border-black font-black text-xs uppercase shadow-[1px_1px_0px_0px_#000] w-fit ${row.original.status === 'active' ? 'bg-green-500 text-white' : row.original.status === 'completed' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white'}`}>{row.original.status}</div>,
        },
    ], [user?.name]);

    const upcomingColumns = useMemo(() => [
        ...columns,
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: { row: any }) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEditBooking(row.original)} className={classes.EditButton}><FaEdit /> Edit</button>
                    <button onClick={() => handleCancelBooking(row.original)} disabled={cancelLoading === row.original._id} className={classes.CancelButton}>{cancelLoading === row.original._id ? (<><FaSpinner className="animate-spin" /> Cancelling...</>) : (<><FaTimes /> Cancel</>)}</button>
                </div>
            ),
        },
    ], [columns, cancelLoading]);

    return (
        <div className={classes.Container}>
            <div className={classes.Header}>
                <h1 className={classes.Title}>My Bookings</h1>
                <p className={classes.Subtitle}>
                    <MdMeetingRoom className="inline mr-2" />
                    Your Personal Meeting Schedule
                </p>
            </div>
            {/* Tab Buttons */}
            <div className="flex gap-4 mb-8">
                <button
                    className={`px-6 py-3 font-black uppercase tracking-wide border-4 border-black transition-all duration-200 cursor-pointer ${activeTab === 'upcoming' ? 'bg-red-500 text-white shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000]'}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming Meetings
                </button>
                <button
                    className={`px-6 py-3 font-black uppercase tracking-wide border-4 border-black transition-all duration-200 cursor-pointer ${activeTab === 'past' ? 'bg-red-500 text-white shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000]'}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past Meetings
                </button>
            </div>
            {(bookingsLoading || roomsLoading) ? (
                <div className={classes.LoadingContainer}>
                    <FaSpinner className={classes.LoadingSpinner} />
                    <p className="text-xl font-bold text-gray-600">Loading your bookings...</p>
                </div>
            ) : (
                <div>
                    {activeTab === 'upcoming' ? (
                        <div className={classes.SectionContainer}>
                            <div className={`${classes.SectionHeader} ${classes.UpcomingHeader}`}>
                                <h2 className={classes.SectionTitle}>Upcoming Meetings</h2>
                                <p className={classes.SectionSubtitle}>{upcomingBookings.length} meeting{upcomingBookings.length !== 1 ? 's' : ''} scheduled</p>
                            </div>
                            <div className={classes.SectionBody}>
                                {upcomingBookings.length === 0 ? (
                                    <div className={classes.EmptyContainer}>
                                        <FaCheckCircle className={classes.EmptyIcon} />
                                        <h3 className={classes.EmptyTitle}>No Upcoming Meetings</h3>
                                        <p className={classes.EmptySubtitle}>Schedule a new meeting to see it here</p>
                                    </div>
                                ) : (
                                    <GenericTable
                                        data={upcomingBookings}
                                        columns={upcomingColumns}
                                        loading={bookingsLoading || roomsLoading}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={classes.SectionContainer}>
                            <div className={`${classes.SectionHeader} ${classes.PastHeader}`}>
                                <h2 className={classes.SectionTitle}>Past Meetings</h2>
                                <p className={classes.SectionSubtitle}>{pastBookings.length} completed meeting{pastBookings.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className={classes.SectionBody}>
                                {pastBookings.length === 0 ? (
                                    <div className={classes.EmptyContainer}>
                                        <FaCheckCircle className={classes.EmptyIcon} />
                                        <h3 className={classes.EmptyTitle}>No Past Meetings</h3>
                                        <p className={classes.EmptySubtitle}>Completed meetings will appear here</p>
                                    </div>
                                ) : (
                                    <GenericTable
                                        data={pastBookings}
                                        columns={columns}
                                        loading={bookingsLoading || roomsLoading}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Edit Booking Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={handleCancelEdit}
                className={classes.ModalContent}
                overlayClassName={classes.ModalOverlay}
            >
                <div className={classes.ModalHeader}>
                    <h2 className={classes.ModalTitle}>
                        <FaEdit />
                        Edit Booking
                    </h2>
                    <button onClick={handleCancelEdit} className={classes.CloseButton}>
                        <FaTimes />
                    </button>
                </div>
                <div className={classes.ModalBody}>
                    <form className={classes.Form} onSubmit={(e) => { e.preventDefault(); handleSaveBooking(); }}>
                        <div className={classes.FormGroup}>
                            <label className={classes.Label}>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={editFormData.date}
                                onChange={handleEditFormChange}
                                className={classes.Input}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className={classes.FormGroup}>
                                <label className={classes.Label}>Start Time</label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={editFormData.start_time}
                                    onChange={handleEditFormChange}
                                    className={classes.Input}
                                    required
                                />
                            </div>
                            <div className={classes.FormGroup}>
                                <label className={classes.Label}>End Time</label>
                                <input
                                    type="time"
                                    name="end_time"
                                    value={editFormData.end_time}
                                    onChange={handleEditFormChange}
                                    className={classes.Input}
                                    required
                                />
                            </div>
                        </div>
                        <div className={classes.FormGroup}>
                            <label className={classes.Label}>Purpose (Optional)</label>
                            <textarea
                                name="purpose"
                                value={editFormData.purpose}
                                onChange={handleEditFormChange}
                                className={classes.TextArea}
                                placeholder="Meeting purpose or description..."
                                rows={3}
                            />
                        </div>
                        <div className={classes.ButtonGroup}>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className={classes.CancelModalButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={editLoading}
                                className={classes.SaveButton}
                            >
                                {editLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
            {/* Cancel Booking Confirmation Modal */}
            <Modal
                isOpen={isCancelModalOpen}
                onRequestClose={cancelCancelBooking}
                className={classes.ModalContent}
                overlayClassName={classes.ModalOverlay}
            >
                <div className={classes.ModalHeader}>
                    <h2 className={classes.ModalTitle}>
                        <FaExclamationTriangle />
                        Cancel Booking
                    </h2>
                    <button onClick={cancelCancelBooking} className={classes.CloseButton}>
                        <FaTimes />
                    </button>
                </div>
                <div className={classes.ModalBody}>
                    <p className="text-lg mb-6 text-center">
                        Are you sure you want to cancel the booking for{' '}
                        <strong>"{bookingToCancel?.roomName}"</strong>?
                    </p>
                    <p className="text-sm text-gray-600 mb-6 text-center">
                        This action cannot be undone.
                    </p>
                    <div className={classes.ButtonGroup}>
                        <button
                            onClick={cancelCancelBooking}
                            className={classes.CancelModalButton}
                        >
                            Keep Booking
                        </button>
                        <button
                            onClick={confirmCancelBooking}
                            disabled={cancelLoading === bookingToCancel?._id}
                            className={classes.SaveButton}
                        >
                            {cancelLoading === bookingToCancel?._id ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                <>
                                    <FaTimes />
                                    Cancel Booking
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Simple export - AuthRedirectHandler handles auth
export default MyBookings;

