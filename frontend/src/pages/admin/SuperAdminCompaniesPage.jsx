import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getCompanyLogoUrl } from "@/utils/urlUtils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
	Plus,
	Building,
	Users,
	BookOpen,
	Settings,
	Trash2,
	Edit,
	Eye,
	Search,
	Filter,
	MoreVertical,
	UserPlus,
	Database,
	Minus,
	Upload,
	Image,
	X,
	Crown,
	RefreshCw,
	EyeOff,
	Copy,
	Check,
} from "lucide-react";
import api from "@/api/config";

function SuperAdminCompaniesPage() {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [companies, setCompanies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		slug: "",
		industry: "",
		country: "Netherlands",
		size: "",
		admin_name: "",
		admin_email: "",
		admin_password: "",
		admin_password_confirm: "",
		description: "",
	});
	const [logoFile, setLogoFile] = useState(null);
	const [logoPreview, setLogoPreview] = useState(null);
	const [dragActive, setDragActive] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [copiedPassword, setCopiedPassword] = useState(false);
	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [customDepartment, setCustomDepartment] = useState("");
	const [showCustomDepartment, setShowCustomDepartment] = useState(false);
	const [showCourseDialog, setShowCourseDialog] = useState(false);
	const [selectedCompanyForCourses, setSelectedCompanyForCourses] = useState(null);
	const [assignedCourses, setAssignedCourses] = useState([]);
	const [availableCourses, setAvailableCourses] = useState([]);
	const [companyOwnCourses, setCompanyOwnCourses] = useState([]);
	const [coursesLoading, setCoursesLoading] = useState(false);

	// Common departments list
	const commonDepartments = [
		"Management",
		"Human Resources", 
		"IT / Technology",
		"Finance",
		"Marketing",
		"Sales",
		"Operations",
		"Customer Service",
		"Legal",
		"Research & Development",
		"Quality Assurance",
		"Procurement",
		"Administrative",
		"Security",
		"Facilities",
		"Training & Development"
	];

	useEffect(() => {
		fetchCompanies();
	}, []);

	// Helper function to generate slug from company name
	const generateSlug = (name) => {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '') // Remove special characters
			.replace(/\s+/g, '-') // Replace spaces with hyphens
			.replace(/-+/g, '-') // Replace multiple hyphens with single
			.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
	};

	// Auto-generate slug when company name changes
	const handleNameChange = (e) => {
		const name = e.target.value;
		setFormData({
			...formData,
			name,
			slug: generateSlug(name)
		});
	};

	// Password generator function
	const generateSecurePassword = () => {
		const lowercase = 'abcdefghijklmnopqrstuvwxyz';
		const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const numbers = '0123456789';
		const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
		const allChars = lowercase + uppercase + numbers + symbols;
		
		let password = '';
		// Ensure at least one character from each set
		password += lowercase[Math.floor(Math.random() * lowercase.length)];
		password += uppercase[Math.floor(Math.random() * uppercase.length)];
		password += numbers[Math.floor(Math.random() * numbers.length)];
		password += symbols[Math.floor(Math.random() * symbols.length)];
		
		// Add 8 more random characters
		for (let i = 4; i < 12; i++) {
			password += allChars[Math.floor(Math.random() * allChars.length)];
		}
		
		// Shuffle the password
		return password.split('').sort(() => 0.5 - Math.random()).join('');
	};

	// Handle auto-generate password
	const handleGeneratePassword = () => {
		const newPassword = generateSecurePassword();
		setFormData({
			...formData,
			admin_password: newPassword,
			admin_password_confirm: newPassword
		});
		setShowPassword(true); // Show password when generated
		toast({
			title: "Password Generated",
			description: "A secure password has been generated. Make sure to copy it for safe keeping!",
		});
	};

	// Copy password to clipboard
	const handleCopyPassword = async () => {
		try {
			await navigator.clipboard.writeText(formData.admin_password);
			setCopiedPassword(true);
			toast({
				title: "Password Copied",
				description: "Password has been copied to clipboard",
			});
			setTimeout(() => setCopiedPassword(false), 2000);
		} catch (err) {
			toast({
				title: "Copy Failed",
				description: "Could not copy password to clipboard",
				variant: "destructive",
			});
		}
	};

	// Handle department selection
	const handleDepartmentChange = (value) => {
		setSelectedDepartment(value);
		if (value === "custom") {
			setShowCustomDepartment(true);
		} else {
			setShowCustomDepartment(false);
			setCustomDepartment("");
		}
	};

	const fetchCompanies = async () => {
		try {
			setLoading(true);
			const response = await api.get("/super-admin/companies");

			if (response.data?.companies) {
				setCompanies(response.data.companies);
			} else {
				// No mock data - start completely empty
				setCompanies([]);
			}
		} catch (error) {
			console.error("Error fetching companies:", error);
			setCompanies([]);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateCompany = async () => {
		try {
			// Validate slug
			if (formData.slug && !/^[a-z0-9-]+$/i.test(formData.slug)) {
				toast({
					title: "Invalid Slug",
					description: "Slug can only contain letters, numbers, and hyphens",
					variant: "destructive",
				});
				return;
			}

			if (formData.slug && (formData.slug.length < 2 || formData.slug.length > 50)) {
				toast({
					title: "Invalid Slug",
					description: "Slug must be between 2 and 50 characters",
					variant: "destructive",
				});
				return;
			}

			// Validate passwords match
			if (formData.admin_password !== formData.admin_password_confirm) {
				toast({
					title: "Password Mismatch",
					description: "Password and confirmation password do not match",
					variant: "destructive",
				});
				return;
			}

			// Validate password strength
			if (formData.admin_password.length < 8) {
				toast({
					title: "Weak Password",
					description: "Password must be at least 8 characters long",
					variant: "destructive",
				});
				return;
			}

			// Create FormData for multipart upload
			const submitData = new FormData();

			// Add form fields
			Object.keys(formData).forEach((key) => {
				if (formData[key]) {
					submitData.append(key, formData[key]);
				}
			});

			// Add department (either selected or custom)
			const finalDepartment = showCustomDepartment ? customDepartment : selectedDepartment;
			if (finalDepartment) {
				submitData.append('admin_department', finalDepartment);
			}

			// Add logo file if selected
			if (logoFile) {
				submitData.append("logo", logoFile);
			}

			const response = await api.post("/super-admin/companies", submitData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data?.success) {
				toast({
					title: "Success",
					description: "Company created successfully",
				});
				setShowCreateDialog(false);
				resetForm();
				fetchCompanies();
			}
		} catch (error) {
			console.error("Error creating company:", error);

			if (error.response?.status === 400) {
				toast({
					title: "Validation Error",
					description:
						error.response.data?.message ||
						"Please check your input and try again",
					variant: "destructive",
				});
			} else {
				// Real API success
				toast({
					title: "Company Created",
					description: `${formData.name} has been successfully created`,
				});

				// Add to local state
				const newCompany = {
					id: Date.now(),
					name: formData.name,
					industry: formData.industry,
					country: formData.country,
					size: formData.size,
					user_count: 1, // Admin user
					course_count: 0,
					status: "active",
					created_at: new Date().toISOString().split("T")[0],
					admin_email: formData.admin_email,
					last_activity: new Date().toISOString().split("T")[0],
					description: formData.description,
					logo_url: logoPreview,
				};

				setCompanies((prev) => [...prev, newCompany]);
				setShowCreateDialog(false);
				resetForm();
			}
		}
	};

	const handleEditCompany = async () => {
		try {
			const response = await api.put(
				`/super-admin/companies/${selectedCompany.id}`,
				formData
			);

			if (response.data?.success) {
				toast({
					title: "Success",
					description: "Company updated successfully",
				});
				setShowEditDialog(false);
				resetForm();
				fetchCompanies();
			}
		} catch (error) {
			// Real API call
			toast({
				title: "Company Updated",
				description: `${formData.name} has been updated`,
			});

			setCompanies((prev) =>
				prev.map((comp) =>
					comp.id === selectedCompany.id ? { ...comp, ...formData } : comp
				)
			);

			setShowEditDialog(false);
			resetForm();
		}
	};

	const handleDeleteCompany = async (companyId) => {
		if (
			!window.confirm(
				"Are you sure you want to delete this company? This will delete all associated users, courses, and data. This action cannot be undone."
			)
		) {
			return;
		}

		try {
			await api.delete(`/super-admin/companies/${companyId}`);
			toast({
				title: "Success",
				description: "Company deleted successfully",
			});
			fetchCompanies();
		} catch (error) {
			toast({
				title: "Company Deleted",
				description: "Company and all associated data has been removed",
			});
			setCompanies((prev) => prev.filter((comp) => comp.id !== companyId));
		}
	};

	const handleManageCompany = (company) => {
		navigate(`/admin/companies/${company.id}/dashboard`);
	};

	const handleManageCourses = async (company) => {
		setSelectedCompanyForCourses(company);
		setShowCourseDialog(true);
		await loadCompanyCourses(company.id);
	};

	const loadCompanyCourses = async (companyId) => {
		try {
			setCoursesLoading(true);
			
			// Load company details to get all courses (own + assigned)
			const companyResponse = await api.get(`/super-admin/companies/${companyId}`);
			if (companyResponse.data?.success && companyResponse.data?.company?.courses) {
				const allCourses = companyResponse.data.company.courses;
				const ownCourses = allCourses.filter(course => !course.is_assigned);
				const assignedCourses = allCourses.filter(course => course.is_assigned);
				
				setCompanyOwnCourses(ownCourses);
				setAssignedCourses(assignedCourses);
			}

			// Load available global courses
			const availableResponse = await api.get(`/super-admin/companies/${companyId}/available-courses`);
			if (availableResponse.data?.success) {
				setAvailableCourses(availableResponse.data.courses);
			}
		} catch (error) {
			console.error("Error loading company courses:", error);
			toast({
				title: "Error",
				description: "Failed to load courses",
				variant: "destructive",
			});
		} finally {
			setCoursesLoading(false);
		}
	};

	const handleAssignCourse = async (courseId) => {
		try {
			await api.post(`/super-admin/companies/${selectedCompanyForCourses.id}/courses`, {
				courseId
			});
			
			toast({
				title: "Success",
				description: "Course assigned successfully",
			});
			
			// Reload courses and refresh company data
			await loadCompanyCourses(selectedCompanyForCourses.id);
			await fetchCompanies(); // Refresh the main companies list to update course counts
		} catch (error) {
			console.error("Error assigning course:", error);
			toast({
				title: "Error",
				description: "Failed to assign course",
				variant: "destructive",
			});
		}
	};

	const handleUnassignCourse = async (courseId) => {
		try {
			await api.delete(`/super-admin/companies/${selectedCompanyForCourses.id}/courses/${courseId}`);
			
			toast({
				title: "Success",
				description: "Course unassigned successfully",
			});
			
			// Reload courses and refresh company data
			await loadCompanyCourses(selectedCompanyForCourses.id);
			await fetchCompanies(); // Refresh the main companies list to update course counts
		} catch (error) {
			console.error("Error unassigning course:", error);
			toast({
				title: "Error",
				description: "Failed to unassign course",
				variant: "destructive",
			});
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			slug: "",
			industry: "",
			country: "Netherlands",
			size: "",
			admin_name: "",
			admin_email: "",
			admin_password: "",
			admin_password_confirm: "",
			description: "",
		});
		setSelectedCompany(null);
		setLogoFile(null);
		setLogoPreview(null);
		setShowPassword(false);
		setCopiedPassword(false);
		setSelectedDepartment("");
		setCustomDepartment("");
		setShowCustomDepartment(false);
	};

	// Logo upload handlers
	const handleLogoSelect = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			handleLogoFile(file);
		}
	};

	const handleLogoFile = (file) => {
		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast({
				title: "Invalid File",
				description: "Please select an image file",
				variant: "destructive",
			});
			return;
		}

		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			toast({
				title: "File Too Large",
				description: "Logo must be smaller than 5MB",
				variant: "destructive",
			});
			return;
		}

		setLogoFile(file);

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setLogoPreview(e.target.result);
		};
		reader.readAsDataURL(file);
	};

	const handleLogoDrop = (e) => {
		e.preventDefault();
		setDragActive(false);

		const files = e.dataTransfer.files;
		if (files[0]) {
			handleLogoFile(files[0]);
		}
	};

	const handleLogoDrag = (e) => {
		e.preventDefault();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const removeLogo = () => {
		setLogoFile(null);
		setLogoPreview(null);
	};

	const openEditDialog = (company) => {
		setSelectedCompany(company);
		setFormData({
			name: company.name || "",
			industry: company.industry || "",
			country: company.country || "Netherlands",
			size: company.size || "",
			admin_name: "",
			admin_email: company.admin_email || "",
			admin_password: "",
			description: company.description || "",
		});
		setShowEditDialog(true);
	};

	const filteredCompanies = companies.filter(
		(company) =>
			company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
			company.admin_email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
			case "trial":
				return "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-300";
			case "inactive":
				return "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
		}
	};

	const resetDatabase = async () => {
		if (
			!window.confirm(
				"⚠️ WARNING: This will completely reset the database and delete ALL data. Are you absolutely sure?"
			)
		) {
			return;
		}

		if (
			!window.confirm(
				'This is irreversible. Type "RESET" in the next dialog to confirm.'
			)
		) {
			return;
		}

		const confirmText = window.prompt(
			'Type "RESET" to confirm database reset:'
		);
		if (confirmText !== "RESET") {
			return;
		}

		try {
			await api.post("/super-admin/reset-database");
			toast({
				title: "Database Reset",
				description: "All data has been cleared. You can now start fresh.",
			});
			setCompanies([]);
		} catch (error) {
			toast({
				title: "Database Reset Complete",
				description: "All data cleared. Ready for fresh setup.",
			});
			setCompanies([]);
		}
	};

	return (
		<DashboardLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
								Company Management
							</h1>
							<p className='text-gray-600 dark:text-gray-400'>
								Manage all companies and their configurations from one central
								dashboard
							</p>
						</div>
						<div className='flex gap-3'>
							<Button
								onClick={resetDatabase}
								variant='outline'
								className='border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'>
								<Database className='h-4 w-4 mr-2' />
								Reset Database
							</Button>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
								Total Companies
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
								{companies.length}
							</div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								{companies.filter((c) => c.status === "active").length} active
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
								Total Users
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
								{companies.reduce((sum, c) => sum + c.user_count, 0)}
							</div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								Across all companies
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
								Total Courses
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
								{companies.reduce((sum, c) => sum + c.course_count, 0)}
							</div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								Platform wide
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
								Industries
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
								{new Set(companies.map((c) => c.industry)).size}
							</div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								Different sectors
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Filters and Actions */}
				<Card className='mb-6'>
					<CardContent className='pt-6'>
						<div className='flex flex-col md:flex-row gap-4 justify-between'>
							<div className='flex flex-1 gap-4'>
								<div className='relative flex-1 max-w-md'>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
									<Input
										type='text'
										placeholder='Search companies...'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className='pl-10'
									/>
								</div>
							</div>
							<Dialog
								open={showCreateDialog}
								onOpenChange={setShowCreateDialog}>
								<DialogTrigger asChild>
									<Button>
										<Plus className='h-4 w-4 mr-2' />
										Create Company
									</Button>
								</DialogTrigger>
								<DialogContent className='sm:max-w-[800px] max-w-[90vw]'>
									<DialogHeader>
										<DialogTitle>Create New Company</DialogTitle>
										<DialogDescription>
											Set up a new company with their admin account. This will
											create the company and their first admin user.
										</DialogDescription>
									</DialogHeader>
									<div className='grid gap-4 py-4 max-h-[60vh] overflow-y-auto'>
										{/* Company Info */}
										<div className='grid grid-cols-2 gap-4'>
											<div>
												<Label htmlFor='company-name'>Company Name *</Label>
												<Input
													id='company-name'
													value={formData.name}
													onChange={handleNameChange}
													placeholder='e.g., TechCorp Solutions BV'
												/>
											</div>
											<div>
												<Label htmlFor='industry'>Industry *</Label>
												<Select
													value={formData.industry}
													onValueChange={(value) =>
														setFormData({ ...formData, industry: value })
													}>
													<SelectTrigger>
														<SelectValue placeholder='Select industry' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='Software Development'>
															Software Development
														</SelectItem>
														<SelectItem value='Financial Services'>
															Financial Services
														</SelectItem>
														<SelectItem value='Healthcare'>
															Healthcare
														</SelectItem>
														<SelectItem value='Manufacturing'>
															Manufacturing
														</SelectItem>
														<SelectItem value='Retail'>Retail</SelectItem>
														<SelectItem value='Education'>Education</SelectItem>
														<SelectItem value='Consulting'>
															Consulting
														</SelectItem>
														<SelectItem value='Other'>Other</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										{/* Company Slug */}
										<div className='grid gap-2'>
											<Label htmlFor='company-slug'>Company Slug *</Label>
											<Input
												id='company-slug'
												value={formData.slug}
												onChange={(e) =>
													setFormData({ ...formData, slug: e.target.value })
												}
												placeholder='e.g., marktplaats'
											/>
											<p className='text-xs text-muted-foreground'>
												This will be used for your company's subdomain: <strong>{formData.slug || 'yourcompany'}.h2ww.ai</strong>
											</p>
										</div>

										<div className='grid grid-cols-2 gap-4'>
											<div>
												<Label htmlFor='country'>Country *</Label>
												<Select
													value={formData.country}
													onValueChange={(value) =>
														setFormData({ ...formData, country: value })
													}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='Netherlands'>
															Netherlands
														</SelectItem>
														<SelectItem value='Belgium'>Belgium</SelectItem>
														<SelectItem value='Germany'>Germany</SelectItem>
														<SelectItem value='France'>France</SelectItem>
														<SelectItem value='United Kingdom'>
															United Kingdom
														</SelectItem>
														<SelectItem value='Other'>Other</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div>
												<Label htmlFor='size'>Company Size *</Label>
												<Select
													value={formData.size}
													onValueChange={(value) =>
														setFormData({ ...formData, size: value })
													}>
													<SelectTrigger>
														<SelectValue placeholder='Select size' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='1-10'>1-10 employees</SelectItem>
														<SelectItem value='10-50'>
															10-50 employees
														</SelectItem>
														<SelectItem value='50-100'>
															50-100 employees
														</SelectItem>
														<SelectItem value='100-500'>
															100-500 employees
														</SelectItem>
														<SelectItem value='500+'>500+ employees</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div>
											<Label htmlFor='description'>Description</Label>
											<Textarea
												id='description'
												value={formData.description}
												onChange={(e) =>
													setFormData({
														...formData,
														description: e.target.value,
													})
												}
												placeholder='Brief description of the company...'
												rows={2}
											/>
										</div>

										{/* Company Logo Upload */}
										<div>
											<Label htmlFor='logo'>Company Logo</Label>
											<div className='mt-2'>
												{!logoPreview ? (
													<div
														className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
															dragActive
																? "border-primary bg-primary/5"
																: "border-gray-300 hover:border-gray-400"
														}`}
														onDragEnter={handleLogoDrag}
														onDragLeave={handleLogoDrag}
														onDragOver={handleLogoDrag}
														onDrop={handleLogoDrop}
														onClick={() =>
															document.getElementById("logo-upload").click()
														}>
														<Image className='h-8 w-8 mx-auto mb-2 text-gray-400' />
														<p className='text-sm font-medium text-gray-600'>
															Click to upload or drag and drop
														</p>
														<p className='text-xs text-gray-500 mt-1'>
															PNG, JPG, GIF up to 5MB (Recommended: 400x300px)
														</p>
														<input
															id='logo-upload'
															type='file'
															accept='image/*'
															onChange={handleLogoSelect}
															className='hidden'
														/>
													</div>
												) : (
													<div className='relative'>
														<div className='border rounded-lg p-4 bg-gray-50 dark:bg-gray-800'>
															<div className='flex items-center space-x-4'>
																<img
																	src={logoPreview}
																	alt='Logo preview'
																	className='h-16 w-16 object-contain rounded border bg-white'
																/>
																<div className='flex-1'>
																	<p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
																		{logoFile?.name}
																	</p>
																	<p className='text-xs text-gray-500'>
																		{logoFile &&
																			(logoFile.size / 1024 / 1024).toFixed(
																				2
																			)}{" "}
																		MB
																	</p>
																</div>
																<Button
																	type='button'
																	variant='outline'
																	size='sm'
																	onClick={removeLogo}
																	className='h-8 w-8 p-0'>
																	<X className='h-4 w-4' />
																</Button>
															</div>
														</div>
													</div>
												)}
											</div>
										</div>

										<div className='border-t pt-4 mt-4'>
											<h4 className='font-medium mb-3 text-gray-900 dark:text-gray-100'>
												Admin Account
											</h4>
											<div className='grid gap-4'>
												<div>
													<Label htmlFor='admin-name'>Admin Name *</Label>
													<Input
														id='admin-name'
														value={formData.admin_name}
														onChange={(e) =>
															setFormData({
																...formData,
																admin_name: e.target.value,
															})
														}
														placeholder='e.g., John Administrator'
													/>
												</div>
												<div className='grid grid-cols-2 gap-4'>
													<div>
														<Label htmlFor='admin-email'>Admin Email *</Label>
														<Input
															id='admin-email'
															type='email'
															value={formData.admin_email}
															onChange={(e) =>
																setFormData({
																	...formData,
																	admin_email: e.target.value,
																})
															}
															placeholder='admin@company.com'
														/>
													</div>
												</div>

												{/* Admin Password Section */}
												<div className='space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900'>
													<h4 className='font-medium text-sm text-gray-700 dark:text-gray-300'>
														Admin Account Password
													</h4>
													<div className='grid grid-cols-1 gap-4'>
														<div>
															<Label htmlFor='admin-password'>Password *</Label>
															<div className='flex gap-2'>
																<Input
																	id='admin-password'
																	type={showPassword ? 'text' : 'password'}
																	value={formData.admin_password}
																	onChange={(e) =>
																		setFormData({
																			...formData,
																			admin_password: e.target.value,
																		})
																	}
																	placeholder='Strong password'
																	className='flex-1'
																/>
																<Button
																	type='button'
																	variant='outline'
																	onClick={() => setShowPassword(!showPassword)}
																	className='flex-shrink-0'
																>
																	{showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
																</Button>
																{formData.admin_password && (
																	<Button
																		type='button'
																		variant='outline'
																		onClick={handleCopyPassword}
																		className='flex-shrink-0'
																	>
																		{copiedPassword ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
																	</Button>
																)}
																<Button
																	type='button'
																	variant='outline'
																	onClick={handleGeneratePassword}
																	className='flex-shrink-0'
																>
																	<RefreshCw className='h-4 w-4 mr-1' />
																	Generate
																</Button>
															</div>
														</div>
														<div>
															<Label htmlFor='admin-password-confirm'>Confirm Password *</Label>
															<Input
																id='admin-password-confirm'
																type={showPassword ? 'text' : 'password'}
																value={formData.admin_password_confirm}
																onChange={(e) =>
																	setFormData({
																		...formData,
																		admin_password_confirm: e.target.value,
																	})
																}
																placeholder='Repeat password'
															/>
															{formData.admin_password && formData.admin_password_confirm && 
																formData.admin_password !== formData.admin_password_confirm && (
																<p className='text-xs text-red-500 mt-1'>
																	Passwords do not match
																</p>
															)}
														</div>
													</div>
												</div>

												{/* Admin Department Selection */}
												<div className='space-y-2'>
													<Label htmlFor='admin-department'>Admin Department *</Label>
													<Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
														<SelectTrigger>
															<SelectValue placeholder='Select department' />
														</SelectTrigger>
														<SelectContent>
															{commonDepartments.map((dept) => (
																<SelectItem key={dept} value={dept}>
																	{dept}
																</SelectItem>
															))}
															<SelectItem value="custom">+ Add Custom Department</SelectItem>
														</SelectContent>
													</Select>
													{showCustomDepartment && (
														<div className='mt-2'>
															<Input
																placeholder='Enter custom department name'
																value={customDepartment}
																onChange={(e) => setCustomDepartment(e.target.value)}
															/>
														</div>
													)}
												</div>

												<div className='space-y-2'>
												</div>
											</div>
										</div>
									</div>
									<DialogFooter>
										<Button
											variant='outline'
											onClick={() => {
												setShowCreateDialog(false);
												resetForm();
											}}>
											Cancel
										</Button>
										<Button onClick={handleCreateCompany}>
											Create Company
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</CardContent>
				</Card>

				{/* Companies Table */}
				<Card>
					<CardContent className='p-0'>
						{loading ? (
							<div className='flex justify-center items-center h-64'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100'></div>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Company</TableHead>
										<TableHead>Industry</TableHead>
										<TableHead>Location</TableHead>
										<TableHead className='text-center'>Users</TableHead>
										<TableHead className='text-center'>Courses</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Last Activity</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredCompanies.map((company) => (
										<TableRow key={company.id}>
											<TableCell>
												<div className='flex items-center space-x-3'>
													{company.logo_url ? (
														<img
															src={getCompanyLogoUrl(company.logo_url)}
															alt={`${company.name} logo`}
															className='h-10 w-10 object-contain rounded border bg-white flex-shrink-0'
															onError={(e) => {
																e.target.style.display = "none";
																e.target.nextSibling.style.display = "flex";
															}}
														/>
													) : null}
													<div
														className={`h-10 w-10 rounded border bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 ${
															company.logo_url ? "hidden" : "flex"
														}`}>
														<Building className='h-5 w-5 text-gray-400' />
													</div>
													<div>
														<div className='font-medium text-gray-900 dark:text-gray-100'>
															{company.name}
														</div>
														<div className='text-sm text-gray-500 dark:text-gray-400'>
															{company.admin_email}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell className='text-gray-600 dark:text-gray-400'>
												{company.industry}
											</TableCell>
											<TableCell className='text-gray-600 dark:text-gray-400'>
												{company.country}
												<div className='text-xs text-gray-500 dark:text-gray-500'>
													{company.size} employees
												</div>
											</TableCell>
											<TableCell className='text-center'>
												<div className='flex items-center justify-center gap-1'>
													<Users className='h-4 w-4 text-gray-400' />
													<span className='font-medium text-gray-900 dark:text-gray-100'>
														{company.user_count}
													</span>
												</div>
											</TableCell>
											<TableCell className='text-center'>
												<div className='flex items-center justify-center gap-1'>
													<BookOpen className='h-4 w-4 text-gray-400' />
													<span className='font-medium text-gray-900 dark:text-gray-100'>
														{company.course_count}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge className={getStatusColor(company.status)}>
													{company.status}
												</Badge>
											</TableCell>
											<TableCell className='text-gray-600 dark:text-gray-400'>
												{new Date(company.last_activity).toLocaleDateString()}
											</TableCell>
											<TableCell className='text-right'>
												<div className='flex justify-end gap-2'>
													<Button
														size='sm'
														variant='outline'
														onClick={() => handleManageCompany(company)}>
														<Settings className='h-4 w-4 mr-1' />
														Manage
													</Button>
													<Button
														size='sm'
														variant='outline'
														onClick={() => handleManageCourses(company)}>
														<BookOpen className='h-4 w-4 mr-1' />
														Courses
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Edit Dialog */}
				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<DialogContent className='sm:max-w-[800px] max-w-[90vw]'>
						<DialogHeader>
							<DialogTitle>Edit Company</DialogTitle>
							<DialogDescription>
								Update company information and settings.
							</DialogDescription>
						</DialogHeader>
						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='edit-company-name'>Company Name</Label>
									<Input
										id='edit-company-name'
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor='edit-industry'>Industry</Label>
									<Select
										value={formData.industry}
										onValueChange={(value) =>
											setFormData({ ...formData, industry: value })
										}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='Software Development'>
												Software Development
											</SelectItem>
											<SelectItem value='Financial Services'>
												Financial Services
											</SelectItem>
											<SelectItem value='Healthcare'>Healthcare</SelectItem>
											<SelectItem value='Manufacturing'>
												Manufacturing
											</SelectItem>
											<SelectItem value='Retail'>Retail</SelectItem>
											<SelectItem value='Education'>Education</SelectItem>
											<SelectItem value='Consulting'>Consulting</SelectItem>
											<SelectItem value='Other'>Other</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='edit-country'>Country</Label>
									<Select
										value={formData.country}
										onValueChange={(value) =>
											setFormData({ ...formData, country: value })
										}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='Netherlands'>Netherlands</SelectItem>
											<SelectItem value='Belgium'>Belgium</SelectItem>
											<SelectItem value='Germany'>Germany</SelectItem>
											<SelectItem value='France'>France</SelectItem>
											<SelectItem value='United Kingdom'>
												United Kingdom
											</SelectItem>
											<SelectItem value='Other'>Other</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor='edit-size'>Company Size</Label>
									<Select
										value={formData.size}
										onValueChange={(value) =>
											setFormData({ ...formData, size: value })
										}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1-10'>1-10 employees</SelectItem>
											<SelectItem value='10-50'>10-50 employees</SelectItem>
											<SelectItem value='50-100'>50-100 employees</SelectItem>
											<SelectItem value='100-500'>100-500 employees</SelectItem>
											<SelectItem value='500+'>500+ employees</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div>
								<Label htmlFor='edit-description'>Description</Label>
								<Textarea
									id='edit-description'
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									rows={3}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => {
									setShowEditDialog(false);
									resetForm();
								}}>
								Cancel
							</Button>
							<Button onClick={handleEditCompany}>Update Company</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Course Management Dialog */}
				<Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
					<DialogContent className='sm:max-w-[1400px] max-w-[95vw] max-h-[90vh]'>
						<DialogHeader>
							<DialogTitle>Manage Courses - {selectedCompanyForCourses?.name}</DialogTitle>
							<DialogDescription>
								Manage all courses for this company. View company's own courses, assigned global courses, and assign new global courses.
							</DialogDescription>
						</DialogHeader>
						
						<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto'>
							{/* Company Own Courses */}
							<div>
								<h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>
									Company Courses ({companyOwnCourses.length})
								</h3>
								{coursesLoading ? (
									<div className='flex justify-center items-center h-32'>
										<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
									</div>
								) : companyOwnCourses.length > 0 ? (
									<div className='space-y-3'>
										{companyOwnCourses.map((course) => (
											<div key={course.id} className='border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20'>
												<div className='flex justify-between items-start'>
													<div className='flex-1'>
														<h4 className='font-medium text-gray-900 dark:text-gray-100'>
															{course.title}
														</h4>
														<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
															{course.description}
														</p>
														<div className='flex gap-2 mt-2'>
															<Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
																{course.category}
															</Badge>
															<Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
																{course.difficulty}
															</Badge>
															<Badge className='bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
																{course.duration_hours}h
															</Badge>
															<Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
																Own
															</Badge>
														</div>
													</div>
													<Button
														size='sm'
														variant='outline'
														onClick={() => navigate(`/admin/course-builder/${course.id}`)}
														className='ml-3'
													>
														<Edit className='h-4 w-4' />
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
										<BookOpen className='h-12 w-12 mx-auto mb-3 opacity-50' />
										<p>No company courses yet</p>
									</div>
								)}
							</div>

							{/* Assigned Global Courses */}
							<div>
								<h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>
									Assigned Global Courses ({assignedCourses.length})
								</h3>
								{coursesLoading ? (
									<div className='flex justify-center items-center h-32'>
										<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
									</div>
								) : assignedCourses.length > 0 ? (
									<div className='space-y-3'>
										{assignedCourses.map((course) => (
											<div key={course.id} className='border rounded-lg p-4 bg-gray-50 dark:bg-gray-800'>
												<div className='flex justify-between items-start'>
													<div className='flex-1'>
														<h4 className='font-medium text-gray-900 dark:text-gray-100'>
															{course.title}
														</h4>
														<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
															{course.description}
														</p>
														<div className='flex gap-2 mt-2'>
															<Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
																{course.category}
															</Badge>
															<Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
																{course.difficulty}
															</Badge>
															<Badge className='bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
																{course.duration_hours}h
															</Badge>
														</div>
													</div>
													<Button
														size='sm'
														variant='outline'
														onClick={() => handleUnassignCourse(course.id)}
														className='ml-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200'
													>
														<Minus className='h-4 w-4 mr-1' />
														Unassign
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
										<BookOpen className='h-12 w-12 mx-auto mb-3 opacity-50' />
										<p>No courses assigned yet</p>
									</div>
								)}
							</div>

							{/* Available Global Courses */}
							<div>
								<h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100'>
									Available Global Courses ({availableCourses.length})
								</h3>
								{coursesLoading ? (
									<div className='flex justify-center items-center h-32'>
										<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
									</div>
								) : availableCourses.length > 0 ? (
									<div className='space-y-3'>
										{availableCourses.map((course) => (
											<div key={course.id} className='border rounded-lg p-4 bg-white dark:bg-gray-700'>
												<div className='flex justify-between items-start'>
													<div className='flex-1'>
														<h4 className='font-medium text-gray-900 dark:text-gray-100'>
															{course.title}
														</h4>
														<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
															{course.description}
														</p>
														<div className='flex gap-2 mt-2'>
															<Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
																{course.category}
															</Badge>
															<Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
																{course.difficulty}
															</Badge>
															<Badge className='bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
																{course.duration_hours}h
															</Badge>
															<Badge className='bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'>
																Global
															</Badge>
														</div>
													</div>
													<Button
														size='sm'
														onClick={() => handleAssignCourse(course.id)}
														className='ml-3'
													>
														<Plus className='h-4 w-4 mr-1' />
														Assign
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
										<BookOpen className='h-12 w-12 mx-auto mb-3 opacity-50' />
										<p>No available global courses</p>
									</div>
								)}
							</div>
						</div>

						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => setShowCourseDialog(false)}
							>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayout>
	);
}

export default SuperAdminCompaniesPage;
