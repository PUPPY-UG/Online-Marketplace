@echo off
title Push UniTrade to GitHub (PUPPY-UG/Online-Marketplace)
color 0a

echo ====================================================================
echo  UniTrade - Push to GitHub Repository
echo  Target: https://github.com/PUPPY-UG/Online-Marketplace
echo ====================================================================
echo.

set PATH=C:\Users\MacBook Air\.gemini\antigravity\scratch\nodejs;%PATH%

echo To push to GitHub, GitHub requires a Personal Access Token (classic or fine-grained)
echo with 'repo' write permissions.
echo.
echo You can generate one at: https://github.com/settings/tokens
echo.
set /p GITHUB_TOKEN="Enter your GitHub Personal Access Token: "

if "%GITHUB_TOKEN%"=="" (
  echo No token provided. Exiting.
  pause
  exit /b 1
)

cd /d "C:\Users\MacBook Air\.gemini\antigravity\scratch\git-pusher"
node push-with-token.js %GITHUB_TOKEN%

pause
