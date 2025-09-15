import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import api from "@/api/config";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	BarChart3,
	TrendingUp,
	Users,
	Building,
	BookOpen,
	MessageSquare,
	Activity,
	Globe,
	Clock,
	Download,
	Eye,
	ArrowLeft,
	Database,
	Zap,
	Award,
	PieChart,
	Calendar,
} from "lucide-react";

export function SuperAdminAnalyticsPage() {
	const navigate = useNavigate();
	const [analyticsData, setAnalyticsData] = useState({
		overview: {
			totalUsers: 0,
			totalCompanies: 0,
			totalCourses: 0,
			totalPrompts: 0,
			monthlyActiveUsers: 0,
			courseCompletions: 0,
			certificatesIssued: 0,
			promptUsage: 0,
		},
		trends: {
			userGrowth: [],
			courseEngagement: [],
			promptUsage: [],
			companyActivity: [],
		},
		performance: {
			systemUptime: 99.9,
			avgResponseTime: 245,
			errorRate: 0.1,
			dbQueries: 1250,
		},
		topCompanies: [],
		topCourses: [],
		topPrompts: [],
	});
	const [loading, setLoading] = useState(true);
	const [selectedPeriod, setSelectedPeriod] = useState("30d");

	useEffect(() => {
		loadAnalyticsData();
	}, [selectedPeriod]);

	const loadAnalyticsData = async () => {
		try {
			setLoading(true);

			// Real API calls to super admin analytics endpoints
			const [overviewRes, trendsRes, performanceRes] = await Promise.all([
				api.get("/super-admin/analytics/overview"),
				api.get("/super-admin/analytics/trends"),
				api.get("/super-admin/analytics/performance"),
			]);

			const overview = overviewRes.data?.data || {};
			const trends = trendsRes.data?.data || {};
			const performance = performanceRes.data?.data || {};

			setAnalyticsData({
				overview,
				trends,
				performance,
				topCompanies: [], // Will be added when company analytics are available
				topCourses: [], // Will be added when course analytics are available
				topPrompts: [], // Will be added when prompt analytics are available
			});
		} catch (error) {
			console.error("Error loading analytics data:", error);
			// Set empty state on error
			setAnalyticsData({
				overview: {
					totalUsers: 0,
					totalCompanies: 0,
					totalCourses: 0,
					totalPrompts: 0,
					monthlyActiveUsers: 0,
					courseCompletions: 0,
					certificatesIssued: 0,
					promptUsage: 0,
				},
				trends: {
					userGrowth: [],
					courseEngagement: [],
					promptUsage: [],
					companyActivity: [],
				},
				performance: {
					systemUptime: 0,
					avgResponseTime: 0,
					errorRate: 0,
					dbQueries: 0,
				},
				topCompanies: [],
				topCourses: [],
				topPrompts: [],
			});
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
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
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
							Platform Analytics
						</h1>
						<p className='text-gray-600 dark:text-gray-400'>
							Comprehensive platform performance and usage insights
						</p>
					</div>
					<div className='flex gap-3'>
						<Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
							<SelectTrigger className='w-32'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='7d'>Last 7 days</SelectItem>
								<SelectItem value='30d'>Last 30 days</SelectItem>
								<SelectItem value='90d'>Last 90 days</SelectItem>
								<SelectItem value='1y'>Last year</SelectItem>
							</SelectContent>
						</Select>
						<Button variant='outline'>
							<Download className='h-4 w-4 mr-2' />
							Export Report
						</Button>
					</div>
				</div>

				{/* Overview Stats */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					<Card>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
										Total Users
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{analyticsData.overview.totalUsers}
									</p>
									<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
										+12% from last month
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
										Active Companies
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{analyticsData.overview.totalCompanies}
									</p>
									<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
										All companies active
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
										Course Completions
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{analyticsData.overview.courseCompletions}
									</p>
									<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
										+24% from last month
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
										Prompt Usage
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{analyticsData.overview.promptUsage}
									</p>
									<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
										+18% from last month
									</p>
								</div>
								<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
									<MessageSquare className='w-6 h-6 text-gray-600 dark:text-gray-400' />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Tabbed Analytics */}
				<Tabs defaultValue='overview' className='w-full'>
					<TabsList className='grid w-full grid-cols-5'>
						<TabsTrigger value='overview'>Overview</TabsTrigger>
						<TabsTrigger value='users'>Users</TabsTrigger>
						<TabsTrigger value='courses'>Courses</TabsTrigger>
						<TabsTrigger value='prompts'>Prompts</TabsTrigger>
						<TabsTrigger value='system'>System</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value='overview' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							{/* User Growth */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<TrendingUp className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										User Growth
									</CardTitle>
									<CardDescription>
										Platform user growth over time
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='text-center py-8'>
										<BarChart3 className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											User growth chart will be displayed here
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Activity Heatmap */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Activity className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Activity Overview
									</CardTitle>
									<CardDescription>
										Platform activity distribution
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										<div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
											<span className='font-medium text-gray-900 dark:text-gray-100'>
												Monthly Active Users
											</span>
											<Badge variant='outline'>
												{analyticsData.overview.monthlyActiveUsers}
											</Badge>
										</div>
										<div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
											<span className='font-medium text-gray-900 dark:text-gray-100'>
												Certificates Issued
											</span>
											<Badge variant='outline'>
												{analyticsData.overview.certificatesIssued}
											</Badge>
										</div>
										<div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
											<span className='font-medium text-gray-900 dark:text-gray-100'>
												Total Courses
											</span>
											<Badge variant='outline'>
												{analyticsData.overview.totalCourses}
											</Badge>
										</div>
										<div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
											<span className='font-medium text-gray-900 dark:text-gray-100'>
												Total Prompts
											</span>
											<Badge variant='outline'>
												{analyticsData.overview.totalPrompts}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Top Companies */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Building className='h-5 w-5 text-gray-600 dark:text-gray-400' />
									Top Companies by Activity
								</CardTitle>
								<CardDescription>
									Most active companies on the platform
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{analyticsData.topCompanies.map((company, index) => (
										<div
											key={company.name}
											className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
											<div className='flex items-center gap-3'>
												<div className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
													<span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
														{index + 1}
													</span>
												</div>
												<div>
													<h4 className='font-medium text-gray-900 dark:text-gray-100'>
														{company.name}
													</h4>
													<p className='text-sm text-gray-600 dark:text-gray-400'>
														{company.users} users
													</p>
												</div>
											</div>
											<div className='flex items-center gap-2'>
												<Badge variant='outline'>
													Activity: {company.activity}%
												</Badge>
												<Button variant='ghost' size='sm'>
													<Eye className='h-4 w-4' />
												</Button>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Users Tab */}
					<TabsContent value='users' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Users className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										User Analytics
									</CardTitle>
									<CardDescription>
										User behavior and engagement metrics
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='text-center py-8'>
										<Users className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											User analytics charts will be displayed here
										</p>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<PieChart className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										User Distribution
									</CardTitle>
									<CardDescription>
										User distribution by role and company
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='text-center py-8'>
										<PieChart className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											User distribution chart will be displayed here
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Courses Tab */}
					<TabsContent value='courses' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<BookOpen className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Course Performance
									</CardTitle>
									<CardDescription>
										Course engagement and completion metrics
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{analyticsData.trends.courseEngagement.map((course) => (
											<div
												key={course.course}
												className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
												<div>
													<h4 className='font-medium text-gray-900 dark:text-gray-100'>
														{course.course}
													</h4>
													<p className='text-sm text-gray-600 dark:text-gray-400'>
														{course.completions} completions
													</p>
												</div>
												<Badge variant='outline'>⭐ {course.rating}</Badge>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Award className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Certification Trends
									</CardTitle>
									<CardDescription>
										Certificate issuance over time
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='text-center py-8'>
										<Award className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											Certification trends will be displayed here
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Prompts Tab */}
					<TabsContent value='prompts' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<MessageSquare className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Prompt Usage by Category
									</CardTitle>
									<CardDescription>Most used prompt categories</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{analyticsData.trends.promptUsage.map((category, index) => (
											<div
												key={category.category}
												className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
												<div className='flex items-center gap-3'>
													<div className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
														<span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
															{index + 1}
														</span>
													</div>
													<span className='font-medium text-gray-900 dark:text-gray-100'>
														{category.category}
													</span>
												</div>
												<Badge variant='outline'>{category.usage} uses</Badge>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<TrendingUp className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Top Performing Prompts
									</CardTitle>
									<CardDescription>
										Highest rated and most used prompts
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{analyticsData.topPrompts.map((prompt) => (
											<div
												key={prompt.title}
												className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
												<div>
													<h4 className='font-medium text-gray-900 dark:text-gray-100'>
														{prompt.title}
													</h4>
													<p className='text-sm text-gray-600 dark:text-gray-400'>
														{prompt.usage} uses
													</p>
												</div>
												<Badge variant='outline'>⭐ {prompt.rating}</Badge>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* System Tab */}
					<TabsContent value='system' className='space-y-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												System Uptime
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{analyticsData.performance.systemUptime}%
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Last 30 days
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
												Avg Response Time
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{analyticsData.performance.avgResponseTime}ms
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												API responses
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
												{analyticsData.performance.errorRate}%
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Last 24 hours
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<TrendingUp className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
												DB Queries
											</p>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
												{analyticsData.performance.dbQueries}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
												Per hour
											</p>
										</div>
										<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
											<Database className='w-6 h-6 text-gray-600 dark:text-gray-400' />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Globe className='h-5 w-5 text-gray-600 dark:text-gray-400' />
									System Performance
								</CardTitle>
								<CardDescription>
									Real-time system metrics and performance indicators
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='text-center py-8'>
									<Globe className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
									<p className='text-gray-500 dark:text-gray-400'>
										System performance charts will be displayed here
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</DashboardLayout>
	);
}

export default SuperAdminAnalyticsPage;
