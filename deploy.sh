#!/bin/bash

# E-Learning Platform Deployment Script
# Run this on the production server (209.38.40.15)

echo "🚀 Starting E-Learning Platform Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_DIR="/var/www/learnai"
BACKUP_DIR="/var/backups/learnai"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Function to check if command was successful
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1 successful${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
if [ -d "$SERVER_DIR" ]; then
    mkdir -p $BACKUP_DIR
    tar -czf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz $SERVER_DIR/server/.env $SERVER_DIR/frontend/.env.production 2>/dev/null
    echo -e "${GREEN}✓ Backup created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz${NC}"
fi

# Navigate to project directory
cd $SERVER_DIR
check_status "Navigate to project directory"

# Pull latest code
echo -e "${YELLOW}Pulling latest code from repository...${NC}"
git pull origin main
check_status "Git pull"

# Backend deployment
echo -e "${YELLOW}Deploying backend...${NC}"
cd server

# Install dependencies
npm install --production
check_status "Backend npm install"

# Run migrations if available
if [ -f "package.json" ] && grep -q "migrate" package.json; then
    echo -e "${YELLOW}Running database migrations...${NC}"
    npm run migrate 2>/dev/null || echo "No migrations to run"
fi

# Frontend deployment
echo -e "${YELLOW}Deploying frontend...${NC}"
cd ../frontend

# Install dependencies
npm install
check_status "Frontend npm install"

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build
check_status "Frontend build"

# Restart backend service
echo -e "${YELLOW}Restarting backend service...${NC}"
pm2 restart backend-server || pm2 restart "backend server" || pm2 restart 0
check_status "PM2 restart"

# Reload nginx
echo -e "${YELLOW}Reloading nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx
check_status "Nginx reload"

# Health check
echo -e "${YELLOW}Running health check...${NC}"
sleep 5
curl -f http://localhost:5000/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}⚠ Backend health check failed${NC}"
    echo "Check logs with: pm2 logs backend-server"
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check service status"
echo "  pm2 logs backend-server - View backend logs"
echo "  pm2 monit               - Monitor resources"
echo ""
echo "Access the application at: http://209.38.40.15"