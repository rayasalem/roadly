@echo off
cd /d "%~dp0.."
if not exist .env copy .env.example .env
call npm install
call npx expo start
