import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import ProductDetailClient from './ProductDetailClient';

type RouteContext = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: RouteContext): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
  });

  if (!product) {
    return { title: 'Product Not Found — Flavour & Fragrances' };
  }

  return {
    title: `${product.name} (${product.sku}) — Flavour & Fragrances`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} — Flavour & Fragrances`,
      description: product.shortDescription,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: RouteContext) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      categoryRef: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Increment views
  await prisma.product.update({
    where: { id: product.id },
    data: { views: { increment: 1 } },
  });

  const related = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      parentGroup: product.parentGroup,
      status: 'Active',
    },
    take: 4,
    orderBy: { views: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#111312]">
      <Navbar />
      <ProductDetailClient product={product} relatedProducts={related} />
      <Footer />
    </div>
  );
}

