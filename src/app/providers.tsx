'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import { StoreProvider } from '@/src/context/StoreContext';
import { CartDrawer } from '@/src/components/CartDrawer';
import { AIChatbot } from '@/src/components/AIChatbot';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <StoreProvider>
        {children}
        <CartDrawer />
        <AIChatbot />
      </StoreProvider>
    </SessionProvider>
  );
}
