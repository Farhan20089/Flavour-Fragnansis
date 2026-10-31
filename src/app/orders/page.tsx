'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Package, Search, ArrowRight, Clock, CheckCircle2, Truck } from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';

interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  selectedVariation?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  trackingNumber?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const { data: session, status: authStatus } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupNumber, setLookupNumber] = useState('');
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    if (authStatus === 'loading') return;

    if (session?.user?.email) {
      fetch('/api/orders')
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data && Array.isArray(json.data)) {
            setOrders(json.data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session, authStatus]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupNumber.trim();
    if (!query) return;
    window.location.href = `/orders/${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/30 selection:text-[#171717]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="mb-8 border-b border-[#171717]/10 pb-6">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555]">
            Dispatch Telemetry
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#171717] tracking-tight mt-1">
            Order History &amp; Tracking
          </h1>
          <p className="text-xs text-[#8A857D] mt-1 font-light">
            Monitor formulation progress and insured courier dispatch from our Geneva atelier.
          </p>
        </div>

        {/* Quick Order Lookup Form */}
        <div className="mb-10 border border-[#171717]/10 bg-white p-6 sm:p-8 space-y-4">
          <div>
            <h3 className="font-serif text-xl font-light text-[#171717]">
              Track Any Order Formulation
            </h3>
            <p className="text-xs text-[#8A857D] font-light mt-1">
              Enter your order reference code (e.g. FF-261031-ABCD) provided in your acquisition receipt.
            </p>
          </div>
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-[#8A857D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={lookupNumber}
                onChange={(e) => setLookupNumber(e.target.value)}
                placeholder="Enter order reference code..."
                className="w-full border border-[#171717]/20 bg-white pl-10 pr-4 py-2.5 text-xs uppercase font-mono focus:border-[#B89555] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#171717] px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors cursor-pointer"
            >
              Inspect Order
            </button>
          </form>
          {lookupError && <p className="font-mono text-xs text-red-600">{lookupError}</p>}
        </div>

        {/* Authenticated Order History */}
        {session ? (
          <div className="space-y-4">
            <div className="border-b border-[#171717]/10 pb-2">
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#B89555]">
                Account Order Archive ({session.user?.email})
              </h3>
            </div>

            {loading ? (
              <div className="border border-[#171717]/10 bg-white p-8 text-center font-mono text-xs text-[#8A857D]">
                Querying atelier database...
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-[#171717]/10 bg-white p-10 text-center space-y-3">
                <Package className="h-8 w-8 text-[#171717]/30 mx-auto" />
                <p className="text-xs text-[#8A857D] font-light">
                  No orders associated with this client profile yet.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-block bg-[#171717] px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
                  >
                    Explore Formulary
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-[#171717]/10 bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-[#171717]">
                          #{order.orderNumber}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-[#8A857D]">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                      <div className="text-xs text-[#171717]/75 font-light pt-1">
                        {order.items.slice(0, 2).map((i) => i.productName).join(' · ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-[#171717]/10">
                      <div className="text-right">
                        <span className="block font-mono text-base font-semibold text-[#171717]">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                        <span className="font-mono text-[9.5px] text-[#8A857D] uppercase tracking-wider">
                          {order.paymentStatus}
                        </span>
                      </div>

                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="flex items-center gap-1.5 border border-[#171717]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#171717] hover:border-[#171717] transition-colors"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="border border-[#171717]/10 bg-white p-8 text-center space-y-3">
            <h3 className="font-serif text-xl font-light text-[#171717]">
              Client Authentication Required
            </h3>
            <p className="text-xs text-[#8A857D] max-w-sm mx-auto font-light leading-relaxed">
              Sign in to view your complete order history, laboratory records, and live courier telemetry.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block bg-[#171717] px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
