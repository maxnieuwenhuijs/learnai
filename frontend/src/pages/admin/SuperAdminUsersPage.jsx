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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Users,
	Building,
	Shield,
	Settings,
	Activity,
	Search,
	Filter,
	Download,
	Eye,
	Edit3,
	Trash2,
	UserPlus,
	Clock,
	Mail,
	Calendar,
} from "lucide-react";

export function SuperAdminUsersPage() {
	const navigate = useNavigate();
	const [userStats, setUserStats] = useState({
		totalUsers: 0,
		superAdmins: 1,
		companyAdmins: 0,
		managers: 0,
		participants: 0,
		activeThisMonth: 0,
		recentUsers: [],
		usersByCompany: [],
		roleDistribution: [],
	});
	const [users, setUsers] = useState([]);
	const [companies, setCompanies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRole, setSelectedRole] = useState("all");
	const [selectedCompany, setSelectedCompany] = useState("all");

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		loadUsers();
	}, [searchTerm, selectedRole, selectedCompany]);

	const loadData = async () => {
		try {
			setLoading(true);

			// Real API calls to super admin endpoints
			const [usersRes, companiesRes, statsRes] = await Promise.all([
				api.get("/super-admin/users"),
				api.get("/super-admin/companies"),
				api.get("/super-admin/users/analytics"),
			]);

			const users = usersRes.data?.data?.users || [];
			const companies = companiesRes.data?.data || [];
			const stats = statsRes.data?.data || {};

			setUserStats(stats);
			setUsers(users);
			setCompanies(companies);
		} catch (error) {
			console.error("Error loading user data:", error);
			// Set empty state on error
			setUserStats({
				totalUsers: 0,
				superAdmins: 0,
				companyAdmins: 0,
				managers: 0,
				participants: 0,
				activeThisMonth: 0,
				recentUsers: [],
				usersByCompany: [],
				roleDistribution: [],
			});
			setUsers([]);
			setCompanies([]);
		} finally {
			setLoading(false);
		}
	};

	const loadUsers = async () => {
		try {
			// In real implementation, this would filter users based on search/role/company
			// For now, we'll just use the mock data
		} catch (error) {
			console.error("Error loading users:", error);
		}
	};

	const formatDateTime = (timestamp) => {
		return new Date(timestamp).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getRoleColor = (role) => {
		switch (role) {
			case "super_admin":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			case "admin":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
			case "manager":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "participant":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "inactive":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "suspended":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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
							User Management
						</h1>
						<p className='text-gray-600 dark:text-gray-400'>
							Manage users across all companies and their permissions
						</p>
					</div>
					<div className='flex gap-3'>
						<Button variant='outline'>
							<Download className='h-4 w-4 mr-2' />
							Export Users
						</Button>
						<Button>
							<UserPlus className='h-4 w-4 mr-2' />
							Add User
						</Button>
					</div>
				</div>

				{/* Stats Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
					<Card>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
										Total Users
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{userStats.totalUsers}
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
										{userStats.superAdmins}
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
										{userStats.companyAdmins}
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
										Managers
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{userStats.managers}
									</p>
									<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
										Team managers
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
										Active This Month
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{userStats.activeThisMonth}
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

				{/* Tabbed Content */}
				<Tabs defaultValue='overview' className='w-full'>
					<TabsList className='grid w-full grid-cols-4'>
						<TabsTrigger value='overview'>Overview</TabsTrigger>
						<TabsTrigger value='users'>All Users</TabsTrigger>
						<TabsTrigger value='companies'>By Company</TabsTrigger>
						<TabsTrigger value='roles'>Role Management</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value='overview' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							{/* Role Distribution */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Shield className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Role Distribution
									</CardTitle>
									<CardDescription>
										User distribution across roles
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{userStats.roleDistribution.map((role) => (
											<div
												key={role.role}
												className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
												<div className='flex items-center gap-3'>
													<Badge className={getRoleColor(role.role)}>
														{role.role.replace("_", " ").toUpperCase()}
													</Badge>
													<span className='font-medium text-gray-900 dark:text-gray-100'>
														{role.count} users
													</span>
												</div>
												<span className='text-sm text-gray-600 dark:text-gray-400'>
													{role.percentage}%
												</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Companies */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Building className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Users by Company
									</CardTitle>
									<CardDescription>
										User distribution across companies
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{userStats.usersByCompany.map((company) => (
											<div
												key={company.id}
												className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
												<div className='flex-1'>
													<h4 className='font-medium text-gray-900 dark:text-gray-100'>
														{company.name}
													</h4>
													<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
														{company.user_count} users
													</p>
												</div>
												<div className='flex items-center gap-2'>
													<Button variant='ghost' size='sm'>
														<Eye className='h-4 w-4' />
													</Button>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Recent Users */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Clock className='h-5 w-5 text-gray-600 dark:text-gray-400' />
									Recent Users
								</CardTitle>
								<CardDescription>
									Latest user registrations and activities
								</CardDescription>
							</CardHeader>
							<CardContent>
								{userStats.recentUsers.length === 0 ? (
									<div className='text-center py-8'>
										<Users className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											No recent user activity
										</p>
									</div>
								) : (
									<div className='space-y-4'>
										{userStats.recentUsers.map((user) => (
											<div
												key={user.id}
												className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
												<div className='flex items-center gap-4'>
													<div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center'>
														<Users className='h-5 w-5 text-gray-600 dark:text-gray-400' />
													</div>
													<div>
														<h4 className='font-medium text-gray-900 dark:text-gray-100'>
															{user.name}
														</h4>
														<p className='text-sm text-gray-600 dark:text-gray-400'>
															{user.email} • {user.company}
														</p>
													</div>
												</div>
												<div className='flex items-center gap-3'>
													<Badge className={getRoleColor(user.role)}>
														{user.role.replace("_", " ").toUpperCase()}
													</Badge>
													<Badge className={getStatusColor(user.status)}>
														{user.status.toUpperCase()}
													</Badge>
													<div className='flex items-center gap-2'>
														<Button variant='ghost' size='sm'>
															<Eye className='h-4 w-4' />
														</Button>
														<Button variant='ghost' size='sm'>
															<Edit3 className='h-4 w-4' />
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* All Users Tab */}
					<TabsContent value='users' className='space-y-6'>
						{/* Filters */}
						<div className='flex items-center gap-4'>
							<div className='relative flex-1 max-w-sm'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
								<Input
									placeholder='Search users...'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className='pl-10'
								/>
							</div>
							<Select value={selectedRole} onValueChange={setSelectedRole}>
								<SelectTrigger className='w-48'>
									<SelectValue placeholder='All Roles' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Roles</SelectItem>
									<SelectItem value='super_admin'>Super Admin</SelectItem>
									<SelectItem value='admin'>Admin</SelectItem>
									<SelectItem value='manager'>Manager</SelectItem>
									<SelectItem value='participant'>Participant</SelectItem>
								</SelectContent>
							</Select>
							<Select
								value={selectedCompany}
								onValueChange={setSelectedCompany}>
								<SelectTrigger className='w-48'>
									<SelectValue placeholder='All Companies' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Companies</SelectItem>
									{companies.map((company) => (
										<SelectItem key={company.id} value={company.id.toString()}>
											{company.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Users List */}
						<Card>
							<CardContent className='p-0'>
								{users.length === 0 ? (
									<div className='text-center py-12'>
										<Users className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											No users found
										</p>
									</div>
								) : (
									<div className='divide-y divide-gray-200 dark:divide-gray-700'>
										{users.map((user) => (
											<div
												key={user.id}
												className='p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
												<div className='flex items-center justify-between'>
													<div className='flex items-center gap-4'>
														<div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center'>
															<Users className='h-6 w-6 text-gray-600 dark:text-gray-400' />
														</div>
														<div>
															<h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
																{user.name}
															</h3>
															<p className='text-sm text-gray-600 dark:text-gray-400'>
																{user.email}
															</p>
															<div className='flex items-center gap-2 mt-2'>
																<Badge className={getRoleColor(user.role)}>
																	{user.role.replace("_", " ").toUpperCase()}
																</Badge>
																<Badge className={getStatusColor(user.status)}>
																	{user.status.toUpperCase()}
																</Badge>
																<span className='text-xs text-gray-500 dark:text-gray-400'>
																	Last login:{" "}
																	{user.last_login
																		? formatDateTime(user.last_login)
																		: "Never"}
																</span>
															</div>
														</div>
													</div>
													<div className='flex items-center gap-2'>
														<Button variant='ghost' size='sm'>
															<Mail className='h-4 w-4' />
														</Button>
														<Button variant='ghost' size='sm'>
															<Eye className='h-4 w-4' />
														</Button>
														<Button variant='ghost' size='sm'>
															<Edit3 className='h-4 w-4' />
														</Button>
														<Button variant='ghost' size='sm'>
															<Trash2 className='h-4 w-4' />
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* By Company Tab */}
					<TabsContent value='companies' className='space-y-6'>
						<div className='grid gap-6'>
							{companies.map((company) => (
								<Card key={company.id}>
									<CardHeader>
										<CardTitle className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<Building className='h-5 w-5 text-gray-600 dark:text-gray-400' />
												{company.name}
											</div>
											<Badge variant='outline'>
												{company.user_count} users
											</Badge>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='text-center py-8'>
											<Users className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
											<p className='text-gray-500 dark:text-gray-400'>
												Company users will be displayed here
											</p>
											<Button variant='outline' className='mt-4'>
												<Eye className='h-4 w-4 mr-2' />
												View Company Users
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					{/* Role Management Tab */}
					<TabsContent value='roles' className='space-y-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							{userStats.roleDistribution.map((role) => (
								<Card key={role.role}>
									<CardHeader>
										<CardTitle className='flex items-center gap-2'>
											<Shield className='h-5 w-5 text-gray-600 dark:text-gray-400' />
											{role.role.replace("_", " ").toUpperCase()}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='text-center'>
											<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
												{role.count}
											</p>
											<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
												{role.percentage}% of total users
											</p>
											<Button variant='outline' className='w-full'>
												<Settings className='h-4 w-4 mr-2' />
												Manage Role
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						<Card>
							<CardHeader>
								<CardTitle>Role Permissions</CardTitle>
								<CardDescription>
									Manage permissions and access levels for each role
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='text-center py-8'>
									<Shield className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
									<p className='text-gray-500 dark:text-gray-400'>
										Role permissions management will be available here
									</p>
									<Button variant='outline' className='mt-4'>
										<Settings className='h-4 w-4 mr-2' />
										Configure Permissions
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</DashboardLayout>
	);
}

export default SuperAdminUsersPage;
