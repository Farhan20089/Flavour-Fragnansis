'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
    imageUrl?: string;
  };
}

export function AdminReviewsTab() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending'>('All');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews?all=true');
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleApproval = async (review: ReviewItem) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: review.id, approved: !review.approved }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, approved: !review.approved } : r))
        );
      }
    } catch (err) {
      console.error('Failed to toggle review approval:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you wish to permanently delete this customer review?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const filtered = reviews.filter((r) => {
    if (statusFilter === 'Approved' && !r.approved) return false;
    if (statusFilter === 'Pending' && r.approved) return false;

    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.customerName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      (r.product?.name && r.product.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171717]/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-light text-[#171717]">
            Evaluations &amp; Customer Reviews
          </h2>
          <p className="text-xs text-[#171717]/60">
            Moderate client sensory feedback, verify authentic purchases, and manage public ratings.
          </p>
        </div>
        <button
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-[#171717]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:border-[#B89555] transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#171717]/10 bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, review comment, or product…"
            className="w-full rounded-md border border-[#171717]/15 bg-[#FAF8F3] pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#171717]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'Approved', 'Pending'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === tab
                  ? 'bg-[#171717] text-white font-semibold'
                  : 'bg-gray-100 text-[#171717]/70 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="rounded-xl border border-[#171717]/10 bg-white shadow-sm overflow-hidden">
        {loading && reviews.length === 0 ? (
          <div className="flex h-48 items-center justify-center space-x-2 text-xs text-[#171717]/60">
            <RefreshCw className="h-5 w-5 animate-spin text-[#B89555]" />
            <span>Loading reviews…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#171717]/50">
            No evaluations match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#171717]/10 bg-[#FAF8F3] text-[10px] font-mono uppercase tracking-wider text-[#171717]/60">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Reviewer</th>
                  <th className="px-5 py-3.5">Rating &amp; Sentiment</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Moderation Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171717]/5">
                {filtered.map((rev) => (
                  <tr key={rev.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#171717] truncate max-w-[200px]">
                        {rev.product?.name || 'Bespoke Formulation'}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500">
                        {rev.product?.sku || rev.productId}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-[#171717] flex items-center gap-1.5">
                        <span>{rev.customerName}</span>
                        {rev.verifiedPurchase && (
                          <span title="Verified Client">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5 text-amber-500 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {rev.title && (
                        <div className="font-semibold text-[#171717]">{rev.title}</div>
                      )}
                      <p className="text-[11px] text-gray-600 line-clamp-2 max-w-sm">
                        "{rev.comment}"
                      </p>
                    </td>

                    <td className="px-5 py-4 text-[11px] text-gray-500">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleApproval(rev)}
                        className={`cursor-pointer inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                          rev.approved
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {rev.approved ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{rev.approved ? 'Live' : 'Hidden'}</span>
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="cursor-pointer text-gray-400 hover:text-rose-600 p-1"
                        title="Delete Review"
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
    </div>
  );
};
