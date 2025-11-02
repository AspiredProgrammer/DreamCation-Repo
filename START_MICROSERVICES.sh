#!/bin/bash

# DreamCation Microservices Startup Script
# This script starts all microservices for local development

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🚀 Starting DreamCation Microservices..."
echo "📁 Working directory: $SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Check ports
echo "🔍 Checking ports..."
PORTS=(8001 8002 8003 8004 8005 8006 3001)
for port in "${PORTS[@]}"; do
    if ! check_port $port; then
        echo "❌ Please stop the process using port $port and try again"
        exit 1
    fi
done

echo -e "${GREEN}✅ All ports available${NC}"

# Start services in background
echo -e "${BLUE}Starting services...${NC}"

# User Service
echo -e "${BLUE}👤 Starting User Service...${NC}"
(cd "$SCRIPT_DIR/services/user-service" && npm run dev > /tmp/user-service.log 2>&1) &
USER_PID=$!
sleep 2

# Hotel Service
echo -e "${BLUE}🏨 Starting Hotel Service...${NC}"
(cd "$SCRIPT_DIR/services/hotel-service" && npm run dev > /tmp/hotel-service.log 2>&1) &
HOTEL_PID=$!
sleep 2

# Flight Service
echo -e "${BLUE}✈️  Starting Flight Service...${NC}"
(cd "$SCRIPT_DIR/services/flight-service" && npm run dev > /tmp/flight-service.log 2>&1) &
FLIGHT_PID=$!
sleep 2

# Activity Service
echo -e "${BLUE}🎉 Starting Activity Service...${NC}"
(cd "$SCRIPT_DIR/services/activity-service" && npm run dev > /tmp/activity-service.log 2>&1) &
ACTIVITY_PID=$!
sleep 2

# Car Service
echo -e "${BLUE}🚗 Starting Car Service...${NC}"
(cd "$SCRIPT_DIR/services/car-service" && npm run dev > /tmp/car-service.log 2>&1) &
CAR_PID=$!
sleep 2

# Itinerary Service
echo -e "${BLUE}📅 Starting Itinerary Service...${NC}"
(cd "$SCRIPT_DIR/services/itinerary-service" && npm run dev > /tmp/itinerary-service.log 2>&1) &
ITINERARY_PID=$!
sleep 2

# API Gateway
echo -e "${BLUE}🚪 Starting API Gateway...${NC}"
(cd "$SCRIPT_DIR/api-gateway" && npm run dev > /tmp/api-gateway.log 2>&1) &
GATEWAY_PID=$!
sleep 2

# Store PIDs
echo "$USER_PID $HOTEL_PID $FLIGHT_PID $ACTIVITY_PID $CAR_PID $ITINERARY_PID $GATEWAY_PID" > /tmp/dreamcation-pids.txt

echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "📊 Service URLs:"
echo "  👤 User Service:      http://localhost:8001"
echo "  🏨 Hotel Service:     http://localhost:8002"
echo "  ✈️  Flight Service:    http://localhost:8003"
echo "  🎉 Activity Service:  http://localhost:8004"
echo "  🚗 Car Service:       http://localhost:8005"
echo "  📅 Itinerary Service: http://localhost:8006"
echo "  🚪 API Gateway:       http://localhost:3001"
echo ""
echo "🌐 Frontend:            http://localhost:3000"
echo ""
echo "📝 Logs are being written to /tmp/dreamcation-*.log"
echo ""
echo "🛑 To stop all services, run: ./STOP_MICROSERVICES.sh"
echo ""
echo "🔍 Check health: curl http://localhost:3001/health"

