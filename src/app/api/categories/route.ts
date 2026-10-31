import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin, createAuditLog } from '@/src/lib/auth-utils';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100),
  parentGroup: z.enum(['Flavours', 'Fragrances']),
  description: z.string().default(''),
  imageUrl: z.string().default(''),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentGroup = searchParams.get('parentGroup');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: Record<string, unknown> = {};
    if (!includeInactive) where.active = true;
    if (parentGroup && parentGroup !== 'All') where.parentGroup = parentGroup;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to retrieve categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', issues: parsed.error.issues }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: parsed.data,
    });

    await createAuditLog({
      adminEmail: authCheck.user.email || 'Admin',
      action: 'CATEGORY_CREATE',
      resource: 'Category',
      resourceId: category.id,
      details: { name: category.name, parentGroup: category.parentGroup },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name or slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

