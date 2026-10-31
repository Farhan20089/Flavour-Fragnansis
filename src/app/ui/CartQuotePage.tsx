'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { StoreProvider, useStore } from '@/src/context/StoreContext';

function CartQuoteContent() {
  const { cartItems, updateCartQuantity, removeFromCart, submitInquiry } = useStore();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const totalUnits = cartItems.reduce((total, item) => total + item.quantity, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const formData = new FormData(event.currentTarget);
    const lineItems = cartItems.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity,
    }));

    try {
      await submitInquiry({
        name: String(formData.get('name') || ''),
        company: String(formData.get('company') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        country: '',
        productName: cartItems.map(({ product }) => product.name).join(', '),
        quantity: String(formData.get('quantity') || `${totalUnits} requested units`),
        application: String(formData.get('application') || ''),
        message: [
          'Formal purchase inquiry / PO request submitted from the quote cart.',
          String(formData.get('message') || ''),
          `Cart quantities: ${totalUnits} units across ${cartItems.length} products.`,
        ].filter(Boolean).join('\n'),
        attachmentUrl: '',
        inquiryType: 'Purchase Inquiry / PO Request',
        cartItemsJson: JSON.stringify(lineItems),
        estimatedTotal: 'Quote pending',
      });
      setSubmitted(true);
    } catch (submitError) {
      console.error('Unable to submit purchase inquiry:', submitError);
      setError('We could not submit your purchase inquiry. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_10%_10%,rgba(16,185,129,0.1),transparent_32%),#FAF9F6]">
      <header className="border-b border-emerald-900/10 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="font-display text-xl font-semibold text-[#0F2922]">SK Group of Company</Link>
          <Link href="/admin" className="text-xs font-semibold text-emerald-800 hover:text-violet-700">Admin Portal</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Link href="/flavours" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-violet-700">
          <ArrowLeft className="h-4 w-4" /> Continue exploring
        </Link>
        <div className="mt-5 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Business purchasing</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#0F2922] sm:text-5xl">Quote cart & purchase inquiry</h1>
          <p className="mt-3 text-sm leading-6 text-[#0F1E19]/65">Review the formulations and quantities, then send a formal inquiry to our commercial team.</p>
        </div>

        {submitted ? (
          <section role="status" className="mt-10 rounded-3xl border border-emerald-200 bg-white/80 p-8 shadow-xl sm:p-12">
            <CheckCircle2 className="h-10 w-10 text-emerald-700" />
            <h2 className="mt-4 font-display text-3xl font-semibold text-[#0F2922]">Purchase inquiry received</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#0F1E19]/70">Your request has been recorded for the Admin Portal. Pricing and lead time will be confirmed by our team.</p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">Back to home <ArrowRight className="h-4 w-4" /></Link>
          </section>
        ) : cartItems.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-emerald-900/10 bg-white/75 p-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-10 w-10 text-emerald-700" />
            <h2 className="mt-4 font-display text-2xl font-semibold text-[#0F2922]">Your quote cart is empty</h2>
            <p className="mt-2 text-sm text-[#0F1E19]/65">Add products from the catalogue to prepare a bulk pricing or PO inquiry.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/flavours" className="rounded-full bg-emerald-800 px-5 py-3 text-xs font-semibold text-white">Explore flavours</Link>
              <Link href="/fragrances" className="rounded-full border border-violet-300 px-5 py-3 text-xs font-semibold text-violet-800">Explore fragrances</Link>
            </div>
          </section>
        ) : (
          <div className="mt-9 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-3xl border border-white bg-white/75 p-5 shadow-[0_16px_50px_rgba(15,41,34,0.07)] backdrop-blur-md sm:p-7">
              <div className="flex items-center justify-between gap-3 border-b border-emerald-900/10 pb-4">
                <h2 className="font-display text-2xl font-semibold text-[#0F2922]">Selected formulations</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{totalUnits} units</span>
              </div>
              <ul className="divide-y divide-emerald-900/10">
                {cartItems.map(({ product, quantity }) => (
                  <li key={product.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xl font-semibold text-[#0F2922]">{product.name}</p>
                      <p className="mt-1 font-mono text-[11px] text-[#0F1E19]/55">{product.sku}</p>
                      <p className="mt-1 text-xs text-[#0F1E19]/60">{product.category} · {product.productType}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="inline-flex items-center rounded-full border border-emerald-900/15 bg-white">
                        <button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => updateCartQuantity(product.id, quantity - 1)} className="rounded-l-full p-2.5 text-emerald-800 hover:bg-emerald-50"><Minus className="h-4 w-4" /></button>
                        <span className="min-w-10 text-center font-mono text-sm tabular-nums">{quantity}</span>
                        <button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => updateCartQuantity(product.id, quantity + 1)} className="rounded-r-full p-2.5 text-emerald-800 hover:bg-emerald-50"><Plus className="h-4 w-4" /></button>
                      </div>
                      <button type="button" aria-label={`Remove ${product.name}`} onClick={() => removeFromCart(product.id)} className="rounded-full p-2.5 text-rose-700 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-amber-950">Estimated bulk quote</span>
                  <span className="font-display text-xl font-bold text-amber-900">Quote pending</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-amber-950/70">No unit price is configured for these products. Our team will confirm pricing, MOQ, and shipping against your requested application.</p>
              </div>
            </section>

            <form onSubmit={handleSubmit} className="rounded-3xl border border-white bg-white/80 p-5 shadow-[0_16px_50px_rgba(124,58,237,0.08)] backdrop-blur-md sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Formal B2B inquiry</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#0F2922]">Request pricing / submit PO details</h2>
              <div className="mt-5 grid gap-4">
                <label className="text-xs font-semibold text-[#0F2922]">Contact name
                  <input name="name" required maxLength={120} autoComplete="name" className="mt-1.5 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10" />
                </label>
                <label className="text-xs font-semibold text-[#0F2922]">Company name
                  <input name="company" required maxLength={160} autoComplete="organization" className="mt-1.5 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10" />
                </label>
                <label className="text-xs font-semibold text-[#0F2922]">Business email
                  <input name="email" type="email" required maxLength={160} autoComplete="email" className="mt-1.5 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10" />
                </label>
                <label className="text-xs font-semibold text-[#0F2922]">Desired volume
                  <input name="quantity" required maxLength={100} placeholder="e.g. 100 kg bulk or 5 kg sample" className="mt-1.5 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10" />
                </label>
                <label className="text-xs font-semibold text-[#0F2922]">Application type
                  <input name="application" required maxLength={300} placeholder="e.g. Beverage, Fine Perfumery, Bakery" className="mt-1.5 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10" />
                </label>
                <label className="text-xs font-semibold text-[#0F2922]">PO reference / project details <span className="font-normal text-[#0F1E19]/50">(optional)</span>
                  <textarea name="message" rows={3} maxLength={3000} placeholder="Include a purchase order reference, target date, or delivery requirements." className="mt-1.5 w-full resize-y rounded-xl border border-emerald-900/15 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10" />
                </label>
                {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
                <button type="submit" disabled={pending} className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] disabled:cursor-wait disabled:opacity-60">
                  {pending ? 'Submitting…' : 'Submit Purchase Inquiry / PO Request'} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-[11px] leading-5 text-[#0F1E19]/55">Submitting sends the selected products and quantities to our secure inquiry queue.</p>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

export function CartQuotePage() {
  return (
    <StoreProvider>
      <CartQuoteContent />
    </StoreProvider>
  );
}
