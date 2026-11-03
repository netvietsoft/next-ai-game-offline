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
 * Adapter for ViewPager2 enabling smooth horizontal swiping across game categories.
 *
 * Mỗi trang đại diện cho một danh mục (Tất cả, 2 Người, Giải đố, Cổ điển, Arcade, Phổ thông)
 * với lưới RecyclerView 2 cột hiển thị các mini-game.
 *
 * Each page represents a category (All, 2 Players, Puzzle, Classic, Arcade, Casual)
 * containing a 2-column GridLayout RecyclerView of games.
 */
class CategoryPagerAdapter(
    private val categories: List<String>,
    private val onGameClicked: (GameEntity) -> Unit,
    private val onFavoriteClicked: (GameEntity) -> Unit
) : RecyclerView.Adapter<CategoryPagerAdapter.CategoryPageViewHolder>() {

    // Lưu trữ danh sách game cho từng danh mục / Cache game lists per category
    private val categoryGamesMap = mutableMapOf<String, List<GameEntity>>()

    // Giữ tham chiếu các ViewHolder đang hiển thị để cập nhật tức thì khi lọc hoặc tìm kiếm
    // Set of active ViewHolders currently attached for instant reactive updates
    private val activeHolders = mutableSetOf<CategoryPageViewHolder>()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CategoryPageViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_category_page, parent, false)
        return CategoryPageViewHolder(view)
    }

    override fun onBindViewHolder(holder: CategoryPageViewHolder, position: Int) {
        val category = categories[position]
        holder.currentCategory = category
        holder.bind(categoryGamesMap[category] ?: emptyList())
        activeHolders.add(holder)
    }

    override fun onViewRecycled(holder: CategoryPageViewHolder) {
        super.onViewRecycled(holder)
        activeHolders.remove(holder)
    }

    override fun getItemCount(): Int = categories.size

    /**
     * Cập nhật danh sách game cho một danh mục cụ thể.
     * Update the game list for a specific category.
     */
    fun updateCategoryGames(category: String, games: List<GameEntity>) {
        categoryGamesMap[category] = games
        for (holder in activeHolders) {
            if (holder.currentCategory == category) {
                holder.bind(games)
            }
        }
    }

    /**
     * Cập nhật toàn bộ các danh mục dựa trên danh sách game tổng hợp.
     * Update all category pages from the complete master game list.
     */
    fun updateAllGames(allGames: List<GameEntity>, searchQuery: String = "") {
        for (category in categories) {
            val filtered = if (searchQuery.isNotEmpty()) {
                val q = searchQuery.lowercase()
                allGames.filter { game ->
                    (category == "All" || game.category.equals(category, ignoreCase = true)) &&
                            (game.title.lowercase().contains(q) ||
                                    game.name.lowercase().contains(q) ||
                                    game.position.toString().contains(q) ||
                                    "#${game.position}".contains(q))
                }
            } else {
                if (category == "All") {
                    allGames
                } else {
                    allGames.filter { it.category.equals(category, ignoreCase = true) }
                }
            }
            updateCategoryGames(category, filtered)
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
            rvCategoryGames.layoutManager = GridLayoutManager(itemView.context, 2)
            rvCategoryGames.adapter = gameAdapter
            rvCategoryGames.setHasFixedSize(true)
        }

        fun bind(games: List<GameEntity>) {
            gameAdapter.submitList(ArrayList(games))
            tvEmptyGames.visibility = if (games.isEmpty()) View.VISIBLE else View.GONE
        }
    }
}
