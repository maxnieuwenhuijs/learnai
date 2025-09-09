# HowToWorkWith.AI Backend API

## Snelle Start

```bash
# 1. Installeer dependencies
npm install

# 2. Configureer environment
cp ../env.example ../.env
# Bewerk .env met je database credentials

# 3. Start development server
npm run dev

# 4. Start production server met PM2
npm run pm2:start
```

## Environment Variabelen

Zie `../env.example` voor alle beschikbare configuratie opties.

**Verplicht:**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database configuratie
- `JWT_SECRET`, `SESSION_SECRET` - Security keys
- `FRONTEND_URL` - Toegestane frontend domeinen

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/routes` - Lijst van alle routes
- `POST /api/auth/login` - Inloggen
- `GET /api/courses` - Cursussen ophalen
- `POST /api/progress` - Voortgang bijwerken

## Database

De applicatie gebruikt MySQL met Sequelize ORM. Database modellen zijn gedefinieerd in `src/models/`.

## PM2 Commands

```bash
npm run pm2:start    # Start applicatie
npm run pm2:stop     # Stop applicatie  
npm run pm2:restart  # Herstart applicatie
npm run pm2:logs     # Bekijk logs
npm run pm2:status   # Status check
```

## Logs

Logs worden opgeslagen in:
- `../logs/pm2-error.log` - Error logs
- `../logs/pm2-out.log` - Output logs
- `../logs/pm2-combined.log` - Gecombineerde logs
