import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
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
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	User,
	Settings,
	Bell,
	Shield,
	Palette,
	Globe,
	Key,
	Download,
	Trash2,
	Save,
	Eye,
	EyeOff,
	Camera,
	Mail,
	Phone,
	MapPin,
	Building,
	Calendar,
	Clock,
	Moon,
	Sun,
	Monitor,
} from "lucide-react";
import {
	getUserProfile,
	updateUserProfile,
	changePassword,
	getNotificationPreferences,
	updateNotificationPreferences,
	updateLanguagePreference,
	exportUserData,
} from "@/api/settings";

export function SettingsPage() {
	const { user, updateUser } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [profileData, setProfileData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		jobTitle: "",
		department: "",
		location: "",
		bio: "",
	});
	const [notifications, setNotifications] = useState({
		emailNotifications: true,
		courseReminders: true,
		certificateAlerts: true,
		teamUpdates: false,
		marketing: false,
	});
	const [preferences, setPreferences] = useState({
		language: "en",
		timezone: "UTC",
		theme: "system",
		autoSave: true,
		compactView: false,
	});

	useEffect(() => {
		loadUserSettings();
	}, []);

	const loadUserSettings = async () => {
		try {
			setLoading(true);

			// Fetch user profile and preferences
			const [profileResponse, notificationResponse] = await Promise.all([
				getUserProfile(),
				getNotificationPreferences(),
			]);

			// Update profile data
			if (profileResponse.user) {
				const userData = profileResponse.user;
				setProfileData({
					firstName: userData.firstName || userData.name?.split(" ")[0] || "",
					lastName: userData.lastName || userData.name?.split(" ")[1] || "",
					email: userData.email || "",
					phone: userData.phone || "",
					jobTitle: userData.jobTitle || userData.role || "",
					department: userData.department?.name || "",
					location: userData.location || "",
					bio: userData.bio || "",
				});
			}

			// Update notification preferences
			if (notificationResponse.preferences) {
				setNotifications({
					emailNotifications:
						notificationResponse.preferences.email_notifications !== false,
					courseReminders:
						notificationResponse.preferences.course_reminders !== false,
					certificateAlerts:
						notificationResponse.preferences.certificate_alerts !== false,
					teamUpdates: notificationResponse.preferences.team_updates || false,
					marketing: notificationResponse.preferences.marketing || false,
				});
			}
		} catch (error) {
			console.error("Error loading user settings:", error);
			// Fall back to user context data if API fails
			if (user) {
				setProfileData({
					firstName: user.firstName || "",
					lastName: user.lastName || "",
					email: user.email || "",
					phone: user.phone || "",
					jobTitle: user.jobTitle || "",
					department: user.department || "",
					location: user.location || "",
					bio: user.bio || "",
				});
			}
		} finally {
			setLoading(false);
		}
	};

	const handleProfileUpdate = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updateUserProfile(profileData);
			await updateUser(profileData); // Update context as well
			alert("Profile updated successfully!");
		} catch (error) {
			console.error("Error updating profile:", error);
			alert("Failed to update profile. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleNotificationUpdate = async (key, value) => {
		setNotifications((prev) => ({ ...prev, [key]: value }));
		try {
			await updateNotificationPreferences({ [key]: value });
		} catch (error) {
			console.error("Error updating notifications:", error);
			// Revert the change on error
			setNotifications((prev) => ({ ...prev, [key]: !value }));
		}
		console.log("Notification preferences updated:", { [key]: value });
	};

	const handlePreferenceUpdate = async (key, value) => {
		setPreferences((prev) => ({ ...prev, [key]: value }));
		// TODO: Implement API call to update user preferences
		console.log("Preference updated:", { [key]: value });
	};

	const handlePasswordChange = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const currentPassword = formData.get("currentPassword");
		const newPassword = formData.get("newPassword");
		const confirmPassword = formData.get("confirmPassword");

		if (newPassword !== confirmPassword) {
			alert("New passwords do not match");
			return;
		}

		setLoading(true);
		try {
			await changePassword(currentPassword, newPassword);
			alert("Password changed successfully!");
			e.target.reset();
		} catch (error) {
			console.error("Error changing password:", error);
			alert(
				"Failed to change password. Please check your current password and try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (
			window.confirm(
				"Are you sure you want to delete your account? This action cannot be undone."
			)
		) {
			// TODO: Implement account deletion API
			console.log("Account deletion requested");
		}
	};

	const handleExportData = () => {
		// TODO: Implement data export functionality
		console.log("Data export requested");
	};

	const getInitials = () => {
		if (profileData.firstName && profileData.lastName) {
			return `${profileData.firstName[0]}${profileData.lastName[0]}`;
		}
		if (profileData.email) {
			return profileData.email[0].toUpperCase();
		}
		return "U";
	};

	return (
		<DashboardLayout>
			<div className='space-y-6 animate-fade-in'>
				{/* Header Section */}
				<div className='bg-gray-900 rounded-xl p-6 text-white'>
					<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
						<div className='flex items-center gap-4'>
							<Avatar className='w-16 h-16 bg-white text-gray-900 text-xl font-bold'>
								{getInitials()}
							</Avatar>
							<div>
								<h1 className='text-2xl lg:text-3xl font-bold mb-1'>
									Settings
								</h1>
								<p className='text-gray-300'>
									Manage your account and preferences
								</p>
							</div>
						</div>
						<div className='flex items-center gap-4'>
							<div className='bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center'>
								<Badge variant='secondary' className='bg-white/20 text-white'>
									{user?.role}
								</Badge>
							</div>
							<Settings className='w-12 h-12 text-gray-400 hidden lg:block' />
						</div>
					</div>
				</div>

				{/* Settings Tabs */}
				<Tabs defaultValue='profile' className='space-y-6'>
					<TabsList className='grid w-full grid-cols-2 lg:grid-cols-5'>
						<TabsTrigger value='profile' className='flex items-center gap-2'>
							<User className='w-4 h-4' />
							<span className='hidden sm:inline'>Profile</span>
						</TabsTrigger>
						<TabsTrigger value='security' className='flex items-center gap-2'>
							<Shield className='w-4 h-4' />
							<span className='hidden sm:inline'>Security</span>
						</TabsTrigger>
						<TabsTrigger
							value='notifications'
							className='flex items-center gap-2'>
							<Bell className='w-4 h-4' />
							<span className='hidden sm:inline'>Notifications</span>
						</TabsTrigger>
						<TabsTrigger
							value='preferences'
							className='flex items-center gap-2'>
							<Palette className='w-4 h-4' />
							<span className='hidden sm:inline'>Preferences</span>
						</TabsTrigger>
						<TabsTrigger value='privacy' className='flex items-center gap-2'>
							<Key className='w-4 h-4' />
							<span className='hidden sm:inline'>Privacy</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value='profile' className='space-y-6'>
						<Card className='bg-white border-0 shadow-sm'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<User className='w-5 h-5' />
									Profile Information
								</CardTitle>
								<CardDescription>
									Update your personal information and profile details
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleProfileUpdate} className='space-y-6'>
									{/* Profile Photo */}
									<div className='flex items-center gap-4'>
										<Avatar className='w-20 h-20 bg-gray-100 text-gray-900 text-2xl font-bold'>
											{getInitials()}
										</Avatar>
										<div>
											<Button
												variant='outline'
												size='sm'
												type='button'
												className='border-gray-300 hover:bg-gray-50'>
												<Camera className='w-4 h-4 mr-2' />
												Change Photo
											</Button>
											<p className='text-xs text-gray-500 mt-2'>
												JPG, GIF or PNG. Max size of 2MB.
											</p>
										</div>
									</div>

									<Separator />

									{/* Basic Information */}
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor='firstName'>First Name</Label>
											<Input
												id='firstName'
												value={profileData.firstName}
												onChange={(e) =>
													setProfileData((prev) => ({
														...prev,
														firstName: e.target.value,
													}))
												}
												placeholder='Enter your first name'
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='lastName'>Last Name</Label>
											<Input
												id='lastName'
												value={profileData.lastName}
												onChange={(e) =>
													setProfileData((prev) => ({
														...prev,
														lastName: e.target.value,
													}))
												}
												placeholder='Enter your last name'
											/>
										</div>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='email'>Email Address</Label>
										<Input
											id='email'
											type='email'
											value={profileData.email}
											onChange={(e) =>
												setProfileData((prev) => ({
													...prev,
													email: e.target.value,
												}))
											}
											placeholder='Enter your email address'
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='phone'>Phone Number</Label>
										<Input
											id='phone'
											value={profileData.phone}
											onChange={(e) =>
												setProfileData((prev) => ({
													...prev,
													phone: e.target.value,
												}))
											}
											placeholder='Enter your phone number'
										/>
									</div>

									{/* Work Information */}
									<Separator />

									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor='jobTitle'>Job Title</Label>
											<Input
												id='jobTitle'
												value={profileData.jobTitle}
												onChange={(e) =>
													setProfileData((prev) => ({
														...prev,
														jobTitle: e.target.value,
													}))
												}
												placeholder='Enter your job title'
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='department'>Department</Label>
											<Select
												value={profileData.department}
												onValueChange={(value) =>
													setProfileData((prev) => ({
														...prev,
														department: value,
													}))
												}>
												<SelectTrigger>
													<SelectValue placeholder='Select department' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='engineering'>
														Engineering
													</SelectItem>
													<SelectItem value='product'>Product</SelectItem>
													<SelectItem value='design'>Design</SelectItem>
													<SelectItem value='marketing'>Marketing</SelectItem>
													<SelectItem value='sales'>Sales</SelectItem>
													<SelectItem value='legal'>Legal</SelectItem>
													<SelectItem value='hr'>Human Resources</SelectItem>
													<SelectItem value='operations'>Operations</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='location'>Location</Label>
										<Input
											id='location'
											value={profileData.location}
											onChange={(e) =>
												setProfileData((prev) => ({
													...prev,
													location: e.target.value,
												}))
											}
											placeholder='Enter your location'
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='bio'>Bio</Label>
										<textarea
											id='bio'
											rows={3}
											className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
											value={profileData.bio}
											onChange={(e) =>
												setProfileData((prev) => ({
													...prev,
													bio: e.target.value,
												}))
											}
											placeholder='Tell us about yourself...'
										/>
									</div>

									<Button
										type='submit'
										disabled={loading}
										className='w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800'>
										<Save className='w-4 h-4 mr-2' />
										{loading ? "Saving..." : "Save Changes"}
									</Button>
								</form>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='security' className='space-y-6'>
						<Card className='bg-white border-0 shadow-sm'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Shield className='w-5 h-5' />
									Password & Security
								</CardTitle>
								<CardDescription>
									Manage your password and security settings
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handlePasswordChange} className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='currentPassword'>Current Password</Label>
										<div className='relative'>
											<Input
												id='currentPassword'
												name='currentPassword'
												type={showPassword ? "text" : "password"}
												placeholder='Enter current password'
												required
											/>
											<Button
												type='button'
												variant='ghost'
												size='sm'
												className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0'
												onClick={() => setShowPassword(!showPassword)}>
												{showPassword ? (
													<EyeOff className='w-4 h-4' />
												) : (
													<Eye className='w-4 h-4' />
												)}
											</Button>
										</div>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='newPassword'>New Password</Label>
										<Input
											id='newPassword'
											name='newPassword'
											type='password'
											placeholder='Enter new password'
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='confirmPassword'>
											Confirm New Password
										</Label>
										<Input
											id='confirmPassword'
											name='confirmPassword'
											type='password'
											placeholder='Confirm new password'
											required
										/>
									</div>

									<Button
										type='submit'
										disabled={loading}
										className='bg-gray-900 text-white hover:bg-gray-800'>
										<Key className='w-4 h-4 mr-2' />
										{loading ? "Updating..." : "Update Password"}
									</Button>
								</form>
							</CardContent>
						</Card>

						{/* Two-Factor Authentication */}
						<Card className='bg-white border-0 shadow-sm'>
							<CardHeader>
								<CardTitle>Two-Factor Authentication</CardTitle>
								<CardDescription>
									Add an extra layer of security to your account
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='flex items-center justify-between'>
									<div>
										<p className='font-medium'>Two-Factor Authentication</p>
										<p className='text-sm text-gray-600'>Not enabled</p>
									</div>
									<Button
										variant='outline'
										className='border-gray-300 hover:bg-gray-50'>
										Enable 2FA
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='notifications' className='space-y-6'>
						<Card className='bg-white border-0 shadow-sm'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Bell className='w-5 h-5' />
									Notification Preferences
								</CardTitle>
								<CardDescription>
									Choose what notifications you want to receive
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								{Object.entries({
									emailNotifications: {
										label: "Email Notifications",
										description: "Receive notifications via email",
									},
									courseReminders: {
										label: "Course Reminders",
										description: "Reminders for upcoming lessons and deadlines",
									},
									certificateAlerts: {
										label: "Certificate Alerts",
										description: "Notifications when you earn certificates",
									},
									teamUpdates: {
										label: "Team Updates",
										description: "Updates about your team's progress",
									},
									marketing: {
										label: "Marketing Communications",
										description: "Product updates and promotional content",
									},
								}).map(([key, { label, description }]) => (
									<div
										key={key}
										className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
										<div>
											<p className='font-medium'>{label}</p>
											<p className='text-sm text-gray-600'>{description}</p>
										</div>
										<Button
											variant={notifications[key] ? "default" : "outline"}
											size='sm'
											onClick={() =>
												handleNotificationUpdate(key, !notifications[key])
											}
											className={
												notifications[key]
													? "bg-gray-900 text-white hover:bg-gray-800"
													: "border-gray-300 hover:bg-gray-50"
											}>
											{notifications[key] ? "On" : "Off"}
										</Button>
									</div>
								))}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='preferences' className='space-y-6'>
						<Card className='bg-white border-0 shadow-sm'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Palette className='w-5 h-5' />
									Display & Preferences
								</CardTitle>
								<CardDescription>
									Customize your learning experience
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								{/* Theme Selection */}
								<div className='space-y-2'>
									<Label>Theme</Label>
									<div className='flex gap-2'>
										<Button
											variant={theme === "light" ? "default" : "outline"}
											size='sm'
											onClick={() => toggleTheme("light")}
											className={`flex items-center gap-2 ${
												theme === "light"
													? "bg-gray-900 text-white hover:bg-gray-800"
													: "border-gray-300 hover:bg-gray-50"
											}`}>
											<Sun className='w-4 h-4' />
											Light
										</Button>
										<Button
											variant={theme === "dark" ? "default" : "outline"}
											size='sm'
											onClick={() => toggleTheme("dark")}
											className={`flex items-center gap-2 ${
												theme === "dark"
													? "bg-gray-900 text-white hover:bg-gray-800"
													: "border-gray-300 hover:bg-gray-50"
											}`}>
											<Moon className='w-4 h-4' />
											Dark
										</Button>
										<Button
											variant={theme === "system" ? "default" : "outline"}
											size='sm'
											onClick={() => toggleTheme("system")}
											className={`flex items-center gap-2 ${
												theme === "system"
													? "bg-gray-900 text-white hover:bg-gray-800"
													: "border-gray-300 hover:bg-gray-50"
											}`}>
											<Monitor className='w-4 h-4' />
											System
										</Button>
									</div>
								</div>

								<Separator />

								{/* Language Selection */}
								<div className='space-y-2'>
									<Label>Language</Label>
									<Select
										value={preferences.language}
										onValueChange={(value) =>
											handlePreferenceUpdate("language", value)
										}>
										<SelectTrigger className='w-48'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='en'>English</SelectItem>
											<SelectItem value='es'>Español</SelectItem>
											<SelectItem value='fr'>Français</SelectItem>
											<SelectItem value='de'>Deutsch</SelectItem>
											<SelectItem value='it'>Italiano</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Timezone Selection */}
								<div className='space-y-2'>
									<Label>Timezone</Label>
									<Select
										value={preferences.timezone}
										onValueChange={(value) =>
											handlePreferenceUpdate("timezone", value)
										}>
										<SelectTrigger className='w-64'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='UTC'>UTC (GMT+0)</SelectItem>
											<SelectItem value='EST'>Eastern Time (GMT-5)</SelectItem>
											<SelectItem value='PST'>Pacific Time (GMT-8)</SelectItem>
											<SelectItem value='CET'>
												Central European (GMT+1)
											</SelectItem>
											<SelectItem value='JST'>Japan Time (GMT+9)</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<Separator />

								{/* Other Preferences */}
								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='font-medium'>Auto-save Progress</p>
											<p className='text-sm text-gray-600'>
												Automatically save your progress as you learn
											</p>
										</div>
										<Button
											variant={preferences.autoSave ? "default" : "outline"}
											size='sm'
											onClick={() =>
												handlePreferenceUpdate(
													"autoSave",
													!preferences.autoSave
												)
											}
											className={
												preferences.autoSave
													? "bg-gray-900 text-white hover:bg-gray-800"
													: "border-gray-300 hover:bg-gray-50"
											}>
											{preferences.autoSave ? "On" : "Off"}
										</Button>
									</div>

									<div className='flex items-center justify-between'>
										<div>
											<p className='font-medium'>Compact View</p>
											<p className='text-sm text-gray-600'>
												Use a more compact layout for better information density
											</p>
										</div>
										<Button
											variant={preferences.compactView ? "default" : "outline"}
											size='sm'
											onClick={() =>
												handlePreferenceUpdate(
													"compactView",
													!preferences.compactView
												)
											}
											className={
												preferences.compactView
													? "bg-gray-900 text-white hover:bg-gray-800"
													: "border-gray-300 hover:bg-gray-50"
											}>
											{preferences.compactView ? "On" : "Off"}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='privacy' className='space-y-6'>
						<Card className='bg-white border-0 shadow-sm'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Key className='w-5 h-5' />
									Privacy & Data
								</CardTitle>
								<CardDescription>
									Manage your privacy settings and data
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								{/* Data Export */}
								<div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
									<div>
										<p className='font-medium'>Export Your Data</p>
										<p className='text-sm text-gray-600'>
											Download a copy of all your learning data and progress
										</p>
									</div>
									<Button
										variant='outline'
										onClick={handleExportData}
										className='border-gray-300 hover:bg-gray-50'>
										<Download className='w-4 h-4 mr-2' />
										Export Data
									</Button>
								</div>

								<Separator />

								{/* Account Deletion */}
								<div className='p-4 border border-gray-200 rounded-lg bg-gray-50'>
									<h3 className='font-semibold text-gray-800 mb-2'>
										Danger Zone
									</h3>
									<p className='text-sm text-gray-600 mb-4'>
										Once you delete your account, there is no going back. Please
										be certain.
									</p>
									<Button
										variant='destructive'
										onClick={handleDeleteAccount}
										className='bg-gray-900 text-white hover:bg-gray-800'>
										<Trash2 className='w-4 h-4 mr-2' />
										Delete Account
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</DashboardLayout>
	);
}
