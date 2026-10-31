'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { useStore } from '../context/StoreContext';
import type { Product, Review } from '@prisma/client';

interface ProductWithReviews extends Product {
  reviews?: Review[];
}

export function HomeBestSellers({ products }: { products: ProductWithReviews[] }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => {
        const inWishlist = isInWishlist(product.id);
        const price = product.salePrice || product.price || 65;
        const approvedReviews = product.reviews?.filter((r) => r.approved) || [];
        const hasReviews = approvedReviews.length > 0;
        const avgRating = hasReviews
          ? (
              approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
              approvedReviews.length
            ).toFixed(1)
          : null;

        // Parse variations
        let variantsCount = 3;
        try {
          if (product.variationsJson) {
            const parsed = JSON.parse(product.variationsJson);
            if (Array.isArray(parsed) && parsed.length > 0) variantsCount = parsed.length;
          }
        } catch {
          // fallback
        }

        return (
          <div
            key={product.id}
            className="group flex flex-col justify-between border-b border-[#171717]/8 pb-6 transition-all duration-300 hover:border-[#B89555]"
          >
            <div>
              {/* 4:5 Portrait Specimen Frame */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-white border border-[#171717]/8">
                <Link href={`/product/${product.slug}`} className="block h-full w-full">
                  <SafeImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-103"
                  />
                </Link>
                <div className="absolute top-3 left-3 bg-[#FAF8F3]/90 backdrop-blur-xs px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#171717] border border-[#171717]/10">
                  {product.sku}
                </div>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-[#171717] border border-[#171717]/10 shadow-xs hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${inWishlist ? 'fill-red-600 text-red-600' : ''}`}
                  />
                </button>
              </div>

              {/* Product Info */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-[9.5px] font-mono uppercase tracking-wider text-[#B89555]">
                  <span>{product.parentGroup} · {product.category}</span>
                  <span className="text-[#8A857D]">{variantsCount} formats</span>
                </div>

                <Link href={`/product/${product.slug}`} className="block">
                  <h3 className="font-serif text-lg font-light text-[#171717] group-hover:text-[#B89555] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-xs text-[#171717]/65 line-clamp-2 font-light leading-relaxed">
                  {product.shortDescription}
                </p>

                {/* Rating only when genuine review data exists */}
                {hasReviews && avgRating && (
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-[#8A857D]">
                    <Star className="h-3 w-3 fill-[#B89555] text-[#B89555]" />
                    <span>{avgRating} ({approvedReviews.length})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Action */}
            <div className="mt-4 pt-3 border-t border-[#171717]/8 flex items-center justify-between">
              <div>
                <span className="font-mono text-sm font-medium text-[#171717]">
                  ${price.toFixed(2)}
                </span>
                {product.salePrice && product.salePrice < product.price && (
                  <span className="ml-2 font-mono text-xs text-[#8A857D] line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addToCart(product as any, 1)}
                  className="flex items-center gap-1 bg-[#171717] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#FAF8F3] hover:bg-[#B89555] transition-colors cursor-pointer"
                >
                  <ShoppingBag className="h-3 w-3" />
                  <span>Add</span>
                </button>
                <Link
                  href={`/product/${product.slug}`}
                  className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#171717] hover:text-[#B89555] underline underline-offset-4 transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
