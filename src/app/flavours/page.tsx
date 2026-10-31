'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, ArrowUpRight } from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { SafeImage } from '@/src/components/SafeImage';
import { useStore } from '@/src/context/StoreContext';

function FlavoursContent() {
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
    router.push(query ? `/flavours?${query}` : '/flavours', { scroll: false });
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

  const flavourCategories = useMemo(() => {
    return categories.filter((c) => c.active && c.parentGroup === 'Flavours');
  }, [categories]);

  const flavourProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products
      .filter((p) => p.status === 'Active' && p.parentGroup === 'Flavours')
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.applications?.toLowerCase().includes(q) ||
          p.ingredientsNotes?.toLowerCase().includes(q)
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
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/30 selection:text-[#171717]">
      <Navbar />

      {/* Editorial Header (Warm Cream Aesthetic with Gold Accent) */}
      <section className="relative overflow-hidden border-b border-[#171717]/10 bg-[#F3EBDD] pt-14 pb-18 lg:pt-18 lg:pb-22">
        <div className="pointer-events-none absolute -top-24 right-1/4 h-[350px] w-[450px] rounded-full bg-[#B89555]/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <span className="inline-block font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555] border border-[#B89555]/40 bg-[#FAF8F3] px-3 py-1">
              Division Gustative · Taste Systems
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#171717] tracking-tight uppercase">
              Artisanal Flavours &amp; <br />
              <span className="italic font-normal lowercase font-serif text-[#B89555]">Botanical</span> Extracts
            </h1>
            <p className="text-xs sm:text-sm text-[#171717]/70 font-light leading-relaxed">
              Supercritical CO₂ vanilla extractions, authentic fruit WONF essences, and thermal-stable botanical concentrates engineered for fine pastry, craft beverages, and gourmet confectionery.
            </p>
          </div>

          <div className="text-[11px] font-mono text-[#8A857D] border-l border-[#171717]/15 pl-4 space-y-1">
            <div className="text-[#171717] font-medium">{flavourProducts.length} Taste Formulations Available</div>
            <div>Swiss Natural Purity Standards</div>
          </div>
        </div>
      </section>

      {/* Category Pills & Search Filter */}
      <section className="sticky top-20 z-30 border-b border-[#171717]/10 bg-[#FAF8F3]/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => handleCategorySelect('All')}
              className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#171717] text-[#FAF8F3] font-semibold'
                  : 'bg-white text-[#171717]/70 border border-[#171717]/15 hover:border-[#171717]'
              }`}
            >
              All Flavours
            </button>
            {flavourCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.name)}
                className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-[#171717] text-[#FAF8F3] font-semibold'
                    : 'bg-white text-[#171717]/70 border border-[#171717]/15 hover:border-[#171717]'
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
                placeholder="Search vanilla, citrus, cacao..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-[#171717] border border-[#171717]/20 focus:outline-none focus:border-[#B89555] font-light placeholder:text-[#8A857D]"
              />
            </div>

            <select
              value={sortBy}
              aria-label="Sort flavours by"
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-[#171717]/20 bg-white px-3 py-1.5 font-mono text-[11px] text-[#171717] uppercase tracking-wider focus:border-[#B89555] focus:outline-none cursor-pointer"
            >
              <option value="featured">Sort: Curated First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Botanical Name (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Flavour Product Grid */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between pb-6 border-b border-[#171717]/10 text-xs text-[#8A857D]">
          <div>
            Showing <strong className="font-mono text-[#171717] font-semibold">{flavourProducts.length}</strong> flavour formulations
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </div>
          <Link href="/shop" className="text-xs text-[#B89555] hover:underline flex items-center gap-1 font-mono uppercase tracking-wider">
            <span>Explore All Formulations</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {flavourProducts.length === 0 ? (
          <div className="my-12 border border-[#171717]/10 bg-white p-12 text-center space-y-3">
            <h3 className="font-serif text-2xl font-light text-[#171717]">
              No Flavours Found
            </h3>
            <p className="text-xs text-[#8A857D] max-w-sm mx-auto">
              We could not find any active flavour formulations matching your query.
            </p>
            <button
              type="button"
              onClick={() => {
                handleCategorySelect('All');
                handleSearch('');
              }}
              className="bg-[#171717] px-6 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {flavourProducts.map((product) => {
              const inWishlist = isInWishlist(product.id);
              const price = product.salePrice || product.price || 54;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between border-b border-transparent pb-4 transition-all duration-300 hover:border-[#171717]/20"
                >
                  <div>
                    {/* 4:5 Portrait Image */}
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

                    <div className="mt-4 space-y-1">
                      <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#B89555]">
                        {product.category}
                      </div>
                      <Link href={`/product/${product.slug}`} className="block">
                        <h3 className="font-serif text-lg font-light text-[#171717] group-hover:text-[#B89555] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#8A857D] line-clamp-2 font-light leading-relaxed">
                        {product.shortDescription}
                      </p>
                      {product.tasteProfile && (
                        <div className="pt-1 text-[11px] italic font-serif text-[#171717]/75 truncate">
                          Profile: {product.tasteProfile}
                        </div>
                      )}
                    </div>
                  </div>

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
      </main>

      <Footer />
    </div>
  );
}

export default function FlavoursCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] text-[#171717] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#B89555] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#B89555]">Loading Flavours...</p>
          </div>
        </div>
      }
    >
      <FlavoursContent />
    </Suspense>
  );
}
