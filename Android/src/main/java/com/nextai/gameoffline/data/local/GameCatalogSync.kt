package com.nextai.gameoffline.data.local

import kotlinx.coroutines.sync.Mutex

/** Đồng bộ seed danh mục với cài game / Synchronizes catalog seeding with game installation. */
internal object GameCatalogSync {
    val mutex = Mutex()
}
