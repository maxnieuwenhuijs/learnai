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
import {
	Users,
	BookOpen,
	Award,
	Building,
	Activity,
	TrendingUp,
	UserPlus,
	Calendar,
	BarChart3,
	Settings,
	MessageSquare,
} from "lucide-react";

export function AdminDashboard() {
	const navigate = useNavigate();
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalCourses: 0,
		totalCertificates: 0,
		activeUsers: 0,
		recentActivity: [],
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadDashboardStats();
	}, []);

	const loadDashboardStats = async () => {
		try {
			setLoading(true);

			// Use admin API endpoints instead of super-admin
			const response = await api.get("/admin/dashboard");

			if (response.data?.success && response.data?.data) {
				setStats(response.data.data);
			} else {
				// Set empty state if no data
				setStats({
					totalUsers: 0,
					totalCourses: 0,
					totalCertificates: 0,
					activeUsers: 0,
					recentActivity: [],
				});
			}
		} catch (error) {
			console.error("Error loading dashboard stats:", error);
			// Set empty state on error
			setStats({
				totalUsers: 0,
				totalCourses: 0,
				totalCertificates: 0,
				activeUsers: 0,
				recentActivity: [],
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
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Admin Dashboard</h1>
						<p className='text-muted-foreground'>
							Manage your company's learning platform
						</p>
					</div>
					<div className='flex items-center space-x-2'>
						<Button onClick={() => navigate('/admin/users')}>
							<UserPlus className='mr-2 h-4 w-4' />
							Add User
						</Button>
						<Button onClick={() => navigate('/admin/courses')} variant='outline'>
							<BookOpen className='mr-2 h-4 w-4' />
							Manage Courses
						</Button>
					</div>
				</div>

				{/* Stats Cards */}
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Total Users</CardTitle>
							<Users className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.totalUsers}</div>
							<p className='text-xs text-muted-foreground'>
								Users in your company
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Active Users</CardTitle>
							<Activity className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.activeUsers}</div>
							<p className='text-xs text-muted-foreground'>
								Active in the last 30 days
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Total Courses</CardTitle>
							<BookOpen className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.totalCourses}</div>
							<p className='text-xs text-muted-foreground'>
								Courses available
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Certificates</CardTitle>
							<Award className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stats.totalCertificates}</div>
							<p className='text-xs text-muted-foreground'>
								Certificates issued
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					<Card className='cursor-pointer hover:shadow-md transition-shadow' onClick={() => navigate('/admin/users')}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>User Management</CardTitle>
							<Users className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<p className='text-xs text-muted-foreground'>
								Manage users, roles, and permissions
							</p>
						</CardContent>
					</Card>
					<Card className='cursor-pointer hover:shadow-md transition-shadow' onClick={() => navigate('/admin/courses')}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Course Management</CardTitle>
							<BookOpen className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<p className='text-xs text-muted-foreground'>
								Create and manage courses
							</p>
						</CardContent>
					</Card>
					<Card className='cursor-pointer hover:shadow-md transition-shadow' onClick={() => navigate('/admin/analytics')}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Analytics</CardTitle>
							<BarChart3 className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<p className='text-xs text-muted-foreground'>
								View reports and analytics
							</p>
						</CardContent>
					</Card>
					<Card className='cursor-pointer hover:shadow-md transition-shadow' onClick={() => navigate('/admin/prompts')}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Company Prompts</CardTitle>
							<MessageSquare className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<p className='text-xs text-muted-foreground'>
								Manage AI prompts for your company
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Latest activity in your company
						</CardDescription>
					</CardHeader>
					<CardContent>
						{stats.recentActivity && stats.recentActivity.length > 0 ? (
							<div className='space-y-4'>
								{stats.recentActivity.map((activity, index) => (
									<div key={index} className='flex items-center space-x-4'>
										<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
										<div className='flex-1 space-y-1'>
											<p className='text-sm font-medium'>{activity.name}</p>
											<p className='text-xs text-muted-foreground'>
												{activity.email} - {activity.role}
											</p>
										</div>
										<div className='text-xs text-muted-foreground'>
											{new Date(activity.created_at).toLocaleDateString()}
										</div>
									</div>
								))}
							</div>
						) : (
							<p className='text-sm text-muted-foreground'>No recent activity</p>
						)}
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}
