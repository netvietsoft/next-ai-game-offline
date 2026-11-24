import java.util.Properties
import groovy.json.JsonSlurper
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

buildscript {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://storage.googleapis.com/r8-releases/raw") }
    }
    dependencies {
        // Kotlin 2.4 metadata cần R8 9.1.29+ theo bảng tương thích Android chính thức.
        // Kotlin 2.4 metadata requires R8 9.1.29+ per Android's compatibility table.
        classpath("com.android.tools:r8:9.1.29")
    }
}

plugins {
    id("com.android.application") version "8.10.1"
    id("org.jetbrains.kotlin.android") version "2.4.21"
    id("com.google.devtools.ksp") version "2.3.10"
    id("com.google.gms.google-services") version "4.6.0"
    id("com.google.firebase.crashlytics") version "3.0.8"
}

val signingProperties = Properties().apply {
    val propertiesFile = file("keystore.properties")
    if (propertiesFile.isFile) propertiesFile.inputStream().use(::load)
}

fun signingValue(propertyName: String, environmentName: String): String? =
    providers.environmentVariable(environmentName).orNull
        ?: signingProperties.getProperty(propertyName)

val releaseStorePath = signingValue("storeFile", "NEXTAI_RELEASE_KEYSTORE")
val releaseStorePassword = signingValue("storePassword", "NEXTAI_RELEASE_STORE_PASSWORD")
val releaseKeyAlias = signingValue("keyAlias", "NEXTAI_RELEASE_KEY_ALIAS")
val releaseKeyPassword = signingValue("keyPassword", "NEXTAI_RELEASE_KEY_PASSWORD")
val hasReleaseSigning = !releaseStorePath.isNullOrBlank() &&
    !releaseStorePassword.isNullOrBlank() &&
    !releaseKeyAlias.isNullOrBlank() &&
    !releaseKeyPassword.isNullOrBlank() &&
    file(releaseStorePath).isFile

// Chỉ đọc App ID và Client Token dùng cho client; App Secret không bao giờ được đóng gói.
// Read only client App ID/token; never package an App Secret or referrer decryption key.
val facebookLocalConfig: Map<*, *> = run {
    val configFile = rootProject.file("../.ai/facebook.local.json")
    if (!configFile.isFile) emptyMap<String, String>() else try {
        JsonSlurper().parse(configFile) as? Map<*, *>
            ?: throw GradleException("Facebook local configuration must be a JSON object.")
    } catch (_: Exception) {
        throw GradleException("Cannot read Facebook local configuration. Review .ai/facebook.local.json locally.")
    }
}
val facebookAppId = providers.environmentVariable("NEXTAI_FACEBOOK_APP_ID").orNull
    ?: (facebookLocalConfig["appId"] as? String).orEmpty()
val facebookClientToken = providers.environmentVariable("NEXTAI_FACEBOOK_CLIENT_TOKEN").orNull
    ?: (facebookLocalConfig["clientToken"] as? String).orEmpty()
require(facebookAppId.isBlank() || facebookAppId.matches(Regex("[0-9]+"))) { "Invalid Facebook App ID format." }
require(facebookClientToken.isBlank() || facebookClientToken.matches(Regex("[A-Za-z0-9_-]{16,256}"))) { "Invalid Facebook Client Token format." }
val facebookConfigured = facebookAppId.isNotBlank() && facebookClientToken.isNotBlank()

android {
    namespace = "com.nextai.gameoffline"
    compileSdk = 36
    buildToolsVersion = "36.0.0"

    defaultConfig {
        applicationId = "com.nextai.game.offline"
        minSdk = 24
        targetSdk = 36
        versionCode = 14
        versionName = "1.4.1"

        resValue("string", "facebook_app_id", facebookAppId)
        resValue("string", "facebook_client_token", facebookClientToken)
        buildConfigField("boolean", "FACEBOOK_CONFIGURED", facebookConfigured.toString())

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = file(requireNotNull(releaseStorePath))
                storePassword = releaseStorePassword
                keyAlias = releaseKeyAlias
                keyPassword = releaseKeyPassword
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.findByName("release")
        }
        debug {
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    // AndroidX Core & Lifecycle
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.core:core-splashscreen:1.2.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.4")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.4")
    implementation("androidx.viewpager2:viewpager2:1.1.0")

    // Room SQLite Database
    val roomVersion = "2.8.5"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // AndroidX WebKit hiện hành; Media3 đã bỏ vì không có call site và làm phình bundle.
    // Current AndroidX WebKit; unused Media3 was removed to reduce size and attack surface.
    implementation("androidx.webkit:webkit:1.18.0")

    // Image Loading (Coil)
    implementation("io.coil-kt:coil:2.6.0")
    // Tải gói có thể hủy và giới hạn chờ mạng / Cancellable package transfers with bounded network waits.
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // Google Play In-App Billing v9.x (v9.1.0 core)
    implementation("com.android.billingclient:billing:9.1.0")

    // Ads & Real-Time Bidding Mediation (Google Mobile Ads + 5 mạng đấu giá đạt chuẩn 16 KB)
    // Google Mobile Ads SDK + 5 16KB-aligned bidding mediation networks.
    implementation("com.google.android.gms:play-services-ads:25.5.0")
    implementation("com.google.ads.mediation:facebook:6.22.0.1")
    implementation("com.google.ads.mediation:mintegral:17.2.21.0")
    implementation("com.google.ads.mediation:applovin:13.7.0.0")
    implementation("com.unity3d.ads:unity-ads:4.21.0")
    implementation("com.google.ads.mediation:unity:4.21.0.0")
    implementation("com.google.ads.mediation:pangle:8.4.0.5.0")
    implementation("com.google.android.ump:user-messaging-platform:4.0.0")

    // App Events tối thiểu; không dùng SDK 4.42 cũ hoặc thêm Login khi chưa có UI.
    // Minimal App Events module; do not use the supplied legacy SDK or add unused Login UI.
    implementation("com.facebook.android:facebook-core:19.0.1")

    // Firebase Analytics (BoM)
    implementation(platform("com.google.firebase:firebase-bom:35.2.0"))
    implementation("com.google.firebase:firebase-analytics")
    implementation("com.google.firebase:firebase-crashlytics")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("com.squareup.okhttp3:mockwebserver:4.12.0")
    testImplementation("androidx.room:room-testing:$roomVersion")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
