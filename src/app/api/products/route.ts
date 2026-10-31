import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin, createAuditLog } from '@/src/lib/auth-utils';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  sku: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(200),
  categoryId: z.string().optional().nullable(),
  category: z.string().trim().min(1),
  subcategory: z.string().default(''),
  productType: z.string().default('Fragrance'),
  parentGroup: z.enum(['Flavours', 'Fragrances']).default('Fragrances'),
  shortDescription: z.string().trim().min(5),
  fullDescription: z.string().trim().min(10),
  applications: z.string().default(''),
  ingredientsNotes: z.string().default(''),
  casNumber: z.string().optional().nullable(),
  tasteProfile: z.string().optional().nullable(),
  olfactoryProfile: z.string().optional().nullable(),
  solubility: z.string().optional().nullable(),
  heatStability: z.string().optional().nullable(),
  minimumOrderQuantity: z.string().default('1 Unit'),
  price: z.number().positive(),
  salePrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(100),
  lowStockThreshold: z.number().int().min(0).default(15),
  imageUrl: z.string().min(1),
  galleryUrls: z.string().default(''),
  technicalDocUrl: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  status: z.enum(['Active', 'Draft', 'Archived']).default('Active'),
  variationsJson: z.string().default('[]'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const parentGroup = searchParams.get('parentGroup')?.trim();
    const category = searchParams.get('category')?.trim();
    const productType = searchParams.get('productType')?.trim();
    const featured = searchParams.get('featured');
    const status = searchParams.get('status') || 'Active';
    const sortBy = searchParams.get('sortBy') || 'featured';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status !== 'All') {
      where.status = status;
    }

    if (parentGroup && parentGroup !== 'All') {
      where.parentGroup = parentGroup;
    }

    if (category && category !== 'All') {
      where.category = { equals: category };
    }

    if (productType && productType !== 'All') {
      where.productType = productType;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { shortDescription: { contains: search } },
        { fullDescription: { contains: search } },
        { category: { contains: search } },
        { subcategory: { contains: search } },
        { ingredientsNotes: { contains: search } },
      ];
    }

    let orderBy: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[] = { views: 'desc' };
    if (sortBy === 'featured') {
      orderBy = [{ featured: 'desc' }, { views: 'desc' }];
    } else if (sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'name') {
      orderBy = { name: 'asc' };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          categoryRef: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const json = await request.json();
    const parsed = productSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', issues: parsed.error.issues }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: parsed.data,
    });

    await createAuditLog({
      adminEmail: authCheck.user.email || 'Admin',
      action: 'PRODUCT_CREATE',
      resource: 'Product',
      resourceId: product.id,
      details: { sku: product.sku, name: product.name, price: product.price },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A product with this SKU or Slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

