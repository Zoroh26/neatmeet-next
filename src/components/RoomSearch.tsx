"use client";
import React, { useState } from 'react';
import { FaSearch, FaTimes, FaClock, FaCalendar, FaSpinner, FaDoorOpen, FaUsers, FaMapMarkerAlt, FaCogs } from 'react-icons/fa';
import { MdMeetingRoom } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import RoomService from '../services/RoomServices';
import 'react-datepicker/dist/react-datepicker.css';

interface AvailableRoom {
    id: string;
    name: string;
    location: string;
    capacity: number;
    description: string;
    amenities: string[];
    status: string;
    isAvailable: boolean;
}

interface SearchState {
    selectedDate: Date;
    startTime: Date | null;
    endTime: Date | null;
    isLoading: boolean;
    error: string | null;
    availableRooms: AvailableRoom[];
    totalAvailable: number;
    timeSlot: any;
    hasSearched: boolean;
}

const classes = {
    Container: 'bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] py-8 mb-8',
    Header: 'text-center mb-8',
    Title: 'text-4xl font-black text-black uppercase tracking-widest transform -skew-x-3 mb-4',
    Subtitle: 'text-lg font-bold text-white bg-red-500 border-4 border-black px-4 py-2 inline-block shadow-[4px_4px_0px_0px_#000] uppercase tracking-wide',
    
    // Search Form
    SearchForm: 'space-y-6 mb-8 ',
    FormRow: 'flex flex-row gap-6  justify-center flex-wrap',
    FormGroup: 'space-y-2',
    Label: 'text-black font-black text-sm uppercase tracking-widest flex items-center gap-2',
    DateInput: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold placeholder-gray-500 focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] transition-all duration-200',
    
    // Buttons
    ButtonGroup: 'flex gap-4 justify-center mt-6',
    SearchButton: 'bg-red-500 hover:bg-red-600 border-4 border-black text-white font-black sm:py-3 py-1 sm:px-8 px-2 uppercase tracking-wide shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center ',
    ClearButton: 'bg-gray-200 hover:bg-gray-300 border-4 border-black text-black font-black sm:py-3 py-1 sm:px-6 px-2 uppercase tracking-wide shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center',
    
    // Results
    ResultsHeader: 'text-center mb-6 bg-green-100 border-4 border-green-500 p-4 shadow-[4px_4px_0px_0px_#22c55e]',
    ResultsTitle: 'text-2xl font-black text-green-700 uppercase tracking-wide mb-2',
    ResultsSubtitle: 'text-green-600 font-bold',
    
    // Room Grid
    RoomsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    RoomCard: 'bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200',
    RoomHeader: 'mb-4',
    RoomName: 'text-xl font-black text-black uppercase tracking-wide mb-2',
    RoomLocation: 'text-gray-600 font-bold flex items-center gap-2 mb-2',
    RoomCapacity: 'text-gray-600 font-bold flex items-center gap-2 mb-4',
    RoomDescription: 'text-gray-700 font-bold mb-4 text-sm',
    AmenitiesContainer: 'flex flex-wrap gap-1 mb-4',
    AmenityTag: 'bg-red-500 border-2 border-black text-white text-xs font-bold px-2 py-1 uppercase shadow-[1px_1px_0px_0px_#000]',
    BookButton: 'w-full bg-red-500 hover:bg-red-600 border-4 border-black text-white font-black py-3 px-4 uppercase tracking-wide transition-all duration-200 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1',
    
    // States
    LoadingContainer: 'text-center py-12',
    LoadingSpinner: 'animate-spin text-6xl text-red-500 mx-auto mb-4',
    ErrorContainer: 'bg-red-100 border-4 border-red-500 text-red-700 px-6 py-4 font-black uppercase tracking-wide text-center shadow-[4px_4px_0px_0px_#ef4444]',
    EmptyContainer: 'text-center py-12 bg-gray-100 border-4 border-gray-300',
    EmptyIcon: 'text-6xl text-gray-400 mx-auto mb-4',
    EmptyTitle: 'text-2xl font-black text-gray-600 uppercase tracking-wide mb-2',
    EmptySubtitle: 'text-gray-500 font-bold',
};

interface RoomAvailabilitySearchProps {
    onBookRoom: (room: AvailableRoom, timeSlot: any) => void;
    openModalForRoom?: (roomIdx: number) => void;
}

const RoomAvailabilitySearch: React.FC<RoomAvailabilitySearchProps> = ({ onBookRoom, openModalForRoom }) => {
    const [searchState, setSearchState] = useState<SearchState>({
        selectedDate: new Date(),
        startTime: null,
        endTime: null,
        isLoading: false,
        error: null,
        availableRooms: [],
        totalAvailable: 0,
        timeSlot: null,
        hasSearched: false,
    });

    // Add business hours constraints
    const getBusinessHours = () => {
        const minBusinessTime = new Date();
        minBusinessTime.setHours(8, 0, 0, 0); // 8:00 AM
        
        const maxBusinessTime = new Date();
        maxBusinessTime.setHours(18, 0, 0, 0); // 10:00 PM
        
        return { minBusinessTime, maxBusinessTime };
    };

    // Validation function
    const validateSearch = (): boolean => {
        const { selectedDate, startTime, endTime } = searchState;

        if (!selectedDate || !startTime || !endTime) {
            setSearchState(prev => ({ ...prev, error: 'Please select date, start time, and end time' }));
            return false;
        }

        if (startTime >= endTime) {
            setSearchState(prev => ({ ...prev, error: 'End time must be after start time' }));
            return false;
        }

        // Check if start time is in the past
        const now = new Date();
        const selectedDateValue = new Date(selectedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const selectedDateOnly = new Date(selectedDateValue);
        selectedDateOnly.setHours(0, 0, 0, 0); // Start of selected date
        
        // If the selected date is today, check if the time is in the future
        if (selectedDateOnly.getTime() === today.getTime()) {
            if (startTime <= now) {
                setSearchState(prev => ({ ...prev, error: 'Start time must be in the future for today\'s bookings' }));
                return false;
            }
        }
        // If the selected date is in the past, reject it
        else if (selectedDateOnly < today) {
            setSearchState(prev => ({ ...prev, error: 'Cannot search for rooms on past dates' }));
            return false;
        }
        // If the selected date is in the future (tomorrow or later), allow any time

        // Check minimum duration (30 minutes)
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMinutes = durationMs / (1000 * 60);
        if (durationMinutes < 30) {
            setSearchState(prev => ({ ...prev, error: 'Minimum booking duration is 30 minutes' }));
            return false;
        }

        // Check maximum duration (8 hours)
        if (durationMinutes > 480) {
            setSearchState(prev => ({ ...prev, error: 'Maximum booking duration is 8 hours' }));
            return false;
        }

        return true;
    };

    // Handle search submission
    const handleSearch = async () => {
        console.log('🔍 Starting room availability search...');
        
        if (!validateSearch()) {
            return;
        }

        setSearchState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const { selectedDate, startTime, endTime } = searchState;
            
            // Combine selected date with selected times
            const startDateTime = new Date(selectedDate!);
            startDateTime.setHours(
                startTime!.getHours(),
                startTime!.getMinutes(),
                0,
                0
            );
            
            const endDateTime = new Date(selectedDate!);
            endDateTime.setHours(
                endTime!.getHours(),
                endTime!.getMinutes(),
                0,
                0
            );
            
            
            
            const response = await RoomService.checkAvailability(
                startDateTime.toISOString(),
                endDateTime.toISOString()
            );

           

            setSearchState(prev => ({
                ...prev,
                availableRooms: response.data || [],
                totalAvailable: response.totalAvailable || 0,
                timeSlot: response.timeSlot,
                hasSearched: true,
                error: null,
            }));

        } catch (error: any) {
            console.error('❌ Search failed:', error);
            
            let errorMessage = 'Failed to search for available rooms';
            
            if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Invalid search parameters';
            } else if (!error.response) {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            setSearchState(prev => ({
                ...prev,
                error: errorMessage,
                availableRooms: [],
                totalAvailable: 0,
                hasSearched: true,
            }));
        } finally {
            setSearchState(prev => ({ ...prev, isLoading: false }));
        }
    };

    // Handle clear/reset
    const handleClear = () => {
        setSearchState({
            selectedDate: new Date(),
            startTime: null,
            endTime: null,
            isLoading: false,
            error: null,
            availableRooms: [],
            totalAvailable: 0,
            timeSlot: null,
            hasSearched: false,
        });
    };

    // Handle date change
    const handleDateChange = (date: Date | null) => {
        if (date) {
            setSearchState(prev => ({ ...prev, selectedDate: date, error: null }));
        }
    };

    // Handle start time change
    const handleStartTimeChange = (time: Date | null) => {
        setSearchState(prev => ({ ...prev, startTime: time, error: null }));
    };

    // Handle end time change
    const handleEndTimeChange = (time: Date | null) => {
        setSearchState(prev => ({ ...prev, endTime: time, error: null }));
    };

    // Handle book room
    const handleBookRoom = (room: AvailableRoom) => {
        if (searchState.timeSlot) {
            onBookRoom(room, searchState.timeSlot);
        }
    };

    // Format duration for display
    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) {
            return `${hours}h ${mins}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${mins}m`;
        }
    };

    return (
        <div className={classes.Container}>
           

            {/* Search Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className={classes.SearchForm}>
                <div className={classes.FormRow}>
                    {/* Date Selection */}
                    <div className={classes.FormGroup}>
                        <label className={classes.Label}>
                            <FaCalendar />
                            Date
                        </label>
                        <DatePicker
                            selected={searchState.selectedDate}
                            onChange={handleDateChange}
                            dateFormat="MMMM d, yyyy"
                            minDate={new Date()}
                            maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 days ahead
                            className={classes.DateInput}
                            placeholderText="Select date"
                            required
                        />
                    </div>

                    {/* Start Time */}
                    <div className={classes.FormGroup}>
                        <label className={classes.Label}>
                            <FaClock />
                            Start Time
                        </label>
                        <DatePicker
                            selected={searchState.startTime}
                            onChange={handleStartTimeChange}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Start"
                            dateFormat="h:mm aa"
                            className={classes.DateInput}
                            placeholderText="Select start time"
                            minTime={getBusinessHours().minBusinessTime}
                            maxTime={getBusinessHours().maxBusinessTime}
                            required
                        />
                    </div>

                    {/* End Time */}
                    <div className={classes.FormGroup}>
                        <label className={classes.Label}>
                            <FaClock />
                            End Time
                        </label>
                        <DatePicker
                            selected={searchState.endTime}
                            onChange={handleEndTimeChange}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="End"
                            dateFormat="h:mm aa"
                            className={classes.DateInput}
                            placeholderText="Select end time"
                            minTime={searchState.startTime || getBusinessHours().minBusinessTime}
                            maxTime={getBusinessHours().maxBusinessTime}
                            required
                        />
                    </div>
                </div>

                {/* Error Message */}
                {searchState.error && (
                    <div className={classes.ErrorContainer}>
                        {searchState.error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className={classes.ButtonGroup}>
                    <button
                        type="submit"
                        disabled={searchState.isLoading}
                        className={classes.SearchButton}
                    >
                        {searchState.isLoading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <FaSearch />
                                Search Rooms
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={searchState.isLoading}
                        className={classes.ClearButton}
                    >
                        <FaTimes />
                        Clear
                    </button>
                </div>
            </form>

            {/* Loading State */}
            {searchState.isLoading && (
                <div className={classes.LoadingContainer}>
                    <FaSpinner className={classes.LoadingSpinner} />
                    <p className="text-gray-600 font-bold">Searching for available rooms...</p>
                </div>
            )}

            {/* Results */}
            {searchState.hasSearched && !searchState.isLoading && (
                <>
                    {searchState.availableRooms.length > 0 ? (
                        <>
                            {/* Results Header */}
                            <div className={classes.ResultsHeader}>
                                <h3 className={classes.ResultsTitle}>
                                    Found {searchState.totalAvailable} Available Rooms
                                </h3>
                                {searchState.timeSlot && (
                                    <p className={classes.ResultsSubtitle}>
                                        {new Date(searchState.timeSlot.start_time).toLocaleDateString()} • {' '}
                                        {new Date(searchState.timeSlot.start_time).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })} - {' '}
                                        {new Date(searchState.timeSlot.end_time).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })} • {' '}
                                        Duration: {formatDuration(searchState.timeSlot.duration_minutes)}
                                    </p>
                                )}
                            </div>

                            {/* Room Cards */}
                            <div className={classes.RoomsGrid}>
                                {searchState.availableRooms.map((room, idx) => (
                                    <div key={room.id ? room.id : idx} className={classes.RoomCard}>
                                        <div className={classes.RoomHeader}>
                                            <h4 className={classes.RoomName}>
                                                <FaDoorOpen className="inline mr-2" />
                                                {room.name}
                                            </h4>
                                            <p className={classes.RoomLocation}>
                                                <FaMapMarkerAlt />
                                                {room.location}
                                            </p>
                                            <p className={classes.RoomCapacity}>
                                                <FaUsers />
                                                Capacity: {room.capacity} people
                                            </p>
                                        </div>

                                        {room.description && (
                                            <p className={classes.RoomDescription}>
                                                {room.description}
                                            </p>
                                        )}

                                        {/* Amenities */}
                                        {room.amenities && room.amenities.length > 0 && (
                                            <div>
                                                <p className="text-black font-black text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                                                    <FaCogs />
                                                    Amenities
                                                </p>
                                                <div className={classes.AmenitiesContainer}>
                                                    {room.amenities.slice(0, 4).map((amenity, index) => (
                                                        <span key={room.id + '-' + amenity + '-' + index} className={classes.AmenityTag}>
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                    {room.amenities.length > 4 && (
                                                        <span className={classes.AmenityTag}>
                                                            +{room.amenities.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Book Button */}
                                        <button
                                            onClick={() => openModalForRoom ? openModalForRoom(idx) : handleBookRoom({ ...room, id: room.id ? room.id : String(idx) })}
                                            className={classes.BookButton}
                                        >
                                            Book This Room
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className={classes.EmptyContainer}>
                            <FaDoorOpen className={classes.EmptyIcon} />
                            <h3 className={classes.EmptyTitle}>No Rooms Available</h3>
                            <p className={classes.EmptySubtitle}>
                                No rooms are available for the selected time slot. Please try different times or dates.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RoomAvailabilitySearch;
