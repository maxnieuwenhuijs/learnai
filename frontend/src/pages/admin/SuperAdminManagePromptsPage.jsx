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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	MessageSquare,
	Building,
	Users,
	Search,
	Download,
	Eye,
	Edit3,
	Trash2,
	Plus,
	Settings,
	Filter,
	MoreVertical,
	FileText,
	Globe,
	BarChart3,
	Clock,
	Shield,
} from "lucide-react";
import { promptsApi } from "@/api/prompts";
import api from "@/api/config";

export function SuperAdminManagePromptsPage() {
	const navigate = useNavigate();
	const [prompts, setPrompts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [companies, setCompanies] = useState([]);
	const [stats, setStats] = useState({
		totalPrompts: 0,
		totalCategories: 0,
		totalCompanies: 0,
		globalPrompts: 0,
		companySpecificPrompts: 0,
	});
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedCompany, setSelectedCompany] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [viewMode, setViewMode] = useState("grid"); // grid or list
	const [selectedPrompt, setSelectedPrompt] = useState(null);
	const [deletePromptId, setDeletePromptId] = useState(null);

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		filterPrompts();
	}, [searchTerm, selectedCategory, selectedCompany, selectedStatus]);

	const loadData = async () => {
		try {
			setLoading(true);

			// Load all data from super admin endpoints
			const [promptsRes, analyticsRes, companiesRes] = await Promise.all([
				api.get("/super-admin/prompts"),
				api.get("/super-admin/prompts/analytics"),
				api.get("/super-admin/prompts/by-company"),
			]);

			// Real API data from super admin endpoints
			const prompts = promptsRes.data?.data?.prompts || [];
			const analytics = analyticsRes.data?.data || {};
			const companies = companiesRes.data?.data || [];

			setPrompts(prompts);
			setCategories(analytics.topCategories || []);
			setCompanies(companies);
			setStats({
				totalPrompts: analytics.totalPrompts || 0,
				totalCategories: analytics.totalCategories || 0,
				totalCompanies: analytics.companiesWithPrompts || 0,
				globalPrompts: analytics.globalPrompts || 0,
				companySpecificPrompts: analytics.companySpecificPrompts || 0,
			});
		} catch (error) {
			console.error("Error loading data:", error);
			// Fallback to regular prompts API if super admin endpoints fail
			try {
				const [promptsRes, categoriesRes] = await Promise.all([
					promptsApi.getPrompts({}),
					promptsApi.getCategories(),
				]);

				const prompts = promptsRes.data?.prompts || [];
				const categories = categoriesRes.data || [];

				setPrompts(prompts);
				setCategories(categories);
				setCompanies([]);
				setStats({
					totalPrompts: promptsRes.data?.pagination?.total || 0,
					totalCategories: categories.length,
					totalCompanies: 0,
					globalPrompts: prompts.filter(
						(p) => !p.company_id || p.company_id === 0
					).length,
					companySpecificPrompts: prompts.filter(
						(p) => p.company_id && p.company_id !== 0
					).length,
				});
			} catch (fallbackError) {
				console.error("Fallback API also failed:", fallbackError);
				// Set empty state on complete failure
				setPrompts([]);
				setCategories([]);
				setCompanies([]);
				setStats({
					totalPrompts: 0,
					totalCategories: 0,
					totalCompanies: 0,
					globalPrompts: 0,
					companySpecificPrompts: 0,
				});
			}
		} finally {
			setLoading(false);
		}
	};

	const filterPrompts = () => {
		// This would be handled by API in real implementation
		// For now, we'll filter on the frontend
	};

	const formatDateTime = (timestamp) => {
		return new Date(timestamp).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "approved":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "pending_review":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "draft":
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
			case "rejected":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	const handleDeletePrompt = async (promptId) => {
		try {
			// Use super admin delete endpoint
			await api.delete(`/super-admin/prompts/${promptId}`);
			loadData(); // Reload data after deletion
			setDeletePromptId(null);
		} catch (error) {
			console.error("Error deleting prompt:", error);
			// Fallback to regular prompts API
			try {
				await promptsApi.deletePrompt(promptId);
				loadData();
				setDeletePromptId(null);
			} catch (fallbackError) {
				console.error("Fallback delete also failed:", fallbackError);
			}
		}
	};

	const handleEditPrompt = (prompt) => {
		// Navigate to prompt editor or open edit modal
		navigate(`/prompts?edit=${prompt.id}`);
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
							Manage Prompts
						</h1>
						<p className='text-gray-600 dark:text-gray-400'>
							Comprehensive management of all prompt templates across companies
						</p>
					</div>
					<div className='flex gap-3'>
						<Button variant='outline'>
							<Download className='h-4 w-4 mr-2' />
							Export All
						</Button>
						<Button onClick={() => navigate("/prompts")}>
							<Plus className='h-4 w-4 mr-2' />
							Create Prompt
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
										Total Prompts
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{stats.totalPrompts}
									</p>
									<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
										All platforms
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
										{stats.totalCategories}
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
										Companies
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{stats.totalCompanies}
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

					<Card>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
										Global Templates
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{stats.globalPrompts}
									</p>
									<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
										Platform-wide
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
										Company Specific
									</p>
									<p className='text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2'>
										{stats.companySpecificPrompts}
									</p>
									<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
										Private prompts
									</p>
								</div>
								<div className='w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center'>
									<Shield className='w-6 h-6 text-gray-600 dark:text-gray-400' />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filters and Controls */}
				<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
					<div className='flex flex-wrap gap-4 items-center'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
							<Input
								placeholder='Search prompts...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-10 w-64'
							/>
						</div>
						<Select
							value={selectedCategory}
							onValueChange={setSelectedCategory}>
							<SelectTrigger className='w-48'>
								<SelectValue placeholder='All Categories' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id.toString()}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={selectedCompany} onValueChange={setSelectedCompany}>
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
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger className='w-40'>
								<SelectValue placeholder='All Status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='approved'>Approved</SelectItem>
								<SelectItem value='pending_review'>Pending Review</SelectItem>
								<SelectItem value='draft'>Draft</SelectItem>
								<SelectItem value='rejected'>Rejected</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className='flex gap-2'>
						<Button
							variant={viewMode === "grid" ? "default" : "outline"}
							size='sm'
							onClick={() => setViewMode("grid")}>
							Grid
						</Button>
						<Button
							variant={viewMode === "list" ? "default" : "outline"}
							size='sm'
							onClick={() => setViewMode("list")}>
							List
						</Button>
					</div>
				</div>

				{/* Tabbed Content */}
				<Tabs defaultValue='prompts' className='w-full'>
					<TabsList className='grid w-full grid-cols-3'>
						<TabsTrigger value='prompts'>All Prompts</TabsTrigger>
						<TabsTrigger value='categories'>Categories</TabsTrigger>
						<TabsTrigger value='companies'>By Company</TabsTrigger>
					</TabsList>

					{/* All Prompts Tab */}
					<TabsContent value='prompts' className='space-y-6'>
						{prompts.length === 0 ? (
							<Card>
								<CardContent className='p-12'>
									<div className='text-center'>
										<MessageSquare className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400 mb-2'>
											No prompts found
										</p>
										<p className='text-sm text-gray-400 dark:text-gray-500 mb-4'>
											Prompts will appear here as companies create them
										</p>
										<Button onClick={() => navigate("/prompts")}>
											<Plus className='h-4 w-4 mr-2' />
											Create First Prompt
										</Button>
									</div>
								</CardContent>
							</Card>
						) : viewMode === "grid" ? (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{prompts.map((prompt) => (
									<Card
										key={prompt.id}
										className='hover:shadow-lg transition-all duration-200'>
										<CardHeader className='pb-3'>
											<div className='flex items-start justify-between'>
												<div className='flex-1 min-w-0'>
													<CardTitle className='text-lg font-semibold text-gray-900 dark:text-gray-100 truncate'>
														{prompt.title}
													</CardTitle>
													<CardDescription className='mt-1 line-clamp-2'>
														{prompt.description}
													</CardDescription>
												</div>
												<Dialog>
													<DialogTrigger asChild>
														<Button variant='ghost' size='sm'>
															<MoreVertical className='h-4 w-4' />
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Prompt Actions</DialogTitle>
															<DialogDescription>
																Choose an action for "{prompt.title}"
															</DialogDescription>
														</DialogHeader>
														<div className='space-y-3'>
															<Button
																variant='outline'
																className='w-full justify-start'
																onClick={() => setSelectedPrompt(prompt)}>
																<Eye className='h-4 w-4 mr-2' />
																View Details
															</Button>
															<Button
																variant='outline'
																className='w-full justify-start'
																onClick={() => handleEditPrompt(prompt)}>
																<Edit3 className='h-4 w-4 mr-2' />
																Edit Prompt
															</Button>
															<AlertDialog>
																<AlertDialogTrigger asChild>
																	<Button
																		variant='outline'
																		className='w-full justify-start text-red-600'>
																		<Trash2 className='h-4 w-4 mr-2' />
																		Delete Prompt
																	</Button>
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader>
																		<AlertDialogTitle>
																			Delete Prompt
																		</AlertDialogTitle>
																		<AlertDialogDescription>
																			Are you sure you want to delete "
																			{prompt.title}"? This action cannot be
																			undone.
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter>
																		<AlertDialogCancel>
																			Cancel
																		</AlertDialogCancel>
																		<AlertDialogAction
																			onClick={() =>
																				handleDeletePrompt(prompt.id)
																			}
																			className='bg-red-600 hover:bg-red-700'>
																			Delete
																		</AlertDialogAction>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														</div>
													</DialogContent>
												</Dialog>
											</div>
										</CardHeader>
										<CardContent>
											<div className='space-y-3'>
												<div className='flex items-center gap-2'>
													<Badge variant='outline' className='text-xs'>
														{prompt.category?.name || "Uncategorized"}
													</Badge>
													<Badge
														className={getStatusColor(prompt.status)}
														variant='outline'>
														{prompt.status?.replace("_", " ").toUpperCase()}
													</Badge>
												</div>
												<div className='flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
													<span>Company: {prompt.company?.name}</span>
													<span>{prompt.usage_count} uses</span>
												</div>
												<div className='text-xs text-gray-500 dark:text-gray-400'>
													Last used: {formatDateTime(prompt.last_used)}
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<Card>
								<CardContent className='p-0'>
									<div className='divide-y divide-gray-200 dark:divide-gray-700'>
										{prompts.map((prompt) => (
											<div
												key={prompt.id}
												className='p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
												<div className='flex items-center justify-between'>
													<div className='flex-1 min-w-0'>
														<h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 truncate'>
															{prompt.title}
														</h3>
														<p className='text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>
															{prompt.description}
														</p>
														<div className='flex items-center gap-3 mt-3'>
															<Badge variant='outline' className='text-xs'>
																{prompt.category?.name || "Uncategorized"}
															</Badge>
															<Badge
																className={getStatusColor(prompt.status)}
																variant='outline'>
																{prompt.status?.replace("_", " ").toUpperCase()}
															</Badge>
															<span className='text-xs text-gray-500 dark:text-gray-400'>
																{prompt.company?.name}
															</span>
															<span className='text-xs text-gray-500 dark:text-gray-400'>
																{prompt.usage_count} uses
															</span>
															<span className='text-xs text-gray-500 dark:text-gray-400'>
																Last used: {formatDateTime(prompt.last_used)}
															</span>
														</div>
													</div>
													<div className='flex items-center gap-2 ml-4'>
														<Button
															variant='ghost'
															size='sm'
															onClick={() => setSelectedPrompt(prompt)}>
															<Eye className='h-4 w-4' />
														</Button>
														<Button
															variant='ghost'
															size='sm'
															onClick={() => handleEditPrompt(prompt)}>
															<Edit3 className='h-4 w-4' />
														</Button>
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button variant='ghost' size='sm'>
																	<Trash2 className='h-4 w-4' />
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Delete Prompt
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you sure you want to delete "
																		{prompt.title}"? This action cannot be
																		undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() =>
																			handleDeletePrompt(prompt.id)
																		}
																		className='bg-red-600 hover:bg-red-700'>
																		Delete
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Categories Tab */}
					<TabsContent value='categories' className='space-y-6'>
						<div className='flex justify-between items-center'>
							<h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
								Prompt Categories
							</h2>
							<Button onClick={() => navigate("/prompts")}>
								<Plus className='h-4 w-4 mr-2' />
								Add Category
							</Button>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{categories.map((category) => (
								<Card key={category.id}>
									<CardHeader>
										<CardTitle className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<FileText className='h-5 w-5 text-gray-600 dark:text-gray-400' />
												{category.name}
											</div>
											<Button variant='ghost' size='sm'>
												<MoreVertical className='h-4 w-4' />
											</Button>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='space-y-3'>
											<p className='text-sm text-gray-600 dark:text-gray-400'>
												{category.description}
											</p>
											<div className='flex items-center justify-between'>
												<span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
													{category.prompt_count || 0} prompts
												</span>
												<div className='flex gap-2'>
													<Button variant='ghost' size='sm'>
														<Eye className='h-4 w-4' />
													</Button>
													<Button variant='ghost' size='sm'>
														<Edit3 className='h-4 w-4' />
													</Button>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
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
												{company.id === 0 && (
													<Badge variant='outline' className='text-xs'>
														Global
													</Badge>
												)}
											</div>
											<div className='flex items-center gap-3'>
												<Badge variant='outline'>
													{company.prompt_count} prompts
												</Badge>
												<Button variant='ghost' size='sm'>
													<Eye className='h-4 w-4' />
												</Button>
											</div>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='space-y-4'>
											{prompts
												.filter((p) =>
													company.id === 0
														? !p.company_id || p.company_id === 0
														: p.company_id === company.id
												)
												.slice(0, 3)
												.map((prompt) => (
													<div
														key={prompt.id}
														className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
														<div className='flex-1 min-w-0'>
															<h4 className='font-medium text-gray-900 dark:text-gray-100 truncate'>
																{prompt.title}
															</h4>
															<div className='flex items-center gap-2 mt-1'>
																<Badge
																	className={getStatusColor(prompt.status)}
																	variant='outline'>
																	{prompt.status
																		?.replace("_", " ")
																		.toUpperCase()}
																</Badge>
																<span className='text-xs text-gray-500 dark:text-gray-400'>
																	{prompt.usage_count} uses
																</span>
															</div>
														</div>
														<div className='flex items-center gap-2'>
															<Button
																variant='ghost'
																size='sm'
																onClick={() => setSelectedPrompt(prompt)}>
																<Eye className='h-4 w-4' />
															</Button>
															<Button
																variant='ghost'
																size='sm'
																onClick={() => handleEditPrompt(prompt)}>
																<Edit3 className='h-4 w-4' />
															</Button>
															<AlertDialog>
																<AlertDialogTrigger asChild>
																	<Button variant='ghost' size='sm'>
																		<Trash2 className='h-4 w-4' />
																	</Button>
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader>
																		<AlertDialogTitle>
																			Delete Prompt
																		</AlertDialogTitle>
																		<AlertDialogDescription>
																			Are you sure you want to delete "
																			{prompt.title}"? This action cannot be
																			undone.
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter>
																		<AlertDialogCancel>
																			Cancel
																		</AlertDialogCancel>
																		<AlertDialogAction
																			onClick={() =>
																				handleDeletePrompt(prompt.id)
																			}
																			className='bg-red-600 hover:bg-red-700'>
																			Delete
																		</AlertDialogAction>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														</div>
													</div>
												))}

											{prompts.filter((p) =>
												company.id === 0
													? !p.company_id || p.company_id === 0
													: p.company_id === company.id
											).length > 3 && (
												<Button
													variant='outline'
													className='w-full'
													onClick={() => {
														setSelectedCompany(company.id.toString());
														// Switch to prompts tab with company filter
													}}>
													View All {company.prompt_count} Prompts
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>
				</Tabs>

				{/* Prompt Details Dialog */}
				{selectedPrompt && (
					<Dialog
						open={!!selectedPrompt}
						onOpenChange={() => setSelectedPrompt(null)}>
						<DialogContent className='max-w-2xl'>
							<DialogHeader>
								<DialogTitle>{selectedPrompt.title}</DialogTitle>
								<DialogDescription>
									Prompt details and usage information
								</DialogDescription>
							</DialogHeader>
							<div className='space-y-4'>
								<div>
									<h4 className='font-medium text-gray-900 dark:text-gray-100 mb-2'>
										Description
									</h4>
									<p className='text-sm text-gray-600 dark:text-gray-400'>
										{selectedPrompt.description}
									</p>
								</div>
								<div>
									<h4 className='font-medium text-gray-900 dark:text-gray-100 mb-2'>
										Content Preview
									</h4>
									<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-32 overflow-y-auto'>
										<code className='text-sm text-gray-700 dark:text-gray-300'>
											{selectedPrompt.content?.substring(0, 200)}...
										</code>
									</div>
								</div>
								<div className='grid grid-cols-2 gap-4 text-sm'>
									<div>
										<span className='font-medium text-gray-900 dark:text-gray-100'>
											Category:
										</span>
										<p className='text-gray-600 dark:text-gray-400'>
											{selectedPrompt.category?.name || "Uncategorized"}
										</p>
									</div>
									<div>
										<span className='font-medium text-gray-900 dark:text-gray-100'>
											Company:
										</span>
										<p className='text-gray-600 dark:text-gray-400'>
											{selectedPrompt.company?.name}
										</p>
									</div>
									<div>
										<span className='font-medium text-gray-900 dark:text-gray-100'>
											Status:
										</span>
										<Badge
											className={getStatusColor(selectedPrompt.status)}
											variant='outline'>
											{selectedPrompt.status?.replace("_", " ").toUpperCase()}
										</Badge>
									</div>
									<div>
										<span className='font-medium text-gray-900 dark:text-gray-100'>
											Usage:
										</span>
										<p className='text-gray-600 dark:text-gray-400'>
											{selectedPrompt.usage_count} times
										</p>
									</div>
									<div>
										<span className='font-medium text-gray-900 dark:text-gray-100'>
											Created:
										</span>
										<p className='text-gray-600 dark:text-gray-400'>
											{selectedPrompt.created_at
												? formatDateTime(selectedPrompt.created_at)
												: "Unknown"}
										</p>
									</div>
									<div>
										<span className='font-medium text-gray-900 dark:text-gray-100'>
											Last Used:
										</span>
										<p className='text-gray-600 dark:text-gray-400'>
											{formatDateTime(selectedPrompt.last_used)}
										</p>
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant='outline'
									onClick={() => setSelectedPrompt(null)}>
									Close
								</Button>
								<Button onClick={() => handleEditPrompt(selectedPrompt)}>
									<Edit3 className='h-4 w-4 mr-2' />
									Edit Prompt
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
			</div>
		</DashboardLayout>
	);
}

export default SuperAdminManagePromptsPage;
