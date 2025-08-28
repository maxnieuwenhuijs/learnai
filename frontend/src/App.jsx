import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { AuthSuccessPage } from '@/pages/AuthSuccessPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyCoursesPage } from '@/pages/MyCoursesPage';
import { CoursePage } from '@/pages/CoursePage';
import { CertificatesPage } from '@/pages/CertificatesPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { TeamPage } from '@/pages/TeamPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ComponentsTest } from '@/pages/ComponentsTest';

// Admin Pages
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage';
import CourseBuilderPage from '@/pages/admin/CourseBuilderPage';
import ModuleManagerPage from '@/pages/admin/ModuleManagerPage';
import QuizBuilderPage from '@/pages/admin/QuizBuilderPage';
import ContentUploadPage from '@/pages/admin/ContentUploadPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth-success" element={<AuthSuccessPage />} />
          <Route path="/test" element={<ComponentsTest />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<MyCoursesPage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Admin Routes - Protected with role check */}
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/course-builder/:courseId" element={<CourseBuilderPage />} />
            <Route path="/admin/courses/:courseId/modules/:moduleId" element={<ModuleManagerPage />} />
            <Route path="/admin/quiz-builder/:quizId" element={<QuizBuilderPage />} />
            <Route path="/admin/content" element={<ContentUploadPage />} />
          </Route>
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;