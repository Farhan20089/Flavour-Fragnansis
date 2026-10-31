'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShieldCheck, Lock, Truck, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { SafeImage } from '@/src/components/SafeImage';
import { useStore } from '@/src/context/StoreContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cartItems, clearCart, appliedCoupon, addToast } = useStore();

  const [customerName, setCustomerName] = useState(session?.user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(session?.user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingCountry, setShippingCountry] = useState('Switzerland');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Card' | 'Bank Transfer'>('COD');
  const [orderNotes, setOrderNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price || 50;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = subtotal > 150 ? 0 : cartItems.length > 0 ? 15 : 0;
  const taxAmount = Number(((subtotal - discountAmount) * 0.077).toFixed(2));
  const grandTotal = Number((subtotal - discountAmount + shippingFee + taxAmount).toFixed(2));

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setOrderError('Your formulation bag is empty.');
      return;
    }

    setSubmitting(true);
    setOrderError('');

    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        couponCode: appliedCoupon?.code || null,
        paymentMethod,
        notes: orderNotes || null,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedVariation: item.selectedVariation || null,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success && data.data?.orderNumber) {
        clearCart();
        addToast(
          'Acquisition Confirmed',
          `Order #${data.data.orderNumber} logged and scheduled for atelier formulation preparation.`,
          'success'
        );
        router.push(`/orders/${data.data.orderNumber}?confirmed=true`);
      } else {
        setOrderError(data.error || 'Failed to complete acquisition. Please review your details.');
      }
    } catch {
      setOrderError('A communication error occurred while transmitting your order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/30 selection:text-[#171717]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#171717]/15 text-[#B89555]">
            <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-2xl font-light text-[#171717]">
            Your Bag is Empty
          </h2>
          <p className="text-xs text-[#8A857D] max-w-sm mx-auto font-light leading-relaxed">
            You cannot proceed to checkout without at least one formulation in your shopping bag.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex bg-[#171717] px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
            >
              Explore Catalogue
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/30 selection:text-[#171717]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-16">
        <div className="mb-8 border-b border-[#171717]/10 pb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#171717]/50 hover:text-[#171717] mb-3 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Return to Bag
          </Link>
          <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">
            Atelier Dispatch Protocol
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#171717] tracking-tight mt-1">
            Secure Acquisition Checkout
          </h1>
        </div>

        {orderError && (
          <div className="mb-6 border border-red-200 bg-red-50 p-4 font-mono text-xs text-red-800 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{orderError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Columns: Contact, Shipping, Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Customer Contact */}
            <div className="border border-[#171717]/10 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
                <h3 className="font-serif text-lg font-light text-[#171717] flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#B89555]">01 /</span>
                  Client Identification
                </h3>
                {!session && (
                  <Link href="/login" className="font-mono text-[10px] uppercase tracking-wider text-[#B89555] hover:underline">
                    Sign in to Account
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Gabriel Vane"
                    className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="gabriel.vane@domain.com"
                    className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                    Direct Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+41 22 819 44 00"
                    className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="border border-[#171717]/10 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
                <h3 className="font-serif text-lg font-light text-[#171717] flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#B89555]">02 /</span>
                  Atelier Courier Destination
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                    Street Address &amp; Suite / Floor *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Rue de la Distillation 42, Atelier 3B"
                    className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="Geneva"
                    className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                    State / Canton
                  </label>
                  <input
                    type="text"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    placeholder="Geneva"
                    className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                    Postal / Zip Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingZip}
                    onChange={(e) => setShippingZip(e.target.value)}
                    placeholder="1204"
                    className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    placeholder="Switzerland"
                    className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="border border-[#171717]/10 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
                <h3 className="font-serif text-lg font-light text-[#171717] flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#B89555]">03 /</span>
                  Settlement Protocol
                </h3>
              </div>

              <div className="space-y-3 text-xs font-light">
                <label className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors ${
                  paymentMethod === 'COD' ? 'border-[#171717] bg-[#FAF8F3]' : 'border-[#171717]/10 hover:border-[#171717]/30'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-0.5"
                  />
                  <div>
                    <strong className="block font-serif text-sm font-medium text-[#171717]">
                      Cash on Delivery (COD) / Verified Atelier Invoice
                    </strong>
                    <span className="text-[#8A857D] text-xs block mt-0.5">
                      Pay directly upon courier reception or corporate Net-30 invoice upon verification.
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors ${
                  paymentMethod === 'Bank Transfer' ? 'border-[#171717] bg-[#FAF8F3]' : 'border-[#171717]/10 hover:border-[#171717]/30'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Bank Transfer"
                    checked={paymentMethod === 'Bank Transfer'}
                    onChange={() => setPaymentMethod('Bank Transfer')}
                    className="mt-0.5"
                  />
                  <div>
                    <strong className="block font-serif text-sm font-medium text-[#171717]">
                      Direct Bank Wire Transfer (Swiss IBAN)
                    </strong>
                    <span className="text-[#8A857D] text-xs block mt-0.5">
                      Wire transfer details generated on pro-forma receipt. Orders dispatch upon settlement.
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors opacity-75 ${
                  paymentMethod === 'Card' ? 'border-[#171717] bg-[#FAF8F3]' : 'border-[#171717]/10'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Card"
                    checked={paymentMethod === 'Card'}
                    onChange={() => setPaymentMethod('Card')}
                    className="mt-0.5"
                  />
                  <div>
                    <strong className="block font-serif text-sm font-medium text-[#171717]">
                      Credit / Debit Card (Stripe Gateway)
                    </strong>
                    <span className="text-[#8A857D] text-xs block mt-0.5">
                      Direct card processing enabled upon gateway credential configuration.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                  Atelier Notes or Special Handling Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Include Certificate of Analysis in pouch, leave with reception..."
                  className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#171717]/10 bg-white p-6 space-y-6 sticky top-28">
              <h3 className="font-serif text-xl font-light text-[#171717] border-b border-[#171717]/10 pb-3">
                Review Formulations
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-[#171717]/8 pr-1 text-xs">
                {cartItems.map(({ product, quantity, selectedVariation }) => {
                  const price = product.salePrice || product.price || 50;
                  return (
                    <div key={`${product.id}-${selectedVariation || ''}`} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-8 shrink-0 overflow-hidden border border-[#171717]/10 bg-white">
                          <SafeImage
                            src={product.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="truncate">
                          <p className="font-serif text-sm font-light text-[#171717] truncate">{product.name}</p>
                          <p className="font-mono text-[9px] text-[#171717]/50 uppercase">
                            {quantity}x {selectedVariation ? `· ${selectedVariation}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-medium text-[#171717]">
                        ${(price * quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Financial Totals */}
              <div className="space-y-2 border-t border-[#171717]/10 pt-4 text-xs font-light text-[#171717]/75">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#171717] font-medium">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Courier Delivery</span>
                  <span className="font-mono text-[#171717]">
                    {shippingFee === 0 ? 'Complimentary' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Swiss VAT (7.7%)</span>
                  <span className="font-mono text-[#171717]">${taxAmount.toFixed(2)}</span>
                </div>

                <div className="border-t border-[#171717]/10 pt-3 flex items-baseline justify-between text-base font-medium text-[#171717]">
                  <span className="font-serif text-lg">Total Due</span>
                  <span className="font-mono text-2xl">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#171717] py-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[#FAF8F3] hover:bg-[#B89555] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Lock className="h-3 w-3" />
                <span>{submitting ? 'Transmitting Order...' : `Confirm Order · $${grandTotal.toFixed(2)}`}</span>
              </button>

              <div className="text-[10px] text-[#8A857D] text-center leading-relaxed font-light">
                By confirming your order, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[#171717]">Terms &amp; Conditions</Link>{' '}
                and <Link href="/privacy" className="underline hover:text-[#171717]">Privacy Policy</Link>.
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
