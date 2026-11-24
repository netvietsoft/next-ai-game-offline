package com.nextai.gameoffline.data.remote

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities

/**
 * Kiểm tra trạng thái mạng khả dụng trước khi gửi yêu cầu HTTP tải gói game R2,
 * giúp thông báo rõ trạng thái ngoại tuyến cho người chơi và tránh trộn lỗi offline
 * vào thống kê lỗi hạ tầng (`UnknownHostException`).
 * Checks usable network availability before starting an R2 HTTP transfer so offline
 * players see a clear error message without polluting infrastructure DNS error metrics.
 */
internal object NetworkConnectivityChecker {

    /**
     * Kiểm tra thiết bị đang có kết nối Internet khả dụng (Wi-Fi/Di động/Ethernet/VPN).
     * Fail-open khi gặp `SecurityException` từ ROM OEM để không chặn oan lượt tải hợp lệ.
     * Returns true when an active transport with internet capability is available.
     */
    fun isNetworkAvailable(context: Context): Boolean {
        val manager = context.applicationContext
            .getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            ?: return true
        return try {
            val activeNetwork = manager.activeNetwork ?: return false
            val capabilities = manager.getNetworkCapabilities(activeNetwork) ?: return false
            val hasInternet = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            val hasTransport = capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) ||
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_VPN)
            hasUsableInternet(hasInternet, hasTransport)
        } catch (_: SecurityException) {
            // Dự phòng an toàn khi ROM OEM hiếm gặp ném SecurityException từ ConnectivityManager.
            // Fail-open on rare OEM ROM ConnectivityManager SecurityExceptions.
            true
        }
    }

    /**
     * Hàm thuần Kotlin kiểm tra tổ hợp capability và transport hợp lệ (dễ kiểm thử JVM).
     * Pure Kotlin predicate checking whether network capabilities represent usable internet.
     */
    fun hasUsableInternet(
        hasInternetCapability: Boolean,
        hasSupportedTransport: Boolean
    ): Boolean = hasInternetCapability && hasSupportedTransport
}
