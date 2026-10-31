'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { SafeImage } from '@/src/components/SafeImage';
import { useStore } from '@/src/context/StoreContext';

export default function WishlistPage() {
  const { wishlist, products, addToCart, toggleWishlist, addToast } = useStore();

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistProducts.forEach((p) => {
      if (p.status === 'Active') {
        addToCart(p, 1);
      }
    });
    addToast('Added to Bag', 'All available saved formulations moved to your shopping bag.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/30 selection:text-[#171717]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#171717]/10 pb-6">
          <div>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555]">
              Curated Personal Formulary
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#171717] tracking-tight mt-1">
              Saved Wishlist
            </h1>
            <p className="text-xs text-[#8A857D] font-light mt-1">
              Curated formulations reserved for your future sensory commissions.
            </p>
          </div>

          {wishlistProducts.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="bg-[#171717] px-6 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors cursor-pointer"
            >
              Move All to Bag
            </button>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="my-16 border border-[#171717]/10 bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#171717]/15 text-[#B89555]">
              <Heart className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-2xl font-light text-[#171717]">
              Your Wishlist is Empty
            </h2>
            <p className="max-w-md mx-auto text-xs text-[#8A857D] font-light leading-relaxed">
              Click the heart icon on any formulation to preserve it in your personal atelier wishlist.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/fragrances"
                className="bg-[#171717] px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
              >
                Browse Fragrances
              </Link>
              <Link
                href="/flavours"
                className="border border-[#171717]/30 px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#171717] hover:border-[#171717] transition-colors"
              >
                Browse Flavours
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistProducts.map((product) => {
              const price = product.salePrice || product.price || 50;
              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between border-b border-transparent pb-4 transition-all duration-300 hover:border-[#171717]/20"
                >
                  <div>
                    {/* 4:5 Portrait Frame */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-white border border-[#171717]/10">
                      <Link href={`/product/${product.slug}`} className="block h-full w-full">
                        <SafeImage
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-103"
                        />
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label="Remove from wishlist"
                        className="absolute top-3 right-3 bg-white/95 p-2 text-red-600 border border-[#171717]/10 hover:text-red-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-1">
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#B89555]">
                        {product.parentGroup} · {product.category}
                      </span>
                      <Link href={`/product/${product.slug}`} className="block">
                        <h3 className="font-serif text-lg font-light text-[#171717] group-hover:text-[#B89555] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#8A857D] line-clamp-2 leading-relaxed font-light">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-4 border-t border-[#171717]/10 flex items-center justify-between">
                    <span className="font-mono text-sm font-medium text-[#171717]">
                      ${price.toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => addToCart(product, 1)}
                      className="flex items-center gap-1.5 bg-[#171717] px-3.5 py-1.5 font-mono text-[9.5px] uppercase tracking-wider text-[#FAF8F3] hover:bg-[#B89555] transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      <span>Add to Bag</span>
                    </button>
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
