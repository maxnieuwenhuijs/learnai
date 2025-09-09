# Frontend Architecture - HowToWorkWith.AI

## 🎨 Frontend Overzicht

De frontend is gebouwd met React 18 en Vite, met Tailwind CSS voor styling en shadcn/ui voor componenten. Het systeem ondersteunt responsive design en moderne UX patterns.

## 📁 Project Structuur

```
frontend/
├── src/
│   ├── api/                 # API client modules
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components
│   │   ├── prompts/        # Prompt-specific components
│   │   ├── shared/         # Shared components
│   │   └── ui/             # Base UI components
│   ├── contexts/           # React contexts
│   ├── features/           # Feature-specific components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Route page components
│   └── styles/             # Global styles
├── public/                 # Static assets
├── package.json
└── vite.config.js
```

## 🎯 Pagina's & Routes

### Public Routes
- `/login` - Login pagina
- `/auth-success` - OAuth success callback

### Protected Routes
- `/dashboard` - Hoofddashboard (role-based)
- `/courses` - Mijn cursussen
- `/course/:courseId` - Cursus detail
- `/certificates` - Certificaten
- `/calendar` - Kalender
- `/team` - Team beheer (managers+)
- `/reports` - Rapporten (managers+)
- `/prompts` - Prompts systeem
- `/settings` - Instellingen

### Admin Routes
- `/admin/courses` - Cursus beheer
- `/admin/course-builder/:courseId` - Cursus builder
- `/admin/courses/:courseId/modules/:moduleId` - Module beheer
- `/admin/quiz-builder/:quizId` - Quiz builder
- `/admin/content` - Content upload

## 🧩 Component Architectuur

### Layout Components
- `DashboardLayout` - Hoofd layout wrapper
- `Header` - Navigatie header
- `Sidebar` - Navigatie sidebar
- `ProtectedRoute` - Route protection

### UI Components (shadcn/ui)
- `Button` - Button component
- `Card` - Card component
- `Input` - Input component
- `Select` - Select component
- `Tabs` - Tabs component
- `Badge` - Badge component
- `Progress` - Progress bar
- `Dialog` - Modal dialog
- `Table` - Data table
- `Alert` - Alert component

### Feature Components
- `PromptGenerator` - Prompt generatie
- `PromptCreator` - Prompt creatie
- `CategoryCreator` - Categorie creatie
- `CourseSidebar` - Cursus navigatie
- `LessonContent` - Les content
- `NotificationCenter` - Notificaties

### Dashboard Components
- `ParticipantDashboard` - Participant dashboard
- `ManagerDashboard` - Manager dashboard
- `AdminDashboard` - Admin dashboard

## 🔄 State Management

### React Context
- `AuthContext` - Authentication state
- `ThemeContext` - Theme management

### Local State
- React hooks (useState, useEffect)
- Custom hooks voor data fetching
- Form state management

### API Integration
- Axios interceptors
- Automatic token management
- Error handling
- Loading states

## 🎨 Styling & Design

### Tailwind CSS
- Utility-first CSS framework
- Responsive design
- Dark mode support
- Custom color palette

### Design System
- Consistent spacing
- Typography scale
- Color tokens
- Component variants

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔐 Authentication Flow

### Login Process
1. User enters credentials
2. API call to `/api/auth/login`
3. JWT token stored in localStorage
4. User redirected to dashboard
5. Token included in subsequent requests

### OAuth Flow
1. User clicks OAuth button
2. Redirect to OAuth provider
3. Callback with authorization code
4. Exchange code for JWT token
5. User logged in automatically

### Route Protection
- `ProtectedRoute` component
- Role-based access control
- Automatic redirect to login
- Token validation

## 📱 Responsive Design

### Mobile First
- Touch-friendly interfaces
- Swipe gestures
- Mobile navigation
- Optimized forms

### Tablet Support
- Sidebar navigation
- Grid layouts
- Touch interactions
- Medium screen optimizations

### Desktop Experience
- Full sidebar
- Multi-column layouts
- Keyboard shortcuts
- Advanced interactions

## 🚀 Performance Optimizations

### Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports
- Bundle optimization

### Caching
- API response caching
- Static asset caching
- Browser caching
- Service worker (future)

### Image Optimization
- WebP format support
- Lazy loading
- Responsive images
- Compression

## 🧪 Testing Strategy

### Unit Testing
- Component testing
- Hook testing
- Utility function testing
- Mock API responses

### Integration Testing
- API integration
- User flow testing
- Cross-browser testing
- Performance testing

### E2E Testing
- Critical user journeys
- Authentication flows
- Form submissions
- Navigation testing

## 🔧 Development Tools

### Build Tools
- Vite for fast development
- Hot module replacement
- TypeScript support
- ESLint configuration

### Code Quality
- Prettier formatting
- ESLint rules
- Husky git hooks
- Pre-commit checks

### Development Server
- Local development
- API proxy
- Environment variables
- Debug tools

## 📊 Analytics & Monitoring

### User Analytics
- Page views
- User interactions
- Performance metrics
- Error tracking

### Performance Monitoring
- Core Web Vitals
- Load times
- Bundle sizes
- Runtime performance

## 🎯 Accessibility

### WCAG Compliance
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus management

### ARIA Labels
- Semantic HTML
- ARIA attributes
- Role definitions
- State management

## 🔄 Future Enhancements

### Planned Features
- PWA support
- Offline functionality
- Push notifications
- Advanced animations

### Performance
- Service worker
- Background sync
- Advanced caching
- Bundle optimization

### UX Improvements
- Micro-interactions
- Advanced animations
- Gesture support
- Voice commands
