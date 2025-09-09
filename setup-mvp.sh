#!/bin/bash

# HowToWorkWith.AI MVP Setup Script
# This script sets up a fresh database and creates the Super Admin account

echo "🚀 Setting up HowToWorkWith.AI MVP..."
echo ""

# Check if we're in the right directory
if [ ! -d "server" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the root project directory"
    exit 1
fi

echo "📁 Found project directories"

# Change to server directory
cd server

echo "🔄 Resetting database and creating Super Admin..."

# Run the reset script
npm run db:reset

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "🎯 SUPER ADMIN LOGIN CREDENTIALS:"
    echo "Email: superadmin@howtoworkwith.ai"
    echo "Password: SuperAdmin123!"
    echo "Role: super_admin"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Start the backend server: cd server && npm run dev"
    echo "2. Start the frontend: cd frontend && npm run dev"  
    echo "3. Open browser to: http://localhost:3000"
    echo "4. Login with the super admin credentials above"
    echo "5. Go to 'Platform Admin' or 'Companies' to manage the system"
    echo ""
    echo "💡 You can now:"
    echo "   - Create companies with admin accounts"
    echo "   - Add users to companies"
    echo "   - Create and assign courses"
    echo "   - Reset the database anytime with: npm run db:reset"
    echo ""
else
    echo "❌ Database setup failed. Check the error messages above."
    exit 1
fi