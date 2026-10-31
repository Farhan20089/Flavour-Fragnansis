import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — Flavour & Fragrances',
  description: 'Learn how Flavour & Fragrances protects your personal, formulation, and commercial data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="border-b border-[#171717]/10 pb-6 mb-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B89555]">
            Legal & Governance
          </span>
          <h1 className="font-serif font-light tracking-tight text-3xl sm:text-4xl font-semibold text-[#171717] mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#171717]/60 mt-1">
            Effective Date: October 31, 2026 · Compliant with Swiss FADP & EU GDPR
          </p>
        </div>

        <div className="space-y-8 text-xs leading-relaxed text-[#171717]/80 font-light">
          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              1. Commitment to Data Discretion
            </h2>
            <p>
              Flavour & Fragrances ("we", "our", or "the Atelier") respects your confidentiality and is dedicated to safeguarding personal data and formulation briefs entrusted to us. This policy describes how we collect, store, and utilize data when you browse our website, place an order, or submit an R&D sensory brief.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              2. Data We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Contact & Account Data:</strong> Name, professional affiliation, email, telephone number, and hashed authentication credentials.</li>
              <li><strong>Transactional Data:</strong> Delivery addresses, billing information, line items purchased, and payment method settlement records.</li>
              <li><strong>Formulation Briefs:</strong> Product requirements, intended application matrices, target olfactory profiles, and proprietary documentation.</li>
              <li><strong>Technical Telemetry:</strong> Anonymized analytical cookies, IP addresses, browser types, and session duration for security and site optimization.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              3. Protection of Proprietary Formulation Briefs
            </h2>
            <p>
              Any technical specification, counter-matching target, or bespoke brief submitted through our platform is treated as strictly confidential commercial intelligence. We never share formulation recipes, fragrance olfactory pyramids, or industrial taste modulators with unauthorized third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              4. Security Measures & Encryption
            </h2>
            <p>
              We implement industry-standard encryption protocols (TLS 1.3), bcrypt cryptographic password hashing (cost factor 12), and role-based database access permissions to shield your records against unauthorized access or breaches.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-light tracking-tight text-xl font-semibold text-[#171717]">
              5. Your Legal Rights
            </h2>
            <p>
              Under Swiss Federal Act on Data Protection (FADP) and the General Data Protection Regulation (GDPR), you possess the right to access, rectify, or request the deletion of your personal records. For data requests, contact our Data Governance Officer at <code>privacy@flavourandfragrances.com</code>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

