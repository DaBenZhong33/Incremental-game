@echo off
chcp 65001 >nul
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo 请先安装 Node.js 22 或更高版本。
  pause
  exit /b 1
)
if not exist node_modules call npm install
call npm run dev -- --open
pause
