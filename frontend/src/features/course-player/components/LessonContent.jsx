import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Video,
	FileText,
	FlaskConical,
	HelpCircle,
	CheckCircle,
} from "lucide-react";

export function LessonContent({ lesson, onComplete, onTimeUpdate }) {
	const [timeSpent, setTimeSpent] = useState(0);
	const [quizAnswers, setQuizAnswers] = useState({});
	const [quizSubmitted, setQuizSubmitted] = useState(false);
	const [quizScore, setQuizScore] = useState(null);

	useEffect(() => {
		// Reset state when lesson changes
		setQuizAnswers({});
		setQuizSubmitted(false);
		setQuizScore(null);
		setTimeSpent(0);
	}, [lesson.id]);

	useEffect(() => {
		// Track time spent on lesson
		const interval = setInterval(() => {
			setTimeSpent((prev) => prev + 1);

			// Update time spent every 30 seconds
			if (timeSpent > 0 && timeSpent % 30 === 0) {
				onTimeUpdate(30);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [timeSpent, onTimeUpdate]);

	const handleCompleteLesson = () => {
		onComplete(quizScore);
	};

	const handleQuizSubmit = () => {
		const questions = lesson.content_data?.questions || [];
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
								{lesson.content_data?.url ? (
									<div className='space-y-2'>
										<p className='text-sm opacity-75'>
											Video URL: {lesson.content_data.url}
										</p>
										<Button
											onClick={() =>
												window.open(lesson.content_data.url, "_blank")
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
								{lesson.content_data?.duration
									? `${Math.floor(lesson.content_data.duration / 60)} minutes`
									: "Niet opgegeven"}
							</p>
						</div>
						<Button onClick={handleCompleteLesson} className='w-full'>
							Mark as Complete
						</Button>
					</div>
				);

			case "text":
				return (
					<div className='space-y-4'>
						<div className='prose max-w-none'>
							{lesson.content_data?.content ? (
								<div
									dangerouslySetInnerHTML={{
										__html: lesson.content_data.content,
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
						<Button onClick={handleCompleteLesson} className='w-full'>
							Mark as Complete
						</Button>
					</div>
				);

			case "quiz":
				const questions = lesson.content_data?.questions || [];
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
							questions.map((question, index) => (
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
							))
						)}

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
													? "Excellent work!"
													: quizScore >= 60
													? "Good job!"
													: "Keep practicing!"}
											</p>
										</div>
										<Button onClick={handleCompleteLesson} className='w-full'>
											Continue to Next Lesson
										</Button>
									</>
								)}
							</div>
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
					</div>
				</CardHeader>
				<CardContent>{renderContent()}</CardContent>
			</Card>
		</div>
	);
}
