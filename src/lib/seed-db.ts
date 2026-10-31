import { prisma } from './prisma';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/seedData';
import { hash } from 'bcryptjs';

export async function seedDatabase() {
  console.log('--- Starting Database Seed & Sync ---');

  // 1. Seed Categories
  console.log(`Seeding ${INITIAL_CATEGORIES.length} categories...`);
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        parentGroup: cat.parentGroup,
        description: cat.description,
        imageUrl: cat.imageUrl,
        displayOrder: cat.displayOrder,
        active: cat.active,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        parentGroup: cat.parentGroup,
        description: cat.description,
        imageUrl: cat.imageUrl,
        displayOrder: cat.displayOrder,
        active: cat.active,
      },
    });
  }

  // 2. Seed Products
  console.log(`Seeding ${INITIAL_PRODUCTS.length} products...`);
  const categoriesInDb = await prisma.category.findMany();
  const categoryMap = new Map(categoriesInDb.map((c) => [c.name.toLowerCase(), c]));

  for (const prod of INITIAL_PRODUCTS) {
    const parentGroup =
      prod.productType === 'Flavour' ||
      prod.category.toLowerCase().includes('flavour') ||
      prod.sku.startsWith('FLV')
        ? 'Flavours'
        : 'Fragrances';

    const matchedCat = categoryMap.get(prod.category.toLowerCase()) as { id: string } | undefined;

    const basePrice =
      prod.estimatedPricePerKg && prod.estimatedPricePerKg > 0
        ? Number((prod.estimatedPricePerKg * 0.45).toFixed(2))
        : parentGroup === 'Fragrances'
          ? 78.0
          : 54.0;

    const variations =
      parentGroup === 'Fragrances'
        ? [
            { size: '50ml (Artisanal Atomizer)', price: basePrice },
            { size: '100ml (Flacon)', price: Number((basePrice * 1.65).toFixed(2)) },
            { size: '500ml (Laboratory Refill)', price: Number((basePrice * 6.2).toFixed(2)) },
          ]
        : [
            { size: '250ml (Application Trial)', price: Number((basePrice * 0.75).toFixed(2)) },
            { size: '1kg (Standard Canister)', price: basePrice },
            { size: '5kg (Pilot Production Drum)', price: Number((basePrice * 4.4).toFixed(2)) },
          ];

    const defaultImg =
      parentGroup === 'Flavours'
        ? '/assets/images/category_flavours_showcase_1791482261788.jpg'
        : '/assets/images/category_fragrances_showcase_1791482275669.jpg';

    const safeImageUrl =
      (typeof prod.imageUrl === 'string' && prod.imageUrl.length > 5 ? prod.imageUrl : null) ||
      defaultImg;

    const safeGalleryUrls =
      (typeof prod.galleryUrls === 'string' && prod.galleryUrls.length > 5 ? prod.galleryUrls : null) ||
      `${safeImageUrl},/assets/images/hero_botanical_lab_1791482243728.jpg`;

    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        slug: prod.slug,
        categoryId: (matchedCat as { id: string } | undefined)?.id || null,
        category: prod.category,
        subcategory: prod.subcategory || '',
        productType: prod.productType,
        parentGroup,
        shortDescription: prod.shortDescription,
        fullDescription: prod.fullDescription,
        applications: prod.applications || '',
        ingredientsNotes: prod.ingredientsNotes || '',
        casNumber: prod.casNumber || null,
        tasteProfile: prod.tasteProfile || null,
        olfactoryProfile: prod.olfactoryProfile || null,
        solubility: prod.solubility || null,
        heatStability: prod.heatStability || null,
        minimumOrderQuantity: prod.minimumOrderQuantity || '1 Unit',
        price: basePrice,
        salePrice: prod.featured ? Number((basePrice * 0.9).toFixed(2)) : null,
        imageUrl: safeImageUrl,
        galleryUrls: safeGalleryUrls,
        technicalDocUrl: prod.technicalDocUrl || null,
        featured: prod.featured || false,
        status: prod.status || 'Active',
        views: prod.views || 0,
        variationsJson: JSON.stringify(variations),
      },
      create: {
        name: prod.name,
        sku: prod.sku,
        slug: prod.slug,
        categoryId: (matchedCat as { id: string } | undefined)?.id || null,
        category: prod.category,
        subcategory: prod.subcategory || '',
        productType: prod.productType,
        parentGroup,
        shortDescription: prod.shortDescription,
        fullDescription: prod.fullDescription,
        applications: prod.applications || '',
        ingredientsNotes: prod.ingredientsNotes || '',
        casNumber: prod.casNumber || null,
        tasteProfile: prod.tasteProfile || null,
        olfactoryProfile: prod.olfactoryProfile || null,
        solubility: prod.solubility || null,
        heatStability: prod.heatStability || null,
        minimumOrderQuantity: prod.minimumOrderQuantity || '1 Unit',
        price: basePrice,
        salePrice: prod.featured ? Number((basePrice * 0.9).toFixed(2)) : null,
        stockQuantity: 120,
        lowStockThreshold: 15,
        imageUrl: safeImageUrl,
        galleryUrls: safeGalleryUrls,
        technicalDocUrl: prod.technicalDocUrl || null,
        featured: prod.featured || false,
        status: prod.status || 'Active',
        views: prod.views || 0,
        rating: 4.9,
        reviewCount: 8,
        variationsJson: JSON.stringify(variations),
      },
    });
  }

  // 3. Seed Promotional Coupons
  console.log('Seeding coupons...');
  const initialCoupons = [
    {
      code: 'LUXURY10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 50,
      maxDiscount: 100,
      usageLimit: 500,
      active: true,
    },
    {
      code: 'WELCOME15',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 75,
      maxDiscount: 150,
      usageLimit: 300,
      active: true,
    },
    {
      code: 'AROMA25',
      discountType: 'fixed',
      discountValue: 25,
      minOrderAmount: 120,
      usageLimit: 200,
      active: true,
    },
  ];

  for (const coupon of initialCoupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
  }

  // 4. Secure Admin Account
  const adminEmail = (process.env.ADMIN_SEED_EMAIL || 'farhanahmad031205@gmail.com').trim().toLowerCase();
  console.log(`Setting up Super Admin for: ${adminEmail}`);

  const defaultAdminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@Flavour2026!';
  const hashedPassword = await hash(defaultAdminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'Super Admin',
      name: 'Executive Super Admin',
      passwordHash: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: 'Executive Super Admin',
      role: 'Super Admin',
      passwordHash: hashedPassword,
    },
  });

  // 5. Seed Initial Reviews for signature products
  console.log('Seeding verified customer reviews...');
  const firstProduct = await prisma.product.findFirst({ where: { featured: true } });
  if (firstProduct) {
    const existingReview = await prisma.review.findFirst({ where: { productId: firstProduct.id } });
    if (!existingReview) {
      await prisma.review.create({
        data: {
          productId: firstProduct.id,
          customerName: 'Aurelia D.',
          rating: 5,
          title: 'Unrivaled olfactory depth and longevity',
          comment:
            'The sillage and raw ingredient purity exceed niche perfume houses. The formulation maintains remarkable stability and complexity over 12 hours.',
          verifiedPurchase: true,
          approved: true,
        },
      });
      await prisma.review.create({
        data: {
          productId: firstProduct.id,
          customerName: 'Marcus V.',
          rating: 5,
          title: 'Exceptional extraction quality',
          comment:
            'Clean natural notes without any synthetic harshness. We tested this in both cold diffusion and fine mist with magnificent results.',
          verifiedPurchase: true,
          approved: true,
        },
      });
    }
  }

  console.log('--- Database Seed & Sync Completed Successfully ---');
}

// Allow standalone execution
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  seedDatabase()
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
