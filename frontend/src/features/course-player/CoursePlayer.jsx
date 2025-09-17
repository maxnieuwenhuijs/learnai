import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { coursesApi } from "@/api/courses";
import { progressApi } from "@/api/progress";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	CheckCircle,
	Circle,
	PlayCircle,
	ChevronLeft,
	ChevronRight,
	BookOpen,
	Video,
	FileText,
	FlaskConical,
} from "lucide-react";
import { CourseSidebar } from "./components/CourseSidebar";
import { LessonContent } from "./components/LessonContent";
import { useCourseTracking } from "./hooks/useCourseTracking";
import { CertificateSuccessModal } from "@/components/certificates/CertificateSuccessModal";
import { CourseCompletionCelebration } from "@/components/certificates/CourseCompletionCelebration";
import { downloadCertificatePDF } from "@/api/certificates";

export function CoursePlayer() {
	const { courseId } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [course, setCourse] = useState(null);
	const [currentLesson, setCurrentLesson] = useState(null);
	const [loading, setLoading] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [showCertificateModal, setShowCertificateModal] = useState(false);
	const [newCertificate, setNewCertificate] = useState(null);

	const isPreviewMode = window.location.pathname.includes("/course-preview/");
	const { startLesson, completeLesson, updateTimeSpent } = useCourseTracking(
		currentLesson?.id,
		isPreviewMode
	);

	useEffect(() => {
		loadCourse();
	}, [courseId]);

	useEffect(() => {
		if (currentLesson) {
			startLesson();
		}
	}, [currentLesson]);

	const loadCourse = async () => {
		try {
			let courseData;

			// Use superadmin endpoint for superadmin users or preview mode
			if (
				user?.role === "super_admin" ||
				window.location.pathname.includes("/course-preview/")
			) {
				const response = await api.get(`/super-admin/courses/${courseId}`);
				courseData = response.data?.course;
			} else {
				// coursesApi.getCourseDetails already returns the course data directly
				courseData = await coursesApi.getCourseDetails(courseId);
			}

			// Check if course data exists
			if (!courseData) {
				console.error("Course not found or access denied");
				setCourse(null);
				return;
			}

			setCourse(courseData);

			// Find the first incomplete lesson or start from beginning
			const firstIncompleteLesson = findFirstIncompleteLesson(courseData);
			if (firstIncompleteLesson) {
				setCurrentLesson(firstIncompleteLesson);
			} else if (courseData.modules && courseData.modules[0]?.lessons[0]) {
				setCurrentLesson(courseData.modules[0].lessons[0]);
			}
		} catch (error) {
			console.error("Error loading course:", error);
			setCourse(null);
		} finally {
			setLoading(false);
		}
	};

	const findFirstIncompleteLesson = (course) => {
		if (!course || !course.modules || !Array.isArray(course.modules)) {
			return null;
		}

		for (const module of course.modules) {
			if (module.lessons && Array.isArray(module.lessons)) {
				for (const lesson of module.lessons) {
					if (lesson.progress && lesson.progress.status !== "completed") {
						return {
							...lesson,
							moduleId: module.id,
							moduleTitle: module.title,
						};
					}
				}
			}
		}
		return null;
	};

	const handleLessonSelect = (lesson, moduleId, moduleTitle) => {
		setCurrentLesson({ ...lesson, moduleId, moduleTitle });
	};

	const handleLessonComplete = async (quizScore = null) => {
		await completeLesson(quizScore);

		// Reload course to update progress
		await loadCourse();

		// Check if course is completed
		const courseProgress = calculateCourseProgress();
		if (courseProgress === 100) {
			// Course completed! Check for new certificate
			await checkForNewCertificate();
		}

		// Move to next lesson
		const nextLesson = findNextLesson();
		if (nextLesson) {
			setCurrentLesson(nextLesson);
		}
	};

	const findNextLesson = () => {
		if (!currentLesson || !course) return null;

		let foundCurrent = false;
		for (const module of course.modules) {
			for (const lesson of module.lessons) {
				if (foundCurrent) {
					return { ...lesson, moduleId: module.id, moduleTitle: module.title };
				}
				if (lesson.id === currentLesson.id) {
					foundCurrent = true;
				}
			}
		}
		return null;
	};

	const findPreviousLesson = () => {
		if (!currentLesson || !course) return null;

		let previousLesson = null;
		for (const module of course.modules) {
			for (const lesson of module.lessons) {
				if (lesson.id === currentLesson.id) {
					return previousLesson;
				}
				previousLesson = {
					...lesson,
					moduleId: module.id,
					moduleTitle: module.title,
				};
			}
		}
		return null;
	};

	const calculateCourseProgress = () => {
		if (!course || !course.modules || !Array.isArray(course.modules)) return 0;

		let totalLessons = 0;
		let completedLessons = 0;

		course.modules.forEach((module) => {
			if (module.lessons && Array.isArray(module.lessons)) {
				module.lessons.forEach((lesson) => {
					totalLessons++;
					if (lesson.progress && lesson.progress.status === "completed") {
						completedLessons++;
					}
				});
			}
		});

		return totalLessons > 0
			? Math.round((completedLessons / totalLessons) * 100)
			: 0;
	};

	const checkForNewCertificate = async () => {
		try {
			// Get user's certificates to check for new ones
			const response = await api.get('/certificates');
			const certificates = response.data.certificates || [];
			
			// Find certificate for this course
			const courseCertificate = certificates.find(cert => cert.courseId === parseInt(courseId));
			
			if (courseCertificate) {
				// Check if this certificate was created recently (within last 30 seconds)
				const certificateDate = new Date(courseCertificate.issuedAt);
				const now = new Date();
				const timeDiff = (now - certificateDate) / 1000; // in seconds
				
				if (timeDiff < 30) {
					// This is a new certificate! Show the success modal
					setNewCertificate(courseCertificate);
					setShowCertificateModal(true);
				}
			}
		} catch (error) {
			console.error('Error checking for new certificate:', error);
		}
	};

	const handleViewCertificates = () => {
		setShowCertificateModal(false);
		navigate('/certificates');
	};

	const handleViewCertificate = () => {
		// This will be called from the celebration component
		// We'll check for certificate and show the modal
		checkForNewCertificate();
	};

	const handleContinueLearning = () => {
		// Navigate to dashboard or next course
		navigate('/dashboard');
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-pulse text-muted-foreground'>
					Loading course...
				</div>
			</div>
		);
	}

	if (!course) {
		return (
			<div className='text-center py-8'>
				<p className='text-muted-foreground'>Course not found</p>
				<Button onClick={() => navigate("/dashboard")} className='mt-4'>
					Back to Dashboard
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] relative'>
			{/* Mobile Sidebar Overlay */}
			{sidebarOpen && (
				<div
					className='fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden'
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar - Hidden on mobile, toggle on desktop */}
			<div
				className={`${
					sidebarOpen ? "w-full sm:w-80 lg:w-80" : "w-0"
				} fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto transition-all duration-300 border-r bg-card lg:bg-background overflow-hidden h-full`}>
				<CourseSidebar
					course={course}
					currentLesson={currentLesson}
					onLessonSelect={handleLessonSelect}
					courseProgress={calculateCourseProgress()}
				/>
			</div>

			{/* Main Content */}
			<div className='flex-1 flex flex-col overflow-hidden'>
				{/* Course Header */}
				<div className='border-b bg-background px-4 sm:px-6 py-3 sm:py-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2 sm:gap-4'>
							<Button
								variant='ghost'
								size='icon'
								className='lg:hidden'
								onClick={() => setSidebarOpen(!sidebarOpen)}>
								<BookOpen className='h-5 w-5' />
							</Button>
							<div className='min-w-0 flex-1'>
								<div className='flex items-center gap-2'>
									<h1 className='text-base sm:text-xl font-bold truncate'>
										{course.title}
									</h1>
									{(user?.role === "super_admin" ||
										window.location.pathname.includes("/course-preview/")) && (
										<span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium'>
											Preview
										</span>
									)}
								</div>
								{currentLesson && (
									<p className='text-xs sm:text-sm text-muted-foreground truncate'>
										{currentLesson.moduleTitle} • {currentLesson.title}
									</p>
								)}
							</div>
						</div>

						<div className='flex items-center gap-2 sm:gap-4'>
							<div className='hidden sm:flex items-center gap-2'>
								<Progress
									value={calculateCourseProgress()}
									className='w-24 sm:w-32'
								/>
								<span className='text-xs sm:text-sm font-medium'>
									{calculateCourseProgress()}%
								</span>
							</div>
							<Button
								variant='outline'
								size='sm'
								onClick={() => navigate("/dashboard")}
								className='text-xs sm:text-sm'>
								<span className='hidden sm:inline'>Exit Course</span>
								<span className='sm:hidden'>Exit</span>
							</Button>
						</div>
					</div>
				</div>

				{/* Lesson Content */}
				<div className='flex-1 overflow-y-auto p-4 sm:p-6'>
					{currentLesson ? (
						<LessonContent
							lesson={currentLesson}
							onComplete={handleLessonComplete}
							onTimeUpdate={updateTimeSpent}
						/>
					) : (
						<Card>
							<CardContent className='text-center py-8'>
								<p className='text-muted-foreground'>
									Select a lesson to begin
								</p>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Navigation Footer */}
				{currentLesson && (
					<div className='border-t bg-background px-4 sm:px-6 py-3 sm:py-4'>
						<div className='flex items-center justify-between'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => {
									const prev = findPreviousLesson();
									if (prev) setCurrentLesson(prev);
								}}
								disabled={!findPreviousLesson()}
								className='text-xs sm:text-sm'>
								<ChevronLeft className='h-4 w-4 mr-1 sm:mr-2' />
								<span className='hidden sm:inline'>Previous</span>
								<span className='sm:hidden'>Prev</span>
							</Button>

							<Button
								size='sm'
								onClick={() => {
									const next = findNextLesson();
									if (next) {
										setCurrentLesson(next);
									} else {
										navigate("/dashboard");
									}
								}}
								className='text-xs sm:text-sm'>
								{findNextLesson() ? (
									<>
										<span className='hidden sm:inline'>Next</span>
										<span className='sm:hidden'>Next</span>
										<ChevronRight className='h-4 w-4 ml-1 sm:ml-2' />
									</>
								) : (
									"Finish Course"
								)}
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Course Completion Celebration */}
			<CourseCompletionCelebration
				course={course}
				courseProgress={calculateCourseProgress()}
				onViewCertificate={handleViewCertificate}
				onContinueLearning={handleContinueLearning}
			/>

			{/* Certificate Success Modal */}
			<CertificateSuccessModal
				isOpen={showCertificateModal}
				onClose={() => setShowCertificateModal(false)}
				certificate={newCertificate}
				courseTitle={course?.title}
				onViewCertificates={handleViewCertificates}
			/>
		</div>
	);
}
