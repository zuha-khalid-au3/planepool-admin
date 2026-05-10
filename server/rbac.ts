import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./_core/trpc";
import { getAdminByUserId } from "./db";

/**
 * Permission definitions for the admin panel
 */
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: "view_users",
  MANAGE_USERS: "manage_users",
  BAN_USERS: "ban_users",
  VERIFY_KYC: "verify_kyc",

  // CMS Management
  MANAGE_CMS: "manage_cms",
  PUBLISH_CONTENT: "publish_content",

  // B2B Partners
  MANAGE_PARTNERS: "manage_partners",
  MANAGE_REVENUE: "manage_revenue",

  // Security
  VIEW_SECURITY: "view_security",
  MANAGE_SECURITY: "manage_security",
  RESOLVE_INCIDENTS: "resolve_incidents",

  // Analytics
  VIEW_ANALYTICS: "view_analytics",
  EXPORT_ANALYTICS: "export_analytics",

  // Notifications
  SEND_NOTIFICATIONS: "send_notifications",
  MANAGE_TEMPLATES: "manage_templates",

  // Audit & Compliance
  VIEW_AUDIT_LOGS: "view_audit_logs",
  MANAGE_APPEALS: "manage_appeals",

  // System
  MANAGE_ADMINS: "manage_admins",
  SYSTEM_CONFIG: "system_config",
} as const;

/**
 * Default permission sets for different admin roles
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VERIFY_KYC,
    PERMISSIONS.MANAGE_CMS,
    PERMISSIONS.VIEW_SECURITY,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_APPEALS,
  ],
  super_admin: Object.values(PERMISSIONS),
};

/**
 * Procedure that requires admin authentication
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin" && ctx.user?.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  const adminUser = await getAdminByUserId(ctx.user.id);
  if (!adminUser) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin profile not found",
    });
  }

  return next({
    ctx: {
      ...ctx,
      adminUser,
    },
  });
});

/**
 * Procedure that requires super-admin authentication
 */
export const superAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Super admin access required",
    });
  }

  const adminUser = await getAdminByUserId(ctx.user.id);
  if (!adminUser || adminUser.superAdminRole !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Super admin profile not found",
    });
  }

  return next({
    ctx: {
      ...ctx,
      adminUser,
    },
  });
});

/**
 * Check if admin has a specific permission
 */
export function hasPermission(
  adminRole: "admin" | "super_admin",
  customPermissions: string[] | null,
  requiredPermission: string
): boolean {
  // Super admins have all permissions
  if (adminRole === "super_admin") {
    return true;
  }

  // Check custom permissions if provided
  if (customPermissions && customPermissions.length > 0) {
    return customPermissions.includes(requiredPermission);
  }

  // Fall back to role-based permissions
  const rolePerms = ROLE_PERMISSIONS[adminRole] || [];
  return rolePerms.includes(requiredPermission);
}

/**
 * Create a permission-checked procedure
 */
export function createPermissionProcedure(permission: string) {
  return adminProcedure.use(async ({ ctx, next }) => {
    const hasAccess = hasPermission(
      ctx.adminUser.superAdminRole as "admin" | "super_admin",
      ctx.adminUser.permissions as string[] | null,
      permission
    );

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permission required: ${permission}`,
      });
    }

    return next({ ctx });
  });
}
