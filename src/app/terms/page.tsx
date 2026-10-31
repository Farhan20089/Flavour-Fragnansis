import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Flavour & Fragrances',
  description: 'Terms of sale, formulation warranties, and commercial conditions for Flavour & Fragrances.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="border-b border-[#171717]/10 pb-6 mb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B89555]">
            Legal & Governance
          </span>
          <h1 className="font-serif font-light tracking-tight text-3xl sm:text-4xl font-semibold text-[#171717] mt-1">
            Terms & Conditions of Sale
          </h1>
          <p className="text-xs text-[#171717]/60 mt-1">
            Governed by the Laws of the Canton of Geneva, Switzerland
          </p>
        </div>

        <div className="space-y-8 text-xs leading-relaxed text-[#171717]/80 font-light">
          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing the Flavour & Fragrances platform, creating an account, or purchasing fine fragrance compounds and culinary taste solutions, you agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              2. Formulation Specifications & Regulatory Conformity
            </h2>
            <p>
              All products manufactured by Flavour & Fragrances conform strictly to the International Fragrance Association (IFRA) 51st Amendment or relevant FEMA GRAS / EU Flavouring Regulation 1334/2008 standards as declared in accompanying Certificates of Analysis (CoA).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              3. Ordering, Pricing, and Payment
            </h2>
            <p>
              Prices are displayed in United States Dollars (USD) or Swiss Francs (CHF) and are exclusive of applicable value-added taxes unless stated otherwise. Orders placed on the site constitute a binding commercial agreement. We support Cash on Delivery (COD), verified invoicing, and direct bank wire settlements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              4. Shipping, Customs & Risk of Loss
            </h2>
            <p>
              Orders are dispatched via express courier from Geneva with end-to-end climate control and tracking. Title and risk of loss pass to the buyer upon handover to the authorized carrier. International import duties and customs tariffs remain the responsibility of the importing party.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              5. Returns & Quality Assurance
            </h2>
            <p>
              We provide a 30-day return policy for unopened items retaining intact laboratory tamper-evident seals. Bespoke custom GC-MS formulations commissioned to a unique sensory brief are non-refundable once production compounding has commenced.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              6. Jurisdiction
            </h2>
            <p>
              These Terms shall be interpreted in accordance with Swiss law. Any dispute arising out of or relating to these terms shall be submitted to the exclusive jurisdiction of the competent courts of the Canton of Geneva, Switzerland.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

