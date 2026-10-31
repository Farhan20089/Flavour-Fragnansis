'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Eye,
  RefreshCw,
  X,
  Save,
} from 'lucide-react';

function getOrderStatusSelectClass(status: string): string {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Shipped':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'Cancelled':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-amber-50 text-amber-800 border-amber-200';
  }
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
  selectedVariation?: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingZip: string;
  shippingCountry: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: string;
  paymentMethod: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export function AdminOrdersTab() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Tracking edit form in modal
  const [carrierInput, setCarrierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === orderId || ord.orderNumber === orderId
              ? { ...ord, orderStatus: newStatus as any }
              : ord
          )
        );
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
          setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus as any } : null);
        }
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    setSavingTracking(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingCarrier: carrierInput.trim() || null,
          trackingNumber: trackingInput.trim() || null,
        }),
      });
      if (res.ok) {
        const updated = {
          ...selectedOrder,
          shippingCarrier: carrierInput.trim(),
          trackingNumber: trackingInput.trim(),
        };
        setSelectedOrder(updated);
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? updated : o))
        );
      }
    } catch (err) {
      console.error('Failed to update tracking:', err);
    } finally {
      setSavingTracking(false);
    }
  };

  const openModal = (ord: OrderData) => {
    setSelectedOrder(ord);
    setCarrierInput(ord.shippingCarrier || 'Swiss Post Express');
    setTrackingInput(ord.trackingNumber || '');
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'All' && o.orderStatus !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.shippingCity.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171717]/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-light text-[#171717]">
            Order Management &amp; Dispatch
          </h2>
          <p className="text-xs text-[#171717]/60 font-light">
            Track luxury compounding dispatch, update fulfillment states, and manage client orders.
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-1.5 border border-[#171717]/15 bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#171717] transition-colors hover:border-[#B89555] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#171717]/10 bg-white p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Customer, or Email…"
            className="w-full border border-[#171717]/15 bg-[#FAF8F3] pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#171717]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#171717] text-white'
                  : 'bg-[#FAF8F3] text-[#171717]/70 border border-[#171717]/10 hover:border-[#171717]/30'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-[#171717]/10 bg-white overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="flex h-48 items-center justify-center space-x-2 font-mono text-xs text-[#171717]/60">
            <RefreshCw className="h-4 w-4 animate-spin text-[#B89555]" />
            <span>Loading orders…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#171717]/50 font-light">
            No orders match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#171717]/10 bg-[#FAF8F3] text-[10px] font-mono uppercase tracking-wider text-[#171717]/60">
                <tr>
                  <th className="px-5 py-3.5">Order #</th>
                  <th className="px-5 py-3.5">Client &amp; Destination</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171717]/5">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-[#171717]">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#B89555]" />
                        <span>#{ord.orderNumber}</span>
                      </div>
                      <div className="text-[10px] font-normal text-gray-400 mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#171717]">{ord.customerName}</div>
                      <div className="text-[11px] text-gray-500">{ord.customerEmail}</div>
                      <div className="text-[10px] text-gray-400">
                        {ord.shippingCity}, {ord.shippingCountry}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-[#171717]">
                        {ord.items.length} item{ord.items.length === 1 ? '' : 's'}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[200px]">
                        {ord.items.map((i) => `${i.productName} (×${i.quantity})`).join(', ')}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-serif text-sm font-semibold text-[#171717]">
                        ${ord.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500">
                        {ord.paymentMethod}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        aria-label="Order Status"
                        value={ord.orderStatus}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border outline-none cursor-pointer ${getOrderStatusSelectClass(ord.orderStatus)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => openModal(ord)}
                        className="cursor-pointer flex items-center gap-1 rounded-md border border-[#171717]/15 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#171717] hover:bg-[#171717] hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail & Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#171717]/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#B89555]">
                  Order Telemetry Dossier
                </span>
                <h3 className="font-serif text-2xl font-light text-[#171717]">
                  #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="cursor-pointer p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client & Destination Details */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#171717]/10 bg-[#FAF8F3] p-4 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase text-gray-500">Client Info</span>
                <div className="font-semibold text-[#171717] mt-0.5">{selectedOrder.customerName}</div>
                <div className="text-gray-600">{selectedOrder.customerEmail}</div>
                <div className="text-gray-600">{selectedOrder.customerPhone}</div>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-gray-500">Shipping Address</span>
                <div className="text-[#171717] font-medium mt-0.5">{selectedOrder.shippingAddress}</div>
                <div className="text-gray-600">
                  {selectedOrder.shippingCity}, {selectedOrder.shippingZip}
                </div>
                <div className="text-gray-600">{selectedOrder.shippingCountry}</div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <h4 className="font-serif text-base font-light text-[#171717]">Compounded Items</h4>
              <div className="divide-y divide-[#171717]/10 border-y border-[#171717]/10">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[#171717]">{item.productName}</div>
                      <div className="text-[10px] font-mono text-gray-500">
                        SKU: {item.sku}
                        {item.selectedVariation && ` · Variation: ${item.selectedVariation}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-[#171717]">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                      <div className="font-serif font-semibold text-[#171717]">
                        ${item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-[#171717]/10 pt-2 text-[#171717]">
                <span>Order Total:</span>
                <span className="font-serif text-lg">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Tracking Form */}
            <div className="rounded-xl border border-[#171717]/10 bg-[#FAF8F3] p-4 space-y-3">
              <h4 className="font-serif text-sm font-light text-[#171717]">Fulfillment Tracking</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">
                    Carrier
                  </label>
                  <input
                    type="text"
                    value={carrierInput}
                    onChange={(e) => setCarrierInput(e.target.value)}
                    placeholder="e.g. Swiss Post Express, DHL, FedEx"
                    className="w-full rounded border border-[#171717]/15 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#171717]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g. CH-94829482"
                    className="w-full rounded border border-[#171717]/15 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#171717]"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveTracking}
                disabled={savingTracking}
                className="cursor-pointer flex items-center gap-1.5 rounded-full bg-[#171717] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#B89555] disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingTracking ? 'Saving…' : 'Save Carrier & Tracking Number'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

