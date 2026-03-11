@echo off
cd /d "%~dp0..\backend"
if not exist .env copy .env.example .env
call npm install
call npm run dev
