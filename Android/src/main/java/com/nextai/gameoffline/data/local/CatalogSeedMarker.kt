package com.nextai.gameoffline.data.local

import android.content.Context
import com.nextai.gameoffline.BuildConfig

/**
 * Đánh dấu phiên bản catalog đã nạp vào Room để tránh đọc lại JSON 5.400 dòng và kiểm tra
 * 419 thư mục game trên ổ đĩa ở mỗi lần mở cơ sở dữ liệu (cold start).
 * Persists the last seeded catalog build marker so Room `onOpen` skips redundant 419-game
 * JSON parsing and disk checks while still reseeding on first install, upgrade, or empty DB.
 */
internal object CatalogSeedMarker {

    const val EXPECTED_CATALOG_SIZE = 419
    private const val PREFS_NAME = "catalog_seed_marker_v1"
    private const val KEY_SEEDED_VERSION_CODE = "seeded_version_code"
    private const val KEY_SEEDED_CATALOG_COUNT = "seeded_catalog_count"

    /**
     * Quyết định thuần (có thể unit-test trên JVM) xem có cần nạp lại catalog hay không.
     * Pure JVM-testable policy deciding whether catalog seeding must execute.
     */
    fun shouldSeedCatalog(
        force: Boolean,
        storedVersionCode: Int,
        currentVersionCode: Int,
        storedCatalogCount: Int,
        databaseGameCount: Int,
        expectedCatalogSize: Int = EXPECTED_CATALOG_SIZE
    ): Boolean {
        if (force) {
            return true
        }
        if (databaseGameCount < expectedCatalogSize) {
            return true
        }
        if (storedVersionCode != currentVersionCode) {
            return true
        }
        return storedCatalogCount < expectedCatalogSize
    }

    /**
     * Kiểm tra theo trạng thái lưu thực tế trên thiết bị có cần chạy seed lại hay không.
     * Evaluates whether the on-device database needs a catalog seed pass.
     */
    fun needsSeed(context: Context, databaseGameCount: Int, force: Boolean = false): Boolean {
        val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val storedVersionCode = prefs.getInt(KEY_SEEDED_VERSION_CODE, -1)
        val storedCatalogCount = prefs.getInt(KEY_SEEDED_CATALOG_COUNT, 0)
        return shouldSeedCatalog(
            force = force,
            storedVersionCode = storedVersionCode,
            currentVersionCode = BuildConfig.VERSION_CODE,
            storedCatalogCount = storedCatalogCount,
            databaseGameCount = databaseGameCount
        )
    }

    /**
     * Ghi nhận catalog đã được nạp thành công cho bản build hiện tại.
     * Marks the catalog as seeded for the current app build version.
     */
    fun markSeeded(context: Context, catalogCount: Int) {
        context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putInt(KEY_SEEDED_VERSION_CODE, BuildConfig.VERSION_CODE)
            .putInt(KEY_SEEDED_CATALOG_COUNT, catalogCount)
            .apply()
    }
}
