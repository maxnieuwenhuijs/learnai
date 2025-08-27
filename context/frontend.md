# React Architectuur Blauwdruk: "Het Agentschap" E-learning Platform (JavaScript Editie)

## 1. Filosofie & Principes

* **Component-Based**: We bouwen alles op uit kleine, herbruikbare en logische componenten. Dit maakt de code voorspelbaar en makkelijk te onderhouden.
* **Feature-Colocation**: Gerelateerde bestanden (componenten, hooks, etc.) voor een specifieke feature worden bij elkaar gehouden in dezelfde map. Dit maakt de codebase overzichtelijker dan een traditionele `components`/`pages` splitsing.
* **State Management**: We gebruiken een combinatie van lokale state (`useState`) voor component-specifieke logica en globale state (React Context API) voor zaken die de hele applicatie aangaan, zoals authenticatie en gebruikersinformatie.
* **Styling**: We gebruiken **Tailwind CSS** voor utility-first styling en **shadcn/ui** als een bibliotheek van prachtig ontworpen, toegankelijke en aanpasbare basiscomponenten. Dit versnelt de ontwikkeling enorm en zorgt voor een consistente look-and-feel.

---

## 2. Project & Mappenstructuur

Een schone en logische mappenstructuur is de eerste stap. We gebruiken `.js` voor logica en `.jsx` voor componenten. Het project wordt opgezet met **Vite** voor snelle development en build performance.

src/
├── api/                  # Alle API-communicatie (bv. met Axios)
│   ├── auth.js
│   ├── courses.js
│   └── progress.js
├── assets/               # Statische bestanden zoals afbeeldingen, iconen, fonts
├── components/
│   ├── ui/               # Hier komen de shadcn/ui componenten (Button, Card, etc.)
│   └── shared/           # Complexe, herbruikbare componenten voor de hele app
│       ├── Header.jsx
│       ├── Sidebar.jsx
│       ├── ProgressBar.jsx
│       └── ProtectedRoute.jsx
├── contexts/             # Globale state management via React Context
│   └── AuthContext.js
├── features/             # De kern van de applicatie, opgedeeld per feature
│   ├── auth/             # Login, registratie
│   │   ├── LoginForm.jsx
│   │   └── RegisterPage.jsx
│   ├── dashboard/        # De dashboards voor verschillende rollen
│   │   ├── ParticipantDashboard.jsx
│   │   ├── ManagerDashboard.jsx
│   │   └── components/
│   │       ├── CourseCard.jsx
│   │       └── TeamProgressTable.jsx
│   └── course-player/    # De volledige leeromgeving
│       ├── CoursePlayerLayout.jsx
│       ├── components/
│       │   ├── CourseSidebar.jsx
│       │   ├── LessonContent.jsx
│       │   ├── LessonVideo.jsx
│       │   ├── LessonQuiz.jsx
│       │   ├── LessonLab.jsx
│       │   └── LessonDeliverableForm.jsx
│       └── hooks/
│           └── useCourseTracking.js # De logica voor het tracken van voortgang
├── hooks/                # Algemene, herbruikbare custom hooks
│   └── useAuth.js
├── lib/                  # Hulpfuncties, constanten, etc.
│   └── utils.js
├── pages/                # De top-level componenten voor elke route
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── CoursePage.jsx
│   └── NotFoundPage.jsx
└── styles/               # Globale CSS-bestanden
└── globals.css

---

## 3. Componenten in Detail

Hieronder een diepere duik in de belangrijkste componenten en hun verantwoordelijkheden.

### A. Authenticatie & Layout (`/components/shared`, `/features/auth`)

* **ProtectedRoute.jsx**: Een wrapper-component die controleert of een gebruiker is ingelogd via de `AuthContext`. Zo niet, dan wordt de gebruiker doorgestuurd naar de loginpagina.
* **Header.jsx**: De algemene header met het logo, de naam van de gebruiker en een uitlogknop. Haalt gebruikersinformatie uit de `AuthContext`.
* **LoginForm.jsx**: Het formulier voor inloggen. Beheert zijn eigen state (email/wachtwoord) en roept bij het submitten de `api/auth.js` service aan.

### B. Het Dashboard (`/features/dashboard`)

* **DashboardPage.jsx**: Dit is een 'slimme' pagina die de rol van de ingelogde gebruiker checkt (uit de `AuthContext`) en vervolgens ofwel de `ParticipantDashboard` of de `ManagerDashboard` rendert.
* **ParticipantDashboard.jsx**:
    * **Data**: Haalt de toegewezen cursussen en de algehele voortgang op via `api/courses.js`.
    * **Logica**: Mapt over de lijst van cursussen en rendert voor elke cursus een `CourseCard.jsx`.
* **CourseCard.jsx**:
    * **Props**: Ontvangt props zoals `title`, `description`, `progressPercentage`.
    * **UI**: Gebruikt `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` en `Progress` van shadcn/ui om een visueel aantrekkelijke kaart te tonen.
* **ManagerDashboard.jsx**:
    * **Data**: Haalt geaggregeerde teamdata op via de API.
    * **UI**: Toont key metrics in `Card` componenten en een gedetailleerde lijst in een `TeamProgressTable.jsx`.
* **TeamProgressTable.jsx**:
    * **UI**: Gebruikt de `Table` componenten van shadcn/ui om een sorteerbare tabel te maken met de voortgang per teamlid.

### C. De Cursus Speler (`/features/course-player`)

Dit is het meest complexe deel van de applicatie.

* **CoursePlayerLayout.jsx**:
    * **Logica**: Haalt bij het laden alle data voor de specifieke cursus op (modules, lessen, gebruikersvoortgang) en geeft deze door aan de onderliggende componenten.
    * **Layout**: Een twee-koloms layout met links de `CourseSidebar` en rechts de `LessonContent`.
* **CourseSidebar.jsx**:
    * **Props**: Ontvangt data zoals `modules`, `lessons`, `progressData`, `activeLessonId`.
    * **UI**: Toont een uitklapbare lijst van modules en lessen, elk met een statusicoon (bv. ✅, 🔄, ⚪️) gebaseerd op de voortgang.
* **LessonContent.jsx**:
    * **Logica**: Een dynamische renderer. Op basis van het `content_type` van de actieve les, rendert het de juiste component: `LessonVideo`, `LessonQuiz`, `LessonLab`, of `LessonDeliverableForm`.
* **useCourseTracking.js (Custom Hook)**:
    * **Doel**: Centraliseert alle API-calls voor het tracken van voortgang naar het `/api/progress/event` endpoint.
    * **Functies**: Biedt functies aan zoals `startLesson(lessonId)` en `completeLesson(lessonId, details)`.
    * **Tracking**: Bevat een `useEffect` hook die met `setInterval` elke 60 seconden een 'heartbeat' event (`TIME_SPENT_UPDATE`) stuurt zolang een les actief is. Ruimt zichzelf op met `clearInterval` als de component verdwijnt.
    * **Gebruik**: Componenten zoals `LessonVideo` en `LessonQuiz` importeren en gebruiken deze hook om voortgang door te geven.

---

## 4. Routing (react-router-dom)

De routing-structuur met `react-router-dom` ziet er als volgt uit in `App.jsx`:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importeer je pagina's
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CoursePage from './pages/CoursePage';
import NotFoundPage from './pages/NotFoundPage';

// Importeer je beveiligingscomponent
import ProtectedRoute from './components/shared/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Beveiligde Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/course/:courseId" element={<CoursePage />}>
            {/* Geneste route voor een specifieke les (optioneel, kan ook via state) */}
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
```

## 5. Build Tool & Development Setup

### Vite Configuration
Het project gebruikt **Vite** als build tool voor:
- Snelle development server met Hot Module Replacement (HMR)
- Optimale build performance
- Moderne ES modules support
- Plugin ecosystem voor Tailwind CSS en shadcn/ui

### shadcn/ui Integration
shadcn/ui componenten worden geïnstalleerd via de CLI en geconfigureerd met:
- Tailwind CSS voor styling
- CSS variables voor theming
- TypeScript definitions (optioneel, maar aanbevolen)
- Accessibility features ingebouwd
