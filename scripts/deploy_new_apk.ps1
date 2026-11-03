$adb = "C:\Users\boluc\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$device = "192.168.1.9:5555"
$apk = "E:\DECOMPILER\Game\com.media720.games2020\Android\build\outputs\apk\debug\NextAIGameOffline-debug.apk"

Write-Host "Connecting to $device..."
& $adb connect $device

Write-Host "Pushing APK to /data/local/tmp/app_new.apk..."
& $adb -s $device push $apk /data/local/tmp/app_new.apk

Write-Host "Installing APK..."
& $adb -s $device shell pm install -r -d /data/local/tmp/app_new.apk

Write-Host "Cleaning up temp file..."
& $adb -s $device shell rm /data/local/tmp/app_new.apk

Write-Host "Launching updated GameListActivity..."
& $adb -s $device shell am start -n com.nextai.gameoffline.debug/com.nextai.gameoffline.presentation.gamelist.GameListActivity

Write-Host "Deployment completed successfully!"
