# Run-all deployer: pipes deploy-all.sh to remote bash via ssh stdin
$VPS = "root@72.62.183.108"
$Script = Join-Path $PSScriptRoot "deploy-all.sh"

if (-not (Test-Path $Script)) { throw "deploy-all.sh not found at $Script" }

Write-Host "===== Sufuf API One-Shot Deploy =====" -ForegroundColor Cyan
Write-Host "Target: $VPS"
Write-Host "Script: $Script ($([Math]::Round((Get-Item $Script).Length/1KB, 1)) KB)"
Write-Host ""
Write-Host "When prompted, enter SSH password: Notouchallmy0)" -ForegroundColor Yellow
Write-Host ""

# Read script and pipe to ssh stdin running bash
Get-Content -Raw -Path $Script | & ssh -o StrictHostKeyChecking=accept-new $VPS "bash -s"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===== Deploy completed =====" -ForegroundColor Green
    Write-Host "Test: https://api.sufuf.pro/health" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "===== Deploy failed (exit $LASTEXITCODE) =====" -ForegroundColor Red
}
