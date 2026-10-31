'use client';

import dynamic from 'next/dynamic';

const StoreApp = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-sm text-[#0F2922]/70">
      Loading Flavour & Fragrances…
    </main>
  ),
});

export function Storefront() {
  return <StoreApp />;
}
