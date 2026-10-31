'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
} from 'lucide-react';

interface UserItem {
  id: string;
  name?: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Staff' | 'Customer';
  createdAt: string;
  orderCount: number;
}

interface AdminUsersTabProps {
  currentRole: string;
}

export function AdminUsersTab({ currentRole }: AdminUsersTabProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isSuperAdmin = currentRole === 'Super Admin';

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isSuperAdmin) {
      alert('Only Super Administrators have authority to modify roles.');
      return;
    }

    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
        );
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171717]/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-light text-[#171717]">
            Client &amp; Staff Registry
          </h2>
          <p className="text-xs text-[#171717]/60">
            Enterprise identity management, verified customer accounts, and role-based access authorization.
          </p>
        </div>
        <button
          onClick={loadUsers}
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
            placeholder="Search accounts by name or email…"
            className="w-full rounded-md border border-[#171717]/15 bg-[#FAF8F3] pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#171717]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Customer', 'Staff', 'Admin', 'Super Admin'].map((rf) => (
            <button
              key={rf}
              onClick={() => setRoleFilter(rf)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                roleFilter === rf
                  ? 'bg-[#171717] text-white font-semibold'
                  : 'bg-gray-100 text-[#171717]/70 hover:bg-gray-200'
              }`}
            >
              {rf}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-[#171717]/10 bg-white shadow-sm overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex h-48 items-center justify-center space-x-2 text-xs text-[#171717]/60">
            <RefreshCw className="h-5 w-5 animate-spin text-[#B89555]" />
            <span>Scanning registered accounts…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#171717]/50">
            No accounts match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#171717]/10 bg-[#FAF8F3] text-[10px] font-mono uppercase tracking-wider text-[#171717]/60">
                <tr>
                  <th className="px-5 py-3.5">Account / Client</th>
                  <th className="px-5 py-3.5">Email Address</th>
                  <th className="px-5 py-3.5">Orders Placed</th>
                  <th className="px-5 py-3.5">Member Since</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171717]/5">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#171717]">
                        {user.name || 'Anonymous Client'}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400">
                        UID: {user.id.slice(0, 12)}…
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px] text-[#171717]">
                      {user.email}
                    </td>

                    <td className="px-5 py-4 font-mono">
                      <span className="font-semibold text-[#171717]">{user.orderCount}</span>{' '}
                      <span className="text-[10px] text-gray-400">purchases</span>
                    </td>

                    <td className="px-5 py-4 text-[11px] text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      {isSuperAdmin ? (
                        <select
                          value={user.role}
                          disabled={updatingId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border outline-none cursor-pointer ${
                            user.role === 'Super Admin'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : user.role === 'Admin'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : user.role === 'Staff'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          <option value="Customer">Customer</option>
                          <option value="Staff">Staff</option>
                          <option value="Admin">Admin</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            user.role === 'Super Admin'
                              ? 'bg-purple-50 text-purple-800'
                              : user.role === 'Admin'
                              ? 'bg-blue-50 text-blue-800'
                              : user.role === 'Staff'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
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

