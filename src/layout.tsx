import React from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';

export const AppLayout: React.FC<{
  children: React.ReactNode;
  isAdminView: boolean;
}> = ({ children, isAdminView }) => (
  <div className="min-h-screen flex flex-col justify-between selection:bg-[#C5A059]/25 selection:text-[#0F1E19]">
    {!isAdminView && <Navbar />}
    <main className="flex-1">{children}</main>
    {!isAdminView && (
      <>
        <Footer />
        <CartDrawer />
      </>
    )}
  </div>
);
