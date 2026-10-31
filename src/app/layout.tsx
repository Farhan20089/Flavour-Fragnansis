import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'Flavour & Fragrances — Haute Parfumerie & Artisanal Taste Creations',
  description:
    'Luxury Swiss perfumes, botanical taste solutions, and artisanal aromatic extractions crafted in Geneva with IFRA 51st Amendment certification.',
  openGraph: {
    type: 'website',
    siteName: 'Flavour & Fragrances',
    title: 'Flavour & Fragrances — Haute Parfumerie & Artisanal Taste Creations',
    description:
      'Luxury Swiss perfumes, botanical taste solutions, and artisanal aromatic extractions crafted in Geneva with IFRA 51st Amendment certification.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flavour & Fragrances — Haute Parfumerie & Artisanal Taste Creations',
    description:
      'Luxury Swiss perfumes, botanical taste solutions, and artisanal aromatic extractions crafted in Geneva with IFRA 51st Amendment certification.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#FAF8F3] text-[#171717] antialiased selection:bg-[#B89555]/25 selection:text-[#171717]"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Flavour & Fragrances',
              description:
                'Luxury artisanal fragrance house and natural botanical flavour formulation atelier.',
              foundingDate: '1984',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Rue de la Distillation 42',
                addressLocality: 'Geneva',
                postalCode: '1204',
                addressCountry: 'CH',
              },
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
