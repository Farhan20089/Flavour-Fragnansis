'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
} from 'lucide-react';

interface CouponData {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  timesUsed: number;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

export function AdminCouponsTab() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New coupon form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState('');
  const [formError, setFormError] = useState('');

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        active: true,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || 'Failed to create promotional code');
        return;
      }

      setModalOpen(false);
      setCode('');
      setDiscountValue(15);
      setMinOrderAmount(0);
      setMaxDiscount('');
      setUsageLimit('');
      setExpiresAt('');
      loadCoupons();
    } catch {
      setFormError('Failed to communicate with coupon registry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!window.confirm(`Are you sure you wish to delete promotion code ${couponCode}?`)) return;

    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  const handleToggleActive = async (coupon: CouponData) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...coupon,
          active: !coupon.active,
        }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, active: !coupon.active } : c))
        );
      }
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171717]/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-light text-[#171717]">
            Promotions &amp; Coupon Codes
          </h2>
          <p className="text-xs text-[#171717]/60">
            Author and configure promotional incentives, VIP perks, and seasonal campaign codes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadCoupons}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-full border border-[#171717]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:border-[#B89555] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="cursor-pointer flex items-center gap-1.5 rounded-full bg-[#171717] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#B89555]"
          >
            <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-xl border border-[#171717]/10 bg-white shadow-sm overflow-hidden">
        {loading && coupons.length === 0 ? (
          <div className="flex h-48 items-center justify-center space-x-2 text-xs text-[#171717]/60">
            <RefreshCw className="h-5 w-5 animate-spin text-[#B89555]" />
            <span>Loading active promotion codes…</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#171717]/50">
            No promotional codes created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#171717]/10 bg-[#FAF8F3] text-[10px] font-mono uppercase tracking-wider text-[#171717]/60">
                <tr>
                  <th className="px-5 py-3.5">Promo Code</th>
                  <th className="px-5 py-3.5">Discount Rate</th>
                  <th className="px-5 py-3.5">Minimum Order</th>
                  <th className="px-5 py-3.5">Max Cap</th>
                  <th className="px-5 py-3.5">Redemption Stats</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171717]/5">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#B89555]" />
                        <span className="font-mono text-sm font-bold tracking-wider text-[#171717]">
                          {c.code}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-[#171717]">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% Off`
                        : `$${c.discountValue.toFixed(2)} Off`}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      ${c.minOrderAmount.toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {c.maxDiscount ? `$${c.maxDiscount.toFixed(2)}` : 'No Cap'}
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px] text-[#171717]">
                      {c.timesUsed}{' '}
                      <span className="text-gray-400">
                        / {c.usageLimit ? c.usageLimit : '∞'} used
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`cursor-pointer inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                          c.active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border-gray-300'
                        }`}
                      >
                        {c.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{c.active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="cursor-pointer text-gray-400 hover:text-rose-600 p-1"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#B89555]">
                  Author New Privilege
                </span>
                <h3 className="font-serif text-xl font-light text-[#171717]">
                  Create Promotional Code
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="cursor-pointer p-1 rounded-full text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <p className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171717] mb-1">
                  Coupon Code (uppercase)
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VIP2026, SUMMER20"
                  className="w-full rounded border border-[#171717]/15 bg-[#FAF8F3] px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase outline-none focus:border-[#171717]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171717] mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full rounded border border-[#171717]/15 bg-[#FAF8F3] px-3 py-2 text-xs outline-none focus:border-[#171717]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#171717] mb-1">
                    Discount Value ({discountType === 'percentage' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={discountType === 'percentage' ? 100 : 1000}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full rounded border border-[#171717]/15 bg-[#FAF8F3] px-3 py-2 text-xs outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171717] mb-1">
                    Min Order Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full rounded border border-[#171717]/15 bg-[#FAF8F3] px-3 py-2 text-xs outline-none focus:border-[#171717]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171717] mb-1">
                    Max Discount Cap ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded border border-[#171717]/15 bg-[#FAF8F3] px-3 py-2 text-xs outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#171717] mb-1">
                  Usage Limit (Total redemptions)
                </label>
                <input
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Leave empty for unlimited"
                  className="w-full rounded border border-[#171717]/15 bg-[#FAF8F3] px-3 py-2 text-xs outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#171717] mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded border border-[#171717]/15 bg-[#FAF8F3] px-3 py-2 text-xs outline-none focus:border-[#171717]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer rounded-full bg-[#171717] px-5 py-2 font-semibold text-white hover:bg-[#B89555] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Activate Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

