# Deployment Guide - E-Learning Platform

## Server Information

- **Production Server**: 209.38.40.156 (Application + MySQL Database)
- **Database Name**: db
- **Database User**: root
- **Database Host**: localhost (since MySQL runs on same server)

## Prerequisites on Server

- Node.js v20+
- PM2 (Process Manager)
- Nginx (Web Server)
- Git

## Deployment Steps

### 1. Initial Setup on Server (209.38.40.156)

```bash
# Connect to server
ssh user@209.38.40.156

# Navigate to web directory
cd /var/www

# Clone the repository
git clone https://github.com/maxnieuwenhuijs/learnai.git
cd learnai
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create production .env file
nano .env
```

Add the following to `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration - Using localhost since MySQL is on same server
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=BoomBoom10!Baby
DB_NAME=db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-production-secret-key-change-this
JWT_EXPIRE=7d

# Session Configuration
SESSION_SECRET=your-production-session-secret-change-this

# Frontend URL
FRONTEND_URL=http://209.38.40.156

# OAuth Configuration (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://209.38.40.156:5000/api/auth/google/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://209.38.40.156:5000/api/auth/microsoft/callback

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@elearning.com
SMTP_FROM_NAME=E-Learning Platform
```

### 3. Build Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.production file
nano .env.production
```

Add to `.env.production`:

```env
VITE_API_URL=http://209.38.40.156:5000/api
```

```bash
# Build the frontend
npm run build

# The built files will be in frontend/dist
```

### 4. PM2 Configuration

Create PM2 ecosystem file:

```bash
cd /var/www/learnai
nano ecosystem.config.js
```

```javascript
module.exports = {
	apps: [
		{
			name: "backend-server",
			script: "./server/src/server.js",
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: "1G",
			env: {
				NODE_ENV: "production",
				PORT: 5000,
			},
			error_file: "./logs/pm2-backend-error.log",
			out_file: "./logs/pm2-backend-out.log",
			log_file: "./logs/pm2-backend-combined.log",
			time: true,
		},
	],
};
```

### 5. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/learnai
```

```nginx
server {
    listen 80;
    server_name 209.38.40.156;

    # Frontend
    root /var/www/learnai/frontend/dist;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/learnai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Start Services

```bash
# Create logs directory
mkdir -p /var/www/learnai/logs

# Start backend with PM2
cd /var/www/learnai
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### 7. Database Migration

```bash
cd /var/www/learnai/server

# Run database migrations
npm run migrate

# Seed initial data (if needed)
npm run seed
```

## Deployment Commands

### Update Code

```bash
cd /var/www/learnai
git pull origin main

# Rebuild frontend
cd frontend
npm install
npm run build

# Update backend
cd ../server
npm install

# Restart services
pm2 restart backend-server
```

### View Logs

```bash
# PM2 logs
pm2 logs backend-server

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check Status

```bash
# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx

# Test backend
curl http://localhost:5000/api/health
```

## Troubleshooting

### Database Connection Issues

1. Verify `.env` has correct `DB_HOST=localhost`
2. Check MySQL is running: `sudo systemctl status mysql`
3. Test connection: `mysql -h localhost -u root -p db`

### PM2 Restart Loop

1. Check logs: `pm2 logs backend-server --lines 100`
2. Verify `.env` file exists and has correct values
3. Check Node.js version: `node --version` (should be v20+)

### Frontend Not Loading

1. Verify nginx configuration: `sudo nginx -t`
2. Check if dist folder exists: `ls /var/www/learnai/frontend/dist`
3. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Change SESSION_SECRET
- [ ] Configure firewall (ufw/iptables)
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Disable root SSH access
- [ ] Set up regular backups
- [ ] Configure fail2ban
- [ ] Set proper file permissions

## Monitoring

### Setup Monitoring

```bash
# Install monitoring tools
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Health Check Endpoint

The API provides a health check at:

```
http://209.38.40.156:5000/api/health
```

## Quick Fix for Current Issues

To fix the current issues on your server:

```bash
# SSH into server
ssh user@209.38.40.156

# Navigate to project directory
cd /var/www/learnai/server

# Update .env file to ensure correct database host
nano .env
# Ensure DB_HOST is set to 'localhost'

# Pull latest code with middleware fixes
git pull origin main

# Restart PM2
pm2 restart "backend server"

# Check logs
pm2 logs "backend server" --lines 50
```

## Contact & Support

- Repository: https://github.com/maxnieuwenhuijs/learnai
- Database Server Admin: 209.38.40.156
- Production Server: 209.38.40.156
