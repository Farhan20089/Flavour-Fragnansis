import Link from 'next/link';
import { AuthForm } from '../ui/AuthForm';

export const metadata = {
  title: 'Client Sign In | Flavour & Fragrances',
  description: 'Sign in to access your Flavour & Fragrances account, track bespoke orders, and view saved formulations.',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F3] px-6 py-16 selection:bg-[#B89555]/30 selection:text-[#171717]">
      <section className="w-full max-w-md border border-[#171717]/10 bg-white p-8 sm:p-10 shadow-xs">
        <div className="text-center">
          <Link href="/" className="font-serif text-2xl font-light tracking-tight text-[#171717] hover:text-[#B89555] transition-colors uppercase">
            Flavour &amp; Fragrances
          </Link>
          <div className="mt-1.5 text-[9.5px] font-mono uppercase tracking-[0.3em] text-[#B89555]">
            Haute Parfumerie &amp; Taste Atelier
          </div>
        </div>

        <h1 className="mt-8 font-serif text-3xl font-light text-[#171717] text-center tracking-tight">
          Client Identification
        </h1>
        <p className="mt-2 text-xs text-[#8A857D] text-center font-light leading-relaxed">
          Sign in to access your private formulation dossier, orders, and saved wishlist.
        </p>

        <AuthForm mode="login" />

        <div className="mt-8 border-t border-[#171717]/10 pt-5 text-center">
          <p className="text-xs text-[#171717]/70 font-light">
            New to Flavour &amp; Fragrances?{' '}
            <Link href="/signup" className="font-semibold text-[#171717] hover:text-[#B89555] underline underline-offset-4 transition-colors">
              Request Client Registry
            </Link>
          </p>
          <div className="mt-4">
            <Link href="/" className="font-mono text-[10px] uppercase tracking-wider text-[#8A857D] hover:text-[#171717] transition-colors">
              ← Return to Atelier
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
