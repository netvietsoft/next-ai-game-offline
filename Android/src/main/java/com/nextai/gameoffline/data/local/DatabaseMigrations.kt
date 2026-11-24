package com.nextai.gameoffline.data.local

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

/**
 * Các bản nâng cấp schema tường minh của Room để luôn bảo toàn 100% dữ liệu người chơi khi
 * cập nhật từ bản Google Play cũ (v3 -> v4) mà không bao giờ dùng destructive fallback.
 * Explicit Room schema migrations preserving all user progress across Play Store updates.
 */
object DatabaseMigrations {

    /**
     * Danh sách câu lệnh SQL chuẩn hóa cho Migration v3 -> v4 (dùng chung cho Room & JVM tests):
     * 1. Bổ sung `open_count` và `highest_level` vào `user_game_stats` (gộp GameTrackingRepository).
     * 2. Xóa 2 bảng legacy không còn nơi sử dụng (`banners`, `offline_ads`).
     */
    internal val MIGRATION_3_4_STATEMENTS: List<String> = listOf(
        "ALTER TABLE `user_game_stats` ADD COLUMN `open_count` INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE `user_game_stats` ADD COLUMN `highest_level` INTEGER NOT NULL DEFAULT 1",
        "DROP TABLE IF EXISTS `banners`",
        "DROP TABLE IF EXISTS `offline_ads`"
    )

    /**
     * Migration Room chính thức từ schema v3 (Play v9/v10) lên v4.
     * Official Room migration from schema v3 (Play v9/v10) to v4.
     */
    val MIGRATION_3_4: Migration = object : Migration(3, 4) {
        override fun migrate(db: SupportSQLiteDatabase) {
            MIGRATION_3_4_STATEMENTS.forEach { sql ->
                db.execSQL(sql)
            }
        }
    }
}
