'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function Footer() {
  const { addToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    addToast(
      'Enrolled in Atelier Privé',
      'You will receive private previews and formulation chronicles.',
      'success'
    );
  };

  return (
    <footer className="bg-[#171717] text-[#FAF8F3] border-t border-white/10 relative overflow-hidden">
      {/* Subtle top gold hairline */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#B89555]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-14 border-b border-white/10">
          {/* Column 1: Brand Identity & Narrative (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-light tracking-[0.1em] uppercase text-[#FAF8F3]">
                Flavour &amp; Fragrances
              </span>
              <span className="block text-[9px] uppercase tracking-[0.28em] text-[#B89555] font-mono font-medium mt-0.5">
                Geneva Atelier · Est. 1984
              </span>
            </Link>

            <p className="text-xs text-[#8A857D] max-w-sm leading-relaxed font-light">
              Maison de création synthesizing rare botanical absolutes, supercritical CO₂ extractions, and captive molecular olfactometry in Switzerland. Compliant with IFRA 51st Amendment and FEMA GRAS standards.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#B89555] mb-2 font-medium">
                Atelier Privé Gazette
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-[#B89555] font-serif">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Your email has been registered for private editions.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 border border-white/15 bg-white/5 px-3 py-2 text-xs text-[#FAF8F3] placeholder:text-[#8A857D] focus:border-[#B89555] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#B89555] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#171717] font-semibold hover:bg-[#F3EBDD] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Join</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: Collections & Shop */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B89555] font-medium">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8A857D] font-light">
              <li>
                <Link href="/shop" className="hover:text-[#FAF8F3] transition-colors">
                  Shop All Formulations
                </Link>
              </li>
              <li>
                <Link href="/fragrances" className="hover:text-[#FAF8F3] transition-colors">
                  Haute Parfumerie
                </Link>
              </li>
              <li>
                <Link href="/flavours" className="hover:text-[#FAF8F3] transition-colors">
                  Artisanal Flavours
                </Link>
              </li>
              <li>
                <Link href="/shop?group=Fragrances" className="hover:text-[#FAF8F3] transition-colors">
                  Fine Fragrance Accords
                </Link>
              </li>
              <li>
                <Link href="/shop?group=Flavours" className="hover:text-[#FAF8F3] transition-colors">
                  Beverage &amp; Food Extracts
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#FAF8F3] transition-colors">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B89555] font-medium">
              Client Service
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8A857D] font-light">
              <li>
                <Link href="/account" className="hover:text-[#FAF8F3] transition-colors">
                  Client Profile
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#FAF8F3] transition-colors">
                  Order Telemetry &amp; Tracking
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#FAF8F3] transition-colors">
                  Formulation Bag
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FAF8F3] transition-colors">
                  Custom Laboratory Briefs
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#FAF8F3] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FAF8F3] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Headquarters */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B89555] font-medium">
              Geneva Headquarters
            </h4>
            <div className="space-y-2 text-xs text-[#8A857D] font-light leading-relaxed">
              <p>Rue de la Distillation 42<br />1204 Geneva, Switzerland</p>
              <p className="font-mono text-[11px] text-[#FAF8F3]">
                +41 22 819 44 00
              </p>
              <p className="font-mono text-[11px] text-[#B89555]">
                concierge@flavourandfragrances.com
              </p>
              <p className="text-[10px] text-[#8A857D]">
                Monday – Friday: 08:30 – 18:00 CET
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Accreditations */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-[#8A857D] uppercase tracking-wider">
          <div>
            &copy; {new Date().getFullYear()} Flavour &amp; Fragrances SA. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>IFRA 51st Amendment</span>
            <span>·</span>
            <span>FSSC 22000</span>
            <span>·</span>
            <span>Geneva, Switzerland</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
