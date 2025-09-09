# HowToWorkWith.AI Server Installation

## Snelle Installatie

Voor Ubuntu server installatie:

```bash
# 1. Clone de repository
git clone <repository-url>
cd elearn

# 2. Maak het installatie script uitvoerbaar en run het
chmod +x install-server.sh
./install-server.sh
```

## Handmatige Installatie

### Vereisten
- Ubuntu 20.04+ (of vergelijkbare Linux distributie)
- Node.js 18+
- MySQL 8.0+
- PM2 (wordt automatisch geïnstalleerd)

### Stappen

1. **Installeer Node.js 18+**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Installeer MySQL**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

3. **Configureer Database**
```bash
sudo mysql -u root -p
CREATE DATABASE howtoworkwith_ai;
CREATE USER 'howtoworkwith_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON howtoworkwith_ai.* TO 'howtoworkwith_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

4. **Configureer Environment**
```bash
cp env.example .env
nano .env
```

Vul de volgende variabelen in:
- `DB_HOST=localhost`
- `DB_USER=howtoworkwith_user`
- `DB_PASSWORD=your_secure_password`
- `DB_NAME=howtoworkwith_ai`
- `JWT_SECRET=een-zeer-lange-en-veilige-secret`
- `SESSION_SECRET=een-andere-zeer-lange-en-veilige-secret`
- `FRONTEND_URL=https://howtoworkwith.ai,https://h2ww.ai`

5. **Installeer Dependencies**
```bash
cd server
npm install --production
cd ..
```

6. **Start met PM2**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Domein Configuratie

De server is geconfigureerd voor:
- **howtoworkwith.ai** (hoofddomein)
- **h2ww.ai** (kort domein)

Beide domeinen worden automatisch herkend door de CORS configuratie.

## PM2 Commands

```bash
# Status bekijken
pm2 status

# Logs bekijken
pm2 logs

# Herstarten
pm2 restart all

# Stoppen
pm2 stop all

# Starten
pm2 start all

# Verwijderen
pm2 delete all
```

## Nginx Configuratie (Aanbevolen)

```nginx
server {
    listen 80;
    server_name howtoworkwith.ai h2ww.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name howtoworkwith.ai h2ww.ai;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Firewall Configuratie

```bash
# Open poort 22 (SSH)
sudo ufw allow 22

# Open poort 80 (HTTP)
sudo ufw allow 80

# Open poort 443 (HTTPS)
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

## Monitoring

```bash
# Server status
pm2 status

# Logs in real-time
pm2 logs --lines 100

# Memory usage
pm2 monit

# Restart bij crash
pm2 startup
```

## Troubleshooting

### Database Connection Issues
```bash
# Test database connectie
cd server
node -e "require('./src/config/database').sequelize.authenticate().then(() => console.log('OK')).catch(console.error)"
```

### Port Already in Use
```bash
# Check welke process poort 5000 gebruikt
sudo lsof -i :5000

# Kill het proces
sudo kill -9 <PID>
```

### PM2 Issues
```bash
# Reset PM2
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```

## Backup

### Database Backup
```bash
# Maak backup
mysqldump -u howtoworkwith_user -p howtoworkwith_ai > backup_$(date +%Y%m%d_%H%M%S).sql

# Herstel backup
mysql -u howtoworkwith_user -p howtoworkwith_ai < backup_file.sql
```

### Application Backup
```bash
# Backup hele applicatie
tar -czf howtoworkwith_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/elearn
```

## Updates

```bash
# Pull laatste changes
git pull origin main

# Herstart applicatie
pm2 restart all

# Check status
pm2 status
```
