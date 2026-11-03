@echo off
REM ==============================================================================
REM ADB AUTOMATED INSTALLATION & SMOKE TEST SCRIPT
REM NextAI Game Offline (com.nextai.gameoffline)
REM ==============================================================================

echo [1/4] Kiem tra thiet bi Android ket noi qua ADB...
adb devices
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Khong tim thay thiet bi Android hoac chua bat USB Debugging!
    exit /b 1
)

echo [2/4] Go bo ban cu (neu co)...
adb uninstall com.nextai.gameoffline

echo [3/4] Cai dat ban APK moi nhat len may test...
adb install -r Android\app\build\outputs\apk\debug\app-debug.apk
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Cai dat APK that bai! Kiem tra lai file APK build.
    exit /b 1
)

echo [4/4] Khoi chay GameListActivity va ghi logcat...
adb shell am start -n com.nextai.gameoffline/com.nextai.gameoffline.presentation.gamelist.GameListActivity

echo [OK] Ứng dụng NextAI Game Offline đã được cài đặt và khởi chạy thành công!
echo Xem logcat theo lệnh: adb logcat -s "NextAI"
pause
