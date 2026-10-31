'use client';

import React, { useState, useEffect } from 'react';
import { Menu, ShoppingBag, Heart, X, User, Search, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useStore } from '../context/StoreContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems, wishlist, openCart, products } = useStore();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const displayCartCount = mounted ? cartCount : 0;
  const displayWishlistCount = mounted ? wishlistCount : 0;

  const isAdmin =
    session?.user?.isAdmin ||
    ['Super Admin', 'Admin', 'Staff'].includes(session?.user?.role as string);

  const displayIsAdmin = mounted ? isAdmin : false;
  const isAuth = mounted && status === 'authenticated' && !!session?.user;

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Flavours', href: '/flavours' },
    { label: 'Fragrances', href: '/fragrances' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  // Search Results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter((p) => p.status === 'Active')
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.ingredientsNotes && p.ingredientsNotes.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [searchQuery, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* A. Minimal Black Luxury Announcement Bar */}
      <div className="bg-[#171717] text-[#F3EBDD] px-6 py-2 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10.5px] font-mono tracking-[0.2em] uppercase">
          <span className="hidden sm:inline text-[#8A857D]">Swiss Formulation Excellence</span>
          <div className="mx-auto sm:mx-0 text-center">
            Complimentary Courier On Orders Over $150 · <span className="text-[#B89555]">IFRA 51st Certified</span>
          </div>
          <span className="hidden md:inline text-[#8A857D]">Geneva Atelier Est. 1984</span>
        </div>
      </div>

      {/* B. Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#171717]/8 bg-[#FAF8F3]/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Brand Identity Wordmark */}
          <Link
            href="/"
            className="group shrink-0 cursor-pointer text-left focus:outline-none"
          >
            <div className="font-serif text-xl sm:text-2xl font-normal tracking-[0.1em] uppercase text-[#171717] transition-colors group-hover:text-[#B89555]">
              Flavour &amp; Fragrances
            </div>
            <div className="text-[8.5px] uppercase tracking-[0.28em] text-[#B89555] font-mono font-medium -mt-0.5">
              Haute Parfumerie &amp; Taste Atelier
            </div>
          </Link>

          {/* Desktop Editorial Navigation Links */}
          <nav className="hidden items-center justify-center gap-8 lg:flex">
            {navLinks.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${
                    isActive
                      ? 'text-[#171717] font-semibold'
                      : 'text-[#171717]/65 hover:text-[#171717]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#B89555]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* Search Icon Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search formulations"
              className="p-2 text-[#171717]/80 hover:text-[#171717] transition-colors cursor-pointer"
            >
              <Search className="h-4.5 w-4.5 stroke-[1.7]" />
            </button>

            {/* Account Icon */}
            {isAuth && session?.user ? (
              <div className="relative flex items-center gap-2">
                <Link
                  href="/account"
                  className="p-2 text-[#171717]/80 hover:text-[#171717] transition-colors flex items-center gap-1.5"
                  title="My Account"
                >
                  <User className="h-4.5 w-4.5 stroke-[1.7] text-[#B89555]" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#171717] max-w-[80px] truncate">
                    {session.user.name?.split(' ')[0] || 'Client'}
                  </span>
                </Link>
                {displayIsAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 rounded bg-[#171717] px-2 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider text-[#B89555] hover:bg-[#242321]"
                  >
                    <Shield className="w-2.5 h-2.5" />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                aria-label="Customer Sign In"
                className="p-2 text-[#171717]/80 hover:text-[#171717] transition-colors"
              >
                <User className="h-4.5 w-4.5 stroke-[1.7]" />
              </Link>
            )}

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              aria-label={`Saved items wishlist, ${displayWishlistCount} items`}
              className="group relative p-2 text-[#171717]/80 transition-colors hover:text-[#171717]"
            >
              <Heart className="h-4.5 w-4.5 stroke-[1.7] transition-transform duration-200 group-hover:scale-105" />
              {displayWishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#B89555] text-[9px] font-mono font-bold text-white">
                  {displayWishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag Trigger */}
            <button
              type="button"
              onClick={(e) => {
                if (pathname !== '/checkout') {
                  e.preventDefault();
                  openCart();
                }
              }}
              aria-label={`Shopping bag, ${displayCartCount} items`}
              className="group flex cursor-pointer items-center gap-2 rounded-full border border-[#171717]/15 bg-white px-3.5 py-1.5 text-xs font-medium text-[#171717] shadow-xs transition-all hover:border-[#B89555]"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-[#171717]/70 group-hover:text-[#B89555] transition-colors" />
              <span className="font-mono text-[11px] font-medium text-[#171717]">
                {displayCartCount}
              </span>
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search formulations"
              className="p-2 text-[#171717]"
            >
              <Search className="h-5 w-5 stroke-[1.7]" />
            </button>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 text-[#171717]"
            >
              <Heart className="h-5 w-5 stroke-[1.7]" />
              {displayWishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#B89555] text-[9px] font-mono text-white">
                  {displayWishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label="Shopping Cart"
              className="relative p-2 text-[#171717]"
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.7]" />
              {displayCartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#171717] text-[9px] font-mono text-white">
                  {displayCartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="p-2 text-[#171717]"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <div className="border-t border-[#171717]/10 bg-[#FAF8F3] px-6 py-8 shadow-xl lg:hidden">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-[#171717]/5 pb-3 text-sm font-serif tracking-wider uppercase text-[#171717] hover:text-[#B89555]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/orders"
                onClick={() => setMobileOpen(false)}
                className="border-b border-[#171717]/5 pb-3 text-sm font-serif tracking-wider uppercase text-[#171717] hover:text-[#B89555]"
              >
                Track Orders
              </Link>
              {displayIsAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-[#171717]/5 pb-3 text-sm font-serif tracking-wider uppercase text-[#B89555]"
                >
                  Admin Workspace
                </Link>
              )}
            </nav>

            <div className="mt-8 flex flex-col gap-3 pt-6 border-t border-[#171717]/10">
              {isAuth && session?.user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="border border-[#171717]/20 py-2.5 text-center text-xs font-semibold text-[#171717] uppercase tracking-wider"
                  >
                    My Account ({session.user.name || session.user.email})
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      void signOut({ callbackUrl: '/' });
                    }}
                    className="bg-[#171717]/5 py-2 text-center text-xs font-mono uppercase tracking-wider text-[#171717]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="bg-[#171717] py-2.5 text-center text-xs font-mono uppercase tracking-widest text-[#FAF8F3]"
                >
                  Customer Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Quick Search Overlay Drawer */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#171717]/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white border border-[#171717]/15 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#171717]/10 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">
                Atelier Catalog Search
              </span>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-[#171717]/50 hover:text-[#171717] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/40" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by note, accord, or ingredient (e.g. Vanilla, Oud, Rose, Citrus)..."
                  className="w-full border border-[#171717]/20 bg-[#FAF8F3] pl-9 pr-3 py-2.5 text-xs text-[#171717] focus:border-[#B89555] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-[#171717] px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-4 border-t border-[#171717]/8 pt-3 space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A857D]">
                  Quick Matches
                </span>
                <div className="divide-y divide-[#171717]/5">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="py-2 flex items-center justify-between group hover:bg-[#FAF8F3] px-2 transition-colors"
                    >
                      <div>
                        <span className="font-serif text-sm font-light text-[#171717] group-hover:text-[#B89555]">
                          {product.name}
                        </span>
                        <div className="font-mono text-[9px] text-[#8A857D] uppercase">
                          {product.category} · {product.sku}
                        </div>
                      </div>
                      <span className="font-mono text-xs font-medium text-[#171717]">
                        ${((product.salePrice || product.price || 0) as number).toFixed(2)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
