import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Copy, Download, Wand2, X, Check } from "lucide-react";
import { promptsApi } from "../../api/prompts";

const PromptGenerator = ({ prompt, isOpen, onClose, onPromptUsed }) => {
	const [variables, setVariables] = useState({});
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (prompt && prompt.variables) {
			// Initialize variables with default values
			const initialVariables = {};
			prompt.variables.forEach((variable) => {
				initialVariables[variable.name] = variable.default || "";
			});
			setVariables(initialVariables);
		}
	}, [prompt]);

	const handleVariableChange = (variableName, value) => {
		setVariables((prev) => ({
			...prev,
			[variableName]: value,
		}));
	};

	const handleCopy = async (content) => {
		const textToCopy = content || previewContent();
		try {
			// Copy to clipboard
			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds

			// Track usage in backend
			try {
				await promptsApi.generateContent(
					prompt.id,
					variables,
					"prompt_library"
				);
				// Notify parent component that prompt was used
				if (onPromptUsed) {
					onPromptUsed();
				}
			} catch (usageError) {
				// Don't show error to user for usage tracking failure
				console.warn("Failed to track usage:", usageError);
			}
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	const handleDownload = async (content) => {
		const textToDownload = content || previewContent();
		const element = document.createElement("a");
		const file = new Blob([textToDownload], { type: "text/plain" });
		element.href = URL.createObjectURL(file);
		element.download = `${prompt.title.toLowerCase().replace(/\s+/g, "_")}.txt`;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);

		// Track usage in backend
		try {
			await promptsApi.generateContent(prompt.id, variables, "prompt_library");
			// Notify parent component that prompt was used
			if (onPromptUsed) {
				onPromptUsed();
			}
		} catch (usageError) {
			// Don't show error to user for usage tracking failure
			console.warn("Failed to track usage:", usageError);
		}
	};

	const previewContent = () => {
		if (!prompt.content) return "";

		let preview = prompt.content;
		prompt.variables?.forEach((variable) => {
			const placeholder = `{{${variable.name}}}`;
			let value =
				variables[variable.name] || variable.default || `[${variable.name}]`;

			// For boolean variables, use the appropriate label instead of true/false
			if (variable.type === "boolean") {
				const isTrue = value === "true" || value === true;
				if (isTrue && variable.true_label) {
					value = variable.true_label;
				} else if (!isTrue && variable.false_label) {
					value = variable.false_label;
				} else {
					// Fallback to default labels if custom labels not set
					value = isTrue ? "Ja" : "Nee";
				}
			}

			preview = preview.replace(
				new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
				value
			);
		});

		return preview;
	};

	if (!prompt) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Wand2 className='w-5 h-5' />
						{prompt.title}
					</DialogTitle>
					<DialogDescription>{prompt.description}</DialogDescription>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Variables Input */}
					{prompt.variables && prompt.variables.length > 0 && (
						<div className='space-y-4'>
							<h3 className='text-lg font-semibold'>Variabelen Invoeren</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{prompt.variables.map((variable) => (
									<div key={variable.name} className='space-y-2'>
										<Label
											htmlFor={variable.name}
											className='flex items-center gap-2'>
											{variable.name}
											{variable.required && (
												<span className='text-red-500'>*</span>
											)}
											{variable.description && (
												<span className='text-xs text-gray-500'>
													({variable.description})
												</span>
											)}
										</Label>

										{variable.type === "text" ? (
											<Textarea
												id={variable.name}
												value={variables[variable.name] || ""}
												onChange={(e) =>
													handleVariableChange(variable.name, e.target.value)
												}
												placeholder={
													variable.default || `Voer ${variable.name} in...`
												}
												rows={3}
											/>
										) : variable.type === "boolean" ? (
											<div className='space-y-2'>
												<div className='flex items-center space-x-4'>
													<label className='flex items-center space-x-2'>
														<input
															type='radio'
															name={variable.name}
															value='true'
															checked={
																variables[variable.name] === "true" ||
																variables[variable.name] === true ||
																(variables[variable.name] === undefined &&
																	variable.default === "true")
															}
															onChange={(e) =>
																handleVariableChange(
																	variable.name,
																	e.target.value
																)
															}
															className='text-blue-600 focus:ring-blue-500'
														/>
														<span className='text-sm font-medium'>
															{variable.true_label || "Ja"}
														</span>
													</label>
													<label className='flex items-center space-x-2'>
														<input
															type='radio'
															name={variable.name}
															value='false'
															checked={
																variables[variable.name] === "false" ||
																variables[variable.name] === false ||
																(variables[variable.name] === undefined &&
																	variable.default === "false")
															}
															onChange={(e) =>
																handleVariableChange(
																	variable.name,
																	e.target.value
																)
															}
															className='text-blue-600 focus:ring-blue-500'
														/>
														<span className='text-sm font-medium'>
															{variable.false_label || "Nee"}
														</span>
													</label>
												</div>
												{variable.description && (
													<p className='text-xs text-gray-500'>
														{variable.description}
													</p>
												)}
											</div>
										) : variable.type === "date" ? (
											<Input
												id={variable.name}
												type='date'
												value={variables[variable.name] || ""}
												onChange={(e) =>
													handleVariableChange(variable.name, e.target.value)
												}
												placeholder={
													variable.default || `Voer ${variable.name} in...`
												}
											/>
										) : (
											<Input
												id={variable.name}
												type={variable.type === "number" ? "number" : "text"}
												value={variables[variable.name] || ""}
												onChange={(e) =>
													handleVariableChange(variable.name, e.target.value)
												}
												placeholder={
													variable.default || `Voer ${variable.name} in...`
												}
											/>
										)}

										{variable.default && (
											<div className='text-xs text-gray-500'>
												Standaard: {variable.default}
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Preview & Generated Content Panel */}
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<h3 className='text-lg font-semibold'>Live Voorbeeld</h3>

							<div className='flex gap-2'>
								<Button
									size='sm'
									variant={copied ? "default" : "outline"}
									onClick={() => handleCopy(previewContent())}
									title='Kopiëren naar klembord'
									className={`transition-all duration-300 ${
										copied
											? "bg-green-600 hover:bg-green-700 text-white border-green-600 scale-105"
											: "hover:bg-gray-50"
									}`}>
									{copied ? (
										<>
											<Check className='w-4 h-4 mr-1 animate-bounce' />
											Gekopieerd!
										</>
									) : (
										<>
											<Copy className='w-4 h-4 mr-1' />
											Kopiëren
										</>
									)}
								</Button>
								<Button
									size='sm'
									variant='outline'
									onClick={() => handleDownload(previewContent())}
									title='Download als bestand'
									className='hover:bg-gray-50'>
									<Download className='w-4 h-4' />
								</Button>
							</div>
						</div>

						<Card>
							<CardContent className='p-4'>
								<pre className='whitespace-pre-wrap text-sm font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded-md max-h-96 overflow-y-auto'>
									{previewContent()}
								</pre>
							</CardContent>
						</Card>

						<div className='text-xs text-gray-500 flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Badge variant='outline' className='text-xs'>
									v{prompt.version}
								</Badge>
								<span>Direct kopieerbaar - vul variabelen in en kopiëer!</span>
							</div>
							{copied && (
								<div className='flex items-center gap-1 text-green-600 font-medium animate-fade-in'>
									<Check className='w-3 h-3 animate-pulse' />
									<span>In klembord!</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className='flex justify-end gap-2 pt-4 border-t'>
					<Button variant='outline' onClick={onClose}>
						<X className='w-4 h-4 mr-2' />
						Sluiten
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default PromptGenerator;
