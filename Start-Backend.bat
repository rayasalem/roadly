@echo off
chcp 65001 >nul
title MechNow Backend (port 4000)
cd /d "%~dp0backend"
if not exist .env copy .env.example .env
echo Installing backend dependencies...
call npm install
echo.
echo Starting backend server...
call npm run dev
pause
