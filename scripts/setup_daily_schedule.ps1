# ============================================================
# Mindora AI - Setup Daily Windows Scheduled Tasks (9 AM & 6 PM)
# ============================================================

$projectDir = Split-Path -Parent $PSScriptRoot
$batchPath = Join-Path $PSScriptRoot "run_daily_update.bat"

Write-Host "Configuring Mindora AI Daily Research Tasks..." -ForegroundColor Cyan
Write-Host "Project Directory: $projectDir"
Write-Host "Runner Script: $batchPath"

# Task 1: Daily 9:00 AM Task
$taskName9AM = "MindoraAI_Research_9AM"
$time9AM = "09:00"

# Task 2: Daily 6:00 PM Task
$taskName6PM = "MindoraAI_Research_6PM"
$time6PM = "18:00"

try {
    # Check if schtasks exists
    $schtasks = Get-Command "schtasks.exe" -ErrorAction Stop

    # Register 9:00 AM task
    Write-Host "`nRegistering $taskName9AM (Daily at $time9AM)..." -ForegroundColor Yellow
    & schtasks.exe /create /tn $taskName9AM /tr "`"$batchPath`"" /sc daily /st $time9AM /f | Out-Host

    # Register 6:00 PM task
    Write-Host "`nRegistering $taskName6PM (Daily at $time6PM)..." -ForegroundColor Yellow
    & schtasks.exe /create /tn $taskName6PM /tr "`"$batchPath`"" /sc daily /st $time6PM /f | Out-Host

    Write-Host "`n[✓] Both daily automated tasks (9:00 AM & 6:00 PM) successfully scheduled!" -ForegroundColor Green
    Write-Host "[✓] Next runs will execute automatically at 9:00 AM and 6:00 PM daily." -ForegroundColor Green
} catch {
    Write-Host "[!] Error configuring scheduled tasks: $_" -ForegroundColor Red
}
