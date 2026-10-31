'use client';

import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrdersCount: number;
  lowStockProducts: Array<{
    id: string;
    sku: string;
    name: string;
    parentGroup: string;
    stockQuantity: number;
    lowStockThreshold: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    orderStatus: string;
    createdAt: string;
    items: Array<{ productName: string; quantity: number }>;
  }>;
  recentAuditLogs: Array<{
    id: string;
    adminEmail: string;
    action: string;
    resource: string;
    createdAt: string;
  }>;
}

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: any) => void;
  onRestockProduct?: (productId: string, amount: number) => void;
}

export function AdminDashboardOverview({
  onNavigateTab,
  onRestockProduct,
}: AdminDashboardOverviewProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load live metrics');
      }
    } catch {
      setError('Network error while retrieving administrative metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-64 items-center justify-center space-x-2 text-xs text-[#171717]/60">
        <RefreshCw className="h-5 w-5 animate-spin text-[#B89555]" />
        <span>Aggregating enterprise telemetry…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171717]/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-light text-[#171717]">
            Executive Atelier Overview
          </h2>
          <p className="text-xs text-[#171717]/60 font-light">
            Real-time telemetry across revenue, formulations, fulfillment, and customer registry.
          </p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-1.5 border border-[#171717]/15 bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#171717] transition-colors hover:border-[#B89555] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {error && (
        <div className="border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="border border-[#171717]/10 bg-white p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/50">
              Total Revenue
            </span>
            <DollarSign className="w-4 h-4 text-[#B89555]" />
          </div>
          <div className="font-mono text-2xl font-light text-[#171717]">
            ${stats?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>Excluding cancellations</span>
          </div>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="cursor-pointer border border-[#171717]/10 bg-white p-5 space-y-1 transition-all hover:border-[#B89555]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/50">
              Total Orders
            </span>
            <Package className="w-4 h-4 text-[#B89555]" />
          </div>
          <div className="font-mono text-2xl font-light text-[#171717]">
            {stats?.totalOrders ?? 0}
          </div>
          <div className="text-[10px] text-[#B89555] font-medium flex items-center justify-between font-mono">
            <span>{stats?.pendingOrdersCount ?? 0} Pending / Processing</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Total Customers */}
        <div
          onClick={() => onNavigateTab('users')}
          className="cursor-pointer border border-[#171717]/10 bg-white p-5 space-y-1 transition-all hover:border-[#B89555]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/50">
              Client Registry
            </span>
            <Users className="w-4 h-4 text-[#B89555]" />
          </div>
          <div className="font-mono text-2xl font-light text-[#171717]">
            {stats?.totalCustomers ?? 0}
          </div>
          <div className="text-[10px] text-[#171717]/50 font-medium flex items-center justify-between font-mono">
            <span>Verified accounts</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Total Products / Formulations */}
        <div
          onClick={() => onNavigateTab('products')}
          className="cursor-pointer border border-[#171717]/10 bg-white p-5 space-y-1 transition-all hover:border-[#B89555]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/50">
              Active Formulations
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl font-light text-[#171717]">
            {stats?.totalProducts ?? 0}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium flex items-center justify-between font-mono">
            <span>IFRA &amp; Swiss Certified</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Low-Stock Critical Alert Section */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Low-Stock Inventory Warnings ({stats.lowStockProducts.length} items)</span>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-semibold text-amber-900 underline hover:text-amber-700"
            >
              Open Full Inventory Manager →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStockProducts.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-amber-200/80 bg-white p-3.5 flex items-center justify-between shadow-xs"
              >
                <div>
                  <div className="font-semibold text-xs text-[#171717] truncate max-w-[180px]">
                    {item.name}
                  </div>
                  <div className="text-[10px] font-mono text-gray-500">
                    SKU: {item.sku} · {item.parentGroup}
                  </div>
                  <div className="mt-1 text-xs font-bold text-amber-700">
                    {item.stockQuantity} units left{' '}
                    <span className="text-[10px] font-normal text-gray-500">
                      (min {item.lowStockThreshold})
                    </span>
                  </div>
                </div>

                {onRestockProduct && (
                  <button
                    onClick={() => onRestockProduct(item.id, 25)}
                    className="cursor-pointer rounded-full bg-amber-100 hover:bg-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-900 transition-colors"
                  >
                    +25 Restock
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Recent Orders & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 rounded-xl border border-[#171717]/10 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-light text-[#171717]">Recent Orders</h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-[#B89555] hover:underline"
            >
              Manage All Orders →
            </button>
          </div>

          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#171717]/40">
              No recent orders recorded in database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#171717]/10 text-[10px] font-mono uppercase tracking-wider text-[#171717]/50">
                    <th className="py-2.5">Order</th>
                    <th className="py-2.5">Client</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171717]/5">
                  {stats.recentOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => onNavigateTab('orders')}
                      className="cursor-pointer hover:bg-[#FAF8F3] transition-colors"
                    >
                      <td className="py-3 font-mono font-semibold text-[#171717]">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-[#171717] truncate max-w-[130px]">
                          {ord.customerName}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[130px]">
                          {ord.customerEmail}
                        </div>
                      </td>
                      <td className="py-3 text-[11px] text-[#171717]/60">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-serif font-semibold text-[#171717]">
                        ${ord.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800'
                              : ord.orderStatus === 'Shipped'
                              ? 'bg-blue-50 text-blue-800'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security & Audit Activity */}
        <div className="rounded-xl border border-[#171717]/10 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#B89555]" />
            <h3 className="font-serif text-lg font-light text-[#171717]">Atelier Audit Log</h3>
          </div>
          <p className="text-[11px] text-[#171717]/50">
            Immutable log of administrative actions, pricing edits, and role adjustments.
          </p>

          {!stats?.recentAuditLogs || stats.recentAuditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#171717]/40">
              No recent administrative actions recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-[#171717]/5 bg-[#FAF8F3] p-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#171717]/50">
                    <span className="font-mono text-[#B89555]">{log.action}</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="font-medium text-[#171717] truncate">
                    {log.resource}
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 truncate">
                    By: {log.adminEmail}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

