package com.nextai.gameoffline.data.remote

import java.io.File
import java.io.IOException
import java.net.Inet4Address
import java.net.InetAddress
import java.net.SocketTimeoutException
import java.security.MessageDigest
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeout
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Dns
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response

/**
 * Ưu tiên địa chỉ IPv4 trước IPv6 để tránh treo 8-15 giây khi mạng có IPv6 bị timeout.
 * Prioritizes IPv4 addresses ahead of IPv6 to avoid stalls when IPv6 routes time out.
 */
internal class Ipv4FirstDns(private val delegate: Dns = Dns.SYSTEM) : Dns {
    override fun lookup(hostname: String): List<InetAddress> {
        val addresses = delegate.lookup(hostname)
        val ipv4 = ArrayList<InetAddress>(addresses.size)
        val other = ArrayList<InetAddress>(addresses.size)
        for (address in addresses) {
            if (address is Inet4Address) ipv4.add(address) else other.add(address)
        }
        return if (ipv4.isEmpty() || other.isEmpty()) addresses else ipv4 + other
    }
}

/** HTTP stream có thời hạn nhận byte đầu và xác minh SHA; caller phải kiểm URL allowlist trước.
 * HTTP streaming with a first-byte deadline and SHA verification; callers must validate the URL allowlist first. */
internal class GamePackageTransfer(
    private val client: OkHttpClient = defaultClient,
    private val firstByteTimeoutMs: Long = 20_000L,
    private val stalledReadTimeoutMs: Long = 15_000L
) {
    /** Không tăng tiến độ giả: chỉ byte thực đã ghi mới được báo / Report only actual bytes written, never simulated progress. */
    suspend fun download(url: String, destination: File, expectedBytes: Long, expectedSha256: String,
        onBytes: (Long, Long) -> Unit) {
        val startedNanos = System.nanoTime()
        val call = client.newCall(Request.Builder().url(url)
            .header("Accept-Encoding", "identity")
            .header("User-Agent", "NextAIGameOffline-PackageDownloader/1.0").build())
        try {
            val response = withTimeout(firstByteTimeoutMs) { call.awaitResponse() }
            response.use {
                if (response.code == 404 || response.code == 410) {
                    throw java.io.FileNotFoundException("Game package unavailable")
                }
                if (response.code != 200) throw IOException("Unexpected HTTP response")
                if (response.header("Content-Encoding")?.let { !it.equals("identity", true) } == true) {
                    throw SecurityException("Unexpected content encoding")
                }
                val body = response.body ?: throw IOException("Empty response body")
                if (body.contentLength() >= 0 && body.contentLength() != expectedBytes) {
                    throw SecurityException("Content length mismatch")
                }
                val deadlineNanos = TimeUnit.MILLISECONDS.toNanos(firstByteTimeoutMs)
                val remainingNanos = deadlineNanos - (System.nanoTime() - startedNanos)
                if (remainingNanos <= 0L) throw SocketTimeoutException("No first byte before deadline")
                val source = body.source()
                source.timeout().timeout(remainingNanos, TimeUnit.NANOSECONDS)
                source.timeout().deadlineNanoTime(startedNanos + TimeUnit.MILLISECONDS.toNanos(firstByteTimeoutMs))
                var downloaded = 0L
                val digest = MessageDigest.getInstance("SHA-256")
                destination.outputStream().buffered().use { output ->
                    val input = source.inputStream()
                    val buffer = ByteArray(64 * 1024)
                    while (true) {
                        val count = input.read(buffer)
                        if (count < 0) break
                        if (downloaded == 0L) {
                            source.timeout().clearDeadline()
                            source.timeout().timeout(stalledReadTimeoutMs, TimeUnit.MILLISECONDS)
                        }
                        downloaded += count
                        if (downloaded > expectedBytes) throw SecurityException("Package exceeds allowlisted size")
                        digest.update(buffer, 0, count)
                        output.write(buffer, 0, count)
                        onBytes(downloaded, expectedBytes)
                    }
                }
                val actualHash = digest.digest().joinToString("") { "%02x".format(it.toInt() and 0xff) }
                if (downloaded != expectedBytes || actualHash != expectedSha256) {
                    throw SecurityException("Package integrity mismatch")
                }
            }
        } finally {
            call.cancel()
        }
    }

    /** Hủy coroutine giải phóng caller khi DNS chậm và đóng response đến muộn.
     * Cancellation releases the caller during slow DNS and closes late responses. */
    private suspend fun Call.awaitResponse(): Response = suspendCancellableCoroutine { continuation ->
        val deliveredResponse = AtomicReference<Response?>(null)
        continuation.invokeOnCancellation {
            cancel()
            deliveredResponse.getAndSet(null)?.close()
        }
        enqueue(object : Callback {
            override fun onFailure(call: Call, error: IOException) {
                if (continuation.isActive) continuation.resumeWithException(error)
            }
            override fun onResponse(call: Call, response: Response) {
                deliveredResponse.set(response)
                if (continuation.isActive) continuation.resume(response) else deliveredResponse.getAndSet(null)?.close()
            }
        })
    }

    private companion object {
        // Pool tái sử dụng DNS ưu tiên IPv4, tự failover IP chết nhưng tuyệt đối không theo redirect.
        // Reuse pooled IPv4-first DNS connections with connection failover while never following redirects.
        val defaultClient = OkHttpClient.Builder()
            .dns(Ipv4FirstDns())
            .connectTimeout(8, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .followRedirects(false)
            .followSslRedirects(false)
            .retryOnConnectionFailure(true)
            .build()
    }
}
