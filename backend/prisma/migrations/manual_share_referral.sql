-- Apply with:
--   mysql -u sufuf_Notouch -p sufuf_sufuf_db < prisma/migrations/manual_share_referral.sql
-- Then restart sufuf-api pm2.

-- 1. Users: referral system
ALTER TABLE `users`
  ADD COLUMN `referral_code` VARCHAR(20) NULL,
  ADD COLUMN `referred_by_id` VARCHAR(40) NULL,
  ADD COLUMN `referral_credited` TINYINT(1) NOT NULL DEFAULT 0,
  ADD UNIQUE INDEX `users_referral_code_key` (`referral_code`),
  ADD INDEX `users_referred_by_id_idx` (`referred_by_id`);

-- 2. Designs: public share
ALTER TABLE `designs`
  ADD COLUMN `public_slug` VARCHAR(40) NULL,
  ADD COLUMN `is_public` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN `share_view_count` INT NOT NULL DEFAULT 0,
  ADD UNIQUE INDEX `designs_public_slug_key` (`public_slug`),
  ADD INDEX `designs_publicSlug_idx` (`public_slug`);
