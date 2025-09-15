"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Removed legacy AuthProvider import
import ConditionalNavBar from "../components/ConditionalNavBar";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const queryClient = new QueryClient();

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { checkSession } = useAuthStore();
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConditionalNavBar />
      {children}
    </QueryClientProvider>
  );
}
