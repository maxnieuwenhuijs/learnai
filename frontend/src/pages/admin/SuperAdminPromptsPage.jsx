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
	MessageSquare,
	Building,
	Users,
	TrendingUp,
	Search,
	Filter,
	Download,
	Eye,
	Edit3,
	Trash2,
	BarChart3,
	Clock,
	Globe,
	FileText,
	PieChart,
} from "lucide-react";
import { promptsApi } from "@/api/prompts";
import api from "@/api/config";

export function SuperAdminPromptsPage() {
	const navigate = useNavigate();
	const [promptStats, setPromptStats] = useState({
		totalPrompts: 0,
		totalCategories: 0,
		totalUsage: 0,
		companiesWithPrompts: 0,
		topCategories: [],
		recentPrompts: [],
		companyPromptBreakdown: [],
		monthlyUsage: [],
	});
	const [prompts, setPrompts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [companies, setCompanies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedCompany, setSelectedCompany] = useState("all");

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		loadPrompts();
	}, [searchTerm, selectedCategory, selectedCompany]);

	const loadData = async () => {
		try {
			setLoading(true);

			// Load data from super admin analytics endpoints
			const analyticsRes = await api.get("/super-admin/prompts/analytics");
			const companiesRes = await api.get("/super-admin/prompts/by-company");

			const analytics = analyticsRes.data?.data || {};
			const companies = companiesRes.data?.data || [];

			// Real API data from super admin endpoints
			setPromptStats({
				totalPrompts: analytics.totalPrompts || 0,
				totalCategories: analytics.totalCategories || 0,
				totalUsage: analytics.totalUsage || 0,
				companiesWithPrompts: analytics.companiesWithPrompts || 0,
				topCategories: analytics.topCategories || [],
				recentPrompts: analytics.recentPrompts || [],
				companyPromptBreakdown: companies || [],
				monthlyUsage: [], // Will come from future trends API
			});

			setCategories(analytics.topCategories || []);
			setCompanies(companies);
		} catch (error) {
			console.error("Error loading prompt data:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadPrompts = async () => {
		try {
			const params = new URLSearchParams();
			if (selectedCategory !== "all") {
				params.append('category_id', selectedCategory);
			}
			if (searchTerm) {
				params.append('search', searchTerm);
			}
			if (selectedCompany !== "all") {
				params.append('company_id', selectedCompany);
			}

			const res = await api.get(`/super-admin/prompts?${params.toString()}`);
			setPrompts(res.data?.data?.prompts || []);
		} catch (error) {
			console.error("Error loading prompts:", error);
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
							Global Prompt Library
						</h1>
						<p className='text-gray-600 dark:text-gray-400'>
							Master overview of all prompt templates across companies
						</p>
					</div>
					<div className='flex gap-3'>
						<Button variant='outline'>
							<Download className='h-4 w-4 mr-2' />
							Export Data
						</Button>
						<Button onClick={() => navigate("/prompts")}>
							<MessageSquare className='h-4 w-4 mr-2' />
							Manage Prompts
						</Button>
					</div>
				</div>

				{/* Stats Grid */}
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

				{/* Tabbed Content */}
				<Tabs defaultValue='overview' className='w-full'>
					<TabsList className='grid w-full grid-cols-4'>
						<TabsTrigger value='overview'>Overview</TabsTrigger>
						<TabsTrigger value='prompts'>All Prompts</TabsTrigger>
						<TabsTrigger value='companies'>By Company</TabsTrigger>
						<TabsTrigger value='analytics'>Analytics</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value='overview' className='space-y-6'>
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

							{/* Company Usage */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Building className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Company Usage
									</CardTitle>
									<CardDescription>
										Prompt activity breakdown by company
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{promptStats.companyPromptBreakdown.map((company) => (
											<div
												key={company.id}
												className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
												<div className='flex-1'>
													<h4 className='font-medium text-gray-900 dark:text-gray-100'>
														{company.name}
													</h4>
													<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
														{company.prompt_count} prompts •{" "}
														{company.usage_count} total uses
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

						{/* Recent Prompts */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Clock className='h-5 w-5 text-gray-600 dark:text-gray-400' />
									Recent Prompts
								</CardTitle>
								<CardDescription>
									Latest prompt templates created across all companies
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
												className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
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
												<div className='flex items-center gap-2 ml-4'>
													<Button variant='ghost' size='sm'>
														<Eye className='h-4 w-4' />
													</Button>
													<Button variant='ghost' size='sm'>
														<Edit3 className='h-4 w-4' />
													</Button>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* All Prompts Tab */}
					<TabsContent value='prompts' className='space-y-6'>
						{/* Filters */}
						<div className='flex items-center gap-4'>
							<div className='relative flex-1 max-w-sm'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
								<Input
									placeholder='Search prompts...'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className='pl-10'
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
										<SelectItem
											key={category.id}
											value={category.id.toString()}>
											{category.name}
										</SelectItem>
									))}
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

						{/* Prompts List */}
						<Card>
							<CardContent className='p-0'>
								{prompts.length === 0 ? (
									<div className='text-center py-12'>
										<MessageSquare className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											No prompts found
										</p>
									</div>
								) : (
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
														<div className='flex items-center gap-2 mt-3'>
															<Badge variant='outline' className='text-xs'>
																{prompt.category?.name || "Uncategorized"}
															</Badge>
															<Badge variant='outline' className='text-xs'>
																{prompt.status}
															</Badge>
															<span className='text-xs text-gray-500 dark:text-gray-400'>
																Created{" "}
																{prompt.created_at
																	? formatDateTime(prompt.created_at)
																	: "recently"}
															</span>
														</div>
													</div>
													<div className='flex items-center gap-2 ml-4'>
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
											<div className='flex items-center gap-2'>
												<Badge variant='outline'>
													{company.prompt_count} prompts
												</Badge>
												<Badge variant='outline'>
													{company.usage_count} uses
												</Badge>
											</div>
										</CardTitle>
									</CardHeader>
									<CardContent>
										{company.prompts && company.prompts.length > 0 ? (
											<div className='space-y-3'>
												{company.prompts.map((prompt) => (
													<div
														key={prompt.id}
														className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
														<div className='flex-1 min-w-0'>
															<h4 className='font-medium text-gray-900 dark:text-gray-100 truncate'>
																{prompt.title}
															</h4>
															<div className='flex items-center gap-2 mt-1'>
																<Badge variant='outline' className='text-xs'>
																	{prompt.status}
																</Badge>
																<span className='text-xs text-gray-500 dark:text-gray-400'>
																	{prompt.created_at
																		? formatDateTime(prompt.created_at)
																		: "Recently"}
																</span>
															</div>
														</div>
														<div className='flex items-center gap-2 ml-4'>
															<Button variant='ghost' size='sm'>
																<Eye className='h-4 w-4' />
															</Button>
															<Button variant='ghost' size='sm'>
																<Edit3 className='h-4 w-4' />
															</Button>
														</div>
													</div>
												))}
											</div>
										) : (
											<div className='text-center py-8'>
												<MessageSquare className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
												<p className='text-gray-500 dark:text-gray-400'>
													No prompts found for this company
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					{/* Analytics Tab */}
					<TabsContent value='analytics' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<BarChart3 className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Usage Trends
									</CardTitle>
									<CardDescription>
										Monthly prompt usage across platform
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='text-center py-8'>
										<BarChart3 className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											Usage analytics will be displayed here
										</p>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Globe className='h-5 w-5 text-gray-600 dark:text-gray-400' />
										Global Performance
									</CardTitle>
									<CardDescription>
										Platform-wide prompt performance metrics
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='text-center py-8'>
										<Globe className='h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
										<p className='text-gray-500 dark:text-gray-400'>
											Performance metrics will be displayed here
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</DashboardLayout>
	);
}

export default SuperAdminPromptsPage;
