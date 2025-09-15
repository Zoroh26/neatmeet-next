import api from './api';
import type { Booking, CreateBookingRequest, BookingResponse, BookingsListResponse } from '../types/booking';

// Helper to normalize booking objects
function normalizeBooking(booking: any): Booking {
    return {
        ...booking,
        _id: booking._id || booking.id,
        id: booking.id || booking._id,
        roomId: booking.room_id?._id || booking.roomId,
        roomName: booking.room_id?.name || booking.roomName || 'Unknown Room',
        startTime: new Date(booking.start_time || booking.startTime),
        endTime: new Date(booking.end_time || booking.endTime),
        description: booking.purpose || booking.description,
        bookedBy: booking.user_id?.name || booking.bookedBy || 'Unknown User',
        userId: booking.user_id?._id || booking.user_id?.id || booking.userId,
        createdAt: new Date(booking.createdAt),
        updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : undefined,
        status: booking.status || 'active'
    };
}


class BookingService {
    async createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
        try {
            const response = await api.post('/bookings/v1/booking', bookingData);
            return response.data;
        } catch (error: any) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('❌ BookingService: Create booking error:', errorMsg);
            throw error;
        }
    }

    private extractBookings(data: any): Booking[] {
        const rawBookings = data?.data ?? data?.bookings ?? [];
        return Array.isArray(rawBookings) ? rawBookings.map(normalizeBooking) : [];
    }

    async getUserBookings(params?: {
        page?: number;
        userId: string;
        limit?: number;
        status?: string;
    }): Promise<BookingsListResponse> {
        try {
            const userId = params?.userId;
            console.log('BookingService.getUserBookings: userId =', userId);
            // Remove userId from params to avoid duplication in query string
            const { userId: _, ...queryParams } = params || {};
            const url = `/bookings/v1?employee=${userId}`; // Use 'employee' parameter to match backend
            const response = await api.get(url, { params: queryParams });
            console.log('BookingService.getUserBookings: API response =', response.data);
            const extractedBookings = this.extractBookings(response.data);
            console.log('BookingService.getUserBookings: Extracted bookings =', extractedBookings.map(b => ({
                id: b.id,
                _id: b._id,
                userId: b.userId,
                roomName: b.roomName,
                status: b.status
            })));
            console.log('BookingService.getUserBookings: Requesting user ID =', userId);
            return {
                ...response.data,
                bookings: extractedBookings
            };
        } catch (error: any) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('BookingService: Get user bookings error:', errorMsg);
            throw error;
        }
    }

    async getAllBookings(params?: {
        page?: number;
        limit?: number;
        roomId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<BookingsListResponse> {
        try {
            const response = await api.get('/bookings/v1/', { params });
            return {
                ...response.data,
                bookings: this.extractBookings(response.data)
            };
        } catch (error: any) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('BookingService: Get all bookings error:', errorMsg);
            throw error;
        }
    }

    async updateBooking(bookingId: string, updateData: Partial<CreateBookingRequest>): Promise<BookingResponse> {
        try {
            // ...existing code...
            const userSession = sessionStorage.getItem('currentUser');
            const response = await api.put(`/bookings/v1/${bookingId}`, updateData);
            // Backend returns { success: true, message: "...", data: updatedBooking }
            const rawBooking = response.data.data;
            const normalizedBooking = normalizeBooking(rawBooking);
            
            console.log('📝 BookingService: updateBooking normalization:', {
                raw: rawBooking,
                normalized: normalizedBooking,
                hasRawId: !!rawBooking?.id,
                hasRaw_id: !!rawBooking?._id,
                hasNormalizedId: !!normalizedBooking?.id,
                hasNormalized_id: !!normalizedBooking?._id
            });
            
            return {
                booking: normalizedBooking,
                message: response.data.message
            };
        } catch (error: any) {
            console.error('❌ BookingService: Update booking error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                bookingId,
                updateData
            });
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('BookingService: Update booking error:', errorMsg);
            throw error;
        }
    }

    async cancelBooking(bookingId: string): Promise<void> {
        try {
            // ...existing code...
            // First, let's get the booking details to see who owns it
            const bookingResponse = await api.get(`/bookings/v1/${bookingId}`);
            await api.delete(`/bookings/v1/${bookingId}`);
        } catch (error) {
            console.error('❌ BookingService: Cancel booking error:', error);
            throw error;
        }
    }
}

export default new BookingService();
