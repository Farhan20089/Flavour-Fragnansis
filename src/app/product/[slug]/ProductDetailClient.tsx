'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShoppingBag,
  CheckCircle,
  Truck,
  ShieldCheck,
  FileText,
  Star,
  ChevronRight,
  Minus,
  Plus,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SafeImage } from '@/src/components/SafeImage';
import { useStore } from '@/src/context/StoreContext';
import type { Product, Review as ReviewType } from '@prisma/client';

interface ProductWithExtras extends Product {
  reviews: ReviewType[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: ProductWithExtras;
  relatedProducts: Product[];
}) {
  const { addToCart, toggleWishlist, isInWishlist, addToast } = useStore();

  const variations: Array<{ size: string; price: number }> = useMemo(() => {
    try {
      if (product.variationsJson) {
        const parsed = JSON.parse(product.variationsJson);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    const defaultPrice = product.salePrice || product.price || 85;
    return [
      { size: '50ml · 1.7 fl.oz', price: defaultPrice },
      { size: '100ml · 3.4 fl.oz', price: Math.round(defaultPrice * 1.65) },
      { size: '500ml · Atelier Refill', price: Math.round(defaultPrice * 4.2) },
    ];
  }, [product]);

  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState(product.reviews || []);

  const selectedVariation = variations[selectedVarIndex];
  const currentPrice = selectedVariation?.price || product.salePrice || product.price || 85;
  const inWishlist = isInWishlist(product.id);

  // Gallery
  const galleryImages = useMemo(() => {
    const list = [product.imageUrl];
    if (product.galleryUrls) {
      product.galleryUrls.split(',').forEach((url) => {
        const trimmed = url.trim();
        if (trimmed && !list.includes(trimmed)) list.push(trimmed);
      });
    }
    return list;
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);

  // Sensory Accord Decomposition
  const olfactoryNotes = useMemo(() => {
    const raw = product.ingredientsNotes || '';
    if (!raw) return null;

    // Check if delimited by slashes, commas, or tiers
    const parts = raw.split(/[\/,|•]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return {
        head: parts.slice(0, Math.ceil(parts.length / 3)).join(' · '),
        heart: parts.slice(Math.ceil(parts.length / 3), Math.ceil((parts.length * 2) / 3)).join(' · '),
        base: parts.slice(Math.ceil((parts.length * 2) / 3)).join(' · '),
      };
    }
    return {
      head: parts[0] || 'Bright Citric Accord',
      heart: parts[1] || 'Heart Botanicals & Floral Resins',
      base: parts.slice(2).join(' · ') || 'Woody Amber Fixatives',
    };
  }, [product.ingredientsNotes]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewComment) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewerName,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLocalReviews((prev) => [data.data, ...prev]);
        setShowReviewForm(false);
        setReviewerName('');
        setReviewComment('');
        setReviewTitle('');
        addToast('Review Submitted', 'Thank you for sharing your formulation evaluation.', 'success');
      } else {
        addToast('Submission Error', data.error || 'Failed to submit review.', 'error');
      }
    } catch {
      addToast('Error', 'Unable to submit review right now.', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        price: currentPrice,
        salePrice: null,
      } as any,
      quantity,
      selectedVariation?.size
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-14">
      {/* Editorial Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#171717]/50">
        <Link href="/" className="hover:text-[#171717] transition-colors">
          Atelier
        </Link>
        <span className="text-[#171717]/20">/</span>
        <Link
          href={product.parentGroup === 'Flavours' ? '/flavours' : '/fragrances'}
          className="hover:text-[#171717] transition-colors"
        >
          {product.parentGroup === 'Flavours' ? 'Division Gustative' : 'Division Olfactive'}
        </Link>
        <span className="text-[#171717]/20">/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-[#171717] transition-colors"
        >
          {product.category}
        </Link>
        <span className="text-[#171717]/20">/</span>
        <span className="text-[#171717] font-semibold truncate max-w-[200px]">
          {product.sku}
        </span>
      </nav>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Specimen Showcase & Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-white border border-[#171717]/10">
            <SafeImage
              src={selectedImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-103"
            />
            <div className="absolute top-4 left-4 bg-[#FAF8F3]/90 backdrop-blur-xs px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[#171717] border border-[#171717]/10">
              Batch: {product.sku}
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              className="absolute top-4 right-4 bg-[#FAF8F3]/90 p-2.5 text-[#171717] border border-[#171717]/10 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-600 text-red-600' : ''}`} />
            </button>
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`h-20 w-16 shrink-0 overflow-hidden border transition-all cursor-pointer ${
                    selectedImage === img
                      ? 'border-[#171717] opacity-100'
                      : 'border-[#171717]/15 opacity-60 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Olfactory / Taste Pyramid Sensory Box */}
          {product.parentGroup === 'Fragrances' && olfactoryNotes && (
            <div className="mt-8 border border-[#171717]/10 bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#171717]/8 pb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">
                  Olfactory Pyramid Architecture
                </span>
                <span className="font-mono text-[10px] text-[#171717]/40">IFRA 51st Verified</span>
              </div>

              <div className="space-y-4 text-xs font-light">
                <div className="grid grid-cols-3 gap-4 border-b border-[#171717]/6 pb-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#171717]/60">
                    Tête · Top
                  </div>
                  <div className="col-span-2 font-serif text-sm text-[#171717]">
                    {olfactoryNotes.head}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-[#171717]/6 pb-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#171717]/60">
                    Cœur · Heart
                  </div>
                  <div className="col-span-2 font-serif text-sm text-[#171717]">
                    {olfactoryNotes.heart}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#171717]/60">
                    Fond · Base
                  </div>
                  <div className="col-span-2 font-serif text-sm text-[#171717]">
                    {olfactoryNotes.base}
                  </div>
                </div>
              </div>
            </div>
          )}

          {product.parentGroup === 'Flavours' && product.tasteProfile && (
            <div className="mt-8 border border-[#171717]/10 bg-white p-6 space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">
                Organoleptic Taste Profile
              </span>
              <p className="font-serif text-base italic text-[#171717] leading-relaxed">
                &ldquo;{product.tasteProfile}&rdquo;
              </p>
              <div className="pt-2 border-t border-[#171717]/8 font-mono text-[10px] text-[#171717]/50">
                Matrix: {product.applications || 'Confectionery, Dairy, High-Brix Syrups, RTD'}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dossier & Acquisition Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3 border-b border-[#171717]/10 pb-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">
                {product.parentGroup} · {product.category}
              </span>
              <span className="font-mono text-[10px] text-[#171717]/50">REF: {product.sku}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#171717] tracking-tight">
              {product.name}
            </h1>

            {/* Ratings & Authenticity */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center text-[#B89555]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(product.rating || 5)
                        ? 'fill-[#B89555]'
                        : 'text-[#171717]/20'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-xs font-medium text-[#171717]">
                {product.rating ? product.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-[#171717]/40 font-mono text-[10px]">
                ({localReviews.length} client evaluations)
              </span>
            </div>

            {/* Price Presentation */}
            <div className="pt-2 flex items-baseline gap-4">
              <span className="font-mono text-3xl font-light text-[#171717]">
                ${currentPrice.toFixed(2)}
              </span>
              {product.salePrice && product.salePrice < product.price && (
                <span className="font-mono text-sm text-[#171717]/40 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                In Stock ({product.stockQuantity} flacons)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#171717]/70 font-light leading-relaxed pt-2">
              {product.shortDescription}
            </p>
          </div>

          {/* Volume Selection */}
          {variations.length > 0 && (
            <div className="space-y-3">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#171717]">
                Select Atelier Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {variations.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedVarIndex(i)}
                    className={`border p-3 text-left transition-all cursor-pointer ${
                      selectedVarIndex === i
                        ? 'border-[#171717] bg-[#171717] text-[#FAF8F3]'
                        : 'border-[#171717]/15 bg-white text-[#171717] hover:border-[#171717]/50'
                    }`}
                  >
                    <div className="text-[11px] font-medium tracking-tight">{v.size}</div>
                    <div className="font-mono text-xs opacity-80 mt-1">${v.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Add to Bag */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 items-center border border-[#171717]/20 bg-white px-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-1.5 text-[#171717] hover:bg-[#171717]/5 transition-colors cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-mono text-xs font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  aria-label="Increase quantity"
                  className="p-1.5 text-[#171717] hover:bg-[#171717]/5 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 flex h-12 items-center justify-center gap-2 bg-[#171717] px-6 text-xs font-mono font-medium uppercase tracking-[0.15em] text-[#FAF8F3] hover:bg-[#B89555] transition-colors cursor-pointer"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Acquire · ${(currentPrice * quantity).toFixed(2)}</span>
              </button>
            </div>
          </div>

          {/* Guarantees Matrix */}
          <div className="border border-[#171717]/10 bg-white p-5 space-y-3 font-light text-xs text-[#171717]/75">
            <div className="flex items-start gap-3">
              <Truck className="h-4 w-4 text-[#B89555] shrink-0 mt-0.5" />
              <span>Complimentary insured courier delivery on all orders exceeding $150.</span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-[#B89555] shrink-0 mt-0.5" />
              <span>Individually numbered laboratory flacon seal with 30-day atelier guarantee.</span>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-[#B89555] shrink-0 mt-0.5" />
              <span>Certified with batch GC-MS analysis &amp; IFRA 51st Amendment compliance dossier.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Customer Reviews */}
      <section className="mt-20 border-t border-[#171717]/10 pt-10">
        <div className="flex items-center gap-8 border-b border-[#171717]/10 pb-4 text-xs font-mono uppercase tracking-widest">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-[#171717] text-[#171717] font-semibold'
                : 'border-transparent text-[#171717]/40 hover:text-[#171717]'
            }`}
          >
            Formulation Narrative
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'specs'
                ? 'border-[#171717] text-[#171717] font-semibold'
                : 'border-transparent text-[#171717]/40 hover:text-[#171717]'
            }`}
          >
            Technical Dossier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-[#171717] text-[#171717] font-semibold'
                : 'border-transparent text-[#171717]/40 hover:text-[#171717]'
            }`}
          >
            Client Evaluations ({localReviews.length})
          </button>
        </div>

        <div className="py-8">
          {activeTab === 'details' && (
            <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-[#171717]/80 font-light">
              <p className="font-serif text-lg text-[#171717] leading-relaxed">
                {product.fullDescription}
              </p>
              {product.ingredientsNotes && (
                <div className="border border-[#171717]/10 bg-white p-5 mt-6">
                  <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#B89555] mb-2">
                    {product.parentGroup === 'Fragrances' ? 'Sensory Notes Accord' : 'Organoleptic Profile'}
                  </h4>
                  <p className="text-xs text-[#171717] leading-relaxed">{product.ingredientsNotes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light">
              <div className="border border-[#171717]/10 bg-white p-4 space-y-1">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#B89555]">SKU / Formula Ref</span>
                <p className="font-mono text-sm font-medium text-[#171717]">{product.sku}</p>
              </div>
              <div className="border border-[#171717]/10 bg-white p-4 space-y-1">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#B89555]">Physical State &amp; Type</span>
                <p className="text-sm font-medium text-[#171717]">{product.productType || 'Pure Essence / Absolute'}</p>
              </div>
              <div className="border border-[#171717]/10 bg-white p-4 space-y-1">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#B89555]">Regulatory Certification</span>
                <p className="text-sm text-[#171717]">IFRA 51st Amendment / EU Reg. 1223/2009 / FEMA GRAS</p>
              </div>
              <div className="border border-[#171717]/10 bg-white p-4 space-y-1">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#B89555]">Recommended Applications</span>
                <p className="text-sm text-[#171717]">{product.applications || 'Haute Parfumerie, Artisanal Pastry, RTD Infusions'}</p>
              </div>
              {product.casNumber && (
                <div className="border border-[#171717]/10 bg-white p-4 space-y-1">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#B89555]">CAS Registry Number</span>
                  <p className="font-mono text-sm text-[#171717]">{product.casNumber}</p>
                </div>
              )}
              {product.solubility && (
                <div className="border border-[#171717]/10 bg-white p-4 space-y-1">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#B89555]">Solubility Profile</span>
                  <p className="text-sm text-[#171717]">{product.solubility}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-light text-[#171717]">
                    Verified Client Evaluations
                  </h3>
                  <p className="font-mono text-[10px] text-[#171717]/50 mt-1">
                    Aggregate appraisal: {product.rating ? product.rating.toFixed(1) : '5.0'} / 5.0
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-[#171717] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors cursor-pointer"
                >
                  {showReviewForm ? 'Cancel' : 'Submit Evaluation'}
                </button>
              </div>

              {/* Review Submission Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="border border-[#B89555]/40 bg-white p-6 space-y-4"
                >
                  <h4 className="font-serif text-lg font-light text-[#171717]">
                    Record Your Organoleptic Assessment
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                        Client / Evaluator Name
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="e.g. Jean-Luc Delacroix"
                        className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                        Appraisal Score
                      </label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none bg-white"
                      >
                        <option value={5}>5 Stars — Masterpiece</option>
                        <option value={4}>4 Stars — Commendable Depth</option>
                        <option value={3}>3 Stars — Balanced Accord</option>
                        <option value={2}>2 Stars — Moderate</option>
                        <option value={1}>1 Star — Suboptimal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                      Summary Note
                    </label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Exceptional longevity and botanical fidelity"
                      className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-1">
                      Detailed Olfactory / Taste Critique
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Detail sillage, diffusion, heat stability, or subtle accord progression..."
                      className="w-full border border-[#171717]/20 px-3 py-2 text-xs focus:border-[#171717] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-[#171717] px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Recording...' : 'Publish Evaluation'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {localReviews.length === 0 ? (
                  <p className="text-xs text-[#171717]/50 italic">
                    Be the first client to publish an organoleptic evaluation for this formulation.
                  </p>
                ) : (
                  localReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="border border-[#171717]/10 bg-white p-5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#171717]">
                            {rev.customerName}
                          </span>
                          {rev.verifiedPurchase && (
                            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                              <CheckCircle className="h-2.5 w-2.5" />
                              Verified Client
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-[#171717]/40">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex text-[#B89555]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < rev.rating ? 'fill-[#B89555]' : 'text-[#171717]/20'
                            }`}
                          />
                        ))}
                      </div>

                      {rev.title && (
                        <h5 className="font-serif text-sm font-medium text-[#171717]">{rev.title}</h5>
                      )}
                      <p className="text-xs text-[#171717]/70 leading-relaxed font-light">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Complementary Formulations */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-[#171717]/10 pt-16">
          <div className="mb-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">
              Harmonious Compositions
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#171717] mt-1">
              Complementary Formulations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="group flex flex-col justify-between border-b border-transparent pb-4 transition-all hover:border-[#171717]/20"
              >
                <div>
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-white border border-[#171717]/8">
                    <Link href={`/product/${rel.slug}`} className="block h-full w-full">
                      <SafeImage
                        src={rel.imageUrl}
                        alt={rel.name}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-103"
                      />
                    </Link>
                    <div className="absolute top-3 left-3 bg-white/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#171717] border border-[#171717]/10">
                      {rel.sku}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#B89555]">
                      {rel.category}
                    </span>
                    <Link href={`/product/${rel.slug}`} className="block">
                      <h4 className="font-serif text-base font-light text-[#171717] group-hover:text-[#B89555] transition-colors line-clamp-1">
                        {rel.name}
                      </h4>
                    </Link>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#171717]/8 flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-[#171717]">
                    ${(rel.salePrice || rel.price || 75).toFixed(2)}
                  </span>
                  <Link
                    href={`/product/${rel.slug}`}
                    className="font-mono text-[10px] uppercase tracking-wider text-[#171717] hover:text-[#B89555] underline underline-offset-4 transition-colors"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
