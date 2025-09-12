export interface Employee {
  id: string;
  name: string;
  email: string;
  designation: string;
  role: 'employee' | 'admin';
  user_id?: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  isInitialPassword?: boolean;
}

export interface Room {
    id: string;
    name: string;
    location: string;
    capacity: number;
    amenities: string[];
    status: 'available' | 'occupied' | 'maintenance';
    description: string;
}

export interface Booking {
    id: string;
    roomId: string;
    roomName: string;
    startTime: Date;
    endTime: Date;
    description: string;
    bookedBy: string;
    createdAt: Date;
}

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  designation: string;
  role: 'employee' | 'admin';
};

export interface ChangePasswordData {
  currentPassword?: string;
  newPassword?: string;
}

export interface ResetPasswordData {
  newPassword?: string;
}