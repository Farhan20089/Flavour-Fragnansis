'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, ArrowUpRight } from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { SafeImage } from '@/src/components/SafeImage';
import { useStore } from '@/src/context/StoreContext';

function FragrancesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { products, categories, addToCart, toggleWishlist, isInWishlist } = useStore();

  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'featured';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'featured');
  }, [searchParams]);

  const updateUrl = (cat: string, search: string, sort: string) => {
    const params = new URLSearchParams();
    if (cat !== 'All') params.set('category', cat);
    if (search.trim()) params.set('search', search.trim());
    if (sort !== 'featured') params.set('sort', sort);
    const query = params.toString();
    router.push(query ? `/fragrances?${query}` : '/fragrances', { scroll: false });
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    updateUrl(cat, searchQuery, sortBy);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    updateUrl(selectedCategory, q, sortBy);
  };

  const handleSortChange = (s: string) => {
    setSortBy(s);
    updateUrl(selectedCategory, searchQuery, s);
  };

  const fragranceCategories = useMemo(() => {
    return categories.filter((c) => c.active && c.parentGroup === 'Fragrances');
  }, [categories]);

  const fragranceProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products
      .filter((p) => p.status === 'Active' && p.parentGroup === 'Fragrances')
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          (p.ingredientsNotes && p.ingredientsNotes.toLowerCase().includes(q))
        );
      });

    if (sortBy === 'price-low') {
      list = [...list].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price-high') {
      list = [...list].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#171717] text-[#FAF8F3] selection:bg-[#B89555]/30 selection:text-[#FAF8F3]">
      <Navbar />

      {/* Haute Parfumerie Hero Banner (Deep Charcoal & Muted Gold) */}
      <section className="relative overflow-hidden bg-[#242321] border-b border-white/10 pt-16 pb-20 lg:pt-20 lg:pb-24">
        {/* Soft Gold Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 right-1/4 h-[400px] w-[500px] rounded-full bg-[#B89555]/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555] border border-[#B89555]/30 bg-[#171717] px-3 py-1">
              Division Olfactive · Haute Parfumerie
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#FAF8F3] tracking-tight uppercase">
              Fine Fragrances &amp; <br />
              <span className="italic font-normal lowercase font-serif text-[#B89555]">Botanical</span> Absolutes
            </h1>
            <p className="text-xs sm:text-sm text-[#FAF8F3]/70 font-light leading-relaxed">
              Pure floral absolutes, rare wood distillations, and captive aroma accords formulated in Geneva in strict conformity with IFRA 51st Amendment standards. Designed for 14-hour skin longevity.
            </p>
          </div>

          <div className="text-[11px] font-mono text-[#8A857D] border-l border-white/15 pl-4 space-y-1">
            <div className="text-[#FAF8F3] font-medium">{fragranceProducts.length} Olfactory Formulations</div>
            <div>Swiss Master Perfumer Compounding</div>
          </div>
        </div>
      </section>

      {/* Filter, Search & Category Navigation Bar */}
      <section className="sticky top-20 z-30 border-b border-white/10 bg-[#171717]/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => handleCategorySelect('All')}
              className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#B89555] text-[#171717] font-semibold'
                  : 'bg-[#242321] text-[#FAF8F3]/70 border border-white/10 hover:border-white/30'
              }`}
            >
              All Fragrances
            </button>
            {fragranceCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.name)}
                className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-[#B89555] text-[#171717] font-semibold'
                    : 'bg-[#242321] text-[#FAF8F3]/70 border border-white/10 hover:border-white/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="h-3.5 w-3.5 text-[#8A857D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search notes (Oud, Iris, Rose)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#242321] text-[#FAF8F3] border border-white/15 focus:outline-none focus:border-[#B89555] font-light placeholder:text-[#8A857D]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-[#242321] text-[#FAF8F3] border border-white/15 px-3 py-1.5 text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-[#B89555] cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Fragrance Product Grid */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between pb-6 border-b border-white/10 text-xs text-[#8A857D]">
          <div>
            Showing <strong className="text-[#FAF8F3] font-medium">{fragranceProducts.length}</strong> perfume compositions
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </div>
          <Link href="/shop" className="text-xs text-[#B89555] hover:underline font-mono uppercase tracking-wider">
            View All Catalog →
          </Link>
        </div>

        {fragranceProducts.length === 0 ? (
          <div className="my-16 border border-white/10 bg-[#242321] p-12 text-center space-y-4">
            <h3 className="font-serif text-2xl font-light text-[#FAF8F3]">
              No Fragrances Found
            </h3>
            <p className="text-xs text-[#8A857D] max-w-sm mx-auto font-light leading-relaxed">
              We could not find any active perfume compositions matching your query.
            </p>
            <button
              type="button"
              onClick={() => {
                handleCategorySelect('All');
                handleSearch('');
                handleSortChange('featured');
              }}
              className="bg-[#B89555] px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#171717] font-semibold hover:bg-[#FAF8F3] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {fragranceProducts.map((product) => {
              const inWishlist = isInWishlist(product.id);
              const price = product.salePrice || product.price || 78;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between border-b border-white/10 pb-6 transition-all duration-300 hover:border-[#B89555]"
                >
                  <div>
                    {/* 4:5 Portrait Bottle Container */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#242321] border border-white/10">
                      <Link href={`/product/${product.slug}`} className="block h-full w-full">
                        <SafeImage
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-103"
                        />
                      </Link>
                      <div className="absolute top-3 left-3 bg-[#171717]/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#FAF8F3] border border-white/15">
                        {product.sku}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        className="absolute top-3 right-3 rounded-full bg-[#171717]/90 p-2 text-[#FAF8F3] border border-white/15 shadow-xs hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </button>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#B89555]">
                        {product.category}
                      </div>
                      <Link href={`/product/${product.slug}`} className="block">
                        <h3 className="font-serif text-lg font-light text-[#FAF8F3] group-hover:text-[#B89555] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#8A857D] line-clamp-2 font-light leading-relaxed">
                        {product.shortDescription}
                      </p>
                      {product.ingredientsNotes && (
                        <div className="pt-1 text-[11px] font-serif italic text-[#FAF8F3]/70 truncate">
                          Accords: {product.ingredientsNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="font-mono text-sm font-medium text-[#FAF8F3]">
                      ${price.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1)}
                        className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#FAF8F3]/80 hover:text-[#B89555] transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#B89555] hover:underline underline-offset-4 transition-colors"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function FragrancesCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#171717] text-[#FAF8F3] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#B89555] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#B89555]">Loading Fragrances...</p>
          </div>
        </div>
      }
    >
      <FragrancesContent />
    </Suspense>
  );
}
