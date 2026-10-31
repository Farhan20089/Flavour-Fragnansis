import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Sparkles, ShieldCheck, Award, Truck } from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { SafeImage } from '@/src/components/SafeImage';
import { HomeBestSellers } from '@/src/components/HomeBestSellers';
import { HomeNewsletter } from '@/src/components/HomeNewsletter';
import { prisma } from '@/src/lib/prisma';

export const metadata: Metadata = {
  title: 'Flavour & Fragrances — The Art of Beautiful Sensations',
  description:
    'Discover carefully curated flavours and fragrances that make every moment memorable. Luxury Swiss perfumery and artisanal botanical taste formulations from Geneva.',
};

export default async function HomePage() {
  const [bestSellers, featuredFragrances, featuredFlavours] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'Active' },
      take: 8,
      orderBy: { views: 'desc' },
      include: {
        reviews: {
          where: { approved: true },
        },
      },
    }),
    prisma.product.findMany({
      where: { parentGroup: 'Fragrances', status: 'Active' },
      take: 2,
      orderBy: { views: 'desc' },
    }),
    prisma.product.findMany({
      where: { parentGroup: 'Flavours', status: 'Active' },
      take: 2,
      orderBy: { views: 'desc' },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/25 selection:text-[#171717]">
      <Navbar />

      {/* C. Editorial Luxury Hero Section */}
      <section className="relative border-b border-[#171717]/8 bg-[#FAF8F3] pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Subtle Ambient Radial Highlight */}
        <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[#F3EBDD]/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Typographic Manifesto */}
            <div className="lg:col-span-7 space-y-8 animate-subtle-in">
              <div className="inline-flex items-center gap-2 border-b border-[#B89555] pb-1 text-[10px] font-mono uppercase tracking-[0.3em] text-[#B89555]">
                <span>Geneva Atelier · Est. 1984</span>
              </div>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[#171717] leading-[1.08] tracking-tight uppercase">
                The Art of <br />
                <span className="italic font-normal font-serif lowercase">beautiful</span> <br />
                Sensations
              </h1>

              <p className="max-w-xl text-sm sm:text-base text-[#171717]/70 leading-relaxed font-light">
                Discover carefully curated flavours and fragrances that make every moment memorable. Synthesizing rare botanical absolutes, supercritical CO₂ extractions, and captive aroma chemistry in Geneva.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2.5 bg-[#171717] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#FAF8F3] transition-all hover:bg-[#B89555] hover:shadow-md cursor-pointer"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-[#171717]/25 bg-transparent px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717] transition-colors hover:border-[#171717] hover:bg-[#171717]/5 cursor-pointer"
                >
                  <span>Discover Our Story</span>
                </Link>
              </div>

              {/* Accreditations Ribbon */}
              <div className="pt-6 flex flex-wrap items-center gap-6 text-[10.5px] font-mono text-[#8A857D] border-t border-[#171717]/8 uppercase tracking-wider">
                <span>IFRA 51st Amendment</span>
                <span>·</span>
                <span>Supercritical CO₂ Extract</span>
                <span>·</span>
                <span>GC-MS Analytical Purity</span>
              </div>
            </div>

            {/* Right Column: Editorial Hero Frame */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#171717]/10 bg-[#F3EBDD] shadow-xl">
                <SafeImage
                  src="/assets/images/hero_botanical_lab_1791482243728.jpg"
                  alt="Flavour & Fragrances Botanical Laboratory Specimen"
                  className="h-full w-full object-cover transition-transform duration-1000 hover:scale-103"
                />
                <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-xs p-4 border border-[#171717]/10">
                  <div className="flex items-center justify-between font-mono text-[#B89555] uppercase tracking-wider text-[9px]">
                    <span>Atelier Specimen Nº 42</span>
                    <span>Geneva, CH</span>
                  </div>
                  <div className="mt-1 font-serif text-sm font-medium text-[#171717]">
                    Pure Botanical Absolute &amp; Taste Extraction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D. Featured Collections: Distinct Flavours and Fragrances Sections */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#B89555]">
            Curated Divisions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#171717]">
            Distinct Worlds of Craft
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Collection 1: FLAVOURS (Warm Cream Background) */}
          <div className="group relative flex flex-col justify-between border border-[#171717]/12 bg-[#F3EBDD] p-8 sm:p-12 transition-all duration-300 hover:border-[#B89555]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">
                  01 / Division Gustative
                </span>
                <span className="font-mono text-[10px] text-[#8A857D] uppercase">Taste Systems</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#171717]">
                Flavours &amp; Extracts
              </h3>

              <p className="text-xs sm:text-sm text-[#171717]/70 leading-relaxed font-light max-w-md">
                Artisanal Madagascar vanilla 10X extractions, authentic fruit WONF essences, and heat-stable emulsions engineered for gourmet pastry, confectionery, and functional beverages.
              </p>

              <div className="pt-2 font-mono text-[10.5px] text-[#8A857D]">
                Profiles: Bourbon Vanilla · Wild Strawberry · Sicilian Blood Orange · Ghana Cocoa
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#171717]/10 flex items-center justify-between">
              <div className="aspect-[4/3] w-36 overflow-hidden border border-[#171717]/10 bg-white">
                <SafeImage
                  src="/assets/images/category_flavours_showcase_1791482261788.jpg"
                  alt="Artisanal Flavours"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <Link
                href="/flavours"
                className="group/btn inline-flex items-center gap-2 bg-[#171717] px-6 py-3 font-mono text-[10.5px] uppercase tracking-wider text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
              >
                <span>Explore Flavours</span>
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Collection 2: FRAGRANCES (Deep Charcoal / Black Background) */}
          <div className="group relative flex flex-col justify-between border border-[#171717]/12 bg-[#242321] text-[#FAF8F3] p-8 sm:p-12 transition-all duration-300 hover:border-[#B89555]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">
                  02 / Division Olfactive
                </span>
                <span className="font-mono text-[10px] text-[#8A857D] uppercase">Haute Parfumerie</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#FAF8F3]">
                Fine Fragrances
              </h3>

              <p className="text-xs sm:text-sm text-[#FAF8F3]/75 leading-relaxed font-light max-w-md">
                Parfum extracts, pure botanical absolutes, and captive amber accords formulated in strict conformity with IFRA 51st Amendment standards for 14-hour skin longevity.
              </p>

              <div className="pt-2 font-mono text-[10.5px] text-[#8A857D]">
                Accords: Royal Aquilaria Oud · Damascus Rose Otto · Imperial Jasmine Sambac
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="aspect-[4/3] w-36 overflow-hidden border border-white/10 bg-[#171717]">
                <SafeImage
                  src="/assets/images/category_fragrances_showcase_1791482275669.jpg"
                  alt="Fine Fragrances"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <Link
                href="/fragrances"
                className="group/btn inline-flex items-center gap-2 bg-[#B89555] px-6 py-3 font-mono text-[10.5px] uppercase tracking-wider text-[#171717] font-semibold hover:bg-[#F3EBDD] transition-colors"
              >
                <span>Explore Fragrances</span>
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* E. Best Sellers (Database-Backed Real Products) */}
      <section className="py-20 bg-white border-y border-[#171717]/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-[#171717]/10 pb-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B89555]">
                Curated Selection
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#171717] mt-1">
                Atelier Best Sellers
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-widest text-[#171717] hover:text-[#B89555] transition-colors"
            >
              <span>View Complete Archive</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <HomeBestSellers products={bestSellers} />
        </div>
      </section>

      {/* F. Brand Story: Clean Editorial Layout */}
      <section className="py-24 lg:py-32 bg-[#F3EBDD] border-b border-[#171717]/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Frame */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#171717]/10 bg-white shadow-md">
                <SafeImage
                  src="/assets/images/rd_chromatography_lab_1791482291315.jpg"
                  alt="Laboratory Chromatography & Olfactometry"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-103"
                />
              </div>
            </div>

            {/* Narrative Editorial */}
            <div className="lg:col-span-7 space-y-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#B89555]">
                Our Philosophy
              </span>

              <h2 className="font-serif text-4xl sm:text-5xl font-light text-[#171717] leading-tight tracking-tight uppercase">
                More Than a Scent. <br />
                <span className="italic font-normal font-serif lowercase">More than a</span> Flavour.
              </h2>

              <p className="text-xs sm:text-sm text-[#171717]/75 font-light leading-relaxed">
                Founded with an uncompromising devotion to pure botanical extraction, Flavour &amp; Fragrances unites classical European master perfumery with supercritical CO₂ extraction and GCxGC-TOFMS molecular chromatography in Geneva.
              </p>

              <p className="text-xs sm:text-sm text-[#171717]/75 font-light leading-relaxed">
                Every formula begins with exceptional raw materials—wild-harvested Rosa damascena petals, aged Mysore sandalwood, Sambava Bourbon vanilla beans, and fractionated citrus oils. We believe that true luxury lies in absolute transparency, certified analytical purity, and timeless formulation aesthetics.
              </p>

              <div className="pt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border-b-2 border-[#171717] pb-1 font-mono text-[11px] uppercase tracking-widest text-[#171717] hover:border-[#B89555] hover:text-[#B89555] transition-colors"
                >
                  <span>Read The Geneva Manifesto</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* G. Newsletter Section */}
      <HomeNewsletter />

      {/* H. Footer */}
      <Footer />
    </div>
  );
}
