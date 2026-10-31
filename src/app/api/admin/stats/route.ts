import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth-utils';

export async function GET() {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const [
      orders,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrdersCount,
      lowStockProducts,
      recentOrders,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { orderStatus: { not: 'Cancelled' } },
        select: { totalAmount: true },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'Customer' } }),
      prisma.product.count({ where: { status: 'Active' } }),
      prisma.order.count({ where: { orderStatus: { in: ['Pending', 'Processing'] } } }),
      prisma.product.findMany({
        where: {
          stockQuantity: { lte: 15 },
          status: 'Active',
        },
        select: {
          id: true,
          sku: true,
          name: true,
          parentGroup: true,
          stockQuantity: true,
          lowStockThreshold: true,
        },
        take: 10,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          items: true,
          payment: true,
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalRevenue = Number(orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrdersCount,
        lowStockProducts,
        recentOrders,
        recentAuditLogs,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to retrieve administrative analytics' }, { status: 500 });
  }
}

