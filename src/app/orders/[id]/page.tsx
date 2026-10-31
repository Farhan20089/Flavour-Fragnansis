import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, Truck, Package, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { SafeImage } from '@/src/components/SafeImage';
import { prisma } from '@/src/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: RouteContext): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order #${id} Status — Flavour & Fragrances`,
  };
}

export default async function OrderDetailPage({ params }: RouteContext) {
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    include: {
      items: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  const steps = [
    { key: 'Pending', label: 'Order Confirmed', desc: 'Received & authorized' },
    { key: 'Processing', label: 'Laboratory Atelier', desc: 'Compounding & testing' },
    { key: 'Shipped', label: 'Dispatched', desc: 'En route via express courier' },
    { key: 'Delivered', label: 'Delivered', desc: 'Safely received' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Processing':
        return 1;
      case 'Shipped':
        return 2;
      case 'Delivered':
        return 3;
      case 'Cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const activeStepIdx = getStepIndex(order.orderStatus);

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/30 selection:text-[#171717]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#8A857D] hover:text-[#171717] mb-6 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Orders Archive
        </Link>

        {/* Order Header Card */}
        <div className="border border-[#171717]/10 bg-white p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#171717]/10 pb-6">
            <div className="space-y-1">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555]">
                Official Atelier Receipt
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#171717]">
                Order #{order.orderNumber}
              </h1>
              <p className="font-mono text-[11px] text-[#8A857D]">
                Transmitted on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>

            <div className="text-right">
              <span className="block font-mono text-2xl font-light text-[#171717]">
                ${order.totalAmount.toFixed(2)}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 border border-emerald-200">
                Settlement: {order.paymentStatus} ({order.paymentMethod})
              </span>
            </div>
          </div>

          {/* Stepper */}
          {order.orderStatus === 'Cancelled' ? (
            <div className="mt-6 border border-red-200 bg-red-50 p-4 font-mono text-xs text-red-700 text-center">
              This order has been cancelled and any inventory has been returned to stock.
            </div>
          ) : (
            <div className="mt-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {steps.map((st, i) => {
                  const isDone = i <= activeStepIdx;
                  const isCurrent = i === activeStepIdx;
                  return (
                    <div
                      key={st.key}
                      className={`p-4 border transition-all ${
                        isCurrent
                          ? 'border-[#171717] bg-[#FAF8F3]'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-[#171717]/10 bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#8A857D]" />
                        )}
                        <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#171717]">{st.label}</span>
                      </div>
                      <p className="text-[11px] font-light text-[#8A857D]">{st.desc}</p>
                    </div>
                  );
                })}
              </div>

              {order.trackingNumber && (
                <div className="mt-6 border border-[#B89555]/30 bg-[#F3EBDD] p-4 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#B89555] block">Express Courier Tracking</span>
                    <span className="font-mono text-[#171717] text-sm font-medium">{order.trackingNumber}</span>
                    {order.shippingCarrier && (
                      <span className="font-mono text-[11px] text-[#8A857D] ml-2">via {order.shippingCarrier}</span>
                    )}
                  </div>
                  <Truck className="h-5 w-5 text-[#B89555]" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Line Items & Shipping Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 border border-[#171717]/10 bg-white p-6 space-y-4">
            <h3 className="font-serif text-lg font-light text-[#171717] border-b border-[#171717]/10 pb-3">
              Order Formulation Dossier
            </h3>
            <div className="space-y-4 divide-y divide-[#171717]/8 text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden border border-[#171717]/10 bg-white">
                      <SafeImage
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-serif text-sm font-light text-[#171717]">{item.productName}</p>
                      <p className="font-mono text-[9.5px] text-[#8A857D] uppercase">
                        {item.sku} {item.selectedVariation ? `· ${item.selectedVariation}` : ''}
                      </p>
                      <p className="font-mono text-[10px] text-[#171717]/60 mt-0.5">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-medium text-[#171717]">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="border-t border-[#171717]/10 pt-4 space-y-2 text-xs font-light text-[#171717]/75">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-[#171717] font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({order.couponCode})</span>
                  <span className="font-mono">-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Courier Shipping</span>
                <span className="font-mono text-[#171717]">
                  {order.shippingFee === 0 ? 'Complimentary' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Swiss VAT (7.7%)</span>
                <span className="font-mono text-[#171717]">${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#171717]/10 pt-3 flex justify-between font-medium text-base text-[#171717]">
                <span className="font-serif text-lg">Total Due</span>
                <span className="font-mono text-xl">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Details */}
          <div className="space-y-6">
            <div className="border border-[#171717]/10 bg-white p-6 space-y-3 text-xs font-light">
              <h4 className="font-serif text-base font-light text-[#171717] border-b border-[#171717]/10 pb-2">
                Shipping Recipient
              </h4>
              <div>
                <strong className="block text-[#171717] font-medium">{order.customerName}</strong>
                <p className="text-[#8A857D] leading-relaxed mt-1">
                  {order.shippingAddress}<br />
                  {order.shippingCity}, {order.shippingZip}<br />
                  {order.shippingCountry}
                </p>
                <p className="mt-2 text-[#8A857D] font-mono">{order.customerPhone}</p>
                <p className="text-[#8A857D] font-mono">{order.customerEmail}</p>
              </div>
            </div>

            <div className="border border-[#171717]/10 bg-white p-5 text-xs text-[#8A857D] space-y-2 font-light">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#B89555]" />
                <span className="font-medium text-[#171717]">Atelier Concierge Assistance</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Contact our concierge at <a href="mailto:concierge@flavourandfragrances.com" className="underline text-[#171717]">concierge@flavourandfragrances.com</a> referencing order #{order.orderNumber}.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
