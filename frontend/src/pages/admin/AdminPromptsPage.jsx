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
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	MessageSquare,
	Search,
	Plus,
	Edit3,
	Trash2,
	Tag,
	Filter,
	Eye,
	Copy,
	Check,
	X,
} from "lucide-react";

export function AdminPromptsPage() {
	const navigate = useNavigate();
	const [prompts, setPrompts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showCategoryDialog, setShowCategoryDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [editingPrompt, setEditingPrompt] = useState(null);
	const [promptFormData, setPromptFormData] = useState({
		title: "",
		content: "",
		description: "",
		category_id: "",
		tags: "",
	});
	const [categoryFormData, setCategoryFormData] = useState({
		name: "",
		description: "",
	});

	useEffect(() => {
		loadPrompts();
		loadCategories();
	}, [currentPage, searchTerm, selectedCategory, selectedStatus]);

	const loadPrompts = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: currentPage,
				limit: 10,
				search: searchTerm,
				category_id: selectedCategory === "all" ? "" : selectedCategory,
				status: selectedStatus === "all" ? "" : selectedStatus,
			});

			const response = await api.get(`/admin/prompts?${params}`);
			if (response.data?.success) {
				console.log('Loaded prompts:', response.data.data.prompts);
				setPrompts(response.data.data.prompts || []);
				setTotalPages(response.data.data.totalPages || 1);
			} else {
				console.error('Failed to load prompts:', response.data?.message);
			}
		} catch (error) {
			console.error("Error loading prompts:", error);
			setPrompts([]);
		} finally {
			setLoading(false);
		}
	};

	const loadCategories = async () => {
		try {
		const response = await api.get("/admin/prompts/categories");
		if (response.data?.success) {
			setCategories(response.data.data || []);
		} else {
			console.error('Failed to load categories:', response.data?.message);
		}
		} catch (error) {
			console.error("Error loading categories:", error);
			setCategories([]);
		}
	};

	const handleCreatePrompt = async () => {
		try {
			const tagsArray = promptFormData.tags
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0);

			const response = await api.post("/admin/prompts", {
				...promptFormData,
				tags: tagsArray,
			});

			if (response.data?.success) {
				setShowCreateDialog(false);
				setPromptFormData({
					title: "",
					content: "",
					description: "",
					category_id: "",
					tags: "",
				});
				loadPrompts();
			}
		} catch (error) {
			console.error("Error creating prompt:", error);
		}
	};

	const handleCreateCategory = async () => {
		try {
			const response = await api.post("/admin/prompts/categories", categoryFormData);
			if (response.data?.success) {
				setShowCategoryDialog(false);
				setCategoryFormData({
					name: "",
					description: "",
				});
				loadCategories();
			}
		} catch (error) {
			console.error("Error creating category:", error);
		}
	};

	const handleDeletePrompt = async (promptId) => {
		if (window.confirm("Are you sure you want to delete this prompt?")) {
			try {
				await api.delete(`/admin/prompts/${promptId}`);
				loadPrompts();
			} catch (error) {
				console.error("Error deleting prompt:", error);
			}
		}
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		// You could add a toast notification here
	};

	const handleApprovePrompt = async (promptId) => {
		try {
			const response = await api.put(`/admin/prompts/${promptId}/approve`);
			if (response.data?.success) {
				loadPrompts(); // Refresh the list
				alert("Prompt approved successfully");
			}
		} catch (error) {
			console.error("Error approving prompt:", error);
			alert("Error approving prompt");
		}
	};

	const handleRejectPrompt = async (promptId) => {
		const reason = window.prompt("Reject prompt - Please provide a reason (optional):");
		if (reason !== null) { // User didn't cancel
			try {
				const response = await api.put(`/admin/prompts/${promptId}/reject`, { reason });
				if (response.data?.success) {
					loadPrompts(); // Refresh the list
					alert("Prompt rejected successfully");
				}
			} catch (error) {
				console.error("Error rejecting prompt:", error);
				alert("Error rejecting prompt");
			}
		}
	};

	const handleEditPrompt = (prompt) => {
		setEditingPrompt(prompt);
		setPromptFormData({
			title: prompt.title,
			content: prompt.content,
			description: prompt.description || "",
			category_id: prompt.category_id || "",
			tags: prompt.tags ? prompt.tags.join(", ") : "",
		});
		setShowEditDialog(true);
	};

	const handleUpdatePrompt = async () => {
		try {
			const updateData = {
				...promptFormData,
				tags: promptFormData.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
			};

			const response = await api.put(`/admin/prompts/${editingPrompt.id}`, updateData);
			if (response.data?.success) {
				setShowEditDialog(false);
				setEditingPrompt(null);
				loadPrompts(); // Refresh the list
			}
		} catch (error) {
			console.error("Error updating prompt:", error);
		}
	};

	return (
		<DashboardLayout>
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Bedrijf Prompts</h1>
						<p className='text-muted-foreground'>
							Beheer AI prompts voor je bedrijf
						</p>
					</div>
					<div className='flex items-center space-x-2'>
						<Button onClick={() => setShowCategoryDialog(true)} variant="outline">
							<Tag className='mr-2 h-4 w-4' />
							Add Category
						</Button>
						<Button onClick={() => setShowCreateDialog(true)}>
							<Plus className='mr-2 h-4 w-4' />
							Maak Bedrijf Prompt
						</Button>
					</div>
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
										placeholder='Search prompts...'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className='pl-10'
									/>
								</div>
							</div>
							<Select value={selectedCategory} onValueChange={setSelectedCategory}>
								<SelectTrigger className='w-[180px]'>
									<SelectValue placeholder='Filter by category' />
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
							<Select value={selectedStatus} onValueChange={setSelectedStatus}>
								<SelectTrigger className='w-[180px]'>
									<SelectValue placeholder='Filter by status' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Status</SelectItem>
									<SelectItem value='approved'>Approved</SelectItem>
									<SelectItem value='pending_review'>Pending Review</SelectItem>
									<SelectItem value='draft'>Draft</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Prompts Grid */}
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{loading ? (
						<div className='col-span-full flex items-center justify-center h-32'>
							<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100'></div>
						</div>
					) : prompts.length > 0 ? (
						prompts.map((prompt) => (
							<Card key={prompt.id} className='hover:shadow-md transition-shadow'>
								<CardHeader>
									<div className='flex items-start justify-between'>
										<div className='flex-1'>
											<div className='flex items-center gap-2 mb-1'>
												<CardTitle className='text-lg'>{prompt.title}</CardTitle>
												<Badge variant="secondary" className='text-xs'>
													Bedrijf Prompt
												</Badge>
											</div>
											<CardDescription className='mt-1'>
												{prompt.description || "No description"}
											</CardDescription>
										</div>
										<div className='flex items-center space-x-1'>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => copyToClipboard(prompt.content)}
											>
												<Copy className='h-4 w-4' />
											</Button>
											{prompt.status === 'pending_review' && (
												<>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => handleApprovePrompt(prompt.id)}
														title="Approve prompt"
													>
														<Check className='h-4 w-4' />
													</Button>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => handleRejectPrompt(prompt.id)}
														title="Reject prompt"
													>
														<X className='h-4 w-4' />
													</Button>
												</>
											)}
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleEditPrompt(prompt)}
											>
												<Edit3 className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleDeletePrompt(prompt.id)}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										<div className='text-sm text-muted-foreground line-clamp-3'>
											{prompt.content}
										</div>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												{prompt.category && (
													<Badge variant='secondary' className='text-xs'>
														{prompt.category.name}
													</Badge>
												)}
												<Badge 
													variant={prompt.status === 'approved' ? 'default' : prompt.status === 'pending_review' ? 'secondary' : 'outline'}
													className={`text-xs font-medium ${
														prompt.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
														prompt.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
														prompt.status === 'draft' ? 'bg-gray-100 text-gray-800 border-gray-200' :
														'bg-gray-100 text-gray-800 border-gray-200'
													}`}
												>
													{prompt.status?.replace('_', ' ').toUpperCase()}
												</Badge>
											</div>
										</div>
										{prompt.tags && prompt.tags.length > 0 && (
											<div className='flex flex-wrap gap-1'>
												{prompt.tags.map((tag, index) => (
													<Badge key={index} variant='outline' className='text-xs'>
														{tag}
													</Badge>
												))}
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						))
					) : (
						<div className='col-span-full text-center py-8'>
							<MessageSquare className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
							<p className='text-muted-foreground'>No prompts found</p>
							<p className='text-sm text-muted-foreground'>
								Create your first company prompt to get started
							</p>
						</div>
					)}
				</div>

				{/* Create Prompt Dialog */}
				{showCreateDialog && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
						<Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
							<CardHeader>
								<CardTitle>Create Prompt</CardTitle>
								<CardDescription>
									Add a new AI prompt for your company
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<Input
									placeholder='Prompt Title'
									value={promptFormData.title}
									onChange={(e) => setPromptFormData({ ...promptFormData, title: e.target.value })}
								/>
								<Input
									placeholder='Description (optional)'
									value={promptFormData.description}
									onChange={(e) => setPromptFormData({ ...promptFormData, description: e.target.value })}
								/>
								<Textarea
									placeholder='Prompt Content'
									value={promptFormData.content}
									onChange={(e) => setPromptFormData({ ...promptFormData, content: e.target.value })}
									rows={6}
								/>
								<Select
									value={promptFormData.category_id}
									onValueChange={(value) => setPromptFormData({ ...promptFormData, category_id: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder='Select category (optional)' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value=''>No Category</SelectItem>
										{categories.map((category) => (
											<SelectItem key={category.id} value={category.id.toString()}>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Input
									placeholder='Tags (comma separated)'
									value={promptFormData.tags}
									onChange={(e) => setPromptFormData({ ...promptFormData, tags: e.target.value })}
								/>
								<div className='flex justify-end space-x-2'>
									<Button
										variant='outline'
										onClick={() => setShowCreateDialog(false)}
									>
										Cancel
									</Button>
									<Button onClick={handleCreatePrompt}>
										Create Prompt
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Create Category Dialog */}
				{showCategoryDialog && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
						<Card className='w-full max-w-md'>
							<CardHeader>
								<CardTitle>Create Category</CardTitle>
								<CardDescription>
									Add a new category for organizing prompts
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<Input
									placeholder='Category Name'
									value={categoryFormData.name}
									onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
								/>
								<Input
									placeholder='Description (optional)'
									value={categoryFormData.description}
									onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
								/>
								<div className='flex justify-end space-x-2'>
									<Button
										variant='outline'
										onClick={() => setShowCategoryDialog(false)}
									>
										Cancel
									</Button>
									<Button onClick={handleCreateCategory}>
										Create Category
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Edit Prompt Dialog */}
				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Bewerk Bedrijf Prompt</DialogTitle>
							<DialogDescription>
								Werk de prompt details hieronder bij.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="edit-title">Title</Label>
								<Input
									id="edit-title"
									value={promptFormData.title}
									onChange={(e) =>
										setPromptFormData({
											...promptFormData,
											title: e.target.value,
										})
									}
									placeholder="Enter prompt title"
								/>
							</div>
							<div>
								<Label htmlFor="edit-description">Description</Label>
								<Input
									id="edit-description"
									value={promptFormData.description}
									onChange={(e) =>
										setPromptFormData({
											...promptFormData,
											description: e.target.value,
										})
									}
									placeholder="Enter prompt description"
								/>
							</div>
							<div>
								<Label htmlFor="edit-category">Category</Label>
								<Select
									value={promptFormData.category_id}
									onValueChange={(value) =>
										setPromptFormData({
											...promptFormData,
											category_id: value,
										})
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">No Category</SelectItem>
										{categories.map((category) => (
											<SelectItem key={category.id} value={category.id.toString()}>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="edit-tags">Tags (comma-separated)</Label>
								<Input
									id="edit-tags"
									value={promptFormData.tags}
									onChange={(e) =>
										setPromptFormData({
											...promptFormData,
											tags: e.target.value,
										})
									}
									placeholder="e.g., marketing, sales, support"
								/>
							</div>
							<div>
								<Label htmlFor="edit-content">Content</Label>
								<Textarea
									id="edit-content"
									value={promptFormData.content}
									onChange={(e) =>
										setPromptFormData({
											...promptFormData,
											content: e.target.value,
										})
									}
									placeholder="Enter the prompt content"
									rows={6}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowEditDialog(false)}
							>
								Cancel
							</Button>
							<Button onClick={handleUpdatePrompt}>
								Update Bedrijf Prompt
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayout>
	);
}
