import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Video,
	FileText,
	FlaskConical,
	HelpCircle,
	CheckCircle,
	PlayCircle,
} from "lucide-react";

export function LessonContent({ lesson, onComplete, onTimeUpdate }) {
	const [timeSpent, setTimeSpent] = useState(0);
	const [quizAnswers, setQuizAnswers] = useState({});
	const [quizSubmitted, setQuizSubmitted] = useState(false);
	const [quizScore, setQuizScore] = useState(null);
	const [isCompleting, setIsCompleting] = useState(false);
	const [previousQuizScore, setPreviousQuizScore] = useState(null);
	const [hasPassedQuiz, setHasPassedQuiz] = useState(false);

	// Parse content_data if it's a string
	const parsedContentData = useMemo(() => {
		if (!lesson.content_data) return null;
		if (typeof lesson.content_data === 'string') {
			try {
				return JSON.parse(lesson.content_data);
			} catch (e) {
				console.error('Error parsing content_data:', e);
				return null;
			}
		}
		return lesson.content_data;
	}, [lesson.content_data]);

	useEffect(() => {
		// Reset state when lesson changes
		setQuizAnswers({});
		setQuizSubmitted(false);
		setQuizScore(null);
		setTimeSpent(0);
		setPreviousQuizScore(null);
		setHasPassedQuiz(false);
	}, [lesson.id]);

	useEffect(() => {
		// Track time spent on lesson
		const interval = setInterval(() => {
			setTimeSpent((prev) => {
				const newTime = prev + 1;
				
				// Update time spent every 30 seconds
				if (newTime > 0 && newTime % 30 === 0) {
					onTimeUpdate(30);
				}
				
				return newTime;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [onTimeUpdate]);

	const handleCompleteLesson = async () => {
		setIsCompleting(true);
		try {
			await onComplete(quizScore);
		} finally {
			setIsCompleting(false);
		}
	};

	const handleQuizSubmit = () => {
		const questions = parsedContentData?.questions || [];
		let correctAnswers = 0;

		questions.forEach((question, index) => {
			if (quizAnswers[index] === question.correct) {
				correctAnswers++;
			}
		});

		const score =
			questions.length > 0
				? Math.round((correctAnswers / questions.length) * 100)
				: 0;

		setQuizScore(score);
		setQuizSubmitted(true);
		
		// Check if this is a passing score
		if (score >= 80) {
			setHasPassedQuiz(true);
		}
		
		// Store the score for retry functionality
		setPreviousQuizScore(score);
	};

	const renderContent = () => {
		switch (lesson.content_type) {
			case "video":
				return (
					<div className='space-y-4'>
						<div className='aspect-video bg-gray-900 rounded-lg flex items-center justify-center'>
							<div className='text-center text-white'>
								<Video className='h-16 w-16 mx-auto mb-4 opacity-50' />
								<p className='text-lg font-medium mb-2'>Video Player</p>
								{parsedContentData?.url ? (
									<div className='space-y-2'>
										<p className='text-sm opacity-75'>
											Video URL: {parsedContentData.url}
										</p>
										<Button
											onClick={() =>
												window.open(parsedContentData.url, "_blank")
											}
											className='bg-white text-black hover:bg-gray-200'>
											Open Video
										</Button>
									</div>
								) : (
									<div className='space-y-2'>
										<p className='text-sm opacity-75'>
											Video content wordt geladen...
										</p>
										<p className='text-xs opacity-50'>
											• Video wordt hier afgespeeld
										</p>
										<p className='text-xs opacity-50'>
											• Volg de instructies in de video
										</p>
									</div>
								)}
							</div>
						</div>
						<div className='p-4 bg-muted rounded-lg'>
							<p className='text-sm text-muted-foreground'>
								Duration:{" "}
								{parsedContentData?.duration
									? `${Math.floor(parsedContentData.duration / 60)} minutes`
									: "Niet opgegeven"}
							</p>
						</div>
						<Button 
							onClick={handleCompleteLesson} 
							className='w-full'
							disabled={isCompleting}
						>
							{isCompleting ? 'Completing...' : 'Mark as Complete'}
						</Button>
					</div>
				);

			case "text":
				return (
					<div className='space-y-4'>
						<div className='prose max-w-none'>
							{parsedContentData?.content ? (
								<div
									dangerouslySetInnerHTML={{
										__html: parsedContentData.content,
									}}
								/>
							) : (
								<div className='p-8 bg-muted rounded-lg text-center'>
									<FileText className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
									<p className='text-muted-foreground mb-4'>
										Text content wordt geladen...
									</p>
									<div className='space-y-2 text-sm text-muted-foreground'>
										<p>• Lesinhoud wordt hier weergegeven</p>
										<p>• Lees de informatie aandachtig door</p>
										<p>• Volg de instructies stap voor stap</p>
									</div>
								</div>
							)}
						</div>
						<Button 
							onClick={handleCompleteLesson} 
							className='w-full'
							disabled={isCompleting}
						>
							{isCompleting ? 'Completing...' : 'Mark as Complete'}
						</Button>
					</div>
				);

			case "quiz":
				// Handle different quiz data formats
				let questions = [];
				if (parsedContentData?.questions) {
					if (Array.isArray(parsedContentData.questions)) {
						questions = parsedContentData.questions;
					} else if (typeof parsedContentData.questions === 'number' && parsedContentData.questions === 0) {
						// Handle case where questions is set to 0 instead of empty array
						questions = [];
					}
				}
				
				// If no questions, create a sample quiz
				if (questions.length === 0) {
					questions = [
						{
							id: Date.now(),
							question: `Sample question for "${lesson.title}"`,
							options: ["Option A", "Option B", "Option C", "Option D"],
							correct: 0
						},
						{
							id: Date.now() + 1,
							question: `Another question for "${lesson.title}"`,
							options: ["True", "False"],
							correct: 0
						}
					];
				}
				
				return (
					<div className='space-y-6'>
						{questions.length === 0 ? (
							<div className='p-8 bg-muted rounded-lg text-center'>
								<HelpCircle className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
								<p className='text-muted-foreground mb-4'>
									Quiz content wordt geladen...
								</p>
								<div className='space-y-2 text-sm text-muted-foreground'>
									<p>• Quiz vragen worden hier weergegeven</p>
									<p>• Selecteer het juiste antwoord</p>
									<p>• Klik op "Submit Quiz" om te voltooien</p>
								</div>
							</div>
						) : (
							<>
								{hasPassedQuiz && previousQuizScore && (
									<div className='p-4 bg-green-50 border border-green-200 rounded-lg mb-4'>
										<div className='flex items-center space-x-2'>
											<CheckCircle className='h-5 w-5 text-green-500' />
											<p className='text-green-800 font-medium'>
												Je hebt deze quiz al gehaald! (Score: {previousQuizScore}%)
											</p>
										</div>
									</div>
								)}
								
								{questions.map((question, index) => (
									<Card key={index}>
										<CardHeader>
											<CardTitle className='text-lg'>
												Question {index + 1}: {question.question}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className='space-y-2'>
												{question.options.map((option, optionIndex) => (
													<label
														key={optionIndex}
														className='flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50'>
														<input
															type='radio'
															name={`question-${index}`}
															value={optionIndex}
															checked={quizAnswers[index] === optionIndex}
															onChange={() =>
																setQuizAnswers({
																	...quizAnswers,
																	[index]: optionIndex,
																})
															}
															disabled={quizSubmitted}
														/>
														<span className='flex-1'>{option}</span>
														{quizSubmitted && (
															<>
																{question.correct === optionIndex && (
																	<CheckCircle className='h-4 w-4 text-green-500' />
																)}
																{quizAnswers[index] === optionIndex &&
																	question.correct !== optionIndex && (
																		<span className='text-red-500'>✗</span>
																	)}
															</>
														)}
													</label>
												))}
											</div>
										</CardContent>
									</Card>
								))}

								{questions.length > 0 && (
									<div className='space-y-4'>
										{!quizSubmitted ? (
											<Button
												onClick={handleQuizSubmit}
												className='w-full'
												disabled={
													Object.keys(quizAnswers).length !== questions.length
												}>
												Submit Quiz
											</Button>
										) : (
											<>
												<div className='p-4 bg-muted rounded-lg text-center'>
													<p className='text-2xl font-bold'>Score: {quizScore}%</p>
													<p className='text-muted-foreground mt-1'>
														{quizScore >= 80
															? "Excellent work! Je hebt de quiz gehaald!"
															: quizScore >= 60
															? "Good job, maar je hebt 80% nodig voor het certificaat!"
															: "Je hebt meer oefening nodig. Probeer opnieuw!"}
													</p>
												</div>
												
												{quizScore >= 80 ? (
													<Button 
														onClick={handleCompleteLesson} 
														className='w-full'
														disabled={isCompleting}
													>
														{isCompleting ? 'Completing...' : 'Continue to Next Lesson'}
													</Button>
												) : (
													<div className='space-y-2'>
														<Button 
															onClick={() => {
																setQuizSubmitted(false);
																setQuizAnswers({});
																setQuizScore(null);
																setHasPassedQuiz(false);
																setPreviousQuizScore(null);
															}}
															className='w-full'
															variant="outline"
														>
															🔄 Probeer Quiz Opnieuw
														</Button>
														<Button 
															onClick={handleCompleteLesson} 
															className='w-full'
															disabled={isCompleting}
															variant="secondary"
														>
															{isCompleting ? 'Completing...' : 'Skip Quiz & Continue'}
														</Button>
													</div>
												)}
											</>
										)}
									</div>
								)}
							</>
						)}
					</div>
				);

			case "lab_simulation":
				return (
					<div className='space-y-4'>
						<div className='p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg text-center'>
							<FlaskConical className='h-16 w-16 mx-auto mb-4 text-purple-600' />
							<h3 className='text-xl font-semibold mb-2'>Lab Simulation</h3>
							<p className='text-muted-foreground mb-4'>
								Interactieve lab simulatie wordt geladen...
							</p>
							<div className='space-y-2 text-sm text-muted-foreground'>
								<p>• Volg de instructies in de simulatie</p>
								<p>• Voer experimenten uit</p>
								<p>• Analyseer de resultaten</p>
							</div>
						</div>
						<Button onClick={handleCompleteLesson} className='w-full'>
							Complete Lab
						</Button>
					</div>
				);

			default:
				return (
					<div className='p-8 text-center'>
						<p className='text-muted-foreground'>Unknown lesson type</p>
					</div>
				);
		}
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<Card>
				<CardHeader>
					<CardTitle>{lesson.title}</CardTitle>
					<div className='flex items-center gap-4 text-sm text-muted-foreground'>
						<span>Type: {lesson.content_type.replace("_", " ")}</span>
						<span>
							Time spent: {Math.floor(timeSpent / 60)}:
							{(timeSpent % 60).toString().padStart(2, "0")}
						</span>
						{lesson.progress && lesson.progress.status === "completed" && (
							<span className='text-green-600 font-medium flex items-center gap-1'>
								<CheckCircle className='h-4 w-4' />
								Completed
							</span>
						)}
						{lesson.progress && lesson.progress.status === "in_progress" && (
							<span className='text-yellow-600 font-medium flex items-center gap-1'>
								<PlayCircle className='h-4 w-4' />
								In Progress
							</span>
						)}
						{lesson.progress && lesson.progress.quiz_score && (
							<span className='text-blue-600 font-medium'>
								Quiz: {lesson.progress.quiz_score}%
							</span>
						)}
					</div>
				</CardHeader>
				<CardContent>{renderContent()}</CardContent>
			</Card>
		</div>
	);
}
