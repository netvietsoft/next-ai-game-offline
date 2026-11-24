package com.nextai.gameoffline.data.remote

import android.content.Context
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileOutputStream
import java.util.zip.ZipInputStream

/**
 * Giải nén an toàn gói ZIP R2 (chống Zip Slip, zip bomb, mã thực thi Android)
 * và kích hoạt bản cài theo cơ chế thay thế nguyên tử có bản sao dự phòng (backup rollback).
 * Safely extracts verified R2 ZIP archives with Zip Slip/zip-bomb/executable guards and
 * atomically activates staged installs with backup rollback protection.
 */
internal object GamePackageInstaller {

    private const val BUFFER_SIZE = 64 * 1024

    /**
     * Giải nén toàn bộ tệp vào thư mục staging và xác minh chính xác số tệp, dung lượng và `index.html`.
     * Extracts into staging and verifies exact file count, extracted byte count, and `index.html`.
     */
    fun extractVerifiedPackage(zipFile: File, stagingDir: File, spec: GameIntegritySpec) {
        ensureDirectory(stagingDir, "Cannot create staging")
        val canonicalRoot = stagingDir.canonicalFile
        val canonicalPrefix = canonicalRoot.path + File.separator
        val seenFiles = hashSetOf<String>()
        var extractedBytes = 0L
        var extractedFiles = 0

        ZipInputStream(BufferedInputStream(zipFile.inputStream())).use { zip ->
            var entry = zip.nextEntry
            while (entry != null) {
                val entryName = entry.name
                if (!GamePackageSecurityPolicy.isSafeZipEntry(entryName)) {
                    throw SecurityException("Unsafe ZIP entry")
                }
                val outputFile = File(canonicalRoot, entryName).canonicalFile
                if (!outputFile.path.startsWith(canonicalPrefix)) {
                    throw SecurityException("ZIP traversal")
                }
                if (entry.isDirectory) {
                    ensureDirectory(outputFile, "Cannot create ZIP directory")
                } else {
                    extractedFiles++
                    validateZipFileEntry(outputFile, seenFiles, extractedFiles, spec.fileCount)
                    extractedBytes += copyZipEntryBounded(
                        zip = zip,
                        outputFile = outputFile,
                        currentBytes = extractedBytes,
                        maxSpecBytes = spec.extractedSizeBytes
                    )
                }
                zip.closeEntry()
                entry = zip.nextEntry
            }
        }

        if (extractedFiles != spec.fileCount || extractedBytes != spec.extractedSizeBytes) {
            throw SecurityException("Extracted package metadata mismatch")
        }
        val index = File(canonicalRoot, "index.html")
        if (!index.isFile || index.length() == 0L) {
            throw SecurityException("Game entry point missing")
        }
    }

    /**
     * Thay thế thư mục game đích nguyên tử bằng thư mục staging; khôi phục bản cũ nếu đổi tên lỗi.
     * Atomically replaces the target game folder from staging, rolling back on rename failure.
     */
    fun installStagedGame(context: Context, gameName: String, stagingDir: File) {
        val gamesRoot = File(context.filesDir, "games")
        ensureDirectory(gamesRoot, "Cannot create games root")
        val target = File(gamesRoot, gameName)
        val backup = File(gamesRoot, ".backup_$gameName")
        if (!target.exists() && backup.exists() && !backup.renameTo(target)) {
            throw SecurityException("Cannot recover previous game backup")
        } else if (target.exists() && backup.exists()) {
            backup.deleteRecursively()
        }
        val hadExisting = target.exists()
        if (hadExisting && !target.renameTo(backup)) {
            throw SecurityException("Cannot back up installed game")
        }
        if (!stagingDir.renameTo(target)) {
            val copied = try {
                target.deleteRecursively()
                stagingDir.copyRecursively(target, overwrite = true) &&
                    File(target, "index.html").isFile
            } catch (_: Exception) {
                false
            }
            if (!copied) {
                target.deleteRecursively()
                if (hadExisting && !backup.renameTo(target)) {
                    throw SecurityException("Cannot roll back installed game")
                }
                throw SecurityException("Cannot activate staged game")
            }
        }
        backup.deleteRecursively()
    }

    private fun validateZipFileEntry(
        outputFile: File,
        seenFiles: MutableSet<String>,
        extractedFiles: Int,
        expectedFileCount: Int
    ) {
        if (GamePackageSecurityPolicy.isBlockedExecutable(outputFile.name)) {
            throw SecurityException("Executable payload blocked")
        }
        if (!seenFiles.add(outputFile.path)) {
            throw SecurityException("Duplicate ZIP entry")
        }
        if (extractedFiles > expectedFileCount ||
            extractedFiles > GameIntegrityManifestStore.MAX_FILE_COUNT
        ) {
            throw SecurityException("Too many ZIP entries")
        }
        outputFile.parentFile?.let { parent -> ensureDirectory(parent, "Cannot create ZIP parent") }
    }

    private fun copyZipEntryBounded(
        zip: ZipInputStream,
        outputFile: File,
        currentBytes: Long,
        maxSpecBytes: Long
    ): Long {
        var entryBytes = 0L
        BufferedOutputStream(FileOutputStream(outputFile)).use { output ->
            val buffer = ByteArray(BUFFER_SIZE)
            while (true) {
                val count = zip.read(buffer)
                if (count < 0) {
                    break
                }
                entryBytes += count
                val totalAfter = currentBytes + entryBytes
                if (totalAfter > maxSpecBytes ||
                    totalAfter > GameIntegrityManifestStore.MAX_EXTRACTED_BYTES
                ) {
                    throw SecurityException("Extracted package exceeds limit")
                }
                output.write(buffer, 0, count)
            }
        }
        return entryBytes
    }

    private fun ensureDirectory(dir: File, errorMessage: String) {
        if (!dir.mkdirs() && !dir.isDirectory) {
            throw SecurityException(errorMessage)
        }
    }
}
