'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';
import { Product } from '../../types';

interface AdminInventoryTabProps {
  onInventoryUpdated?: () => void;
}

function renderInventoryBadge(isOut: boolean, isLow: boolean) {
  if (isOut) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800">
        Depleted
      </span>
    );
  }
  if (isLow) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
        Low Reserve
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
      Nominal
    </span>
  );
}

export function AdminInventoryTab({ onInventoryUpdated }: AdminInventoryTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'LowStock' | 'OutOfStock'>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleRestock = async (productId: string, deltaAmount: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newStock = Math.max(0, (prod.stockQuantity ?? 50) + deltaAmount);
    setUpdatingId(productId);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newStock }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stockQuantity: newStock } : p))
        );
        if (onInventoryUpdated) onInventoryUpdated();
      }
    } catch (err) {
      console.error('Failed to update inventory:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = products.filter((p) => {
    const stock = p.stockQuantity ?? 50;
    const threshold = p.lowStockThreshold ?? 15;
    if (filterType === 'LowStock' && stock > threshold) return false;
    if (filterType === 'OutOfStock' && stock > 0) return false;

    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const lowStockCount = products.filter((p) => (p.stockQuantity ?? 50) <= (p.lowStockThreshold ?? 15)).length;
  const outOfStockCount = products.filter((p) => (p.stockQuantity ?? 50) === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171717]/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-light text-[#171717]">
            Warehouse &amp; Stock Inventory
          </h2>
          <p className="text-xs text-[#171717]/60">
            Monitor real-time compounding reserves, batch allotments, and automated low-stock warnings.
          </p>
        </div>
        <button
          onClick={loadInventory}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-[#171717]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] transition-colors hover:border-[#B89555] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterType('All')}
          className={`cursor-pointer rounded-xl border p-4 shadow-xs transition-all ${
            filterType === 'All' ? 'border-[#171717] bg-[#FAF8F3]' : 'border-[#171717]/10 bg-white'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-gray-500">Total Catalogued SKUs</span>
          <div className="font-serif text-2xl font-light text-[#171717] mt-1">{products.length}</div>
        </div>

        <div
          onClick={() => setFilterType('LowStock')}
          className={`cursor-pointer rounded-xl border p-4 shadow-xs transition-all ${
            filterType === 'LowStock'
              ? 'border-amber-500 bg-amber-50/60'
              : 'border-[#171717]/10 bg-white hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-800">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-2xl font-light text-amber-900 mt-1">{lowStockCount}</div>
        </div>

        <div
          onClick={() => setFilterType('OutOfStock')}
          className={`cursor-pointer rounded-xl border p-4 shadow-xs transition-all ${
            filterType === 'OutOfStock'
              ? 'border-rose-500 bg-rose-50/60'
              : 'border-[#171717]/10 bg-white hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rose-800">Out of Stock (Zero)</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-serif text-2xl font-light text-rose-900 mt-1">{outOfStockCount}</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search formulations by name, SKU, or category…"
          className="w-full rounded-md border border-[#171717]/15 bg-white pl-9 pr-3 py-2 text-xs outline-none focus:border-[#171717]"
        />
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border border-[#171717]/10 bg-white shadow-sm overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="flex h-48 items-center justify-center space-x-2 text-xs text-[#171717]/60">
            <RefreshCw className="h-5 w-5 animate-spin text-[#B89555]" />
            <span>Scanning warehouse database…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#171717]/50">
            No inventory items found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#171717]/10 bg-[#FAF8F3] text-[10px] font-mono uppercase tracking-wider text-[#171717]/60">
                <tr>
                  <th className="px-5 py-3.5">Product &amp; SKU</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Unit Price</th>
                  <th className="px-5 py-3.5">Current Stock</th>
                  <th className="px-5 py-3.5">Reserve Status</th>
                  <th className="px-5 py-3.5">Quick Compounding Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171717]/5">
                {filtered.map((prod) => {
                  const stock = prod.stockQuantity ?? 50;
                  const threshold = prod.lowStockThreshold ?? 15;
                  const isLow = stock <= threshold && stock > 0;
                  const isOut = stock === 0;

                  return (
                    <tr key={prod.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-[#171717] truncate max-w-[220px]">
                          {prod.name}
                        </div>
                        <div className="text-[10px] font-mono text-gray-500">
                          SKU: {prod.sku}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                          {prod.category}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-serif font-semibold text-[#171717]">
                        ${(prod.salePrice || prod.price || 120).toFixed(2)}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-mono text-sm font-bold text-[#171717]">
                          {stock} <span className="text-[10px] font-normal text-gray-400">units</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Threshold: {threshold}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {renderInventoryBadge(isOut, isLow)}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {[10, 25, 50, 100].map((amt) => (
                            <button
                              key={amt}
                              disabled={updatingId === prod.id}
                              onClick={() => handleRestock(prod.id, amt)}
                              className="cursor-pointer rounded bg-gray-100 hover:bg-[#171717] hover:text-white px-2 py-1 text-[10px] font-mono font-semibold transition-colors disabled:opacity-50"
                              title={`Add ${amt} units to inventory`}
                            >
                              +{amt}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

