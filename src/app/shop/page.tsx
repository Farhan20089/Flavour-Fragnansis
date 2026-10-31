'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, ArrowRight, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { SafeImage } from '@/src/components/SafeImage';
import { useStore } from '@/src/context/StoreContext';
import type { Product } from '@/src/types';

function ShopAllContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { products, categories, addToCart, toggleWishlist, isInWishlist } = useStore();

  const initialGroup = searchParams.get('group') || 'All';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'featured';

  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroup);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  // Sync state with URL params
  useEffect(() => {
    setSelectedGroup(searchParams.get('group') || 'All');
    setSelectedCategory(searchParams.get('category') || 'All');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'featured');
  }, [searchParams]);

  const updateUrl = (group: string, category: string, search: string, sort: string) => {
    const params = new URLSearchParams();
    if (group !== 'All') params.set('group', group);
    if (category !== 'All') params.set('category', category);
    if (search.trim()) params.set('search', search.trim());
    if (sort !== 'featured') params.set('sort', sort);

    const query = params.toString();
    router.push(query ? `/shop?${query}` : '/shop', { scroll: false });
  };

  const handleGroupChange = (grp: string) => {
    setSelectedGroup(grp);
    setSelectedCategory('All');
    updateUrl(grp, 'All', searchQuery, sortBy);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    updateUrl(selectedGroup, cat, searchQuery, sortBy);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrl(selectedGroup, selectedCategory, query, sortBy);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateUrl(selectedGroup, selectedCategory, searchQuery, sort);
  };

  const activeCategories = useMemo(() => {
    return categories.filter((c) => {
      if (!c.active) return false;
      if (selectedGroup === 'All') return true;
      return c.parentGroup === selectedGroup;
    });
  }, [categories, selectedGroup]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products
      .filter((p) => p.status === 'Active')
      .filter((p) => {
        if (selectedGroup !== 'All' && p.parentGroup && p.parentGroup !== selectedGroup) {
          return false;
        }
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.ingredientsNotes?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          const priceA = a.salePrice || a.price || 0;
          const priceB = b.salePrice || b.price || 0;
          return priceA - priceB;
        }
        if (sortBy === 'price-desc') {
          const priceA = a.salePrice || a.price || 0;
          const priceB = b.salePrice || b.price || 0;
          return priceB - priceA;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'rating') {
          return (b.rating || 5) - (a.rating || 5);
        }
        return (b.views || 0) - (a.views || 0);
      });
  }, [products, selectedGroup, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/30 selection:text-[#171717]">
      <Navbar />

      {/* Editorial Catalog Header */}
      <section className="relative overflow-hidden border-b border-[#171717]/10 bg-[#FAF8F3] pt-14 pb-16 px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-24 right-1/4 h-[350px] w-[450px] rounded-full bg-[#B89555]/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-block font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555] border border-[#B89555]/40 bg-white px-3 py-1">
              Atelier Archives · Complete Formulary
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#171717] tracking-tight uppercase">
              The Formulation Collection
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-[#8A857D] font-light leading-relaxed">
              Explore our comprehensive repertoire of Haute Parfumerie concentrates, pure botanical absolutes, and natural culinary flavour solutions.
            </p>
          </div>

          <div className="text-[11px] font-mono text-[#8A857D] border-l border-[#171717]/15 pl-4 space-y-1">
            <div className="text-[#171717] font-medium">{filteredProducts.length} Formulations Catalogued</div>
            <div>Swiss Natural Purity Standards</div>
          </div>
        </div>
      </section>

      {/* Refined Filter & Search Bar */}
      <section className="sticky top-20 z-30 border-b border-[#171717]/10 bg-[#FAF8F3]/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 text-[#8A857D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Filter by accord, aroma note, SKU, or botanical..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#171717]/15 focus:outline-none focus:border-[#B89555] font-light placeholder:text-[#8A857D]"
            />
          </div>

          {/* Division Selector & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Division Switcher */}
            <div className="flex items-center bg-white p-1 border border-[#171717]/15 text-xs">
              {['All', 'Fragrances', 'Flavours'].map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => handleGroupChange(grp)}
                  className={`px-4 py-1.5 transition-all font-mono text-[10px] cursor-pointer uppercase tracking-wider ${
                    selectedGroup === grp
                      ? 'bg-[#171717] text-[#FAF8F3] font-semibold'
                      : 'text-[#171717]/70 hover:text-[#171717]'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <select
              value={sortBy}
              aria-label="Sort products by"
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-[#171717]/15 bg-white px-3 py-2 font-mono text-[11px] text-[#171717] uppercase tracking-wider focus:border-[#B89555] focus:outline-none cursor-pointer"
            >
              <option value="featured">Sort: Curated First</option>
              <option value="price-asc">Price: Ascending</option>
              <option value="price-desc">Price: Descending</option>
              <option value="rating">Client Evaluation</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Catalog Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Left Category Sidebar */}
          <aside className="space-y-6 lg:border-r lg:border-[#171717]/10 lg:pr-8">
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555] mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('All')}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'bg-[#171717] text-[#FAF8F3] font-medium'
                      : 'text-[#171717]/70 hover:bg-[#171717]/5'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="font-mono text-[10px] opacity-70">{products.length}</span>
                </button>

                {activeCategories.map((cat) => {
                  const count = products.filter(
                    (p) => p.status === 'Active' && p.category === cat.name
                  ).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.name)}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedCategory === cat.name
                          ? 'bg-[#171717] text-[#FAF8F3] font-medium'
                          : 'text-[#171717]/70 hover:bg-[#171717]/5'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="font-mono text-[10px] opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bespoke Accord Callout */}
            <div className="border border-[#171717]/12 bg-[#F3EBDD] p-6 space-y-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#B89555]">
                Private Synthesis
              </span>
              <h4 className="font-serif text-lg font-light text-[#171717]">
                Bespoke Accord Synthesis
              </h4>
              <p className="text-xs text-[#8A857D] leading-relaxed font-light">
                Our master perfumers and taste engineers synthesize captive molecules and tailored profiles for niche houses.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-block bg-[#171717] px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
                >
                  Inquire Atelier
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between text-xs text-[#8A857D] pb-3 border-b border-[#171717]/10">
              <div>
                Displaying <strong className="font-mono text-[#171717] font-semibold">{filteredProducts.length}</strong> formulations
                {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="text-xs text-[#B89555] underline cursor-pointer"
                >
                  Reset query
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="border border-[#171717]/10 bg-white p-12 text-center space-y-3">
                <h4 className="font-serif text-2xl font-light text-[#171717]">
                  No Matching Formulations
                </h4>
                <p className="text-xs text-[#8A857D] max-w-sm mx-auto">
                  No records match your exact criteria. Please reset your filters or consult our atelier concierge.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleGroupChange('All');
                      handleCategoryChange('All');
                      handleSearchChange('');
                    }}
                    className="bg-[#171717] px-6 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => {
                  const inWishlist = isInWishlist(product.id);
                  const price = product.salePrice || product.price || 50;

                  return (
                    <div
                      key={product.id}
                      className="group flex flex-col justify-between border-b border-transparent pb-4 transition-all duration-300 hover:border-[#171717]/20"
                    >
                      <div>
                        {/* 4:5 Vertical Portrait Framing */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white border border-[#171717]/10">
                          <Link href={`/product/${product.slug}`} className="block h-full w-full">
                            <SafeImage
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-700 hover:scale-103"
                            />
                          </Link>
                          <div className="absolute top-3 left-3 bg-white/95 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#171717] border border-[#171717]/10">
                            {product.sku}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(product.id)}
                            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                            className="absolute top-3 right-3 bg-white/95 p-2 text-[#171717] border border-[#171717]/10 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Heart
                              className={`h-3.5 w-3.5 ${inWishlist ? 'fill-red-600 text-red-600' : ''}`}
                            />
                          </button>
                        </div>

                        {/* Metadata */}
                        <div className="mt-4 space-y-1">
                          <div className="flex items-center justify-between text-[9.5px] font-mono uppercase tracking-wider text-[#B89555]">
                            <span>{product.category}</span>
                            <span>{product.parentGroup}</span>
                          </div>

                          <Link href={`/product/${product.slug}`} className="block">
                            <h3 className="font-serif text-lg font-light text-[#171717] group-hover:text-[#B89555] transition-colors line-clamp-1">
                              {product.name}
                            </h3>
                          </Link>

                          <p className="text-xs text-[#8A857D] line-clamp-2 font-light leading-relaxed">
                            {product.shortDescription}
                          </p>

                          {(product.olfactoryProfile || product.tasteProfile) && (
                            <div className="pt-1 text-[11px] italic font-serif text-[#171717]/75 truncate">
                              Accords: {product.olfactoryProfile || product.tasteProfile}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price & Action Row */}
                      <div className="mt-4 pt-3 border-t border-[#171717]/10 flex items-center justify-between gap-2">
                        <div className="font-mono text-sm font-medium text-[#171717]">
                          ${price.toFixed(2)}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-mono text-[10px] uppercase tracking-wider text-[#171717] hover:text-[#B89555] underline underline-offset-4 transition-colors"
                          >
                            Inspect
                          </Link>
                          <button
                            type="button"
                            onClick={() => addToCart(product, 1)}
                            className="flex items-center gap-1.5 bg-[#171717] px-3 py-1.5 font-mono text-[9.5px] font-medium uppercase tracking-wider text-[#FAF8F3] hover:bg-[#B89555] transition-colors cursor-pointer"
                          >
                            <ShoppingBag className="h-3 w-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ShopAllPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] text-[#171717] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#B89555] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#B89555]">Loading Atelier Catalog...</p>
          </div>
        </div>
      }
    >
      <ShopAllContent />
    </Suspense>
  );
}
