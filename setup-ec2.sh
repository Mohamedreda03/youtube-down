# Quick Setup Script for EC2
# Run this on a fresh Ubuntu EC2 instance

Write-Host "🚀 EC2 Setup Script for YouTube Downloader" -ForegroundColor Green
Write-Host ""

# Update system
Write-Host "📦 Updating system packages..." -ForegroundColor Yellow
sudo apt update && sudo apt upgrade -y

# Install Docker
Write-Host "🐳 Installing Docker..." -ForegroundColor Yellow
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
Write-Host "📦 Installing Docker Compose..." -ForegroundColor Yellow
sudo apt install docker-compose-plugin -y

# Install Git
Write-Host "📦 Installing Git..." -ForegroundColor Yellow
sudo apt install git -y

# Install useful tools
Write-Host "🔧 Installing additional tools..." -ForegroundColor Yellow
sudo apt install htop curl wget nano -y

# Setup firewall
Write-Host "🔒 Configuring firewall..." -ForegroundColor Yellow
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Log out and log back in (to apply Docker group permissions)"
Write-Host "2. Clone your repository or upload your code"
Write-Host "3. Run: cd your-project && docker compose -f docker-compose.prod.yml up -d"
Write-Host ""
Write-Host "⚠️  Please log out and log back in now!" -ForegroundColor Red
