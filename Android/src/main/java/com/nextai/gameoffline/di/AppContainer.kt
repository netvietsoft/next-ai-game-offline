package com.nextai.gameoffline.di

import android.app.Application
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.nextai.gameoffline.GameApplication
import com.nextai.gameoffline.ads.AppOpenLifecycleObserver
import com.nextai.gameoffline.billing.BillingEntitlementMonitor
import com.nextai.gameoffline.billing.PaywallViewModel
import com.nextai.gameoffline.billing.PlayBillingRepository
import com.nextai.gameoffline.data.local.AppDatabase
import com.nextai.gameoffline.data.remote.NetworkConnectivityChecker
import com.nextai.gameoffline.data.repository.DefaultGameCatalogRepository
import com.nextai.gameoffline.data.repository.RoomGameStatsRepository
import com.nextai.gameoffline.domain.repository.BillingRepository
import com.nextai.gameoffline.domain.repository.GameCatalogRepository
import com.nextai.gameoffline.domain.repository.GameStatsRepository
import com.nextai.gameoffline.presentation.game.GameViewModel
import com.nextai.gameoffline.presentation.gamelist.GameListViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

/**
 * Container tiêm phụ thuộc (Constructor Dependency Injection) tập trung cho toàn ứng dụng,
 * thay thế hoàn toàn Service Locator `GameApplication.instance`.
 * Centralized manual DI container replacing the `GameApplication.instance` service locator.
 */
class AppContainer(application: Application) {

    private val appContext: Context = application.applicationContext

    val applicationScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    val database: AppDatabase by lazy {
        AppDatabase.getDatabase(application, applicationScope)
    }

    val gameCatalogRepository: GameCatalogRepository by lazy {
        DefaultGameCatalogRepository(application, database.gamesDao())
    }

    val gameStatsRepository: GameStatsRepository by lazy {
        RoomGameStatsRepository(application, database.userStatsDao())
    }

    val billingRepository: BillingRepository by lazy {
        PlayBillingRepository(application)
    }

    val billingEntitlementMonitor: BillingEntitlementMonitor by lazy {
        BillingEntitlementMonitor(billingRepository)
    }

    val appOpenLifecycleObserver: AppOpenLifecycleObserver by lazy {
        AppOpenLifecycleObserver()
    }

    /** Factory tạo [GameListViewModel] với repository và kiểm tra mạng được tiêm qua constructor. */
    fun gameListViewModelFactory(): ViewModelProvider.Factory {
        return simpleFactory {
            GameListViewModel(
                catalogRepository = gameCatalogRepository,
                statsRepository = gameStatsRepository,
                networkAvailableProvider = { NetworkConnectivityChecker.isNetworkAvailable(appContext) }
            )
        }
    }

    /** Factory tạo [GameViewModel] cho một trò chơi cụ thể. */
    fun gameViewModelFactory(gameName: String): ViewModelProvider.Factory {
        return simpleFactory {
            GameViewModel(
                gameName = gameName,
                catalogRepository = gameCatalogRepository,
                statsRepository = gameStatsRepository
            )
        }
    }

    /** Factory tạo [PaywallViewModel] gắn vào [billingRepository] duy nhất toàn ứng dụng. */
    fun paywallViewModelFactory(): ViewModelProvider.Factory {
        return simpleFactory {
            PaywallViewModel(billingRepository = billingRepository)
        }
    }

    private fun <T : ViewModel> simpleFactory(creator: () -> T): ViewModelProvider.Factory {
        return object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <VM : ViewModel> create(modelClass: Class<VM>): VM {
                return creator() as VM
            }
        }
    }
}

/**
 * Tiện ích lấy [AppContainer] từ `Context.applicationContext` thay cho truy cập static singleton.
 * Extension resolving [AppContainer] from any Android `Context` without a static singleton.
 */
val Context.appContainer: AppContainer
    get() = (applicationContext as GameApplication).appContainer
