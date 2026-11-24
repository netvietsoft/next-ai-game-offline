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
 * Adapter cho kệ ngang "Continue Playing" hiển thị các game người chơi mở gần đây nhất.
 * Horizontal RecyclerView adapter for the "Continue Playing" recent games shelf.
 */
internal class RecentGamesAdapter(
    private val onGameClicked: (GameEntity) -> Unit
) : ListAdapter<GameEntity, RecentGamesAdapter.RecentChipViewHolder>(RecentGameDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecentChipViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_recent_game_chip, parent, false)
        return RecentChipViewHolder(view)
    }

    override fun onBindViewHolder(holder: RecentChipViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class RecentChipViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val ivIcon: ImageView = itemView.findViewById(R.id.ivRecentGameIcon)
        private val tvTitle: TextView = itemView.findViewById(R.id.tvRecentGameTitle)

        fun bind(game: GameEntity) {
            tvTitle.text = game.title
            val iconFileName = game.icon
                ?: GameAdapter.resolveIconFileName(itemView.context, game.name)
            ivIcon.load("file:///android_asset/icons/$iconFileName") {
                crossfade(true)
                placeholder(R.drawable.ic_game_placeholder)
                error(R.drawable.ic_game_placeholder)
            }
            itemView.setOnClickListener {
                onGameClicked(game)
            }
        }
    }

    private class RecentGameDiffCallback : DiffUtil.ItemCallback<GameEntity>() {
        override fun areItemsTheSame(oldItem: GameEntity, newItem: GameEntity): Boolean =
            oldItem.name == newItem.name

        override fun areContentsTheSame(oldItem: GameEntity, newItem: GameEntity): Boolean =
            oldItem == newItem
    }
}
