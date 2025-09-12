import api from "./api"

class RoomService{
    async getAllRooms(params?: {
        page?: number;
        limit?: number; 
        status?: 'available' | 'occupied' | 'maintenance';
        search?: string;
    }){
        try{
            // Add cache-busting parameter to force fresh data
            const paramsWithCacheBust = {
                ...params,
                _t: Date.now() // Cache buster
            };
            const response = await api.get('/rooms/v1/rooms',{params: paramsWithCacheBust});
            const rooms = Array.isArray(response.data.data)
                ? response.data.data.map((room: any) => ({
                    ...room,
                    id: room._id || room.id
                }))
                : [];
            return rooms;
        }catch(error:any){
            console.error('Error fetching rooms : ',error);
            throw error;
        }
    }


    async checkAvailability(startTime: string, endTime: string): Promise<any> {
        try {
            console.log('🔍 Checking room availability:', { startTime, endTime });
            
            const params = new URLSearchParams({
                start_time: startTime,
                end_time: endTime
            });
            
            const response = await api.get(`/rooms/v1/check-availability?${params.toString()}`);
            
            console.log('✅ Availability check result:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ RoomService: Check availability error:', error);
            throw error;
        }
    }

    async createRoom(roomData: {
        name: string;
        location: string;
        capacity: number;
        amenities: string[];
        description: string;
        status: 'available' | 'occupied' | 'maintenance';
    }){
        try{
            const response = await api.post('/rooms/v1/room',roomData);
            return response.data;
        }catch(error:any){
            console.error('Error creating room : ',error);
            throw error;
        }
    }

    async updateRoom(roomId: string, updateData: Partial<{
        name: string;
        location: string;
        capacity: number;
        amenities: string[];
        description: string;
        status: 'available' | 'occupied' | 'maintenance';
    }>) {
        try {
            console.log('RoomService.updateRoom payload:', { roomId, updateData }); // Debug log
            const response = await api.put(`/rooms/v1/${roomId}`, updateData);
            return response.data;
        } catch (error: any) {
            console.error('Error updating room:', error);
            throw error;
        }
    }

    async deleteRoom(roomId: string) {
        try {
            const response = await api.delete(`/rooms/v1/${roomId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error deleting room:', error);
            throw error;
        }
    }

}
export default new RoomService();
