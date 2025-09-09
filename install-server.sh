#!/bin/bash

# ===========================================
# HOWTOWORKWITH.AI SERVER INSTALLATION SCRIPT
# ===========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root - this is not recommended for security reasons"
   print_warning "Consider creating a dedicated user for the application"
   read -p "Do you want to continue anyway? (y/N): " -n 1 -r
   echo
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
       exit 1
   fi
fi

print_status "Starting HowToWorkWith.AI Server Installation..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    print_status "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2 globally..."
    npm install -g pm2
    print_success "PM2 installed successfully"
else
    print_success "PM2 already installed: $(pm2 -v)"
fi

# Check if MySQL is installed and running
if ! command -v mysql &> /dev/null; then
    print_error "MySQL is not installed. Please install MySQL first."
    print_status "Ubuntu/Debian: sudo apt-get install mysql-server"
    print_status "CentOS/RHEL: sudo yum install mysql-server"
    exit 1
fi

print_success "MySQL detected"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p server/logs
print_success "Directories created"

# Install server dependencies
print_status "Installing server dependencies..."
cd server
npm install --production
print_success "Server dependencies installed"

# Go back to root directory
cd ..

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp env.example .env
    print_warning "Please edit .env file with your configuration before starting the server"
    print_status "Required configuration:"
    echo "  - Database credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)"
    echo "  - JWT secrets (JWT_SECRET, SESSION_SECRET)"
    echo "  - Frontend URLs (FRONTEND_URL)"
    echo "  - Email configuration (if using email features)"
    echo ""
    print_status "Edit .env file: nano .env"
    echo ""
    read -p "Press Enter after configuring .env file..."
fi

# Test database connection
print_status "Testing database connection..."
cd server
if node -e "
const { sequelize } = require('./src/config/database');
sequelize.authenticate()
  .then(() => {
    console.log('Database connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
"; then
    print_success "Database connection successful"
else
    print_error "Database connection failed. Please check your .env configuration"
    exit 1
fi

cd ..

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup
print_success "PM2 startup script configured"

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
print_success "Application started with PM2"

# Save PM2 configuration
pm2 save
print_success "PM2 configuration saved"

# Show status
print_status "Application Status:"
pm2 status

print_success "Installation completed successfully!"
echo ""
print_status "Useful commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart application"
echo "  pm2 stop all        - Stop application"
echo "  pm2 delete all      - Delete application from PM2"
echo ""
print_status "Your API is now running on port 5000"
print_status "Health check: curl http://localhost:5000/api/health"
echo ""
print_warning "Don't forget to:"
echo "  1. Configure your web server (Nginx/Apache) to proxy to port 5000"
echo "  2. Set up SSL certificates for your domains"
echo "  3. Configure firewall rules"
echo "  4. Set up database backups"
