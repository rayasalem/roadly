@echo off
chcp 65001 >nul
title MechNow Frontend (Expo)
cd /d "%~dp0"
if not exist .env copy .env.example .env
echo Installing frontend dependencies...
call npm install
echo.
echo Starting Expo (press w for web)...
call npx expo start
pause
