package com.nextai.gameoffline.data.local

import android.content.Context
import android.util.Log
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.data.local.dao.GamesDao
import com.nextai.gameoffline.data.local.dao.UserStatsDao
import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.data.local.entity.UserStatsEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.withLock

/**
 * Cơ sở dữ liệu Room SQLite chính của ứng dụng Galaxy Game (schema v4).
 * Đã loại bỏ 2 bảng/DAO chết (`banners`, `offline_ads`) và hợp nhất toàn bộ thống kê
 * chơi game vào `user_game_stats` thông qua `MIGRATION_3_4` an toàn dữ liệu.
 * Main Room SQLite database (v4) with explicit migration from Play v3 preserving player stats.
 */
@Database(
    entities = [
        GameEntity::class,
        UserStatsEntity::class
    ],
    version = 4,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun gamesDao(): GamesDao
    abstract fun userStatsDao(): UserStatsDao

    companion object {
        /**
         * Danh mục phát hành gồm 100 game đóng gói và 319 game tải theo nhu cầu từ R2.
         * Release catalog containing 100 bundled games and 319 on-demand R2 games.
         */
        private const val RELEASE_CATALOG_ASSET = "games_catalog_full_419_r2.json"

        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "nextai_games_offline.db"
                )
                    .addMigrations(DatabaseMigrations.MIGRATION_3_4)
                    .addCallback(AppDatabaseCallback(context.applicationContext, scope))
                    // Phiên bản chưa biết cần migration rõ ràng; không tự xóa dữ liệu người dùng.
                    // Unknown versions require explicit migration; never silently erase user data.
                    .build()
                INSTANCE = instance
                instance
            }
        }

        /**
         * Nạp danh mục phát hành 419 mini-game và giữ trạng thái game R2 đã cài.
         * Bỏ qua đọc JSON và kiểm tra 419 file trên đĩa nếu bản build hiện tại đã seed đủ.
         * Seeds the 419-game release catalog while preserving installed R2 games, skipping
         * redundant JSON parsing and disk checks when the current build is already seeded.
         */
        suspend fun populateGamesCatalogDirect(
            context: Context,
            gamesDao: GamesDao,
            force: Boolean = false
        ) {
            GameCatalogSync.mutex.withLock {
                try {
                    val existingCount = gamesDao.getGamesCount()
                    if (!CatalogSeedMarker.needsSeed(context, existingCount, force)) {
                        return
                    }

                    val jsonString = context.assets
                        .open(RELEASE_CATALOG_ASSET)
                        .bufferedReader()
                        .use { it.readText() }
                    val jsonArray = org.json.JSONArray(jsonString)
                    val gamesList = ArrayList<GameEntity>(jsonArray.length())

                    for (i in 0 until jsonArray.length()) {
                        val obj = jsonArray.getJSONObject(i)
                        val gameName = obj.getString("name")
                        val isBundledOrInstalled = obj.optInt("isDownloaded", 1) == 1 ||
                            com.nextai.gameoffline.data.remote.GameDownloadManager
                                .isGameInstalled(context, gameName)

                        gamesList.add(
                            GameEntity(
                                name = gameName,
                                title = obj.getString("title"),
                                category = obj.getString("category"),
                                position = obj.getInt("position"),
                                icon = obj.optString("icon", "$gameName.png"),
                                hasRewardedVideo = obj.optInt("hasRewardedVideo", 1),
                                eachNLevels = obj.optInt("eachNLevels", 3),
                                isHorizontal = obj.optInt("isHorizontal", 0),
                                sizeMb = obj.optDouble("sizeMb", 0.0),
                                remoteUrl = obj.optString("remoteUrl", ""),
                                isDownloaded = if (isBundledOrInstalled) 1 else 0
                            )
                        )
                    }

                    // Upsert cả batch giữ các hàng con; DELETE/REPLACE sẽ kích hoạt CASCADE.
                    // Transactional batch upsert preserves child rows; DELETE/REPLACE would cascade.
                    gamesDao.insertAll(gamesList)
                    CatalogSeedMarker.markSeeded(context, gamesList.size)
                } catch (error: Exception) {
                    if (BuildConfig.DEBUG) {
                        Log.e("AppDatabase", "Failed to populate games catalog", error)
                    }
                }
            }
        }
    }

    /**
     * Callback nạp danh mục game hybrid từ catalog phát hành trong assets.
     * Database callback seeding the hybrid release catalog from assets.
     */
    private class AppDatabaseCallback(
        private val context: Context,
        private val scope: CoroutineScope
    ) : RoomDatabase.Callback() {

        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            scope.launch(Dispatchers.IO) {
                INSTANCE?.let { populateGamesCatalogDirect(context, it.gamesDao(), force = true) }
            }
        }

        override fun onOpen(db: SupportSQLiteDatabase) {
            super.onOpen(db)
            scope.launch(Dispatchers.IO) {
                // Chỉ re-seed khi phiên bản app thay đổi hoặc bảng games chưa đủ catalog.
                // Only re-seed when app version changes or the games table is incomplete.
                INSTANCE?.let { populateGamesCatalogDirect(context, it.gamesDao(), force = false) }
            }
        }
    }
}
