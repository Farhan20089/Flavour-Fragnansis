import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { auth } from '@/auth';
import { requireAdmin, createAuditLog } from '@/src/lib/auth-utils';
import { z } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

const updateOrderSchema = z.object({
  orderStatus: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).optional(),
  paymentStatus: z.enum(['Pending', 'Paid', 'Failed']).optional(),
  trackingNumber: z.string().optional().nullable(),
  shippingCarrier: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const session = await auth();

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isAdmin =
      session?.user?.isAdmin ||
      ['Super Admin', 'Admin', 'Staff'].includes(session?.user?.role as string);

    // If not admin, verify ownership or allow lookup by exact orderNumber (guest tracking)
    if (!isAdmin && session?.user?.email) {
      if (order.customerEmail.toLowerCase() !== session.user.email.toLowerCase()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to retrieve order' }, { status: 500 });
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
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update payload', issues: parsed.error.issues }, { status: 400 });
    }

    const existing = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If cancelling an order, restock products
    if (parsed.data.orderStatus === 'Cancelled' && existing.orderStatus !== 'Cancelled') {
      await prisma.$transaction(async (tx) => {
        for (const item of existing.items) {
          if (item.productId) {
            const prod = await tx.product.findUnique({ where: { id: item.productId } });
            if (prod) {
              const newStock = prod.stockQuantity + item.quantity;
              await tx.product.update({
                where: { id: item.productId },
                data: { stockQuantity: newStock },
              });
              await tx.inventoryLog.create({
                data: {
                  productId: item.productId,
                  changeAmount: item.quantity,
                  previousStock: prod.stockQuantity,
                  newStock,
                  reason: 'Return',
                  referenceId: existing.orderNumber,
                  performedBy: authCheck.user.email || 'Admin',
                },
              });
            }
          }
        }
      });
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: parsed.data,
      include: { items: true, payment: true },
    });

    await createAuditLog({
      adminEmail: authCheck.user.email || 'Admin',
      action: 'ORDER_UPDATE',
      resource: 'Order',
      resourceId: existing.orderNumber,
      details: parsed.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

