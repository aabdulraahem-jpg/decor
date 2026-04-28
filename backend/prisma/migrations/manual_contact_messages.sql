-- Apply with:
--   mysql -u sufuf_Notouch -p sufuf_sufuf_db < prisma/migrations/manual_contact_messages.sql
-- Then restart the backend pm2 process.

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`         VARCHAR(191)  NOT NULL,
  `name`       VARCHAR(120)  NOT NULL,
  `email`      VARCHAR(255)  NOT NULL,
  `phone`      VARCHAR(40)   NULL,
  `subject`    VARCHAR(200)  NULL,
  `kind`       ENUM('GENERAL','IMPLEMENTATION','PARTNERSHIP','SUPPORT') NOT NULL DEFAULT 'GENERAL',
  `message`    TEXT          NOT NULL,
  `status`     ENUM('NEW','READ','REPLIED','ARCHIVED') NOT NULL DEFAULT 'NEW',
  `ip_address` VARCHAR(45)   NULL,
  `user_agent` VARCHAR(500)  NULL,
  `email_sent` TINYINT(1)    NOT NULL DEFAULT 0,
  `admin_note` TEXT          NULL,
  `created_at` DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `read_at`    DATETIME(3)   NULL,
  PRIMARY KEY (`id`),
  INDEX `contact_messages_status_idx` (`status`),
  INDEX `contact_messages_kind_idx` (`kind`),
  INDEX `contact_messages_createdAt_idx` (`created_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
