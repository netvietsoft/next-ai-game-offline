package com.nextai.gameoffline.presentation.gamelist

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil.load
import com.nextai.gameoffline.R
import com.nextai.gameoffline.data.local.entity.GameEntity

/**
 * Adapter hiển thị danh sách Mini-Game dạng lưới 2 cột.
 * RecyclerView Adapter displaying the Mini-Games 2-column grid.
 */
class GameAdapter(
    private val onGameClicked: (GameEntity) -> Unit,
    private val onFavoriteClicked: (GameEntity) -> Unit
) : ListAdapter<GameEntity, GameAdapter.GameViewHolder>(GameDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_game_card, parent, false)
        return GameViewHolder(view)
    }

    override fun onBindViewHolder(holder: GameViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class GameViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val ivIcon: ImageView = itemView.findViewById(R.id.ivGameIcon)
        private val tvTitle: TextView = itemView.findViewById(R.id.tvGameTitle)
        private val tvCategory: TextView = itemView.findViewById(R.id.tvGameCategory)
        private val ivFavorite: ImageView = itemView.findViewById(R.id.ivFavorite)
        private val tvGameBadge: TextView = itemView.findViewById(R.id.tvGameBadge)
        private val layoutDownloadBadge: View = itemView.findViewById(R.id.layoutDownloadBadge)
        private val tvGameSize: TextView = itemView.findViewById(R.id.tvGameSize)

        fun bind(game: GameEntity) {
            tvTitle.text = game.title
            tvCategory.text = game.category
            
            // Hiển thị mã số thứ tự game (#ID) trên thumbnail / Display game index badge (#ID)
            val gameId = if (game.position > 0) game.position else (bindingAdapterPosition + 1)
            tvGameBadge.text = "#$gameId"

            // Trạng thái đã tải về hoặc cần tải từ Cloudflare R2 / Downloaded vs Cloudflare R2 download status
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

    class GameDiffCallback : DiffUtil.ItemCallback<GameEntity>() {
        override fun areItemsTheSame(oldItem: GameEntity, newItem: GameEntity): Boolean {
            return oldItem.name == newItem.name
        }

        override fun areContentsTheSame(oldItem: GameEntity, newItem: GameEntity): Boolean {
            return oldItem == newItem
        }
    }

    companion object {
        private var cachedIconFiles: Set<String>? = null

        fun resolveIconFileName(context: android.content.Context, gameName: String): String {
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
