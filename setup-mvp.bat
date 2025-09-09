@echo off
echo.
echo 🚀 Setting up HowToWorkWith.AI MVP...
echo.

:: Check if we're in the right directory
if not exist "server" (
    echo ❌ Error: Please run this script from the root project directory
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Error: Please run this script from the root project directory  
    pause
    exit /b 1
)

echo 📁 Found project directories

:: Change to server directory
cd server

echo 🔄 Resetting database and creating Super Admin...

:: Run the reset script
call npm run db:reset

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo.
    echo 🎯 SUPER ADMIN LOGIN CREDENTIALS:
    echo Email: superadmin@howtoworkwith.ai
    echo Password: SuperAdmin123!
    echo Role: super_admin
    echo.
    echo 🚀 Next steps:
    echo 1. Start the backend server: cd server && npm run dev
    echo 2. Start the frontend: cd frontend && npm run dev
    echo 3. Open browser to: http://localhost:3000
    echo 4. Login with the super admin credentials above
    echo 5. Go to 'Platform Admin' or 'Companies' to manage the system
    echo.
    echo 💡 You can now:
    echo    - Create companies with admin accounts
    echo    - Add users to companies  
    echo    - Create and assign courses
    echo    - Reset the database anytime with: npm run db:reset
    echo.
) else (
    echo ❌ Database setup failed. Check the error messages above.
    pause
    exit /b 1
)

pause