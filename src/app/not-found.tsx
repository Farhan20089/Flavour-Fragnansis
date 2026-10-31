import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FAF9F6] px-6 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#9A7738]">
        404 — Atelier Page Not Found
      </span>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl font-light text-[#0C1612]">
        Formulation Unavailable
      </h1>
      <p className="mt-3 max-w-md text-xs text-[#0C1612]/60 leading-relaxed">
        The archive page or bespoke formulation you are looking for has been relocated or archived in our olfactory library.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[#0C1612] px-6 py-2.5 text-xs font-semibold text-[#FAF9F6] transition-colors hover:bg-[#9A7738]"
        >
          Return to Boutique
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-[#0C1612]/20 px-6 py-2.5 text-xs font-semibold text-[#0C1612] transition-colors hover:bg-[#0C1612]/5"
        >
          Explore Catalogue
        </Link>
      </div>
    </main>
  );
}

