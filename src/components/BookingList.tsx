"use client";
import React from 'react';
import { FaSpinner, FaDoorOpen, FaCalendarPlus, FaEdit, FaUsers, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTrash } from 'react-icons/fa';
import type { Booking } from '../types/booking';
import type { Room } from '../types/index';

interface BookingListProps {
  bookings: Booking[];
  bookingsLoading: boolean;
  getRoomById: (id: string) => Room | undefined;
  onEditBooking?: (booking: Booking) => void;
  onCancelBooking?: (bookingId: string) => void;
  showActions?: boolean;
  currentUserId?: string;
}

const classes = {
  BookingsList: 'space-y-6',
  BookingsTitle: 'text-3xl font-black text-black uppercase tracking-widest mb-8 text-center',
  BookingCard: 'relative bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] transform transition-all duration-200',
  EmptyState: 'text-center py-16',
  EmptyIcon: 'text-8xl text-gray-400 mx-auto mb-6',
  EmptyTitle: 'text-2xl font-black text-gray-600 uppercase tracking-wide mb-4',
  EmptySubtitle: 'text-lg font-bold text-gray-500 uppercase',
  BookingTodayBadge: 'absolute -top-1 -right-1 z-20 bg-red-600 text-white text-xs font-black px-2 py-1 border-2 border-black uppercase shadow-[2px_2px_0px_0px_#000] transform',
  BookingTomorrowBadge: 'absolute -top-1 -right-1 z-20 bg-blue-600 text-white text-xs font-black px-2 py-1 border-2 border-black uppercase shadow-[2px_2px_0px_0px_#000] transform ',
  BookingCompletedBadge: 'absolute -top-1 -right-1 z-20 bg-gray-600 text-white text-xs font-black px-2 py-1 border-2 border-black uppercase shadow-[2px_2px_0px_0px_#000] transform  flex items-center gap-1',
  ActionButtons: 'flex gap-2 mt-3',
  EditButton: 'bg-blue-500 hover:bg-blue-600 border-2 border-black text-white font-black px-3 py-2 uppercase tracking-wide shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-xs',
  CancelButton: 'bg-red-500 hover:bg-red-600 border-2 border-black text-white font-black px-3 py-2 uppercase tracking-wide shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-xs',
};

const BookingList: React.FC<BookingListProps> = ({ 
  bookings, 
  bookingsLoading, 
  getRoomById, 
  onEditBooking, 
  onCancelBooking, 
  showActions = false,
  currentUserId 
}) => {
  return (
    <div className={classes.BookingsList}>
      {bookingsLoading ? (
        <div className="flex justify-center items-center py-20">
          <FaSpinner className="animate-spin text-6xl text-black" />
        </div>
      ) : bookings.length === 0 ? (
        <div className={classes.EmptyState}>
          <FaDoorOpen className={classes.EmptyIcon} />
          <h3 className={classes.EmptyTitle}>No Bookings Yet</h3>
          <p className={classes.EmptySubtitle}>Book a room above to get started</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[400px]">
          {/* Upcoming Meetings - Left Side */}
          <div className="flex-1 border-4 border-black bg-white shadow-[6px_6px_0px_0px_#000]">
            <div className="p-6 border-b-2 border-black bg-green-50">
              <h3 className="text-2xl font-black text-black uppercase tracking-wide flex items-center gap-3">
                <div className="w-4 h-4 bg-green-600 border-2 border-black"></div>
                Upcoming Meetings
              </h3>
            </div>
            <div className="p-6">
              {(() => {
                const now = new Date();
                const upcomingBookings = bookings.filter(booking => {
                  // Ensure we're comparing proper Date objects
                  const endTime = booking.endTime instanceof Date ? booking.endTime : new Date(booking.endTime);
                  return endTime > now;
                });
                return upcomingBookings.length === 0 ? (
                  <div className="text-center py-12 border-2 border-gray-400 bg-gray-50">
                    <FaCalendarPlus className="text-4xl text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-gray-600 mb-1">No Upcoming Meetings</h4>
                    <p className="text-gray-500 font-bold">Schedule your next meeting above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map(booking => {
                      if (!booking || !booking.roomId) return null;
                      const room = getRoomById(booking.roomId);
                      const startTime = booking.startTime instanceof Date ? booking.startTime : new Date(booking.startTime);
                      const endTime = booking.endTime instanceof Date ? booking.endTime : new Date(booking.endTime);
                      // Hydration-safe date formatting
                      const [isToday, setIsToday] = React.useState(false);
                      const [isTomorrow, setIsTomorrow] = React.useState(false);
                      const [dateStr, setDateStr] = React.useState('');
                      const [startStr, setStartStr] = React.useState('');
                      const [endStr, setEndStr] = React.useState('');
                      const [createdStr, setCreatedStr] = React.useState('');
                      React.useEffect(() => {
                        const now = new Date();
                        setIsToday(startTime.toDateString() === now.toDateString());
                        setIsTomorrow(startTime.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString());
                        setDateStr(startTime.toLocaleDateString());
                        setStartStr(startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
                        setEndStr(endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
                        setCreatedStr((booking.createdAt instanceof Date ? booking.createdAt : new Date(booking.createdAt)).toLocaleDateString());
                      }, [startTime, endTime, booking.createdAt]);
                      const canEdit = showActions && currentUserId && booking.userId === currentUserId;
                      return (
                        <div key={booking._id} className={classes.BookingCard}>
                          {/* Status Badge */}
                          {isToday && (
                            <div className={classes.BookingTodayBadge}>
                              Today
                            </div>
                          )}
                          {isTomorrow && (
                            <div className={classes.BookingTomorrowBadge}>
                              Tomorrow
                            </div>
                          )}
                          <div className="mb-3">
                            <h4 className="text-lg font-black text-black mb-2 flex items-center gap-2">
                              <FaDoorOpen className="text-green-600" />
                              {booking.roomName}
                            </h4>
                            <div className="text-sm font-bold text-black bg-green-600 text-white border-2 border-black px-2 py-1 inline-flex items-center gap-2">
                              <FaClock />
                              {dateStr} • {startStr} - {endStr}
                            </div>
                          </div>
                          {booking.description && (
                            <p className="text-black font-bold mb-3 flex items-center gap-2">
                              <FaEdit className="text-black" />
                              {booking.description}
                            </p>
                          )}
                          {room && (
                            <div className="text-sm font-bold text-black flex items-center gap-4 mb-2 bg-gray-100 border-2 border-black px-2 py-1">
                              <span className="flex items-center gap-1">
                                <FaUsers className="text-green-600" />
                                {room.capacity} people
                              </span>
                              <span className="flex items-center gap-1">
                                <FaMapMarkerAlt className="text-green-600" />
                                {room.location}
                              </span>
                            </div>
                          )}
                          <div className="text-xs font-bold text-gray-600 border-t-2 border-gray-300 pt-2">
                            Booked by: {booking.bookedBy} • {createdStr}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
          {/* Past Meetings - Right Side */}
          <div className="flex-1 border-4 border-black bg-gray-100 shadow-[6px_6px_0px_0px_#000]">
            <div className="p-6 border-b-2 border-black bg-gray-200">
              <h3 className="text-2xl font-black text-black uppercase tracking-wide flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-600 border-2 border-black"></div>
                Past Meetings
              </h3>
            </div>
            <div className="p-6">
              {(() => {
                const now = new Date();
                const pastBookings = bookings.filter(booking => {
                  // Ensure we're comparing proper Date objects
                  const endTime = booking.endTime instanceof Date ? booking.endTime : new Date(booking.endTime);
                  return endTime <= now;
                });
                return pastBookings.length === 0 ? (
                  <div className="text-center py-12 border-2 border-gray-400 bg-white">
                    <FaCheckCircle className="text-4xl text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-gray-600 mb-1">No Past Meetings</h4>
                    <p className="text-gray-500 font-bold">Completed meetings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map(booking => {
                      if (!booking || !booking.roomId) return null;
                      const room = getRoomById(booking.roomId);
                      const endTime = booking.endTime instanceof Date ? booking.endTime : new Date(booking.endTime);
                      const startTime = booking.startTime instanceof Date ? booking.startTime : new Date(booking.startTime);
                      // Hydration-safe date formatting
                      const [wasToday, setWasToday] = React.useState(false);
                      const [wasYesterday, setWasYesterday] = React.useState(false);
                      const [dateStr, setDateStr] = React.useState('');
                      const [startStr, setStartStr] = React.useState('');
                      const [endStr, setEndStr] = React.useState('');
                      const [createdStr, setCreatedStr] = React.useState('');
                      React.useEffect(() => {
                        const now = new Date();
                        setWasToday(endTime.toDateString() === now.toDateString());
                        setWasYesterday(endTime.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString());
                        setDateStr(startTime.toLocaleDateString());
                        setStartStr(startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
                        setEndStr(endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
                        setCreatedStr((booking.createdAt instanceof Date ? booking.createdAt : new Date(booking.createdAt)).toLocaleDateString());
                      }, [startTime, endTime, booking.createdAt]);
                      return (
                        <div key={booking._id} className={classes.BookingCard}>
                          {/* Completed Badge */}
                          <div className={classes.BookingCompletedBadge}>
                            <FaCheckCircle className="text-xs" />
                            Completed
                          </div>
                          <div className="mb-3">
                            <h4 className="text-lg font-black text-gray-700 mb-2 flex items-center gap-2">
                              <FaDoorOpen className="text-gray-600" />
                              {booking.roomName}
                            </h4>
                            <div className="text-sm font-bold text-white bg-gray-500 border-2 border-black px-2 py-1 inline-flex items-center gap-2">
                              <FaClock />
                              {wasToday ? 'Today' : wasYesterday ? 'Yesterday' : dateStr} • {startStr} - {endStr}
                            </div>
                          </div>
                          {booking.description && (
                            <p className="text-gray-700 font-bold mb-3 flex items-center gap-2">
                              <FaEdit className="text-gray-600" />
                              {booking.description}
                            </p>
                          )}
                          {room && (
                            <div className="text-sm font-bold text-gray-600 flex items-center gap-4 mb-2 bg-gray-200 border-2 border-gray-400 px-2 py-1">
                              <span className="flex items-center gap-1">
                                <FaUsers className="text-gray-500" />
                                {room.capacity} people
                              </span>
                              <span className="flex items-center gap-1">
                                <FaMapMarkerAlt className="text-gray-500" />
                                {room.location}
                              </span>
                            </div>
                          )}
                          <div className="text-xs font-bold text-gray-500 border-t-2 border-gray-300 pt-2">
                            Booked by: {booking.bookedBy} • {createdStr}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
