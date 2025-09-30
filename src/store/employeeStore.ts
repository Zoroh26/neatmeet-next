import { create } from 'zustand';
import type { Employee } from '../types/index';

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  setEmployees: (employees: Employee[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  loading: false,
  error: null,
  setEmployees: (employees) => set({ employees }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
