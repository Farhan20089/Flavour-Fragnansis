import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin, createAuditLog } from '@/src/lib/auth-utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }, { sku: id }],
      },
      include: {
        categoryRef: true,
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } },
    });

    // Related products in the same category or parentGroup
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        parentGroup: product.parentGroup,
        status: 'Active',
      },
      take: 4,
      orderBy: { views: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: product,
      related: relatedProducts,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to retrieve product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if stock changed to create inventory log
    if (body.stockQuantity !== undefined && body.stockQuantity !== existing.stockQuantity) {
      const change = body.stockQuantity - existing.stockQuantity;
      await prisma.inventoryLog.create({
        data: {
          productId: existing.id,
          changeAmount: change,
          previousStock: existing.stockQuantity,
          newStock: body.stockQuantity,
          reason: change > 0 ? 'Restock' : 'Adjustment',
          performedBy: authCheck.user.email || 'Admin',
        },
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: body,
    });

    await createAuditLog({
      adminEmail: authCheck.user.email || 'Admin',
      action: 'PRODUCT_UPDATE',
      resource: 'Product',
      resourceId: updated.id,
      details: { changes: Object.keys(body) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const authCheck = await requireAdmin(['Super Admin', 'Admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Soft delete / archive for data integrity
    const archived = await prisma.product.update({
      where: { id },
      data: { status: 'Archived' },
    });

    await createAuditLog({
      adminEmail: authCheck.user.email || 'Admin',
      action: 'PRODUCT_ARCHIVE',
      resource: 'Product',
      resourceId: id,
      details: { sku: existing.sku, name: existing.name },
    });

    return NextResponse.json({ success: true, message: 'Product archived successfully', data: archived });
  } catch (error) {
    console.error('Error archiving product:', error);
    return NextResponse.json({ error: 'Failed to archive product' }, { status: 500 });
  }
}

