import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import {
	Award,
	Settings,
	Download,
	Eye,
	Edit,
	Trash2,
	Plus,
	CheckCircle,
	Clock,
	Users,
	FileText,
	Palette,
	Layout,
	Type,
	Image as ImageIcon,
} from "lucide-react";
import api from "@/api/config";

const CertificateManager = ({ courseId, course, onUpdate }) => {
	const [certificateSettings, setCertificateSettings] = useState({
		enabled: false,
		title: "Certificate of Completion",
		subtitle: "This certifies that",
		recipientName: "",
		completionText: "has successfully completed the course",
		courseName: course?.title || "",
		completionDate: "",
		issuerName: "E-Learning Platform",
		issuerTitle: "Course Administrator",
		verificationCode: "",
		validityPeriod: 365, // days
		passingScore: 80,
		requireQuiz: false,
		requireAllLessons: true,
		design: {
			template: "modern",
			backgroundColor: "#ffffff",
			primaryColor: "#3b82f6",
			secondaryColor: "#1e40af",
			textColor: "#1f2937",
			fontFamily: "Inter",
			borderStyle: "solid",
			borderColor: "#e5e7eb",
			logoUrl: "",
			backgroundImage: "",
			watermark: "",
		},
		layout: {
			orientation: "landscape",
			width: 800,
			height: 600,
			margin: 40,
			padding: 60,
		},
		text: {
			titleSize: 32,
			subtitleSize: 18,
			bodySize: 14,
			recipientSize: 24,
			courseSize: 20,
			dateSize: 12,
			issuerSize: 14,
		},
	});

	const [showPreview, setShowPreview] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [certificates, setCertificates] = useState([]);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		if (courseId) {
			loadCertificateSettings();
			loadCertificates();
		}
	}, [courseId]);

	const loadCertificateSettings = async () => {
		try {
			const response = await api.get(`/super-admin/courses/${courseId}/certificate-settings`);
			if (response.data.success) {
				setCertificateSettings(response.data.settings);
			}
		} catch (error) {
			console.error("Error loading certificate settings:", error);
		}
	};

	const loadCertificates = async () => {
		try {
			const response = await api.get(`/super-admin/courses/${courseId}/certificates`);
			if (response.data.success) {
				setCertificates(response.data.certificates);
			}
		} catch (error) {
			console.error("Error loading certificates:", error);
		}
	};

	const saveCertificateSettings = async () => {
		try {
			setLoading(true);
			const response = await api.put(`/super-admin/courses/${courseId}/certificate-settings`, certificateSettings);
			
			if (response.data.success) {
				toast({
					title: "Success",
					description: "Certificate settings saved successfully",
				});
				onUpdate?.();
			}
		} catch (error) {
			console.error("Error saving certificate settings:", error);
			toast({
				title: "Error",
				description: "Failed to save certificate settings",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const generateCertificate = async (userId) => {
		try {
			setLoading(true);
			const response = await api.post(`/super-admin/courses/${courseId}/certificates/generate`, {
				userId,
				settings: certificateSettings,
			});
			
			if (response.data.success) {
				toast({
					title: "Success",
					description: "Certificate generated successfully",
				});
				loadCertificates();
			}
		} catch (error) {
			console.error("Error generating certificate:", error);
			toast({
				title: "Error",
				description: "Failed to generate certificate",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const downloadCertificate = async (certificateId) => {
		try {
			const response = await api.get(`/super-admin/certificates/${certificateId}/download`, {
				responseType: 'blob',
			});
			
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `certificate-${certificateId}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error downloading certificate:", error);
			toast({
				title: "Error",
				description: "Failed to download certificate",
				variant: "destructive",
			});
		}
	};

	const updateSettings = (path, value) => {
		setCertificateSettings(prev => {
			const newSettings = { ...prev };
			const keys = path.split('.');
			let current = newSettings;
			
			for (let i = 0; i < keys.length - 1; i++) {
				current = current[keys[i]] = { ...current[keys[i]] };
			}
			
			current[keys[keys.length - 1]] = value;
			return newSettings;
		});
	};

	const renderPreview = () => {
		const { design, layout, text } = certificateSettings;
		
		return (
			<div 
				className="border-2 border-gray-300 mx-auto bg-white shadow-lg"
				style={{
					width: `${layout.width * 0.5}px`,
					height: `${layout.height * 0.5}px`,
					backgroundColor: design.backgroundColor,
					color: design.textColor,
					fontFamily: design.fontFamily,
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				{/* Background Image */}
				{design.backgroundImage && (
					<div 
						className="absolute inset-0 opacity-10"
						style={{
							backgroundImage: `url(${design.backgroundImage})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}
					/>
				)}
				
				{/* Watermark */}
				{design.watermark && (
					<div 
						className="absolute inset-0 flex items-center justify-center opacity-5"
						style={{ fontSize: '120px', transform: 'rotate(-45deg)' }}
					>
						{design.watermark}
					</div>
				)}
				
				{/* Content */}
				<div className="relative z-10 p-8 h-full flex flex-col justify-center items-center text-center">
					{/* Logo */}
					{design.logoUrl && (
						<div className="mb-6">
							<img 
								src={design.logoUrl} 
								alt="Logo" 
								className="h-16 w-auto mx-auto"
							/>
						</div>
					)}
					
					{/* Title */}
					<h1 
						className="font-bold mb-4"
						style={{ 
							fontSize: `${text.titleSize}px`,
							color: design.primaryColor,
						}}
					>
						{certificateSettings.title}
					</h1>
					
					{/* Subtitle */}
					<p 
						className="mb-6"
						style={{ fontSize: `${text.subtitleSize}px` }}
					>
						{certificateSettings.subtitle}
					</p>
					
					{/* Recipient Name */}
					<div 
						className="mb-4 p-4 border-2 border-dashed border-gray-400 rounded"
						style={{ fontSize: `${text.recipientSize}px` }}
					>
						[Recipient Name]
					</div>
					
					{/* Completion Text */}
					<p 
						className="mb-4"
						style={{ fontSize: `${text.bodySize}px` }}
					>
						{certificateSettings.completionText}
					</p>
					
					{/* Course Name */}
					<div 
						className="mb-6 font-semibold"
						style={{ 
							fontSize: `${text.courseSize}px`,
							color: design.secondaryColor,
						}}
					>
						{certificateSettings.courseName}
					</div>
					
					{/* Date */}
					<p 
						className="mb-4"
						style={{ fontSize: `${text.dateSize}px` }}
					>
						Completed on: [Date]
					</p>
					
					{/* Issuer */}
					<div className="mt-auto">
						<p 
							className="font-semibold"
							style={{ fontSize: `${text.issuerSize}px` }}
						>
							{certificateSettings.issuerName}
						</p>
						<p 
							className="text-gray-600"
							style={{ fontSize: `${text.issuerSize - 2}px` }}
						>
							{certificateSettings.issuerTitle}
						</p>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<Award className="h-6 w-6" />
						Certificate Manager
					</h2>
					<p className="text-muted-foreground">
						Configure and manage certificates for this course
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setShowPreview(true)}
					>
						<Eye className="h-4 w-4 mr-2" />
						Preview
					</Button>
					<Button
						onClick={() => setShowSettings(true)}
					>
						<Settings className="h-4 w-4 mr-2" />
						Settings
					</Button>
				</div>
			</div>

			{/* Status Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircle className="h-5 w-5" />
						Certificate Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Switch
								checked={certificateSettings.enabled}
								onCheckedChange={(checked) => updateSettings('enabled', checked)}
							/>
							<div>
								<p className="font-medium">
									{certificateSettings.enabled ? 'Certificates Enabled' : 'Certificates Disabled'}
								</p>
								<p className="text-sm text-muted-foreground">
									{certificateSettings.enabled 
										? 'Certificates will be automatically generated upon course completion'
										: 'No certificates will be generated for this course'
									}
								</p>
							</div>
						</div>
						<Badge variant={certificateSettings.enabled ? "default" : "secondary"}>
							{certificateSettings.enabled ? "Active" : "Inactive"}
						</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-blue-600" />
							<div>
								<p className="text-2xl font-bold">{certificates.length}</p>
								<p className="text-sm text-muted-foreground">Certificates Issued</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-green-600" />
							<div>
								<p className="text-2xl font-bold">{course?.enrolled_count || 0}</p>
								<p className="text-sm text-muted-foreground">Enrolled Users</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Clock className="h-5 w-5 text-orange-600" />
							<div>
								<p className="text-2xl font-bold">{certificateSettings.validityPeriod}</p>
								<p className="text-sm text-muted-foreground">Validity (days)</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Settings Dialog */}
			<Dialog open={showSettings} onOpenChange={setShowSettings}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Certificate Settings</DialogTitle>
						<DialogDescription>
							Configure the design and requirements for course certificates
						</DialogDescription>
					</DialogHeader>
					
					<Tabs defaultValue="content" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="content">Content</TabsTrigger>
							<TabsTrigger value="design">Design</TabsTrigger>
							<TabsTrigger value="requirements">Requirements</TabsTrigger>
							<TabsTrigger value="layout">Layout</TabsTrigger>
						</TabsList>
						
						{/* Content Tab */}
						<TabsContent value="content" className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="cert-title">Certificate Title</Label>
									<Input
										id="cert-title"
										value={certificateSettings.title}
										onChange={(e) => updateSettings('title', e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="cert-subtitle">Subtitle</Label>
									<Input
										id="cert-subtitle"
										value={certificateSettings.subtitle}
										onChange={(e) => updateSettings('subtitle', e.target.value)}
									/>
								</div>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="completion-text">Completion Text</Label>
								<Textarea
									id="completion-text"
									value={certificateSettings.completionText}
									onChange={(e) => updateSettings('completionText', e.target.value)}
									rows={2}
								/>
							</div>
							
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="issuer-name">Issuer Name</Label>
									<Input
										id="issuer-name"
										value={certificateSettings.issuerName}
										onChange={(e) => updateSettings('issuerName', e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="issuer-title">Issuer Title</Label>
									<Input
										id="issuer-title"
										value={certificateSettings.issuerTitle}
										onChange={(e) => updateSettings('issuerTitle', e.target.value)}
									/>
								</div>
							</div>
						</TabsContent>
						
						{/* Design Tab */}
						<TabsContent value="design" className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="bg-color">Background Color</Label>
									<div className="flex gap-2">
										<Input
											id="bg-color"
											type="color"
											value={certificateSettings.design.backgroundColor}
											onChange={(e) => updateSettings('design.backgroundColor', e.target.value)}
											className="w-16 h-10"
										/>
										<Input
											value={certificateSettings.design.backgroundColor}
											onChange={(e) => updateSettings('design.backgroundColor', e.target.value)}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="primary-color">Primary Color</Label>
									<div className="flex gap-2">
										<Input
											id="primary-color"
											type="color"
											value={certificateSettings.design.primaryColor}
											onChange={(e) => updateSettings('design.primaryColor', e.target.value)}
											className="w-16 h-10"
										/>
										<Input
											value={certificateSettings.design.primaryColor}
											onChange={(e) => updateSettings('design.primaryColor', e.target.value)}
										/>
									</div>
								</div>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="logo-url">Logo URL</Label>
								<Input
									id="logo-url"
									value={certificateSettings.design.logoUrl}
									onChange={(e) => updateSettings('design.logoUrl', e.target.value)}
									placeholder="https://example.com/logo.png"
								/>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="watermark">Watermark Text</Label>
								<Input
									id="watermark"
									value={certificateSettings.design.watermark}
									onChange={(e) => updateSettings('design.watermark', e.target.value)}
									placeholder="CONFIDENTIAL"
								/>
							</div>
						</TabsContent>
						
						{/* Requirements Tab */}
						<TabsContent value="requirements" className="space-y-4">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<Label htmlFor="require-all-lessons">Require All Lessons</Label>
										<p className="text-sm text-muted-foreground">
											User must complete all lessons to receive certificate
										</p>
									</div>
									<Switch
										id="require-all-lessons"
										checked={certificateSettings.requireAllLessons}
										onCheckedChange={(checked) => updateSettings('requireAllLessons', checked)}
									/>
								</div>
								
								<div className="flex items-center justify-between">
									<div>
										<Label htmlFor="require-quiz">Require Quiz Completion</Label>
										<p className="text-sm text-muted-foreground">
											User must pass quizzes to receive certificate
										</p>
									</div>
									<Switch
										id="require-quiz"
										checked={certificateSettings.requireQuiz}
										onCheckedChange={(checked) => updateSettings('requireQuiz', checked)}
									/>
								</div>
								
								<div className="space-y-2">
									<Label htmlFor="passing-score">Minimum Passing Score (%)</Label>
									<Input
										id="passing-score"
										type="number"
										min="0"
										max="100"
										value={certificateSettings.passingScore}
										onChange={(e) => updateSettings('passingScore', parseInt(e.target.value))}
									/>
								</div>
								
								<div className="space-y-2">
									<Label htmlFor="validity-period">Validity Period (days)</Label>
									<Input
										id="validity-period"
										type="number"
										min="1"
										value={certificateSettings.validityPeriod}
										onChange={(e) => updateSettings('validityPeriod', parseInt(e.target.value))}
									/>
								</div>
							</div>
						</TabsContent>
						
						{/* Layout Tab */}
						<TabsContent value="layout" className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="width">Width (px)</Label>
									<Input
										id="width"
										type="number"
										value={certificateSettings.layout.width}
										onChange={(e) => updateSettings('layout.width', parseInt(e.target.value))}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="height">Height (px)</Label>
									<Input
										id="height"
										type="number"
										value={certificateSettings.layout.height}
										onChange={(e) => updateSettings('layout.height', parseInt(e.target.value))}
									/>
								</div>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="orientation">Orientation</Label>
								<Select
									value={certificateSettings.layout.orientation}
									onValueChange={(value) => updateSettings('layout.orientation', value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="landscape">Landscape</SelectItem>
										<SelectItem value="portrait">Portrait</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</TabsContent>
					</Tabs>
					
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowSettings(false)}>
							Cancel
						</Button>
						<Button onClick={saveCertificateSettings} disabled={loading}>
							{loading ? "Saving..." : "Save Settings"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Preview Dialog */}
			<Dialog open={showPreview} onOpenChange={setShowPreview}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Certificate Preview</DialogTitle>
						<DialogDescription>
							This is how your certificate will look
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-center">
						{renderPreview()}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowPreview(false)}>
							Close
						</Button>
						<Button onClick={() => setShowPreview(false)}>
							Looks Good
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default CertificateManager;
