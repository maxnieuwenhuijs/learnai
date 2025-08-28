# Troubleshooting Guide - Production Server

## Health Endpoint Not Working (http://209.38.40.156:5000/api/health)

### Quick Diagnosis Commands

Vanaf je lokale machine (Windows):

```powershell
# Test of server bereikbaar is
ping 209.38.40.156

# Test of port 5000 open is (PowerShell)
Test-NetConnection -ComputerName 209.38.40.156 -Port 5000

# Test health endpoint
curl http://209.38.40.156:5000/api/health
```

### SSH naar de Server

```bash
ssh root@209.38.40.156
# Of gebruik je eigen username
```

### Stap-voor-Stap Debugging op de Server

#### 1. Check Applicatie Status

```bash
# Is de applicatie geïnstalleerd?
ls -la /var/www/learnai

# Als niet geïnstalleerd, clone eerst de repo:
cd /var/www
git clone https://github.com/maxnieuwenhuijs/learnai.git
cd learnai
```

#### 2. Check PM2 Status

```bash
# Is PM2 geïnstalleerd?
pm2 --version

# Als niet geïnstalleerd:
npm install -g pm2

# Check running processes
pm2 status

# Als geen processes draaien:
cd /var/www/learnai
pm2 start ecosystem.config.js

# Check logs voor errors
pm2 logs backend-server --lines 100
```

#### 3. Check Environment Configuration

```bash
# Check of .env file bestaat
ls -la /var/www/learnai/server/.env

# Als niet bestaat, maak aan:
cd /var/www/learnai/server
cp .env.production .env

# Edit .env file
nano .env

# Zorg dat deze settings correct zijn:
# DB_HOST=localhost  (NIET 209.38.40.156)
# DB_USER=root
# DB_PASSWORD=BoomBoom10!Baby
# DB_NAME=db
# PORT=5000
```

#### 4. Install Dependencies

```bash
cd /var/www/learnai/server

# Check of node_modules bestaat
ls -la node_modules

# Als niet bestaat, installeer dependencies:
npm install

# Build frontend
cd ../frontend
npm install
npm run build
```

#### 5. Database Connection Test

```bash
# Test MySQL connection
mysql -h localhost -u root -p

# Password: BoomBoom10!Baby
# Als connected, check database:
SHOW DATABASES;
USE db;
SHOW TABLES;
EXIT;
```

#### 6. Firewall Check

```bash
# Check firewall status
sudo ufw status

# Als port 5000 niet open is:
sudo ufw allow 5000
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22

# Reload firewall
sudo ufw reload
```

#### 7. Check Port Binding

```bash
# Check wat er op port 5000 luistert
sudo netstat -tulpn | grep :5000
# Of:
sudo lsof -i :5000

# Als niets gevonden, start de applicatie:
cd /var/www/learnai
pm2 start ecosystem.config.js
```

#### 8. Direct Test zonder PM2

```bash
cd /var/www/learnai/server

# Start direct met node om errors te zien:
node src/server.js

# Kijk naar error messages
# Druk Ctrl+C om te stoppen
```

#### 9. Nginx Configuration (Optioneel)

```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx config
sudo nginx -t

# Als nginx niet geconfigureerd:
sudo nano /etc/nginx/sites-available/learnai

# Kopieer config uit deployment.md

# Enable site
sudo ln -s /etc/nginx/sites-available/learnai /etc/nginx/sites-enabled/
sudo systemctl reload nginx

# Test via nginx (port 80):
curl http://209.38.40.156/api/health
```

### Complete Setup Script

Als de applicatie helemaal niet geïnstalleerd is:

```bash
#!/bin/bash

# 1. Install Node.js (als nog niet geïnstalleerd)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2
sudo npm install -g pm2

# 3. Clone repository
cd /var/www
git clone https://github.com/maxnieuwenhuijs/learnai.git
cd learnai

# 4. Setup backend
cd server
npm install
cp .env.production .env
# Edit .env om DB_HOST=localhost te zetten
nano .env

# 5. Setup frontend
cd ../frontend
npm install
npm run build

# 6. Start met PM2
cd /var/www/learnai
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 7. Test
curl http://localhost:5000/api/health
```

### Veelvoorkomende Problemen

| Probleem | Oplossing |
|----------|-----------|
| Connection refused | Applicatie draait niet. Start met PM2 |
| Cannot connect to MySQL | Check DB_HOST=localhost in .env |
| Port 5000 blocked | Open firewall: `sudo ufw allow 5000` |
| PM2 not found | Install: `npm install -g pm2` |
| Node not found | Install Node.js v20 |
| Git repository not found | Clone: `git clone https://github.com/maxnieuwenhuijs/learnai.git` |

### Test Endpoints

Na succesvolle setup, test deze endpoints:

```bash
# Health check
curl http://209.38.40.156:5000/api/health

# Als nginx geconfigureerd:
curl http://209.38.40.156/api/health

# Login test
curl -X POST http://209.38.40.156:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

### Monitoring

```bash
# Real-time logs
pm2 logs backend-server --lines 100

# Monitor resources
pm2 monit

# Status check
pm2 status
```