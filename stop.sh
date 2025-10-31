#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping ShiftTrackPro services...${NC}"

# Stop Docker containers
echo -e "${YELLOW}Stopping MySQL...${NC}"
docker stop shifttrackpro_mysql > /dev/null 2>&1
echo -e "${GREEN}✓ MySQL stopped${NC}"

echo -e "${YELLOW}Stopping phpMyAdmin...${NC}"
docker stop shifttrackpro_phpmyadmin > /dev/null 2>&1
echo -e "${GREEN}✓ phpMyAdmin stopped${NC}"

# Kill any Node processes on ports 3000 and 5173
echo -e "${YELLOW}Stopping Backend and Frontend...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
echo -e "${GREEN}✓ Backend and Frontend stopped${NC}"

echo ""
echo -e "${GREEN}All services stopped successfully!${NC}"
