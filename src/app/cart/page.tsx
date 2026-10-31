'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2, Tag, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { SafeImage } from '@/src/components/SafeImage';
import { useStore } from '@/src/context/StoreContext';

export default function CartPage() {
  const {
    cartItems,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price || 50;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = subtotal > 150 ? 0 : cartItems.length > 0 ? 15 : 0;
  const taxAmount = Number(((subtotal - discountAmount) * 0.077).toFixed(2));
  const grandTotal = Number((subtotal - discountAmount + shippingFee + taxAmount).toFixed(2));

  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setApplyingPromo(true);
    setPromoError('');
    const result = await applyCoupon(promoCodeInput.trim(), subtotal);
    if (!result.ok) {
      setPromoError(result.error || 'Invalid promotional voucher code.');
    } else {
      setPromoCodeInput('');
    }
    setApplyingPromo(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/30 selection:text-[#171717]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="mb-8 flex items-end justify-between border-b border-[#171717]/10 pb-6">
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">
              Order Dossier
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#171717] tracking-tight">
              Selected Formulations Bag
            </h1>
          </div>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="font-mono text-[10px] uppercase tracking-wider text-[#171717]/40 hover:text-red-700 underline cursor-pointer transition-colors"
            >
              Empty Bag
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="my-16 border border-[#171717]/10 bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#171717]/15 text-[#B89555]">
              <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-2xl font-light text-[#171717]">
              Your selection is presently empty
            </h2>
            <p className="max-w-md mx-auto text-xs text-[#8A857D] leading-relaxed font-light">
              We invite you to peruse our Haute Parfumerie extractions and artisanal flavour systems.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/shop"
                className="bg-[#171717] px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
              >
                Browse Archive
              </Link>
              <Link
                href="/fragrances"
                className="border border-[#171717]/30 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-[#171717] hover:border-[#171717] transition-colors"
              >
                Fine Fragrances
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Free shipping bar */}
              <div className="border border-[#B89555]/30 bg-white p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#B89555] flex items-center gap-1.5 font-light text-[11px]">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    {remainingForFree > 0
                      ? `Add $${remainingForFree.toFixed(2)} more for complimentary insured courier delivery`
                      : 'Complimentary insured express courier unlocked.'}
                  </span>
                  <span className="font-mono text-[10px] text-[#171717]/50">
                    ${subtotal.toFixed(2)} / ${freeShippingThreshold}
                  </span>
                </div>
                <div className="h-1 w-full bg-[#171717]/10 overflow-hidden">
                  <div
                    className="h-full bg-[#B89555] transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              <div className="border border-[#171717]/10 bg-white divide-y divide-[#171717]/8">
                {cartItems.map(({ product, quantity, selectedVariation }) => {
                  const price = product.salePrice || product.price || 50;
                  const itemTotal = price * quantity;
                  return (
                    <div
                      key={`${product.id}-${selectedVariation || ''}`}
                      className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-16 shrink-0 overflow-hidden border border-[#171717]/10 bg-white">
                          <SafeImage
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-[#B89555]">
                            {product.category}
                          </span>
                          <Link
                            href={`/product/${product.slug}`}
                            className="block font-serif text-lg font-light text-[#171717] hover:text-[#B89555] transition-colors"
                          >
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-2 font-mono text-[10px] text-[#171717]/50">
                            <span>{product.sku}</span>
                            {selectedVariation && (
                              <>
                                <span>·</span>
                                <span>{selectedVariation}</span>
                              </>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-[#171717]/70">
                            ${price.toFixed(2)} each
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center border border-[#171717]/20 bg-white">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, quantity - 1)}
                            className="p-1.5 text-[#171717] hover:bg-[#171717]/5 transition-colors cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs font-medium">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, quantity + 1)}
                            className="p-1.5 text-[#171717] hover:bg-[#171717]/5 transition-colors cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className="font-mono text-sm font-medium text-[#171717]">
                            ${itemTotal.toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          aria-label="Remove item"
                          className="p-1.5 text-[#171717]/40 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-[#171717]/60">
                <Link href="/shop" className="hover:text-[#171717] underline font-light">
                  ← Return to Complete Atelier Archive
                </Link>
              </div>
            </div>

            {/* Right: Order Summary Box */}
            <div className="space-y-6">
              <div className="border border-[#171717]/10 bg-white p-6 space-y-6">
                <h3 className="font-serif text-xl font-light text-[#171717] border-b border-[#171717]/10 pb-3">
                  Summary of Acquisition
                </h3>

                {/* Promo Code Input */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1.5 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-[#B89555]" />
                    <span>Promotional or Atelier Voucher</span>
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                      <div>
                        <strong>{appliedCoupon.code}</strong> applied (-${appliedCoupon.discountAmount.toFixed(2)})
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="font-mono text-[10px] uppercase tracking-wider text-red-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        placeholder="e.g. LUXURY10"
                        className="flex-1 border border-[#171717]/20 px-3 py-2 text-xs uppercase font-mono focus:border-[#171717] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={applyingPromo || !promoCodeInput.trim()}
                        className="bg-[#171717] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] disabled:opacity-40 hover:bg-[#B89555] transition-colors cursor-pointer"
                      >
                        {applyingPromo ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}
                  {promoError && (
                    <p className="mt-1 font-mono text-[10px] text-red-600">{promoError}</p>
                  )}
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-2.5 text-xs text-[#171717]/75 border-t border-[#171717]/10 pt-4 font-light">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-[#171717] font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-medium">
                      <span>Voucher Discount</span>
                      <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Express Worldwide Courier</span>
                    <span className="font-mono text-[#171717]">
                      {shippingFee === 0 ? 'Complimentary' : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Swiss VAT (7.7%)</span>
                    <span className="font-mono text-[#171717]">${taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-[#171717]/10 pt-3 flex items-baseline justify-between text-base font-medium text-[#171717]">
                    <span className="font-serif text-lg">Total</span>
                    <span className="font-mono text-xl">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 bg-[#171717] py-3.5 font-mono text-[11px] uppercase tracking-[0.15em] text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
                >
                  Proceed to Checkout <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Guarantees Box */}
              <div className="border border-[#171717]/10 bg-white p-5 space-y-2.5 font-light text-xs text-[#171717]/70">
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-[#B89555]" />
                  <span>Insured climate-controlled global courier dispatch.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-[#B89555]" />
                  <span>Secure SSL transaction with end-to-end encryption.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
