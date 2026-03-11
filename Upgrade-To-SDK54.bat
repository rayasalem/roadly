@echo off
chcp 65001 >nul
title MechNow - ترقية إلى Expo SDK 54
cd /d "%~dp0"

echo.
echo [1/2] تثبيت الحزم...
call npm install
if errorlevel 1 (
  echo فشل npm install. جرب: npm install --legacy-peer-deps
  pause
  exit /b 1
)

echo.
echo [2/2] ضبط حزم Expo لـ SDK 54...
call npx expo install --fix
if errorlevel 1 (
  echo فشل expo install --fix
  pause
  exit /b 1
)

echo.
echo تم. شغّل المشروع: npx expo start
pause
