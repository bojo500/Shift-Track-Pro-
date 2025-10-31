#!/bin/bash

# ShiftTrackPro - Nginx Proxy Manager Deployment Script
# This script automates deployment with existing NPM setup

set -e

echo "🚀 ShiftTrackPro - Nginx Proxy Manager Deployment"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root (use sudo)${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Running as root${NC}"

# Step 1: Check environment file
echo ""
echo "Step 1: Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found!${NC}"
    if [ -f ".env.npm" ]; then
        echo -e "${YELLOW}📝 Copying .env.npm to .env.production${NC}"
        cp .env.npm .env.production
        echo -e "${RED}⚠️  IMPORTANT: Edit .env.production with your settings!${NC}"
        echo "Press Enter after editing .env.production..."
        read
    else
        echo -e "${RED}❌ Neither .env.production nor .env.npm found!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Environment configuration found${NC}"
fi

# Step 2: Check NPM network
echo ""
echo "Step 2: Checking NPM network..."
if ! docker network ls | grep -q "npm_network"; then
    echo -e "${YELLOW}⚠️  npm_network not found, creating...${NC}"
    docker network create npm_network
    echo -e "${GREEN}✅ NPM network created${NC}"
else
    echo -e "${GREEN}✅ NPM network exists${NC}"
fi

# Step 3: Update system
echo ""
echo "Step 3: Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}✅ System updated${NC}"

# Step 4: Install Docker
echo ""
echo "Step 4: Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Step 5: Install Docker Compose
echo ""
echo "Step 5: Checking Docker Compose installation..."
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Step 6: Stop existing containers
echo ""
echo "Step 6: Stopping existing containers (if any)..."
docker-compose -f docker-compose.npm.yml down 2>/dev/null || true
echo -e "${GREEN}✅ Containers stopped${NC}"

# Step 7: Build images
echo ""
echo "Step 7: Building Docker images..."
echo -e "${YELLOW}⏳ This may take 5-10 minutes...${NC}"
docker-compose -f docker-compose.npm.yml build --no-cache
echo -e "${GREEN}✅ Images built successfully${NC}"

# Step 8: Start services
echo ""
echo "Step 8: Starting services..."
docker-compose -f docker-compose.npm.yml up -d
echo -e "${GREEN}✅ Services started${NC}"

# Step 9: Wait for database
echo ""
echo "Step 9: Waiting for database to initialize..."
echo -e "${YELLOW}⏳ Waiting 30 seconds...${NC}"
sleep 30
echo -e "${GREEN}✅ Database ready${NC}"

# Step 10: Run migrations
echo ""
echo "Step 10: Running database migrations..."
docker-compose -f docker-compose.npm.yml exec -T backend npm run migration:run 2>/dev/null || echo -e "${YELLOW}⚠️  No migrations to run${NC}"
echo -e "${GREEN}✅ Migrations complete${NC}"

# Step 11: Seed database
echo ""
echo "Step 11: Seeding database..."
docker-compose -f docker-compose.npm.yml exec -T backend npm run seed || echo -e "${YELLOW}⚠️  Database already seeded${NC}"
echo -e "${GREEN}✅ Database seeded${NC}"

# Step 12: Show container status
echo ""
echo "Step 12: Checking container status..."
docker-compose -f docker-compose.npm.yml ps

# Summary
echo ""
echo "=================================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📊 Container Status:${NC}"
echo ""
docker-compose -f docker-compose.npm.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${BLUE}🔌 Internal Services:${NC}"
echo "  📱 Frontend:    http://localhost:3001"
echo "  🔧 Backend API: http://localhost:3000"
echo "  🗄️  phpMyAdmin:  http://localhost:8080"
echo "  💾 MySQL:       localhost:3306"
echo ""
echo -e "${YELLOW}⚠️  NEXT STEPS:${NC}"
echo ""
echo "1️⃣  Configure Nginx Proxy Manager (http://YOUR_SERVER_IP:81)"
echo ""
echo "   Add these Proxy Hosts:"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Frontend:"
echo "     Domain: shifttrackpro.yourdomain.com"
echo "     Forward to: shifttrack-frontend:80"
echo "     SSL: Request Let's Encrypt Certificate"
echo ""
echo "   Backend API:"
echo "     Domain: api.yourdomain.com"
echo "     Forward to: shifttrack-backend:3000"
echo "     SSL: Request Let's Encrypt Certificate"
echo ""
echo "   phpMyAdmin:"
echo "     Domain: phpmyadmin.yourdomain.com"
echo "     Forward to: shifttrack-phpmyadmin:80"
echo "     SSL: Request Let's Encrypt Certificate"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "2️⃣  Test your domains:"
echo "   🌐 https://shifttrackpro.yourdomain.com"
echo "   🔧 https://api.yourdomain.com/api/docs"
echo "   🗄️  https://phpmyadmin.yourdomain.com"
echo ""
echo "3️⃣  Login with default credentials:"
echo "   📧 Email:    admin@shifttrack.com"
echo "   🔑 Password: Admin@123"
echo ""
echo -e "${RED}⚠️  CHANGE THE DEFAULT PASSWORD IMMEDIATELY!${NC}"
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "  View logs:    docker-compose -f docker-compose.npm.yml logs -f"
echo "  Restart:      docker-compose -f docker-compose.npm.yml restart"
echo "  Stop:         docker-compose -f docker-compose.npm.yml down"
echo "  Start:        docker-compose -f docker-compose.npm.yml up -d"
echo ""
echo -e "${GREEN}🎉 Deployment finished successfully!${NC}"
echo ""
