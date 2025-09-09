# HowToWorkWith.AI - E-learning Platform

Een complete e-learning platform voor howtoworkwith.ai en h2ww.ai met focus op EU AI Act compliance training.

## 🚀 Snelle Start

### Server Installatie (Ubuntu)
```bash
# 1. Clone repository
git clone <repository-url>
cd elearn

# 2. Maak een normale gebruiker aan (niet als root!)
sudo adduser learnai
sudo usermod -aG sudo learnai
sudo cp -r . /home/learnai/learnai
sudo chown -R learnai:learnai /home/learnai/learnai

# 3. Wissel naar de gebruiker en run installatie
su - learnai
cd /home/learnai/learnai
chmod +x install-server.sh
./install-server.sh

# 4. Configureer .env
nano .env

# 5. Start met PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
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
├── server/                    # Backend API (Node.js + Express)
├── frontend/                 # React frontend
├── ecosystem.config.js       # PM2 configuratie
├── env.example              # Environment template
├── install-server.sh        # Server installatie script
├── SERVER-INSTALLATION.md   # Uitgebreide installatie gids
└── FUNCTIONALITY_ANALYSIS.md # Complete functionaliteit overzicht
```

## 🔧 Technologie Stack

- **Backend**: Node.js, Express.js, MySQL, Sequelize
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui
- **Deployment**: PM2, Nginx
- **Domeinen**: howtoworkwith.ai, h2ww.ai

## 📊 Functionaliteit Status

### ✅ **Volledig Werkend (60%)**
- Authentication systeem (OAuth, JWT)
- Prompts systeem (volledig functioneel)
- Basis API endpoints
- Role-based toegang (Participant, Manager, Admin)
- Moderne UI/UX met Tailwind CSS

### ⚠️ **Gedeeltelijk Werkend (25%)**
- My Courses (UI klaar, mock data)
- Reports (layout klaar, geen real-time data)
- Team Management (interface klaar, mock data)
- Calendar (layout klaar, geen API integratie)

### ❌ **Ontbrekend (15%)**
- Course Management (creation/editing)
- Global Search functionaliteit
- File Upload systeem
- Real-time features
- Advanced Analytics

## 🎯 **Implementatie Roadmap**

### **Week 1-2: Kritieke Features**
- Course Management System
- Real API integratie (vervang mock data)
- Global Search functionaliteit

### **Week 3-4: Belangrijke Features**
- File Upload & Content Management
- Certificate System
- Settings & Profile Management

### **Week 5-6: Advanced Features**
- Real-time Updates
- Advanced Analytics & Charts
- Performance Optimization

## 📖 Documentatie

- [Server Installatie](SERVER-INSTALLATION.md) - Complete productie setup
- [Functionaliteit Analyse](FUNCTIONALITY_ANALYSIS.md) - Gedetailleerd overzicht van alle features
- [Server API](server/README.md) - Backend API documentatie

## 🌐 Domeinen

- **Hoofddomein**: https://howtoworkwith.ai
- **Kort domein**: https://h2ww.ai

Beide domeinen worden automatisch ondersteund door de CORS configuratie.

## 🔐 **Veiligheid**

- Script draait niet als root (veiligheidscheck)
- JWT authentication
- Role-based toegang
- Environment variabelen voor secrets
- CORS configuratie voor productie domeinen

## 📞 Support

Voor vragen over de installatie of configuratie, zie de [SERVER-INSTALLATION.md](SERVER-INSTALLATION.md) documentatie.

Voor een complete functionaliteit overzicht, zie [FUNCTIONALITY_ANALYSIS.md](FUNCTIONALITY_ANALYSIS.md).