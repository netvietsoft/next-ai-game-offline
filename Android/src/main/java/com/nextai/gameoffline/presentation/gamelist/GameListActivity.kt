package com.nextai.gameoffline.presentation.gamelist

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.ViewGroup
import android.view.Window
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat
import androidx.lifecycle.lifecycleScope
import androidx.viewpager2.widget.ViewPager2
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayoutMediator
import kotlin.math.abs
import com.nextai.gameoffline.GameApplication
import com.nextai.gameoffline.R
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.billing.BillingActivity
import com.nextai.gameoffline.billing.BillingConstants
import com.nextai.gameoffline.data.local.AppDatabase
import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.presentation.game.GameActivity
import com.nextai.gameoffline.presentation.settings.GameSettingsManager
import com.nextai.gameoffline.presentation.settings.LegalPolicyHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Màn hình trang chủ danh sách Mini-Game (Home Launcher Screen).
 * Main Launcher Activity displaying the searchable, filterable 2-column game grid
 * with horizontal swipeable category tabs using ViewPager2 and TabLayoutMediator.
 */
class GameListActivity : AppCompatActivity() {

    private lateinit var viewPagerGames: ViewPager2
    private lateinit var tabLayout: TabLayout
    private lateinit var etSearch: EditText
    private lateinit var btnRemoveAds: ImageButton
    private lateinit var btnSettings: ImageButton
    private lateinit var categoryPagerAdapter: CategoryPagerAdapter

    // Danh sách toàn bộ các danh mục game hỗ trợ vuốt chuyển / Categories supported for horizontal swiping
    private val categories = listOf("All", "2 Players", "Puzzle", "Classic", "Arcade", "Casual")

    private var masterGamesList: List<GameEntity> = emptyList()
    private var currentSearchQuery: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game_list)

        initViews()
        setupWindowInsets()
        setupViewPagerAndTabs()
        setupSearch()
        setupClickListeners()

        // Tải danh sách game từ Room Database / Observe games from Room DB
        observeGames()

        // Khởi tạo và nạp quảng cáo Banner ở đáy / Load bottom banner ad
        AdManager.initBannerAd(this, findViewById(R.id.bannerAdContainer))
    }

    /**
     * Cấu hình WindowInsets thích ứng chuẩn Android 15 (API 35 Edge-to-Edge).
     * Configure WindowInsets for Android 15 (API 35 Edge-to-Edge) so top header bar and
     * bottom banner gracefully avoid status bar, notch cutouts and gesture navigation pills.
     */
    private fun setupWindowInsets() {
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.rootGameListLayout)) { _, insets ->
            val systemBars = insets.getInsets(
                androidx.core.view.WindowInsetsCompat.Type.systemBars() or 
                androidx.core.view.WindowInsetsCompat.Type.displayCutout()
            )
            val header = findViewById<View>(R.id.headerLayout)
            val banner = findViewById<View>(R.id.bannerAdContainer)

            val density = resources.displayMetrics.density
            val padH = (16 * density).toInt()
            val padV = (8 * density).toInt()

            header.setPadding(padH, systemBars.top + padV, padH, padV)
            banner.setPadding(banner.paddingLeft, banner.paddingTop, banner.paddingRight, systemBars.bottom)

            insets
        }
    }

    private fun initViews() {
        viewPagerGames = findViewById(R.id.viewPagerGames)
        tabLayout = findViewById(R.id.tabLayout)
        etSearch = findViewById(R.id.etSearch)
        btnRemoveAds = findViewById(R.id.btnRemoveAds)
        btnSettings = findViewById(R.id.btnSettings)
    }

    /**
     * Thiết lập ViewPager2 và kết nối TabLayout thông qua TabLayoutMediator.
     * Cho phép người dùng vuốt màn hình sang trái / phải để chuyển đổi danh mục game tự động.
     *
     * Setup ViewPager2 and attach TabLayout via TabLayoutMediator.
     * Enables automatic category switching by swiping left / right on the screen.
     */
    private fun setupViewPagerAndTabs() {
        categoryPagerAdapter = CategoryPagerAdapter(
            categories = categories,
            onGameClicked = { game -> openGame(game) },
            onFavoriteClicked = { game -> toggleFavorite(game) }
        )
        viewPagerGames.adapter = categoryPagerAdapter

        // Giữ toàn bộ các trang danh mục trong bộ nhớ để vuốt mượt mà 60fps không giật lag
        // Preload all category pages in memory for buttery-smooth 60fps instant swiping
        viewPagerGames.offscreenPageLimit = categories.size

        // Tối ưu độ nhạy vuốt ngang của ViewPager2 giúp vuốt nhẹ là chuyển tab mượt mà
        // Optimize ViewPager2 drag sensitivity for responsive and effortless tab swiping
        optimizeViewPagerDragSensitivity(viewPagerGames)

        TabLayoutMediator(tabLayout, viewPagerGames) { tab, position ->
            tab.text = getCategoryDisplayName(categories[position])
        }.attach()

        // Lắng nghe sự kiện chuyển trang để đảm bảo TabLayout tự động cuộn tab vào trung tâm
        // Register page change callback to ensure TabLayout auto-scrolls selected tab into center
        viewPagerGames.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                tabLayout.post {
                    val tab = tabLayout.getTabAt(position)
                    if (tab != null && !tab.isSelected) {
                        tab.select()
                    }
                    // Tự động cuộn mượt mà tab được chọn vào giữa thanh menu
                    // Smoothly scroll the selected tab into the center of the menu bar
                    tabLayout.setScrollPosition(position, 0f, true, true)
                }
            }

            override fun onPageScrollStateChanged(state: Int) {
                super.onPageScrollStateChanged(state)
                // Khi người dùng vuốt danh sách, tự động ẩn bàn phím nếu đang mở tìm kiếm
                // When user swipes, auto hide keyboard if search is active
                if (state == ViewPager2.SCROLL_STATE_DRAGGING) {
                    hideKeyboard()
                }
            }
        })

        // Hỗ trợ thêm thao tác vuốt trực tiếp trên thanh menu TabLayout
        // Also support direct swipe gesture on the TabLayout menu bar
        setupTabMenuSwipeGesture()
    }

    /**
     * Bổ sung tính năng vuốt trực tiếp trên thanh menu TabLayout.
     * Cho phép vuốt sang trái để chuyển tab tiếp theo, vuốt sang phải để lùi về tab trước.
     *
     * Add direct swipe gesture support on the TabLayout menu bar itself.
     * Allows swiping left to switch to next tab, and swiping right to switch to previous tab.
     */
    @SuppressLint("ClickableViewAccessibility")
    private fun setupTabMenuSwipeGesture() {
        val gestureDetector = GestureDetector(this, object : GestureDetector.SimpleOnGestureListener() {
            private val minDistance = 50
            private val minVelocity = 80

            override fun onFling(
                e1: MotionEvent?,
                e2: MotionEvent,
                velocityX: Float,
                velocityY: Float
            ): Boolean {
                if (e1 == null) return false
                val diffX = e2.x - e1.x
                val diffY = e2.y - e1.y
                if (abs(diffX) > abs(diffY) && abs(diffX) > minDistance && abs(velocityX) > minVelocity) {
                    if (diffX < 0) {
                        // Vuốt sang trái: Chuyển sang tab tiếp theo bên phải
                        // Swipe left: Switch to next category tab on the right
                        val nextPos = viewPagerGames.currentItem + 1
                        if (nextPos < categories.size) {
                            viewPagerGames.setCurrentItem(nextPos, true)
                            return true
                        }
                    } else {
                        // Vuốt sang phải: Chuyển về tab trước đó bên trái
                        // Swipe right: Switch to previous category tab on the left
                        val prevPos = viewPagerGames.currentItem - 1
                        if (prevPos >= 0) {
                            viewPagerGames.setCurrentItem(prevPos, true)
                            return true
                        }
                    }
                }
                return false
            }
        })

        tabLayout.setOnTouchListener { _, event ->
            gestureDetector.onTouchEvent(event)
            false // Cho phép TabLayout vẫn xử lý cuộn và click tab bình thường
        }
    }

    /**
     * Ẩn bàn phím ảo và huỷ con trỏ trên thanh tìm kiếm.
     * Hide soft keyboard and clear search edit text focus.
     */
    private fun hideKeyboard() {
        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager
        val currentFocusView = currentFocus ?: etSearch
        imm?.hideSoftInputFromWindow(currentFocusView.windowToken, 0)
        etSearch.clearFocus()
    }

    /**
     * Tối ưu hóa độ nhạy cử chỉ vuốt ngang cho ViewPager2.
     * Optimize horizontal swipe sensitivity for ViewPager2 by tuning the internal touch slop.
     */
    private fun optimizeViewPagerDragSensitivity(viewPager: ViewPager2) {
        try {
            val recyclerViewField = ViewPager2::class.java.getDeclaredField("mRecyclerView")
            recyclerViewField.isAccessible = true
            val recyclerView = recyclerViewField.get(viewPager) as? androidx.recyclerview.widget.RecyclerView ?: return

            val touchSlopField = androidx.recyclerview.widget.RecyclerView::class.java.getDeclaredField("mTouchSlop")
            touchSlopField.isAccessible = true
            val standardTouchSlop = ViewConfiguration.get(viewPager.context).scaledTouchSlop
            // Giảm ngưỡng chạm để bắt vuốt ngang nhạy bén và mượt mà hơn
            // Lower touch slop for snappy, effortless horizontal swiping
            touchSlopField.set(recyclerView, (standardTouchSlop * 0.5f).toInt().coerceAtLeast(1))
        } catch (_: Exception) {
            // Bỏ qua nếu môi trường hạn chế reflection / Gracefully ignore if reflection fails
        }
    }

    /**
     * Lấy tên hiển thị tiếng Anh chuẩn cho từng danh mục tab.
     * Get English display label for category tabs.
     */
    private fun getCategoryDisplayName(category: String): String {
        return when (category) {
            "All" -> "All"
            "2 Players" -> "2 Players"
            "Puzzle" -> "Puzzle"
            "Classic" -> "Classic"
            "Arcade" -> "Arcade"
            "Casual" -> "Casual"
            else -> category
        }
    }

    private fun setupSearch() {
        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
                currentSearchQuery = s?.toString()?.trim() ?: ""
                categoryPagerAdapter.updateAllGames(masterGamesList, currentSearchQuery)
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun setupClickListeners() {
        btnRemoveAds.setOnClickListener {
            // Mở màn hình Paywall IAP / Open IAP Paywall
            startActivity(Intent(this, BillingActivity::class.java))
        }

        btnSettings.setOnClickListener {
            // Hiển thị Dialog Cài đặt (Âm thanh, Nhạc, Rung, Xóa Cache, VIP) / Show settings dialog
            showSettingsDialog()
        }
    }

    private fun observeGames() {
        lifecycleScope.launch(Dispatchers.IO) {
            val gamesDao = GameApplication.instance.database.gamesDao()
            // Đảm bảo dữ liệu 423 mini-game luôn được nạp đầy đủ vào database khi mở app
            // Guarantee 423 mini-games catalog is immediately seeded if database is empty
            if (gamesDao.getGamesCount() == 0) {
                AppDatabase.populateGamesCatalogDirect(applicationContext, gamesDao)
            }
            gamesDao.getAllGames().collectLatest { allGames ->
                masterGamesList = allGames
                withContext(Dispatchers.Main) {
                    categoryPagerAdapter.updateAllGames(allGames, currentSearchQuery)
                }
            }
        }
    }

    private fun openGame(game: GameEntity) {
        if (game.isDownloaded == 1 || com.nextai.gameoffline.data.remote.GameDownloadManager.isGameInstalled(this, game.name)) {
            val intent = Intent(this, GameActivity::class.java).apply {
                putExtra(GameActivity.EXTRA_GAME_NAME, game.name)
                putExtra(GameActivity.EXTRA_IS_HORIZONTAL, game.isHorizontal)
            }
            startActivity(intent)
        } else {
            showDownloadGameDialog(game)
        }
    }

    /**
     * Hiển thị hộp thoại xác nhận tải game mở rộng từ Cloudflare R2.
     * Show confirmation dialog to download game on-demand from Cloudflare R2.
     */
    private fun showDownloadGameDialog(game: GameEntity) {
        val sizeStr = String.format("%.1f MB", if (game.sizeMb > 0) game.sizeMb else 2.5)
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle(game.title)
            .setMessage("Trò chơi này nằm trong kho mở rộng Cloudflare R2 ($sizeStr).\n\nBạn có muốn tải về máy để chơi ngoại tuyến không?")
            .setPositiveButton("Tải ngay ($sizeStr)") { dialog, _ ->
                dialog.dismiss()
                startDownloadingGame(game)
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    /**
     * Bắt đầu tải tệp ZIP từ Cloudflare R2 và giải nén tự động.
     * Start downloading ZIP package from Cloudflare R2 with progress UI.
     */
    private fun startDownloadingGame(game: GameEntity) {
        val dialogView = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(50, 40, 50, 20)
        }
        val tvStatus = TextView(this).apply {
            text = "Đang kết nối tới máy chủ Cloudflare R2..."
            textSize = 14f
            setPadding(0, 0, 0, 20)
        }
        val progressBar = android.widget.ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            isIndeterminate = false
            max = 100
            progress = 0
        }
        dialogView.addView(tvStatus)
        dialogView.addView(progressBar)

        val progressDialog = androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Đang tải ${game.title}...")
            .setView(dialogView)
            .setCancelable(false)
            .create()

        progressDialog.show()

        lifecycleScope.launch(Dispatchers.IO) {
            com.nextai.gameoffline.data.remote.GameDownloadManager.downloadAndExtractGame(
                context = applicationContext,
                game = game,
                onProgress = { progress ->
                    progressBar.progress = progress
                    tvStatus.text = "Đang tải dữ liệu từ R2: $progress%"
                },
                onSuccess = {
                    progressDialog.dismiss()
                    Toast.makeText(this@GameListActivity, "Đã tải xong ${game.title}!", Toast.LENGTH_SHORT).show()
                    game.isDownloaded = 1
                    categoryPagerAdapter.notifyDataSetChanged()
                    openGame(game)
                },
                onError = { errorMsg ->
                    progressDialog.dismiss()
                    androidx.appcompat.app.AlertDialog.Builder(this@GameListActivity)
                        .setTitle("Không thể tải game")
                        .setMessage("Lỗi: $errorMsg\n\n(Gói game đang được đưa lên Cloudflare R2. Vui lòng thử lại sau khi kho R2 sẵn sàng.)")
                        .setPositiveButton("Đã hiểu", null)
                        .show()
                }
            )
        }
    }

    private fun toggleFavorite(game: GameEntity) {
        lifecycleScope.launch(Dispatchers.IO) {
            GameApplication.instance.database.userStatsDao().toggleFavorite(game.name)
        }
    }

    /**
     * Hiển thị bảng điều khiển cài đặt của trò chơi (Âm thanh, Nhạc nền, Rung, VIP, Bộ nhớ đệm).
     * Show game settings dialog (Sound Effects, Background Music, Haptics, VIP status, Cache clearance).
     */
    private fun showSettingsDialog() {
        val dialog = Dialog(this, R.style.Theme_NextAIGameOffline_Dialog)
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.dialog_settings)

        // Đặt nền trong suốt để viền bo tròn bg_dialog_rounded hiển thị chuẩn xác
        // Set transparent window background so rounded corners render cleanly
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.90).toInt(),
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        val switchMasterGameSound = dialog.findViewById<SwitchCompat>(R.id.switchMasterGameSound)
        val switchSound = dialog.findViewById<SwitchCompat>(R.id.switchSound)
        val switchMusic = dialog.findViewById<SwitchCompat>(R.id.switchMusic)
        val switchHaptic = dialog.findViewById<SwitchCompat>(R.id.switchHaptic)
        val layoutVipUpgrade = dialog.findViewById<View>(R.id.layoutVipUpgrade)
        val tvVipTitle = dialog.findViewById<TextView>(R.id.tvVipTitle)
        val tvVipSubtitle = dialog.findViewById<TextView>(R.id.tvVipSubtitle)
        val layoutRateGame = dialog.findViewById<View>(R.id.layoutRateGame)
        val layoutPrivacyPolicy = dialog.findViewById<View>(R.id.layoutPrivacyPolicy)
        val layoutTermsOfService = dialog.findViewById<View>(R.id.layoutTermsOfService)
        val layoutClearCache = dialog.findViewById<View>(R.id.layoutClearCache)
        val btnClose = dialog.findViewById<ImageButton>(R.id.btnCloseSettings)

        // Cập nhật trạng thái switch hiện tại / Populate current switch states
        switchMasterGameSound?.isChecked = GameSettingsManager.isGameAudioMuted(this)
        switchSound?.isChecked = GameSettingsManager.isSoundEnabled(this)
        switchMusic?.isChecked = GameSettingsManager.isMusicEnabled(this)
        switchHaptic?.isChecked = GameSettingsManager.isHapticEnabled(this)

        switchMasterGameSound?.setOnCheckedChangeListener { _, isChecked ->
            GameSettingsManager.setGameAudioMuted(this, isChecked)
        }
        switchSound?.setOnCheckedChangeListener { _, isChecked ->
            GameSettingsManager.setSoundEnabled(this, isChecked)
        }
        switchMusic?.setOnCheckedChangeListener { _, isChecked ->
            GameSettingsManager.setMusicEnabled(this, isChecked)
        }
        switchHaptic?.setOnCheckedChangeListener { _, isChecked ->
            GameSettingsManager.setHapticEnabled(this, isChecked)
        }

        // Đánh giá 5 sao trên Google Play / Rate Game 5 Stars
        layoutRateGame?.setOnClickListener {
            LegalPolicyHelper.rateGame(this)
        }

        // Chính sách quyền riêng tư / Privacy Policy
        layoutPrivacyPolicy?.setOnClickListener {
            LegalPolicyHelper.showPrivacyPolicyDialog(this)
        }

        // Điều khoản dịch vụ / Terms of Service
        layoutTermsOfService?.setOnClickListener {
            LegalPolicyHelper.showTermsOfServiceDialog(this)
        }

        // Kiểm tra trạng thái VIP / Check VIP entitlement
        val isVip = getSharedPreferences("nextai_billing_prefs", MODE_PRIVATE)
            .getBoolean(BillingConstants.PREF_IS_PREMIUM_USER, false)
        if (isVip) {
            tvVipTitle.text = getString(R.string.settings_vip_active)
            tvVipSubtitle.text = getString(R.string.premium_benefits)
        }

        layoutVipUpgrade.setOnClickListener {
            dialog.dismiss()
            startActivity(Intent(this, BillingActivity::class.java))
        }

        layoutClearCache.setOnClickListener {
            GameSettingsManager.clearCache(this) {
                runOnUiThread {
                    Toast.makeText(this, getString(R.string.settings_cache_cleared), Toast.LENGTH_SHORT).show()
                }
            }
        }

        btnClose.setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
    }
}
