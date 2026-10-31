'use client';

import React, { useEffect } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    cartOpen,
    closeCart,
    clearCart,
    removeFromCart,
    updateCartQuantity,
  } = useStore();

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price || 50;
    return sum + price * item.quantity;
  }, 0);

  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  useEffect(() => {
    if (!cartOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cartOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-[60] transition-all duration-300 ${
        cartOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
      aria-hidden={!cartOpen}
    >
      <button
        type="button"
        onClick={closeCart}
        tabIndex={cartOpen ? 0 : -1}
        aria-label="Close shopping bag"
        className={`absolute inset-0 bg-[#171717]/60 backdrop-blur-xs transition-opacity duration-300 ${
          cartOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#FAF8F3] shadow-2xl transition-transform duration-300 ease-in-out border-l border-[#171717]/15 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Atelier Header */}
        <div className="flex items-center justify-between border-b border-[#171717]/10 bg-white px-6 py-5">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#B89555]">
              Atelier Selection
            </span>
            <h2 id="cart-title" className="font-serif text-2xl font-light text-[#171717] tracking-tight">
              Formulation Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close shopping bag"
            className="p-1.5 text-[#171717]/60 transition-colors hover:text-[#171717] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Tier */}
        {cartItems.length > 0 && (
          <div className="bg-[#FAF8F3] border-b border-[#171717]/10 px-6 py-3.5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#B89555] flex items-center gap-1.5 font-light text-[11px]">
                <Sparkles className="h-3 w-3 shrink-0" />
                {remainingForFreeShipping > 0
                  ? `Add $${remainingForFreeShipping.toFixed(2)} for complimentary courier delivery`
                  : 'Complimentary express courier unlocked'}
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
        )}

        {/* Cart Contents */}
        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center space-y-4">
            <div className="border border-[#171717]/15 p-4 text-[#B89555]">
              <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-xl font-light text-[#171717]">
              Your selection is empty
            </h3>
            <p className="max-w-xs text-xs text-[#8A857D] font-light leading-relaxed">
              Explore our Haute Parfumerie compositions and artisanal botanical taste solutions.
            </p>
            <div className="pt-2 w-full max-w-xs">
              <Link
                href="/shop"
                onClick={closeCart}
                className="inline-flex w-full items-center justify-center gap-2 bg-[#171717] px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
              >
                Browse Archive <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-2.5 bg-white/70 border-b border-[#171717]/8">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#B89555]">
                {itemCount} {itemCount === 1 ? 'Specimen' : 'Specimens'} Selected
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="font-mono text-[10px] uppercase tracking-wider text-[#171717]/40 hover:text-red-700 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <ul className="flex-1 space-y-1 overflow-y-auto px-6 py-4 divide-y divide-[#171717]/8">
              {cartItems.map(({ product, quantity, selectedVariation }) => {
                const unitPrice = product.salePrice || product.price || 50;
                const lineTotal = unitPrice * quantity;
                return (
                  <li
                    key={`${product.id}-${selectedVariation || ''}`}
                    className="flex gap-4 py-4 first:pt-0"
                  >
                    <div className="h-20 w-16 shrink-0 overflow-hidden border border-[#171717]/10 bg-white">
                      <SafeImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={closeCart}
                            className="font-serif text-base font-light text-[#171717] hover:text-[#B89555] transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <span className="font-mono text-xs font-medium text-[#171717]">
                            ${lineTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] text-[#171717]/50 uppercase">
                          <span>{product.sku}</span>
                          {selectedVariation && (
                            <>
                              <span>·</span>
                              <span>{selectedVariation}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#171717]/20 bg-white">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, quantity - 1)}
                            aria-label="Decrease quantity"
                            className="p-1 text-[#171717] hover:bg-[#171717]/5 transition-colors cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-6 text-center font-mono text-xs font-medium">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, quantity + 1)}
                            aria-label="Increase quantity"
                            className="p-1 text-[#171717] hover:bg-[#171717]/5 transition-colors cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          aria-label="Remove specimen"
                          className="p-1 text-[#171717]/40 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Bottom Checkout Actions */}
            <div className="border-t border-[#171717]/10 bg-white px-6 py-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-light text-[#171717]/80">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#171717]/60">
                  Subtotal
                </span>
                <span className="font-mono text-lg font-light text-[#171717]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-[#171717]/50 font-light leading-relaxed">
                Taxes, certificates, and insured dispatch finalized during checkout.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex items-center justify-center border border-[#171717]/30 py-3 font-mono text-[10px] uppercase tracking-widest text-[#171717] hover:border-[#171717] transition-colors"
                >
                  Review Dossier
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-1.5 bg-[#171717] py-3 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
                >
                  Checkout <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};
