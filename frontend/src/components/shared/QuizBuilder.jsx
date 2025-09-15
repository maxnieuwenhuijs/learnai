import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";

const QuizBuilder = ({ questions = [], onChange }) => {
	const [editingQuestion, setEditingQuestion] = useState(null);
	const [questionForm, setQuestionForm] = useState({
		question: "",
		type: "multiple-choice",
		options: ["", "", "", ""],
		correctAnswer: 0,
		explanation: "",
	});

	useEffect(() => {
		if (editingQuestion !== null) {
			const question = questions[editingQuestion];
			setQuestionForm({
				question: question.question || "",
				type: question.type || "multiple-choice",
				options: question.options || ["", "", "", ""],
				correctAnswer: question.correctAnswer || 0,
				explanation: question.explanation || "",
			});
		}
	}, [editingQuestion, questions]);

	const handleAddQuestion = () => {
		console.log("handleAddQuestion called with form:", questionForm);
		console.log("isFormValid():", isFormValid());

		if (!isFormValid()) {
			console.log("Form is not valid, not adding question");
			return;
		}

		const newQuestion = {
			id: Date.now(),
			question: questionForm.question,
			type: questionForm.type,
			options: questionForm.options.filter((opt) => opt.trim() !== ""),
			correctAnswer: questionForm.correctAnswer,
			explanation: questionForm.explanation,
		};

		const updatedQuestions = [...questions, newQuestion];
		console.log("Adding question:", newQuestion);
		console.log("Updated questions:", updatedQuestions);

		if (onChange) {
			onChange(updatedQuestions);
		} else {
			console.error("onChange function is not provided!");
		}

		resetForm();
	};

	const handleUpdateQuestion = () => {
		console.log("handleUpdateQuestion called with form:", questionForm);
		console.log("isFormValid():", isFormValid());

		if (!isFormValid()) {
			console.log("Form is not valid, not updating question");
			return;
		}

		const updatedQuestions = questions.map((q, index) =>
			index === editingQuestion
				? {
						...q,
						question: questionForm.question,
						type: questionForm.type,
						options: questionForm.options.filter((opt) => opt.trim() !== ""),
						correctAnswer: questionForm.correctAnswer,
						explanation: questionForm.explanation,
				  }
				: q
		);

		console.log("Updating question:", updatedQuestions[editingQuestion]);
		console.log("All updated questions:", updatedQuestions);

		if (onChange) {
			onChange(updatedQuestions);
		} else {
			console.error("onChange function is not provided!");
		}

		setEditingQuestion(null);
		resetForm();
	};

	const handleDeleteQuestion = (index) => {
		const updatedQuestions = questions.filter((_, i) => i !== index);
		console.log("Deleting question at index:", index);
		console.log("Remaining questions:", updatedQuestions);
		onChange(updatedQuestions);
	};

	const handleEditQuestion = (index) => {
		setEditingQuestion(index);
	};

	const resetForm = () => {
		console.log("Resetting form");
		setQuestionForm({
			question: "",
			type: "multiple-choice",
			options: ["", "", "", ""],
			correctAnswer: 0,
			explanation: "",
		});
	};

	const handleOptionChange = (index, value) => {
		const newOptions = [...questionForm.options];
		newOptions[index] = value;
		setQuestionForm({ ...questionForm, options: newOptions });
	};

	const addOption = () => {
		setQuestionForm({
			...questionForm,
			options: [...questionForm.options, ""],
		});
	};

	const removeOption = (index) => {
		const newOptions = questionForm.options.filter((_, i) => i !== index);
		setQuestionForm({
			...questionForm,
			options: newOptions,
			correctAnswer: Math.min(
				questionForm.correctAnswer,
				newOptions.length - 1
			),
		});
	};

	const isFormValid = () => {
		const hasQuestion = questionForm.question.trim() !== "";
		const hasEnoughOptions =
			questionForm.type === "true-false"
				? true
				: questionForm.options.filter((opt) => opt.trim() !== "").length >= 2;

		console.log("Form validation:", {
			hasQuestion,
			hasEnoughOptions,
			questionType: questionForm.type,
			options: questionForm.options,
			isValid: hasQuestion && hasEnoughOptions,
		});

		return hasQuestion && hasEnoughOptions;
	};

	return (
		<div className='space-y-4'>
			{/* Question Form */}
			<Card>
				<CardHeader>
					<CardTitle>
						{editingQuestion !== null ? "Edit Question" : "Add New Question"}
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div>
						<Label htmlFor='question-text'>Question</Label>
						<Textarea
							id='question-text'
							value={questionForm.question}
							onChange={(e) =>
								setQuestionForm({ ...questionForm, question: e.target.value })
							}
							placeholder='Enter your question...'
							rows={3}
						/>
					</div>

					<div>
						<Label htmlFor='question-type'>Question Type</Label>
						<RadioGroup
							value={questionForm.type}
							onValueChange={(value) =>
								setQuestionForm({ ...questionForm, type: value })
							}>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem value='multiple-choice' id='multiple-choice' />
								<Label htmlFor='multiple-choice'>Multiple Choice</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem value='true-false' id='true-false' />
								<Label htmlFor='true-false'>True/False</Label>
							</div>
						</RadioGroup>
					</div>

					{questionForm.type === "multiple-choice" && (
						<div>
							<Label>Answer Options</Label>
							<div className='space-y-2'>
								{questionForm.options.map((option, index) => (
									<div key={index} className='flex items-center space-x-2'>
										<RadioGroup
											value={questionForm.correctAnswer.toString()}
											onValueChange={(value) =>
												setQuestionForm({
													...questionForm,
													correctAnswer: parseInt(value),
												})
											}>
											<div className='flex items-center space-x-2'>
												<RadioGroupItem
													value={index.toString()}
													id={`option-${index}`}
												/>
												<Input
													value={option}
													onChange={(e) =>
														handleOptionChange(index, e.target.value)
													}
													placeholder={`Option ${index + 1}`}
													className='flex-1'
												/>
												{questionForm.options.length > 2 && (
													<Button
														type='button'
														variant='ghost'
														size='sm'
														onClick={() => removeOption(index)}>
														<Trash2 className='h-4 w-4' />
													</Button>
												)}
											</div>
										</RadioGroup>
									</div>
								))}
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={addOption}
									className='w-full'>
									<Plus className='h-4 w-4 mr-2' />
									Add Option
								</Button>
							</div>
						</div>
					)}

					{questionForm.type === "true-false" && (
						<div>
							<Label>Correct Answer</Label>
							<RadioGroup
								value={questionForm.correctAnswer.toString()}
								onValueChange={(value) =>
									setQuestionForm({
										...questionForm,
										correctAnswer: parseInt(value),
									})
								}>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='0' id='true' />
									<Label htmlFor='true'>True</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='1' id='false' />
									<Label htmlFor='false'>False</Label>
								</div>
							</RadioGroup>
						</div>
					)}

					<div>
						<Label htmlFor='explanation'>Explanation (Optional)</Label>
						<Textarea
							id='explanation'
							value={questionForm.explanation}
							onChange={(e) =>
								setQuestionForm({
									...questionForm,
									explanation: e.target.value,
								})
							}
							placeholder='Explain why this is the correct answer...'
							rows={2}
						/>
					</div>

					<div className='flex gap-2'>
						{editingQuestion !== null ? (
							<>
								<Button
									onClick={handleUpdateQuestion}
									disabled={!isFormValid()}>
									<Save className='h-4 w-4 mr-2' />
									Update Question
								</Button>
								<Button
									variant='outline'
									onClick={() => {
										setEditingQuestion(null);
										resetForm();
									}}>
									<X className='h-4 w-4 mr-2' />
									Cancel
								</Button>
							</>
						) : (
							<Button onClick={handleAddQuestion} disabled={!isFormValid()}>
								<Plus className='h-4 w-4 mr-2' />
								Add Question
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Questions List */}
			{questions.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Questions ({questions.length})</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							{questions.map((question, index) => (
								<div
									key={question.id || index}
									className='border rounded-lg p-4'>
									<div className='flex items-start justify-between'>
										<div className='flex-1'>
											<div className='flex items-center gap-2 mb-2'>
												<Badge variant='outline'>Q{index + 1}</Badge>
												<Badge variant='secondary'>
													{question.type === "multiple-choice"
														? "Multiple Choice"
														: "True/False"}
												</Badge>
											</div>
											<p className='font-medium mb-2'>{question.question}</p>

											{question.type === "multiple-choice" && (
												<div className='space-y-1'>
													{question.options.map((option, optIndex) => (
														<div
															key={optIndex}
															className='flex items-center gap-2'>
															<div
																className={`w-2 h-2 rounded-full ${
																	optIndex === question.correctAnswer
																		? "bg-green-500"
																		: "bg-gray-300"
																}`}
															/>
															<span
																className={
																	optIndex === question.correctAnswer
																		? "font-medium text-green-700"
																		: ""
																}>
																{option}
															</span>
														</div>
													))}
												</div>
											)}

											{question.type === "true-false" && (
												<div className='flex items-center gap-2'>
													<div
														className={`w-2 h-2 rounded-full ${
															question.correctAnswer === 0
																? "bg-green-500"
																: "bg-gray-300"
														}`}
													/>
													<span
														className={
															question.correctAnswer === 0
																? "font-medium text-green-700"
																: ""
														}>
														True
													</span>
													<div
														className={`w-2 h-2 rounded-full ${
															question.correctAnswer === 1
																? "bg-green-500"
																: "bg-gray-300"
														}`}
													/>
													<span
														className={
															question.correctAnswer === 1
																? "font-medium text-green-700"
																: ""
														}>
														False
													</span>
												</div>
											)}

											{question.explanation && (
												<p className='text-sm text-gray-600 mt-2'>
													<strong>Explanation:</strong> {question.explanation}
												</p>
											)}
										</div>
										<div className='flex gap-1 ml-4'>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleEditQuestion(index)}>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleDeleteQuestion(index)}
												className='text-red-600'>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default QuizBuilder;
