package com.nextai.gameoffline.data.remote

import android.content.Context
import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.di.appContainer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/**
 * Điều phối tiến trình tải gói game từ R2 trong vòng đời tiến trình mà không giữ Activity.
 * Coordinates on-demand R2 downloads across the process lifetime without retaining Activities.
 */
object GameDownloadCoordinator {

    /** Trạng thái thực của gói tải / Actual package transfer state. */
    sealed interface State {
        data object Preparing : State
        data object Connecting : State
        data class Downloading(val bytes: Long, val totalBytes: Long) : State {
            val percent: Int
                get() = ((bytes * 100L) / totalBytes).toInt().coerceIn(0, 100)
        }
        data object Installing : State
        data object Complete : State
        data class Failed(val message: String) : State
    }

    private val downloads = mutableMapOf<String, MutableStateFlow<State>>()

    /**
     * Bắt đầu hoặc gắn vào tiến trình tải một lần cho mỗi game thông qua [com.nextai.gameoffline.di.AppContainer].
     * Starts or reuses one active download flow per game using `context.appContainer`.
     */
    @Synchronized
    fun start(context: Context, game: GameEntity): StateFlow<State> {
        val existing = downloads[game.name]
        if (existing != null && existing.value !is State.Complete && existing.value !is State.Failed) {
            return existing
        }

        // Không làm IO trên luồng UI trong start; việc kiểm tra file diễn ra trên Dispatchers.IO.
        // Never perform disk work on the UI thread in start; installation checks run on IO.
        val appContext = context.applicationContext
        val state = MutableStateFlow<State>(State.Preparing)
        downloads[game.name] = state

        appContext.appContainer.applicationScope.launch(Dispatchers.IO) {
            GameDownloadManager.downloadAndExtractGame(
                context = appContext,
                game = game,
                onProgress = {},
                onBytes = { bytes, total -> state.value = State.Downloading(bytes, total) },
                onStage = { stage ->
                    when (stage) {
                        "connecting" -> state.value = State.Connecting
                        "installing" -> state.value = State.Installing
                    }
                },
                onSuccess = { state.value = State.Complete },
                onError = { message -> state.value = State.Failed(message) }
            )
        }
        return state
    }
}
