#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "  🚀 DeliverEats - Automatic Startup"
echo "========================================"
echo ""

# Check Docker
echo -e "${BLUE}⏳ Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed or not running${NC}"
    echo "   Please install Docker and run this script again"
    exit 1
fi
echo -e "${GREEN}✅ Docker detected${NC}"

# Check Docker Compose
echo ""
echo -e "${BLUE}⏳ Checking Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose detected${NC}"

# Cleanup
echo ""
echo -e "${BLUE}🧹 Cleaning existing containers...${NC}"
./docker-cleanup.sh

# Build and start
echo ""
echo -e "${BLUE}🔨 Building and starting services...${NC}"
docker-compose up --build -d

# Wait for services
echo ""
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 10

# Check status
echo ""
echo -e "${BLUE}🔍 Checking service status...${NC}"
docker-compose ps

echo ""
echo "========================================"
echo -e "  ${GREEN}✅ DeliverEats started successfully!${NC}"
echo "========================================"
echo ""
echo -e "${BLUE}🌐 Available services:${NC}"
echo "   Frontend:     http://localhost:3000"
echo "   API Gateway:  http://localhost:8080/health"
echo "   Database:     localhost:3306"
echo ""
echo -e "${BLUE}👤 Test users:${NC}"
echo "   Admin:   admin@delivereats.com / password"
echo "   Client:  juan@cliente.com / password"
echo ""
echo -e "${BLUE}📊 To view logs:${NC}"
echo "   docker-compose logs -f"
echo ""
echo -e "${BLUE}🛑 To stop:${NC}"
echo "   docker-compose down"
echo ""