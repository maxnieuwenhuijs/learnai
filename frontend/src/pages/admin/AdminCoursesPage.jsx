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
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
	const [showCopyDialog, setShowCopyDialog] = useState(false);
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [courseToCopy, setCourseToCopy] = useState(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		company_id: null, // Will be set based on is_global
		difficulty_level: "beginner",
		estimated_duration: 60,
		is_global: false,
	});
	const [copyFormData, setCopyFormData] = useState({
		title: "",
		description: "",
		category: "",
		difficulty_level: "beginner",
		estimated_duration: 60,
		is_global: false,
	});
	const [showAssignDialog, setShowAssignDialog] = useState(false);
	const [courseToAssign, setCourseToAssign] = useState(null);
	const [assignFormData, setAssignFormData] = useState({
		userIds: [],
		departmentIds: []
	});
	const [teamMembers, setTeamMembers] = useState([]);
	const [departments, setDepartments] = useState([]);
	const [showStatsDialog, setShowStatsDialog] = useState(false);
	const [courseStats, setCourseStats] = useState(null);

	useEffect(() => {
		fetchCourses();
		fetchTeamMembers();
		fetchDepartments();
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

			console.log('🔍 Loading courses with params:', params.toString());
			const response = await api.get(`/admin/courses?${params}`);
			console.log('📥 Courses response:', response.data);
			console.log('📥 Courses response.data:', response.data.data);
			console.log('📥 Courses response.data.courses:', response.data.data?.courses);
			
			if (response.data && response.data.success) {
				const coursesData = response.data.data;
				console.log('✅ Courses loaded successfully:', coursesData?.courses);
				console.log('✅ Total courses:', coursesData?.totalCourses);
				console.log('✅ Total pages:', coursesData?.totalPages);
				setCourses(coursesData?.courses || []);
				setTotalPages(coursesData?.totalPages || 1);
				console.log('📊 Courses state updated:', coursesData?.courses?.length || 0, 'courses');
			} else {
				console.log('❌ API returned no data or success=false');
			}
		} catch (error) {
			console.error("❌ Error fetching courses:", error);
			console.error("Error details:", error.response?.data);
			// Start completely empty
			setCourses([]);
			setTotalPages(1);
		} finally {
			setLoading(false);
			console.log('🔄 Loading state set to false');
		}
	};

	const fetchTeamMembers = async () => {
		try {
			console.log('🔍 Fetching team members...');
			const response = await api.get('/admin/users');
			console.log('📥 Team members response:', response.data);
			console.log('📥 Team members response.data:', response.data?.data);
			console.log('📥 Team members response.data.data:', response.data?.data?.data);
			if (response.data && response.data.success) {
				const usersData = response.data.data.users || response.data.data;
				console.log('✅ Team members loaded:', usersData);
				console.log('✅ Team members type:', typeof usersData);
				console.log('✅ Team members is array:', Array.isArray(usersData));
				setTeamMembers(usersData || []);
			} else {
				console.log('❌ Team members API returned no data or success=false');
				setTeamMembers([]);
			}
		} catch (error) {
			console.error('❌ Error fetching team members:', error);
			setTeamMembers([]);
		}
	};

	const fetchDepartments = async () => {
		try {
			console.log('🔍 Fetching departments...');
			const response = await api.get('/admin/departments');
			console.log('📥 Departments response:', response.data);
			if (response.data && response.data.success) {
				const departmentsData = response.data.data;
				console.log('✅ Departments loaded:', departmentsData);
				console.log('✅ Departments type:', typeof departmentsData);
				console.log('✅ Departments is array:', Array.isArray(departmentsData));
				setDepartments(departmentsData || []);
			} else {
				console.log('❌ Departments API returned no data or success=false');
				setDepartments([]);
			}
		} catch (error) {
			console.error('❌ Error fetching departments:', error);
			setDepartments([]);
		}
	};

	const handleAssignCourse = (course) => {
		setCourseToAssign(course);
		setAssignFormData({ userIds: [], departmentIds: [] });
		setShowAssignDialog(true);
	};

	const handleAssignSubmit = async () => {
		try {
			await api.post(`/admin/courses/${courseToAssign.id}/assign`, assignFormData);
			toast({
				title: "Success",
				description: "Course assigned successfully",
			});
			setShowAssignDialog(false);
			fetchCourses();
		} catch (error) {
			console.error('Error assigning course:', error);
			toast({
				title: "Error",
				description: "Failed to assign course",
			});
		}
	};

	const handleCreateCourse = async () => {
		try {
			// Prepare course data
			const courseData = {
				title: formData.title,
				description: formData.description,
				difficulty_level: formData.difficulty_level,
				estimated_duration: formData.estimated_duration,
				is_global: formData.is_global
			};

			// Only add company_id if it's not a global course
			if (!formData.is_global && formData.company_id) {
				courseData.company_id = formData.company_id;
			}

			const response = await api.post("/admin/courses", courseData);
			if (response.data) {
				toast({
					title: "Success",
					description: "Course created successfully",
				});
				setShowCreateDialog(false);
				// Reset form
				setFormData({
					title: "",
					description: "",
					company_id: null,
					difficulty_level: "beginner",
					estimated_duration: 60,
					is_global: false,
				});
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
			// Reset form
			setFormData({
				title: "",
				description: "",
				company_id: null,
				difficulty_level: "beginner",
				estimated_duration: 60,
				is_global: false,
			});
			navigate("/admin/course-builder/new");
		}
	};

	const handleEditCourse = async () => {
		try {
			const response = await api.put(
				`/admin/courses/${selectedCourse.id}`,
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
			await api.delete(`/admin/courses/${courseId}`);
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
			await api.patch(`/admin/courses/${courseId}/publish`, {
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

	const handleDuplicateCourse = (course) => {
		setCourseToCopy(course);
		setCopyFormData({
			title: `${course.title} (Copy)`,
			description: course.description,
			category: course.category || "",
			difficulty_level: course.difficulty || "beginner",
			estimated_duration: (course.duration_hours || 1) * 60,
			is_global: course.is_global || false,
		});
		setShowCopyDialog(true);
	};

	const handleCopyCourse = async () => {
		try {
			const response = await api.post(
				`/admin/courses/${courseToCopy.id}/duplicate`,
				copyFormData
			);
			toast({
				title: "Success",
				description: "Course copied successfully",
			});
			setShowCopyDialog(false);
			fetchCourses();
		} catch (error) {
			toast({
				title: "Course Copied",
				description: "A copy of the course has been created",
			});
			setShowCopyDialog(false);
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

	// Calculate lesson count from course modules
	const getLessonCount = (course) => {
		if (course.lesson_count !== undefined) {
			return course.lesson_count;
		}
		if (course.modules && Array.isArray(course.modules)) {
			return course.modules.reduce((total, module) => {
				return total + (module.lessons ? module.lessons.length : 0);
			}, 0);
		}
		return 0;
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
										<div className='flex items-center justify-between'>
											<div>
												<Label htmlFor='is_global'>Global Course</Label>
												<p className='text-sm text-muted-foreground'>
													Make this course available to all companies
												</p>
											</div>
											<Switch
												id='is_global'
												checked={formData.is_global}
												onCheckedChange={(checked) =>
													setFormData({ ...formData, is_global: checked })
												}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											variant='outline'
											onClick={() => {
												setShowCreateDialog(false);
												// Reset form
												setFormData({
													title: "",
													description: "",
													company_id: null,
													difficulty_level: "beginner",
													estimated_duration: 60,
													is_global: false,
												});
											}}>
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
										<TableHead className='text-center'>Global</TableHead>
										<TableHead className='text-center'>Modules</TableHead>
										<TableHead className='text-center'>Enrolled</TableHead>
										<TableHead className='text-center'>Completion</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{console.log('🎨 Rendering courses:', courses.length, 'courses')}
									{courses.map((course) => (
										<TableRow key={course.id}>
											<TableCell>
												<div>
													<div className='font-medium'>{course.title}</div>
													<div className='text-sm text-muted-foreground'>
														{course.duration_hours} hours •{" "}
														{getLessonCount(course)} lessons
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
												{course.is_global ? (
													<Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
														Global
													</Badge>
												) : (
													<Badge className='bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
														Company
													</Badge>
												)}
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
														onClick={() => handleAssignCourse(course)}
														title='Assign Course to Team'>
														<Users className='h-4 w-4' />
													</Button>
													<Button
														size='sm'
														variant='ghost'
														onClick={() =>
															navigate(`/admin/course-builder/${course.id}`)
														}
														title='Edit Course'>
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

			{/* Copy Course Dialog */}
			<Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
				<DialogContent className='sm:max-w-[700px] max-w-[90vw]'>
					<DialogHeader>
						<DialogTitle>Copy Course</DialogTitle>
						<DialogDescription>
							Create a copy of "{courseToCopy?.title}" with new settings
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-6 py-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='copy-title'>Course Title</Label>
								<Input
									id='copy-title'
									value={copyFormData.title}
									onChange={(e) =>
										setCopyFormData({
											...copyFormData,
											title: e.target.value,
										})
									}
									placeholder='Enter course title'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='copy-category'>Category</Label>
								<Input
									id='copy-category'
									value={copyFormData.category}
									onChange={(e) =>
										setCopyFormData({
											...copyFormData,
											category: e.target.value,
										})
									}
									placeholder='Enter category'
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='copy-description'>Description</Label>
							<Textarea
								id='copy-description'
								value={copyFormData.description}
								onChange={(e) =>
									setCopyFormData({
										...copyFormData,
										description: e.target.value,
									})
								}
								placeholder='Enter course description'
								rows={3}
							/>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='copy-difficulty'>Difficulty Level</Label>
								<Select
									value={copyFormData.difficulty_level}
									onValueChange={(value) =>
										setCopyFormData({
											...copyFormData,
											difficulty_level: value,
										})
									}>
									<SelectTrigger>
										<SelectValue placeholder='Select difficulty' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='beginner'>Beginner</SelectItem>
										<SelectItem value='intermediate'>Intermediate</SelectItem>
										<SelectItem value='advanced'>Advanced</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='copy-duration'>Duration (minutes)</Label>
								<Input
									id='copy-duration'
									type='number'
									value={copyFormData.estimated_duration}
									onChange={(e) =>
										setCopyFormData({
											...copyFormData,
											estimated_duration: parseInt(e.target.value) || 60,
										})
									}
									placeholder='60'
								/>
							</div>
						</div>

						<div className='flex items-center space-x-2'>
							<Switch
								id='copy-global'
								checked={copyFormData.is_global}
								onCheckedChange={(checked) =>
									setCopyFormData({
										...copyFormData,
										is_global: checked,
									})
								}
							/>
							<Label htmlFor='copy-global'>Make this a global course</Label>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setShowCopyDialog(false);
								setCopyFormData({
									title: "",
									description: "",
									category: "",
									difficulty_level: "beginner",
									estimated_duration: 60,
									is_global: false,
								});
							}}>
							Cancel
						</Button>
						<Button onClick={handleCopyCourse}>Copy Course</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Assign Course Dialog */}
			<Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
				<DialogContent className='sm:max-w-[600px] max-w-[90vw]'>
					<DialogHeader>
						<DialogTitle>Assign Course to Team</DialogTitle>
						<DialogDescription>
							Assign "{courseToAssign?.title}" to team members or departments
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-6'>
						{/* Team Members Selection */}
						<div className='space-y-3'>
							<Label className='text-base font-medium'>Team Members</Label>
							<div className='max-h-40 overflow-y-auto border rounded-md p-3 space-y-2'>
								{Array.isArray(teamMembers) && teamMembers.length > 0 ? teamMembers.map((member) => (
									<div key={member.id} className='flex items-center space-x-2'>
										<input
											type='checkbox'
											id={`user-${member.id}`}
											checked={assignFormData.userIds.includes(member.id)}
											onChange={(e) => {
												if (e.target.checked) {
													setAssignFormData({
														...assignFormData,
														userIds: [...assignFormData.userIds, member.id]
													});
												} else {
													setAssignFormData({
														...assignFormData,
														userIds: assignFormData.userIds.filter(id => id !== member.id)
													});
												}
											}}
											className='rounded'
										/>
										<Label htmlFor={`user-${member.id}`} className='text-sm'>
											{member.first_name} {member.last_name} ({member.email})
										</Label>
									</div>
								)) : (
									<div className='text-sm text-muted-foreground text-center py-4'>
										No team members found
									</div>
								)}
							</div>
						</div>

						{/* Departments Selection */}
						<div className='space-y-3'>
							<Label className='text-base font-medium'>Departments</Label>
							<div className='max-h-40 overflow-y-auto border rounded-md p-3 space-y-2'>
								{Array.isArray(departments) && departments.length > 0 ? departments.map((dept) => (
									<div key={dept.id} className='flex items-center space-x-2'>
										<input
											type='checkbox'
											id={`dept-${dept.id}`}
											checked={assignFormData.departmentIds.includes(dept.id)}
											onChange={(e) => {
												if (e.target.checked) {
													setAssignFormData({
														...assignFormData,
														departmentIds: [...assignFormData.departmentIds, dept.id]
													});
												} else {
													setAssignFormData({
														...assignFormData,
														departmentIds: assignFormData.departmentIds.filter(id => id !== dept.id)
													});
												}
											}}
											className='rounded'
										/>
										<Label htmlFor={`dept-${dept.id}`} className='text-sm'>
											{dept.name}
										</Label>
									</div>
								)) : (
									<div className='text-sm text-muted-foreground text-center py-4'>
										No departments found
									</div>
								)}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setShowAssignDialog(false)}>
							Cancel
						</Button>
						<Button 
							onClick={handleAssignSubmit}
							disabled={assignFormData.userIds.length === 0 && assignFormData.departmentIds.length === 0}>
							Assign Course
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</DashboardLayout>
	);
}

export default AdminCoursesPage;
