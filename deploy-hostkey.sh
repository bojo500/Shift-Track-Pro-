#!/bin/bash

# ShiftTrackPro - HostKey VPS Deployment Script
# This script automates the deployment of ShiftTrackPro on HostKey VPS

set -e

echo "🚀 ShiftTrackPro - HostKey VPS Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root (use sudo)${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Running as root${NC}"

# Step 1: Check if .env.production exists
echo ""
echo "Step 1: Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found!${NC}"
    if [ -f ".env.hostkey" ]; then
        echo -e "${YELLOW}📝 Copying .env.hostkey to .env.production${NC}"
        cp .env.hostkey .env.production
        echo -e "${RED}⚠️  IMPORTANT: Edit .env.production and set your passwords!${NC}"
        echo "Press Enter after editing .env.production..."
        read
    else
        echo -e "${RED}❌ Neither .env.production nor .env.hostkey found!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Environment configuration found${NC}"
fi

# Step 2: Update system
echo ""
echo "Step 2: Updating system packages..."
apt-get update
apt-get upgrade -y
echo -e "${GREEN}✅ System updated${NC}"

# Step 3: Install Docker
echo ""
echo "Step 3: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Step 4: Install Docker Compose
echo ""
echo "Step 4: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Step 5: Install Git
echo ""
echo "Step 5: Installing Git..."
if ! command -v git &> /dev/null; then
    apt-get install -y git
    echo -e "${GREEN}✅ Git installed${NC}"
else
    echo -e "${GREEN}✅ Git already installed${NC}"
fi

# Step 6: Create acme.json for SSL certificates
echo ""
echo "Step 6: Setting up SSL certificate storage..."
touch traefik/acme.json
chmod 600 traefik/acme.json
echo -e "${GREEN}✅ SSL certificate storage ready${NC}"

# Step 7: Stop existing containers
echo ""
echo "Step 7: Stopping existing containers (if any)..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
echo -e "${GREEN}✅ Existing containers stopped${NC}"

# Step 8: Build images
echo ""
echo "Step 8: Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache
echo -e "${GREEN}✅ Docker images built${NC}"

# Step 9: Start services
echo ""
echo "Step 9: Starting all services..."
docker-compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}✅ Services started${NC}"

# Step 10: Wait for database
echo ""
echo "Step 10: Waiting for database to be ready..."
sleep 20
echo -e "${GREEN}✅ Database should be ready${NC}"

# Step 11: Run migrations and seeds
echo ""
echo "Step 11: Running database migrations and seeding..."
docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run 2>/dev/null || echo -e "${YELLOW}⚠️  No migrations to run${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend npm run seed || echo -e "${YELLOW}⚠️  Seeding failed or already seeded${NC}"
echo -e "${GREEN}✅ Database setup complete${NC}"

# Step 12: Show status
echo ""
echo "Step 12: Checking service status..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📊 Your services are running at:"
echo ""
echo "  🌐 Frontend:    https://shifttrackpro.mk-codes.com"
echo "  🔧 Backend API: https://api.mk-codes.com"
echo "  📚 API Docs:    https://api.mk-codes.com/api/docs"
echo "  🗄️  phpMyAdmin:  https://phpmyadmin.shifttrackpro.mk-codes.com"
echo "  📊 Traefik:     https://traefik.shifttrackpro.mk-codes.com"
echo ""
echo "🔐 Default SuperAdmin Login:"
echo "  Email:    admin@shifttrack.com"
echo "  Password: Admin@123"
echo ""
echo "⚠️  IMPORTANT: Change the default admin password immediately!"
echo ""
echo "📝 View logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f [service-name]"
echo ""
echo "🔄 To restart services:"
echo "  docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "🛑 To stop services:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
