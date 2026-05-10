import { z } from "zod";
import { router } from "../_core/trpc";
import { adminProcedure, superAdminProcedure, createPermissionProcedure, PERMISSIONS } from "../rbac";
import {
  getUsersWithFilters,
  getKycDocumentsByUserId,
  getPendingKycDocuments,
  getSosIncidentsWithFilters,
  getAuditLogsByAdminId,
  getAnalyticsMetrics,
  getPendingUserAppeals,
  logAuditEvent,
  getDb,
} from "../db";
import { users, kycDocuments, sosIncidents, userAppeals } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const adminRouter = router({
  /**
   * User Management
   */
  users: router({
    list: createPermissionProcedure(PERMISSIONS.VIEW_USERS).input(
      z.object({
        search: z.string().optional(),
        verificationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
        isBanned: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    ).query(async ({ input }) => {
      return await getUsersWithFilters(input);
    }),

    detail: createPermissionProcedure(PERMISSIONS.VIEW_USERS).input(
      z.object({ userId: z.number() })
    ).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    }),

    ban: createPermissionProcedure(PERMISSIONS.BAN_USERS).input(
      z.object({
        userId: z.number(),
        reason: z.string().min(10),
        expiresAt: z.date().optional(),
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const expiresAt = input.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

      await db
        .update(users)
        .set({
          isBanned: true,
          banReason: input.reason,
          banExpiresAt: expiresAt,
        })
        .where(eq(users.id, input.userId));

      // Log audit event
      await logAuditEvent(
        ctx.adminUser.id,
        "BAN_USER",
        "users",
        String(input.userId),
        { reason: input.reason, expiresAt }
      );

      return { success: true };
    }),

    unban: createPermissionProcedure(PERMISSIONS.BAN_USERS).input(
      z.object({ userId: z.number() })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(users)
        .set({
          isBanned: false,
          banReason: null,
          banExpiresAt: null,
        })
        .where(eq(users.id, input.userId));

      // Log audit event
      await logAuditEvent(
        ctx.adminUser.id,
        "UNBAN_USER",
        "users",
        String(input.userId),
        {}
      );

      return { success: true };
    }),

    updateTrustScore: createPermissionProcedure(PERMISSIONS.MANAGE_USERS).input(
      z.object({
        userId: z.number(),
        trustScore: z.number().min(0).max(100),
        reason: z.string().optional(),
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(users)
        .set({ trustScore: String(input.trustScore) as any })
        .where(eq(users.id, input.userId));

      // Log audit event
      await logAuditEvent(
        ctx.adminUser.id,
        "UPDATE_TRUST_SCORE",
        "users",
        String(input.userId),
        { trustScore: input.trustScore, reason: input.reason }
      );

      return { success: true };
    }),
  }),

  /**
   * KYC Verification
   */
  kyc: router({
    pendingDocuments: createPermissionProcedure(PERMISSIONS.VERIFY_KYC).input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    ).query(async ({ input }) => {
      return await getPendingKycDocuments(input.limit, input.offset);
    }),

    userDocuments: createPermissionProcedure(PERMISSIONS.VERIFY_KYC).input(
      z.object({ userId: z.number() })
    ).query(async ({ input }) => {
      return await getKycDocumentsByUserId(input.userId);
    }),

    approveDocument: createPermissionProcedure(PERMISSIONS.VERIFY_KYC).input(
      z.object({
        documentId: z.number(),
        notes: z.string().optional(),
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(kycDocuments)
        .set({
          verificationStatus: "approved",
          verifiedBy: ctx.adminUser.id,
          verificationNotes: input.notes,
          verifiedAt: new Date(),
        })
        .where(eq(kycDocuments.id, input.documentId));

      // Log audit event
      await logAuditEvent(
        ctx.adminUser.id,
        "APPROVE_KYC",
        "kyc_documents",
        String(input.documentId),
        { notes: input.notes }
      );

      return { success: true };
    }),

    rejectDocument: createPermissionProcedure(PERMISSIONS.VERIFY_KYC).input(
      z.object({
        documentId: z.number(),
        reason: z.string().min(10),
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(kycDocuments)
        .set({
          verificationStatus: "rejected",
          verifiedBy: ctx.adminUser.id,
          verificationNotes: input.reason,
          verifiedAt: new Date(),
        })
        .where(eq(kycDocuments.id, input.documentId));

      // Log audit event
      await logAuditEvent(
        ctx.adminUser.id,
        "REJECT_KYC",
        "kyc_documents",
        String(input.documentId),
        { reason: input.reason }
      );

      return { success: true };
    }),
  }),

  /**
   * Security & Incidents
   */
  security: router({
    incidents: createPermissionProcedure(PERMISSIONS.VIEW_SECURITY).input(
      z.object({
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        status: z.enum(["reported", "acknowledged", "investigating", "resolved"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    ).query(async ({ input }) => {
      return await getSosIncidentsWithFilters(input);
    }),

    resolveIncident: createPermissionProcedure(PERMISSIONS.RESOLVE_INCIDENTS).input(
      z.object({
        incidentId: z.number(),
        resolution: z.string().min(20),
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(sosIncidents)
        .set({
          status: "resolved",
          resolvedBy: ctx.adminUser.id,
          resolutionNotes: input.resolution,
          resolvedAt: new Date(),
        })
        .where(eq(sosIncidents.id, input.incidentId));

      // Log audit event
      await logAuditEvent(
        ctx.adminUser.id,
        "RESOLVE_INCIDENT",
        "sos_incidents",
        String(input.incidentId),
        { resolution: input.resolution }
      );

      return { success: true };
    }),
  }),

  /**
   * Appeals Management
   */
  appeals: router({
    pending: createPermissionProcedure(PERMISSIONS.MANAGE_APPEALS).input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    ).query(async ({ input }) => {
      return await getPendingUserAppeals(input.limit, input.offset);
    }),

    approve: createPermissionProcedure(PERMISSIONS.MANAGE_APPEALS).input(
      z.object({
        appealId: z.number(),
        notes: z.string().optional(),
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(userAppeals)
        .set({
          status: "approved",
          reviewedBy: ctx.adminUser.id,
          reviewNotes: input.notes,
          reviewedAt: new Date(),
        })
        .where(eq(userAppeals.id, input.appealId));

      // Log audit event
      await logAuditEvent(
        ctx.adminUser.id,
        "APPROVE_APPEAL",
        "user_appeals",
        String(input.appealId),
        { notes: input.notes }
      );

      return { success: true };
    }),

    reject: createPermissionProcedure(PERMISSIONS.MANAGE_APPEALS).input(
      z.object({
        appealId: z.number(),
        reason: z.string().min(20),
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(userAppeals)
        .set({
          status: "rejected",
          reviewedBy: ctx.adminUser.id,
          reviewNotes: input.reason,
          reviewedAt: new Date(),
        })
        .where(eq(userAppeals.id, input.appealId));

      // Log audit event
      await logAuditEvent(
        ctx.adminUser.id,
        "REJECT_APPEAL",
        "user_appeals",
        String(input.appealId),
        { reason: input.reason }
      );

      return { success: true };
    }),
  }),

  /**
   * Analytics
   */
  analytics: router({
    metrics: createPermissionProcedure(PERMISSIONS.VIEW_ANALYTICS).input(
      z.object({
        metricType: z.string(),
        hoursBack: z.number().min(1).max(720).default(24),
      })
    ).query(async ({ input }) => {
      return await getAnalyticsMetrics(input.metricType, input.hoursBack);
    }),
  }),

  /**
   * Audit Logs
   */
  auditLogs: createPermissionProcedure(PERMISSIONS.VIEW_AUDIT_LOGS).input(
    z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    })
  ).query(async ({ input, ctx }) => {
    return await getAuditLogsByAdminId(ctx.adminUser.id, input.limit, input.offset);
  }),
});
