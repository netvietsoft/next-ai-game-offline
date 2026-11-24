# Facebook Android setup and key hashes

Checked on 2026-11-17. These values describe the actual Android package/certificates; they are not proof the Meta dashboard has been updated.

## Application settings

- Facebook App ID: `2333393207502258` (public identifier from the supplied archive).
- Google Play package: `com.nextai.game.offline`.
- Default activity class: `com.nextai.gameoffline.presentation.splash.SplashAdActivity`.
- The `com.nextai.game.offline.MainActivity` value in the supplied file does not exist in this project.
- Do not enter the QA package (`com.nextai.game.offline.qa`) as the production application package.

## Android key hashes for Meta

Facebook key hash is Base64 of the SHA-1 digest of the DER signing certificate, not Base64 of the ASCII hexadecimal string. Certificates were verified with Android SDK `apksigner verify --print-certs`.

| Build/signing identity | SHA-1 certificate fingerprint | Facebook key hash |
| --- | --- | --- |
| Google Play v1.2 installed on Samsung A07, application signer | `BD:F4:7B:1D:CC:21:F4:6B:92:6B:03:D3:69:76:5A:2A:E6:49:1F:FE` | `vfR7Hcwh9GuSawPTaXZaKuZJH/4=` |
| Local release APK / current upload certificate | `7D:75:58:32:44:A6:5E:1F:86:FB:C4:30:5F:8B:21:87:7D:C9:1C:C6` | `fXVYMkSmXh+G+8QwX4shh33JHMY=` |
| Local debug APK | `5A:95:3A:F1:87:02:72:6B:9F:31:59:26:DA:93:9E:B1:42:A4:30:43` | `WpU68YcCcmufMVkm2pOesUKkMEM=` |

The Play certificate was read from the original Play-installed base APK (`com.nextai.game.offline`, versionCode 9, versionName 1.2). Its **application signer**, not its Source Stamp signer, was used. Add the applicable hashes to the Android platform's **Key Hashes** field in Meta. If Play App Signing upgrades or rotates the signing certificate, include the new certificate as well; the current local upload certificate cannot substitute for the Play signing certificate.

## SDK and credential handling

- The supplied nested `facebook-android-sdk-current.zip` is SDK **4.42.0**, not a current release. It is not bundled into the app.
- The application uses Maven Central `com.facebook.android:facebook-core:19.0.1`, a pinned minimal module for App Events. No Facebook Login button or permission flow is added.
- Configuration is read from ignored `.ai/facebook.local.json` (`appId`, `clientToken`) or environment variables `NEXTAI_FACEBOOK_APP_ID` / `NEXTAI_FACEBOOK_CLIENT_TOKEN`.
- The supplied file contains App ID, App Secret and an Install Referrer decryption key, but no explicitly labelled **Client Token**. The Client Token must be obtained from the Meta app's client-token settings. Never substitute the App Secret or decryption key.
- App Secret and referrer decryption key remain outside Android/Git. Only the SDK's client configuration is packaged when supplied. Client Token is a client-side value and can be extracted from an APK, so it must not be mistaken for a server secret.
- With no Client Token, Meta SDK initialization is skipped safely. Debug/QA also skips initialization. The app therefore does not claim Meta events have reached the dashboard.
- Auto initialization provider is removed. Automatic App Events, extra metadata, product-improvement diagnostics and advertising-ID collection are disabled in the manifest. A configured release explicitly activates app lifecycle events; Firebase events are not automatically mirrored to Meta.

## Remaining verification

1. Supply a valid Client Token locally, then rebuild.
2. Update the correct package/activity and certificate hashes in Meta dashboard.
3. Validate app activation events using an appropriate release/internal test and Meta Events Manager; do not treat a successful compile or Firebase event as a Meta receipt.
4. Review applicable privacy disclosures/consent behavior before enabling any additional Meta collection.

References: [Meta Android SDK](https://github.com/meta/facebook-android-sdk), [SDK initialization requirements](https://github.com/meta/facebook-android-sdk/blob/main/facebook-core/src/main/java/com/facebook/FacebookSdk.kt), [Maven Central version metadata](https://repo.maven.apache.org/maven2/com/facebook/android/facebook-core/maven-metadata.xml).
