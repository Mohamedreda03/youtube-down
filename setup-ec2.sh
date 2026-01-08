#!/bin/bash

# Quick Setup Script for EC2
# Run this on a fresh Ubuntu EC2 instance

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 EC2 Setup Script for YouTube Downloader${NC}"
echo ""

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
echo -e "${YELLOW}📦 Installing Docker Compose...${NC}"
sudo apt install docker-compose-plugin -y

# Install Git
echo -e "${YELLOW}📦 Installing Git...${NC}"
sudo apt install git -y

# Install useful tools
echo -e "${YELLOW}🔧 Installing additional tools...${NC}"
sudo apt install htop curl wget nano -y

# Setup firewall
echo -e "${YELLOW}🔒 Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Log out and log back in (to apply Docker group permissions)"
echo "2. Clone your repository or upload your code"
echo "3. Run: cd your-project && docker compose -f docker-compose.prod.yml up -d"
echo ""
echo -e "${RED}⚠️  Please log out and log back in now!${NC}"
