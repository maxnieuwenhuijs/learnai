import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Plus,
	Search,
	Filter,
	MessageSquare,
	GraduationCap,
	Scale,
	Lightbulb,
	CheckSquare,
	BarChart,
	Clock,
	TrendingUp,
	Eye,
	Edit3,
	Star,
	Heart,
	Target,
	Zap,
	Calendar,
	Laptop,
	Palette,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { promptsApi } from "@/api/prompts";
import PromptGenerator from "@/components/prompts/PromptGenerator";
import PromptCreator from "@/components/prompts/PromptCreator";
import CategoryCreator from "@/components/prompts/CategoryCreator";
import PromptAnalytics from "@/components/admin/PromptAnalytics";

const categoryIcons = {
	GraduationCap: GraduationCap,
	Scale: Scale,
	Lightbulb: Lightbulb,
	CheckSquare: CheckSquare,
	MessageSquare: MessageSquare,
	BarChart: BarChart,
	Star: Star,
	Heart: Heart,
	Target: Target,
	Zap: Zap,
	Calendar: Calendar,
	Laptop: Laptop,
	Palette: Palette,
	TrendingUp: TrendingUp,
};

export function PromptsPage() {
	const { user } = useAuth();
	const [categories, setCategories] = useState([]);
	const [prompts, setPrompts] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedPrompt, setSelectedPrompt] = useState(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("browse");
	const [promptType, setPromptType] = useState("all"); // 'all', 'personal', 'company'
	const [showGenerator, setShowGenerator] = useState(false);
	const [showCreator, setShowCreator] = useState(false);
	const [editingPrompt, setEditingPrompt] = useState(null);
	const [showCategoryCreator, setShowCategoryCreator] = useState(false);

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		loadPrompts();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			const categoriesRes = await promptsApi.getCategories();
			setCategories(categoriesRes.data);
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadPrompts = async () => {
		try {
			const res = await promptsApi.getPrompts({});
			setPrompts(res.data.prompts);
		} catch (error) {
			console.error("Error loading prompts:", error);
		}
	};

	const getFilteredPrompts = () => {
		let filtered = prompts;

		// Filter by category
		if (selectedCategory !== "all") {
			filtered = filtered.filter(
				(prompt) => prompt.category_id === selectedCategory
			);
		}

		// Filter by search term
		if (searchTerm) {
			const searchLower = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(prompt) =>
					prompt.title.toLowerCase().includes(searchLower) ||
					prompt.description?.toLowerCase().includes(searchLower) ||
					prompt.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
			);
		}

        // Filter by prompt type
        if (promptType === "personal") {
            filtered = filtered.filter((prompt) => prompt.created_by === user?.id);
        } else if (promptType === "company") {
            // Treat prompts created by others (and visible to this user) as company prompts
            filtered = filtered.filter((prompt) => prompt.created_by !== user?.id);
        }

		return filtered;
	};

	const handleGenerateContent = async (prompt, variables) => {
		try {
			setIsGenerating(true);
			const res = await promptsApi.generateContent(
				prompt.id,
				variables,
				"prompt_library"
			);
			// Update the specific prompt's usage count
			setPrompts((prevPrompts) =>
				prevPrompts.map((p) =>
					p.id === prompt.id
						? { ...p, usage_count: (p.usage_count || 0) + 1 }
						: p
				)
			);
			return res.data;
		} catch (error) {
			console.error("Error generating content:", error);
			throw error;
		} finally {
			setIsGenerating(false);
		}
	};

	const handleUsePrompt = (prompt) => {
		setSelectedPrompt(prompt);
		setShowGenerator(true);
	};

	const handleEditPrompt = (prompt) => {
		setEditingPrompt(prompt);
		setShowCreator(true);
	};

	const handleCreatePrompt = () => {
		setEditingPrompt(null);
		setShowCreator(true);
	};

	const handleCreateFromTemplate = (templatePrompt) => {
		// Create a new prompt based on the template
		const templateData = {
			...templatePrompt,
			id: undefined, // Remove ID so it creates a new prompt
			title: templatePrompt.is_template
				? `${templatePrompt.title} (Kopie)`
				: `${templatePrompt.title} (Van Template)`,
			is_template: false, // Make it a regular prompt, not a template
			status: "draft", // Start as draft
			created_by: user?.id,
			usage_count: 0,
			last_used_at: null,
			// Keep all other properties like content, variables, category_id, etc.
		};
		setEditingPrompt(templateData);
		setShowCreator(true);
	};

	const handlePromptSaved = (savedPrompt) => {
		// Refresh the prompts list and categories with counts
		loadData();
		loadPrompts();
	};

	const handleCategorySaved = (savedCategory) => {
		// Refresh both categories and prompts
		loadData();
		loadPrompts();
	};

	if (loading) {
		return (
			<DashboardLayout>
				<div className='space-y-6'>
					<div className='animate-pulse'>
						<div className='h-8 bg-muted rounded w-1/4 mb-6'></div>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{[...Array(6)].map((_, i) => (
								<div key={i} className='h-48 bg-muted rounded-lg'></div>
							))}
						</div>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className='space-y-6 animate-fade-in'>
				{/* Header Section */}
				<div className='bg-gray-900 rounded-xl p-6 text-white'>
					<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
						<div>
							<h1 className='text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3'>
								<MessageSquare className='w-8 h-8' />
								Prompt Library
							</h1>
							<p className='text-gray-300'>
								Beheer en gebruik herbruikbare prompts voor je team
							</p>
						</div>
						<div className='flex items-center gap-4'>
							<div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center'>
								<div className='text-2xl font-bold'>
									{getFilteredPrompts().length}
								</div>
								<div className='text-sm text-gray-300'>Prompts</div>
							</div>
							<div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center'>
								<div className='text-2xl font-bold'>{categories.length}</div>
								<div className='text-sm text-gray-300'>Categorieën</div>
							</div>
							<MessageSquare className='w-16 h-16 text-gray-400 hidden lg:block' />
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex items-center gap-3 mt-4 pt-4 border-t border-gray-700'>
						<Button
							variant='outline'
							onClick={() => setActiveTab("analytics")}
							size='sm'
							className='bg-white/10 border-gray-600 text-white hover:bg-white/20'>
							<TrendingUp className='w-4 h-4 mr-2' />
							Analytics
						</Button>
						<Button
							variant='outline'
							onClick={() => setShowCategoryCreator(true)}
							size='sm'
							className='bg-white/10 border-gray-600 text-white hover:bg-white/20'>
							<Plus className='w-4 h-4 mr-2' />
							Categorie
						</Button>
						<Button
							onClick={handleCreatePrompt}
							size='sm'
							className='bg-white text-gray-900 hover:bg-gray-100 font-medium'>
							<Plus className='w-4 h-4 mr-2' />
							Nieuwe Prompt
						</Button>
					</div>
				</div>

				{/* Search - Only show for browse and templates tabs */}
				{(activeTab === "browse" || activeTab === "templates") && (
					<div className='flex items-center gap-4'>
						<div className='relative flex-1 max-w-sm'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
							<Input
								placeholder='Zoek prompts...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>
					</div>
				)}

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className='space-y-6'>
					<TabsList className='grid w-full grid-cols-3'>
						<TabsTrigger value='browse'>Bladeren</TabsTrigger>
						<TabsTrigger value='templates'>Templates</TabsTrigger>
						<TabsTrigger value='analytics'>Analytics</TabsTrigger>
					</TabsList>

					{/* Prompt Type Tabs - Only show for browse and templates tabs */}
					{(activeTab === "browse" || activeTab === "templates") && (
						<div className='flex items-center gap-2'>
							<Button
								variant={promptType === "all" ? "default" : "outline"}
								size='sm'
								onClick={() => setPromptType("all")}
								className={
									promptType === "all" ? "bg-gray-900 text-white" : ""
								}>
								Alle Prompts
							</Button>
							<Button
								variant={promptType === "personal" ? "default" : "outline"}
								size='sm'
								onClick={() => setPromptType("personal")}
								className={
									promptType === "personal" ? "bg-gray-900 text-white" : ""
								}>
								Persoonlijke Prompts
							</Button>
							<Button
								variant={promptType === "company" ? "default" : "outline"}
								size='sm'
								onClick={() => setPromptType("company")}
								className={
									promptType === "company" ? "bg-gray-900 text-white" : ""
								}>
								Bedrijf Prompts
							</Button>
						</div>
					)}

					<TabsContent value='browse' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
							{/* Categories Sidebar */}
							<div className='lg:col-span-1'>
								<Card>
									<CardHeader>
										<div className='flex items-center justify-between'>
											<CardTitle className='text-base flex items-center gap-2'>
												<Filter className='w-4 h-4' />
												Categorieën
											</CardTitle>
											<Button
												size='sm'
												variant='ghost'
												onClick={() => setShowCategoryCreator(true)}
												className='h-8 w-8 p-0'>
												<Plus className='w-4 h-4' />
											</Button>
										</div>
									</CardHeader>
									<CardContent className='space-y-1'>
										<button
											onClick={() => setSelectedCategory("all")}
											className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
												selectedCategory === "all"
													? "bg-gray-900 text-white shadow-sm"
													: "hover:bg-gray-50 hover:shadow-sm"
											}`}>
											<div className='flex items-center gap-3'>
												<div className='flex-shrink-0 w-4 h-4 flex items-center justify-center'>
													<MessageSquare className='w-4 h-4' />
												</div>
												<span className='flex-1 min-w-0'>Alle Prompts</span>
												<Badge
													variant='secondary'
													className='text-xs bg-gray-100 text-gray-600 border-0 px-2'>
													{getFilteredPrompts().length}
												</Badge>
											</div>
										</button>

										{categories.map((category) => {
											const IconComponent =
												categoryIcons[category.icon] || MessageSquare;

											return (
												<button
													key={category.id}
													onClick={() => setSelectedCategory(category.id)}
													className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
														selectedCategory === category.id
															? "bg-gray-900 text-white shadow-sm"
															: "hover:bg-gray-50 hover:shadow-sm"
													}`}>
													<div className='flex items-center gap-3'>
														<div className='flex-shrink-0 w-4 h-4 flex items-center justify-center'>
															<IconComponent
																className='w-4 h-4'
																style={{
																	color:
																		selectedCategory === category.id
																			? "currentColor"
																			: "#6b7280",
																}}
															/>
														</div>
														<span className='flex-1 min-w-0'>
															{category.name}
														</span>
														<Badge
															variant='secondary'
															className='text-xs bg-gray-100 text-gray-600 border-0 px-2'>
															{
																getFilteredPrompts().filter(
																	(p) => p.category_id === category.id
																).length
															}
														</Badge>
													</div>
												</button>
											);
										})}

										{categories.length === 0 && (
											<div className='text-center py-4'>
												<p className='text-sm text-muted-foreground mb-3'>
													Geen categorieën gevonden
												</p>
												<Button
													size='sm'
													variant='outline'
													onClick={() => setShowCategoryCreator(true)}
													className='w-full'>
													<Plus className='w-4 h-4 mr-2' />
													Eerste Categorie
												</Button>
											</div>
										)}
									</CardContent>
								</Card>
							</div>

							{/* Prompts Grid */}
							<div className='lg:col-span-3'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{getFilteredPrompts().map((prompt) => {
										const category = categories.find(
											(c) => c.id === prompt.category_id
										);
										const IconComponent =
											categoryIcons[category?.icon] || MessageSquare;

										return (
											<Card
												key={prompt.id}
												className='hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-transparent hover:border-l-gray-900'>
												<CardHeader className='pb-3'>
													<div className='flex items-center justify-between mb-2'>
														<div className='flex items-center gap-2'>
															<div className='flex-shrink-0 p-1.5 rounded-md flex items-center justify-center bg-gray-100'>
																<IconComponent className='w-3.5 h-3.5 text-gray-600' />
															</div>
															<Badge
																variant='outline'
																className='text-xs border-0 px-2 py-0.5 bg-gray-100 text-gray-600'>
																{category?.name}
															</Badge>
														</div>
                                            <div className='flex items-center gap-1'>
                                                {prompt.created_by !== user?.id && (
                                                    <Badge
                                                        variant='secondary'
                                                        className='text-xs bg-green-100 text-green-700 border-green-200'>
                                                        Bedrijf
                                                    </Badge>
                                                )}
                                                {prompt.is_template && (
																<Badge
																	variant='secondary'
																	className='text-xs bg-gray-100 text-gray-600'>
																	Template
																</Badge>
															)}
														</div>
													</div>
													<CardTitle className='text-lg font-semibold text-gray-900 leading-tight'>
														{prompt.title}
													</CardTitle>
													<CardDescription className='text-sm text-gray-600 line-clamp-2 leading-relaxed'>
														{prompt.description}
													</CardDescription>
												</CardHeader>
												<CardContent className='py-3'>
													{prompt.tags && prompt.tags.length > 0 && (
														<div className='flex flex-wrap gap-1 mb-4'>
															{prompt.tags.length > 3 && (
																<Badge
																	variant='outline'
																	className='text-xs bg-gray-50 text-gray-600 border-gray-200'>
																	+{prompt.tags.length - 3}
																</Badge>
															)}
														</div>
													)}

													<div className='flex items-center justify-between text-xs text-gray-500'>
														<div className='flex items-center gap-1'>
															<Clock className='w-3 h-3' />
															<span>Versie {prompt.version}</span>
														</div>
														<div className='flex items-center gap-1'>
															<TrendingUp className='w-3 h-3' />
															<span>{prompt.usage_count || 0}x gebruikt</span>
														</div>
													</div>
												</CardContent>
												<CardFooter className='pt-3 gap-2'>
													<Button
														size='sm'
														className='flex-1 bg-gray-900 text-white hover:bg-gray-800 font-medium shadow-sm'
														onClick={() => handleUsePrompt(prompt)}>
														<Eye className='w-3.5 h-3.5 mr-2' />
														Gebruiken
													</Button>
													{prompt.is_template && (
														<Button
															size='sm'
															variant='outline'
															className='border-purple-300 hover:bg-purple-50 text-purple-700'
															onClick={() => handleCreateFromTemplate(prompt)}>
															<Plus className='w-3.5 h-3.5 mr-1' />
															Van Template
														</Button>
													)}
													{prompt.created_by === user?.id && (
														<Button
															size='sm'
															variant='outline'
															className='border-gray-300 hover:bg-gray-50'
															onClick={() => handleEditPrompt(prompt)}>
															<Edit3 className='w-3.5 h-3.5' />
														</Button>
													)}
												</CardFooter>
											</Card>
										);
									})}
								</div>

								{getFilteredPrompts().length === 0 && (
									<div className='col-span-full text-center py-12'>
										<MessageSquare className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
										<h3 className='text-lg font-medium mb-2'>
											{promptType === "personal"
												? "Geen persoonlijke prompts gevonden"
												: promptType === "company"
												? "Geen bedrijf prompts gevonden"
												: "Geen prompts gevonden"}
										</h3>
										<p className='text-muted-foreground mb-4'>
											{searchTerm
												? "Probeer andere zoektermen"
												: promptType === "personal"
												? "Maak je eerste persoonlijke prompt aan"
												: promptType === "company"
												? "Er zijn nog geen goedgekeurde bedrijf prompts"
												: "Maak je eerste prompt aan"}
										</p>
										{promptType !== "company" && (
											<Button onClick={handleCreatePrompt}>
												<Plus className='w-4 h-4 mr-2' />
												Nieuwe Prompt
											</Button>
										)}
									</div>
								)}
							</div>
						</div>
					</TabsContent>

					<TabsContent value='templates' className='space-y-6'>
						<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
							{/* Categories Sidebar */}
							<div className='lg:col-span-1'>
								<Card>
									<CardHeader>
										<div className='flex items-center justify-between'>
											<CardTitle className='text-base flex items-center gap-2'>
												<Filter className='w-4 h-4' />
												Template Categorieën
											</CardTitle>
											<Button
												size='sm'
												variant='ghost'
												onClick={() => setShowCategoryCreator(true)}
												className='h-8 w-8 p-0'>
												<Plus className='w-4 h-4' />
											</Button>
										</div>
									</CardHeader>
									<CardContent className='space-y-1'>
										<button
											onClick={() => setSelectedCategory("all")}
											className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
												selectedCategory === "all"
													? "bg-gray-900 text-white shadow-sm"
													: "hover:bg-gray-50 hover:shadow-sm"
											}`}>
											<div className='flex items-center gap-3'>
												<div className='flex-shrink-0 w-4 h-4 flex items-center justify-center'>
													<Lightbulb className='w-4 h-4' />
												</div>
												<span className='flex-1 min-w-0'>Alle Templates</span>
												<Badge
													variant='secondary'
													className='text-xs bg-gray-100 text-gray-600 border-0 px-2'>
													{
														getFilteredPrompts().filter((p) => p.is_template)
															.length
													}
												</Badge>
											</div>
										</button>

										{categories.map((category) => {
											const IconComponent =
												categoryIcons[category.icon] || MessageSquare;
											const templateCount = getFilteredPrompts().filter(
												(p) => p.is_template && p.category_id === category.id
											).length;

											return (
												<button
													key={category.id}
													onClick={() => setSelectedCategory(category.id)}
													className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
														selectedCategory === category.id
															? "bg-gray-900 text-white shadow-sm"
															: "hover:bg-gray-50 hover:shadow-sm"
													}`}>
													<div className='flex items-center gap-3'>
														<div className='flex-shrink-0 w-4 h-4 flex items-center justify-center'>
															<IconComponent
																className='w-4 h-4'
																style={{
																	color:
																		selectedCategory === category.id
																			? "currentColor"
																			: "#6b7280",
																}}
															/>
														</div>
														<span className='flex-1 min-w-0'>
															{category.name}
														</span>
														<Badge
															variant='secondary'
															className='text-xs bg-gray-100 text-gray-600 border-0 px-2'>
															{templateCount}
														</Badge>
													</div>
												</button>
											);
										})}

										{categories.length === 0 && (
											<div className='text-center py-4'>
												<p className='text-sm text-muted-foreground mb-3'>
													Geen categorieën gevonden
												</p>
												<Button
													size='sm'
													variant='outline'
													onClick={() => setShowCategoryCreator(true)}
													className='w-full'>
													<Plus className='w-4 h-4 mr-2' />
													Eerste Categorie
												</Button>
											</div>
										)}
									</CardContent>
								</Card>
							</div>

							{/* Templates Grid */}
							<div className='lg:col-span-3'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{getFilteredPrompts()
										.filter((prompt) => prompt.is_template)
										.map((prompt) => {
											const category = categories.find(
												(c) => c.id === prompt.category_id
											);
											const IconComponent =
												categoryIcons[category?.icon] || MessageSquare;

											return (
												<Card
													key={prompt.id}
													className='hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-transparent hover:border-l-purple-500'>
													<CardHeader className='pb-3'>
														<div className='flex items-center justify-between mb-2'>
															<div className='flex items-center gap-2'>
																<div className='flex-shrink-0 p-1.5 rounded-md flex items-center justify-center bg-purple-100'>
																	<IconComponent className='w-3.5 h-3.5 text-purple-600' />
																</div>
																<Badge
																	variant='outline'
																	className='text-xs border-0 px-2 py-0.5 bg-gray-100 text-gray-600'>
																	{category?.name}
																</Badge>
															</div>
															<div className='flex items-center gap-1'>
																<Badge
																	variant='secondary'
																	className='text-xs bg-purple-100 text-purple-700 border-purple-200'>
																	Template
																</Badge>
															</div>
														</div>
														<CardTitle className='text-lg font-semibold text-gray-900 leading-tight'>
															{prompt.title}
														</CardTitle>
														<CardDescription className='text-sm text-gray-600 line-clamp-2 leading-relaxed'>
															{prompt.description}
														</CardDescription>
													</CardHeader>
													<CardContent className='py-3'>
														{prompt.tags && prompt.tags.length > 0 && (
															<div className='flex flex-wrap gap-1 mb-4'>
																{prompt.tags.slice(0, 3).map((tag) => (
																	<Badge
																		key={tag}
																		variant='outline'
																		className='text-xs bg-gray-50 text-gray-600 border-gray-200'>
																		{tag}
																	</Badge>
																))}
																{prompt.tags.length > 3 && (
																	<Badge
																		variant='outline'
																		className='text-xs bg-gray-50 text-gray-600 border-gray-200'>
																		+{prompt.tags.length - 3}
																	</Badge>
																)}
															</div>
														)}

														<div className='flex items-center justify-between text-xs text-gray-500'>
															<div className='flex items-center gap-1'>
																<Clock className='w-3 h-3' />
																<span>Versie {prompt.version}</span>
															</div>
															<div className='flex items-center gap-1'>
																<TrendingUp className='w-3 h-3' />
																<span>{prompt.usage_count || 0}x gebruikt</span>
															</div>
														</div>
													</CardContent>
													<CardFooter className='pt-3 gap-2'>
														<Button
															size='sm'
															className='flex-1 bg-gray-900 text-white hover:bg-gray-800 font-medium shadow-sm'
															onClick={() => handleUsePrompt(prompt)}>
															<Eye className='w-3.5 h-3.5 mr-2' />
															Gebruiken
														</Button>
														<Button
															size='sm'
															variant='outline'
															className='border-purple-300 hover:bg-purple-50 text-purple-700'
															onClick={() => handleCreateFromTemplate(prompt)}>
															<Plus className='w-3.5 h-3.5 mr-1' />
															Van Template
														</Button>
														{prompt.created_by === user?.id && (
															<Button
																size='sm'
																variant='outline'
																className='border-gray-300 hover:bg-gray-50'
																onClick={() => handleEditPrompt(prompt)}>
																<Edit3 className='w-3.5 h-3.5' />
															</Button>
														)}
													</CardFooter>
												</Card>
											);
										})}
								</div>

								{getFilteredPrompts().filter((prompt) => prompt.is_template)
									.length === 0 && (
									<div className='col-span-full text-center py-12'>
										<Lightbulb className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
										<h3 className='text-lg font-medium mb-2'>
											Geen templates gevonden
										</h3>
										<p className='text-muted-foreground mb-4'>
											Er zijn nog geen template prompts aangemaakt
										</p>
										<Button onClick={handleCreatePrompt}>
											<Plus className='w-4 h-4 mr-2' />
											Eerste Template
										</Button>
									</div>
								)}
							</div>
						</div>
					</TabsContent>

					<TabsContent value='analytics' className='space-y-6'>
						<PromptAnalytics />
					</TabsContent>
				</Tabs>

				{/* Modals */}
				<PromptGenerator
					prompt={selectedPrompt}
					isOpen={showGenerator}
					onClose={() => {
						setShowGenerator(false);
						setSelectedPrompt(null);
					}}
					onGenerate={handleGenerateContent}
					onPromptUsed={() => {
						// Refresh prompts to update usage count
						loadPrompts();
					}}
				/>

				<PromptCreator
					isOpen={showCreator}
					onClose={() => {
						setShowCreator(false);
						setEditingPrompt(null);
					}}
					onSave={handlePromptSaved}
					editPrompt={editingPrompt}
				/>

				<CategoryCreator
					isOpen={showCategoryCreator}
					onClose={() => setShowCategoryCreator(false)}
					onSave={handleCategorySaved}
				/>
			</div>
		</DashboardLayout>
	);
}
