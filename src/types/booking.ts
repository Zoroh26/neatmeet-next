export interface Booking {
    _id: string;
    id: string;
    roomId: string;
    roomName: string;
    startTime: Date;
    endTime: Date;
    description?: string;
    bookedBy: string;
    userId: string;
    createdAt: Date;
    updatedAt?: Date;
    status: 'active' | 'cancelled' | 'completed';
}

export interface CreateBookingRequest {
    room_id: string;
    date: string;
    start_time: string;
    end_time: string;
    purpose?: string;
}

export interface BookingResponse {
    booking: Booking;
    message: string;
}

export interface BookingsListResponse {
    bookings: Booking[];
    total: number;
    page: number;
    limit: number;
}
