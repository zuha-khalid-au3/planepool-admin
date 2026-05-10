import { eq, and, like, desc, asc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  adminUsers,
  kycDocuments,
  flights,
  rideGroups,
  cmsContent,
  b2bPartners,
  sosIncidents,
  auditLogs,
  notifications,
  analyticsMetrics,
  userAppeals,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Admin-specific queries
export async function getAdminByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUsersWithFilters(
  filters: {
    search?: string;
    verificationStatus?: string;
    isBanned?: boolean;
    limit?: number;
    offset?: number;
  } = {}
) {
  const db = await getDb();
  if (!db) return [];

  const { search, verificationStatus, isBanned, limit = 50, offset = 0 } = filters;
  const conditions = [];

  if (search) {
    conditions.push(
      like(users.name, `%${search}%`)
    );
  }
  if (verificationStatus) {
    conditions.push(eq(users.verificationStatus, verificationStatus as any));
  }
  if (isBanned !== undefined) {
    conditions.push(eq(users.isBanned, isBanned));
  }

  const query = db.select().from(users);
  const withConditions = conditions.length > 0 ? query.where(and(...conditions)) : query;

  return await withConditions
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getKycDocumentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(kycDocuments)
    .where(eq(kycDocuments.userId, userId));
}

export async function getPendingKycDocuments(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(kycDocuments)
    .where(eq(kycDocuments.verificationStatus, "pending"))
    .orderBy(asc(kycDocuments.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getActiveFlights() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(flights)
    .where(
      and(
        eq(flights.status, "in_flight"),
        eq(flights.status, "landed")
      )
    );
}

export async function getRideGroupsByFlightId(flightId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(rideGroups)
    .where(eq(rideGroups.flightId, flightId));
}

export async function getCmsContentByType(contentType: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(cmsContent)
    .where(
      and(
        eq(cmsContent.contentType, contentType as any),
        eq(cmsContent.isActive, true)
      )
    )
    .orderBy(asc(cmsContent.displayOrder));
}

export async function getB2bPartnersByType(partnerType: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(b2bPartners)
    .where(
      and(
        eq(b2bPartners.partnerType, partnerType as any),
        eq(b2bPartners.status, "active")
      )
    );
}

export async function getSosIncidentsWithFilters(
  filters: {
    severity?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const db = await getDb();
  if (!db) return [];

  const { severity, status, limit = 50, offset = 0 } = filters;
  const conditions = [];

  if (severity) {
    conditions.push(eq(sosIncidents.severity, severity as any));
  }
  if (status) {
    conditions.push(eq(sosIncidents.status, status as any));
  }

  const query = db.select().from(sosIncidents);
  const withConditions = conditions.length > 0 ? query.where(and(...conditions)) : query;

  return await withConditions
    .orderBy(desc(sosIncidents.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAuditLogsByAdminId(
  adminId: number,
  limit = 100,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.adminId, adminId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAnalyticsMetrics(
  metricType: string,
  hoursBack = 24
) {
  const db = await getDb();
  if (!db) return [];

  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  return await db
    .select()
    .from(analyticsMetrics)
    .where(
      and(
        eq(analyticsMetrics.metricType, metricType as any),
        gte(analyticsMetrics.recordedAt, cutoffTime)
      )
    )
    .orderBy(desc(analyticsMetrics.recordedAt));
}

export async function getPendingUserAppeals(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userAppeals)
    .where(eq(userAppeals.status, "under_review"))
    .orderBy(asc(userAppeals.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function logAuditEvent(
  adminId: number,
  action: string,
  resourceType: string,
  resourceId: string | null,
  changes: Record<string, any>,
  ipAddress?: string,
  userAgent?: string,
  status: "success" | "failure" = "success",
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(auditLogs).values({
      adminId,
      action,
      resourceType,
      resourceId,
      changes,
      ipAddress,
      userAgent,
      status,
      errorMessage,
    });
  } catch (error) {
    console.error("[Database] Failed to log audit event:", error);
  }
}
