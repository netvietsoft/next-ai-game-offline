package com.nextai.gameoffline.presentation.gamelist

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.nextai.gameoffline.R
import com.nextai.gameoffline.data.local.entity.GameEntity

/**
 * Adapter cho ViewPager2 hỗ trợ vuốt ngang chuyển danh mục trò chơi (Horizontal Category Swiper).
 * Mỗi trang là lưới 2 cột hiển thị kệ chơi tiếp gần đây, Mini-Game và Native Ad In-Feed.
 * ViewPager2 adapter rendering category 2-column grids with Recents, games, and Native Ads.
 */
class CategoryPagerAdapter(
    private val categories: List<String>,
    private val onGameClicked: (GameEntity) -> Unit,
    private val onFavoriteClicked: (GameEntity) -> Unit
) : RecyclerView.Adapter<CategoryPagerAdapter.CategoryPageViewHolder>() {

    private val categoryFeedMap = mutableMapOf<String, List<GameFeedItem>>()
    private val activeHolders = mutableSetOf<CategoryPageViewHolder>()
    private var latestAllGames: List<GameEntity> = emptyList()
    private var latestRecentGames: List<GameEntity> = emptyList()
    private var latestSearchQuery: String = ""
    private var adsEnabled: Boolean = false

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CategoryPageViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_category_page, parent, false)
        return CategoryPageViewHolder(view)
    }

    override fun onBindViewHolder(holder: CategoryPageViewHolder, position: Int) {
        val category = categories[position]
        holder.currentCategory = category
        holder.bind(categoryFeedMap[category] ?: emptyList())
        activeHolders.add(holder)
    }

    override fun onViewRecycled(holder: CategoryPageViewHolder) {
        super.onViewRecycled(holder)
        holder.gameAdapter.releaseAllNativeAds()
        activeHolders.remove(holder)
    }

    override fun getItemCount(): Int = categories.size

    /**
     * Bật/tắt chèn thẻ Native Ad In-Feed theo trạng thái VIP và UMP consent; tự làm mới danh sách.
     * Toggles In-Feed Native Ad slots when entitlement or consent changes, releasing old ads on off.
     */
    fun setAdsEnabled(enabled: Boolean) {
        if (adsEnabled == enabled) {
            return
        }
        adsEnabled = enabled
        if (!enabled) {
            releaseAllNativeAds()
        }
        if (latestAllGames.isNotEmpty()) {
            updateAllGames(latestAllGames, latestSearchQuery, latestRecentGames)
        }
    }

    /** Giải phóng toàn bộ Native Ad trên mọi trang danh mục đang mở. */
    fun releaseAllNativeAds() {
        for (holder in activeHolders) {
            holder.gameAdapter.releaseAllNativeAds()
        }
    }

    /**
     * Cập nhật toàn bộ các danh mục dựa trên danh sách game tổng hợp, từ khóa tìm kiếm và kệ gần đây.
     * Trả về số game khớp trong tab All phục vụ telemetry `game_search`.
     * Recomputes category feeds and returns total matching game count for search telemetry.
     */
    fun updateAllGames(
        allGames: List<GameEntity>,
        searchQuery: String = "",
        recentGames: List<GameEntity> = latestRecentGames
    ): Int {
        latestAllGames = allGames
        latestRecentGames = recentGames
        latestSearchQuery = searchQuery
        val isSearching = searchQuery.isNotBlank()
        var allCategoryMatchCount = allGames.size

        for (category in categories) {
            val filtered = filterGamesForCategory(allGames, category, searchQuery)
            if (category == "All") {
                allCategoryMatchCount = filtered.size
            }
            val feedItems = GameFeedMerger.merge(
                games = filtered,
                categoryKey = category,
                adsEnabled = adsEnabled,
                isSearching = isSearching,
                recentGames = recentGames
            )
            updateCategoryFeed(category, feedItems)
        }
        return allCategoryMatchCount
    }

    private fun updateCategoryFeed(category: String, items: List<GameFeedItem>) {
        categoryFeedMap[category] = items
        for (holder in activeHolders) {
            if (holder.currentCategory == category) {
                holder.bind(items)
            }
        }
    }

    private fun filterGamesForCategory(
        allGames: List<GameEntity>,
        category: String,
        searchQuery: String
    ): List<GameEntity> {
        if (searchQuery.isEmpty()) {
            return if (category == "All") {
                allGames
            } else {
                allGames.filter { it.category.equals(category, ignoreCase = true) }
            }
        }
        val queryLower = searchQuery.lowercase()
        return allGames.filter { game ->
            val categoryMatch = category == "All" || game.category.equals(category, ignoreCase = true)
            val queryMatch = game.title.lowercase().contains(queryLower) ||
                game.name.lowercase().contains(queryLower) ||
                game.position.toString().contains(queryLower) ||
                "#${game.position}".contains(queryLower)
            categoryMatch && queryMatch
        }
    }

    inner class CategoryPageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        var currentCategory: String = ""
        private val rvCategoryGames: RecyclerView = itemView.findViewById(R.id.rvCategoryGames)
        private val tvEmptyGames: TextView = itemView.findViewById(R.id.tvEmptyGames)

        val gameAdapter: GameAdapter = GameAdapter(
            onGameClicked = onGameClicked,
            onFavoriteClicked = onFavoriteClicked
        )

        init {
            val gridLayoutManager = GridLayoutManager(itemView.context, GRID_SPAN_COUNT)
            gridLayoutManager.spanSizeLookup = object : GridLayoutManager.SpanSizeLookup() {
                override fun getSpanSize(position: Int): Int {
                    val viewType = gameAdapter.getItemViewType(position)
                    val isFullWidth = viewType == GameAdapter.VIEW_TYPE_NATIVE_AD ||
                        viewType == GameAdapter.VIEW_TYPE_RECENT_ROW
                    return if (isFullWidth) GRID_SPAN_COUNT else 1
                }
            }
            rvCategoryGames.layoutManager = gridLayoutManager
            rvCategoryGames.adapter = gameAdapter
            rvCategoryGames.setHasFixedSize(true)
        }

        fun bind(items: List<GameFeedItem>) {
            gameAdapter.submitList(ArrayList(items))
            tvEmptyGames.visibility = if (items.isEmpty()) View.VISIBLE else View.GONE
        }
    }

    private companion object {
        const val GRID_SPAN_COUNT = 2
    }
}
