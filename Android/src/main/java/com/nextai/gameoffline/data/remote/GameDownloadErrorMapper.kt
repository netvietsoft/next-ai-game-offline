package com.nextai.gameoffline.data.remote

import androidx.annotation.StringRes
import com.nextai.gameoffline.R
import java.io.FileNotFoundException
import java.net.SocketTimeoutException
import kotlinx.coroutines.TimeoutCancellationException

/**
 * Ngoại lệ nội bộ đánh dấu thiết bị không có kết nối mạng trước khi gọi HTTP tải R2.
 * Internal exception indicating no internet connection before any R2 HTTP request starts.
 */
internal class NoNetworkConnectionException : IllegalStateException("No internet connection")

/**
 * Ánh xạ lỗi tải gói game R2 sang tài nguyên chuỗi thân thiện cho người chơi.
 * Maps R2 download failure causes to user-facing string resources.
 */
internal object GameDownloadErrorMapper {

    /**
     * Chọn mã thông báo lỗi tương ứng với nguyên nhân (ngoại tuyến, timeout, thiếu gói, lỗi xác minh).
     * Resolves the string resource ID matching the root cause of a download failure.
     */
    @StringRes
    fun resolveMessageRes(error: Throwable): Int = when (error) {
        is NoNetworkConnectionException -> R.string.game_download_no_network
        is TimeoutCancellationException,
        is SocketTimeoutException -> R.string.game_download_timeout
        is FileNotFoundException -> R.string.game_download_unavailable
        is SecurityException,
        is IllegalArgumentException -> R.string.game_download_verify_failed
        else -> R.string.game_download_generic_error
    }
}
