'use client';

import { StoreProvider, useStore } from '@/src/context/StoreContext';
import { AdminDashboard, AdminLoginForm } from '@/src/components/AdminDashboard';

function AdminPortalContent() {
  const { authLoading, isAdminAuthenticated } = useStore();

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F2922] text-sm text-white/75">
        Checking admin session…
      </main>
    );
  }

  return isAdminAuthenticated ? <AdminDashboard /> : <AdminLoginForm />;
}

export default function AdminPage() {
  return (
    <StoreProvider>
      <AdminPortalContent />
    </StoreProvider>
  );
}
