package com.nextai.gameoffline.presentation.gamelist

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.ImageButton
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.viewpager2.widget.ViewPager2
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayoutMediator
import com.nextai.gameoffline.R
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.ads.AdsConsentManager
import com.nextai.gameoffline.ads.EntitlementAdObserver
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.billing.BillingActivity
import com.nextai.gameoffline.billing.BillingEntitlements
import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.di.appContainer
import com.nextai.gameoffline.notifications.NotificationClickTracker
import com.nextai.gameoffline.presentation.game.GameActivity
import com.nextai.gameoffline.presentation.settings.SettingsDialogController
import kotlinx.coroutines.launch

/**
 * Màn hình trang chủ danh sách Mini-Game (Clean MVVM): Activity mỏng quản lý View, ViewPager2
 * và điều phối các SRP helper ([LauncherBannerHelper], [SearchAnalyticsDebouncer],
 * [GameDownloadDialogController], [SettingsDialogController], [ExitAppDialogController]).
 * Thin MVVM Launcher Activity delegating catalog, recent shelf, offline order, and ads to SRP helpers.
 */
class GameListActivity : AppCompatActivity() {

    private lateinit var viewModel: GameListViewModel
    private lateinit var downloadDialogController: GameDownloadDialogController
    private lateinit var settingsDialogController: SettingsDialogController
    private lateinit var exitAppDialogController: ExitAppDialogController
    private lateinit var launcherBannerHelper: LauncherBannerHelper
    private val searchAnalyticsDebouncer = SearchAnalyticsDebouncer(
        onEmitSearch = { query, count -> GameAnalyticsManager.logGameSearch(query, count) }
    )

    private lateinit var viewPagerGames: ViewPager2
    private lateinit var tabLayout: TabLayout
    private lateinit var etSearch: EditText
    private lateinit var btnRemoveAds: ImageButton
    private lateinit var btnSettings: ImageButton
    private lateinit var categoryPagerAdapter: CategoryPagerAdapter
    private lateinit var bannerAdContainer: ViewGroup

    private val categories = listOf("All", "2 Players", "Puzzle", "Classic", "Arcade", "Casual")
    private var gameTransitionInProgress = false
    private var isResumedForGame = false
    private var pendingGameIntent: Intent? = null

    private val adsReadyListener: () -> Unit = {
        AdManager.onConsentChanged(this)
        if (::launcherBannerHelper.isInitialized) {
            launcherBannerHelper.refreshBanner()
        }
        if (!BillingEntitlements.shouldSuppressAutomaticAds(this) && AdsConsentManager.canRequestAds(this)) {
            AdManager.preloadFullScreenAds(applicationContext)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        NotificationClickTracker.handleIntent(this, intent)
        setContentView(R.layout.activity_game_list)

        viewModel = ViewModelProvider(
            this,
            appContainer.gameListViewModelFactory()
        )[GameListViewModel::class.java]

        initViews()
        launcherBannerHelper = LauncherBannerHelper(
            activity = this,
            bannerContainer = bannerAdContainer,
            onAdsEligibilityChanged = { enabled ->
                if (::categoryPagerAdapter.isInitialized) {
                    categoryPagerAdapter.setAdsEnabled(enabled)
                }
            }
        )
        downloadDialogController = GameDownloadDialogController(
            activity = this,
            startDownload = viewModel::startDownload,
            onPlayReadyGame = ::openGame
        )
        settingsDialogController = SettingsDialogController(
            activity = this,
            onConsentUpdated = { launcherBannerHelper.onConsentUpdated() }
        )
        exitAppDialogController = ExitAppDialogController(this)

        lifecycle.addObserver(
            EntitlementAdObserver(this) {
                if (!isFinishing && !isDestroyed) {
                    launcherBannerHelper.refreshBanner()
                    settingsDialogController.refreshEntitlementIfShowing()
                }
            }
        )

        setupWindowInsets()
        setupViewPagerAndTabs()
        setupSearch()
        setupClickListeners()
        exitAppDialogController.registerBackPressHandler(
            shouldClearSearch = { !etSearch.text.isNullOrEmpty() },
            clearSearch = {
                etSearch.text.clear()
                hideKeyboard()
            },
            onConfirmExit = {
                if (!isFinishing && !isDestroyed) {
                    finish()
                }
            }
        )
        observeViewModel()
        launcherBannerHelper.refreshBanner()
    }

    private fun initViews() {
        viewPagerGames = findViewById(R.id.viewPagerGames)
        tabLayout = findViewById(R.id.tabLayout)
        etSearch = findViewById(R.id.etSearch)
        btnRemoveAds = findViewById(R.id.btnRemoveAds)
        btnSettings = findViewById(R.id.btnSettings)
        bannerAdContainer = findViewById(R.id.bannerAdContainer)
    }

    private fun setupWindowInsets() {
        val rootView = findViewById<View>(R.id.rootGameListLayout)
        ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
            val mask = WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
            val systemBars = insets.getInsets(mask)
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

    private fun observeViewModel() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    val matchCount = categoryPagerAdapter.updateAllGames(
                        allGames = state.allGames,
                        searchQuery = state.searchQuery,
                        recentGames = state.recentGames
                    )
                    if (state.searchQuery.isNotBlank()) {
                        searchAnalyticsDebouncer.onQueryChanged(state.searchQuery, matchCount)
                    } else {
                        searchAnalyticsDebouncer.cancel()
                    }
                }
            }
        }
    }

    private fun setupViewPagerAndTabs() {
        categoryPagerAdapter = CategoryPagerAdapter(
            categories = categories,
            onGameClicked = ::openGame,
            onFavoriteClicked = { game -> viewModel.toggleFavorite(game.name) }
        )
        viewPagerGames.adapter = categoryPagerAdapter
        viewPagerGames.offscreenPageLimit = 1
        ViewPagerDragSensitivityHelper.applyResponsiveSwipeSensitivity(viewPagerGames)

        TabLayoutMediator(tabLayout, viewPagerGames) { tab, position ->
            tab.text = categories[position]
        }.attach()

        viewPagerGames.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                tabLayout.post {
                    val tab = tabLayout.getTabAt(position)
                    if (tab != null && !tab.isSelected) {
                        tab.select()
                    }
                    tabLayout.setScrollPosition(position, 0f, true, true)
                }
            }

            override fun onPageScrollStateChanged(state: Int) {
                super.onPageScrollStateChanged(state)
                if (state == ViewPager2.SCROLL_STATE_DRAGGING) {
                    hideKeyboard()
                }
            }
        })

        TabSwipeGestureHelper.attach(this, tabLayout, viewPagerGames, categories.size)
    }

    private fun hideKeyboard() {
        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager
        val currentFocusView = currentFocus ?: etSearch
        imm?.hideSoftInputFromWindow(currentFocusView.windowToken, 0)
        etSearch.clearFocus()
    }

    private fun setupSearch() {
        val clearButton = findViewById<ImageButton>(R.id.btnClearSearch)
        clearButton.setOnClickListener { etSearch.text.clear() }
        clearButton.visibility = if (etSearch.text.isNullOrEmpty()) View.GONE else View.VISIBLE
        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit

            override fun onTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
                clearButton.visibility = if (s.isNullOrEmpty()) View.GONE else View.VISIBLE
                viewModel.updateSearchQuery(s?.toString().orEmpty())
            }

            override fun afterTextChanged(s: Editable?) = Unit
        })
    }

    private fun setupClickListeners() {
        btnRemoveAds.setOnClickListener {
            startActivity(Intent(this, BillingActivity::class.java))
        }
        btnSettings.setOnClickListener {
            settingsDialogController.show()
        }
    }

    /** Mở game đã cài hoặc hiện ngay hộp thoại tải từ Cloudflare R2. */
    private fun openGame(game: GameEntity) {
        if (gameTransitionInProgress) {
            return
        }
        if (game.isDownloaded != 1) {
            downloadDialogController.show(game)
            return
        }
        gameTransitionInProgress = true
        lifecycleScope.launch {
            val installed = viewModel.isGameReadyToLaunch(game.name)
            if (isFinishing || isDestroyed) {
                return@launch
            }
            if (!installed) {
                gameTransitionInProgress = false
                if (isResumedForGame) {
                    downloadDialogController.show(game)
                }
                return@launch
            }

            val intent = Intent(this@GameListActivity, GameActivity::class.java).apply {
                putExtra(GameActivity.EXTRA_GAME_NAME, game.name)
                putExtra(GameActivity.EXTRA_IS_HORIZONTAL, game.isHorizontal)
            }
            AdManager.recordInterstitialUserAction()
            if (isResumedForGame) {
                AdManager.showInterstitialAd(this@GameListActivity, game.name) { _ ->
                    launchGameWhenResumed(intent)
                }
            } else {
                launchGameWhenResumed(intent)
            }
        }
    }

    private fun launchGameWhenResumed(intent: Intent) {
        if (isFinishing || isDestroyed) {
            return
        }
        if (!isResumedForGame) {
            pendingGameIntent = intent
            return
        }
        pendingGameIntent = null
        gameTransitionInProgress = false
        startActivity(intent)
    }

    override fun onStart() {
        super.onStart()
        AdsConsentManager.addReadyListener(adsReadyListener)
    }

    override fun onStop() {
        AdsConsentManager.removeReadyListener(adsReadyListener)
        super.onStop()
    }

    override fun onResume() {
        super.onResume()
        isResumedForGame = true
        pendingGameIntent?.let(::launchGameWhenResumed)
        viewModel.refreshNetworkState()
        AdsConsentManager.refreshConsentIfNeeded(this)
        AdManager.preloadFullScreenAds(applicationContext)
        launcherBannerHelper.onResume()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        NotificationClickTracker.handleIntent(this, intent)
    }

    override fun onPause() {
        isResumedForGame = false
        launcherBannerHelper.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        searchAnalyticsDebouncer.cancel()
        exitAppDialogController.dismiss()
        settingsDialogController.dismiss()
        if (::categoryPagerAdapter.isInitialized) {
            categoryPagerAdapter.releaseAllNativeAds()
        }
        launcherBannerHelper.destroy()
        super.onDestroy()
    }
}
