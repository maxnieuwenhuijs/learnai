import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../ui/dialog";
import {
	Plus,
	X,
	Save,
	Eye,
	Trash2,
	Variable,
	AlertCircle,
	Info,
	MessageSquare,
	GraduationCap,
	Scale,
	Lightbulb,
	CheckSquare,
	BarChart,
} from "lucide-react";
import { promptsApi } from "../../api/prompts";
import { useAuth } from "../../contexts/AuthContext";
import CategoryCreator from "./CategoryCreator";
import InlineVariableInserter from "./InlineVariableInserter";
import PromptVersionHistory from "./PromptVersionHistory";

const categoryIcons = {
	GraduationCap: GraduationCap,
	Scale: Scale,
	Lightbulb: Lightbulb,
	CheckSquare: CheckSquare,
	MessageSquare: MessageSquare,
	BarChart: BarChart,
};

const PromptCreator = ({ isOpen, onClose, onSave, editPrompt = null }) => {
	const { user } = useAuth();
	const [categories, setCategories] = useState([]);
	const [templates, setTemplates] = useState([]);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		content: "",
		category_id: "",
		department_id: null,
		is_template: false,
		is_company_prompt: false,
		tags: [],
		status: "draft",
	});
	const [variables, setVariables] = useState([]);
	const [newTag, setNewTag] = useState("");
	const [isPreviewMode, setIsPreviewMode] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showCategoryCreator, setShowCategoryCreator] = useState(false);
	const [activeTab, setActiveTab] = useState("prompt");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteConfirmName, setDeleteConfirmName] = useState("");

	useEffect(() => {
		if (isOpen) {
			loadCategories();
			loadTemplates();
			if (editPrompt) {
				// Pre-fill form when editing
				setFormData({
					title: editPrompt.title || "",
					description: editPrompt.description || "",
					content: editPrompt.content || "",
					category_id: editPrompt.category_id || "",
					department_id: editPrompt.department_id || null,
					is_template: editPrompt.is_template || false,
					is_company_prompt: editPrompt.is_company_prompt || false,
					tags: editPrompt.tags || [],
					status: editPrompt.status || "draft",
				});
				setVariables(editPrompt.variables || []);
				setSelectedTemplate(null);
			} else {
				// Reset form for new prompt
				setFormData({
					title: "",
					description: "",
					content: "",
					category_id: "",
					department_id: null,
					is_template: false,
					is_company_prompt: false,
					tags: [],
					status: "draft",
				});
				setVariables([]);
				setSelectedTemplate(null);
			}
		} else {
			// Reset everything when dialog is closed
			setSelectedTemplate(null);
			setError("");
			setActiveTab("prompt");
		}
	}, [isOpen, editPrompt]);

	const loadCategories = async () => {
		try {
			const response = await promptsApi.getCategories();
			setCategories(response.data);
		} catch (error) {
			console.error("Error loading categories:", error);
		}
	};

	const loadTemplates = async () => {
		try {
			const response = await promptsApi.getPrompts({ is_template: "true" });
			setTemplates(response.data.prompts || []);
		} catch (error) {
			console.error("Error loading templates:", error);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleTemplateSelect = (template) => {
		if (template) {
			setSelectedTemplate(template);
			setFormData({
				title: `${template.title} (Kopie)`,
				description: template.description || "",
				content: template.content || "",
				category_id: template.category_id || "",
				department_id: template.department_id || null,
				is_template: false, // New prompt is not a template
				is_company_prompt: template.is_company_prompt || false,
				tags: template.tags || [],
				status: "draft",
			});
			setVariables(template.variables || []);
		} else {
			setSelectedTemplate(null);
			// Reset to empty form
			setFormData({
				title: "",
				description: "",
				content: "",
				category_id: "",
				department_id: null,
				is_template: false,
				is_company_prompt: false,
				tags: [],
				status: "draft",
			});
			setVariables([]);
		}
	};

	const addTag = () => {
		if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, newTag.trim()],
			}));
			setNewTag("");
		}
	};

	const removeTag = (tagToRemove) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addTag();
		}
	};

	const validateForm = () => {
		if (!formData.title.trim()) return "Titel is verplicht";
		if (!formData.content.trim()) return "Content is verplicht";
		if (!formData.category_id) return "Categorie is verplicht";

		// Validate variables
		for (let i = 0; i < variables.length; i++) {
			const variable = variables[i];
			if (!variable.name.trim()) {
				return `Variabele ${i + 1} moet een naam hebben`;
			}
			if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.name)) {
				return `Variabele "${variable.name}" heeft een ongeldige naam (alleen letters, cijfers en underscores)`;
			}
		}

		return null;
	};

	const previewContent = () => {
		let preview = formData.content;
		variables.forEach((variable) => {
			const placeholder = `{{${variable.name}}}`;
			const replacement = variable.default || `[${variable.name}]`;
			preview = preview.replace(
				new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
				replacement
			);
		});
		return preview;
	};

	const handleCategorySaved = (newCategory) => {
		// Add the new category to the list and select it
		setCategories((prev) => [...prev, newCategory]);
		setFormData((prev) => ({
			...prev,
			category_id: newCategory.id.toString(),
		}));
		setShowCategoryCreator(false);
	};

	const handleSave = async () => {
		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		try {
			setLoading(true);
			setError("");

			const promptData = {
				...formData,
				variables: variables.filter((v) => v.name.trim()), // Only include variables with names
			};

			let response;
			if (editPrompt) {
				response = await promptsApi.updatePrompt(editPrompt.id, promptData);
			} else {
				response = await promptsApi.createPrompt(promptData);
			}

			if (onSave) {
				onSave(response.data);
			}

			onClose();
		} catch (error) {
			console.error("Error saving prompt:", error);
			setError("Fout bij het opslaan. Probeer het opnieuw.");
		} finally {
			setLoading(false);
		}
	};

	const handleDeletePrompt = async () => {
		if (deleteConfirmName !== editPrompt?.title) {
			alert("De ingevoerde naam komt niet overeen met de prompt naam.");
			return;
		}

		try {
			setLoading(true);
			await promptsApi.deletePrompt(editPrompt.id);

			if (onSave) {
				onSave(null); // Signal that prompt was deleted
			}

			setShowDeleteConfirm(false);
			setDeleteConfirmName("");
			onClose();
		} catch (error) {
			console.error("Error deleting prompt:", error);
			alert("Er is een fout opgetreden bij het verwijderen van de prompt.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Variable className='w-5 h-5' />
						{editPrompt ? "Prompt Bewerken" : "Nieuwe Prompt Maken"}
					</DialogTitle>
					<DialogDescription>
						{editPrompt
							? "Bewerk de prompt details en content hieronder."
							: "Maak een nieuwe prompt aan of kies een template om mee te beginnen."}
					</DialogDescription>

					{/* Tabs */}
					{editPrompt && (
						<div className='flex border-b border-gray-200 mt-4'>
							<button
								onClick={() => setActiveTab("prompt")}
								className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
									activeTab === "prompt"
										? "border-gray-900 text-gray-900"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}>
								Prompt
							</button>
							<button
								onClick={() => setActiveTab("versions")}
								className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
									activeTab === "versions"
										? "border-gray-900 text-gray-900"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}>
								Versies
							</button>
						</div>
					)}
				</DialogHeader>

				{/* Tab Content */}
				{activeTab === "prompt" ? (
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						{/* Form Panel */}
						<div className='space-y-4'>
							{/* Basic Information */}
							<div className='space-y-4'>
								<div>
									<Label htmlFor='title'>Titel *</Label>
									<Input
										id='title'
										value={formData.title}
										onChange={(e) => handleInputChange("title", e.target.value)}
										placeholder='Voer een titel in voor de prompt'
									/>
								</div>

								<div>
									<Label htmlFor='description'>Beschrijving</Label>
									<Textarea
										id='description'
										value={formData.description}
										onChange={(e) =>
											handleInputChange("description", e.target.value)
										}
										placeholder='Beschrijf waar deze prompt voor gebruikt wordt'
										rows={3}
									/>
								</div>

								{/* Template Selector - only show when creating new prompt */}
								{!editPrompt && (
									<div>
										<Label htmlFor='template'>
											Start van Template (optioneel)
										</Label>
										<Select
											value={
												selectedTemplate?.id
													? selectedTemplate.id.toString()
													: undefined
											}
											onValueChange={(templateId) => {
												if (templateId && templateId !== "none") {
													const template = templates.find(
														(t) => t.id === parseInt(templateId)
													);
													handleTemplateSelect(template);
												} else {
													handleTemplateSelect(null);
												}
											}}>
											<SelectTrigger>
												<SelectValue placeholder='Kies een template om mee te beginnen...' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='none'>
													Geen template - start leeg
												</SelectItem>
												{templates.map((template) => (
													<SelectItem
														key={template.id}
														value={template.id.toString()}>
														<div className='flex items-center gap-2'>
															{(() => {
																const category = categories.find(
																	(c) => c.id === template.category_id
																);
																const IconComponent =
																	categoryIcons[category?.icon] ||
																	MessageSquare;
																return <IconComponent className='w-4 h-4' />;
															})()}
															<span>{template.title}</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{selectedTemplate && (
											<div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md'>
												<div className='flex items-center gap-2 text-sm text-blue-700'>
													<Info className='w-4 h-4' />
													<span>
														Template geselecteerd: {selectedTemplate.title}
													</span>
												</div>
												<p className='text-xs text-blue-600 mt-1'>
													De titel is automatisch aangepast naar "
													{formData.title}". Je kunt alle velden nog aanpassen
													voordat je opslaat.
												</p>
											</div>
										)}
									</div>
								)}

								<div>
									<div className='flex items-center justify-between mb-2'>
										<Label htmlFor='category'>Categorie *</Label>
										<Button
											size='sm'
											onClick={() => setShowCategoryCreator(true)}
											type='button'
											className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0'>
											<Plus className='w-4 h-4 mr-2' />
											Nieuwe Categorie
										</Button>
									</div>

									{categories.length === 0 ? (
										<div className='p-4 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50'>
											<div className='mb-3'>
												<AlertCircle className='w-8 h-8 text-gray-400 mx-auto mb-2' />
												<h3 className='font-medium text-gray-700'>
													Geen categorieën beschikbaar
												</h3>
												<p className='text-sm text-gray-500 mt-1'>
													Maak eerst een categorie aan voordat je een prompt
													kunt maken
												</p>
											</div>
											<Button
												onClick={() => setShowCategoryCreator(true)}
												type='button'
												className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'>
												<Plus className='w-4 h-4 mr-2' />
												Maak je eerste categorie
											</Button>
										</div>
									) : (
										<Select
											value={formData.category_id}
											onValueChange={(value) =>
												handleInputChange("category_id", value)
											}>
											<SelectTrigger>
												<SelectValue placeholder='Kies een categorie' />
											</SelectTrigger>
											<SelectContent>
												{categories.map((category) => {
													const IconComponent =
														categoryIcons[category.icon] || MessageSquare;
													return (
														<SelectItem
															key={category.id}
															value={category.id.toString()}>
															<div className='flex items-center gap-2'>
																<IconComponent
																	className='w-4 h-4'
																	style={{ color: category.color }}
																/>
																{category.name}
															</div>
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
									)}
								</div>

								<div className='space-y-3'>
									<div className='flex items-center space-x-2'>
										<Switch
											id='is_template'
											checked={formData.is_template}
											onCheckedChange={(checked) =>
												handleInputChange("is_template", checked)
											}
										/>
										<Label htmlFor='is_template'>
											Dit is een herbruikbare template
										</Label>
									</div>

									<div className='flex items-center space-x-2'>
										<Switch
											id='is_company_prompt'
											checked={formData.is_company_prompt}
											onCheckedChange={(checked) => {
												handleInputChange("is_company_prompt", checked);
												// If company prompt, set status to pending_review
												if (checked) {
													handleInputChange("status", "pending_review");
												}
											}}
										/>
										<Label htmlFor='is_company_prompt'>
											Bedrijfsprompt (vereist goedkeuring van admin)
										</Label>
									</div>
								</div>
							</div>

							{/* Content with Inline Variable Inserter */}
							<InlineVariableInserter
								content={formData.content}
								onContentChange={(content) =>
									handleInputChange("content", content)
								}
								variables={variables}
								onVariablesChange={setVariables}
								placeholder='Schrijf je prompt hier. Gebruik {{variabele_naam}} voor dynamische waarden.'
							/>

							{/* Tags */}
							<div>
								<Label>Tags</Label>
								<div className='flex gap-2 mb-2'>
									<Input
										value={newTag}
										onChange={(e) => setNewTag(e.target.value)}
										onKeyPress={handleKeyPress}
										placeholder='Voeg een tag toe'
									/>
									<Button size='sm' onClick={addTag}>
										<Plus className='w-4 h-4' />
									</Button>
								</div>

								<div className='flex flex-wrap gap-1'>
									{formData.tags.map((tag) => (
										<Badge
											key={tag}
											variant='secondary'
											className='flex items-center gap-1'>
											{tag}
											<button onClick={() => removeTag(tag)}>
												<X className='w-3 h-3' />
											</button>
										</Badge>
									))}
								</div>
							</div>

							{error && (
								<div className='flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md'>
									<AlertCircle className='w-4 h-4 text-gray-600' />
									<span className='text-sm text-gray-700'>{error}</span>
								</div>
							)}
						</div>

						{/* Preview Panel */}
						<div className='space-y-4'>
							<div className='flex items-center gap-2'>
								<h3 className='text-lg font-semibold'>Voorbeeld</h3>
								<Button
									size='sm'
									variant='outline'
									onClick={() => setIsPreviewMode(!isPreviewMode)}>
									<Eye className='w-4 h-4' />
								</Button>
							</div>

							<Card>
								<CardContent className='p-4'>
									<pre className='whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto'>
										{previewContent() ||
											"Voer content in om een voorbeeld te zien..."}
									</pre>
								</CardContent>
							</Card>

							{variables.length > 0 && (
								<div>
									<h4 className='font-medium mb-2'>Gedetecteerde Variabelen</h4>
									<div className='space-y-1'>
										{variables.map((variable, index) => (
											<div
												key={index}
												className='text-sm p-2 bg-gray-50 rounded'>
												<code>{`{{${variable.name}}}`}</code>
												{variable.description && (
													<span className='text-gray-500 ml-2'>
														- {variable.description}
													</span>
												)}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				) : (
					/* Versions Tab */
					<div className='space-y-4'>
						<PromptVersionHistory
							promptId={editPrompt?.id}
							onVersionRestore={() => {
								// Reload the prompt data after version restore
								if (editPrompt) {
									// You might want to reload the prompt data here
									console.log("Version restored, reloading prompt data...");
								}
							}}
						/>
					</div>
				)}

				<div className='flex justify-between pt-4 border-t'>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							onClick={onClose}
							className='border-gray-300 hover:bg-gray-50'>
							Annuleren
						</Button>
						{editPrompt && (
							<Button
								variant='outline'
								onClick={() => setShowDeleteConfirm(true)}
								disabled={loading}
								className='border-red-300 text-red-600 hover:bg-red-50'>
								<Trash2 className='w-4 h-4 mr-2' />
								Verwijderen
							</Button>
						)}
					</div>

					<div className='flex gap-2'>
						<Button
							variant='outline'
							onClick={() => handleInputChange("status", "draft")}
							disabled={loading}
							className='border-gray-300 hover:bg-gray-50'>
							Als Concept Opslaan
						</Button>
						<Button
							onClick={handleSave}
							disabled={loading}
							className='bg-gray-900 text-white hover:bg-gray-800'>
							{loading ? (
								<>
									<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
									Opslaan...
								</>
							) : (
								<>
									<Save className='w-4 h-4 mr-2' />
									{editPrompt ? "Bijwerken" : "Opslaan"}
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2 text-red-600'>
							<AlertCircle className='w-5 h-5' />
							Prompt Verwijderen
						</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<p className='text-sm text-gray-600'>
							Weet je zeker dat je de prompt{" "}
							<strong>"{editPrompt?.title}"</strong> wilt verwijderen?
						</p>
						<p className='text-sm text-gray-600'>
							Deze actie kan niet ongedaan worden gemaakt.
						</p>
						<div>
							<Label
								htmlFor='delete-confirm-name'
								className='text-sm font-medium'>
								Typ de prompt naam om te bevestigen:
							</Label>
							<Input
								id='delete-confirm-name'
								value={deleteConfirmName}
								onChange={(e) => setDeleteConfirmName(e.target.value)}
								placeholder={editPrompt?.title}
								className='mt-1'
							/>
						</div>
					</div>
					<div className='flex justify-end gap-2 pt-4 border-t'>
						<Button
							variant='outline'
							onClick={() => {
								setShowDeleteConfirm(false);
								setDeleteConfirmName("");
							}}
							className='border-gray-300 hover:bg-gray-50'>
							Annuleren
						</Button>
						<Button
							onClick={handleDeletePrompt}
							disabled={loading || deleteConfirmName !== editPrompt?.title}
							className='bg-red-600 text-white hover:bg-red-700'>
							{loading ? (
								<>
									<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
									Verwijderen...
								</>
							) : (
								<>
									<Trash2 className='w-4 h-4 mr-2' />
									Verwijderen
								</>
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Category Creator Modal */}
			<CategoryCreator
				isOpen={showCategoryCreator}
				onClose={() => setShowCategoryCreator(false)}
				onSave={handleCategorySaved}
			/>
		</Dialog>
	);
};

export default PromptCreator;
