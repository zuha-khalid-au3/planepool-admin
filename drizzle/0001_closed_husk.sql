CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`superAdminRole` enum('super_admin','admin') DEFAULT 'admin',
	`permissions` json DEFAULT ('{}'),
	`department` varchar(100),
	`managedRegions` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricType` enum('active_users','flights_tracked','ride_groups_formed','conversion_rate','offline_sessions','ad_impressions','b2b_revenue') NOT NULL,
	`value` decimal(15,2) NOT NULL,
	`metadata` json DEFAULT ('{}'),
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(50) NOT NULL,
	`resourceId` varchar(255),
	`changes` json DEFAULT ('{}'),
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failure') DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `b2b_partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerType` enum('airport_authority','airline','hotel','transport_provider','other') NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`contactPerson` varchar(255),
	`website` varchar(255),
	`status` enum('active','inactive','pending','suspended') DEFAULT 'pending',
	`revenueSharePercentage` decimal(5,2) DEFAULT '0.00',
	`contractStartDate` datetime,
	`contractEndDate` datetime,
	`metadata` json DEFAULT ('{}'),
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `b2b_partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cms_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('destination','onboarding_copy','faq','push_template','banner') NOT NULL,
	`key` varchar(255) NOT NULL,
	`title` varchar(255),
	`content` longtext,
	`metadata` json DEFAULT ('{}'),
	`isActive` boolean DEFAULT true,
	`displayOrder` int DEFAULT 0,
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cms_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`flightNumber` varchar(10) NOT NULL,
	`airline` varchar(100) NOT NULL,
	`originAirport` varchar(10) NOT NULL,
	`destinationAirport` varchar(10) NOT NULL,
	`scheduledDeparture` datetime NOT NULL,
	`scheduledArrival` datetime NOT NULL,
	`actualArrival` datetime,
	`status` enum('scheduled','in_flight','landed','cancelled') DEFAULT 'scheduled',
	`totalPassengers` int,
	`activeRideGroups` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kyc_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('government_id','selfie','flight_ticket') NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text,
	`mimeType` varchar(50),
	`verificationStatus` enum('pending','approved','rejected') DEFAULT 'pending',
	`verifiedBy` int,
	`verificationNotes` text,
	`verifiedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kyc_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`notificationType` enum('push','in_app','email') DEFAULT 'push',
	`targetSegment` enum('all_users','flight_specific','destination_based','verified_users','custom') DEFAULT 'all_users',
	`targetData` json DEFAULT ('{}'),
	`status` enum('draft','scheduled','sent','cancelled') DEFAULT 'draft',
	`scheduledAt` datetime,
	`sentAt` datetime,
	`deliveredCount` int DEFAULT 0,
	`failedCount` int DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ride_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`flightId` int NOT NULL,
	`destination` varchar(255) NOT NULL,
	`organizerId` int NOT NULL,
	`status` enum('forming','confirmed','in_progress','completed','cancelled') DEFAULT 'forming',
	`memberCount` int DEFAULT 1,
	`estimatedCost` decimal(10,2),
	`actualCost` decimal(10,2),
	`meetingPoint` varchar(255),
	`departureTime` datetime,
	`completedAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ride_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sos_incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rideGroupId` int,
	`incidentType` enum('emergency','harassment','unsafe_driver','accident','other') NOT NULL,
	`description` text,
	`location` varchar(255),
	`status` enum('reported','acknowledged','investigating','resolved') DEFAULT 'reported',
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`resolvedBy` int,
	`resolutionNotes` text,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sos_incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_appeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appealType` enum('ban_appeal','dispute','complaint') NOT NULL,
	`reason` text NOT NULL,
	`attachments` json DEFAULT ('[]'),
	`status` enum('submitted','under_review','approved','rejected') DEFAULT 'submitted',
	`reviewedBy` int,
	`reviewNotes` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_appeals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','super_admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `idVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `selfieVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `flightTicketVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `verificationStatus` enum('pending','approved','rejected') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `users` ADD `trustScore` decimal(5,2) DEFAULT '100.00';--> statement-breakpoint
ALTER TABLE `users` ADD `isBanned` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `banReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `banExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `admin_users` ADD CONSTRAINT `admin_users_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_adminId_admin_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `admin_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `b2b_partners` ADD CONSTRAINT `b2b_partners_createdBy_admin_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `admin_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_content` ADD CONSTRAINT `cms_content_createdBy_admin_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `admin_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cms_content` ADD CONSTRAINT `cms_content_updatedBy_admin_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `admin_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kyc_documents` ADD CONSTRAINT `kyc_documents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kyc_documents` ADD CONSTRAINT `kyc_documents_verifiedBy_admin_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `admin_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_createdBy_admin_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `admin_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ride_groups` ADD CONSTRAINT `ride_groups_flightId_flights_id_fk` FOREIGN KEY (`flightId`) REFERENCES `flights`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ride_groups` ADD CONSTRAINT `ride_groups_organizerId_users_id_fk` FOREIGN KEY (`organizerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sos_incidents` ADD CONSTRAINT `sos_incidents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sos_incidents` ADD CONSTRAINT `sos_incidents_rideGroupId_ride_groups_id_fk` FOREIGN KEY (`rideGroupId`) REFERENCES `ride_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sos_incidents` ADD CONSTRAINT `sos_incidents_resolvedBy_admin_users_id_fk` FOREIGN KEY (`resolvedBy`) REFERENCES `admin_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_appeals` ADD CONSTRAINT `user_appeals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_appeals` ADD CONSTRAINT `user_appeals_reviewedBy_admin_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `admin_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `admin_user_id_idx` ON `admin_users` (`userId`);--> statement-breakpoint
CREATE INDEX `analytics_metric_type_idx` ON `analytics_metrics` (`metricType`);--> statement-breakpoint
CREATE INDEX `analytics_recorded_at_idx` ON `analytics_metrics` (`recordedAt`);--> statement-breakpoint
CREATE INDEX `audit_admin_id_idx` ON `audit_logs` (`adminId`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_resource_type_idx` ON `audit_logs` (`resourceType`);--> statement-breakpoint
CREATE INDEX `audit_created_at_idx` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `partner_type_idx` ON `b2b_partners` (`partnerType`);--> statement-breakpoint
CREATE INDEX `partner_status_idx` ON `b2b_partners` (`status`);--> statement-breakpoint
CREATE INDEX `partner_email_idx` ON `b2b_partners` (`email`);--> statement-breakpoint
CREATE INDEX `cms_type_idx` ON `cms_content` (`contentType`);--> statement-breakpoint
CREATE INDEX `cms_key_idx` ON `cms_content` (`key`);--> statement-breakpoint
CREATE INDEX `cms_active_idx` ON `cms_content` (`isActive`);--> statement-breakpoint
CREATE INDEX `flight_number_idx` ON `flights` (`flightNumber`);--> statement-breakpoint
CREATE INDEX `destination_airport_idx` ON `flights` (`destinationAirport`);--> statement-breakpoint
CREATE INDEX `flight_status_idx` ON `flights` (`status`);--> statement-breakpoint
CREATE INDEX `kyc_user_id_idx` ON `kyc_documents` (`userId`);--> statement-breakpoint
CREATE INDEX `kyc_doc_type_idx` ON `kyc_documents` (`documentType`);--> statement-breakpoint
CREATE INDEX `kyc_verification_idx` ON `kyc_documents` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `notification_status_idx` ON `notifications` (`status`);--> statement-breakpoint
CREATE INDEX `notification_scheduled_idx` ON `notifications` (`scheduledAt`);--> statement-breakpoint
CREATE INDEX `ride_flight_id_idx` ON `ride_groups` (`flightId`);--> statement-breakpoint
CREATE INDEX `ride_destination_idx` ON `ride_groups` (`destination`);--> statement-breakpoint
CREATE INDEX `ride_status_idx` ON `ride_groups` (`status`);--> statement-breakpoint
CREATE INDEX `sos_user_id_idx` ON `sos_incidents` (`userId`);--> statement-breakpoint
CREATE INDEX `sos_status_idx` ON `sos_incidents` (`status`);--> statement-breakpoint
CREATE INDEX `sos_severity_idx` ON `sos_incidents` (`severity`);--> statement-breakpoint
CREATE INDEX `appeal_user_id_idx` ON `user_appeals` (`userId`);--> statement-breakpoint
CREATE INDEX `appeal_status_idx` ON `user_appeals` (`status`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `verification_idx` ON `users` (`verificationStatus`);