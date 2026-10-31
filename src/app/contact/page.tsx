'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { useStore } from '@/src/context/StoreContext';

export default function ContactPage() {
  const { addToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [intent, setIntent] = useState('Custom Formulation Brief');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || 'Private Individual',
          phone: phone.trim() || '',
          country: 'Switzerland',
          productName: intent,
          quantity: 'Brief / Consultation',
          application: intent,
          message: message.trim(),
          inquiryType: intent,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        addToast(
          'Brief Received',
          'Your formulation brief has been routed to our Geneva sensory directors.',
          'success'
        );
      } else {
        setErrorMsg('Unable to transmit inquiry. Please check your network connection.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred while transmitting your request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141413] antialiased selection:bg-[#C5A880]/30 selection:text-[#141413]">
      <Navbar />

      {/* Seamless Luxury Editorial Hero */}
      <section className="relative overflow-hidden pt-14 pb-12 lg:pt-20 lg:pb-16 border-b border-[#141413]/8">
        {/* Soft Ambient Light Glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
          <div className="h-[360px] w-[640px] rounded-full bg-gradient-to-tr from-[#C5A880]/20 via-[#FAF8F5] to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A880]/40 bg-white/60 px-3.5 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-[#8C733E] backdrop-blur-xs">
              <Sparkles className="h-3 w-3 text-[#C5A880]" />
              <span>Geneva Laboratory &amp; Global Ateliers</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#141413] leading-[1.12]">
              Connect With Our <br className="hidden sm:inline" />
              <span className="italic font-serif font-normal text-[#8C733E]">Sensory Atelier</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#6B665E] font-light leading-relaxed max-w-2xl">
              Whether you are commissioning a bespoke captive accord, requesting analytical GC-MS dossiers, or exploring commercial scaling for fine fragrances and taste systems, our master perfumers and flavourists in Geneva stand ready to assist.
            </p>
          </div>

          {/* 3-Pillar Laboratory Guarantee Ribbon */}
          <div className="mt-10 pt-6 border-t border-[#141413]/8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#141413]/70 font-light">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#C5A880] tracking-wider font-medium">01 /</span>
              <span>IFRA 51st Amendment &amp; FEMA GRAS Compliance</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#C5A880] tracking-wider font-medium">02 /</span>
              <span>72-Hour Evaluation Pilot Sample Dispatch</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#C5A880] tracking-wider font-medium">03 /</span>
              <span>Direct Consultation With Principal Chemists</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split-Screen Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Headquarters & Global Salon Network (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Primary Headquarters Card */}
            <div className="border border-[#141413]/10 bg-white p-8 space-y-6 shadow-[0_4px_24px_rgba(20,20,19,0.02)]">
              <div className="space-y-1.5 border-b border-[#141413]/8 pb-5">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#8C733E]">
                  Maison Centrale
                </span>
                <h2 className="font-serif text-2xl font-light text-[#141413]">
                  Geneva Innovation Center
                </h2>
                <p className="text-xs text-[#6B665E] font-light leading-relaxed pt-1">
                  Our Swiss center houses supercritical CO₂ extraction reactors, high-resolution GCxGC-TOFMS olfactometry suites, and executive compounding flacons.
                </p>
              </div>

              {/* Minimalist Contact Directory */}
              <div className="space-y-4 text-xs font-light">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-[#C5A880]/30 bg-[#FAF8F5] text-[#8C733E]">
                    <MapPin className="h-4 w-4 stroke-[1.5]" />
                  </div>
                  <div>
                    <strong className="block font-mono text-[10px] uppercase tracking-wider text-[#141413]">
                      Atelier Address
                    </strong>
                    <span className="text-[#6B665E] leading-relaxed block mt-0.5">
                      Rue de la Distillation 42, 1204 Geneva, Switzerland
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-[#C5A880]/30 bg-[#FAF8F5] text-[#8C733E]">
                    <Phone className="h-4 w-4 stroke-[1.5]" />
                  </div>
                  <div>
                    <strong className="block font-mono text-[10px] uppercase tracking-wider text-[#141413]">
                      Direct Telephone Line
                    </strong>
                    <span className="font-mono text-[#6B665E] text-xs block mt-0.5">
                      +41 22 819 44 00
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-[#C5A880]/30 bg-[#FAF8F5] text-[#8C733E]">
                    <Clock className="h-4 w-4 stroke-[1.5]" />
                  </div>
                  <div>
                    <strong className="block font-mono text-[10px] uppercase tracking-wider text-[#141413]">
                      Laboratory Operating Hours
                    </strong>
                    <span className="text-[#6B665E] text-xs block mt-0.5">
                      Monday through Friday · 08:30 – 18:00 CET
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-[#C5A880]/30 bg-[#FAF8F5] text-[#8C733E]">
                    <Mail className="h-4 w-4 stroke-[1.5]" />
                  </div>
                  <div>
                    <strong className="block font-mono text-[10px] uppercase tracking-wider text-[#141413]">
                      Sensory Concierge Email
                    </strong>
                    <span className="font-mono text-xs text-[#8C733E] underline underline-offset-4 block mt-0.5">
                      concierge@flavourandfragrances.com
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Hubs & Salons */}
            <div className="border border-[#141413]/10 bg-white p-7 space-y-4 shadow-[0_4px_24px_rgba(20,20,19,0.02)]">
              <div className="flex items-center justify-between border-b border-[#141413]/8 pb-3">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#8C733E]">
                  Regional Ateliers &amp; Evaluation Hubs
                </span>
                <Compass className="h-3.5 w-3.5 text-[#C5A880]" />
              </div>

              <div className="space-y-3.5 text-xs divide-y divide-[#141413]/6">
                <div className="pt-2 first:pt-0">
                  <div className="flex items-center justify-between">
                    <strong className="font-serif text-sm font-normal text-[#141413]">Grasse Botanical Distillerie</strong>
                    <span className="font-mono text-[9px] text-[#8C733E] uppercase">France</span>
                  </div>
                  <p className="text-[11px] text-[#6B665E] font-light mt-0.5">
                    Rose de Mai, Jasmine Grandiflorum, &amp; Neroli absolute harvesting.
                  </p>
                </div>

                <div className="pt-3">
                  <div className="flex items-center justify-between">
                    <strong className="font-serif text-sm font-normal text-[#141413]">Zurich Pilot Plant</strong>
                    <span className="font-mono text-[9px] text-[#8C733E] uppercase">Switzerland</span>
                  </div>
                  <p className="text-[11px] text-[#6B665E] font-light mt-0.5">
                    UHT beverage emulsions, bakery bake-stability, and confectionery testing.
                  </p>
                </div>

                <div className="pt-3">
                  <div className="flex items-center justify-between">
                    <strong className="font-serif text-sm font-normal text-[#141413]">Dubai Private Studio</strong>
                    <span className="font-mono text-[9px] text-[#8C733E] uppercase">UAE</span>
                  </div>
                  <p className="text-[11px] text-[#6B665E] font-light mt-0.5">
                    Haute Parfumerie, wild Aquilaria oudh macerations, and amber accords.
                  </p>
                </div>

                <div className="pt-3">
                  <div className="flex items-center justify-between">
                    <strong className="font-serif text-sm font-normal text-[#141413]">Singapore Innovation Laboratory</strong>
                    <span className="font-mono text-[9px] text-[#8C733E] uppercase">APAC</span>
                  </div>
                  <p className="text-[11px] text-[#6B665E] font-light mt-0.5">
                    Functional beverage development and tropical botanical extraction.
                  </p>
                </div>
              </div>

              {/* Confidentiality Commitment */}
              <div className="mt-4 pt-4 border-t border-[#141413]/8 flex items-start gap-2.5 text-[11px] text-[#6B665E] font-light">
                <ShieldCheck className="h-4 w-4 text-[#8C733E] shrink-0 mt-0.5" />
                <span>
                  All formulations, briefs, and client interactions are governed under strict mutual Non-Disclosure confidentiality protocols.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Elevated Inquiry & Brief Dossier (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#141413]/10 bg-white p-8 sm:p-12 shadow-2xl shadow-stone-200/50 space-y-8">
              <div className="border-b border-[#141413]/8 pb-6">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#C5A880] block mb-1.5">
                  Commissioning Brief · Formulaire Officiel
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#141413] tracking-tight">
                  Submit Formulation Brief
                </h3>
                <p className="text-xs text-[#6B665E] font-light mt-1.5 leading-relaxed">
                  Provide your technical requirements below. Our sensory evaluation board reviews every submission and responds within 24 business hours.
                </p>
              </div>

              {submitted ? (
                <div className="rounded-xl border border-[#C5A880]/30 bg-[#FAF8F5] p-10 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#C5A880]/40 bg-white text-[#8C733E]">
                    <CheckCircle2 className="h-7 w-7 stroke-[1.5]" />
                  </div>
                  <h4 className="font-serif text-2xl font-light text-[#141413]">
                    Brief Successfully Logged
                  </h4>
                  <p className="text-xs text-[#6B665E] font-light max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="font-medium text-[#141413]">{name}</strong>. Your communication has been dispatched to our Geneva formulation directors. A technical consultation will be delivered to <span className="font-mono text-[#8C733E]">{email}</span>.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setMessage('');
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#141413]/20 bg-white px-6 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[#141413] hover:border-[#141413] transition-colors cursor-pointer"
                    >
                      <span>Transmit Additional Brief</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                  {errorMsg && (
                    <div className="rounded-lg border border-red-200 bg-red-50/70 p-4 font-mono text-xs text-red-800 flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#141413]/80">
                        Client / Evaluator Full Name <span className="text-[#8C733E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Claire Moreau"
                        className="w-full rounded-lg border border-[#141413]/12 bg-[#FAF8F5]/60 px-4 py-3 text-xs text-[#141413] placeholder:text-[#141413]/30 transition-all focus:border-[#C5A880] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A880]/30"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#141413]/80">
                        Professional or Personal Email <span className="text-[#8C733E]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="claire.moreau@atelier.com"
                        className="w-full rounded-lg border border-[#141413]/12 bg-[#FAF8F5]/60 px-4 py-3 text-xs text-[#141413] placeholder:text-[#141413]/30 transition-all focus:border-[#C5A880] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A880]/30"
                      />
                    </div>

                    {/* Company / Atelier Name */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#141413]/80">
                        Maison, Brand or Institution Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Maison de Haute Parfumerie"
                        className="w-full rounded-lg border border-[#141413]/12 bg-[#FAF8F5]/60 px-4 py-3 text-xs text-[#141413] placeholder:text-[#141413]/30 transition-all focus:border-[#C5A880] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A880]/30"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#141413]/80">
                        Direct Phone (With Country Code)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+41 22 000 00 00"
                        className="w-full rounded-lg border border-[#141413]/12 bg-[#FAF8F5]/60 px-4 py-3 text-xs text-[#141413] placeholder:text-[#141413]/30 transition-all focus:border-[#C5A880] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A880]/30"
                      />
                    </div>
                  </div>

                  {/* Inquiry Intent */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#141413]/80">
                      Inquiry Classification / Focus Area
                    </label>
                    <select
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      className="w-full rounded-lg border border-[#141413]/12 bg-[#FAF8F5]/60 px-4 py-3 text-xs text-[#141413] transition-all focus:border-[#C5A880] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A880]/30 cursor-pointer"
                    >
                      <option value="Custom Formulation Brief">Custom Formulation Brief (Bespoke Fragrance or Taste Accord)</option>
                      <option value="Industrial Sample Request">72h Industrial Evaluation Sample Request</option>
                      <option value="Bulk Production Pricing">Bulk Production Pricing &amp; Minimum Order Quantities</option>
                      <option value="Regulatory & IFRA Dossier">IFRA 51st / Certificate of Analysis / SDS Regulatory Documentation</option>
                      <option value="Retail Client Support">Order Inquiries &amp; White-Glove Dispatch Logistics</option>
                    </select>
                  </div>

                  {/* Detailed Message / Brief */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#141413]/80">
                      Technical Formulation Brief &amp; Specifications <span className="text-[#8C733E]">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please elaborate on your target organoleptic or olfactory profile, intended application matrix (e.g., Extrait de Parfum, functional beverage, fine confectionery), target dosage percentage, volume expectations, and delivery milestones..."
                      className="w-full rounded-lg border border-[#141413]/12 bg-[#FAF8F5]/60 px-4 py-3 text-xs text-[#141413] placeholder:text-[#141413]/30 transition-all focus:border-[#C5A880] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A880]/30 leading-relaxed font-light"
                    />
                  </div>

                  {/* Bespoke CTA Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative w-full overflow-hidden rounded-lg bg-[#141413] py-4 px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[#FAF8F5] shadow-lg transition-all duration-300 hover:bg-[#8C733E] hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    <span>{submitting ? 'Transmitting Brief to Geneva…' : 'Transmit Formulation Brief'}</span>
                  </button>

                  <p className="text-[10px] text-center text-[#6B665E] font-light leading-relaxed pt-1">
                    By submitting, your brief is directly encrypted and dispatched under our Swiss confidentiality code and{' '}
                    <Link href="/privacy" className="underline hover:text-[#141413] transition-colors">
                      Privacy Policy
                    </Link>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
