<#
.SYNOPSIS
  Push TrafficAI project to GitHub repository https://github.com/Sarvajit18/TRAFFIC-CONGESTION.git
#>

$git = "C:\Users\ssarv\AppData\Local\Programs\MinGit\cmd\git.exe"
if (-not (Test-Path $git)) {
    $git = "git"
}

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "  TrafficAI - Push to GitHub (Sarvajit18/TRAFFIC-CONGESTION)" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

$token = Read-Host "Enter your GitHub Personal Access Token (or press Enter to use standard Git credentials)"

if ($token) {
    $authUrl = "https://$($token)@github.com/Sarvajit18/TRAFFIC-CONGESTION.git"
    Write-Host "Pushing to remote with token..." -ForegroundColor Yellow
    & $git push $authUrl main --force
} else {
    Write-Host "Pushing to origin main..." -ForegroundColor Yellow
    & $git push -u origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Successfully pushed TrafficAI to https://github.com/Sarvajit18/TRAFFIC-CONGESTION.git!" -ForegroundColor Green
} else {
    Write-Host "`nPush failed. Please ensure your token has write permissions." -ForegroundColor Red
}
