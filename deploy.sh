#!/bin/bash

# Quick Deploy Script for EC2
# This script automates the deployment process

set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please log out and log back in, then run this script again."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Installing..."
    sudo apt update
    sudo apt install docker-compose-plugin -y
fi

echo "📦 Pulling latest changes..."
if [ -d ".git" ]; then
    git pull
else
    echo "⚠️  Not a git repository. Skipping git pull."
fi

echo "🏗️  Building Docker images..."
docker compose -f docker-compose.prod.yml build

# Copy cookies file into container if it exists
if [ -f "cookies.txt" ]; then
    echo "📝 Cookies file found - will be copied to container..."
fi

echo "🔄 Stopping old containers..."
docker compose -f docker-compose.prod.yml down

echo "▶️  Starting new containers..."
docker compose -f docker-compose.prod.yml up -d

# Copy cookies to running container if file exists
if [ -f "cookies.txt" ]; then
    echo "📋 Copying cookies to container..."
    docker cp cookies.txt youtube-downloader:/app/cookies.txt
    docker exec youtube-downloader chown nextjs:nodejs /app/cookies.txt
    echo "✅ Cookies copied successfully!"
else
    echo "⚠️  No cookies.txt file found. YouTube may require authentication."
    echo "   See COOKIES-SETUP.md for instructions."
fi

echo "⏳ Waiting for containers to be healthy..."
sleep 10

echo "📊 Container status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📝 Useful commands:"
echo "  View logs:    docker compose -f docker-compose.prod.yml logs -f"
echo "  Check status: docker compose -f docker-compose.prod.yml ps"
echo "  Restart:      docker compose -f docker-compose.prod.yml restart"
echo "  Stop:         docker compose -f docker-compose.prod.yml down"
echo ""
echo -e "${YELLOW}🌐 Your application should be running at:${NC}"
echo "  http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
