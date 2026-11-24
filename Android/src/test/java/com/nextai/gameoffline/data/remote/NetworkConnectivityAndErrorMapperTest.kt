package com.nextai.gameoffline.data.remote

import com.nextai.gameoffline.R
import java.io.FileNotFoundException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử logic kiểm tra trạng thái mạng ngoại tuyến và ánh xạ thông báo lỗi tải gói R2.
 * Tests offline network detection predicates and R2 download error message mapping.
 */
class NetworkConnectivityAndErrorMapperTest {

    /** Chỉ trả true khi đồng thời có capability Internet và transport hợp lệ. */
    @Test
    fun hasUsableInternet_requiresBothInternetCapabilityAndTransport() {
        assertTrue(NetworkConnectivityChecker.hasUsableInternet(true, true))
        assertFalse(NetworkConnectivityChecker.hasUsableInternet(false, true))
        assertFalse(NetworkConnectivityChecker.hasUsableInternet(true, false))
        assertFalse(NetworkConnectivityChecker.hasUsableInternet(false, false))
    }

    /** Lỗi ngoại tuyến, timeout, thiếu gói, lỗi xác minh và lỗi mạng chung ánh xạ đúng chuỗi UI. */
    @Test
    fun resolveMessageRes_mapsEachFailureCauseDistinctly() {
        assertEquals(
            R.string.game_download_no_network,
            GameDownloadErrorMapper.resolveMessageRes(NoNetworkConnectionException())
        )
        assertEquals(
            R.string.game_download_timeout,
            GameDownloadErrorMapper.resolveMessageRes(SocketTimeoutException("read timed out"))
        )
        assertEquals(
            R.string.game_download_unavailable,
            GameDownloadErrorMapper.resolveMessageRes(FileNotFoundException("404"))
        )
        assertEquals(
            R.string.game_download_verify_failed,
            GameDownloadErrorMapper.resolveMessageRes(SecurityException("SHA mismatch"))
        )
        assertEquals(
            R.string.game_download_verify_failed,
            GameDownloadErrorMapper.resolveMessageRes(IllegalArgumentException("Invalid game identifier"))
        )
        assertEquals(
            R.string.game_download_generic_error,
            GameDownloadErrorMapper.resolveMessageRes(UnknownHostException("r2.dev"))
        )
    }
}
