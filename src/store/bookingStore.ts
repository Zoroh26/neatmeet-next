import { create } from 'zustand';
import type { Booking, CreateBookingRequest } from '../types/booking';
import bookingService from '../services/BookingServices';

interface BookingState {
  bookings: Booking[];
  userBookings: Booking[];
  draftBooking: Partial<Booking> | null;
  loading: boolean;
  error: string | null;

  // Actions
  setBookings: (bookings: Booking[]) => void;
  setUserBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBookingInState: (booking: Booking) => void;
  deleteBookingInState: (id: string) => void;
  setDraftBooking: (draft: Partial<Booking> | null) => void;
  clearError: () => void;

  // Async actions
  fetchAllBookings: () => Promise<void>;
  fetchUserBookings: (userId: string) => Promise<void>;
  createBooking: (bookingData: CreateBookingRequest) => Promise<Booking>;
  updateBooking: (bookingId: string, updateData: Partial<CreateBookingRequest>) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  userBookings: [],
  draftBooking: null,
  loading: false,
  error: null,

  setBookings: (bookings) => set({ bookings }),
  setUserBookings: (bookings) => set({ userBookings: bookings }),
  addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBookingInState: (booking) => set((state) => ({
    bookings: state.bookings.map(b => b._id === booking._id ? booking : b),
    userBookings: state.userBookings.map(b => b._id === booking._id ? booking : b)
  })),
  deleteBookingInState: (id) => set((state) => ({
    bookings: state.bookings.filter(b => b._id !== id),
    userBookings: state.userBookings.filter(b => b._id !== id)
  })),
  setDraftBooking: (draft) => set({ draftBooking: draft }),
  clearError: () => set({ error: null }),

  fetchAllBookings: async () => {
    set({ loading: true, error: null });
    try {
      const allBookingsResponse = await bookingService.getAllBookings({});
      const validBookings = allBookingsResponse.bookings.filter(booking => booking && booking._id);
      set({ bookings: validBookings, loading: false });
    } catch (error: any) {
      set({ error: 'Failed to load bookings: ' + (error.response?.data?.message || error.message), loading: false });
    }
  },

  fetchUserBookings: async (userId) => {
    set({ loading: true, error: null });
    try {
      console.log('🔍 BookingStore: fetchUserBookings called with userId =', userId);
      const userBookingsResponse = await bookingService.getUserBookings({ userId });
      console.log('🔍 BookingStore: Raw bookings from API =', userBookingsResponse.bookings.length);
      
      const validBookings = userBookingsResponse.bookings.filter(booking => {
        const hasId = booking && booking._id;
        const userIdMatches = booking.userId === userId;
        const isNotCancelled = booking.status !== 'cancelled';
        console.log('🔍 BookingStore: Filtering booking =', {
          bookingId: booking?._id,
          bookingUserId: booking?.userId,
          requestedUserId: userId,
          status: booking?.status,
          hasId,
          userIdMatches,
          isNotCancelled,
          keep: hasId && userIdMatches && isNotCancelled
        });
        return hasId && userIdMatches && isNotCancelled;
      });
      
      console.log('🔍 BookingStore: Final valid bookings =', validBookings.length);
      set({ userBookings: validBookings, loading: false });
    } catch (error: any) {
      set({ error: 'Failed to load user bookings: ' + (error.response?.data?.message || error.message), loading: false });
    }
  },

  createBooking: async (bookingData: CreateBookingRequest) => {
    set({ error: null });
    try {
      const response = await bookingService.createBooking(bookingData);
      const newBooking = response.booking;
      set((state) => ({ bookings: [...state.bookings, newBooking], userBookings: [...state.userBookings, newBooking] }));
      return newBooking;
    } catch (error: any) {
      set({ error: 'Failed to create booking: ' + (error.response?.data?.message || error.message) });
      throw error;
    }
  },

  updateBooking: async (bookingId, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingService.updateBooking(bookingId, updateData);
      const updatedBooking = response.booking;
      if (!updatedBooking) {
        set({ error: 'Failed to update booking: No booking returned from API', loading: false });
        throw new Error('No booking returned from API');
      }
      
      console.log('🔄 BookingStore: Updating booking in state:', {
        bookingId,
        updatedBooking,
        hasId: !!updatedBooking.id,
        has_id: !!updatedBooking._id
      });
      
      set((state) => {
        console.log('🔄 BookingStore: Current state before update:', {
          bookingsCount: state.bookings.length,
          userBookingsCount: state.userBookings.length
        });
        
        const matchId = updatedBooking._id ?? updatedBooking.id;
        
        const updatedBookings = state.bookings.map(b => {
          if (!b) return b;
          const isMatch = (b._id === matchId || b.id === matchId);
          if (isMatch) {
            console.log('🔄 BookingStore: Matching booking found in bookings array:', { oldBooking: b, newBooking: updatedBooking });
          }
          return isMatch ? updatedBooking : b;
        });
        
        const updatedUserBookings = state.userBookings.map(b => {
          if (!b) return b;
          const isMatch = (b._id === matchId || b.id === matchId);
          if (isMatch) {
            console.log('🔄 BookingStore: Matching booking found in userBookings array:', { oldBooking: b, newBooking: updatedBooking });
          }
          return isMatch ? updatedBooking : b;
        });
        
        console.log('🔄 BookingStore: State after update:', {
          bookingsCount: updatedBookings.length,
          userBookingsCount: updatedUserBookings.length
        });
        
        return {
          bookings: updatedBookings,
          userBookings: updatedUserBookings,
          loading: false
        };
      });
      return updatedBooking;
    } catch (error: any) {
      set({ error: 'Failed to update booking: ' + (error.response?.data?.message || error.message), loading: false });
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      await bookingService.cancelBooking(bookingId);
      set((state) => ({
        bookings: state.bookings.filter(b => b._id !== bookingId),
        userBookings: state.userBookings.filter(b => b._id !== bookingId),
        loading: false
      }));
    } catch (error: any) {
      set({ error: 'Failed to cancel booking: ' + (error.response?.data?.message || error.message), loading: false });
      throw error;
    }
  },
}));
