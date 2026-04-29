-- Apply with:
--   mysql -u sufuf_Notouch -p sufuf_sufuf_db < prisma/migrations/manual_custom_elements.sql

CREATE TABLE IF NOT EXISTS `custom_elements` (
  `id`                VARCHAR(191)  NOT NULL,
  `kind_code`         VARCHAR(40)   NOT NULL,
  `label`             VARCHAR(120)  NOT NULL,
  `icon`              VARCHAR(8)    NOT NULL,
  `category`          VARCHAR(20)   NOT NULL DEFAULT 'EXTERIOR',
  `hint`              VARCHAR(200)  NULL,
  `variants_json`     JSON          NOT NULL,
  `ask_length`        TINYINT(1)    NOT NULL DEFAULT 0,
  `ask_width`         TINYINT(1)    NOT NULL DEFAULT 0,
  `ask_height`        TINYINT(1)    NOT NULL DEFAULT 0,
  `ask_area`          TINYINT(1)    NOT NULL DEFAULT 0,
  `default_unit`      VARCHAR(4)    NOT NULL DEFAULT 'm',
  `notes_placeholder` VARCHAR(200)  NULL,
  `draw_hint`         VARCHAR(300)  NULL,
  `is_active`         TINYINT(1)    NOT NULL DEFAULT 1,
  `sort_order`        INT           NOT NULL DEFAULT 0,
  `created_at`        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `custom_elements_kind_code_key` (`kind_code`),
  INDEX `custom_elements_is_active_idx` (`is_active`),
  INDEX `custom_elements_sort_order_idx` (`sort_order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
