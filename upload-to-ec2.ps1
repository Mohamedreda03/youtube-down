# PowerShell Script to Upload Code to EC2
# استخدم هذا السكريبت لرفع الكود للسيرفر بسهولة

param(
    [Parameter(Mandatory=$true)]
    [string]$KeyPath,
    
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [string]$User = "ubuntu"
)

Write-Host "🚀 Uploading YouTube Downloader to EC2..." -ForegroundColor Green
Write-Host ""

# Check if key file exists
if (-not (Test-Path $KeyPath)) {
    Write-Host "❌ Key file not found: $KeyPath" -ForegroundColor Red
    exit 1
}

# Project directory
$ProjectDir = $PSScriptRoot

Write-Host "📦 Project directory: $ProjectDir" -ForegroundColor Yellow
Write-Host "🔑 SSH Key: $KeyPath" -ForegroundColor Yellow
Write-Host "🌐 EC2 IP: $EC2_IP" -ForegroundColor Yellow
Write-Host "👤 User: $User" -ForegroundColor Yellow
Write-Host ""

# Confirm
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📤 Uploading files..." -ForegroundColor Cyan

# Create remote directory
Write-Host "Creating remote directory..." -ForegroundColor Gray
ssh -i $KeyPath "$User@$EC2_IP" "mkdir -p ~/youtube-v2"

# Upload files using SCP
# Exclude unnecessary files
$excludePatterns = @(
    "node_modules",
    ".next",
    ".git",
    "*.log",
    ".env.local"
)

# Build exclude arguments
$excludeArgs = ""
foreach ($pattern in $excludePatterns) {
    $excludeArgs += "--exclude='$pattern' "
}

Write-Host "Uploading project files (this may take a few minutes)..." -ForegroundColor Gray

# Use rsync if available (faster), otherwise use scp
$rsyncAvailable = Get-Command rsync -ErrorAction SilentlyContinue

if ($rsyncAvailable) {
    Write-Host "Using rsync for faster upload..." -ForegroundColor Gray
    & rsync -avz -e "ssh -i $KeyPath" `
        --exclude='node_modules' `
        --exclude='.next' `
        --exclude='.git' `
        --exclude='*.log' `
        --exclude='.env.local' `
        "$ProjectDir/" "$User@$EC2_IP`:~/youtube-v2/"
} else {
    Write-Host "Using SCP (install WSL + rsync for faster uploads)..." -ForegroundColor Gray
    & scp -i $KeyPath -r `
        -o "StrictHostKeyChecking=no" `
        "$ProjectDir/*" "$User@$EC2_IP`:~/youtube-v2/"
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Upload complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. SSH into your server:" -ForegroundColor White
    Write-Host "   ssh -i `"$KeyPath`" $User@$EC2_IP" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Navigate to project:" -ForegroundColor White
    Write-Host "   cd ~/youtube-v2" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Deploy the application:" -ForegroundColor White
    Write-Host "   chmod +x deploy.sh" -ForegroundColor Cyan
    Write-Host "   ./deploy.sh" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "4. Access your site:" -ForegroundColor White
    Write-Host "   http://$EC2_IP.nip.io" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Write-Host "Please check your SSH key and EC2 IP address." -ForegroundColor Yellow
    exit 1
}
