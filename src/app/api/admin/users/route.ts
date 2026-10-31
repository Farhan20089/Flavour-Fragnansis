import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin, createAuditLog } from '@/src/lib/auth-utils';
import { z } from 'zod';

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['Super Admin', 'Admin', 'Staff', 'Customer']),
});

export async function GET() {
  const authCheck = await requireAdmin(['Super Admin', 'Admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      orderCount: u._count.orders,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Failed to retrieve users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  // Only Super Admin can change roles
  const authCheck = await requireAdmin(['Super Admin']);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: 'Only Super Administrators can modify user roles.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid user or role provided' }, { status: 400 });
    }

    const { userId, role } = parsed.data;

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await createAuditLog({
      adminEmail: authCheck.user.email || 'Admin',
      action: 'UPDATE_USER_ROLE',
      resource: 'User',
      resourceId: userId,
      details: { previousRole: targetUser.role, newRole: role, targetEmail: targetUser.email },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

