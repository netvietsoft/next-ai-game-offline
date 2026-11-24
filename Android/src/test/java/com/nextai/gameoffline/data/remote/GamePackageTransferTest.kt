package com.nextai.gameoffline.data.remote

import java.io.File
import java.net.Inet4Address
import java.net.Inet6Address
import java.net.InetAddress
import java.security.MessageDigest
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.runBlocking
import okhttp3.Dns
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okio.Buffer
import org.junit.Assert.*
import org.junit.Test

/** Kiểm thử byte thật, giới hạn chờ và tính toàn vẹn / Tests real byte progress, bounded waits and integrity. */
class GamePackageTransferTest {
    /** Không có phần trăm trước byte thực, hash đúng mới thành công / No progress before actual bytes; success requires matching hash. */
    @Test fun transfersActualBytesAndRejectsHashMismatch() = runBlocking {
        val server = MockWebServer()
        server.start()
        val destination = File.createTempFile("transfer-test", ".zip")
        try {
            val data = ByteArray(150_000) { (it % 251).toByte() }
            val hash = digest(data)
            server.enqueue(MockResponse().setBody(Buffer().write(data)))
            val updates = mutableListOf<Long>()
            GamePackageTransfer(client()).download(server.url("/game.zip").toString(), destination, data.size.toLong(), hash) { bytes, total ->
                assertEquals(data.size.toLong(), total)
                assertTrue(bytes > 0)
                updates.add(bytes)
            }
            assertEquals(data.size.toLong(), updates.last())
            assertTrue(updates.zipWithNext().all { (a, b) -> b > a })
            assertArrayEquals(data, destination.readBytes())
            server.enqueue(MockResponse().setBody(Buffer().write(data)))
            try {
                GamePackageTransfer(client()).download(server.url("/game.zip").toString(), destination, data.size.toLong(), "0".repeat(64)) { _, _ -> }
                fail("Incorrect hash accepted")
            } catch (_: SecurityException) { }
        } finally { destination.delete(); server.shutdown() }
    }

    /** Chuyển hướng không được theo dù đích trả byte đúng / Redirects are never followed even if the destination has valid bytes. */
    @Test fun refusesRedirects() = runBlocking {
        val server = MockWebServer()
        server.start()
        val destination = File.createTempFile("transfer-test", ".zip")
        try {
            server.enqueue(MockResponse().setResponseCode(302).addHeader("Location", server.url("/other.zip")))
            try {
                GamePackageTransfer(client()).download(server.url("/game.zip").toString(), destination, 1, digest(byteArrayOf(1))) { _, _ -> }
                fail("Redirect accepted")
            } catch (_: java.io.IOException) { }
            assertEquals(1, server.requestCount)
        } finally { destination.delete(); server.shutdown() }
    }

    /** DNS và header chậm không giữ caller một phút / Slow DNS and response headers cannot hold the caller for a minute. */
    @Test fun firstByteDeadlineIncludesDnsAndHeaders() = runBlocking {
        val server = MockWebServer()
        server.start()
        val destination = File.createTempFile("transfer-test", ".zip")
        try {
            server.enqueue(MockResponse().setBody("x").setHeadersDelay(2, TimeUnit.SECONDS))
            var start = System.nanoTime()
            try {
                GamePackageTransfer(client(), 200).download(server.url("/game.zip").toString(), destination, 1, digest("x".toByteArray())) { _, _ -> fail("Progress before byte") }
                fail("Delayed headers accepted")
            } catch (_: TimeoutCancellationException) { }
            assertTrue(TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start) < 1_500)
            val delayedDns = client().newBuilder().dns(object : Dns {
                override fun lookup(hostname: String): List<java.net.InetAddress> {
                    Thread.sleep(2_000)
                    return Dns.SYSTEM.lookup("localhost")
                }
            }).build()
            start = System.nanoTime()
            try {
                GamePackageTransfer(delayedDns, 200).download("http://delayed.test:${server.port}/game.zip", destination, 1, digest("x".toByteArray())) { _, _ -> fail("Progress during DNS") }
                fail("Slow DNS blocked caller")
            } catch (_: TimeoutCancellationException) { }
            assertTrue(TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start) < 1_500)
        } finally { destination.delete(); server.shutdown() }
    }

    /** Header có sẵn vẫn phải giới hạn chờ byte đầu / Available headers do not remove the first-body-byte deadline. */
    @Test fun firstBodyByteCannotWaitIndefinitely() = runBlocking {
        val server = MockWebServer()
        server.start()
        val destination = File.createTempFile("transfer-test", ".zip")
        try {
            server.enqueue(MockResponse().setBody("x").setBodyDelay(2, TimeUnit.SECONDS))
            val start = System.nanoTime()
            try {
                GamePackageTransfer(client(), 250).download(server.url("/game.zip").toString(), destination, 1, digest("x".toByteArray())) { _, _ -> fail("Progress before byte") }
                fail("Delayed body accepted")
            } catch (_: java.io.IOException) { }
            assertTrue(TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start) < 1_500)
        } finally { destination.delete(); server.shutdown() }
    }

    /** Byte đang tiến triển không bị cắt bởi deadline lúc kết nối / A progressing transfer outlives its startup deadline. */
    @Test fun activeTransferContinuesPastStartupDeadline() = runBlocking {
        val server = MockWebServer()
        server.start()
        val destination = File.createTempFile("transfer-test", ".zip")
        try {
            val bytes = "abcde".toByteArray()
            server.enqueue(MockResponse().setBody(Buffer().write(bytes)).throttleBody(1, 100, TimeUnit.MILLISECONDS))
            val start = System.nanoTime()
            GamePackageTransfer(client(), 250, 500).download(server.url("/game.zip").toString(), destination,
                bytes.size.toLong(), digest(bytes)) { _, _ -> }
            assertTrue(TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start) >= 300)
            assertArrayEquals(bytes, destination.readBytes())
        } finally { destination.delete(); server.shutdown() }
    }

    /** Mất tiến độ sau byte đầu sẽ hết hạn read / A stalled transfer times out after receiving its first byte. */
    @Test fun stalledBodyAfterFirstByteTimesOut() = runBlocking {
        val server = MockWebServer()
        server.start()
        val destination = File.createTempFile("transfer-test", ".zip")
        try {
            val bytes = "ab".toByteArray()
            server.enqueue(MockResponse().setBody(Buffer().write(bytes)).throttleBody(1, 2, TimeUnit.SECONDS))
            val updates = mutableListOf<Long>()
            try {
                GamePackageTransfer(client(), 1_000, 200).download(server.url("/game.zip").toString(), destination,
                    bytes.size.toLong(), digest(bytes)) { received, _ -> updates.add(received) }
                fail("Stalled transfer accepted")
            } catch (_: java.io.IOException) { }
            assertEquals(listOf(1L), updates)
        } finally { destination.delete(); server.shutdown() }
    }

    /** DNS ưu tiên IPv4 trước IPv6 nhưng vẫn giữ đầy đủ bản ghi IPv6 dự phòng.
     * IPv4-first DNS sorts IPv4 records ahead of IPv6 while retaining all IPv6 fallbacks. */
    @Test fun ipv4FirstDnsOrdersIpv4BeforeIpv6() {
        val v6a = InetAddress.getByAddress("r2.example", ByteArray(16) { if (it == 15) 1 else 0x26.toByte() })
        val v4a = InetAddress.getByAddress("r2.example", byteArrayOf(104, 18, 50, 34))
        val v6b = InetAddress.getByAddress("r2.example", ByteArray(16) { if (it == 15) 2 else 0x26.toByte() })
        val v4b = InetAddress.getByAddress("r2.example", byteArrayOf(104, 18, 54, 45))

        val ordered = Ipv4FirstDns(object : Dns {
            override fun lookup(hostname: String): List<InetAddress> = listOf(v6a, v4a, v6b, v4b)
        }).lookup("r2.example")

        assertEquals(4, ordered.size)
        assertTrue(ordered[0] is Inet4Address)
        assertTrue(ordered[1] is Inet4Address)
        assertTrue(ordered[2] is Inet6Address)
        assertTrue(ordered[3] is Inet6Address)
        assertEquals(listOf(v4a, v4b, v6a, v6b), ordered)
    }

    /** Client test luôn chặn redirect như production / Test client rejects redirects just like production. */
    private fun client() = OkHttpClient.Builder().followRedirects(false).followSslRedirects(false).retryOnConnectionFailure(false).build()

    /** Hash dữ liệu test / Hash fixture bytes. */
    private fun digest(bytes: ByteArray) = MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it.toInt() and 0xff) }
}
