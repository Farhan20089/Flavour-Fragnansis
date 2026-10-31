import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { z } from 'zod';

const applySchema = z.object({
  code: z.string().trim().min(1).toUpperCase(),
  subtotal: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please enter a valid coupon code and subtotal' }, { status: 400 });
    }

    const { code, subtotal } = parsed.data;

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: 'Invalid or inactive promotional code.' }, { status: 404 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This promotional code has expired.' }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return NextResponse.json({ error: 'This coupon has reached its maximum redemption limit.' }, { status: 400 });
    }

    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required for this coupon.`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Number(discountAmount.toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        newSubtotal: Number((subtotal - discountAmount).toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    return NextResponse.json({ error: 'Failed to apply coupon' }, { status: 500 });
  }
}

