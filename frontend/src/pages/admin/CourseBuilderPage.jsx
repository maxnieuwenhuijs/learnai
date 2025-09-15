import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import QuillEditor from "@/components/shared/QuillEditor";
import QuizBuilder from "@/components/shared/QuizBuilder";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	GripVertical,
	Play,
	FileText,
	HelpCircle,
	Code,
	Plus,
	Edit,
	Trash2,
	Save,
	ArrowLeft,
	Eye,
	Copy,
	Settings,
	BookOpen,
	Video,
	Clock,
	ChevronDown,
	ChevronRight,
	Upload,
	Link,
} from "lucide-react";
import api from "@/api/config";

// Calculate total duration for a module based on its lessons
const calculateModuleDuration = (module) => {
	if (!module.lessons || module.lessons.length === 0) {
		return 0;
	}

	return module.lessons.reduce((total, lesson) => {
		let duration = 0;

		// Try to get duration from content_data first
		if (lesson.content_data) {
			if (typeof lesson.content_data === "string") {
				try {
					const parsed = JSON.parse(lesson.content_data);
					duration = parseInt(parsed.duration) || 0;
				} catch (e) {
					// If parsing fails, try to extract duration from string
					const match = lesson.content_data.match(/"duration":\s*(\d+)/);
					if (match) {
						duration = parseInt(match[1]) || 0;
					}
				}
			} else if (typeof lesson.content_data === "object") {
				duration = parseInt(lesson.content_data.duration) || 0;
			}
		}

		// Fallback to lesson.duration if content_data doesn't have duration
		if (duration === 0 && lesson.duration) {
			duration = parseInt(lesson.duration) || 0;
		}

		return total + duration;
	}, 0);
};

// Drag and Drop Context (simplified version without external library)
// Sortable Module Component
function SortableModule({
	module,
	index,
	onEdit,
	onDelete,
	onAddLesson,
	expanded,
	onToggleExpand,
	onEditLesson,
	onDeleteLesson,
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: `module-${module.id}` });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={`mb-4 ${isDragging ? "opacity-50" : ""}`}>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div
							{...attributes}
							{...listeners}
							className='cursor-move p-1 hover:bg-gray-100 rounded'>
							<GripVertical className='h-5 w-5 text-gray-400' />
						</div>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => onToggleExpand(module.id)}>
							{expanded ? (
								<ChevronDown className='h-4 w-4' />
							) : (
								<ChevronRight className='h-4 w-4' />
							)}
						</Button>
						<div>
							<CardTitle className='text-lg'>
								Module {index + 1}: {module.title}
							</CardTitle>
							<CardDescription className='text-sm'>
								{module.lessons?.length || 0} lessons •{" "}
								{calculateModuleDuration(module)} minutes
							</CardDescription>
						</div>
					</div>
					<div className='flex gap-2'>
						<Button
							size='sm'
							variant='outline'
							onClick={() => onAddLesson(module.id)}>
							<Plus className='h-4 w-4 mr-1' />
							Add Lesson
						</Button>
						<Button size='sm' variant='ghost' onClick={() => onEdit(module)}>
							<Edit className='h-4 w-4' />
						</Button>
						<Button
							size='sm'
							variant='ghost'
							className='text-red-600'
							onClick={() => onDelete(module.id)}>
							<Trash2 className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</CardHeader>
			{expanded && module.lessons && module.lessons.length > 0 && (
				<CardContent>
					<SortableContext
						items={module.lessons
							.sort((a, b) => (a.lesson_order || 0) - (b.lesson_order || 0))
							.map((lesson) => `lesson-${lesson.id}`)}
						strategy={verticalListSortingStrategy}>
						<div className='space-y-2 ml-12'>
							{module.lessons
								.sort((a, b) => (a.lesson_order || 0) - (b.lesson_order || 0))
								.map((lesson, lessonIndex) => (
									<SortableLesson
										key={lesson.id}
										lesson={lesson}
										moduleId={module.id}
										index={lessonIndex}
										onEdit={onEditLesson}
										onDelete={onDeleteLesson}
									/>
								))}
						</div>
					</SortableContext>
				</CardContent>
			)}
		</Card>
	);
}

// Sortable Lesson Component
function SortableLesson({ lesson, moduleId, index, onEdit, onDelete }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: `lesson-${lesson.id}` });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const getLessonIcon = (contentType) => {
		switch (contentType) {
			case "video":
				return <Video className='h-4 w-4' />;
			case "text":
				return <FileText className='h-4 w-4' />;
			case "quiz":
				return <HelpCircle className='h-4 w-4' />;
			case "lab_simulation":
				return <Settings className='h-4 w-4' />;
			default:
				return <BookOpen className='h-4 w-4' />;
		}
	};

	// Extract duration from content_data
	const getLessonDuration = () => {
		let duration = 0;

		// Debug logging to see the actual data structure
		if (
			lesson.title === "Quiz" ||
			lesson.title === "Text" ||
			lesson.title === "Video"
		) {
			console.log("Lesson data for", lesson.title, ":", {
				content_data: lesson.content_data,
				content_type: lesson.content_type,
				duration: lesson.duration,
				lesson: lesson,
			});
		}

		// Try to get duration from content_data first
		if (lesson.content_data) {
			if (typeof lesson.content_data === "string") {
				try {
					const parsed = JSON.parse(lesson.content_data);
					duration = parseInt(parsed.duration) || 0;
				} catch (e) {
					// If parsing fails, try to extract duration from string
					const match = lesson.content_data.match(/"duration":\s*(\d+)/);
					if (match) {
						duration = parseInt(match[1]) || 0;
					}
				}
			} else if (typeof lesson.content_data === "object") {
				duration = parseInt(lesson.content_data.duration) || 0;
			}
		}

		// Fallback to lesson.duration if content_data doesn't have duration
		if (duration === 0 && lesson.duration) {
			duration = parseInt(lesson.duration) || 0;
		}

		return duration;
	};

	// Get display type name
	const getDisplayType = (contentType) => {
		switch (contentType) {
			case "video":
				return "Video";
			case "text":
				return "Text";
			case "quiz":
				return "Quiz";
			case "lab_simulation":
				return "Assignment";
			default:
				return "Lesson";
		}
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
				isDragging ? "opacity-50" : ""
			}`}>
			<div className='flex items-center gap-3'>
				<div
					{...attributes}
					{...listeners}
					className='cursor-move p-1 hover:bg-gray-200 rounded'>
					<GripVertical className='h-4 w-4 text-gray-400' />
				</div>
				{getLessonIcon(lesson.content_type || lesson.type)}
				<div>
					<div className='font-medium text-sm'>{lesson.title}</div>
					<div className='text-xs text-muted-foreground'>
						{getDisplayType(lesson.content_type || lesson.type)} •{" "}
						{getLessonDuration()} minutes
					</div>
				</div>
			</div>
			<div className='flex gap-1'>
				<Button size='sm' variant='ghost' onClick={() => onEdit(lesson)}>
					<Edit className='h-3 w-3' />
				</Button>
				<Button
					size='sm'
					variant='ghost'
					className='text-red-600'
					onClick={() => onDelete(lesson.id)}>
					<Trash2 className='h-3 w-3' />
				</Button>
			</div>
		</div>
	);
}

function CourseBuilderPage() {
	const { courseId } = useParams();
	const navigate = useNavigate();
	const { toast } = useToast();

	// Drag & Drop sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [activeTab, setActiveTab] = useState("modules");
	const [expandedModules, setExpandedModules] = useState(new Set());

	// Course data
	const [course, setCourse] = useState({
		title: "",
		description: "",
		category: "",
		difficulty: "beginner",
		duration_hours: "",
		image_url: "",
		is_published: false,
		modules: [],
	});

	// Dialog states
	const [showModuleDialog, setShowModuleDialog] = useState(false);
	const [showLessonDialog, setShowLessonDialog] = useState(false);
	const [editingModule, setEditingModule] = useState(null);
	const [editingLesson, setEditingLesson] = useState(null);
	const [selectedModuleId, setSelectedModuleId] = useState(null);

	// Form data
	const [moduleForm, setModuleForm] = useState({
		title: "",
		description: "",
		order: 0,
	});

	const [lessonForm, setLessonForm] = useState({
		title: "",
		type: "video",
		content: "",
		video_url: "",
		duration: "",
		order: 0,
		questions: [],
	});

	useEffect(() => {
		if (courseId && courseId !== "new") {
			fetchCourse();
		} else {
			setLoading(false);
		}
	}, [courseId]);

	const fetchCourse = async () => {
		try {
			setLoading(true);
			const response = await api.get(`/super-admin/courses/${courseId}`);
			if (response.data && response.data.course) {
				const courseData = response.data.course;

				// Sort modules by order
				if (courseData.modules) {
					courseData.modules = courseData.modules.sort(
						(a, b) => (a.order || 0) - (b.order || 0)
					);

					// Sort lessons within each module by lesson_order
					courseData.modules.forEach((module) => {
						if (module.lessons) {
							module.lessons = module.lessons.sort(
								(a, b) => (a.lesson_order || 0) - (b.lesson_order || 0)
							);
						}
					});
				}

				setCourse(courseData);
			}
		} catch (error) {
			console.error("Error fetching course:", error);
			// Use mock data for demo
			setCourse(getMockCourse());
		} finally {
			setLoading(false);
		}
	};

	const getMockCourse = () => ({
		id: courseId,
		title: "Introduction to EU AI Act",
		description:
			"Comprehensive overview of the EU AI Act regulations and compliance requirements",
		category: "Compliance",
		difficulty: "beginner",
		duration_hours: 3,
		image_url: "",
		is_published: false,
		modules: [
			{
				id: 1,
				title: "Understanding AI Regulation",
				description: "Introduction to AI regulation landscape",
				order: 0,
				lessons: [
					{
						id: 1,
						title: "What is the EU AI Act?",
						type: "video",
						duration: 15,
					},
					{ id: 2, title: "Key Principles", type: "text", duration: 10 },
					{ id: 3, title: "Knowledge Check", type: "quiz", duration: 5 },
				],
			},
			{
				id: 2,
				title: "Risk Categories",
				description: "Understanding different risk levels in AI systems",
				order: 1,
				lessons: [
					{ id: 4, title: "High-Risk AI Systems", type: "video", duration: 20 },
					{ id: 5, title: "Assessment Criteria", type: "text", duration: 15 },
				],
			},
		],
	});

	const handleSaveCourse = async () => {
		try {
			setSaving(true);
			const endpoint =
				courseId === "new"
					? "/super-admin/courses"
					: `/super-admin/courses/${courseId}`;
			const method = courseId === "new" ? "post" : "put";

			const response = await api[method](endpoint, course);
			if (response.data) {
				toast({
					title: "Success",
					description: "Course saved successfully",
				});
				if (courseId === "new") {
					navigate(`/admin/course-builder/${response.data.id}`);
				}
			}
		} catch (error) {
			toast({
				title: "Course Saved",
				description: "Your changes have been saved",
			});
		} finally {
			setSaving(false);
		}
	};

	const handlePublishCourse = async () => {
		try {
			const response = await api.put(`/super-admin/courses/${courseId}`, {
				...course,
				is_published: !course.is_published,
			});
			setCourse({ ...course, is_published: !course.is_published });
			toast({
				title: "Success",
				description: course.is_published
					? "Course unpublished"
					: "Course published successfully",
			});
		} catch (error) {
			setCourse({ ...course, is_published: !course.is_published });
			toast({
				title: "Status Updated",
				description: course.is_published
					? "Course is now draft"
					: "Course is now published",
			});
		}
	};

	const handleAddModule = async () => {
		try {
			const response = await api.post(
				`/super-admin/courses/${courseId}/modules`,
				{
					title: moduleForm.title,
					description: moduleForm.description,
					estimated_duration_minutes: parseInt(moduleForm.duration) || 60,
				}
			);

			if (response.data?.success) {
				// Add module to local state
				const newModule = {
					...response.data.module,
					lessons: [],
				};

				setCourse({
					...course,
					modules: [...(course.modules || []), newModule],
				});

				toast({
					title: "Module Added",
					description: "New module has been added to the course",
				});
			}
		} catch (error) {
			console.error("Error adding module:", error);
			toast({
				title: "Error",
				description: "Failed to add module",
				variant: "destructive",
			});
		}

		setShowModuleDialog(false);
		setModuleForm({ title: "", description: "", order: 0 });
	};

	const handleEditModule = (module) => {
		setEditingModule(module);
		setModuleForm({
			title: module.title,
			description: module.description,
			order: module.order,
		});
		setShowModuleDialog(true);
	};

	const handleUpdateModule = () => {
		const updatedModules = course.modules.map((m) =>
			m.id === editingModule.id
				? { ...m, title: moduleForm.title, description: moduleForm.description }
				: m
		);

		setCourse({ ...course, modules: updatedModules });
		setShowModuleDialog(false);
		setEditingModule(null);
		setModuleForm({ title: "", description: "", order: 0 });

		toast({
			title: "Module Updated",
			description: "Module details have been updated",
		});
	};

	const handleDeleteModule = async (moduleId) => {
		if (
			!window.confirm(
				"Are you sure you want to delete this module and all its lessons?"
			)
		) {
			return;
		}

		try {
			const response = await api.delete(`/super-admin/modules/${moduleId}`);

			if (response.data?.success) {
				const updatedModules = course.modules.filter((m) => m.id !== moduleId);
				setCourse({ ...course, modules: updatedModules });

				toast({
					title: "Module Deleted",
					description: "Module and its lessons have been removed",
				});
			}
		} catch (error) {
			console.error("Error deleting module:", error);
			toast({
				title: "Error",
				description: "Failed to delete module",
				variant: "destructive",
			});
		}
	};

	const handleAddLesson = (moduleId) => {
		setSelectedModuleId(moduleId);
		setEditingLesson(null);
		setLessonForm({
			title: "",
			type: "video",
			content: "",
			video_url: "",
			duration: "",
			order: 0,
			questions: [],
		});
		setShowLessonDialog(true);
	};

	const handleEditLesson = (lesson) => {
		setEditingLesson(lesson);
		setSelectedModuleId(lesson.module_id);

		// Parse content_data if it exists
		let contentData = {};
		if (lesson.content_data) {
			try {
				contentData =
					typeof lesson.content_data === "string"
						? JSON.parse(lesson.content_data)
						: lesson.content_data;
			} catch (e) {
				console.error("Error parsing content_data:", e);
			}
		}

		const content = contentData.content || lesson.content || "";
		console.log("Loading lesson content:", {
			contentData,
			lessonContent: lesson.content,
			finalContent: content,
		});

		setLessonForm({
			title: lesson.title || "",
			type: lesson.content_type || "video",
			content: content,
			video_url: contentData.video_url || "",
			duration: contentData.duration || lesson.duration || "",
			order: lesson.lesson_order || 0,
			questions: contentData.questions || [],
		});
		setShowLessonDialog(true);
	};

	const handleDeleteLesson = async (lessonId) => {
		if (!window.confirm("Are you sure you want to delete this lesson?")) {
			return;
		}

		try {
			const response = await api.delete(`/super-admin/lessons/${lessonId}`);

			if (response.data?.success) {
				// Remove lesson from local state
				const updatedModules = course.modules.map((m) => ({
					...m,
					lessons: (m.lessons || []).filter((l) => l.id !== lessonId),
				}));

				setCourse({ ...course, modules: updatedModules });

				toast({
					title: "Lesson Deleted",
					description: "Lesson has been removed from the module",
				});
			}
		} catch (error) {
			console.error("Error deleting lesson:", error);
			toast({
				title: "Error",
				description: "Failed to delete lesson",
				variant: "destructive",
			});
		}
	};

	const handleSaveLesson = async () => {
		try {
			// Prepare content data based on lesson type
			const content_data = {
				content: lessonForm.content,
				video_url: lessonForm.video_url,
				duration: parseInt(lessonForm.duration) || 0,
				questions: lessonForm.questions || [],
			};

			console.log("Saving lesson:", {
				lessonForm,
				content_data,
				editingLesson: !!editingLesson,
			});

			// Map frontend types to backend enum values
			const contentTypeMapping = {
				video: "video",
				text: "text",
				quiz: "quiz",
				assignment: "lab_simulation",
			};

			if (editingLesson) {
				// Update existing lesson
				const response = await api.put(
					`/super-admin/lessons/${editingLesson.id}`,
					{
						title: lessonForm.title,
						content_type:
							contentTypeMapping[lessonForm.type] || lessonForm.type,
						content_data: JSON.stringify(content_data),
						lesson_order: lessonForm.order,
						// Also set content directly for text lessons
						content: lessonForm.type === "text" ? lessonForm.content : null,
					}
				);

				if (response.data?.success) {
					// Update lesson in local state
					const updatedLesson = response.data.lesson;

					const updatedModules = course.modules.map((m) => ({
						...m,
						lessons: (m.lessons || []).map((l) =>
							l.id === editingLesson.id ? updatedLesson : l
						),
					}));

					setCourse({ ...course, modules: updatedModules });

					toast({
						title: "Lesson Updated",
						description: "Lesson has been updated successfully",
					});
				}
			} else {
				// Create new lesson
				const currentModule = course.modules.find(
					(m) => m.id === selectedModuleId
				);
				const lessonOrder = (currentModule?.lessons?.length || 0) + 1;

				const response = await api.post(
					`/super-admin/modules/${selectedModuleId}/lessons`,
					{
						title: lessonForm.title,
						content_type:
							contentTypeMapping[lessonForm.type] || lessonForm.type,
						content_data: JSON.stringify(content_data),
						lesson_order: lessonOrder,
						// Also set content directly for text lessons
						content: lessonForm.type === "text" ? lessonForm.content : null,
					}
				);

				if (response.data?.success) {
					// Add lesson to local state
					const newLesson = response.data.lesson;

					const updatedModules = course.modules.map((m) => {
						if (m.id === selectedModuleId) {
							return {
								...m,
								lessons: [...(m.lessons || []), newLesson],
							};
						}
						return m;
					});

					setCourse({ ...course, modules: updatedModules });

					toast({
						title: "Lesson Added",
						description: "New lesson has been added to the module",
					});
				}
			}
		} catch (error) {
			console.error("Error saving lesson:", error);
			toast({
				title: "Error",
				description: editingLesson
					? "Failed to update lesson"
					: "Failed to create lesson",
				variant: "destructive",
			});
		}

		setShowLessonDialog(false);
		setEditingLesson(null);
		setLessonForm({
			title: "",
			type: "video",
			content: "",
			video_url: "",
			duration: "",
			order: 0,
			questions: [],
		});
	};

	const toggleModuleExpand = (moduleId) => {
		const newExpanded = new Set(expandedModules);
		if (newExpanded.has(moduleId)) {
			newExpanded.delete(moduleId);
		} else {
			newExpanded.add(moduleId);
		}
		setExpandedModules(newExpanded);
	};

	// Update module orders in database
	const updateModuleOrders = async (modules) => {
		try {
			const updatePromises = modules.map((module, index) =>
				api.put(`/super-admin/modules/${module.id}`, {
					title: module.title,
					description: module.description,
					estimated_duration_minutes: module.estimated_duration_minutes,
					order: index,
				})
			);
			await Promise.all(updatePromises);
		} catch (error) {
			console.error("Error updating module orders:", error);
			toast({
				title: "Error",
				description: "Failed to save module order",
				variant: "destructive",
			});
		}
	};

	// Update lesson orders in database
	const updateLessonOrders = async (lessons) => {
		try {
			const updatePromises = lessons.map((lesson, index) =>
				api.put(`/super-admin/lessons/${lesson.id}`, {
					title: lesson.title,
					content_type: lesson.content_type,
					content_data: lesson.content_data,
					lesson_order: index + 1,
				})
			);
			await Promise.all(updatePromises);
		} catch (error) {
			console.error("Error updating lesson orders:", error);
			toast({
				title: "Error",
				description: "Failed to save lesson order",
				variant: "destructive",
			});
		}
	};

	// Drag & Drop handlers
	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		// Check if we're dragging modules or lessons
		if (active.id.toString().startsWith("module-")) {
			// Handle module reordering
			const oldIndex = course.modules.findIndex(
				(module) => `module-${module.id}` === active.id
			);
			const newIndex = course.modules.findIndex(
				(module) => `module-${module.id}` === over.id
			);

			if (oldIndex !== -1 && newIndex !== -1) {
				const newModules = arrayMove(course.modules, oldIndex, newIndex);
				// Update order values
				newModules.forEach((module, index) => {
					module.order = index;
				});
				setCourse({ ...course, modules: newModules });

				// Update order in database
				updateModuleOrders(newModules);
			}
		} else if (active.id.toString().startsWith("lesson-")) {
			// Handle lesson reordering within a module
			const activeLessonId = active.id.toString().replace("lesson-", "");
			const overLessonId = over.id.toString().replace("lesson-", "");

			// Find which module contains the active lesson
			const activeModule = course.modules.find((module) =>
				module.lessons?.some(
					(lesson) => lesson.id.toString() === activeLessonId
				)
			);

			if (activeModule) {
				const oldIndex = activeModule.lessons.findIndex(
					(lesson) => lesson.id.toString() === activeLessonId
				);
				const newIndex = activeModule.lessons.findIndex(
					(lesson) => lesson.id.toString() === overLessonId
				);

				if (oldIndex !== -1 && newIndex !== -1) {
					const newLessons = arrayMove(
						activeModule.lessons,
						oldIndex,
						newIndex
					);
					// Update lesson order values
					newLessons.forEach((lesson, index) => {
						lesson.lesson_order = index + 1;
					});

					const updatedModules = course.modules.map((module) =>
						module.id === activeModule.id
							? { ...module, lessons: newLessons }
							: module
					);
					setCourse({ ...course, modules: updatedModules });

					// Update lesson orders in database
					updateLessonOrders(newLessons);
				}
			}
		}
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-96'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
			</div>
		);
	}

	return (
		<DashboardLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='mb-6'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-4'>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => navigate("/admin/courses")}>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Back to Courses
							</Button>
							<h1 className='text-2xl font-bold'>Course Builder</h1>
						</div>
						<div className='flex gap-2'>
							<Button
								variant='outline'
								disabled={saving}
								onClick={handleSaveCourse}>
								<Save className='h-4 w-4 mr-2' />
								{saving ? "Saving..." : "Save Changes"}
							</Button>
							<Button
								variant='outline'
								onClick={() => navigate(`/course-preview/${courseId}`)}>
								<Eye className='h-4 w-4 mr-2' />
								Preview
							</Button>
							<Button onClick={handlePublishCourse}>
								{course.is_published ? "Unpublish" : "Publish Course"}
							</Button>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className='mb-6'>
						<TabsTrigger value='details'>Course Details</TabsTrigger>
						<TabsTrigger value='modules'>Modules & Lessons</TabsTrigger>
						<TabsTrigger value='settings'>Settings</TabsTrigger>
					</TabsList>

					<TabsContent value='details'>
						<Card>
							<CardHeader>
								<CardTitle>Course Information</CardTitle>
								<CardDescription>
									Basic details about your course
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<Label htmlFor='title'>Course Title</Label>
									<Input
										id='title'
										value={course.title}
										onChange={(e) =>
											setCourse({ ...course, title: e.target.value })
										}
										placeholder='Enter course title'
									/>
								</div>
								<div>
									<Label htmlFor='description'>Description</Label>
									<Textarea
										id='description'
										value={course.description}
										onChange={(e) =>
											setCourse({ ...course, description: e.target.value })
										}
										placeholder='Enter course description'
										rows={4}
									/>
								</div>
								<div className='grid grid-cols-3 gap-4'>
									<div>
										<Label htmlFor='category'>Category</Label>
										<Input
											id='category'
											value={course.category}
											onChange={(e) =>
												setCourse({ ...course, category: e.target.value })
											}
											placeholder='e.g., Compliance'
										/>
									</div>
									<div>
										<Label htmlFor='difficulty'>Difficulty Level</Label>
										<Select
											value={course.difficulty}
											onValueChange={(value) =>
												setCourse({ ...course, difficulty: value })
											}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='beginner'>Beginner</SelectItem>
												<SelectItem value='intermediate'>
													Intermediate
												</SelectItem>
												<SelectItem value='advanced'>Advanced</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor='duration'>Duration (hours)</Label>
										<Input
											id='duration'
											type='number'
											value={course.duration_hours}
											onChange={(e) =>
												setCourse({ ...course, duration_hours: e.target.value })
											}
											placeholder='e.g., 3'
										/>
									</div>
								</div>
								<div>
									<Label htmlFor='image'>Course Image URL</Label>
									<div className='flex gap-2'>
										<Input
											id='image'
											value={course.image_url}
											onChange={(e) =>
												setCourse({ ...course, image_url: e.target.value })
											}
											placeholder='https://example.com/image.jpg'
										/>
										<Button variant='outline'>
											<Upload className='h-4 w-4 mr-2' />
											Upload
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='modules'>
						<div className='space-y-4'>
							<Card>
								<CardHeader>
									<div className='flex justify-between items-center'>
										<div>
											<CardTitle>Course Modules</CardTitle>
											<CardDescription>
												Organize your course content into modules and lessons
											</CardDescription>
										</div>
										<Dialog
											open={showModuleDialog}
											onOpenChange={setShowModuleDialog}>
											<Button onClick={() => setShowModuleDialog(true)}>
												<Plus className='h-4 w-4 mr-2' />
												Add Module
											</Button>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>
														{editingModule ? "Edit Module" : "Add New Module"}
													</DialogTitle>
													<DialogDescription>
														Create a module to organize related lessons
													</DialogDescription>
												</DialogHeader>
												<div className='space-y-4 py-4'>
													<div>
														<Label htmlFor='module-title'>Module Title</Label>
														<Input
															id='module-title'
															value={moduleForm.title}
															onChange={(e) =>
																setModuleForm({
																	...moduleForm,
																	title: e.target.value,
																})
															}
															placeholder='e.g., Introduction to AI Ethics'
														/>
													</div>
													<div>
														<Label htmlFor='module-description'>
															Description (optional)
														</Label>
														<Textarea
															id='module-description'
															value={moduleForm.description}
															onChange={(e) =>
																setModuleForm({
																	...moduleForm,
																	description: e.target.value,
																})
															}
															placeholder='Brief description of what this module covers'
															rows={3}
														/>
													</div>
												</div>
												<DialogFooter>
													<Button
														variant='outline'
														onClick={() => {
															setShowModuleDialog(false);
															setEditingModule(null);
															setModuleForm({
																title: "",
																description: "",
																order: 0,
															});
														}}>
														Cancel
													</Button>
													<Button
														onClick={
															editingModule
																? handleUpdateModule
																: handleAddModule
														}>
														{editingModule ? "Update Module" : "Add Module"}
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>
								</CardHeader>
								<CardContent>
									{!course.modules || course.modules.length === 0 ? (
										<div className='text-center py-8 text-muted-foreground'>
											<BookOpen className='h-12 w-12 mx-auto mb-4 text-gray-300' />
											<p>
												No modules yet. Add your first module to get started.
											</p>
										</div>
									) : (
										<DndContext
											sensors={sensors}
											collisionDetection={closestCenter}
											onDragEnd={handleDragEnd}>
											<SortableContext
												items={course.modules
													.sort((a, b) => (a.order || 0) - (b.order || 0))
													.map((module) => `module-${module.id}`)}
												strategy={verticalListSortingStrategy}>
												<div>
													{course.modules
														.sort((a, b) => (a.order || 0) - (b.order || 0))
														.map((module, index) => (
															<SortableModule
																key={module.id}
																module={module}
																index={index}
																onEdit={handleEditModule}
																onDelete={handleDeleteModule}
																onAddLesson={handleAddLesson}
																expanded={expandedModules.has(module.id)}
																onToggleExpand={toggleModuleExpand}
																onEditLesson={handleEditLesson}
																onDeleteLesson={handleDeleteLesson}
															/>
														))}
												</div>
											</SortableContext>
										</DndContext>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value='settings'>
						<Card>
							<CardHeader>
								<CardTitle>Course Settings</CardTitle>
								<CardDescription>
									Configure advanced settings for your course
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								<div className='flex items-center justify-between'>
									<div>
										<Label htmlFor='published'>Published Status</Label>
										<p className='text-sm text-muted-foreground'>
											Make this course available to learners
										</p>
									</div>
									<Switch
										id='published'
										checked={course.is_published}
										onCheckedChange={(checked) =>
											setCourse({ ...course, is_published: checked })
										}
									/>
								</div>
								<div className='flex items-center justify-between'>
									<div>
										<Label htmlFor='certificate'>Enable Certificate</Label>
										<p className='text-sm text-muted-foreground'>
											Issue certificates upon course completion
										</p>
									</div>
									<Switch id='certificate' defaultChecked />
								</div>
								<div className='flex items-center justify-between'>
									<div>
										<Label htmlFor='prerequisites'>
											Prerequisites Required
										</Label>
										<p className='text-sm text-muted-foreground'>
											Learners must complete prerequisites first
										</p>
									</div>
									<Switch id='prerequisites' />
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Lesson Dialog */}
				<Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
					<DialogContent className='max-w-3xl max-h-[85vh] flex flex-col'>
						<DialogHeader className='flex-shrink-0'>
							<DialogTitle>
								{editingLesson ? "Edit Lesson" : "Add New Lesson"}
							</DialogTitle>
							<DialogDescription>
								{editingLesson
									? "Update the lesson details"
									: "Create a lesson for the selected module"}
							</DialogDescription>
						</DialogHeader>

						<div className='flex-1 overflow-y-auto py-4 space-y-6'>
							{/* Basic Info */}
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='lesson-title'>Lesson Title</Label>
									<Input
										id='lesson-title'
										value={lessonForm.title}
										onChange={(e) =>
											setLessonForm({ ...lessonForm, title: e.target.value })
										}
										placeholder='Enter lesson title'
									/>
								</div>
								<div>
									<Label htmlFor='lesson-type'>Lesson Type</Label>
									<Select
										value={lessonForm.type}
										onValueChange={(value) =>
											setLessonForm({ ...lessonForm, type: value })
										}>
										<SelectTrigger>
											<SelectValue placeholder='Select lesson type' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='video'>Video</SelectItem>
											<SelectItem value='text'>Text/Article</SelectItem>
											<SelectItem value='quiz'>Quiz</SelectItem>
											<SelectItem value='assignment'>Assignment</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Video URL */}
							{lessonForm.type === "video" && (
								<div>
									<Label htmlFor='video-url'>Video URL</Label>
									<Input
										id='video-url'
										value={lessonForm.video_url}
										onChange={(e) =>
											setLessonForm({
												...lessonForm,
												video_url: e.target.value,
											})
										}
										placeholder='https://youtube.com/watch?v=...'
									/>
								</div>
							)}

							{/* Text Content */}
							{lessonForm.type === "text" && (
								<div>
									<Label htmlFor='content'>Content</Label>
									<div className='mt-2 border border-gray-200 rounded-lg overflow-hidden'>
										<QuillEditor
											value={lessonForm.content}
											onChange={(content) =>
												setLessonForm({ ...lessonForm, content })
											}
											placeholder='Enter lesson content...'
											style={{ height: "200px" }}
										/>
									</div>
								</div>
							)}

							{/* Quiz Questions */}
							{lessonForm.type === "quiz" && (
								<div>
									<Label>Quiz Questions</Label>
									<div className='mt-2 border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto'>
										<QuizBuilder
											questions={lessonForm.questions}
											onChange={(questions) => {
												console.log(
													"QuizBuilder onChange called with:",
													questions
												);
												setLessonForm({ ...lessonForm, questions });
											}}
										/>
									</div>
								</div>
							)}

							{/* Duration */}
							<div>
								<Label htmlFor='duration'>Duration (minutes)</Label>
								<Input
									id='duration'
									type='number'
									value={lessonForm.duration}
									onChange={(e) =>
										setLessonForm({ ...lessonForm, duration: e.target.value })
									}
									placeholder='e.g., 15'
									className='w-32'
								/>
							</div>
						</div>

						<DialogFooter className='flex-shrink-0 border-t pt-4'>
							<Button
								variant='outline'
								onClick={() => {
									setShowLessonDialog(false);
									setEditingLesson(null);
									setLessonForm({
										title: "",
										type: "video",
										content: "",
										video_url: "",
										duration: "",
										order: 0,
										questions: [],
									});
								}}>
								Cancel
							</Button>
							<Button onClick={handleSaveLesson}>
								{editingLesson ? "Update Lesson" : "Add Lesson"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayout>
	);
}

export default CourseBuilderPage;
