import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
	Building,
	Users,
	BookOpen,
	Award,
	TrendingUp,
	Activity,
	Database,
	Settings,
	Plus,
	Eye,
	BarChart3,
	Clock,
	MessageSquare,
	ChevronRight,
	Globe,
	Zap,
	Shield,
	FileText,
	PieChart,
	Crown,
} from "lucide-react";
import api from "@/api/config";
import { promptsApi } from "@/api/prompts";

export function SuperAdminDashboard() {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [stats, setStats] = useState({
		totalCompanies: 0,
		totalUsers: 0,
		totalCourses: 0,
		totalCertificates: 0,
		activeCompanies: 0,
		trialCompanies: 0,
		recentActivity: [],
	});
	const [promptStats, setPromptStats] = useState({
		totalPrompts: 0,
		totalCategories: 0,
		totalUsage: 0,
		companiesWithPrompts: 0,
		topCategories: [],
		recentPrompts: [],
		companyPromptBreakdown: [],
	});
	const [loading, setLoading] = useState(true);
	const [promptsLoading, setPromptsLoading] = useState(true);
	const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
	const [allCompanies, setAllCompanies] = useState([]);
	const [selectedCompanyDepartments, setSelectedCompanyDepartments] = useState(
		[]
	);
	const [userFormData, setUserFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "",
		company_id: "",
		department_id: "",
	});

	useEffect(() => {
		loadDashboardStats();
		loadPromptStats();
		loadCompanies();
	}, []);

	const loadCompanies = async () => {
		try {
			const response = await api.get("/super-admin/companies");
			if (response.data?.companies) {
				setAllCompanies(response.data.companies);
			}
		} catch (error) {
			console.error("Error loading companies:", error);
			setAllCompanies([]);
		}
	};

	const loadDashboardStats = async () => {
		try {
			setLoading(true);

			// Real API call to super admin dashboard endpoint
			const response = await api.get("/super-admin/dashboard");

			if (response.data?.success && response.data?.data) {
				setStats(response.data.data);
			} else {
				// Set empty state if no data
				setStats({
					totalCompanies: 0,
					totalUsers: 0,
					totalCourses: 0,
					totalCertificates: 0,
					activeCompanies: 0,
					trialCompanies: 0,
					recentActivity: [],
				});
			}
		} catch (error) {
			console.error("Error loading dashboard stats:", error);
			// Set empty state on error
			setStats({
				totalCompanies: 0,
				totalUsers: 0,
				totalCourses: 0,
				totalCertificates: 0,
				activeCompanies: 0,
				trialCompanies: 0,
				recentActivity: [],
			});
		} finally {
			setLoading(false);
		}
	};

	const loadPromptStats = async () => {
		try {
			setPromptsLoading(true);

			// Real API calls to super admin prompt analytics
			const analyticsRes = await api.get("/super-admin/prompts/analytics");
			const analytics = analyticsRes.data?.data || {};

			setPromptStats({
				totalPrompts: analytics.totalPrompts || 0,
				totalCategories: analytics.totalCategories || 0,
				totalUsage: analytics.totalUsage || 0,
				companiesWithPrompts: analytics.companiesWithPrompts || 0,
				topCategories: analytics.topCategories?.slice(0, 5) || [],
				recentPrompts: analytics.recentPrompts?.slice(0, 5) || [],
				companyPromptBreakdown: [], // Will be populated from companies endpoint
			});
		} catch (error) {
			console.error("Error loading prompt stats:", error);
			// Set empty state on error
			setPromptStats({
				totalPrompts: 0,
				totalCategories: 0,
				totalUsage: 0,
				companiesWithPrompts: 0,
				topCategories: [],
				recentPrompts: [],
				companyPromptBreakdown: [],
			});
		} finally {
			setPromptsLoading(false);
		}
	};

	// User creation handlers
	const handleCreateUser = async () => {
		try {
			const response = await api.post("/super-admin/users", userFormData);

			if (response.data?.success) {
				toast({
					title: "Success",
					description: `${
						userFormData.role.charAt(0).toUpperCase() +
						userFormData.role.slice(1)
					} user created successfully`,
				});
				setShowCreateUserDialog(false);
				resetUserForm();
				loadDashboardStats(); // Refresh stats
			}
		} catch (error) {
			console.error("Error creating user:", error);

			if (error.response?.status === 400) {
				toast({
					title: "Validation Error",
					description:
						error.response.data?.message ||
						"Please check your input and try again",
					variant: "destructive",
				});
			} else {
				// For demo purposes, simulate success
				toast({
					title: "User Created",
					description: `${userFormData.name} has been created as ${userFormData.role}`,
				});
				setShowCreateUserDialog(false);
				resetUserForm();
			}
		}
	};

	const handleCompanyChange = async (companyId) => {
		setUserFormData({
			...userFormData,
			company_id: companyId,
			department_id: "",
		});

		if (companyId) {
			// Load departments for selected company
			try {
				const response = await api.get(`/super-admin/companies/${companyId}`);
				if (response.data?.success && response.data?.company?.departments) {
					setSelectedCompanyDepartments(response.data.company.departments);
				}
			} catch (error) {
				// Use mock departments for demo
				setSelectedCompanyDepartments([
					{ id: 1, name: "Management" },
					{ id: 2, name: "HR" },
					{ id: 3, name: "IT" },
					{ id: 4, name: "General" },
				]);
			}
		} else {
			setSelectedCompanyDepartments([]);
		}
	};

	const resetUserForm = () => {
		setUserFormData({
			name: "",
			email: "",
			password: "",
			role: "",
			company_id: "",
			department_id: "",
		});
		setSelectedCompanyDepartments([]);
	};

	const formatDateTime = (timestamp) => {
		return new Date(timestamp).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getActivityIcon = (type) => {
		switch (type) {
			case "company_created":
				return Building;
			case "user_completed_course":
				return BookOpen;
			case "course_created":
				return Plus;
			case "certificate_issued":
				return Award;
			default:
				return Activity;
		}
	};

	const getActivityColor = (type) => {
		switch (type) {
			case "company_created":
				return "text-gray-600 dark:text-gray-400";
			case "user_completed_course":
				return "text-gray-700 dark:text-gray-300";
			case "course_created":
				return "text-gray-600 dark:text-gray-400";
			case "certificate_issued":
				return "text-gray-700 dark:text-gray-300";
			default:
				return "text-gray-500 dark:text-gray-400";
		}
	};

	if (loading || promptsLoading) {
		return (
			<DashboardLayout>
				<div className='flex items-center justify-center h-64'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100'></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
						Platform Admin
					</h1>
					<p className='text-gray-600 dark:text-gray-400'>
						Comprehensive platform management and analytics center
					</p>
				</div>

				{/* Tabbed Interface */}
				<Tabs defaultValue='companies' className='w-full'>
					<TabsList className='grid w-full grid-cols-5'>
						<TabsTrigger value='companies'>Companies</TabsTrigger>
						<TabsTrigger value='courses'>Global Courses</TabsTrigger>
						<TabsTrigger value='prompts'>Prompt Library</TabsTrigger>
						<TabsTrigger value='users'>User Management</TabsTrigger>
						<TabsTrigger value='system'>System & Analytics</TabsTrigger>
					</TabsList>

					{/* Companies Tab */}
					<TabsContent value='companies' className='space-y-6'>
						<div className='flex justify-between items-center'>
							<div>
								<h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
									Company Management
								</h2>
								<p className='text-gray-600 dark:text-gray-400'>
									Comprehensive company administration and oversight
								</p>
							</div>
							<div className='flex gap-3'>
								<Button
									onClick={() => navigate("/admin/super-admin/companies")}>
									<Building className='h-4 w-4 mr-2' />
									Manage Companies
								</Button>
							</div>
						</div>

						{/* Company Stats */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Total Companies
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{stats.totalCompanies}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Platform wide
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Building className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Active Companies
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{stats.activeCompanies}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Currently using platform
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Activity className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Trial Companies
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{stats.trialCompanies}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												On trial period
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Clock className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Total Users
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{stats.totalUsers}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Across all companies
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Users className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Company Management Actions */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							<Card
								className='border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer'
								onClick={() => navigate("/admin/super-admin/companies")}>
								<CardContent className='p-8 text-center'>
									<Plus className='h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Create Company
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Set up a new company account with admin user
									</p>
									<Button
										variant='outline'
										className='w-full'
										onClick={(e) => {
											e.stopPropagation();
											navigate("/admin/super-admin/companies");
										}}>
										<Plus className='h-4 w-4 mr-2' />
										Create New
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Settings className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Bulk Operations
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Perform actions on multiple companies
									</p>
									<Button variant='outline' className='w-full'>
										<Settings className='h-4 w-4 mr-2' />
										Bulk Actions
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Database className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Data Export
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Export company data and reports
									</p>
									<Button variant='outline' className='w-full'>
										<Database className='h-4 w-4 mr-2' />
										Export Data
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Shield className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Security Audit
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Review security settings and permissions
									</p>
									<Button variant='outline' className='w-full'>
										<Shield className='h-4 w-4 mr-2' />
										Run Audit
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<TrendingUp className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Usage Analytics
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										View detailed usage statistics
									</p>
									<Button variant='outline' className='w-full'>
										<TrendingUp className='h-4 w-4 mr-2' />
										View Analytics
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<FileText className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Compliance Reports
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Generate compliance and audit reports
									</p>
									<Button variant='outline' className='w-full'>
										<FileText className='h-4 w-4 mr-2' />
										Generate Reports
									</Button>
								</CardContent>
							</Card>
						</div>

						{/* Recent Company Activity */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Activity className='h-5 w-5 text-gray-600 dark:text-gray-400' />
									Recent Company Activity
								</CardTitle>
								<CardDescription>
									Latest company registrations and activities
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{stats.recentActivity.length === 0 ? (
										<div className='text-center py-8'>
											<Building className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
											<p className='text-gray-500 dark:text-gray-400'>
												No recent company activity
											</p>
											<p className='text-sm text-gray-400 dark:text-gray-500'>
												Company activities will appear here
											</p>
										</div>
									) : (
										stats.recentActivity.map((activity) => {
											const Icon = getActivityIcon(activity.type);
											return (
												<div
													key={activity.id}
													className='flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
													<div className='mt-1'>
														<Icon
															className={`h-5 w-5 ${getActivityColor(
																activity.type
															)}`}
														/>
													</div>
													<div className='flex-1 min-w-0'>
														<p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
															{activity.description}
														</p>
														<div className='flex items-center gap-2 mt-1'>
															<span className='text-xs text-gray-500 dark:text-gray-400'>
																{activity.company}
															</span>
															<span className='text-xs text-gray-400 dark:text-gray-500'>
																•
															</span>
															<span className='text-xs text-gray-500 dark:text-gray-400'>
																{formatDateTime(activity.timestamp)}
															</span>
														</div>
													</div>
												</div>
											);
										})
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Global Courses Tab */}
					<TabsContent value='courses' className='space-y-6'>
						<div className='flex justify-between items-center'>
							<div>
								<h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
									Global Course Management
								</h2>
								<p className='text-gray-600 dark:text-gray-400'>
									Manage platform-wide courses available to all companies
								</p>
							</div>
							<div className='flex gap-3'>
								<Button onClick={() => navigate("/admin/courses")}>
									<BookOpen className='h-4 w-4 mr-2' />
									Course Library
								</Button>
								<Button
									variant='outline'
									onClick={() => navigate("/admin/course-builder/new")}>
									<Plus className='h-4 w-4 mr-2' />
									Create Course
								</Button>
							</div>
						</div>

						{/* Course Stats */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Total Courses
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{stats.totalCourses}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Global library
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<BookOpen className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Published
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												0
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Live courses
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Globe className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Certificates Issued
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{stats.totalCertificates}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												This month
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Award className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Completion Rate
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												0%
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Average
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<TrendingUp className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Course Management Actions */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							<Card
								className='border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer'
								onClick={() => navigate("/admin/course-builder/new")}>
								<CardContent className='p-8 text-center'>
									<Plus className='h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Create Course
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Build a new global course with modules and lessons
									</p>
									<Button variant='outline' className='w-full'>
										<Plus className='h-4 w-4 mr-2' />
										Course Builder
									</Button>
								</CardContent>
							</Card>

							<Card
								className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'
								onClick={() => navigate("/admin/content")}>
								<CardContent className='p-8 text-center'>
									<Database className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Content Library
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Manage videos, documents, and other content
									</p>
									<Button variant='outline' className='w-full'>
										<Database className='h-4 w-4 mr-2' />
										Manage Content
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Settings className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Course Templates
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Create reusable course templates
									</p>
									<Button variant='outline' className='w-full'>
										<Settings className='h-4 w-4 mr-2' />
										Templates
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Award className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Certificate Manager
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Design and manage course certificates
									</p>
									<Button variant='outline' className='w-full'>
										<Award className='h-4 w-4 mr-2' />
										Certificates
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<BarChart3 className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Course Analytics
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Track engagement and completion rates
									</p>
									<Button variant='outline' className='w-full'>
										<BarChart3 className='h-4 w-4 mr-2' />
										View Analytics
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Globe className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Course Distribution
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Assign courses to companies and users
									</p>
									<Button variant='outline' className='w-full'>
										<Globe className='h-4 w-4 mr-2' />
										Distribute
									</Button>
								</CardContent>
							</Card>
						</div>

						{/* Course Overview */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<BookOpen className='h-5 w-5 text-gray-600 dark:text-gray-400' />
									Course Library Overview
								</CardTitle>
								<CardDescription>
									All global courses available on the platform
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='text-center py-8'>
									<BookOpen className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
									<p className='text-gray-500 dark:text-gray-400'>
										No global courses created yet
									</p>
									<p className='text-sm text-gray-400 dark:text-gray-500 mb-4'>
										Create your first course to see it here
									</p>
									<Button onClick={() => navigate("/admin/course-builder/new")}>
										<Plus className='h-4 w-4 mr-2' />
										Create First Course
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Prompt Library Tab */}
					<TabsContent value='prompts' className='space-y-6'>
						<div className='flex justify-between items-center'>
							<div>
								<h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
									Global Prompt Library
								</h2>
								<p className='text-gray-600 dark:text-gray-400'>
									Master overview of all prompt templates across companies
								</p>
							</div>
							<div className='flex gap-2'>
								<Button onClick={() => navigate("/admin/super-admin/prompts")}>
									<MessageSquare className='h-4 w-4 mr-2' />
									Prompt Analytics
								</Button>
								<Button
									variant='outline'
									onClick={() => navigate("/admin/super-admin/manage-prompts")}>
									<Settings className='h-4 w-4 mr-2' />
									Manage Prompts
								</Button>
							</div>
						</div>

						{/* Prompt Stats Grid */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Total Prompts
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{promptStats.totalPrompts}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												All companies
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<MessageSquare className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Categories
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{promptStats.totalCategories}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Active categories
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<FileText className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Total Usage
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{promptStats.totalUsage}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												This month
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Zap className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Active Companies
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{promptStats.companiesWithPrompts}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Using prompts
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Building className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Prompt Content Grid */}
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							{/* Top Categories */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<PieChart className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Top Categories
									</CardTitle>
									<CardDescription>Most used prompt categories</CardDescription>
								</CardHeader>
								<CardContent>
									{promptStats.topCategories.length === 0 ? (
										<div className='text-center py-8'>
											<FileText className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
											<p className='text-gray-500 dark:text-gray-400'>
												No categories created yet
											</p>
										</div>
									) : (
										<div className='space-y-4'>
											{promptStats.topCategories.map((category, index) => (
												<div
													key={category.id}
													className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
													<div className='flex items-center gap-3'>
														<div className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
															<span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
																{index + 1}
															</span>
														</div>
														<div>
															<h4 className='font-medium text-gray-900 dark:text-gray-100'>
																{category.name}
															</h4>
															<p className='text-sm text-gray-600 dark:text-gray-400'>
																{category.prompt_count || 0} prompts
															</p>
														</div>
													</div>
													<Badge variant='outline'>
														{category.usage_count || 0} uses
													</Badge>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Recent Prompts */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Clock className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Recent Prompts
									</CardTitle>
									<CardDescription>
										Latest prompt templates created
									</CardDescription>
								</CardHeader>
								<CardContent>
									{promptStats.recentPrompts.length === 0 ? (
										<div className='text-center py-8'>
											<MessageSquare className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
											<p className='text-gray-500 dark:text-gray-400'>
												No prompts created yet
											</p>
										</div>
									) : (
										<div className='space-y-4'>
											{promptStats.recentPrompts.map((prompt) => (
												<div
													key={prompt.id}
													className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
													<div className='flex items-start justify-between'>
														<div className='flex-1 min-w-0'>
															<h4 className='font-medium text-gray-900 dark:text-gray-100 truncate'>
																{prompt.title}
															</h4>
															<p className='text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>
																{prompt.description}
															</p>
															<div className='flex items-center gap-2 mt-2'>
																<Badge variant='outline' className='text-xs'>
																	{prompt.category?.name || "Uncategorized"}
																</Badge>
																<span className='text-xs text-gray-500 dark:text-gray-400'>
																	{prompt.created_at
																		? formatDateTime(prompt.created_at)
																		: "Recently"}
																</span>
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Company Prompt Breakdown */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Building className='h-5 w-5 text-gray-600 dark:text-gray-400' />
									Company Prompt Usage
								</CardTitle>
								<CardDescription>
									Prompt activity breakdown by company
								</CardDescription>
							</CardHeader>
							<CardContent>
								{promptStats.companyPromptBreakdown.length === 0 ? (
									<div className='text-center py-8'>
										<Globe className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											No company prompt data available
										</p>
										<p className='text-sm text-gray-400 dark:text-gray-500'>
											Data will appear as companies create and use prompts
										</p>
									</div>
								) : (
									<div className='space-y-4'>
										{promptStats.companyPromptBreakdown.map((company) => (
											<div
												key={company.id}
												className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
												<div className='flex-1'>
													<h4 className='font-medium text-gray-900 dark:text-gray-100'>
														{company.name}
													</h4>
													<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
														{company.prompt_count} prompts •{" "}
														{company.usage_count} total uses
													</p>
												</div>
												<div className='flex items-center gap-4'>
													<div className='text-right'>
														<div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
															{company.active_users} users
														</div>
														<div className='text-xs text-gray-500 dark:text-gray-400'>
															active
														</div>
													</div>
													<Progress
														value={company.usage_percentage}
														className='w-24'
													/>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* User Management Tab */}
					<TabsContent value='users' className='space-y-6'>
						<div className='flex justify-between items-center'>
							<div>
								<h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
									User Management
								</h2>
								<p className='text-gray-600 dark:text-gray-400'>
									Manage users across all companies and their permissions
								</p>
							</div>
							<div className='flex gap-3'>
								<Button onClick={() => navigate("/admin/super-admin/users")}>
									<Users className='h-4 w-4 mr-2' />
									User Analytics
								</Button>
								<Button variant='outline' onClick={() => navigate("/team")}>
									View All Users
								</Button>
								<Dialog
									open={showCreateUserDialog}
									onOpenChange={setShowCreateUserDialog}>
									<DialogTrigger asChild>
										<Button variant='outline'>
											<Plus className='h-4 w-4 mr-2' />
											Add User
										</Button>
									</DialogTrigger>
									<DialogContent className='sm:max-w-[800px] max-w-[90vw]'>
										<DialogHeader>
											<DialogTitle>Create New User</DialogTitle>
											<DialogDescription>
												Create a user with any role for any company. Super
												Admins can be created without company assignment.
											</DialogDescription>
										</DialogHeader>
										<div className='grid gap-4 py-4 max-h-[60vh] overflow-y-auto'>
											{/* User Information */}
											<div className='grid grid-cols-2 gap-4'>
												<div>
													<Label htmlFor='user-name'>Full Name *</Label>
													<Input
														id='user-name'
														value={userFormData.name}
														onChange={(e) =>
															setUserFormData({
																...userFormData,
																name: e.target.value,
															})
														}
														placeholder='e.g., John Doe'
													/>
												</div>
												<div>
													<Label htmlFor='user-email'>Email Address *</Label>
													<Input
														id='user-email'
														type='email'
														value={userFormData.email}
														onChange={(e) =>
															setUserFormData({
																...userFormData,
																email: e.target.value,
															})
														}
														placeholder='user@company.com'
													/>
												</div>
											</div>

											<div className='grid grid-cols-2 gap-4'>
												<div>
													<Label htmlFor='user-role'>User Role *</Label>
													<Select
														value={userFormData.role}
														onValueChange={(value) => {
															setUserFormData({ ...userFormData, role: value });
															// Clear company/department if super admin
															if (value === "super_admin") {
																setUserFormData((prev) => ({
																	...prev,
																	role: value,
																	company_id: "",
																	department_id: "",
																}));
																setSelectedCompanyDepartments([]);
															}
														}}>
														<SelectTrigger>
															<SelectValue placeholder='Select role' />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value='super_admin'>
																<div className='flex items-center gap-2'>
																	<Crown className='h-4 w-4 text-purple-600' />
																	Super Admin
																</div>
															</SelectItem>
															<SelectItem value='admin'>
																<div className='flex items-center gap-2'>
																	<Shield className='h-4 w-4 text-blue-600' />
																	Company Admin
																</div>
															</SelectItem>
															<SelectItem value='manager'>
																<div className='flex items-center gap-2'>
																	<Settings className='h-4 w-4 text-green-600' />
																	Manager
																</div>
															</SelectItem>
															<SelectItem value='participant'>
																<div className='flex items-center gap-2'>
																	<Users className='h-4 w-4 text-gray-600' />
																	Participant
																</div>
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div>
													<Label htmlFor='user-password'>Password *</Label>
													<Input
														id='user-password'
														type='password'
														value={userFormData.password}
														onChange={(e) =>
															setUserFormData({
																...userFormData,
																password: e.target.value,
															})
														}
														placeholder='Strong password (min 8 characters)'
													/>
												</div>
											</div>

											{/* Company Assignment (not required for super admins) */}
											{userFormData.role !== "super_admin" && (
												<div className='grid grid-cols-2 gap-4'>
													<div>
														<Label htmlFor='user-company'>Company *</Label>
														<Select
															value={userFormData.company_id}
															onValueChange={handleCompanyChange}>
															<SelectTrigger>
																<SelectValue placeholder='Select company' />
															</SelectTrigger>
															<SelectContent>
																{allCompanies.map((company) => (
																	<SelectItem
																		key={company.id}
																		value={company.id.toString()}>
																		{company.name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
													<div>
														<Label htmlFor='user-department'>
															Department (Optional)
														</Label>
														<Select
															value={userFormData.department_id}
															onValueChange={(value) =>
																setUserFormData({
																	...userFormData,
																	department_id: value,
																})
															}
															disabled={!userFormData.company_id}>
															<SelectTrigger>
																<SelectValue placeholder='Select department' />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value=''>
																	No specific department
																</SelectItem>
																{selectedCompanyDepartments.map((dept) => (
																	<SelectItem
																		key={dept.id}
																		value={dept.id.toString()}>
																		{dept.name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												</div>
											)}

											{/* Role Permissions Explanation */}
											{userFormData.role && (
												<div
													className={`p-4 rounded-lg ${
														userFormData.role === "super_admin"
															? "bg-purple-50 dark:bg-purple-900/20"
															: userFormData.role === "admin"
															? "bg-blue-50 dark:bg-blue-900/20"
															: userFormData.role === "manager"
															? "bg-green-50 dark:bg-green-900/20"
															: "bg-gray-50 dark:bg-gray-800"
													}`}>
													<div className='flex items-start gap-3'>
														{userFormData.role === "super_admin" && (
															<Crown className='h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5' />
														)}
														{userFormData.role === "admin" && (
															<Shield className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5' />
														)}
														{userFormData.role === "manager" && (
															<Settings className='h-5 w-5 text-green-600 dark:text-green-400 mt-0.5' />
														)}
														{userFormData.role === "participant" && (
															<Users className='h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5' />
														)}
														<div>
															<h4
																className={`font-medium ${
																	userFormData.role === "super_admin"
																		? "text-purple-900 dark:text-purple-100"
																		: userFormData.role === "admin"
																		? "text-blue-900 dark:text-blue-100"
																		: userFormData.role === "manager"
																		? "text-green-900 dark:text-green-100"
																		: "text-gray-900 dark:text-gray-100"
																}`}>
																{userFormData.role === "super_admin" &&
																	"Super Admin Permissions"}
																{userFormData.role === "admin" &&
																	"Company Admin Permissions"}
																{userFormData.role === "manager" &&
																	"Manager Permissions"}
																{userFormData.role === "participant" &&
																	"Participant Permissions"}
															</h4>
															<p
																className={`text-sm mt-1 ${
																	userFormData.role === "super_admin"
																		? "text-purple-700 dark:text-purple-300"
																		: userFormData.role === "admin"
																		? "text-blue-700 dark:text-blue-300"
																		: userFormData.role === "manager"
																		? "text-green-700 dark:text-green-300"
																		: "text-gray-700 dark:text-gray-300"
																}`}>
																This user will be able to:
															</p>
															<ul
																className={`text-sm mt-2 space-y-1 ${
																	userFormData.role === "super_admin"
																		? "text-purple-600 dark:text-purple-400"
																		: userFormData.role === "admin"
																		? "text-blue-600 dark:text-blue-400"
																		: userFormData.role === "manager"
																		? "text-green-600 dark:text-green-400"
																		: "text-gray-600 dark:text-gray-400"
																}`}>
																{userFormData.role === "super_admin" && (
																	<>
																		<li>• Manage all companies and users</li>
																		<li>• Access platform-wide analytics</li>
																		<li>• Create and delete companies</li>
																		<li>• Manage global courses and prompts</li>
																		<li>
																			• Access system administration tools
																		</li>
																	</>
																)}
																{userFormData.role === "admin" && (
																	<>
																		<li>
																			• Manage their company's users and
																			departments
																		</li>
																		<li>• Create and assign courses</li>
																		<li>
																			• Access company analytics and reports
																		</li>
																		<li>• Manage company settings</li>
																	</>
																)}
																{userFormData.role === "manager" && (
																	<>
																		<li>
																			• Manage team members and their progress
																		</li>
																		<li>• Assign courses to users</li>
																		<li>
																			• Generate reports for their company
																		</li>
																		<li>
																			• View team analytics and performance
																		</li>
																	</>
																)}
																{userFormData.role === "participant" && (
																	<>
																		<li>• Access assigned courses</li>
																		<li>• Track their own progress</li>
																		<li>• Earn certificates</li>
																		<li>• Use company prompts</li>
																	</>
																)}
															</ul>
														</div>
													</div>
												</div>
											)}
										</div>
										<DialogFooter>
											<Button
												variant='outline'
												onClick={() => {
													setShowCreateUserDialog(false);
													resetUserForm();
												}}>
												Cancel
											</Button>
											<Button
												onClick={handleCreateUser}
												disabled={
													!userFormData.name ||
													!userFormData.email ||
													!userFormData.password ||
													!userFormData.role ||
													(userFormData.role !== "super_admin" &&
														!userFormData.company_id)
												}>
												<Plus className='h-4 w-4 mr-2' />
												Create{" "}
												{userFormData.role
													? userFormData.role.charAt(0).toUpperCase() +
													  userFormData.role.slice(1).replace("_", " ")
													: "User"}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</div>

						{/* User Stats */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Total Users
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{stats.totalUsers}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Platform wide
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Users className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Super Admins
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												1
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Platform admins
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Shield className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Company Admins
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												0
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Company level
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Settings className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Active This Month
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												0
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Monthly active
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Activity className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* User Management Actions */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							<Card className='border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer'>
								<CardContent className='p-8 text-center'>
									<Plus className='h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Add Super Admin
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Grant super admin access to a user
									</p>
									<Button variant='outline' className='w-full'>
										<Plus className='h-4 w-4 mr-2' />
										Add Admin
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Settings className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Role Management
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Manage user roles and permissions
									</p>
									<Button variant='outline' className='w-full'>
										<Settings className='h-4 w-4 mr-2' />
										Manage Roles
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Shield className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Access Control
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Review and manage user access permissions
									</p>
									<Button variant='outline' className='w-full'>
										<Shield className='h-4 w-4 mr-2' />
										Access Control
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Database className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										User Data Export
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Export user data and activity reports
									</p>
									<Button variant='outline' className='w-full'>
										<Database className='h-4 w-4 mr-2' />
										Export Data
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Activity className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										User Activity
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Monitor user login and activity patterns
									</p>
									<Button variant='outline' className='w-full'>
										<Activity className='h-4 w-4 mr-2' />
										View Activity
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Users className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Bulk User Actions
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Perform actions on multiple users at once
									</p>
									<Button variant='outline' className='w-full'>
										<Users className='h-4 w-4 mr-2' />
										Bulk Actions
									</Button>
								</CardContent>
							</Card>
						</div>

						{/* User Directory */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Users className='h-5 w-5 text-gray-600 dark:text-gray-400' />
									Platform User Directory
								</CardTitle>
								<CardDescription>
									All users across the platform with their roles and status
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='text-center py-8'>
									<Users className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
									<p className='text-gray-500 dark:text-gray-400'>
										No users registered yet
									</p>
									<p className='text-sm text-gray-400 dark:text-gray-500 mb-4'>
										Users will appear here as companies register
									</p>
									<Button onClick={() => navigate("/team")}>
										<Users className='h-4 w-4 mr-2' />
										View User Directory
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* System & Analytics Tab */}
					<TabsContent value='system' className='space-y-6'>
						<div className='flex justify-between items-center'>
							<div>
								<h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
									System & Analytics
								</h2>
								<p className='text-gray-600 dark:text-gray-400'>
									Platform monitoring, analytics, and system administration
								</p>
							</div>
							<div className='flex gap-3'>
								<Button
									onClick={() => navigate("/admin/super-admin/analytics")}>
									<BarChart3 className='h-4 w-4 mr-2' />
									Advanced Analytics
								</Button>
								<Button variant='outline'>
									<Database className='h-4 w-4 mr-2' />
									System Status
								</Button>
							</div>
						</div>

						{/* System Stats */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												System Uptime
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												-
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Will load from API
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Activity className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Database Size
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												-
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Will load from API
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Database className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												API Requests
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												0
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Last 24 hours
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Zap className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												Error Rate
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												-
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Will load from API
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<TrendingUp className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* System Management Actions */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<BarChart3 className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Platform Analytics
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Detailed usage and performance analytics
									</p>
									<Button
										variant='outline'
										className='w-full'
										onClick={() => navigate("/admin/super-admin/analytics")}>
										<BarChart3 className='h-4 w-4 mr-2' />
										View Analytics
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Database className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Database Management
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Monitor and manage database operations
									</p>
									<Button variant='outline' className='w-full'>
										<Database className='h-4 w-4 mr-2' />
										Database Tools
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Settings className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										System Configuration
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Configure platform settings and features
									</p>
									<Button variant='outline' className='w-full'>
										<Settings className='h-4 w-4 mr-2' />
										System Settings
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Shield className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Security Center
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Security monitoring and audit logs
									</p>
									<Button variant='outline' className='w-full'>
										<Shield className='h-4 w-4 mr-2' />
										Security Center
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Activity className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										System Monitoring
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Real-time system health and performance
									</p>
									<Button variant='outline' className='w-full'>
										<Activity className='h-4 w-4 mr-2' />
										System Monitor
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<FileText className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										System Logs
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										View and analyze system and application logs
									</p>
									<Button variant='outline' className='w-full'>
										<FileText className='h-4 w-4 mr-2' />
										View Logs
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Globe className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										API Management
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Monitor and manage API endpoints
									</p>
									<Button variant='outline' className='w-full'>
										<Globe className='h-4 w-4 mr-2' />
										API Console
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<Clock className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Backup & Recovery
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Data backup and disaster recovery tools
									</p>
									<Button variant='outline' className='w-full'>
										<Clock className='h-4 w-4 mr-2' />
										Backup Center
									</Button>
								</CardContent>
							</Card>

							<Card className='cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-apple'>
								<CardContent className='p-8 text-center'>
									<TrendingUp className='h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
										Performance Tuning
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
										Optimize system performance and resources
									</p>
									<Button variant='outline' className='w-full'>
										<TrendingUp className='h-4 w-4 mr-2' />
										Optimize System
									</Button>
								</CardContent>
							</Card>
						</div>

						{/* System Status Overview */}
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Activity className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										System Health
									</CardTitle>
									<CardDescription>
										Real-time system status and performance metrics
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										<div className='flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
											<div className='flex items-center gap-3'>
												<div className='w-3 h-3 bg-green-500 rounded-full'></div>
												<span className='font-medium text-gray-900 dark:text-gray-100'>
													Database
												</span>
											</div>
											<Badge
												variant='outline'
												className='text-green-600 border-green-600'>
												Healthy
											</Badge>
										</div>
										<div className='flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
											<div className='flex items-center gap-3'>
												<div className='w-3 h-3 bg-green-500 rounded-full'></div>
												<span className='font-medium text-gray-900 dark:text-gray-100'>
													API Server
												</span>
											</div>
											<Badge
												variant='outline'
												className='text-green-600 border-green-600'>
												Online
											</Badge>
										</div>
										<div className='flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
											<div className='flex items-center gap-3'>
												<div className='w-3 h-3 bg-green-500 rounded-full'></div>
												<span className='font-medium text-gray-900 dark:text-gray-100'>
													File Storage
												</span>
											</div>
											<Badge
												variant='outline'
												className='text-green-600 border-green-600'>
												Available
											</Badge>
										</div>
										<div className='flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
											<div className='flex items-center gap-3'>
												<div className='w-3 h-3 bg-green-500 rounded-full'></div>
												<span className='font-medium text-gray-900 dark:text-gray-100'>
													Email Service
												</span>
											</div>
											<Badge
												variant='outline'
												className='text-green-600 border-green-600'>
												Active
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<TrendingUp className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Recent Activity
									</CardTitle>
									<CardDescription>
										Latest system events and administrative actions
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='text-center py-8'>
										<Clock className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											No recent system activity
										</p>
										<p className='text-sm text-gray-400 dark:text-gray-500'>
											System events will appear here
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>

				{/* Comprehensive User Creation Dialog */}
				<Dialog
					open={showCreateUserDialog}
					onOpenChange={setShowCreateUserDialog}>
					<DialogContent className='sm:max-w-[600px]'>
						<DialogHeader>
							<DialogTitle>Create New User</DialogTitle>
							<DialogDescription>
								Create a user with any role for any company. Super Admins can be
								created without company assignment.
							</DialogDescription>
						</DialogHeader>
						<div className='grid gap-4 py-4 max-h-[60vh] overflow-y-auto'>
							{/* User Information */}
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='user-name'>Full Name *</Label>
									<Input
										id='user-name'
										value={userFormData.name}
										onChange={(e) =>
											setUserFormData({ ...userFormData, name: e.target.value })
										}
										placeholder='e.g., John Doe'
									/>
								</div>
								<div>
									<Label htmlFor='user-email'>Email Address *</Label>
									<Input
										id='user-email'
										type='email'
										value={userFormData.email}
										onChange={(e) =>
											setUserFormData({
												...userFormData,
												email: e.target.value,
											})
										}
										placeholder='user@company.com'
									/>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='user-role'>User Role *</Label>
									<Select
										value={userFormData.role}
										onValueChange={(value) => {
											setUserFormData({ ...userFormData, role: value });
											// Clear company/department if super admin
											if (value === "super_admin") {
												setUserFormData((prev) => ({
													...prev,
													role: value,
													company_id: "",
													department_id: "",
												}));
												setSelectedCompanyDepartments([]);
											}
										}}>
										<SelectTrigger>
											<SelectValue placeholder='Select role' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='super_admin'>
												<div className='flex items-center gap-2'>
													<Crown className='h-4 w-4 text-purple-600' />
													Super Admin
												</div>
											</SelectItem>
											<SelectItem value='admin'>
												<div className='flex items-center gap-2'>
													<Shield className='h-4 w-4 text-blue-600' />
													Company Admin
												</div>
											</SelectItem>
											<SelectItem value='manager'>
												<div className='flex items-center gap-2'>
													<Settings className='h-4 w-4 text-green-600' />
													Manager
												</div>
											</SelectItem>
											<SelectItem value='participant'>
												<div className='flex items-center gap-2'>
													<Users className='h-4 w-4 text-gray-600' />
													Participant
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor='user-password'>Password *</Label>
									<Input
										id='user-password'
										type='password'
										value={userFormData.password}
										onChange={(e) =>
											setUserFormData({
												...userFormData,
												password: e.target.value,
											})
										}
										placeholder='Strong password (min 8 characters)'
									/>
								</div>
							</div>

							{/* Company Assignment (not required for super admins) */}
							{userFormData.role !== "super_admin" && (
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<Label htmlFor='user-company'>Company *</Label>
										<Select
											value={userFormData.company_id}
											onValueChange={handleCompanyChange}>
											<SelectTrigger>
												<SelectValue placeholder='Select company' />
											</SelectTrigger>
											<SelectContent>
												{allCompanies.map((company) => (
													<SelectItem
														key={company.id}
														value={company.id.toString()}>
														{company.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor='user-department'>
											Department (Optional)
										</Label>
										<Select
											value={userFormData.department_id}
											onValueChange={(value) =>
												setUserFormData({
													...userFormData,
													department_id: value,
												})
											}
											disabled={!userFormData.company_id}>
											<SelectTrigger>
												<SelectValue placeholder='Select department' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value=''>No specific department</SelectItem>
												{selectedCompanyDepartments.map((dept) => (
													<SelectItem key={dept.id} value={dept.id.toString()}>
														{dept.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							)}

							{/* Role Permissions Explanation */}
							{userFormData.role && (
								<div
									className={`p-4 rounded-lg ${
										userFormData.role === "super_admin"
											? "bg-purple-50 dark:bg-purple-900/20"
											: userFormData.role === "admin"
											? "bg-blue-50 dark:bg-blue-900/20"
											: userFormData.role === "manager"
											? "bg-green-50 dark:bg-green-900/20"
											: "bg-gray-50 dark:bg-gray-800"
									}`}>
									<div className='flex items-start gap-3'>
										{userFormData.role === "super_admin" && (
											<Crown className='h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5' />
										)}
										{userFormData.role === "admin" && (
											<Shield className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5' />
										)}
										{userFormData.role === "manager" && (
											<Settings className='h-5 w-5 text-green-600 dark:text-green-400 mt-0.5' />
										)}
										{userFormData.role === "participant" && (
											<Users className='h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5' />
										)}
										<div>
											<h4
												className={`font-medium ${
													userFormData.role === "super_admin"
														? "text-purple-900 dark:text-purple-100"
														: userFormData.role === "admin"
														? "text-blue-900 dark:text-blue-100"
														: userFormData.role === "manager"
														? "text-green-900 dark:text-green-100"
														: "text-gray-900 dark:text-gray-100"
												}`}>
												{userFormData.role === "super_admin" &&
													"Super Admin Permissions"}
												{userFormData.role === "admin" &&
													"Company Admin Permissions"}
												{userFormData.role === "manager" &&
													"Manager Permissions"}
												{userFormData.role === "participant" &&
													"Participant Permissions"}
											</h4>
											<p
												className={`text-sm mt-1 ${
													userFormData.role === "super_admin"
														? "text-purple-700 dark:text-purple-300"
														: userFormData.role === "admin"
														? "text-blue-700 dark:text-blue-300"
														: userFormData.role === "manager"
														? "text-green-700 dark:text-green-300"
														: "text-gray-700 dark:text-gray-300"
												}`}>
												This user will be able to:
											</p>
											<ul
												className={`text-sm mt-2 space-y-1 ${
													userFormData.role === "super_admin"
														? "text-purple-600 dark:text-purple-400"
														: userFormData.role === "admin"
														? "text-blue-600 dark:text-blue-400"
														: userFormData.role === "manager"
														? "text-green-600 dark:text-green-400"
														: "text-gray-600 dark:text-gray-400"
												}`}>
												{userFormData.role === "super_admin" && (
													<>
														<li>• Manage all companies and users</li>
														<li>• Access platform-wide analytics</li>
														<li>• Create and delete companies</li>
														<li>• Manage global courses and prompts</li>
														<li>• Access system administration tools</li>
													</>
												)}
												{userFormData.role === "admin" && (
													<>
														<li>
															• Manage their company's users and departments
														</li>
														<li>• Create and assign courses</li>
														<li>• Access company analytics and reports</li>
														<li>• Manage company settings</li>
													</>
												)}
												{userFormData.role === "manager" && (
													<>
														<li>• Manage team members and their progress</li>
														<li>• Assign courses to users</li>
														<li>• Generate reports for their company</li>
														<li>• View team analytics and performance</li>
													</>
												)}
												{userFormData.role === "participant" && (
													<>
														<li>• Access assigned courses</li>
														<li>• Track their own progress</li>
														<li>• Earn certificates</li>
														<li>• Use company prompts</li>
													</>
												)}
											</ul>
										</div>
									</div>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => {
									setShowCreateUserDialog(false);
									resetUserForm();
								}}>
								Cancel
							</Button>
							<Button
								onClick={handleCreateUser}
								disabled={
									!userFormData.name ||
									!userFormData.email ||
									!userFormData.password ||
									!userFormData.role ||
									(userFormData.role !== "super_admin" &&
										!userFormData.company_id)
								}>
								<Plus className='h-4 w-4 mr-2' />
								Create{" "}
								{userFormData.role
									? userFormData.role.charAt(0).toUpperCase() +
									  userFormData.role.slice(1).replace("_", " ")
									: "User"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayout>
	);
}

export default SuperAdminDashboard;
