import { create } from 'zustand';
import type { Room } from '../types/index';

interface RoomState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  setRooms: (rooms: Room[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  loading: false,
  error: null,
  setRooms: (rooms) => set({ rooms }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
