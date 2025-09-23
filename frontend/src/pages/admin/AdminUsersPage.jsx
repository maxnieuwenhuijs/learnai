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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Users,
	Search,
	Filter,
	UserPlus,
	Edit3,
	Trash2,
	Mail,
	Calendar,
} from "lucide-react";

export function AdminUsersPage() {
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [departments, setDepartments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRole, setSelectedRole] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [userFormData, setUserFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "participant",
		department_id: "",
	});

	useEffect(() => {
		loadUsers();
		loadDepartments();
	}, [currentPage, searchTerm, selectedRole]);

	const loadUsers = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: currentPage,
				limit: 10,
				search: searchTerm,
				role: selectedRole,
			});

			console.log('🔍 Loading users with params:', params.toString());
			const response = await api.get(`/admin/users?${params}`);
			console.log('📥 Users response:', response.data);
			
			if (response.data?.success) {
				console.log('✅ Users loaded successfully:', response.data.data.users);
				setUsers(response.data.data.users || []);
				setTotalPages(response.data.data.totalPages || 1);
			} else {
				console.log('❌ API returned success: false');
			}
		} catch (error) {
			console.error("❌ Error loading users:", error);
			console.error("Error details:", error.response?.data);
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	const loadDepartments = async () => {
		try {
			const response = await api.get("/admin/departments");
			if (response.data?.success) {
				setDepartments(response.data.data || []);
			}
		} catch (error) {
			console.error("Error loading departments:", error);
			setDepartments([]);
		}
	};

	const handleCreateUser = async () => {
		try {
			const response = await api.post("/admin/users", userFormData);
			if (response.data?.success) {
				setShowCreateDialog(false);
				setUserFormData({
					name: "",
					email: "",
					password: "",
					role: "participant",
					department_id: "",
				});
				loadUsers();
			}
		} catch (error) {
			console.error("Error creating user:", error);
		}
	};

	const handleDeleteUser = async (userId) => {
		if (window.confirm("Are you sure you want to delete this user?")) {
			try {
				await api.delete(`/admin/users/${userId}`);
				loadUsers();
			} catch (error) {
				console.error("Error deleting user:", error);
			}
		}
	};

	const getRoleBadgeVariant = (role) => {
		switch (role) {
			case 'admin':
				return 'destructive';
			case 'manager':
				return 'default';
			case 'participant':
				return 'secondary';
			default:
				return 'outline';
		}
	};

	return (
		<DashboardLayout>
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>User Management</h1>
						<p className='text-muted-foreground'>
							Manage users in your company
						</p>
					</div>
					<Button onClick={() => setShowCreateDialog(true)}>
						<UserPlus className='mr-2 h-4 w-4' />
						Add User
					</Button>
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<CardTitle>Filters</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='flex flex-col sm:flex-row gap-4'>
							<div className='flex-1'>
								<div className='relative'>
									<Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
									<Input
										placeholder='Search users...'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className='pl-10'
									/>
								</div>
							</div>
							<Select value={selectedRole} onValueChange={setSelectedRole}>
								<SelectTrigger className='w-[180px]'>
									<SelectValue placeholder='Filter by role' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Roles</SelectItem>
									<SelectItem value='admin'>Admin</SelectItem>
									<SelectItem value='manager'>Manager</SelectItem>
									<SelectItem value='participant'>Participant</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Users Table */}
				<Card>
					<CardHeader>
						<CardTitle>Users</CardTitle>
						<CardDescription>
							Manage users in your company
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className='flex items-center justify-center h-32'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100'></div>
							</div>
						) : users.length > 0 ? (
							<div className='space-y-4'>
								{users.map((user) => (
									<div key={user.id} className='flex items-center justify-between p-4 border rounded-lg'>
										<div className='flex items-center space-x-4'>
											<div className='w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center'>
												<Users className='h-5 w-5 text-gray-600 dark:text-gray-400' />
											</div>
											<div>
												<p className='font-medium'>{user.name}</p>
												<p className='text-sm text-muted-foreground'>{user.email}</p>
												{user.department && (
													<p className='text-xs text-muted-foreground'>
														{user.department.name}
													</p>
												)}
											</div>
										</div>
										<div className='flex items-center space-x-2'>
											<Badge variant={getRoleBadgeVariant(user.role)}>
												{user.role}
											</Badge>
											<Button
												variant='outline'
												size='sm'
												onClick={() => {/* Handle edit */}}
											>
												<Edit3 className='h-4 w-4' />
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleDeleteUser(user.id)}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className='text-center text-muted-foreground py-8'>No users found</p>
						)}
					</CardContent>
				</Card>

				{/* Create User Dialog */}
				{showCreateDialog && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
						<Card className='w-full max-w-md'>
							<CardHeader>
								<CardTitle>Create User</CardTitle>
								<CardDescription>
									Add a new user to your company
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<Input
									placeholder='Full Name'
									value={userFormData.name}
									onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
								/>
								<Input
									placeholder='Email'
									type='email'
									value={userFormData.email}
									onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
								/>
								<Input
									placeholder='Password'
									type='password'
									value={userFormData.password}
									onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
								/>
								<Select
									value={userFormData.role}
									onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder='Select role' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='participant'>Participant</SelectItem>
										<SelectItem value='manager'>Manager</SelectItem>
									</SelectContent>
								</Select>
								<Select
									value={userFormData.department_id}
									onValueChange={(value) => setUserFormData({ ...userFormData, department_id: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder='Select department' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value=''>No Department</SelectItem>
										{departments.map((dept) => (
											<SelectItem key={dept.id} value={dept.id.toString()}>
												{dept.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<div className='flex justify-end space-x-2'>
									<Button
										variant='outline'
										onClick={() => setShowCreateDialog(false)}
									>
										Cancel
									</Button>
									<Button onClick={handleCreateUser}>
										Create User
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
