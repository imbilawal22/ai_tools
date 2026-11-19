@echo off
REM ============================================================
REM Mindora AI - Daily 9:00 AM & 6:00 PM AI Tools Research Runner
REM ============================================================

cd /d "%~dp0\.."

echo [%date% %time%] Starting Mindora AI Daily Research & Publish Pipeline...

REM Pull latest changes from remote
git pull origin main --quiet

REM Run research & live verification probe
python scripts/fetch_ai_tools.py

REM Check if js/data.js has changes
git diff --quiet js/data.js
if %errorlevel% neq 0 (
    echo [%date% %time%] New AI tools discovered. Committing and pushing to website...
    git add js/data.js
    git commit -m "Auto-update: Researched and posted verified live AI tools (%date% %time%) [skip ci]"
    git push origin main
    echo [%date% %time%] Live website successfully updated and deployed.
) else (
    echo [%date% %time%] No new uncataloged tools found in this cycle. Website is up to date.
)

echo [%date% %time%] Research cycle finished.
