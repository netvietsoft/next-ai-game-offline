package com.nextai.gameoffline.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Thực thể đại diện cho một Mini-Game trong hệ thống Room Database.
 * Entity representing a Mini-Game item stored in Room Database.
 *
 * Khớp 100% với cấu trúc bảng `games` của bản decompile gốc.
 * 100% matching the `games` table structure from the original decompile.
 */
@Entity(tableName = "games")
data class GameEntity(
    @PrimaryKey
    @ColumnInfo(name = "name")
    val name: String, // Tên thư mục game trong assets/ (Folder name in assets/)

    @ColumnInfo(name = "title")
    val title: String, // Tiêu đề hiển thị của game (Display title)

    @ColumnInfo(name = "category")
    val category: String, // Thể loại: Puzzle, 2 Players, Classic, Arcade, Casual

    @ColumnInfo(name = "position")
    val position: Int, // Thứ tự sắp xếp hiển thị trên màn hình chính (Sorting position)

    @ColumnInfo(name = "soundToggleType", defaultValue = "1")
    val soundToggleType: Int = 1, // Loại cơ chế tắt/bật âm thanh (Sound toggle type)

    @ColumnInfo(name = "configType", defaultValue = "0")
    val configType: Int = 0,

    @ColumnInfo(name = "useWideViewPortAndOverviewMode", defaultValue = "1")
    val useWideViewPortAndOverviewMode: Int = 1, // Bật chế độ viewport rộng cho WebView

    @ColumnInfo(name = "leaderboardId")
    val leaderboardId: String? = null, // ID Bảng xếp hạng Google Play Games

    @ColumnInfo(name = "section")
    val section: String? = null,

    @ColumnInfo(name = "has_rewarded_video", defaultValue = "0")
    val hasRewardedVideo: Int = 0, // Game có hỗ trợ xem video nhận thưởng không (1: Có, 0: Không)

    @ColumnInfo(name = "each_n_seconds", defaultValue = "180")
    val eachNSeconds: Int = 180, // Tần suất hiển thị quảng cáo theo số giây chơi

    @ColumnInfo(name = "each_n_levels", defaultValue = "3")
    val eachNLevels: Int = 3, // Tần suất hiển thị quảng cáo sau mỗi N màn chơi

    @ColumnInfo(name = "each_n_scores", defaultValue = "500")
    val eachNScores: Int = 500, // Tần suất hiển thị quảng cáo sau mỗi N điểm

    @ColumnInfo(name = "minimum_level", defaultValue = "1")
    val minimumLevel: Int = 1,

    @ColumnInfo(name = "minimum_time_played_in_game_sec", defaultValue = "30")
    val minimumTimePlayedInGameSec: Int = 30, // Thời gian chơi tối thiểu trước khi kích hoạt ad

    @ColumnInfo(name = "gameFinishedAd", defaultValue = "1")
    val gameFinishedAd: Int = 1, // Hiển thị quảng cáo khi kết thúc game

    @ColumnInfo(name = "js_popup_each_n_seconds", defaultValue = "120")
    val jsPopupEachNSeconds: Int = 120,

    @ColumnInfo(name = "remote_image_url")
    val remoteImageUrl: String? = null,

    @ColumnInfo(name = "remote_url_version", defaultValue = "1")
    val remoteUrlVersion: Int = 1,

    @ColumnInfo(name = "remote_url")
    val remoteUrl: String? = null, // URL tải gói cập nhật động từ CDN nếu có

    @ColumnInfo(name = "size_mb", defaultValue = "0.00")
    val sizeMb: Double = 0.0,

    @ColumnInfo(name = "isHorizontal", defaultValue = "0")
    val isHorizontal: Int = 0, // 1: Màn hình ngang (Landscape), 0: Màn hình dọc (Portrait)

    @ColumnInfo(name = "icon")
    val icon: String? = null, // Tên file icon trong assets/icons/ (Icon filename in assets/icons/)

    @ColumnInfo(name = "is_downloaded", defaultValue = "1")
    var isDownloaded: Int = 1 // 1: Có sẵn cục bộ (Bundled hoặc đã tải), 0: Cần tải từ Cloudflare R2 (1: Local/Downloaded, 0: Needs R2 download)
)
