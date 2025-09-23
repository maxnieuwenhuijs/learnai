import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UnsavedChangesProvider } from "@/contexts/UnsavedChangesContext";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { LoginPage } from "@/pages/LoginPage";
import { AuthSuccessPage } from "@/pages/AuthSuccessPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { MyCoursesPage } from "@/pages/MyCoursesPage";
import { CoursePage } from "@/pages/CoursePage";
import { CertificatesPage } from "@/pages/CertificatesPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { TeamPage } from "@/pages/TeamPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { PromptsPage } from "@/pages/PromptsPage";

// Admin Pages
import AdminCoursesPage from "@/pages/admin/AdminCoursesPage";
import CourseBuilderPage from "@/pages/admin/CourseBuilderPage";
import ModuleManagerPage from "@/pages/admin/ModuleManagerPage";
import QuizBuilderPage from "@/pages/admin/QuizBuilderPage";
import ContentUploadPage from "@/pages/admin/ContentUploadPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminPromptsPage } from "@/pages/admin/AdminPromptsPage";

// Super Admin Pages
import SuperAdminDashboard from "@/pages/admin/SuperAdminDashboard";
import SuperAdminCompaniesPage from "@/pages/admin/SuperAdminCompaniesPage";
import SuperAdminPromptsPage from "@/pages/admin/SuperAdminPromptsPage";
import SuperAdminUsersPage from "@/pages/admin/SuperAdminUsersPage";
import SuperAdminAnalyticsPage from "@/pages/admin/SuperAdminAnalyticsPage";
import CompanyDetailPage from "@/pages/admin/CompanyDetailPage";

function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<UnsavedChangesProvider>
					<Router>
						<Routes>
							{/* Public Routes */}
							<Route path='/login' element={<LoginPage />} />
							<Route path='/auth-success' element={<AuthSuccessPage />} />

							{/* Protected Routes */}
							<Route element={<ProtectedRoute />}>
								<Route path='/dashboard' element={<DashboardPage />} />
								<Route path='/courses' element={<MyCoursesPage />} />
								<Route path='/course/:courseId' element={<CoursePage />} />
								<Route
									path='/course-preview/:courseId'
									element={<CoursePage />}
								/>
								<Route path='/certificates' element={<CertificatesPage />} />
								<Route path='/calendar' element={<CalendarPage />} />
								<Route path='/team' element={<TeamPage />} />
								<Route path='/reports' element={<ReportsPage />} />
								<Route path='/prompts' element={<PromptsPage />} />
								<Route path='/settings' element={<SettingsPage />} />

								{/* Admin Routes - Protected with role check */}
								<Route path='/admin' element={<AdminDashboard />} />
								<Route path='/admin/dashboard' element={<AdminDashboard />} />
								<Route path='/admin/users' element={<AdminUsersPage />} />
								<Route path='/admin/prompts' element={<AdminPromptsPage />} />
								<Route path='/admin/courses' element={<AdminCoursesPage />} />
								<Route
									path='/admin/course-builder/:courseId'
									element={<CourseBuilderPage />}
								/>
								<Route
									path='/admin/courses/:courseId/modules/:moduleId'
									element={<ModuleManagerPage />}
								/>
								<Route
									path='/admin/quiz-builder/:quizId'
									element={<QuizBuilderPage />}
								/>
								<Route path='/admin/content' element={<ContentUploadPage />} />

								{/* Super Admin Routes - Protected with super_admin role check */}
								<Route
									path='/admin/super-admin'
									element={<SuperAdminDashboard />}
								/>
								<Route
									path='/admin/super-admin/companies'
									element={<SuperAdminCompaniesPage />}
								/>
								<Route
									path='/admin/super-admin/prompts'
									element={<SuperAdminPromptsPage />}
								/>
								<Route
									path='/admin/super-admin/users'
									element={<SuperAdminUsersPage />}
								/>
								<Route
									path='/admin/super-admin/analytics'
									element={<SuperAdminAnalyticsPage />}
								/>
								<Route
									path='/admin/companies/:companyId/dashboard'
									element={<CompanyDetailPage />}
								/>
							</Route>

							{/* Default Redirect */}
							<Route path='/' element={<Navigate to='/dashboard' replace />} />
						</Routes>
						<Toaster />
					</Router>
				</UnsavedChangesProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;
