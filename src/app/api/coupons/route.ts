import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin, createAuditLog } from '@/src/lib/auth-utils';
import { z } from 'zod';

const couponSchema = z.object({
  code: z.string().trim().min(3).max(30).toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  active: z.boolean().default(true),
  expiresAt: z.string().optional().nullable(),
});

export async function GET() {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to retrieve coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin(['Super Admin', 'Admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', issues: parsed.error.issues }, { status: 400 });
    }

    const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, active, expiresAt } =
      parsed.data;

    const coupon = await prisma.coupon.upsert({
      where: { code },
      update: {
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        active,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      create: {
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        active,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await createAuditLog({
      adminEmail: authCheck.user.email || 'Admin',
      action: 'COUPON_UPSERT',
      resource: 'Coupon',
      resourceId: coupon.code,
      details: { discountType, discountValue },
    });

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error) {
    console.error('Error saving coupon:', error);
    return NextResponse.json({ error: 'Failed to save coupon' }, { status: 500 });
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
      return NextResponse.json({ error: 'Coupon ID or code required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findFirst({
      where: { OR: [{ id }, { code: id.toUpperCase() }] },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id: coupon.id } });

    await createAuditLog({
      adminEmail: authCheck.user.email || 'Admin',
      action: 'COUPON_DELETE',
      resource: 'Coupon',
      resourceId: coupon.code,
    });

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
