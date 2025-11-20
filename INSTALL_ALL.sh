#!/bin/bash

# DreamCation Complete Installation Script
# This script installs all npm dependencies for backend (microservices + API Gateway) and frontend

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📦 Installing DreamCation Dependencies (Backend + Frontend)..."
echo "📁 Working directory: $SCRIPT_DIR"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Track success/failure
SUCCESS_COUNT=0
FAIL_COUNT=0
FAILED_SERVICES=()

# Function to install dependencies for a service
install_service() {
    local SERVICE_NAME=$1
    local SERVICE_PATH=$2
    
    echo -e "${BLUE}[*] Installing dependencies for $SERVICE_NAME...${NC}"
    
    if [ ! -d "$SERVICE_PATH" ]; then
        echo -e "${RED}[ERROR] Directory not found: $SERVICE_PATH${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        FAILED_SERVICES+=("$SERVICE_NAME (directory not found)")
        return 1
    fi
    
    if [ ! -f "$SERVICE_PATH/package.json" ]; then
        echo -e "${YELLOW}[WARN] No package.json found in $SERVICE_PATH${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        FAILED_SERVICES+=("$SERVICE_NAME (no package.json)")
        return 1
    fi
    
    cd "$SERVICE_PATH"
    
    if npm install; then
        echo -e "${GREEN}[OK] $SERVICE_NAME dependencies installed successfully${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        cd "$SCRIPT_DIR"
        return 0
    else
        echo -e "${RED}[ERROR] Failed to install dependencies for $SERVICE_NAME${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        FAILED_SERVICES+=("$SERVICE_NAME (npm install failed)")
        cd "$SCRIPT_DIR"
        return 1
    fi
}

# ============================================
# BACKEND INSTALLATION
# ============================================
echo -e "${CYAN}╔═══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   BACKEND INSTALLATION                ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════╝${NC}"
echo ""

# Install API Gateway
echo -e "${YELLOW}=== API Gateway ===${NC}"
install_service "API Gateway" "$SCRIPT_DIR/api-gateway"
echo ""

# Install Microservices
echo -e "${YELLOW}=== Microservices ===${NC}"

install_service "User Service" "$SCRIPT_DIR/services/user-service"
echo ""

install_service "Hotel Service" "$SCRIPT_DIR/services/hotel-service"
echo ""

install_service "Flight Service" "$SCRIPT_DIR/services/flight-service"
echo ""

install_service "Activity Service" "$SCRIPT_DIR/services/activity-service"
echo ""

install_service "Car Service" "$SCRIPT_DIR/services/car-service"
echo ""

install_service "Itinerary Service" "$SCRIPT_DIR/services/itinerary-service"
echo ""

# ============================================
# FRONTEND INSTALLATION
# ============================================
echo -e "${CYAN}╔═══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   FRONTEND INSTALLATION                ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════╝${NC}"
echo ""

install_service "Frontend" "$SCRIPT_DIR/frontend"
echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${CYAN}╔═══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   INSTALLATION SUMMARY                 ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Successfully installed: $SUCCESS_COUNT service(s)${NC}"

if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}❌ Failed to install: $FAIL_COUNT service(s)${NC}"
    echo ""
    echo "Failed services:"
    for service in "${FAILED_SERVICES[@]}"; do
        echo -e "  ${RED}- $service${NC}"
    done
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ All services installed successfully!${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "  1. Create a .env file in the root directory (see README.md)"
    echo "  2. Set up your MySQL database"
    echo "  3. Run ./START_MICROSERVICES.sh to start backend services"
    echo "  4. Run 'cd frontend && npm start' to start the frontend"
    echo ""
    exit 0
fi

