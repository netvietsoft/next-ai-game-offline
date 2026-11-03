# Proguard rules for NextAI Game Offline
-keep class com.nextai.gameoffline.presentation.game.AndroidGameBridge { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.nextai.gameoffline.data.local.entity.** { *; }
-keep class com.nextai.gameoffline.data.local.dao.** { *; }

# Google Play Billing v9.x
-keep class com.android.billingclient.api.** { *; }

# Coil image loader
-dontwarn coil.**
-keep class coil.** { *; }

# Media3 ExoPlayer
-dontwarn androidx.media3.**
-keep class androidx.media3.** { *; }

