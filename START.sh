#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   ShiftTrackPro - Starting Services${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Start MySQL container
echo -e "${YELLOW}Starting MySQL database...${NC}"
if docker ps -a --format '{{.Names}}' | grep -q "^shifttrackpro_mysql$"; then
    echo -e "${YELLOW}MySQL container exists. Starting it...${NC}"
    docker start shifttrackpro_mysql > /dev/null 2>&1
else
    echo -e "${YELLOW}Creating new MySQL container...${NC}"
    docker run -d \
      --name shifttrackpro_mysql \
      -e MYSQL_ROOT_PASSWORD=root \
      -e MYSQL_DATABASE=shifttrackpro \
      -p 3306:3306 \
      mysql:8.0 > /dev/null 2>&1

    echo -e "${YELLOW}Waiting for MySQL to initialize (15 seconds)...${NC}"
    sleep 15

    echo -e "${YELLOW}Seeding database...${NC}"
    cd backend && npm run seed && cd ..
fi

# Start phpMyAdmin container
echo -e "${YELLOW}Starting phpMyAdmin...${NC}"
if docker ps -a --format '{{.Names}}' | grep -q "^shifttrackpro_phpmyadmin$"; then
    docker start shifttrackpro_phpmyadmin > /dev/null 2>&1
else
    docker run -d \
      --name shifttrackpro_phpmyadmin \
      -e PMA_HOST=host.docker.internal \
      -e PMA_PORT=3306 \
      -e PMA_USER=root \
      -e PMA_PASSWORD=root \
      -p 8080:80 \
      phpmyadmin/phpmyadmin > /dev/null 2>&1
fi

echo -e "${GREEN}✓ MySQL running on port 3306${NC}"
echo -e "${GREEN}✓ phpMyAdmin running on port 8080${NC}"
echo ""

# Start backend and frontend using npm workspaces
echo -e "${YELLOW}Starting Backend and Frontend...${NC}"
npm run dev
