import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  longtext,
  index,
  datetime,
} from "drizzle-orm/mysql-core";

// Users table
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).unique(),
    phone: varchar("phone", { length: 20 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin", "super_admin"]).default("user").notNull(),
    idVerified: boolean("idVerified").default(false),
    selfieVerified: boolean("selfieVerified").default(false),
    flightTicketVerified: boolean("flightTicketVerified").default(false),
    verificationStatus: mysqlEnum("verificationStatus", ["pending", "approved", "rejected"]).default("pending"),
    trustScore: decimal("trustScore", { precision: 5, scale: 2 }).default("100.00"),
    isBanned: boolean("isBanned").default(false),
    banReason: text("banReason"),
    banExpiresAt: timestamp("banExpiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    roleIdx: index("role_idx").on(table.role),
    verificationIdx: index("verification_idx").on(table.verificationStatus),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Admin users table
export const adminUsers = mysqlTable(
  "admin_users",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    superAdminRole: mysqlEnum("superAdminRole", ["super_admin", "admin"]).default("admin"),
    permissions: json("permissions"),
    department: varchar("department", { length: 100 }),
    managedRegions: json("managedRegions"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("admin_user_id_idx").on(table.userId),
  })
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

// KYC documents table
export const kycDocuments = mysqlTable(
  "kyc_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    documentType: mysqlEnum("documentType", ["government_id", "selfie", "flight_ticket"]).notNull(),
    fileKey: varchar("fileKey", { length: 255 }).notNull(),
    fileUrl: text("fileUrl"),
    mimeType: varchar("mimeType", { length: 50 }),
    verificationStatus: mysqlEnum("verificationStatus", ["pending", "approved", "rejected"]).default("pending"),
    verifiedBy: int("verifiedBy").references(() => adminUsers.id),
    verificationNotes: text("verificationNotes"),
    verifiedAt: timestamp("verifiedAt"),
    expiresAt: timestamp("expiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("kyc_user_id_idx").on(table.userId),
    documentTypeIdx: index("kyc_doc_type_idx").on(table.documentType),
    verificationIdx: index("kyc_verification_idx").on(table.verificationStatus),
  })
);

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = typeof kycDocuments.$inferInsert;

// Flights table
export const flights = mysqlTable(
  "flights",
  {
    id: int("id").autoincrement().primaryKey(),
    flightNumber: varchar("flightNumber", { length: 10 }).notNull(),
    airline: varchar("airline", { length: 100 }).notNull(),
    originAirport: varchar("originAirport", { length: 10 }).notNull(),
    destinationAirport: varchar("destinationAirport", { length: 10 }).notNull(),
    scheduledDeparture: datetime("scheduledDeparture").notNull(),
    scheduledArrival: datetime("scheduledArrival").notNull(),
    actualArrival: datetime("actualArrival"),
    status: mysqlEnum("status", ["scheduled", "in_flight", "landed", "cancelled"]).default("scheduled"),
    totalPassengers: int("totalPassengers"),
    activeRideGroups: int("activeRideGroups").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    flightNumberIdx: index("flight_number_idx").on(table.flightNumber),
    destinationIdx: index("destination_airport_idx").on(table.destinationAirport),
    statusIdx: index("flight_status_idx").on(table.status),
  })
);

export type Flight = typeof flights.$inferSelect;
export type InsertFlight = typeof flights.$inferInsert;

// Ride groups table
export const rideGroups = mysqlTable(
  "ride_groups",
  {
    id: int("id").autoincrement().primaryKey(),
    flightId: int("flightId").notNull().references(() => flights.id),
    destination: varchar("destination", { length: 255 }).notNull(),
    organizerId: int("organizerId").notNull().references(() => users.id),
    status: mysqlEnum("status", ["forming", "confirmed", "in_progress", "completed", "cancelled"]).default("forming"),
    memberCount: int("memberCount").default(1),
    estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }),
    actualCost: decimal("actualCost", { precision: 10, scale: 2 }),
    meetingPoint: varchar("meetingPoint", { length: 255 }),
    departureTime: datetime("departureTime"),
    completedAt: datetime("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    flightIdIdx: index("ride_flight_id_idx").on(table.flightId),
    destinationIdx: index("ride_destination_idx").on(table.destination),
    statusIdx: index("ride_status_idx").on(table.status),
  })
);

export type RideGroup = typeof rideGroups.$inferSelect;
export type InsertRideGroup = typeof rideGroups.$inferInsert;

// CMS content table
export const cmsContent = mysqlTable(
  "cms_content",
  {
    id: int("id").autoincrement().primaryKey(),
    contentType: mysqlEnum("contentType", ["destination", "onboarding_copy", "faq", "push_template", "banner"]).notNull(),
    key: varchar("key", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }),
    content: longtext("content"),
    metadata: json("metadata"),
    isActive: boolean("isActive").default(true),
    displayOrder: int("displayOrder").default(0),
    createdBy: int("createdBy").references(() => adminUsers.id),
    updatedBy: int("updatedBy").references(() => adminUsers.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    contentTypeIdx: index("cms_type_idx").on(table.contentType),
    keyIdx: index("cms_key_idx").on(table.key),
    activeIdx: index("cms_active_idx").on(table.isActive),
  })
);

export type CmsContent = typeof cmsContent.$inferSelect;
export type InsertCmsContent = typeof cmsContent.$inferInsert;

// B2B partners table
export const b2bPartners = mysqlTable(
  "b2b_partners",
  {
    id: int("id").autoincrement().primaryKey(),
    partnerType: mysqlEnum("partnerType", ["airport_authority", "airline", "hotel", "transport_provider", "other"]).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    contactPerson: varchar("contactPerson", { length: 255 }),
    website: varchar("website", { length: 255 }),
    status: mysqlEnum("status", ["active", "inactive", "pending", "suspended"]).default("pending"),
    revenueSharePercentage: decimal("revenueSharePercentage", { precision: 5, scale: 2 }).default("0.00"),
    contractStartDate: datetime("contractStartDate"),
    contractEndDate: datetime("contractEndDate"),
    metadata: json("metadata"),
    createdBy: int("createdBy").references(() => adminUsers.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    partnerTypeIdx: index("partner_type_idx").on(table.partnerType),
    statusIdx: index("partner_status_idx").on(table.status),
    emailIdx: index("partner_email_idx").on(table.email),
  })
);

export type B2bPartner = typeof b2bPartners.$inferSelect;
export type InsertB2bPartner = typeof b2bPartners.$inferInsert;

// SOS incidents table
export const sosIncidents = mysqlTable(
  "sos_incidents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    rideGroupId: int("rideGroupId").references(() => rideGroups.id),
    incidentType: mysqlEnum("incidentType", ["emergency", "harassment", "unsafe_driver", "accident", "other"]).notNull(),
    description: text("description"),
    location: varchar("location", { length: 255 }),
    status: mysqlEnum("status", ["reported", "acknowledged", "investigating", "resolved"]).default("reported"),
    severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
    resolvedBy: int("resolvedBy").references(() => adminUsers.id),
    resolutionNotes: text("resolutionNotes"),
    resolvedAt: timestamp("resolvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("sos_user_id_idx").on(table.userId),
    statusIdx: index("sos_status_idx").on(table.status),
    severityIdx: index("sos_severity_idx").on(table.severity),
  })
);

export type SosIncident = typeof sosIncidents.$inferSelect;
export type InsertSosIncident = typeof sosIncidents.$inferInsert;

// Audit logs table
export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    adminId: int("adminId").notNull().references(() => adminUsers.id),
    action: varchar("action", { length: 100 }).notNull(),
    resourceType: varchar("resourceType", { length: 50 }).notNull(),
    resourceId: varchar("resourceId", { length: 255 }),
    changes: json("changes"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    status: mysqlEnum("status", ["success", "failure"]).default("success"),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    adminIdIdx: index("audit_admin_id_idx").on(table.adminId),
    actionIdx: index("audit_action_idx").on(table.action),
    resourceTypeIdx: index("audit_resource_type_idx").on(table.resourceType),
    createdAtIdx: index("audit_created_at_idx").on(table.createdAt),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// Notifications table
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    notificationType: mysqlEnum("notificationType", ["push", "in_app", "email"]).default("push"),
    targetSegment: mysqlEnum("targetSegment", ["all_users", "flight_specific", "destination_based", "verified_users", "custom"]).default("all_users"),
    targetData: json("targetData"),
    status: mysqlEnum("status", ["draft", "scheduled", "sent", "cancelled"]).default("draft"),
    scheduledAt: datetime("scheduledAt"),
    sentAt: datetime("sentAt"),
    deliveredCount: int("deliveredCount").default(0),
    failedCount: int("failedCount").default(0),
    createdBy: int("createdBy").references(() => adminUsers.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    statusIdx: index("notification_status_idx").on(table.status),
    scheduledAtIdx: index("notification_scheduled_idx").on(table.scheduledAt),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Analytics metrics table
export const analyticsMetrics = mysqlTable(
  "analytics_metrics",
  {
    id: int("id").autoincrement().primaryKey(),
    metricType: mysqlEnum("metricType", ["active_users", "flights_tracked", "ride_groups_formed", "conversion_rate", "offline_sessions", "ad_impressions", "b2b_revenue"]).notNull(),
    value: decimal("value", { precision: 15, scale: 2 }).notNull(),
    metadata: json("metadata"),
    recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  },
  (table) => ({
    metricTypeIdx: index("analytics_metric_type_idx").on(table.metricType),
    recordedAtIdx: index("analytics_recorded_at_idx").on(table.recordedAt),
  })
);

export type AnalyticsMetric = typeof analyticsMetrics.$inferSelect;
export type InsertAnalyticsMetric = typeof analyticsMetrics.$inferInsert;

// User appeals table
export const userAppeals = mysqlTable(
  "user_appeals",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    appealType: mysqlEnum("appealType", ["ban_appeal", "dispute", "complaint"]).notNull(),
    reason: text("reason").notNull(),
    attachments: json("attachments"),
    status: mysqlEnum("status", ["submitted", "under_review", "approved", "rejected"]).default("submitted"),
    reviewedBy: int("reviewedBy").references(() => adminUsers.id),
    reviewNotes: text("reviewNotes"),
    reviewedAt: timestamp("reviewedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("appeal_user_id_idx").on(table.userId),
    statusIdx: index("appeal_status_idx").on(table.status),
  })
);

export type UserAppeal = typeof userAppeals.$inferSelect;
export type InsertUserAppeal = typeof userAppeals.$inferInsert;
