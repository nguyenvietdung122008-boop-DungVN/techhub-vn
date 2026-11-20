CREATE INDEX `comments_entity_time` ON `comments` (`entity`,`created_at`);--> statement-breakpoint
CREATE INDEX `entities_kind_time` ON `entities` (`kind`,`created_at`);--> statement-breakpoint
CREATE INDEX `entities_owner` ON `entities` (`owner`);--> statement-breakpoint
CREATE INDEX `orders_owner_time` ON `orders` (`owner`,`created_at`);--> statement-breakpoint
CREATE INDEX `reports_owner_status` ON `reports` (`owner`,`status`);