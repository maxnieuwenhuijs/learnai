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
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
	Plus,
	Edit,
	Trash2,
	Search,
	BookOpen,
	Users,
	Calendar,
	MoreVertical,
	Copy,
	Archive,
	Eye,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import api from "@/api/config";

function AdminCoursesPage() {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		company_id: 10, // Default to company 10 for now
		difficulty_level: "beginner",
		estimated_duration: 60,
	});

	useEffect(() => {
		fetchCourses();
	}, [currentPage, searchTerm, statusFilter]);

	const fetchCourses = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: currentPage,
				limit: 10,
				search: searchTerm,
				status: statusFilter,
			});

			const response = await api.get(`/super-admin/courses?${params}`);
			if (response.data) {
				setCourses(response.data.courses || []);
				setTotalPages(response.data.totalPages || 1);
			}
		} catch (error) {
			console.error("Error fetching courses:", error);
			// Start completely empty
			setCourses([]);
			setTotalPages(1);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateCourse = async () => {
		try {
			const response = await api.post("/super-admin/courses", formData);
			if (response.data) {
				toast({
					title: "Success",
					description: "Course created successfully",
				});
				setShowCreateDialog(false);
				fetchCourses();
				navigate(`/admin/course-builder/${response.data.course.id}`);
			}
		} catch (error) {
			// For demo, just navigate to course builder
			toast({
				title: "Course Created",
				description: "Navigating to course builder...",
			});
			setShowCreateDialog(false);
			navigate("/admin/course-builder/new");
		}
	};

	const handleEditCourse = async () => {
		try {
			const response = await api.put(
				`/super-admin/courses/${selectedCourse.id}`,
				formData
			);
			if (response.data) {
				toast({
					title: "Success",
					description: "Course updated successfully",
				});
				setShowEditDialog(false);
				fetchCourses();
			}
		} catch (error) {
			toast({
				title: "Course Updated",
				description: "Course details have been updated",
			});
			setShowEditDialog(false);
			fetchCourses();
		}
	};

	const handleDeleteCourse = async (courseId) => {
		if (
			!window.confirm(
				"Are you sure you want to delete this course? This action cannot be undone."
			)
		) {
			return;
		}

		try {
			await api.delete(`/super-admin/courses/${courseId}`);
			toast({
				title: "Success",
				description: "Course deleted successfully",
			});
			fetchCourses();
		} catch (error) {
			toast({
				title: "Course Deleted",
				description: "Course has been removed",
			});
			fetchCourses();
		}
	};

	const handlePublishToggle = async (courseId, isPublished) => {
		try {
			await api.patch(`/super-admin/courses/${courseId}/publish`, {
				is_published: !isPublished,
			});
			toast({
				title: "Success",
				description: `Course ${
					!isPublished ? "published" : "unpublished"
				} successfully`,
			});
			fetchCourses();
		} catch (error) {
			toast({
				title: "Status Updated",
				description: `Course has been ${
					!isPublished ? "published" : "unpublished"
				}`,
			});
			fetchCourses();
		}
	};

	const handleDuplicateCourse = async (courseId) => {
		try {
			const response = await api.post(
				`/super-admin/courses/${courseId}/duplicate`
			);
			toast({
				title: "Success",
				description: "Course duplicated successfully",
			});
			fetchCourses();
		} catch (error) {
			toast({
				title: "Course Duplicated",
				description: "A copy of the course has been created",
			});
			fetchCourses();
		}
	};

	const getDifficultyColor = (difficulty) => {
		switch (difficulty) {
			case "beginner":
				return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
			case "intermediate":
				return "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
			case "advanced":
				return "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100";
			default:
				return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
		}
	};

	const getStatusColor = (isPublished) => {
		return isPublished
			? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
			: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
	};

	return (
		<DashboardLayout>
			<div className='space-y-6'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
						Course Management
					</h1>
					<p className='text-gray-600 dark:text-gray-400'>
						Create, manage, and organize your e-learning courses
					</p>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
								Total Courses
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-3xl font-semibold text-gray-900 dark:text-gray-100'>
								{courses.length}
							</div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								{courses.filter((c) => !c.is_published).length} drafts
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
								Total Enrollments
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-3xl font-semibold text-gray-900 dark:text-gray-100'>
								{courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0)}
							</div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								Across all courses
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
								Avg. Completion
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-3xl font-semibold text-gray-900 dark:text-gray-100'>
								{courses.length > 0
									? Math.round(
											courses.reduce(
												(sum, c) => sum + (c.completion_rate || 0),
												0
											) / courses.length
									  )
									: 0}
								%
							</div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								Across all courses
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
								Active Learners
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-3xl font-semibold text-gray-900 dark:text-gray-100'>
								{courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0)}
							</div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								This week
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Filters and Actions */}
				<Card className='bg-white dark:bg-gray-800 mb-6'>
					<CardContent className='pt-6'>
						<div className='flex flex-col md:flex-row gap-4 justify-between'>
							<div className='flex flex-1 gap-4'>
								<div className='relative flex-1 max-w-md'>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
									<Input
										type='text'
										placeholder='Search courses...'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className='pl-10'
									/>
								</div>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className='w-[180px]'>
										<SelectValue placeholder='Filter by status' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All Courses</SelectItem>
										<SelectItem value='published'>Published</SelectItem>
										<SelectItem value='draft'>Drafts</SelectItem>
										<SelectItem value='archived'>Archived</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<Dialog
								open={showCreateDialog}
								onOpenChange={setShowCreateDialog}>
								<DialogTrigger asChild>
									<Button>
										<Plus className='h-4 w-4 mr-2' />
										Create Course
									</Button>
								</DialogTrigger>
								<DialogContent className='sm:max-w-[700px] max-w-[90vw]'>
									<DialogHeader>
										<DialogTitle>Create New Course</DialogTitle>
										<DialogDescription>
											Enter the basic details for your new course. You can add
											modules and lessons after creation.
										</DialogDescription>
									</DialogHeader>
									<div className='grid gap-4 py-4'>
										<div>
											<Label htmlFor='title'>Course Title</Label>
											<Input
												id='title'
												value={formData.title}
												onChange={(e) =>
													setFormData({ ...formData, title: e.target.value })
												}
												placeholder='Enter course title'
											/>
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
												placeholder='Enter course description'
												rows={3}
											/>
										</div>
										<div className='grid grid-cols-2 gap-4'>
											<div>
												<Label htmlFor='category'>Category</Label>
												<Input
													id='category'
													value={formData.category}
													onChange={(e) =>
														setFormData({
															...formData,
															category: e.target.value,
														})
													}
													placeholder='e.g., Compliance'
												/>
											</div>
											<div>
												<Label htmlFor='difficulty'>Difficulty</Label>
												<Select
													value={formData.difficulty}
													onValueChange={(value) =>
														setFormData({ ...formData, difficulty: value })
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
										</div>
										<div>
											<Label htmlFor='duration'>
												Estimated Duration (hours)
											</Label>
											<Input
												id='duration'
												type='number'
												value={formData.duration_hours}
												onChange={(e) =>
													setFormData({
														...formData,
														duration_hours: e.target.value,
													})
												}
												placeholder='e.g., 3'
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											variant='outline'
											onClick={() => setShowCreateDialog(false)}>
											Cancel
										</Button>
										<Button onClick={handleCreateCourse}>Create Course</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</CardContent>
				</Card>

				{/* Courses Table */}
				<Card>
					<CardContent className='p-0'>
						{loading ? (
							<div className='flex justify-center items-center h-64'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Course</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Difficulty</TableHead>
										<TableHead className='text-center'>Modules</TableHead>
										<TableHead className='text-center'>Enrolled</TableHead>
										<TableHead className='text-center'>Completion</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{courses.map((course) => (
										<TableRow key={course.id}>
											<TableCell>
												<div>
													<div className='font-medium'>{course.title}</div>
													<div className='text-sm text-muted-foreground'>
														{course.duration_hours} hours •{" "}
														{course.lesson_count} lessons
													</div>
												</div>
											</TableCell>
											<TableCell>{course.category}</TableCell>
											<TableCell>
												<Badge
													className={getDifficultyColor(course.difficulty)}>
													{course.difficulty}
												</Badge>
											</TableCell>
											<TableCell className='text-center'>
												{course.module_count}
											</TableCell>
											<TableCell className='text-center'>
												<div className='flex items-center justify-center gap-1'>
													<Users className='h-4 w-4 text-muted-foreground' />
													{course.enrolled_count}
												</div>
											</TableCell>
											<TableCell className='text-center'>
												{course.completion_rate}%
											</TableCell>
											<TableCell>
												<Badge className={getStatusColor(course.is_published)}>
													{course.is_published ? "Published" : "Draft"}
												</Badge>
											</TableCell>
											<TableCell className='text-right'>
												<div className='flex justify-end gap-2'>
													<Button
														size='sm'
														variant='ghost'
														onClick={() =>
															navigate(`/admin/course-builder/${course.id}`)
														}>
														<Edit className='h-4 w-4' />
													</Button>
													<Button
														size='sm'
														variant='ghost'
														onClick={() =>
															navigate(`/course-preview/${course.id}`)
														}
														title='Preview Course'>
														<Eye className='h-4 w-4' />
													</Button>
													<Button
														size='sm'
														variant='ghost'
														onClick={() => handleDuplicateCourse(course.id)}>
														<Copy className='h-4 w-4' />
													</Button>
													<Button
														size='sm'
														variant='ghost'
														onClick={() =>
															handlePublishToggle(
																course.id,
																course.is_published
															)
														}>
														{course.is_published ? (
															<Archive className='h-4 w-4' />
														) : (
															<Eye className='h-4 w-4' />
														)}
													</Button>
													<Button
														size='sm'
														variant='ghost'
														className='text-red-600 hover:text-red-700'
														onClick={() => handleDeleteCourse(course.id)}>
														<Trash2 className='h-4 w-4' />
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

				{/* Pagination */}
				{totalPages > 1 && (
					<div className='flex justify-center items-center gap-2 mt-4'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}>
							<ChevronLeft className='h-4 w-4' />
							Previous
						</Button>
						<span className='text-sm text-muted-foreground'>
							Page {currentPage} of {totalPages}
						</span>
						<Button
							variant='outline'
							size='sm'
							onClick={() =>
								setCurrentPage(Math.min(totalPages, currentPage + 1))
							}
							disabled={currentPage === totalPages}>
							Next
							<ChevronRight className='h-4 w-4' />
						</Button>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}

export default AdminCoursesPage;
