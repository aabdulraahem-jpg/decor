#!/usr/bin/env pwsh
# Sufuf API — Deploy via SSH only (no scp/sftp)
# Uses an SSH key to avoid repeated password prompts.

$ErrorActionPreference = "Stop"
$VPS_IP = "72.62.183.108"
$VPS_HOST = "root@$VPS_IP"
$ROOT = $PSScriptRoot
$BACKEND_DIR = Resolve-Path "$ROOT\..\backend"
$TARBALL = Join-Path $ROOT "backend.tar.gz"
$KEY_DIR = Join-Path $env:USERPROFILE ".ssh"
$KEY_PATH = Join-Path $KEY_DIR "sufuf_ed25519"
$KEY_PUB = "$KEY_PATH.pub"

function Run-Ssh($cmd, [switch]$useKey, [switch]$ignoreFail) {
    if ($useKey) {
        $sshArgs = @("-i", $KEY_PATH, "-o", "IdentitiesOnly=yes", "-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=accept-new", $VPS_HOST, $cmd)
    } else {
        $sshArgs = @("-o", "StrictHostKeyChecking=accept-new", $VPS_HOST, $cmd)
    }
    & ssh $sshArgs
    if (-not $ignoreFail -and $LASTEXITCODE -ne 0) { throw "ssh command failed: $cmd" }
}

function Send-File($localPath, $remotePath) {
    Write-Host "    -> $remotePath" -ForegroundColor DarkGray
    $bytes = [IO.File]::ReadAllBytes($localPath)
    $b64 = [Convert]::ToBase64String($bytes)
    # Pipe base64 to remote `base64 -d > remotePath`
    $b64 | & ssh -i $KEY_PATH -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new $VPS_HOST "base64 -d > '$remotePath'"
    if ($LASTEXITCODE -ne 0) { throw "Send-File failed for $localPath -> $remotePath" }
}

Write-Host "===== Sufuf API Deployment =====" -ForegroundColor Cyan
Write-Host "Source : $BACKEND_DIR"
Write-Host "Target : $VPS_HOST"

# ---------- 1) Build tarball ----------
Write-Host ""
Write-Host "[1/6] Creating tarball (backend code only)..." -ForegroundColor Yellow
Push-Location $BACKEND_DIR
try {
    if (Test-Path $TARBALL) { Remove-Item $TARBALL -Force }
    tar --exclude='./node_modules' --exclude='./dist' --exclude='./.env' --exclude='./prisma/migrations' -czf $TARBALL .
    if ($LASTEXITCODE -ne 0) { throw "tar failed" }
    $size = "{0:N2}" -f ((Get-Item $TARBALL).Length / 1KB)
    Write-Host "    OK: $size KB" -ForegroundColor Green
} finally { Pop-Location }

# ---------- 2) SSH key setup (one-time) ----------
Write-Host ""
Write-Host "[2/6] Ensuring SSH key is installed on server..." -ForegroundColor Yellow

if (-not (Test-Path $KEY_DIR)) { New-Item -ItemType Directory -Path $KEY_DIR -Force | Out-Null }

if (-not (Test-Path $KEY_PATH)) {
    Write-Host "    Generating new SSH key..." -ForegroundColor DarkGray
    & ssh-keygen -t ed25519 -f $KEY_PATH -N '""' -C "sufuf-deploy"
    if ($LASTEXITCODE -ne 0) { throw "ssh-keygen failed" }
}

# Test if key already authorized
& ssh -i $KEY_PATH -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 $VPS_HOST "true" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "    Key already installed" -ForegroundColor Green
} else {
    Write-Host "    Installing public key (you'll be asked for the SSH password ONE TIME)..." -ForegroundColor Yellow
    $pub = (Get-Content $KEY_PUB -Raw).Trim()
    $installCmd = "mkdir -p /root/.ssh && chmod 700 /root/.ssh && echo '$pub' >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys && (sort -u /root/.ssh/authorized_keys -o /root/.ssh/authorized_keys || true)