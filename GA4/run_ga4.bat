@echo off
chcp 65001 >nul
powershell -ExecutionPolicy Bypass -File "%~dp0run_ga4.ps1" %*
exit /b %ERRORLEVEL%
