import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Award, ShieldCheck, Globe } from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { SafeImage } from '@/src/components/SafeImage';

export const metadata: Metadata = {
  title: 'Our Heritage & Philosophy — Flavour & Fragrances',
  description:
    'Discover the Swiss heritage, molecular olfactometry, and ethical botanical extraction that defines Flavour & Fragrances.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/30 selection:text-[#171717]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#171717] text-[#FAF8F3] py-24 sm:py-32 border-b border-white/10">
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity">
          <SafeImage
            src="/assets/images/quality_manufacturing_plant_1791482304210.jpg"
            alt="Geneva Extraction Plant"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/80 to-transparent" />

        <div className="relative mx-auto max-w-4xl px-6 text-center space-y-4">
          <span className="inline-block border border-[#B89555]/40 bg-[#242321] px-4 py-1 font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555]">
            The Swiss Atelier
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-light tracking-tight text-[#FAF8F3] uppercase">
            The Architecture <br />
            <span className="italic font-normal lowercase font-serif text-[#B89555]">of</span> Sensation
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#FAF8F3]/80 leading-relaxed font-light">
            Founded in Geneva in 1984, Flavour &amp; Fragrances bridges classical European perfumery with modern molecular taste synthesis.
          </p>
        </div>
      </section>

      {/* Narrative Section 1 */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555]">
              Division Olfactive · Botanical Mastery
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#171717] tracking-tight">
              Distilling Nature Without Depleting It
            </h2>
            <p className="text-xs sm:text-sm text-[#171717]/75 leading-relaxed font-light">
              True luxury lies in restraint and respect. In an era of rapid synthetic compounding, we believe in deep botanical time: hand-harvested centifolia roses from Grasse, wild sandalwood sustainably cultivated in New Caledonia, and sun-cured bourbon vanilla from the Sava region of Madagascar.
            </p>
            <p className="text-xs sm:text-sm text-[#171717]/75 leading-relaxed font-light">
              Through supercritical CO₂ extraction at sub-ambient temperatures, we capture the living volatile fractions of raw botanicals without thermal degradation or chemical solvent residues.
            </p>
            <div className="pt-2">
              <Link
                href="/fragrances"
                className="inline-flex items-center gap-2 bg-[#171717] px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
              >
                <span>Explore Fine Fragrances</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative aspect-4/3 overflow-hidden border border-[#171717]/10 bg-white">
            <SafeImage
              src="/assets/images/hero_botanical_lab_1791482243728.jpg"
              alt="Botanical Still"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Narrative Section 2: Taste Engineering */}
      <section className="bg-[#F3EBDD] py-20 border-y border-[#171717]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-4/3 overflow-hidden border border-[#171717]/10 bg-white lg:order-1 order-2">
              <SafeImage
                src="/assets/images/rd_chromatography_lab_1791482291315.jpg"
                alt="GC-MS Chromatography Lab"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-6 lg:order-2 order-1">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555]">
                Division Gustative · Taste Systems
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#171717] tracking-tight">
                Taste Solutions Engineered for Integrity
              </h2>
              <p className="text-xs sm:text-sm text-[#171717]/75 leading-relaxed font-light">
                Flavour creation is an exact science where thermodynamics and sensory perception collide. A delicate fruit top note that shines in a chilled sparkling water may disintegrate under the intense heat of industrial rotary biscuit ovens.
              </p>
              <p className="text-xs sm:text-sm text-[#171717]/75 leading-relaxed font-light">
                Our Geneva innovation center operates pilot-scale carbonation lines, twin-screw extruders, and micro-encapsulation spray dryers to ensure that every flavour emulsion performs flawlessly in your finished matrix.
              </p>
              <div className="pt-2">
                <Link
                  href="/flavours"
                  className="inline-flex items-center gap-2 bg-[#171717] px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
                >
                  <span>Explore Flavour Systems</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Regulatory Standards */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555]">
            Quality &amp; Transparency
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#171717] tracking-tight">
            International Compliance &amp; Certifications
          </h2>
          <p className="text-xs text-[#8A857D] font-light">
            Uncompromising safety benchmarks across all formulation categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-[#171717]/10 bg-white p-8 space-y-3">
            <Award className="h-6 w-6 text-[#B89555]" />
            <h4 className="font-serif text-xl font-light text-[#171717]">IFRA 51st Amendment</h4>
            <p className="text-xs text-[#8A857D] leading-relaxed font-light">
              Every fragrance compound is certified against the International Fragrance Association 51st Amendment standards, with maximum dosage guidelines provided for all 12 consumer application categories.
            </p>
          </div>

          <div className="border border-[#171717]/10 bg-white p-8 space-y-3">
            <ShieldCheck className="h-6 w-6 text-[#B89555]" />
            <h4 className="font-serif text-xl font-light text-[#171717]">FSSC 22000 &amp; ISO 9001</h4>
            <p className="text-xs text-[#8A857D] leading-relaxed font-light">
              Our Swiss compounding facilities operate under strict Hazard Analysis Critical Control Point (HACCP) principles, maintaining batch traceability from raw drum arrival through shipping dispatch.
            </p>
          </div>

          <div className="border border-[#171717]/10 bg-white p-8 space-y-3">
            <Globe className="h-6 w-6 text-[#B89555]" />
            <h4 className="font-serif text-xl font-light text-[#171717]">Halal &amp; Kosher Conformance</h4>
            <p className="text-xs text-[#8A857D] leading-relaxed font-light">
              We offer dedicated certified ethanol-free, non-GMO, and vegetarian-compliant flavour lines formulated to satisfy international religious and dietary requirements.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
