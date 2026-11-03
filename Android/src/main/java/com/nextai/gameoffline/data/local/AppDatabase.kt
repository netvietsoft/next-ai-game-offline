package com.nextai.gameoffline.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.nextai.gameoffline.data.local.dao.BannersDao
import com.nextai.gameoffline.data.local.dao.GamesDao
import com.nextai.gameoffline.data.local.dao.OfflineAdsDao
import com.nextai.gameoffline.data.local.dao.UserStatsDao
import com.nextai.gameoffline.data.local.entity.BannerEntity
import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.data.local.entity.OfflineAdEntity
import com.nextai.gameoffline.data.local.entity.UserStatsEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Cơ sở dữ liệu Room SQLite chính của ứng dụng NextAI Game Offline.
 * Main Room SQLite Database for NextAI Game Offline.
 *
 * Tự động nạp sẵn danh sách mini-game ban đầu từ file `assets/games/` khi tạo DB lần đầu.
 * Automatically prepopulates initial mini-game list from `assets/games/` on first database creation.
 */
@Database(
    entities = [
        GameEntity::class,
        BannerEntity::class,
        UserStatsEntity::class,
        OfflineAdEntity::class
    ],
    version = 3,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun gamesDao(): GamesDao
    abstract fun bannersDao(): BannersDao
    abstract fun userStatsDao(): UserStatsDao
    abstract fun offlineAdsDao(): OfflineAdsDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "nextai_games_offline.db"
                )
                .addCallback(AppDatabaseCallback(context.applicationContext, scope))
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }

        /**
         * Nạp trực tiếp dữ liệu danh mục mini-game từ file `games_catalog.json`.
         * Direct seeding function to populate games catalog from `games_catalog.json`.
         */
        suspend fun populateGamesCatalogDirect(context: Context, gamesDao: GamesDao) {
            try {
                val jsonString = context.assets.open("games_catalog.json").bufferedReader().use { it.readText() }
                val jsonArray = org.json.JSONArray(jsonString)
                val gamesList = mutableListOf<GameEntity>()
                for (i in 0 until jsonArray.length()) {
                    val obj = jsonArray.getJSONObject(i)
                    gamesList.add(
                        GameEntity(
                            name = obj.getString("name"),
                            title = obj.getString("title"),
                            category = obj.getString("category"),
                            position = obj.getInt("position"),
                            icon = obj.optString("icon", "${obj.getString("name")}.png"),
                            hasRewardedVideo = obj.optInt("hasRewardedVideo", 1),
                            eachNLevels = obj.optInt("eachNLevels", 3),
                            isHorizontal = obj.optInt("isHorizontal", 0),
                            sizeMb = obj.optDouble("sizeMb", 0.0),
                            remoteUrl = obj.optString("remoteUrl", ""),
                            isDownloaded = obj.optInt("isDownloaded", 1)
                        )
                    )
                }
                gamesDao.deleteAll()
                gamesDao.insertAll(gamesList)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * Callback nạp trước toàn bộ kho mini-game từ file `games_catalog.json` trong assets.
     * Database callback to pre-populate full mini-game catalog from `games_catalog.json`.
     */
    private class AppDatabaseCallback(
        private val context: Context,
        private val scope: CoroutineScope
    ) : RoomDatabase.Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            scope.launch(Dispatchers.IO) {
                INSTANCE?.let { populateGamesCatalogDirect(context, it.gamesDao()) }
            }
        }

        override fun onOpen(db: SupportSQLiteDatabase) {
            super.onOpen(db)
            scope.launch(Dispatchers.IO) {
                // Luôn đồng bộ dữ liệu game mới nhất từ games_catalog.json (bao gồm hướng màn hình)
                // Always synchronize latest game metadata from games_catalog.json (including orientation)
                INSTANCE?.let { populateGamesCatalogDirect(context, it.gamesDao()) }
            }
        }
    }
}
