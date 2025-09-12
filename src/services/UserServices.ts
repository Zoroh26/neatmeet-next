import api from './api';
import type { Employee } from '../types';

class UserService {
    async getAllUsers(params?: {
        page?: number;
        limit?: number;
        role?: 'admin' | 'employee';
        search?: string;
    }) {
        try{
            const response = await api.get('/users/v1/',{params});
            return response.data.data;
        }catch(error:any){
            console.error('Error fetching users : ',error);
            throw error;
        }
    }

    async getUserById(userId: string) {
        try{
            const response = await api.get(`/users/v1/${userId}`);
            return response.data;
        }catch(error:any){
            console.error(`Error fetching user with ID ${userId}: `,error);
            throw error;
        }
}
    async createUser(data: Partial<Employee>) {
        try{
            const response = await api.post('/users/v1/',data);
            return response.data;
        }catch(error:any){
            console.error('Error creating user: ',error);
            throw error;
        
        }
    }
    async updateUser(userId: string, userData: Partial<{
        name: string;
        email: string;
        role: string;
        department?: string;
        designation?: string;
        password?: string;
    }>): Promise<any> {
        try {
            // Remove password if not provided or empty
            const dataToSend = { ...userData };
            if (!dataToSend.password || dataToSend.password.trim() === '') {
                delete dataToSend.password;
            }
            console.log('🔄 Original userData:', userData);
            console.log('🔄 DataToSend after filtering:', dataToSend);
            console.log('🔄 Updating user:', userId, dataToSend);
            const response = await api.put(`/users/v1/${userId}`, dataToSend);
            console.log('✅ User updated successfully:', response.data);
            return response.data.user || response.data;
        } catch (error: any) {
            console.error('❌ UserService: Update user error:', error);
            throw error;
        }
    }

    // Delete user
    async deleteUser(userId: string): Promise<void> {
        try {
            console.log('🔄 Deleting user:', userId);
            await api.delete(`/users/v1/${userId}`);
            console.log('✅ User deleted successfully');
        } catch (error: any) {
            console.error('❌ UserService: Delete user error:', error);
            throw error;
        }
    }

    

}
export default new UserService();