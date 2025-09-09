# HowToWorkWith.AI - E-learning Platform

Een complete e-learning platform voor howtoworkwith.ai en h2ww.ai.

## 🚀 Snelle Start

### Server Installatie (Ubuntu)
```bash
# 1. Clone repository
git clone <repository-url>
cd elearn

# 2. Run installatie script
chmod +x install-server.sh
./install-server.sh

# 3. Configureer .env
nano .env

# 4. Start met PM2
pm2 start ecosystem.config.js
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structuur

```
elearn/
├── server/                 # Backend API (Node.js + Express)
├── frontend/              # React frontend
├── ecosystem.config.js    # PM2 configuratie
├── env.example           # Environment template
├── install-server.sh     # Server installatie script
└── SERVER-INSTALLATION.md # Uitgebreide installatie gids
```

## 🔧 Technologie Stack

- **Backend**: Node.js, Express.js, MySQL, Sequelize
- **Frontend**: React 18, Vite, Tailwind CSS
- **Deployment**: PM2, Nginx
- **Domeinen**: howtoworkwith.ai, h2ww.ai

## 📖 Documentatie

- [Server Installatie](SERVER-INSTALLATION.md) - Complete productie setup
- [Server API](server/README.md) - Backend API documentatie

## 🌐 Domeinen

- **Hoofddomein**: https://howtoworkwith.ai
- **Kort domein**: https://h2ww.ai

Beide domeinen worden automatisch ondersteund door de CORS configuratie.

## 📞 Support

Voor vragen over de installatie of configuratie, zie de [SERVER-INSTALLATION.md](SERVER-INSTALLATION.md) documentatie.