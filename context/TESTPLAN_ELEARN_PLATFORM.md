# HowToWorkWith.AI E-Learning Platform - Uitgebreid Testplan

## 📋 Overzicht

Dit document beschrijft een uitgebreid end-to-end testplan voor het HowToWorkWith.AI e-learning platform. Het testplan voert een volledige workflow uit van bedrijf registratie tot cursus voltooiing en certificaat generatie.

## 🎯 Test Doelstellingen

1. **Bedrijf Onboarding**: Testen van bedrijf registratie en setup
2. **Gebruiker Management**: Testen van gebruiker creatie en rollen
3. **Cursus Management**: Testen van cursus creatie en configuratie
4. **Leerproces**: Testen van complete leerervaring
5. **Certificering**: Testen van certificaat generatie en verificatie
6. **Rapportage**: Testen van voortgang en compliance rapportage

## 🏗️ Database Schema Analyse

### Kern Entiteiten:
- **Company**: Bedrijf informatie (`id`, `name`, `created_at`)
- **Department**: Afdelingen per bedrijf (`id`, `company_id`, `name`)
- **User**: Gebruikers (`id`, `company_id`, `department_id`, `email`, `name`, `password_hash`, `role`)
- **Course**: Cursussen (`id`, `title`, `description`, `target_role`)
- **UserProgress**: Voortgang tracking
- **Certificate**: Certificaat management

### Relaties:
- Company → Department (1:N)
- Company → User (1:N)
- Department → User (1:N)
- Course → CourseAssignment → User (M:N)

## 📝 Test Data Sets

### Test Bedrijf Data:
```json
{
  "company_name": "TechCorp Solutions BV",
  "industry": "Software Development",
  "size": "50-100 employees",
  "country": "Netherlands"
}
```

### Test Afdelingen:
```json
[
  {"name": "Engineering", "description": "Software Development Team"},
  {"name": "Legal", "description": "Legal & Compliance Team"},  
  {"name": "Product", "description": "Product Management Team"},
  {"name": "HR", "description": "Human Resources Team"}
]
```

### Test Gebruikers:
```json
[
  {
    "name": "Jan Administratie",
    "email": "admin@techcorp.nl",
    "role": "admin",
    "department": "HR",
    "password": "Admin123!"
  },
  {
    "name": "Maria Manager", 
    "email": "manager@techcorp.nl",
    "role": "manager",
    "department": "Engineering",
    "password": "Manager123!"
  },
  {
    "name": "Piet Participant",
    "email": "participant@techcorp.nl", 
    "role": "participant",
    "department": "Engineering",
    "password": "User123!"
  }
]
```

### Test Cursus Data:
```json
{
  "title": "EU AI Act Fundamentals voor TechCorp",
  "description": "Uitgebreide training over EU AI Act compliance specifiek voor software ontwikkelaars",
  "category": "compliance",
  "difficulty": "intermediate",
  "duration_hours": 4,
  "modules": [
    {
      "title": "Inleiding tot EU AI Act",
      "lessons": [
        {"title": "Wat is de EU AI Act?", "type": "video", "duration": 15},
        {"title": "Waarom is compliance belangrijk?", "type": "text", "duration": 10}
      ]
    },
    {
      "title": "Risicoanalyse voor AI Systemen", 
      "lessons": [
        {"title": "Risico classificatie", "type": "interactive", "duration": 20},
        {"title": "Praktijkvoorbeeld: Software AI", "type": "case_study", "duration": 25}
      ]
    }
  ]
}
```

---

# 🧪 FASE 1: BEDRIJF REGISTRATIE EN SETUP

## Test Case 1.1: Bedrijf Account Aanmaken

### Pre-condities:
- Lege database
- Server draait op localhost:5000
- Frontend beschikbaar op localhost:3000

### Test Stappen:

#### Stap 1: Bedrijf Registratie (Backend API)
```bash
# Test POST /api/company/register (moet nog geïmplementeerd worden)
curl -X POST http://localhost:5000/api/company/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "TechCorp Solutions BV",
    "admin_email": "admin@techcorp.nl",
    "admin_name": "Jan Administratie",
    "admin_password": "Admin123!",
    "industry": "Software Development",
    "country": "Netherlands"
  }'
```

**Verwacht Resultaat:**
```json
{
  "success": true,
  "message": "Bedrijf succesvol aangemaakt",
  "company_id": 1,
  "admin_user_id": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Stap 2: Database Verificatie
```sql
-- Controleer of bedrijf is aangemaakt
SELECT * FROM companies WHERE name = 'TechCorp Solutions BV';

-- Controleer of admin gebruiker is aangemaakt  
SELECT * FROM users WHERE email = 'admin@techcorp.nl' AND role = 'admin';
```

### Test Case 1.2: Afdelingen Aanmaken

#### Stap 3: Login als Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@techcorp.nl", 
    "password": "Admin123!"
  }'
```

#### Stap 4: Afdelingen Toevoegen
```bash
# Engineering afdeling
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Engineering",
    "description": "Software Development Team"
  }'

# Legal afdeling  
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Legal", 
    "description": "Legal & Compliance Team"
  }'

# Product afdeling
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Product",
    "description": "Product Management Team" 
  }'
```

**Verwacht Resultaat:** Alle afdelingen succesvol aangemaakt in database.

---

# 🧪 FASE 2: GEBRUIKER MANAGEMENT  

## Test Case 2.1: Manager Gebruiker Aanmaken

#### Stap 5: Manager Account Aanmaken
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "manager@techcorp.nl",
    "password": "Manager123!",
    "name": "Maria Manager",
    "company_id": 1,
    "department_id": 1,
    "role": "manager"
  }'
```

#### Stap 6: Manager Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@techcorp.nl",
    "password": "Manager123!"
  }'
```

**Verwacht Resultaat:** Token ontvangen met manager role.

## Test Case 2.2: Participant Gebruikers Aanmaken

#### Stap 7: Meerdere Participants Aanmaken
```bash
# Participant 1 - Engineering
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "participant1@techcorp.nl",
    "password": "User123!",
    "name": "Piet Participant",
    "company_id": 1, 
    "department_id": 1,
    "role": "participant"
  }'

# Participant 2 - Legal
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "participant2@techcorp.nl",
    "password": "User123!",
    "name": "Lisa Legal",
    "company_id": 1,
    "department_id": 2, 
    "role": "participant"
  }'

# Participant 3 - Product
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "participant3@techcorp.nl",
    "password": "User123!",
    "name": "Bob Product",
    "company_id": 1,
    "department_id": 3,
    "role": "participant"  
  }'
```

#### Stap 8: Gebruiker Lijst Ophalen
```bash
curl -X GET http://localhost:5000/api/team/members \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Verwacht Resultaat:** Lijst met alle gebruikers van het bedrijf.

---

# 🧪 FASE 3: CURSUS CREATIE EN CONFIGURATIE

## Test Case 3.1: Cursus Aanmaken (Frontend Test)

#### Stap 9: Login Frontend als Admin
1. Navigeer naar `http://localhost:3000/login`
2. Log in met: `admin@techcorp.nl` / `Admin123!`
3. Ga naar Admin Courses pagina: `/admin/courses`

#### Stap 10: Nieuwe Cursus Aanmaken
1. Klik op "Create Course" button
2. Vul in:
   - **Title**: "EU AI Act Fundamentals voor TechCorp"
   - **Description**: "Uitgebreide training over EU AI Act compliance specifiek voor software ontwikkelaars"
   - **Category**: "Compliance"
   - **Difficulty**: "Intermediate" 
   - **Duration**: 4 hours
3. Klik "Create Course"
4. Word doorgestuurd naar Course Builder

#### Stap 11: Modules en Lessen Toevoegen
1. **Module 1 toevoegen:**
   - Title: "Inleiding tot EU AI Act"
   - Description: "Basis principes en achtergrond"
   
2. **Lessen toevoegen aan Module 1:**
   - Lesson 1.1: "Wat is de EU AI Act?" (Video, 15 min)
   - Lesson 1.2: "Waarom is compliance belangrijk?" (Text, 10 min)
   - Lesson 1.3: "Quiz: Basisprincipes" (Quiz, 5 min)

3. **Module 2 toevoegen:**
   - Title: "Risicoanalyse voor AI Systemen"
   - Description: "Praktische toepassing van risico assessment"
   
4. **Lessen toevoegen aan Module 2:**
   - Lesson 2.1: "Risico classificatie" (Interactive, 20 min)
   - Lesson 2.2: "Praktijkvoorbeeld: Software AI" (Case Study, 25 min)
   - Lesson 2.3: "Eindassessment" (Quiz, 15 min)

#### Stap 12: Cursus Publiceren
1. Ga terug naar course overview
2. Klik "Publish Course"
3. Bevestig publicatie

## Test Case 3.2: Cursus Toewijzing

#### Stap 13: Cursus Toewijzen aan Gebruikers
```bash
# Toewijzen aan alle Engineering gebruikers
curl -X POST http://localhost:5000/api/team/assign-course \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "course_id": 1,
    "user_ids": [2, 3],
    "deadline": "2024-12-31T23:59:59.000Z",
    "assigned_by": 1
  }'
```

#### Stap 14: Toewijzing Verificeren
```bash
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer $PARTICIPANT_TOKEN"
```

**Verwacht Resultaat:** Participant ziet toegewezen cursus in "My Courses".

---

# 🧪 FASE 4: LEERPROCES EN VOORTGANG

## Test Case 4.1: Participant Leerervaring

#### Stap 15: Login als Participant (Frontend)
1. Log uit als admin
2. Log in als: `participant1@techcorp.nl` / `User123!`
3. Ga naar "My Courses"

#### Stap 16: Cursus Starten
1. Zie cursus "EU AI Act Fundamentals voor TechCorp" 
2. Status: "Not Started"
3. Klik "Start Course"
4. Word doorgestuurd naar eerste les

#### Stap 17: Les Voltooien
1. **Les 1.1 voltooien:**
   - Start video les "Wat is de EU AI Act?"
   - Bekijk volledig (15 min simulatie)
   - Klik "Mark as Complete"

2. **Voortgang API Call:**
```bash
curl -X POST http://localhost:5000/api/progress/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PARTICIPANT_TOKEN" \
  -d '{
    "event_type": "lesson_completed",
    "course_id": 1,
    "module_id": 1, 
    "lesson_id": 1,
    "time_spent": 900,
    "completion_percentage": 100
  }'
```

#### Stap 18: Module Progress Tracken
1. Ga door alle lessen van Module 1
2. Controleer voortgang dashboard
3. Verwacht: Module 1 = 100% complete

#### Stap 19: Quiz Maken
1. Start Quiz "Basisprincipes"
2. Beantwoord alle vragen
3. Behaal score ≥ 80%
4. Module wordt gemarkeerd als voltooid

## Test Case 4.2: Manager Voortgang Monitoring

#### Stap 20: Login als Manager
1. Log in als: `manager@techcorp.nl` / `Manager123!`
2. Ga naar "Team" pagina

#### Stap 21: Team Voortgang Bekijken
1. Zie overzicht van alle team members
2. Controleer voortgang per persoon
3. Filter op afdeling/cursus
4. Bekijk detailed progress reports

#### Stap 22: Voortgang API Verificatie
```bash
curl -X GET http://localhost:5000/api/team/progress \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Verwacht Resultaat:**
```json
{
  "team_progress": [
    {
      "user_id": 3,
      "name": "Piet Participant", 
      "course_progress": [
        {
          "course_id": 1,
          "course_title": "EU AI Act Fundamentals voor TechCorp",
          "overall_progress": 50,
          "modules_completed": 1,
          "total_modules": 2,
          "last_activity": "2024-01-15T14:30:00Z"
        }
      ]
    }
  ]
}
```

---

# 🧪 FASE 5: CURSUS VOLTOOIING EN CERTIFICERING

## Test Case 5.1: Cursus Voltooiing

#### Stap 23: Alle Modules Voltooien
1. Login als participant
2. Voltooi Module 2:
   - Les 2.1: "Risico classificatie" 
   - Les 2.2: "Praktijkvoorbeeld: Software AI"
   - Les 2.3: "Eindassessment" (≥ 85% score vereist)

#### Stap 24: Finale Assessment
1. Start eindassessment 
2. Beantwoord alle vragen correct
3. Behaal minimum score van 85%
4. Cursus wordt gemarkeerd als "Completed"

## Test Case 5.2: Certificaat Generatie

#### Stap 25: Automatische Certificaat Generatie
```bash
# Trigger certificate generation
curl -X POST http://localhost:5000/api/certificates/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PARTICIPANT_TOKEN" \
  -d '{
    "course_id": 1,
    "user_id": 3,
    "final_score": 92,
    "completion_date": "2024-01-15T16:45:00Z"
  }'
```

#### Stap 26: Certificaat Verificatie (Frontend)
1. Ga naar "Certificates" pagina  
2. Zie nieuw certificaat voor voltooide cursus
3. Klik "View Certificate"
4. Controleer PDF generatie
5. Test "Download Certificate" 
6. Test "Share Certificate" functie

#### Stap 27: Certificaat Verificatie API
```bash
curl -X GET http://localhost:5000/api/certificates \
  -H "Authorization: Bearer $PARTICIPANT_TOKEN"
```

**Verwacht Resultaat:**
```json
{
  "certificates": [
    {
      "id": 1,
      "certificate_id": "CERT-2024-001-TECHCORP",
      "course_title": "EU AI Act Fundamentals voor TechCorp",
      "user_name": "Piet Participant",
      "issued_date": "2024-01-15",
      "expiry_date": "2026-01-15", 
      "score": 92,
      "status": "valid",
      "verification_url": "https://app.howtoworkwith.ai/certificates/verify/CERT-2024-001-TECHCORP"
    }
  ]
}
```

---

# 🧪 FASE 6: RAPPORTAGE EN COMPLIANCE

## Test Case 6.1: Admin Rapportage

#### Stap 28: Compliance Rapport Genereren
```bash
curl -X GET http://localhost:5000/api/reports/compliance \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "date_from": "2024-01-01",
    "date_to": "2024-01-31",
    "departments": ["Engineering", "Legal", "Product"]
  }'
```

#### Stap 29: Team Progress Rapport
```bash  
curl -X GET http://localhost:5000/api/reports/team \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "course_id": 1,
    "include_details": true
  }'
```

#### Stap 30: Export Functionaliteit Testen
1. Login als admin (frontend)
2. Ga naar "Reports" pagina
3. Genereer compliance rapport
4. Test PDF export
5. Test Excel export 
6. Verificeer data correctheid

## Test Case 6.2: Deadline Monitoring

#### Stap 31: Deadline Waarschuwingen
```bash
# Test deadline reminder systeem
curl -X POST http://localhost:5000/api/email/send-deadline-reminders \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Stap 32: Notificaties Systeem
1. Controleer notification center (frontend)
2. Verificeer email notificaties
3. Test deadline alerts

---

# 🧪 FASE 7: INTEGRATIE EN STRESS TESTING

## Test Case 7.1: Multi-User Scenario

#### Stap 33: Gelijktijdige Gebruikers Simuleren
1. Open 5 browser sessies
2. Log in als verschillende gebruikers:
   - 1x Admin
   - 1x Manager  
   - 3x Participants
3. Voer gelijktijdig acties uit:
   - Admin: Nieuwe cursus aanmaken
   - Manager: Team voortgang bekijken
   - Participants: Les voltooien

#### Stap 34: Database Integriteit Controleren
```sql
-- Controleer data consistentie
SELECT 
  u.name,
  u.role,
  d.name as department,
  c.name as company,
  COUNT(ua.course_id) as assigned_courses,
  COUNT(up.course_id) as courses_with_progress
FROM users u
JOIN departments d ON u.department_id = d.id
JOIN companies c ON u.company_id = c.id
LEFT JOIN user_assignments ua ON u.id = ua.user_id  
LEFT JOIN user_progress up ON u.id = up.user_id
GROUP BY u.id;
```

## Test Case 7.2: API Performance Testing

#### Stap 35: Load Testing
```bash
# Test course loading performance
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/courses

# Test user authentication performance  
ab -n 500 -c 5 -p login_data.json -T application/json \
  http://localhost:5000/api/auth/login
```

---

# ✅ VERWACHTE EINDRESULTATEN

Na succesvolle uitvoering van alle test cases:

## Database Status:
- **1 Company**: TechCorp Solutions BV
- **3 Departments**: Engineering, Legal, Product  
- **4 Users**: 1 Admin, 1 Manager, 2 Participants
- **1 Course**: EU AI Act Fundamentals (2 modules, 6 lessen)
- **3 Course Assignments**: Toegewezen aan alle users
- **1+ Certificates**: Voor voltooide cursussen
- **Progress Records**: Voor alle user-course combinaties

## Functionele Verificaties:
✅ Bedrijf registratie en setup  
✅ Multi-role gebruiker management  
✅ Cursus creatie en publicatie  
✅ Cursus toewijzing aan gebruikers  
✅ Volledige leerervaring (video, tekst, quiz)  
✅ Voortgang tracking en rapportage  
✅ Certificaat generatie en verificatie  
✅ Manager dashboard en team monitoring  
✅ Admin rapportage en compliance tracking  
✅ Email notificaties en deadlines  
✅ Export functionaliteit (PDF/Excel)  

## Performance Verificaties:
✅ Multi-user concurrent access  
✅ API response times < 500ms  
✅ Database query performance  
✅ File upload/download functionaliteit  
✅ Real-time updates en notifications

---

# 🚨 FAILURE SCENARIOS

## Kritieke Failure Points:
1. **Database Connection Failure** → Graceful error handling
2. **Authentication Token Expiry** → Automatic refresh
3. **File Upload Errors** → Clear error messages  
4. **Course Progress Loss** → Data recovery procedures
5. **Certificate Generation Failure** → Retry mechanisms
6. **Email Delivery Failure** → Queue retry system

## Recovery Procedures:
- Database backup restore
- User session recovery
- Progress data reconstruction  
- Certificate re-generation
- System health monitoring

---

# 📊 TEST EXECUTION CHECKLIST

- [ ] **Pre-Setup**: Clean database, servers running
- [ ] **Phase 1**: Company registration ✅
- [ ] **Phase 2**: User management ✅  
- [ ] **Phase 3**: Course creation ✅
- [ ] **Phase 4**: Learning process ✅
- [ ] **Phase 5**: Certification ✅
- [ ] **Phase 6**: Reporting ✅
- [ ] **Phase 7**: Integration testing ✅
- [ ] **Post-Test**: Data verification ✅

**Geschatte Testtijd**: 4-6 uur voor complete uitvoering  
**Vereist Team**: 1 Tester + 1 Developer (voor issue resolving)  
**Test Environment**: Lokale development setup + staging database

---

**Document Versie**: 1.0  
**Laatste Update**: Januar 2025  
**Test Owner**: Development Team  
**Approval**: Stakeholders