import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  FlaskConical,
  CheckCircle2,
  FileCheck2,
  Send,
  Layers,
  ChevronRight,
  Microscope,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';
import { ASSET_IMAGES } from '../data/seedData';
import { inquirySchema, sampleRequestSchema, contactMessageSchema } from '../utils/validation';

export const HomePage: React.FC = () => {
  const { products, categories, industries, blogPosts, pages, navigate } = useStore();
  const pageCms = pages.home || {
    heroHeading: 'Creating Flavours. Crafting Fragrances.',
    heroSubheading:
      'Innovative flavour and fragrance solutions engineered for exceptional products and unforgettable experiences.',
    heroCtaPrimary: 'Explore Products',
    heroCtaSecondary: 'Request a Quote',
    sectionOneTitle: 'Swiss Precision Meets Botanical Artistry Since 1984',
    sectionOneBody:
      'Headquartered in Geneva with compounding facilities across Europe and Asia, Flavour & Fragrances partners with the world’s leading food, beverage, fine perfumery, personal care, and pharmaceutical brands.',
  };

  const featuredProducts = useMemo(
    () => products.filter((p) => p.featured && p.status === 'Active').slice(0, 6),
    [products]
  );

  const latestPosts = useMemo(
    () => blogPosts.filter((p) => p.published).slice(0, 3),
    [blogPosts]
  );

  return (
    <div className="space-y-24 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.08),transparent_32%),#FAF9F6] pb-20">
      {/* 1. Hero Section */}
      <section className="mesh-background relative isolate overflow-hidden pt-20 pb-28 text-[#FAF9F6] md:rounded-b-[3rem] md:py-32">
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity">
          <SafeImage
            src={ASSET_IMAGES.heroLab}
            alt="Flavour & Fragrances Distillation and Olfaction Laboratory"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#071a15]/95 via-[#0F2922]/80 to-[#0F2922]/35" />
        <div aria-hidden="true" className="animate-float absolute -right-20 top-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-[100px]" />
        <div aria-hidden="true" className="animate-float absolute bottom-0 right-[30%] h-56 w-56 rounded-full bg-violet-500/20 blur-[90px]" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-[1360px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="animate-fade-in-up space-y-6 lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-200 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              B2B Flavours & Fragrances Manufacturing · Geneva, Switzerland
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="animated-gradient-text">{pageCms.heroHeading}</span>
            </h1>
            <p className="max-w-2xl text-lg font-light leading-relaxed text-white/85 md:text-xl">
              {pageCms.heroSubheading}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate({ page: 'products' })}
                className="animate-glow inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 px-6 py-3.5 text-sm font-bold text-[#08251C] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                <span>{pageCms.heroCtaPrimary || 'Explore Products'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate({ page: 'quote' })}
                className="cursor-pointer rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-violet-300/60 hover:bg-white/20"
              >
                {pageCms.heroCtaSecondary || 'Request a Quote'}
              </button>
            </div>
          </div>

          <div className="animate-fade-in-up hidden lg:col-span-4 lg:block" style={{ animationDelay: '180ms' }}>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-xs text-white/80 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <div className="mb-4 border-b border-white/15 pb-3 font-display text-xl font-semibold text-white">
                Operational Highlights
              </div>
              {[
                ['Active Formulations:', '1,850+', 'text-emerald-300'],
                ['Global Export Destinations:', '64 Countries', 'text-amber-300'],
                ['Analytical Validation:', 'GC-MS/O & HPLC', 'text-violet-300'],
                ['Sample Turnaround:', '48–72 Hours', 'text-teal-300'],
              ].map(([label, value, color], index) => (
                <div key={label} className={`flex justify-between gap-4 py-3 ${index < 3 ? 'border-b border-white/10' : ''}`}>
                  <span>{label}</span>
                  <span className={`font-mono font-semibold tabular-nums ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Company Introduction */}
      <section className="mx-auto max-w-[1360px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white shadow-[0_25px_80px_rgba(16,185,129,0.13)] lg:col-span-5">
            <SafeImage
              src={ASSET_IMAGES.rdLab}
              alt="Perfumery and Flavour Organ in Geneva"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/30 via-transparent to-violet-500/15" />
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Corporate Heritage
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#0F2922]">
              {pageCms.sectionOneTitle}
            </h2>
            <p className="text-base text-[#0F1E19]/80 leading-relaxed">
              {pageCms.sectionOneBody}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#0F2922]/10 text-xs text-[#0F1E19]/75">
              <div>
                <strong className="block font-semibold text-[#0F2922] text-sm mb-1">
                  100% Traceable Sourcing
                </strong>
                Direct agricultural partnerships in Madagascar, Calabria, Grasse, and Isparta.
              </div>
              <div>
                <strong className="block font-semibold text-[#0F2922] text-sm mb-1">
                  Regulatory Security
                </strong>
                Complete IFRA 51st Amendment, EU 1334/2008, and FEMA GRAS compliance.
              </div>
              <div>
                <strong className="block font-semibold text-[#0F2922] text-sm mb-1">
                  Pilot-Scale Testing
                </strong>
                In-house mini-UHT lines, test bakeries, and cosmetic application labs.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Categories */}
      <section className="max-w-[1360px] mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#0F2922]/10 pb-4">
          <div>
            <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase mb-1">
              Core Divisions
            </div>
            <h2 className="font-display text-3xl font-semibold text-[#0F2922]">
              Product Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate({ page: 'products' })}
            className="text-xs font-semibold text-[#0F2922] hover:text-[#C5A059] flex items-center gap-1 cursor-pointer"
          >
            <span>View All {categories.length} Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate({ page: 'products', categoryFilter: cat.name })}
              className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-emerald-900/10 bg-white/75 p-6 shadow-[0_10px_35px_rgba(15,41,34,0.05)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/35 hover:shadow-[0_0_25px_rgba(16,185,129,0.16)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-violet-600 opacity-50 transition-opacity group-hover:opacity-100" />
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#0F1E19]/60">
                  <span className="font-semibold text-emerald-700">{cat.parentGroup}</span>
                  <span className="font-mono">Div. {cat.displayOrder.toString().padStart(2, '0')}</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#0F2922] transition-colors group-hover:text-emerald-700">
                  {cat.name}
                </h3>
                <p className="text-sm text-[#0F1E19]/75 line-clamp-3 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#0F2922]/5 flex items-center justify-between text-xs font-semibold text-[#0F2922]">
                <span>Browse Formulations</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Industries Served */}
      <section className="border-y border-emerald-900/5 bg-white/40 py-20">
        <div className="max-w-[1360px] mx-auto px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase">
              Global B2B Market Coverage
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#0F2922]">
              Industries We Serve
            </h2>
            <p className="text-sm text-[#0F1E19]/75">
              Formulations tailored to specific thermodynamic, enzymatic, and regulatory parameters across global industry verticals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {industries.map((ind) => (
              <div
                key={ind.id}
                onClick={() => navigate({ page: 'industries', slug: ind.slug })}
                className="group cursor-pointer space-y-2 rounded-2xl border border-emerald-900/10 bg-white/75 p-5 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/40 hover:shadow-[0_0_25px_rgba(13,148,136,0.15)]"
              >
                <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 transition-transform group-hover:scale-110">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#0F2922]">
                  {ind.name}
                </h3>
                <p className="text-xs text-[#0F1E19]/65 line-clamp-2">
                  {ind.applications}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Formulations */}
      <section className="max-w-[1360px] mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#0F2922]/10 pb-4">
          <div>
            <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase mb-1">
              Signature Profiles
            </div>
            <h2 className="font-display text-3xl font-semibold text-[#0F2922]">
              Featured Formulations
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate({ page: 'products' })}
            className="text-xs font-semibold text-[#0F2922] hover:text-[#C5A059] flex items-center gap-1 cursor-pointer"
          >
            <span>Explore Full Catalogue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-900/10 bg-white/75 shadow-[0_10px_35px_rgba(15,41,34,0.05)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-violet-400/40 hover:shadow-[0_0_25px_rgba(124,58,237,0.13)]"
            >
              <div>
                <div
                  onClick={() => navigate({ page: 'product-detail', slug: p.slug })}
                  className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-neutral-100"
                >
                  <SafeImage
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-[#0F2922]/85 text-[#FAF9F6] text-xs font-mono rounded">
                    {p.sku}
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <div className="text-xs text-[#0F1E19]/60">
                    {p.category} · {p.productType}
                  </div>
                  <h3
                    onClick={() => navigate({ page: 'product-detail', slug: p.slug })}
                    className="font-display text-xl font-semibold text-[#0F2922] hover:text-[#C5A059] cursor-pointer"
                  >
                    {p.name}
                  </h3>
                  <p className="text-xs text-[#0F1E19]/75 line-clamp-2 leading-relaxed">
                    {p.shortDescription}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between gap-2 border-t border-[#0F2922]/5 mt-4">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'sample', productPreselect: p.name })}
                  className="text-xs font-medium text-[#0F2922] hover:underline cursor-pointer"
                >
                  Order Sample
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'product-detail', slug: p.slug })}
                  className="px-3 py-1.5 text-xs font-semibold text-[#FAF9F6] bg-[#0F2922] rounded hover:bg-[#16382E] cursor-pointer"
                >
                  View Spec
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Why Choose Us & R&D Section */}
      <section className="mesh-background relative overflow-hidden py-20 text-[#FAF9F6]">
        <div className="max-w-[1360px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase">
              Swiss Manufacturing Standard
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight text-[#FAF9F6]">
              Why Global Brands Partner with Flavour & Fragrances
            </h2>
            <div className="space-y-4 text-sm text-[#FAF9F6]/85">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <div>
                  <strong className="block text-white font-semibold mb-0.5">
                    High Analytical Precision (GC-MS/O)
                  </strong>
                  Traceable composition with batch variance &lt;0.02% via automated robotic cleanroom compounding.
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div>
                  <strong className="block text-white font-semibold mb-0.5">
                    Regulatory Turnkey Support
                  </strong>
                  Instant access to GHS SDS, allergen breakdowns, certificates of analysis, and IFRA conformities.
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
                <div>
                  <strong className="block text-white font-semibold mb-0.5">
                    72-Hour Rapid Sample Dispatch
                  </strong>
                  Evaluation samples compounded and shipped directly from our Geneva and Zurich application laboratories.
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate({ page: 'rd' })}
                className="animate-glow cursor-pointer rounded-full bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 px-6 py-3 text-xs font-bold text-[#0F1E19] transition-all duration-300 hover:scale-[1.03]"
              >
                Learn About R&D Capabilities
              </button>
            </div>
          </div>

          <div className="group relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/20 shadow-[0_20px_70px_rgba(13,148,136,0.2)] lg:col-span-6">
            <SafeImage
              src={ASSET_IMAGES.qualityPlant}
              alt="Automated Compounding and Distillation Line"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/25 via-transparent to-teal-300/10" />
          </div>
        </div>
      </section>

      {/* 7. Latest News / Technical Blog */}
      <section className="max-w-[1360px] mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#0F2922]/10 pb-4">
          <div>
            <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase mb-1">
              Scientific Publications
            </div>
            <h2 className="font-display text-3xl font-semibold text-[#0F2922]">
              Latest Research & Insights
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate({ page: 'blog' })}
            className="text-xs font-semibold text-[#0F2922] hover:text-[#C5A059] flex items-center gap-1 cursor-pointer"
          >
            <span>Read All Articles</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate({ page: 'blog-detail', slug: post.slug })}
              className="group cursor-pointer space-y-3 rounded-2xl border border-emerald-900/10 bg-white/65 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/40 hover:shadow-[0_0_25px_rgba(13,148,136,0.14)]"
            >
              <div className="aspect-[16/9] overflow-hidden rounded-xl border border-[#0F2922]/10 bg-neutral-100">
                <SafeImage
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                />
              </div>
              <div className="text-xs text-[#0F1E19]/60 flex items-center gap-2">
                <span>{post.category}</span>
                <span>·</span>
                <span className="font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-[#0F2922] group-hover:text-[#C5A059] transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-xs text-[#0F1E19]/75 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 8. Conversion CTA Section */}
      <section className="max-w-[1360px] mx-auto px-6">
        <div className="relative isolate space-y-6 overflow-hidden rounded-[2rem] border border-white bg-white/70 p-10 text-center shadow-[0_25px_90px_rgba(16,185,129,0.12)] backdrop-blur-xl md:p-16">
          <div aria-hidden="true" className="absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-violet-300/25 blur-[80px]" />
          <div aria-hidden="true" className="absolute -bottom-24 -left-12 -z-10 h-56 w-56 rounded-full bg-emerald-300/25 blur-[80px]" />
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold text-[#0F2922] md:text-5xl">
            Ready to Formulate Your Next Benchmark Product?
          </h2>
          <p className="text-sm md:text-base text-[#0F1E19]/75 max-w-xl mx-auto">
            Connect directly with our senior application chemists in Geneva to request custom sample lots or discuss long-term compounding agreements.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate({ page: 'quote' })}
              className="cursor-pointer rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-3.5 text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]"
            >
              Request a Commercial Quote
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'sample' })}
              className="cursor-pointer rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(217,119,6,0.25)]"
            >
              Order Lab Evaluation Sample
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const { pages } = useStore();
  const content = pages.about;

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 space-y-16">
      <div className="max-w-[1360px] mx-auto px-6 space-y-12">
        <div className="space-y-4 max-w-3xl">
          <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase">
            About Flavour & Fragrances
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-[#0F2922]">
            {content?.heroHeading || 'Four Decades of Molecular Olfaction & Culinary Mastery'}
          </h1>
          <p className="text-lg text-[#0F1E19]/80 font-light leading-relaxed">
            {content?.heroSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-sm text-[#0F1E19]/80 leading-relaxed">
            <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
              {content?.sectionOneTitle}
            </h2>
            <p className="whitespace-pre-line">{content?.sectionOneBody}</p>
          </div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#0F2922]/15">
            <SafeImage
              src={ASSET_IMAGES.heroLab}
              alt="Flavour & Fragrances Headquarters"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="p-8 md:p-12 bg-white border border-[#0F2922]/12 rounded-lg space-y-6">
          <h2 className="font-display text-3xl font-semibold text-[#0F2922]">
            {content?.sectionTwoTitle}
          </h2>
          <p className="text-sm text-[#0F1E19]/80 leading-relaxed whitespace-pre-line">
            {content?.sectionTwoBody}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-3xl font-semibold text-[#0F2922]">
            {content?.sectionThreeTitle}
          </h2>
          <div className="p-8 bg-[#0F2922] text-[#FAF9F6] rounded-lg text-sm leading-relaxed whitespace-pre-line font-mono">
            {content?.sectionThreeBody}
          </div>
        </div>
      </div>
    </div>
  );
};

export const IndustriesPage: React.FC<{ slug?: string }> = ({ slug }) => {
  const { industries, navigate } = useStore();
  const [selectedSlug, setSelectedSlug] = useState<string>(slug || industries[0]?.slug || '');

  const activeIndustry = useMemo(
    () => industries.find((i) => i.slug === selectedSlug) || industries[0],
    [industries, selectedSlug]
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 space-y-12">
      <div className="max-w-[1360px] mx-auto px-6 space-y-10">
        <div>
          <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase mb-1">
            Industry Solutions
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#0F2922]">
            Industries & Applications
          </h1>
        </div>

        {/* Tabs for Industries */}
        <div className="flex flex-wrap gap-2 border-b border-[#0F2922]/10 pb-4">
          {industries.map((ind) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => setSelectedSlug(ind.slug)}
              className={`px-4 py-2 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                selectedSlug === ind.slug
                  ? 'bg-[#0F2922] text-[#FAF9F6]'
                  : 'bg-white border border-[#0F2922]/10 text-[#0F1E19]/75 hover:text-[#0F2922]'
              }`}
            >
              {ind.name}
            </button>
          ))}
        </div>

        {activeIndustry && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="font-display text-3xl font-semibold text-[#0F2922]">
                {activeIndustry.name}
              </h2>
              <p className="text-base text-[#0F1E19]/80 leading-relaxed">
                {activeIndustry.description}
              </p>

              <div className="p-6 bg-white border border-[#0F2922]/12 rounded-md space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#C5A059]">
                  Validated Target Applications
                </div>
                <div className="text-sm text-[#0F2922] leading-relaxed">
                  {activeIndustry.applications}
                </div>
              </div>

              <div className="p-6 bg-white border border-[#0F2922]/12 rounded-md space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#C5A059]">
                  Marquee Catalogue Profiles
                </div>
                <div className="text-sm text-[#0F1E19]/80 font-mono">
                  {activeIndustry.featuredProducts}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'quote', productPreselect: `${activeIndustry.name} Solution` })}
                  className="px-6 py-3.5 text-xs font-semibold text-[#FAF9F6] bg-[#0F2922] hover:bg-[#16382E] rounded-md transition-colors cursor-pointer"
                >
                  {activeIndustry.ctaText || 'Consult Industry Specialists'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#0F2922]/15">
                <SafeImage
                  src={activeIndustry.imageUrl || ASSET_IMAGES.flavours}
                  alt={activeIndustry.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const RDPage: React.FC = () => {
  const { pages } = useStore();
  const content = pages.rd;

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 space-y-16">
      <div className="max-w-[1360px] mx-auto px-6 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase">
            R&D Capabilities & Innovation
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-[#0F2922]">
            {content?.heroHeading || 'Where Analytical Chemistry Meets Human Sensory Artistry'}
          </h1>
          <p className="text-lg text-[#0F1E19]/80 font-light leading-relaxed">
            {content?.heroSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white border border-[#0F2922]/12 rounded-lg space-y-4">
            <Microscope className="w-8 h-8 text-[#0F2922]" />
            <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
              {content?.sectionOneTitle}
            </h2>
            <p className="text-xs text-[#0F1E19]/75 leading-relaxed">
              {content?.sectionOneBody}
            </p>
          </div>

          <div className="p-8 bg-white border border-[#0F2922]/12 rounded-lg space-y-4">
            <FlaskConical className="w-8 h-8 text-[#0F2922]" />
            <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
              {content?.sectionTwoTitle}
            </h2>
            <p className="text-xs text-[#0F1E19]/75 leading-relaxed">
              {content?.sectionTwoBody}
            </p>
          </div>

          <div className="p-8 bg-white border border-[#0F2922]/12 rounded-lg space-y-4">
            <Layers className="w-8 h-8 text-[#0F2922]" />
            <h2 className="font-display text-2xl font-semibold text-[#0F2922]">
              {content?.sectionThreeTitle}
            </h2>
            <p className="text-xs text-[#0F1E19]/75 leading-relaxed">
              {content?.sectionThreeBody}
            </p>
          </div>
        </div>

        <div className="aspect-[16/9] rounded-xl overflow-hidden border border-[#0F2922]/15">
          <SafeImage
            src={ASSET_IMAGES.rdLab}
            alt="GC-MS Instrumentation and Perfumer Organ"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export const QualityPage: React.FC = () => {
  const { certificates, pages, addToast } = useStore();
  const content = pages.quality;

  const downloadCert = (cert: (typeof certificates)[number]) => {
    addToast('Certificate Access', `Accessing ${cert.name} verification file.`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 space-y-16">
      <div className="max-w-[1360px] mx-auto px-6 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase">
            Quality Assurance & Certifications
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-[#0F2922]">
            {content?.heroHeading || 'Uncompromising Batch Consistency & Global Compliance'}
          </h1>
          <p className="text-lg text-[#0F1E19]/80 font-light leading-relaxed">
            {content?.heroSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white border border-[#0F2922]/12 rounded-md space-y-3">
            <h2 className="font-display text-xl font-semibold text-[#0F2922]">
              {content?.sectionOneTitle}
            </h2>
            <p className="text-xs text-[#0F1E19]/75 leading-relaxed">
              {content?.sectionOneBody}
            </p>
          </div>
          <div className="p-6 bg-white border border-[#0F2922]/12 rounded-md space-y-3">
            <h2 className="font-display text-xl font-semibold text-[#0F2922]">
              {content?.sectionTwoTitle}
            </h2>
            <p className="text-xs text-[#0F1E19]/75 leading-relaxed">
              {content?.sectionTwoBody}
            </p>
          </div>
          <div className="p-6 bg-white border border-[#0F2922]/12 rounded-md space-y-3">
            <h2 className="font-display text-xl font-semibold text-[#0F2922]">
              {content?.sectionThreeTitle}
            </h2>
            <p className="text-xs text-[#0F1E19]/75 leading-relaxed">
              {content?.sectionThreeBody}
            </p>
          </div>
        </div>

        {/* Live Certificates Table */}
        <div className="space-y-6">
          <h2 className="font-display text-3xl font-semibold text-[#0F2922]">
            Active Compliance & Regulatory Attestations
          </h2>
          <div className="border border-[#0F2922]/12 rounded-lg bg-white overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#0F2922]/10 text-[#0F2922]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Certificate Name</th>
                  <th className="py-3.5 px-6 font-semibold">License / Ref #</th>
                  <th className="py-3.5 px-6 font-semibold">Issuing Body</th>
                  <th className="py-3.5 px-6 font-semibold">Valid Thru</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F2922]/10">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#0F2922]">{cert.name}</td>
                    <td className="py-4 px-6 font-mono text-[#0F1E19]/75">{cert.certificateNumber}</td>
                    <td className="py-4 px-6 text-[#0F1E19]/75">{cert.issuingBody}</td>
                    <td className="py-4 px-6 font-mono text-[#0F1E19]/75">{cert.expiryDate}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => downloadCert(cert)}
                        className="px-3 py-1.5 text-xs font-medium text-[#0F2922] border border-[#0F2922]/20 rounded hover:bg-[#0F2922] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>View Attestation</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BlogListPage: React.FC = () => {
  const { blogPosts, navigate } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogPosts.forEach((b) => set.add(b.category));
    return ['All', ...Array.from(set)];
  }, [blogPosts]);

  const filteredPosts = useMemo(
    () =>
      blogPosts
        .filter((b) => b.published)
        .filter((b) => selectedCategory === 'All' || b.category === selectedCategory),
    [blogPosts, selectedCategory]
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 space-y-12">
      <div className="max-w-[1360px] mx-auto px-6 space-y-8">
        <div>
          <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase mb-1">
            Technical Publications
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#0F2922]">
            Flavour & Fragrance Science Journal
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[#0F2922]/10 pb-4">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                selectedCategory === c
                  ? 'bg-[#0F2922] text-[#FAF9F6]'
                  : 'bg-white border border-[#0F2922]/10 text-[#0F1E19]/70 hover:text-[#0F2922]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate({ page: 'blog-detail', slug: post.slug })}
              className="border border-[#0F2922]/12 bg-white rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#0F2922]/35 transition-all cursor-pointer group"
            >
              <div>
                <div className="aspect-[16/9] bg-neutral-100 overflow-hidden">
                  <SafeImage
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="text-xs text-[#0F1E19]/60 flex items-center gap-2">
                    <span>{post.category}</span>
                    <span>·</span>
                    <span className="font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-[#0F2922] group-hover:text-[#C5A059] transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-xs text-[#0F1E19]/75 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[#0F2922]/5 mt-4 text-xs font-semibold text-[#0F2922] flex items-center justify-between">
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export const BlogDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { blogPosts, navigate } = useStore();
  const post = useMemo(() => blogPosts.find((p) => p.slug === slug), [blogPosts, slug]);

  if (!post) {
    return (
      <div className="max-w-[1360px] mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#0F2922]">Article Not Found</h1>
        <button
          type="button"
          onClick={() => navigate({ page: 'blog' })}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-[#0F2922] text-[#FAF9F6] rounded"
        >
          Return to Journal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16">
      <article className="max-w-3xl mx-auto px-6 space-y-8">
        <button
          type="button"
          onClick={() => navigate({ page: 'blog' })}
          className="text-xs font-semibold text-[#0F2922] hover:underline"
        >
          ← Back to All Articles
        </button>

        <div className="space-y-4">
          <div className="text-xs font-medium text-[#C5A059] uppercase tracking-wider">
            {post.category}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-[#0F2922] leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#0F1E19]/60 border-y border-[#0F2922]/10 py-3 font-mono">
            <span>By {post.authorName}</span>
            <span>·</span>
            <span>Published {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#0F2922]/15">
          <SafeImage src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose max-w-none text-base text-[#0F1E19]/85 leading-relaxed whitespace-pre-line space-y-4">
          {post.content}
        </div>
      </article>
    </div>
  );
};

export const QuotePage: React.FC<{ productPreselect?: string }> = ({ productPreselect = '' }) => {
  const { submitInquiry, addToast } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    productName: productPreselect || '',
    quantity: '500 kg',
    application: '',
    message: '',
    attachmentUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = inquirySchema.safeParse(formData);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errMap[issue.path[0].toString()] = issue.message;
      });
      setErrors(errMap);
      return;
    }

    setSubmitting(true);
    try {
      await submitInquiry(result.data);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        country: '',
        productName: '',
        quantity: '',
        application: '',
        message: '',
        attachmentUrl: '',
      });
    } catch {
      addToast('Submission Error', 'Failed to submit quote inquiry. Please retry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <div>
          <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase mb-1">
            Commercial Supply & Contracting
          </div>
          <h1 className="font-display text-4xl font-semibold text-[#0F2922]">
            Request a Commercial Quotation
          </h1>
          <p className="mt-2 text-sm text-[#0F1E19]/75">
            Submit your volume requirements and target application. Our Geneva commercial desk provides formal FOB/CIF quotations within 24 business hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 bg-white border border-[#0F2922]/12 rounded-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="Dr. Julian Ross"
              />
              {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Company / Organization *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="Apex Beverage Group"
              />
              {errors.company && <div className="text-xs text-red-600 mt-1">{errors.company}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Corporate Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="j.ross@apexbev.com"
              />
              {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="+41 22 000 0000"
              />
              {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Country / Region *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="Switzerland"
              />
              {errors.country && <div className="text-xs text-red-600 mt-1">{errors.country}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Estimated Volume / Quantity *
              </label>
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="500 kg / Quarter"
              />
              {errors.quantity && <div className="text-xs text-red-600 mt-1">{errors.quantity}</div>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
              Target Product or Formulation *
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
              placeholder="e.g. Alphonso Mango WONF (FLV-FRT-101)"
            />
            {errors.productName && <div className="text-xs text-red-600 mt-1">{errors.productName}</div>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
              Finished Product Application *
            </label>
            <input
              type="text"
              value={formData.application}
              onChange={(e) => setFormData({ ...formData, application: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
              placeholder="Carbonated soft drink, UHT yogurt, Eau de Parfum 20%..."
            />
            {errors.application && <div className="text-xs text-red-600 mt-1">{errors.application}</div>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
              Project Details & Technical Requirements *
            </label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
              placeholder="Provide target launch timelines, thermal processing constraints, or certification mandates (Halal, Kosher, Organic)..."
            />
            {errors.message && <div className="text-xs text-red-600 mt-1">{errors.message}</div>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 text-sm font-semibold text-[#FAF9F6] bg-[#0F2922] hover:bg-[#16382E] rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Commercial Quote Request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export const SampleRequestPage: React.FC<{ productPreselect?: string }> = ({
  productPreselect = '',
}) => {
  const { submitSampleRequest, addToast } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    productName: productPreselect || '',
    quantity: '2 x 250g Evaluation Bottles',
    application: '',
    shippingAddress: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = sampleRequestSchema.safeParse(formData);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errMap[issue.path[0].toString()] = issue.message;
      });
      setErrors(errMap);
      return;
    }

    setSubmitting(true);
    try {
      await submitSampleRequest(result.data);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        country: '',
        productName: '',
        quantity: '',
        application: '',
        shippingAddress: '',
        message: '',
      });
    } catch {
      addToast('Submission Error', 'Failed to submit sample request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <div>
          <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase mb-1">
            Laboratory Evaluation
          </div>
          <h1 className="font-display text-4xl font-semibold text-[#0F2922]">
            Request 72-Hour Evaluation Samples
          </h1>
          <p className="mt-2 text-sm text-[#0F1E19]/75">
            Samples are compounded and dispatched directly from our Geneva and Zurich application centers via DHL Express Medical/Chemical priority.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 bg-white border border-[#0F2922]/12 rounded-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Scientist / Contact Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="Dr. Elena Rostova"
              />
              {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Company / R&D Facility *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="Helvetia Nutraceuticals AG"
              />
              {errors.company && <div className="text-xs text-red-600 mt-1">{errors.company}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Corporate Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="e.rostova@helvetianutra.ch"
              />
              {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="+41 44 000 0000"
              />
              {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Destination Country *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="Switzerland"
              />
              {errors.country && <div className="text-xs text-red-600 mt-1">{errors.country}</div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Sample Quantity Needed *
              </label>
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="2 x 250g Lab Bottles"
              />
              {errors.quantity && <div className="text-xs text-red-600 mt-1">{errors.quantity}</div>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
              Requested Product / Formulation *
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
              placeholder="e.g. Madagascar Bourbon Vanilla 10X (FLV-BAK-103)"
            />
            {errors.productName && <div className="text-xs text-red-600 mt-1">{errors.productName}</div>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
              Target Matrix & Application *
            </label>
            <input
              type="text"
              value={formData.application}
              onChange={(e) => setFormData({ ...formData, application: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
              placeholder="High-temperature brioche baking at 220°C"
            />
            {errors.application && <div className="text-xs text-red-600 mt-1">{errors.application}</div>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
              Laboratory Shipping Address *
            </label>
            <textarea
              rows={2}
              value={formData.shippingAddress}
              onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
              placeholder="Building C, Receiving Dock 2, Technoparkstrasse 18, 8005 Zürich, Switzerland"
            />
            {errors.shippingAddress && (
              <div className="text-xs text-red-600 mt-1">{errors.shippingAddress}</div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
              Testing Protocol or Additional Notes
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
              placeholder="Include Certificate of Analysis, Allergen Declaration, or specific carrier preference..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 text-sm font-semibold text-[#0F1E19] bg-[#C5A059] hover:bg-[#d4b16a] rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <FlaskConical className="w-4 h-4" />
            <span>{submitting ? 'Dispatching...' : 'Dispatch Evaluation Sample Request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { submitContactMessage, settings, addToast } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactMessageSchema.safeParse(formData);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errMap[issue.path[0].toString()] = issue.message;
      });
      setErrors(errMap);
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage(result.data);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        country: '',
        subject: '',
        message: '',
      });
    } catch {
      addToast('Submission Error', 'Failed to send message.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16">
      <div className="max-w-[1360px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase mb-1">
              Direct Inquiries
            </div>
            <h1 className="font-display text-4xl font-semibold text-[#0F2922]">
              Contact Flavour & Fragrances
            </h1>
            <p className="mt-3 text-sm text-[#0F1E19]/75 leading-relaxed">
              Connect with our international headquarters in Geneva or regional application centers for technical inquiries, distribution partnerships, or custom synthesis.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#0F2922]/12 rounded-lg space-y-4 text-xs text-[#0F1E19]/80 font-mono">
            <div>
              <strong className="block text-[#0F2922] font-semibold text-sm font-sans mb-1">
                Global Headquarters
              </strong>
              {settings.address}
            </div>
            <div>
              <strong className="block text-[#0F2922] font-semibold text-sm font-sans mb-1">
                Commercial Telephony
              </strong>
              Tel: {settings.phone}
              <br />
              WhatsApp Business: {settings.whatsapp}
            </div>
            <div>
              <strong className="block text-[#0F2922] font-semibold text-sm font-sans mb-1">
                Official Correspondence
              </strong>
              {settings.email}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-8 bg-white border border-[#0F2922]/12 rounded-lg space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                  placeholder="Claire Moreau"
                />
                {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                  placeholder="Laboratoires DermActif"
                />
                {errors.company && <div className="text-xs text-red-600 mt-1">{errors.company}</div>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                  placeholder="c.moreau@dermactif.fr"
                />
                {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                  placeholder="+33 1 00 00 00"
                />
                {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                  placeholder="France"
                />
                {errors.country && <div className="text-xs text-red-600 mt-1">{errors.country}</div>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                  placeholder="Distribution / Custom Compounding"
                />
                {errors.subject && <div className="text-xs text-red-600 mt-1">{errors.subject}</div>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2922] mb-1.5">
                Message *
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#0F2922]/15 rounded focus:outline-none focus:border-[#0F2922]"
                placeholder="How can our technical or commercial team assist your organization?"
              />
              {errors.message && <div className="text-xs text-red-600 mt-1">{errors.message}</div>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 text-sm font-semibold text-[#FAF9F6] bg-[#0F2922] hover:bg-[#16382E] rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending Message...' : 'Send Corporate Inquiry'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
