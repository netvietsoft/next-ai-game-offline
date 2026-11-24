# Proguard rules for NextAI Game Offline
-keep class com.nextai.gameoffline.presentation.game.AndroidGameBridge { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.nextai.gameoffline.data.local.entity.** { *; }
-keep class com.nextai.gameoffline.data.local.dao.** { *; }

# Giữ nguyên tên lớp các Activity dùng cho AppOpenResumePolicy & Analytics
-keep class com.nextai.gameoffline.presentation.splash.SplashAdActivity { *; }
-keep class com.nextai.gameoffline.presentation.gamelist.GameListActivity { *; }
-keep class com.nextai.gameoffline.presentation.game.GameActivity { *; }
-keep class com.nextai.gameoffline.billing.BillingActivity { *; }

# Google Play Billing v9.x
-keep class com.android.billingclient.api.** { *; }

# Google Mobile Ads Native & Multi-Network RTB Mediation (Meta, Mintegral, AppLovin, Unity, Pangle)
-keep class com.google.android.gms.ads.nativead.** { *; }
-keep class com.google.ads.mediation.facebook.** { *; }
-keep class com.google.ads.mediation.mintegral.** { *; }
-keep class com.google.ads.mediation.applovin.** { *; }
-keep class com.google.ads.mediation.unity.** { *; }
-keep class com.google.ads.mediation.pangle.** { *; }
-keep class com.applovin.sdk.AppLovinPrivacySettings { *; }
-keep class com.mbridge.msdk.** { *; }
-keep class com.unity3d.ads.** { *; }
-keep class com.bytedance.sdk.openadsdk.** { *; }

# Coil image loader
-dontwarn coil.**
-keep class coil.** { *; }

