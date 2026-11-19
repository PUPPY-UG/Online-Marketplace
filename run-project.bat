@echo off
title UniTrade - Campus Online Marketplace (Uganda Christian University)
color 0b

echo ====================================================================
echo  UniTrade - Campus Online Marketplace for University Students
echo  Uganda Christian University (UCU) - Mukono Campus
echo  Course: MGT3151 - E-Business, E-Commerce and E-Governance
echo ====================================================================
echo.

set PATH=C:\Users\MacBook Air\.gemini\antigravity\scratch\nodejs;%PATH%

echo [1/3] Checking Node.js environment...
node -v >nul 2>&1
if errorlevel 1 (
  echo Error: Node.js was not detected in PATH.
  pause
  exit /b 1
)

echo [2/3] Starting UniTrade Full-Stack Server on Port 5000...
echo.
echo Application URL: http://localhost:5000
echo Default Password for Demo Accounts: UniTrade@2026
echo.
echo Press Ctrl+C in this terminal anytime to stop the server.
echo.

cd /d "%~dp0backend"
start http://localhost:5000
npm start
