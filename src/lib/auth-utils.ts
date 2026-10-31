import { auth } from '@/auth';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAdmin(allowedRoles: string[] = ['Super Admin', 'Admin', 'Staff']) {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false, status: 401, error: 'Authentication required' };
  }

  const role = session.user.role || (session.user.isAdmin ? 'Admin' : 'Customer');

  if (!allowedRoles.includes(role)) {
    return { authorized: false, status: 403, error: 'Forbidden: Insufficient administrative privileges' };
  }

  return { authorized: true, user: session.user, role };
}

export async function createAuditLog(params: {
  adminEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        adminEmail: params.adminEmail,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId || null,
        detailsJson: JSON.stringify(params.details || {}),
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

