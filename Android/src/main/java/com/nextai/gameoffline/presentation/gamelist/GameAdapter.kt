package com.nextai.gameoffline.presentation.gamelist

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil.load
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdView
import com.nextai.gameoffline.R
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.ads.NativeAdViewBinder
import com.nextai.gameoffline.data.local.entity.GameEntity

/**
 * Adapter hiển thị lưới 2 cột Mini-Game kết hợp kệ ngang "Continue Playing" và thẻ Native Ad In-Feed.
 * RecyclerView Adapter rendering the Continue Playing shelf, 2-column game cards, and Native Ads.
 */
class GameAdapter(
    private val onGameClicked: (GameEntity) -> Unit,
    private val onFavoriteClicked: (GameEntity) -> Unit
) : ListAdapter<GameFeedItem, RecyclerView.ViewHolder>(GameFeedDiffCallback()) {

    private val activeNativeHolders = mutableSetOf<NativeAdViewHolder>()

    override fun getItemViewType(position: Int): Int {
        return when (getItem(position)) {
            is GameFeedItem.GameCard -> VIEW_TYPE_GAME
            is GameFeedItem.NativeAdSlot -> VIEW_TYPE_NATIVE_AD
            is GameFeedItem.RecentGamesShelf -> VIEW_TYPE_RECENT_ROW
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return when (viewType) {
            VIEW_TYPE_NATIVE_AD -> {
                val view = inflater.inflate(R.layout.layout_native_ad_feed, parent, false)
                NativeAdViewHolder(view)
            }
            VIEW_TYPE_RECENT_ROW -> {
                val view = inflater.inflate(R.layout.item_recent_games_row, parent, false)
                RecentGamesRowViewHolder(view)
            }
            else -> {
                val view = inflater.inflate(R.layout.item_game_card, parent, false)
                GameViewHolder(view)
            }
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val item = getItem(position)) {
            is GameFeedItem.GameCard -> (holder as GameViewHolder).bind(item.game)
            is GameFeedItem.RecentGamesShelf -> (holder as RecentGamesRowViewHolder).bind(item.games)
            is GameFeedItem.NativeAdSlot -> {
                val adHolder = holder as NativeAdViewHolder
                activeNativeHolders.add(adHolder)
                adHolder.bind(item.slotId)
            }
        }
    }

    override fun onViewRecycled(holder: RecyclerView.ViewHolder) {
        super.onViewRecycled(holder)
        if (holder is NativeAdViewHolder) {
            holder.releaseAd()
            activeNativeHolders.remove(holder)
        }
    }

    /** Giải phóng toàn bộ Native Ad đang gắn trên màn hình khi hủy trang hoặc nâng cấp VIP. */
    fun releaseAllNativeAds() {
        val holders = activeNativeHolders.toList()
        activeNativeHolders.clear()
        holders.forEach(NativeAdViewHolder::releaseAd)
    }

    inner class RecentGamesRowViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val rvRecentGames: RecyclerView = itemView.findViewById(R.id.rvRecentGames)
        private val recentAdapter = RecentGamesAdapter(onGameClicked)

        init {
            rvRecentGames.layoutManager = LinearLayoutManager(
                itemView.context,
                LinearLayoutManager.HORIZONTAL,
                false
            )
            rvRecentGames.adapter = recentAdapter
            rvRecentGames.isNestedScrollingEnabled = false
        }

        fun bind(games: List<GameEntity>) {
            recentAdapter.submitList(games)
        }
    }

    inner class GameViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val ivIcon: ImageView = itemView.findViewById(R.id.ivGameIcon)
        private val tvTitle: TextView = itemView.findViewById(R.id.tvGameTitle)
        private val tvCategory: TextView = itemView.findViewById(R.id.tvGameCategory)
        private val ivFavorite: ImageView = itemView.findViewById(R.id.ivFavorite)
        private val tvGameBadge: TextView = itemView.findViewById(R.id.tvGameBadge)
        private val tvHotBadge: TextView = itemView.findViewById(R.id.tvHotBadge)
        private val layoutDownloadBadge: View = itemView.findViewById(R.id.layoutDownloadBadge)
        private val tvGameSize: TextView = itemView.findViewById(R.id.tvGameSize)

        fun bind(game: GameEntity) {
            tvTitle.text = game.title
            tvCategory.text = game.category

            // Hiển thị mã số thứ tự game (#ID) và nhãn HOT cho Top 15 game dẫn đầu GA4.
            // Display #ID badge and HOT pill for the top 15 GA4-ranked games.
            val gameId = if (game.position > 0) game.position else (bindingAdapterPosition + 1)
            tvGameBadge.text = "#$gameId"
            tvHotBadge.visibility = if (GameFeedMerger.isHotGame(game)) View.VISIBLE else View.GONE

            // Trạng thái đã tải về hoặc cần tải từ Cloudflare R2 / Downloaded vs R2 download status
            if (game.isDownloaded == 1) {
                layoutDownloadBadge.visibility = View.GONE
            } else {
                layoutDownloadBadge.visibility = View.VISIBLE
                val size = if (game.sizeMb > 0) game.sizeMb else 2.5
                tvGameSize.text = String.format("%.1f MB", size)
            }

            // Nạp icon thumbnail từ assets cục bộ / Load local thumbnail icon
            val iconFileName = game.icon ?: resolveIconFileName(itemView.context, game.name)
            val iconPath = "file:///android_asset/icons/$iconFileName"
            ivIcon.load(iconPath) {
                crossfade(true)
                placeholder(R.drawable.ic_game_placeholder)
                error(R.drawable.ic_game_placeholder)
            }

            itemView.setOnClickListener {
                onGameClicked(game)
            }

            ivFavorite.setOnClickListener {
                onFavoriteClicked(game)
            }
        }
    }

    inner class NativeAdViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val nativeAdView: NativeAdView = itemView.findViewById(R.id.nativeAdView)
        private var boundSlotId: String? = null
        private var boundNativeAd: NativeAd? = null
        private var bindGeneration: Int = 0

        fun bind(slotId: String) {
            if (boundSlotId == slotId && boundNativeAd != null) {
                nativeAdView.visibility = View.VISIBLE
                return
            }

            releaseAd()
            boundSlotId = slotId
            val currentGen = ++bindGeneration

            AdManager.acquireNativeAd(itemView.context) { nativeAd ->
                if (nativeAd == null) {
                    if (bindGeneration == currentGen) {
                        nativeAdView.visibility = View.GONE
                    }
                    return@acquireNativeAd
                }
                if (bindGeneration != currentGen || boundSlotId != slotId) {
                    AdManager.releaseNativeAd(nativeAd)
                    return@acquireNativeAd
                }
                boundNativeAd = nativeAd
                NativeAdViewBinder.bind(nativeAdView, nativeAd)
                nativeAdView.visibility = View.VISIBLE
            }
        }

        fun releaseAd() {
            bindGeneration++
            boundSlotId = null
            nativeAdView.visibility = View.GONE
            AdManager.releaseNativeAd(boundNativeAd)
            boundNativeAd = null
        }
    }

    class GameFeedDiffCallback : DiffUtil.ItemCallback<GameFeedItem>() {
        override fun areItemsTheSame(oldItem: GameFeedItem, newItem: GameFeedItem): Boolean {
            return when {
                oldItem is GameFeedItem.GameCard && newItem is GameFeedItem.GameCard ->
                    oldItem.game.name == newItem.game.name
                oldItem is GameFeedItem.NativeAdSlot && newItem is GameFeedItem.NativeAdSlot ->
                    oldItem.slotId == newItem.slotId
                oldItem is GameFeedItem.RecentGamesShelf &&
                    newItem is GameFeedItem.RecentGamesShelf -> true
                else -> false
            }
        }

        override fun areContentsTheSame(oldItem: GameFeedItem, newItem: GameFeedItem): Boolean {
            return oldItem == newItem
        }
    }

    companion object {
        const val VIEW_TYPE_GAME = 0
        const val VIEW_TYPE_NATIVE_AD = 1
        const val VIEW_TYPE_RECENT_ROW = 2

        private var cachedIconFiles: Set<String>? = null

        fun resolveIconFileName(context: Context, gameName: String): String {
            if (cachedIconFiles == null) {
                cachedIconFiles = try {
                    context.assets.list("icons")?.toSet() ?: emptySet()
                } catch (e: Exception) {
                    emptySet()
                }
            }
            val files = cachedIconFiles ?: emptySet()
            return when {
                files.contains("$gameName.webp") -> "$gameName.webp"
                files.contains("$gameName.png") -> "$gameName.png"
                files.contains("$gameName.jpg") -> "$gameName.jpg"
                else -> "$gameName.png"
            }
        }
    }
}
