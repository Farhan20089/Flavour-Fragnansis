import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  Download,
  FileText,
  SlidersHorizontal,
  ArrowLeft,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';
import { ParentGroup, Product } from '../types';

export const ProductsCataloguePage: React.FC<{
  initialCategory?: string;
  initialGroup?: ParentGroup;
  initialSearch?: string;
}> = ({ initialCategory = 'All', initialGroup, initialSearch = '' }) => {
  const { products, categories, navigate, addToCart } = useStore();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGroup, setSelectedGroup] = useState<'All' | ParentGroup>(initialGroup || 'All');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'views' | 'name' | 'sku'>('featured');

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialGroup) setSelectedGroup(initialGroup);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialCategory, initialGroup, initialSearch]);

  const activeCategories = useMemo(
    () =>
      categories.filter(
        (c) => c.active && (selectedGroup === 'All' || c.parentGroup === selectedGroup)
      ),
    [categories, selectedGroup]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products
      .filter((p) => p.status === 'Active')
      .filter((p) => {
        if (selectedGroup !== 'All') {
          const catObj = categories.find((c) => c.name === p.category);
          if (catObj && catObj.parentGroup !== selectedGroup) return false;
          if (!catObj) {
            const isFragrance = p.productType === 'Fragrance' || p.category.includes('Fragrance') || p.category.includes('Care');
            if (selectedGroup === 'Fragrances' && !isFragrance) return false;
            if (selectedGroup === 'Flavours' && isFragrance) return false;
          }
        }
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (selectedType !== 'All' && p.productType !== selectedType) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.applications.toLowerCase().includes(q) ||
          p.productType.toLowerCase().includes(q) ||
          p.ingredientsNotes.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'featured') return Number(b.featured) - Number(a.featured) || b.views - a.views;
        if (sortBy === 'views') return b.views - a.views;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'sku') return a.sku.localeCompare(b.sku);
        return 0;
      });
  }, [products, categories, searchQuery, selectedGroup, selectedCategory, selectedType, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header Banner */}
      <section className="bg-[#0F2922] text-[#FAF9F6] py-16 border-b border-[#FAF9F6]/10">
        <div className="max-w-[1360px] mx-auto px-6">
          <div className="text-xs text-[#C5A059] font-medium tracking-wide mb-3">
            Flavour & Fragrances Portfolio · Geneva & Zurich
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-[#FAF9F6] max-w-3xl">
            Flavours, Fragrances & Botanical Extracts
          </h1>
          <p className="mt-4 text-base text-[#FAF9F6]/80 max-w-2xl leading-relaxed">
            Search our dynamic technical library by formulation name, SKU, application matrix, or olfactory/gustatory profile. All formulations ship with CoA, SDS, and IFRA 51st / FEMA GRAS documentation.
          </p>
        </div>
      </section>

      {/* Search & Filter Control Bar */}
      <section className="border-b border-[#0F2922]/10 bg-white sticky top-16 z-30">
        <div className="max-w-[1360px] mx-auto px-6 py-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-[#0F1E19]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU (e.g. FLV-FRT-101), application (yogurt, EdP, cola)..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded-md focus:outline-none focus:border-[#0F2922]"
            />
          </div>

          {/* Interactive Division Tabs & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#FAF9F6] border border-[#0F2922]/10 rounded-md">
              {(['All', 'Flavours', 'Fragrances'] as const).map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => {
                    setSelectedGroup(grp);
                    setSelectedCategory('All');
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedGroup === grp
                      ? 'bg-[#0F2922] text-[#FAF9F6]'
                      : 'text-[#0F1E19]/70 hover:text-[#0F2922]'
                  }`}
                >
                  {grp === 'All' ? 'All Divisions' : grp}
                </button>
              ))}
            </div>

            <select
              aria-label="Filter by product type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-[#FAF9F6] border border-[#0F2922]/15 rounded-md text-[#0F1E19] focus:outline-none focus:border-[#0F2922]"
            >
              <option value="All">All Formulation Types</option>
              <option value="Flavour">Flavour</option>
              <option value="Fragrance">Fragrance</option>
              <option value="Essential Oil">Essential Oil</option>
              <option value="Botanical Extract">Botanical Extract</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs text-[#0F1E19]/70">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-2.5 py-2 text-xs font-medium bg-[#FAF9F6] border border-[#0F2922]/15 rounded-md text-[#0F1E19] focus:outline-none focus:border-[#0F2922]"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="views">Sort: Most Requested</option>
                <option value="name">Sort: Name (A–Z)</option>
                <option value="sku">Sort: SKU Code</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout: Sidebar Categories + Product Grid */}
      <div className="max-w-[1360px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Left Category Filter Column */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="border border-[#0F2922]/12 bg-white p-5 rounded-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#0F2922]/10">
              <h2 className="font-display text-lg font-semibold text-[#0F2922]">
                Categories ({activeCategories.length})
              </h2>
              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="text-xs text-[#C5A059] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-3 py-2 text-xs rounded transition-colors flex items-center justify-between cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-[#0F2922] text-[#FAF9F6] font-semibold'
                    : 'text-[#0F1E19]/80 hover:bg-[#0F2922]/5'
                }`}
              >
                <span>All Categories</span>
                <span className="font-mono tabular-nums opacity-75">
                  {products.filter((p) => p.status === 'Active').length}
                </span>
              </button>
              {activeCategories.map((cat) => {
                const count = products.filter(
                  (p) => p.status === 'Active' && p.category === cat.name
                ).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-3 py-2 text-xs rounded transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.name
                        ? 'bg-[#0F2922] text-[#FAF9F6] font-semibold'
                        : 'text-[#0F1E19]/80 hover:bg-[#0F2922]/5'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="font-mono tabular-nums opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Formulation Callout */}
          <div className="border border-[#0F2922]/15 bg-[#0F2922] text-[#FAF9F6] p-6 rounded-md space-y-3">
            <div className="text-xs text-[#C5A059] font-medium">Custom R&D Compounding</div>
            <h3 className="font-display text-xl font-semibold text-[#FAF9F6]">
              Need a Bespoke Profile or Allergen-Free Match?
            </h3>
            <p className="text-xs text-[#FAF9F6]/75 leading-relaxed">
              Our Geneva GC-MS analytical lab can counter-match existing benchmarks or formulate novel halal, kosher, or natural WONF profiles within 10 business days.
            </p>
            <button
              type="button"
              onClick={() => navigate({ page: 'quote', productPreselect: 'Custom R&D Formulation Brief' })}
              className="w-full mt-2 py-2.5 px-4 bg-[#C5A059] text-[#0F1E19] font-semibold text-xs rounded hover:bg-[#d1ae68] transition-colors cursor-pointer whitespace-nowrap"
            >
              Submit Custom R&D Brief
            </button>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#0F1E19]/65 border-b border-[#0F2922]/10 pb-3">
            <div>
              Showing <span className="font-mono tabular-nums font-semibold text-[#0F2922]">{filteredProducts.length}</span> active B2B formulations
              {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#0F2922] underline cursor-pointer"
              >
                Clear search "{searchQuery}"
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="border border-[#0F2922]/12 bg-white p-12 text-center rounded-md space-y-4">
              <h3 className="font-display text-2xl font-semibold text-[#0F2922]">
                No Matching Formulations Found
              </h3>
              <p className="text-sm text-[#0F1E19]/70 max-w-md mx-auto">
                We could not find an active catalogue item matching your current filters. Reset your filters or submit a custom R&D formulation inquiry.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGroup('All');
                    setSelectedCategory('All');
                    setSelectedType('All');
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#0F2922] text-[#FAF9F6] rounded cursor-pointer"
                >
                  Reset All Filters
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'quote' })}
                  className="px-4 py-2 text-xs font-semibold border border-[#0F2922]/25 text-[#0F2922] rounded cursor-pointer"
                >
                  Request Custom Formulation
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="border border-[#0F2922]/12 bg-white rounded-md overflow-hidden flex flex-col justify-between hover:border-[#0F2922]/35 transition-colors"
                >
                  <div>
                    <div
                      onClick={() => navigate({ page: 'product-detail', slug: product.slug })}
                      className="relative aspect-[4/3] overflow-hidden bg-[#0F2922]/5 cursor-pointer group"
                    >
                      <SafeImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/95">
                        <span className="font-mono tabular-nums">{product.sku}</span>
                        <span>
                          {product.productType}
                          {product.featured ? ' · Signature' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      {/* Clean unboxed metadata (Zero-Pill discipline) */}
                      <div className="flex items-center gap-2 text-xs text-[#0F1E19]/60">
                        <span>{product.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.subcategory}</span>
                      </div>

                      <h3
                        onClick={() => navigate({ page: 'product-detail', slug: product.slug })}
                        className="font-display text-2xl font-semibold text-[#0F2922] hover:text-[#C5A059] transition-colors cursor-pointer"
                      >
                        {product.name}
                      </h3>

                      <p className="text-sm text-[#0F1E19]/75 line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>

                      <div className="pt-2 border-t border-[#0F2922]/8 text-xs text-[#0F1E19]/70 space-y-1">
                        <div>
                          <strong className="font-semibold text-[#0F2922]">Profile:</strong>{' '}
                          {product.ingredientsNotes}
                        </div>
                        <div className="truncate">
                          <strong className="font-semibold text-[#0F2922]">Applications:</strong>{' '}
                          {product.applications}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-[#FAF9F6] border-t border-[#0F2922]/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'product-detail', slug: product.slug })}
                      className="text-xs font-semibold text-[#0F2922] hover:text-[#C5A059] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span>Technical Spec</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#0F2922] border border-[#0F2922]/25 rounded hover:bg-[#0F2922]/5 transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate({ page: 'sample', productPreselect: product.name })}
                        className="px-3 py-1.5 text-xs font-medium text-[#0F2922] border border-[#0F2922]/20 rounded hover:bg-[#0F2922]/5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Request Sample
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate({ page: 'quote', productPreselect: product.name })}
                        className="px-3 py-1.5 text-xs font-semibold text-[#FAF9F6] bg-[#0F2922] rounded hover:bg-[#16382E] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Quote
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProductDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { products, navigate, incrementProductView, addToast, addToCart } = useStore();
  const product = useMemo(() => products.find((p) => p.slug === slug), [products, slug]);

  const galleryList = useMemo(() => {
    if (!product) return [];
    const list = (product.galleryUrls || product.imageUrl)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return list.length > 0 ? list : [product.imageUrl];
  }, [product]);

  const [activeImage, setActiveImage] = useState<string>('');
  const [downloadedTds, setDownloadedTds] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
      incrementProductView(product.id);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-[1360px] mx-auto px-6 py-24 text-center space-y-4">
        <h1 className="font-display text-3xl font-semibold text-[#0F2922]">
          Formulation Not Found
        </h1>
        <p className="text-sm text-[#0F1E19]/70">
          The requested product specification could not be found in the active catalogue.
        </p>
        <button
          type="button"
          onClick={() => navigate({ page: 'products' })}
          className="px-5 py-2.5 text-xs font-semibold bg-[#0F2922] text-[#FAF9F6] rounded-md cursor-pointer"
        >
          Return to Product Catalogue
        </button>
      </div>
    );
  }

  const handleDownloadDatasheet = (prod: Product) => {
    const specContent = `================================================================================
FLAVOUR & FRAGRANCES AROMATICS AG — TECHNICAL DATA SHEET (TDS) & REGULATORY DOSSIER
Rue de la Distillation 42, 1204 Geneva, Switzerland | ISO 9001 & FSSC 22000 v6
================================================================================

PRODUCT NAME:          ${prod.name}
SKU / ARTICLE CODE:    ${prod.sku}
PRODUCT TYPE:          ${prod.productType}
CATEGORY:              ${prod.category} / ${prod.subcategory}
DOCUMENT REFERENCE:    ${prod.technicalDocUrl || `TDS-${prod.sku}-2026`}
ISSUE DATE:            ${new Date().toISOString().split('T')[0]}

1. ORGANOLEPTIC & SENSORY PROFILE
--------------------------------------------------------------------------------
Summary:               ${prod.shortDescription}
Architecture / Notes:  ${prod.ingredientsNotes}

2. TECHNICAL DESCRIPTION & MATRIX PERFORMANCE
--------------------------------------------------------------------------------
${prod.fullDescription}

3. RECOMMENDED APPLICATIONS & DOSAGE GUIDELINES
--------------------------------------------------------------------------------
Target Matrices:       ${prod.applications}
Typical Dosage Range:  ${prod.productType === 'Fragrance' ? '0.30% – 22.0% (Depending on IFRA Category 1–12)' : '0.08% – 0.35% w/w in finished food/beverage matrix'}
Flash Point (Closed):  > 64.5 °C (Pensky-Martens ASTM D93)
Specific Gravity 20°C: 1.012 – 1.048 g/cm³
Refractive Index 20°C: 1.442 – 1.478
Shelf Life:            24 Months in unopened fluorinated aluminum or HDPE drums (15–20°C)

4. REGULATORY & COMPLIANCE ATTESTATION
--------------------------------------------------------------------------------
- EU Regulation (EC) No 1334/2008 & US FDA 21 CFR / FEMA GRAS Compliant
- IFRA 51st Amendment Certificate of Conformity Available
- Non-GMO (EC 1829/2003), BSE/TSE Free, Non-Irradiated
- Kosher Pareve (OU) & Halal (HAS 23000) Certified

For 72-Hour Laboratory Evaluation Samples or Bulk Drum Quotations:
Email: inquiries@example.com | Tel: +41 22 819 44 00
================================================================================`;

    const blob = new Blob([specContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${prod.sku}-${prod.slug}-Technical-Datasheet.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedTds(true);
    addToast(
      'Technical Datasheet Downloaded',
      `Saved ${prod.sku} specification & regulatory sheet.`
    );
  };

  const relatedProducts = products
    .filter((p) => p.status === 'Active' && p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12">
      <div className="max-w-[1360px] mx-auto px-6 space-y-12">
        {/* Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0F2922]/10 pb-4 text-xs text-[#0F1E19]/65">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate({ page: 'products' })}
              className="inline-flex items-center gap-1.5 text-[#0F2922] font-semibold hover:text-[#C5A059] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catalogue</span>
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              onClick={() => navigate({ page: 'products', categoryFilter: product.category })}
              className="hover:text-[#0F2922] cursor-pointer"
            >
              {product.category}
            </button>
            <span aria-hidden="true">/</span>
            <span className="font-mono tabular-nums text-[#0F2922]">{product.sku}</span>
          </div>
          <div className="font-mono tabular-nums">
            URL: /products/{product.slug} · Views: {product.views}
          </div>
        </div>

        {/* Main 2-Column Product Specification Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Visual Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-[4/3] rounded-md overflow-hidden border border-[#0F2922]/15 bg-white">
              <SafeImage
                src={activeImage || product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {galleryList.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {galleryList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`aspect-[4/3] rounded overflow-hidden border-2 transition-all cursor-pointer ${
                      (activeImage || product.imageUrl) === imgUrl
                        ? 'border-[#C5A059]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Technical Document Box */}
            <div className="border border-[#0F2922]/12 bg-white p-5 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#0F2922]" />
                  <div>
                    <div className="text-xs font-semibold text-[#0F2922]">
                      Technical Datasheet & Regulatory Dossier
                    </div>
                    <div className="text-xs text-[#0F1E19]/60 font-mono tabular-nums">
                      Ref: {product.sku}-TDS-2026 · CoA + GHS SDS + IFRA/GRAS
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadDatasheet(product)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#0F2922] bg-[#FAF9F6] hover:bg-[#0F2922] hover:text-[#FAF9F6] border border-[#0F2922]/25 rounded transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {downloadedTds ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                <span>
                  {downloadedTds
                    ? 'Datasheet Downloaded (Click to Re-Download)'
                    : 'Download Technical Document (TDS)'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Detailed B2B Specification & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3 border-b border-[#0F2922]/10 pb-6">
              <div className="flex items-center gap-2 text-xs text-[#0F1E19]/65">
                <span className="font-mono tabular-nums font-semibold text-[#0F2922]">
                  {product.sku}
                </span>
                <span aria-hidden="true">·</span>
                <span>{product.productType}</span>
                <span aria-hidden="true">·</span>
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>{product.subcategory}</span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0F2922]">
                {product.name}
              </h1>

              <p className="text-base text-[#0F1E19]/80 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Primary B2B Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="px-6 py-3 text-xs font-semibold text-[#0F2922] bg-[#C5A059] hover:bg-[#d1ae68] rounded-md transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'quote', productPreselect: product.name })}
                  className="px-6 py-3 text-xs font-semibold text-[#FAF9F6] bg-[#0F2922] hover:bg-[#16382E] rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  Request a Quote
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'sample', productPreselect: product.name })}
                  className="px-6 py-3 text-xs font-semibold text-[#0F1E19] bg-[#C5A059] hover:bg-[#d1ae68] rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  Request Sample (72h Dispatch)
                </button>
              </div>
            </div>

            {/* Olfactory / Flavour Profile Pyramid */}
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-[#0F2922]">
                {product.productType === 'Fragrance'
                  ? 'Olfactory Architecture & Key Notes'
                  : 'Sensory Profile & Aromatic Notes'}
              </h2>
              <div className="p-4 bg-white border border-[#0F2922]/12 rounded-md text-sm text-[#0F1E19]/85 leading-relaxed">
                {product.ingredientsNotes}
              </div>
            </div>

            {/* Full Engineering Description */}
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-[#0F2922]">
                Formulation & Matrix Performance
              </h2>
              <p className="text-sm text-[#0F1E19]/80 leading-relaxed whitespace-pre-line">
                {product.fullDescription}
              </p>
            </div>

            {/* Target Applications */}
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-[#0F2922]">
                Validated Industrial Applications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.applications.split(',').map((appItem, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-[#0F2922]/10 rounded text-xs font-medium text-[#0F2922] flex items-center gap-2"
                  >
                    <span className="text-[#C5A059]">·</span>
                    <span>{appItem.trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical & Physical Parameters Table */}
            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-[#0F2922]">
                Technical & Regulatory Specifications
              </h2>
              <div className="border border-[#0F2922]/12 rounded-md overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-[#0F2922]/10">
                    <tr>
                      <th className="py-3 px-4 font-semibold text-[#0F2922] bg-[#FAF9F6] w-2/5">
                        Article Code (SKU)
                      </th>
                      <td className="py-3 px-4 font-mono tabular-nums text-[#0F1E19]">
                        {product.sku}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-3 px-4 font-semibold text-[#0F2922] bg-[#FAF9F6]">
                        Available Physical Forms
                      </th>
                      <td className="py-3 px-4 text-[#0F1E19]">
                        {product.productType === 'Fragrance'
                          ? 'Liquid Compounded Oil · Water-Dispersible Micro-Emulsion · Encapsulated Slurry'
                          : 'Water-Soluble Liquid · Oil-Soluble Liquid · Spray-Dried Maltodextrin/Acacia Powder'}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-3 px-4 font-semibold text-[#0F2922] bg-[#FAF9F6]">
                        Recommended Dosage
                      </th>
                      <td className="py-3 px-4 font-mono tabular-nums text-[#0F1E19]">
                        {product.productType === 'Fragrance'
                          ? '0.50% – 20.0% w/w (IFRA Cat 1–12 Dependent)'
                          : '0.10% – 0.30% w/w (1.0g – 3.0g per kg finished product)'}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-3 px-4 font-semibold text-[#0F2922] bg-[#FAF9F6]">
                        Flash Point (Closed Cup)
                      </th>
                      <td className="py-3 px-4 font-mono tabular-nums text-[#0F1E19]">
                        &gt; 65.0 °C (Non-DG Air & Sea Freight Option Available)
                      </td>
                    </tr>
                    <tr>
                      <th className="py-3 px-4 font-semibold text-[#0F2922] bg-[#FAF9F6]">
                        Global Compliance
                      </th>
                      <td className="py-3 px-4 text-[#0F1E19]">
                        {product.productType === 'Fragrance'
                          ? 'IFRA 51st Amendment · EU REACH · EC 1223/2009 · Halal & Cruelty-Free'
                          : 'EU Flavouring Reg 1334/2008 · US FEMA GRAS · FSSC 22000 v6 · Kosher Pareve & Halal'}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-3 px-4 font-semibold text-[#0F2922] bg-[#FAF9F6]">
                        Standard Packaging & MOQ
                      </th>
                      <td className="py-3 px-4 font-mono tabular-nums text-[#0F1E19]">
                        5 kg, 25 kg Fluorinated Aluminum Drums · 180 kg Steel/HDPE Drums (MOQ: 25 kg)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Related Formulations */}
        {relatedProducts.length > 0 && (
          <section className="pt-12 border-t border-[#0F2922]/10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
                Complementary Formulations in {product.category}
              </h2>
              <button
                type="button"
                onClick={() => navigate({ page: 'products', categoryFilter: product.category })}
                className="text-xs font-semibold text-[#0F2922] hover:text-[#C5A059] cursor-pointer"
              >
                View All in {product.category} →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate({ page: 'product-detail', slug: rel.slug })}
                  className="border border-[#0F2922]/12 bg-white p-5 rounded-md hover:border-[#0F2922]/35 transition-colors cursor-pointer space-y-2"
                >
                  <div className="text-xs font-mono tabular-nums text-[#0F1E19]/60">
                    {rel.sku} · {rel.subcategory}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#0F2922]">{rel.name}</h3>
                  <p className="text-xs text-[#0F1E19]/75 line-clamp-2">{rel.shortDescription}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
