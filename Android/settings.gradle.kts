pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://jitpack.io") }
        // Kho Maven chính thức của Mintegral và Pangle cho AdMob Real-Time Bidding Mediation.
        // Official Maven repositories for Mintegral and Pangle AdMob bidding adapters.
        maven { url = java.net.URI("https://dl-maven-android.mintegral.com/repository/mbridge_android_sdk_oversea") }
        maven { url = java.net.URI("https://artifact.bytedance.com/repository/pangle/") }
    }
}

rootProject.name = "GameGateOffline"
