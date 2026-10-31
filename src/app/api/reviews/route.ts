import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { auth } from '@/auth';
import { requireAdmin, createAuditLog } from '@/src/lib/auth-utils';
import { z } from 'zod';

const createReviewSchema = z.object({
  productId: z.string(),
  customerName: z.string().trim().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).default(''),
  comment: z.string().trim().min(5).max(2000),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const all = searchParams.get('all') === 'true';

    const where: Record<string, unknown> = {};
    if (!all) {
      where.approved = true;
    }
    if (productId) {
      where.productId = productId;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        product: {
          select: { name: true, sku: true, imageUrl: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to retrieve reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid review data', issues: parsed.error.issues }, { status: 400 });
    }

    const { productId, customerName, rating, title, comment } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session?.user?.id || null,
        customerName,
        rating,
        title,
        comment,
        verifiedPurchase: Boolean(session?.user?.id),
        approved: true, // auto-approve verified
      },
    });

    // Recalculate average rating for product
    const allReviews = await prisma.review.findMany({
      where: { productId, approved: true },
      select: { rating: true },
    });

    const avg = allReviews.length > 0
      ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1))
      : rating;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avg,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authCheck = await requireAdmin(['Super Admin', 'Admin', 'Staff']);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { id, approved } = body;
    if (!id || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'Review ID and approved status required' }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { approved },
    });

    // Recalculate product rating
    const allApproved = await prisma.review.findMany({
      where: { productId: updated.productId, approved: true },
      select: { rating: true },
    });

    const newAvg = allApproved.length > 0
      ? Number((allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length).toFixed(1))
      : 5.0;

    await prisma.product.update({
      where: { id: updated.productId },
      data: { rating: newAvg, reviewCount: allApproved.length },
    });

    await createAuditLog({
      adminEmail: authCheck.user.email || 'Admin',
      action: approved ? 'APPROVE_REVIEW' : 'UNAPPROVE_REVIEW',
      resource: 'Review',
      resourceId: id,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authCheck = await requireAdmin(['Super Admin', 'Admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await prisma.review.delete({ where: { id } });

    // Recalculate product rating
    const allApproved = await prisma.review.findMany({
      where: { productId: review.productId, approved: true },
      select: { rating: true },
    });

    const newAvg = allApproved.length > 0
      ? Number((allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length).toFixed(1))
      : 5.0;

    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: newAvg, reviewCount: allApproved.length },
    });

    await createAuditLog({
      adminEmail: authCheck.user.email || 'Admin',
      action: 'DELETE_REVIEW',
      resource: 'Review',
      resourceId: id,
    });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
