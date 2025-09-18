import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
	Plus,
	X,
	Type,
	Hash,
	Calendar,
	ToggleLeft,
	Check,
	Edit,
} from "lucide-react";

const InlineVariableInserter = ({
	content,
	onContentChange,
	variables = [],
	onVariablesChange,
	placeholder = "Schrijf je prompt hier. Gebruik {{variabele_naam}} voor dynamische waarden.",
}) => {
	const [showVariableForm, setShowVariableForm] = useState(false);
	const [newVariable, setNewVariable] = useState({
		name: "",
		type: "text",
		description: "",
		default: "",
		true_label: "",
		false_label: "",
		required: false,
	});
	const [cursorPosition, setCursorPosition] = useState(0);
	const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);
	const [editingVariableIndex, setEditingVariableIndex] = useState(null);
	const [editingVariable, setEditingVariable] = useState({
		name: "",
		type: "text",
		description: "",
		default: "",
		true_label: "",
		false_label: "",
		required: false,
	});
	const textareaRef = useRef(null);

	const variableTypes = [
		{
			value: "text",
			label: "Tekst",
			icon: Type,
			description: "Vrije tekst invoer",
		},
		{
			value: "number",
			label: "Nummer",
			icon: Hash,
			description: "Numerieke waarde",
		},
		{
			value: "date",
			label: "Datum",
			icon: Calendar,
			description: "Datum selectie",
		},
		{
			value: "boolean",
			label: "Ja/Nee",
			icon: ToggleLeft,
			description: "Waar/Onwaar",
		},
	];

	const handleTextareaChange = (e) => {
		onContentChange(e.target.value);
		setCursorPosition(e.target.selectionStart);
	};

	const handleTextareaClick = (e) => {
		setCursorPosition(e.target.selectionStart);
	};

	const insertVariable = (variableName) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = content;
		const before = text.substring(0, start);
		const after = text.substring(end, text.length);
		const variableText = `{{${variableName}}}`;

		const newContent = before + variableText + after;
		onContentChange(newContent);

		// Set cursor position after the inserted variable
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(
				start + variableText.length,
				start + variableText.length
			);
		}, 0);
	};

	const formatVariableName = (name) => {
		return name
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "_") // Replace spaces with underscores
			.replace(/[^a-z0-9_]/g, "") // Remove special characters except underscores
			.replace(/^[0-9]/, "_$&"); // If starts with number, add underscore prefix
	};

	const addVariable = () => {
		if (!newVariable.name.trim()) return;

		const formattedName = formatVariableName(newVariable.name);
		if (!formattedName) {
			alert("Variabele naam moet ten minste één letter bevatten");
			return;
		}

		// Check if variable name already exists
		if (variables.some((v) => v.name === formattedName)) {
			alert("Een variabele met deze naam bestaat al");
			return;
		}

		const variable = {
			...newVariable,
			name: formattedName,
		};

		const updatedVariables = [...variables, variable];
		onVariablesChange(updatedVariables);

		// Insert the variable into the content
		insertVariable(variable.name);

		// Reset form
		setNewVariable({
			name: "",
			type: "text",
			description: "",
			default: "",
			true_label: "",
			false_label: "",
			required: false,
		});
		setShowVariableForm(false);
	};

	const getVariableIcon = (type) => {
		const typeConfig = variableTypes.find((t) => t.value === type);
		return typeConfig ? typeConfig.icon : Type;
	};

	const getVariableLabel = (type) => {
		const typeConfig = variableTypes.find((t) => t.value === type);
		return typeConfig ? typeConfig.label : "Tekst";
	};

	const handleDeleteVariable = (index) => {
		if (deleteConfirmIndex === index) {
			// Confirm deletion
			const updatedVariables = variables.filter((_, i) => i !== index);
			onVariablesChange(updatedVariables);
			setDeleteConfirmIndex(null);
		} else {
			// Show confirmation
			setDeleteConfirmIndex(index);
			// Auto-hide confirmation after 3 seconds
			setTimeout(() => setDeleteConfirmIndex(null), 3000);
		}
	};

	const handleEditVariable = (index) => {
		const variable = variables[index];
		setEditingVariable({
			name: variable.name,
			type: variable.type,
			description: variable.description || "",
			default: variable.default || "",
			true_label: variable.true_label || "",
			false_label: variable.false_label || "",
			required: variable.required || false,
		});
		setEditingVariableIndex(index);
		setShowVariableForm(false); // Hide new variable form
	};

	const handleSaveEdit = () => {
		if (!editingVariable.name.trim()) return;

		const formattedName = formatVariableName(editingVariable.name);
		if (!formattedName) {
			alert("Variabele naam moet ten minste één letter bevatten");
			return;
		}

		// Check if variable name already exists (excluding current variable)
		const existingIndex = variables.findIndex(
			(v, i) => v.name === formattedName && i !== editingVariableIndex
		);
		if (existingIndex !== -1) {
			alert("Een variabele met deze naam bestaat al");
			return;
		}

		const updatedVariable = {
			...editingVariable,
			name: formattedName,
		};

		const updatedVariables = [...variables];
		updatedVariables[editingVariableIndex] = updatedVariable;
		onVariablesChange(updatedVariables);

		// Reset editing state
		setEditingVariableIndex(null);
		setEditingVariable({
			name: "",
			type: "text",
			description: "",
			default: "",
			true_label: "",
			false_label: "",
			required: false,
		});
	};

	const handleCancelEdit = () => {
		setEditingVariableIndex(null);
		setEditingVariable({
			name: "",
			type: "text",
			description: "",
			default: "",
			true_label: "",
			false_label: "",
			required: false,
		});
	};

	return (
		<div className='space-y-4'>
			{/* Content Textarea */}
			<div>
				<Label htmlFor='content'>Prompt Content *</Label>
				<Textarea
					ref={textareaRef}
					id='content'
					value={content}
					onChange={handleTextareaChange}
					onClick={handleTextareaClick}
					placeholder={placeholder}
					rows={8}
					className='font-mono'
				/>
				<div className='text-xs text-gray-500 mt-1'>
					<Check className='w-3 h-3 inline mr-1' />
					Gebruik {`{{variabele_naam}}`} voor dynamische waarden
				</div>
			</div>

			{/* Variable Management */}
			<div className='border rounded-lg p-4 bg-gray-50 dark:bg-gray-800'>
				<div className='flex items-center justify-between mb-4'>
					<h4 className='font-medium'>Variabelen Beheer</h4>
					<Button
						size='sm'
						onClick={() => setShowVariableForm(!showVariableForm)}
						className='bg-gray-900 text-white hover:bg-gray-800'>
						<Plus className='w-4 h-4 mr-2' />
						{showVariableForm ? "Annuleren" : "Nieuwe Variabele"}
					</Button>
				</div>

				{/* Add Variable Form */}
				{showVariableForm && (
					<div className='space-y-4 p-4 bg-white dark:bg-gray-700 rounded-lg border mb-4'>
						<h5 className='font-medium'>Nieuwe Variabele Toevoegen</h5>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='var-name'>Variabele Naam *</Label>
								<Input
									id='var-name'
									value={newVariable.name}
									onChange={(e) =>
										setNewVariable((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									placeholder='bijv. onderwerp, doelgroep, toon'
									className='mt-1'
								/>
								{newVariable.name && (
									<div className='mt-1 text-xs text-gray-500'>
										Wordt opgeslagen als:{" "}
										<code className='bg-gray-100 px-1 rounded'>
											{formatVariableName(newVariable.name)}
										</code>
									</div>
								)}
							</div>

							<div>
								<Label htmlFor='var-type'>Type</Label>
								<select
									id='var-type'
									value={newVariable.type}
									onChange={(e) =>
										setNewVariable((prev) => ({
											...prev,
											type: e.target.value,
										}))
									}
									className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900'>
									{variableTypes.map((type) => (
										<option key={type.value} value={type.value}>
											{type.label}
										</option>
									))}
								</select>
							</div>

							<div className='md:col-span-2'>
								<Label htmlFor='var-description'>Beschrijving</Label>
								<Input
									id='var-description'
									value={newVariable.description}
									onChange={(e) =>
										setNewVariable((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									placeholder='Korte beschrijving van de variabele'
									className='mt-1'
								/>
							</div>

							<div>
								<Label htmlFor='var-default'>Standaard Waarde</Label>
								<Input
									id='var-default'
									value={newVariable.default}
									onChange={(e) =>
										setNewVariable((prev) => ({
											...prev,
											default: e.target.value,
										}))
									}
									placeholder='Optionele standaard waarde'
									className='mt-1'
								/>
							</div>

							{/* Boolean specific fields */}
							{newVariable.type === "boolean" && (
								<>
									<div>
										<Label htmlFor='var-true-label'>True Label</Label>
										<Input
											id='var-true-label'
											value={newVariable.true_label || ""}
											onChange={(e) =>
												setNewVariable((prev) => ({
													...prev,
													true_label: e.target.value,
												}))
											}
											placeholder='bijv. Wel aanwezig, Ja, Actief'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='var-false-label'>False Label</Label>
										<Input
											id='var-false-label'
											value={newVariable.false_label || ""}
											onChange={(e) =>
												setNewVariable((prev) => ({
													...prev,
													false_label: e.target.value,
												}))
											}
											placeholder='bijv. Niet aanwezig, Nee, Inactief'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='var-default-bool'>Standaard Selectie</Label>
										<select
											id='var-default-bool'
											value={newVariable.default || "true"}
											onChange={(e) =>
												setNewVariable((prev) => ({
													...prev,
													default: e.target.value,
												}))
											}
											className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900'>
											<option value='true'>True (eerste optie)</option>
											<option value='false'>False (tweede optie)</option>
										</select>
									</div>
								</>
							)}

							<div className='flex items-center gap-2'>
								<input
									type='checkbox'
									id='var-required'
									checked={newVariable.required}
									onChange={(e) =>
										setNewVariable((prev) => ({
											...prev,
											required: e.target.checked,
										}))
									}
									className='rounded'
								/>
								<Label htmlFor='var-required'>Verplicht veld</Label>
							</div>
						</div>

						<Button
							onClick={addVariable}
							disabled={!newVariable.name.trim()}
							className='w-full'>
							<Plus className='w-4 h-4 mr-2' />
							Variabele Toevoegen & Invoegen
						</Button>
					</div>
				)}

				{/* Edit Variable Form */}
				{editingVariableIndex !== null && (
					<div className='space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4'>
						<h5 className='font-medium text-blue-900 dark:text-blue-100'>
							Variabele Bewerken
						</h5>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='edit-var-name'>Variabele Naam *</Label>
								<Input
									id='edit-var-name'
									value={editingVariable.name}
									onChange={(e) =>
										setEditingVariable((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									placeholder='bijv. onderwerp, doelgroep, toon'
									className='mt-1'
								/>
								{editingVariable.name && (
									<div className='mt-1 text-xs text-gray-500'>
										Wordt opgeslagen als:{" "}
										<code className='bg-gray-100 px-1 rounded'>
											{formatVariableName(editingVariable.name)}
										</code>
									</div>
								)}
							</div>

							<div>
								<Label htmlFor='edit-var-type'>Type</Label>
								<select
									id='edit-var-type'
									value={editingVariable.type}
									onChange={(e) =>
										setEditingVariable((prev) => ({
											...prev,
											type: e.target.value,
										}))
									}
									className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900'>
									{variableTypes.map((type) => (
										<option key={type.value} value={type.value}>
											{type.label}
										</option>
									))}
								</select>
							</div>

							<div className='md:col-span-2'>
								<Label htmlFor='edit-var-description'>Beschrijving</Label>
								<Input
									id='edit-var-description'
									value={editingVariable.description}
									onChange={(e) =>
										setEditingVariable((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									placeholder='Korte beschrijving van de variabele'
									className='mt-1'
								/>
							</div>

							<div>
								<Label htmlFor='edit-var-default'>Standaard Waarde</Label>
								<Input
									id='edit-var-default'
									value={editingVariable.default}
									onChange={(e) =>
										setEditingVariable((prev) => ({
											...prev,
											default: e.target.value,
										}))
									}
									placeholder='Optionele standaard waarde'
									className='mt-1'
								/>
							</div>

							{/* Boolean specific fields for editing */}
							{editingVariable.type === "boolean" && (
								<>
									<div>
										<Label htmlFor='edit-var-true-label'>True Label</Label>
										<Input
											id='edit-var-true-label'
											value={editingVariable.true_label || ""}
											onChange={(e) =>
												setEditingVariable((prev) => ({
													...prev,
													true_label: e.target.value,
												}))
											}
											placeholder='bijv. Wel aanwezig, Ja, Actief'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='edit-var-false-label'>False Label</Label>
										<Input
											id='edit-var-false-label'
											value={editingVariable.false_label || ""}
											onChange={(e) =>
												setEditingVariable((prev) => ({
													...prev,
													false_label: e.target.value,
												}))
											}
											placeholder='bijv. Niet aanwezig, Nee, Inactief'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='edit-var-default-bool'>
											Standaard Selectie
										</Label>
										<select
											id='edit-var-default-bool'
											value={editingVariable.default || "true"}
											onChange={(e) =>
												setEditingVariable((prev) => ({
													...prev,
													default: e.target.value,
												}))
											}
											className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900'>
											<option value='true'>True (eerste optie)</option>
											<option value='false'>False (tweede optie)</option>
										</select>
									</div>
								</>
							)}

							<div className='flex items-center gap-2'>
								<input
									type='checkbox'
									id='edit-var-required'
									checked={editingVariable.required}
									onChange={(e) =>
										setEditingVariable((prev) => ({
											...prev,
											required: e.target.checked,
										}))
									}
									className='rounded'
								/>
								<Label htmlFor='edit-var-required'>Verplicht veld</Label>
							</div>
						</div>

						<div className='flex gap-2'>
							<Button
								onClick={handleSaveEdit}
								disabled={!editingVariable.name.trim()}
								className='bg-blue-600 text-white hover:bg-blue-700'>
								<Check className='w-4 h-4 mr-2' />
								Opslaan
							</Button>
							<Button
								variant='outline'
								onClick={handleCancelEdit}
								className='border-gray-300 hover:bg-gray-50'>
								<X className='w-4 h-4 mr-2' />
								Annuleren
							</Button>
						</div>
					</div>
				)}

				{/* Existing Variables */}
				{variables.length > 0 && (
					<div className='space-y-2'>
						<h5 className='font-medium text-sm'>Gedefinieerde Variabelen</h5>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
							{variables.map((variable, index) => {
								const IconComponent = getVariableIcon(variable.type);
								return (
									<div
										key={index}
										className='p-3 bg-white dark:bg-gray-700 rounded border'>
										<div className='flex items-center gap-2 mb-2'>
											<IconComponent className='w-4 h-4 text-gray-600' />
											<div className='flex items-center gap-2'>
												<span className='font-medium text-sm'>
													{variable.name}
												</span>
												{variable.required && (
													<span className='text-xs text-red-600'>*</span>
												)}
											</div>
										</div>

										<div className='flex items-center gap-2 mb-2'>
											<span className='text-xs text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded'>
												{getVariableLabel(variable.type)}
											</span>
											{variable.default && (
												<span className='text-xs text-gray-500'>
													Standaard: {variable.default}
												</span>
											)}
										</div>

										{variable.description && (
											<p className='text-xs text-gray-500 mb-2'>
												{variable.description}
											</p>
										)}

										<div className='flex items-center gap-1'>
											<Button
												size='sm'
												variant='outline'
												onClick={() => insertVariable(variable.name)}
												className='text-xs px-2 py-1'
												title='Invoegen in tekst'>
												<Plus className='w-3 h-3' />
											</Button>
											<Button
												size='sm'
												variant='outline'
												onClick={() => handleEditVariable(index)}
												className='text-xs px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
												title='Bewerken'>
												<Edit className='w-3 h-3' />
											</Button>
											<Button
												size='sm'
												variant='outline'
												onClick={() => handleDeleteVariable(index)}
												className={`text-xs px-2 py-1 ${
													deleteConfirmIndex === index
														? "bg-red-600 text-white hover:bg-red-700"
														: "text-red-600 hover:text-red-700 hover:bg-red-50"
												}`}
												title={
													deleteConfirmIndex === index
														? "Klik om te bevestigen"
														: "Verwijderen"
												}>
												<X className='w-3 h-3' />
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Usage Instructions */}
				<div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4'>
					<h5 className='font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm'>
						Hoe te gebruiken:
					</h5>
					<ul className='text-xs text-blue-800 dark:text-blue-200 space-y-1'>
						<li>• Klik op "Nieuwe Variabele" om een variabele te definiëren</li>
						<li>
							• Klik op het + icoon naast een variabele om deze in te voegen
						</li>
						<li>
							• Variabelen worden automatisch vervangen door ingevulde waarden
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default InlineVariableInserter;
