ALTER TABLE `admin_users` MODIFY COLUMN `permissions` json;--> statement-breakpoint
ALTER TABLE `admin_users` MODIFY COLUMN `managedRegions` json;--> statement-breakpoint
ALTER TABLE `analytics_metrics` MODIFY COLUMN `metadata` json;--> statement-breakpoint
ALTER TABLE `cms_content` MODIFY COLUMN `metadata` json;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `targetData` json;--> statement-breakpoint
ALTER TABLE `user_appeals` MODIFY COLUMN `attachments` json;