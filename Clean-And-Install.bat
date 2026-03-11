@echo off
chcp 65001 >nul
title MechNow - تنظيف وتثبيت
cd /d "%~dp0"

echo حذف node_modules...
if exist node_modules (
  rmdir /s /q node_modules
  if exist node_modules (
    echo فشل الحذف. اقفل VS Code / Cursor و Metro و جرّب مرة ثانية.
    pause
    exit /b 1
  )
)

echo حذف package-lock.json...
if exist package-lock.json del package-lock.json

echo.
echo تثبيت الحزم (مع زيادة ذاكرة Node)...
set NODE_OPTIONS=--max-old-space-size=4096
call npm install
if errorlevel 1 (
  echo فشل التثبيت.
  pause
  exit /b 1
)

echo.
echo تم بنجاح.
pause
