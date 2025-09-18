import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";
import {
	LayoutDashboard,
	BookOpen,
	Users,
	BarChart3,
	Settings,
	LogOut,
	Menu,
	X,
	Bell,
	Search,
	ChevronDown,
	GraduationCap,
	Award,
	Calendar,
	HelpCircle,
	User,
	Sun,
	Moon,
	MessageSquare,
	Building,
	Database,
	Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function DashboardLayout({ children }) {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { user, logout } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const { checkUnsavedChanges } = useUnsavedChanges();
	const location = useLocation();
	const navigate = useNavigate();

	const handleLogout = () => {
		checkUnsavedChanges(() => {
			logout();
			navigate("/login");
		});
	};

	const navigationItems = [
		{
			title: "Dashboard",
			icon: LayoutDashboard,
			path: "/dashboard",
			roles: ["participant", "manager", "admin"],
		},
		// Super Admin Only
		{
			title: "Platform Admin",
			icon: Shield,
			path: "/admin/super-admin",
			roles: ["super_admin"],
		},
		{
			title: "Companies",
			icon: Building,
			path: "/admin/super-admin/companies",
			roles: ["super_admin"],
		},
		{
			title: "Global Courses",
			icon: Database,
			path: "/admin/courses",
			roles: ["super_admin"],
		},
		{
			title: "Global Prompt Library",
			icon: MessageSquare,
			path: "/admin/super-admin/prompts",
			roles: ["super_admin"],
		},
		{
			title: "User Management",
			icon: Users,
			path: "/admin/super-admin/users",
			roles: ["super_admin"],
		},
		{
			title: "Platform Analytics",
			icon: BarChart3,
			path: "/admin/super-admin/analytics",
			roles: ["super_admin"],
		},
		// Regular navigation
		{
			title: "Prompts",
			icon: MessageSquare,
			path: "/prompts",
			roles: ["participant", "manager", "admin"],
		},
		{
			title: "My Courses",
			icon: BookOpen,
			path: "/courses",
			roles: ["participant", "manager", "admin"],
		},
		{
			title: "Certificates",
			icon: Award,
			path: "/certificates",
			roles: ["participant", "manager", "admin"],
		},
		{
			title: "Calendar",
			icon: Calendar,
			path: "/calendar",
			roles: ["participant", "manager", "admin"],
		},
		{
			title: "Team",
			icon: Users,
			path: "/team",
			roles: ["manager", "admin"],
		},
		{
			title: "Reports",
			icon: BarChart3,
			path: "/reports",
			roles: ["manager", "admin"],
		},
		{
			title: "Settings",
			icon: Settings,
			path: "/settings",
			roles: ["participant", "manager", "admin"],
		},
	];

	const filteredNavItems = navigationItems.filter((item) =>
		item.roles.includes(user?.role)
	);

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			{/* Sidebar */}
			<aside
				className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-apple ${
					sidebarOpen ? "w-64" : "w-20"
				} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden lg:block`}>
				{/* Logo */}
				<div className='flex items-center justify-between h-16 px-6 border-b border-gray-100 dark:border-gray-700'>
					<div
						className='flex items-center gap-3 group cursor-pointer'
						onClick={() =>
							checkUnsavedChanges(() =>
								navigate(
									user?.role === "super_admin"
										? "/admin/super-admin"
										: "/dashboard"
								)
							)
						}>
						<div className='w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center transition-all duration-200 ease-apple group-hover:scale-105 group-active:scale-95 shadow-sm'>
							<GraduationCap className='w-6 h-6 text-white dark:text-gray-900 transition-transform group-hover:rotate-12' />
						</div>
						{sidebarOpen && (
							<div className='transition-all duration-200 ease-apple'>
								<span className='text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight'>
									HowToWorkWith.AI
								</span>
								<div className='text-xs text-gray-500 dark:text-gray-400 -mt-1'>
									E-Learning Platform
								</div>
							</div>
						)}
					</div>
					<button
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className='p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-apple active:scale-98 lg:block hidden'>
						<Menu className='w-5 h-5 text-gray-500 dark:text-gray-400' />
					</button>
				</div>

				{/* Navigation */}
				<nav className='p-4 space-y-1'>
					{filteredNavItems.map((item) => {
						const Icon = item.icon;
						const isActive = location.pathname === item.path;
						return (
							<div
								key={item.path}
								onClick={() => checkUnsavedChanges(() => navigate(item.path))}
								className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ease-apple group active:scale-[0.98] cursor-pointer ${
									isActive
										? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
										: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
								}`}>
								<Icon
									className={`w-5 h-5 ${
										isActive
											? "text-white dark:text-gray-900"
											: "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
									}`}
								/>
								{sidebarOpen && (
									<span
										className={`font-medium text-sm ${
											isActive ? "text-white dark:text-gray-900" : ""
										}`}>
										{item.title}
									</span>
								)}
								{!sidebarOpen && (
									<div className='absolute left-full ml-6 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg'>
										{item.title}
									</div>
								)}
							</div>
						);
					})}
				</nav>

				{/* Help Section */}
				{sidebarOpen && (
					<div className='absolute bottom-4 left-4 right-4'>
						<div className='bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
							<HelpCircle className='w-6 h-6 mb-2 text-gray-500 dark:text-gray-400' />
							<h4 className='font-semibold mb-1 text-gray-900 dark:text-gray-100'>
								Need Help?
							</h4>
							<p className='text-xs text-gray-600 dark:text-gray-400 mb-3'>
								Check our documentation or contact support
							</p>
							<Button size='sm' variant='secondary' className='w-full'>
								Get Help
							</Button>
						</div>
					</div>
				)}
			</aside>

			{/* Mobile Sidebar Overlay */}
			{mobileMenuOpen && (
				<div
					className='fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden'
					onClick={() => setMobileMenuOpen(false)}
				/>
			)}

			{/* Mobile Sidebar */}
			<aside
				className={`fixed left-0 top-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:hidden ${
					mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				}`}>
				<div className='flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700'>
					<div
						className='flex items-center gap-3 group cursor-pointer'
						onClick={() => checkUnsavedChanges(() => navigate("/dashboard"))}>
						<div className='w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center transition-all duration-200 ease-apple group-hover:scale-105 group-active:scale-95 shadow-sm'>
							<GraduationCap className='w-6 h-6 text-white dark:text-gray-900 transition-transform group-hover:rotate-12' />
						</div>
						<div className='transition-all duration-200 ease-apple'>
							<span className='text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight'>
								HowToWorkWith.AI
							</span>
							<div className='text-xs text-gray-500 dark:text-gray-400 -mt-1'>
								E-Learning Platform
							</div>
						</div>
					</div>
					<button
						onClick={() => setMobileMenuOpen(false)}
						className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
						<X className='w-5 h-5 text-gray-500 dark:text-gray-400' />
					</button>
				</div>
				<nav className='p-4 space-y-1'>
					{filteredNavItems.map((item) => {
						const Icon = item.icon;
						const isActive = location.pathname === item.path;
						return (
							<div
								key={item.path}
								onClick={() =>
									checkUnsavedChanges(() => {
										navigate(item.path);
										setMobileMenuOpen(false);
									})
								}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
									isActive
										? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
										: "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
								}`}>
								<Icon
									className={`w-5 h-5 ${
										isActive
											? "text-indigo-600 dark:text-indigo-400"
											: "text-gray-400 dark:text-gray-500"
									}`}
								/>
								<span
									className={`font-medium ${
										isActive ? "text-indigo-600 dark:text-indigo-400" : ""
									}`}>
									{item.title}
								</span>
							</div>
						);
					})}
				</nav>
			</aside>

			{/* Main Content */}
			<div
				className={`transition-all duration-300 ${
					sidebarOpen ? "lg:ml-64" : "lg:ml-20"
				}`}>
				{/* Top Header */}
				<header className='sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800'>
					<div className='flex items-center justify-between h-16 px-4 sm:px-6'>
						{/* Mobile menu button */}
						<button
							onClick={() => setMobileMenuOpen(true)}
							className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ease-apple active:scale-[0.98] lg:hidden'>
							<Menu className='w-5 h-5 text-gray-600 dark:text-gray-400' />
						</button>

						{/* Search Bar - Hidden on mobile, shown on desktop */}
						<div className='hidden sm:block flex-1 max-w-xl mx-4'>
							<div className='relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5' />
								<Input
									type='search'
									placeholder='Search courses, lessons...'
									className='pl-10 pr-4 py-2.5 w-full bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 ease-apple focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-opacity-20'
								/>
							</div>
						</div>

						{/* Mobile Search Button */}
						<Button variant='ghost' size='icon' className='sm:hidden'>
							<Search className='w-5 h-5 text-gray-600 dark:text-gray-400' />
						</Button>

						{/* Right Section */}
						<div className='flex items-center gap-1 sm:gap-3'>
							{/* Theme Toggle */}
							<Button variant='ghost' size='icon' onClick={toggleTheme}>
								{theme === "light" ? (
									<Moon className='w-5 h-5 text-gray-600 dark:text-gray-400' />
								) : (
									<Sun className='w-5 h-5 text-gray-600 dark:text-gray-400' />
								)}
							</Button>

							{/* Notifications - Hidden on mobile */}
							<Button
								variant='ghost'
								size='icon'
								className='relative hidden sm:flex'>
								<Bell className='w-5 h-5 text-gray-600 dark:text-gray-400' />
								<span className='absolute top-1 right-1 w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full'></span>
							</Button>

							{/* User Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='ghost'
										className='flex items-center gap-2 px-2'>
										<Avatar className='w-8 h-8'>
											<AvatarImage src={user?.profilePictureUrl} />
											<AvatarFallback className='bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'>
												{user?.name?.charAt(0)?.toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
										<div className='hidden sm:block text-left'>
											<p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
												{user?.name}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
												{user?.role}
											</p>
										</div>
										<ChevronDown className='w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end' className='w-56'>
									<DropdownMenuLabel>My Account</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<User className='mr-2 h-4 w-4' />
										Profile
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Settings className='mr-2 h-4 w-4' />
										Settings
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogout}
										className='text-red-600'>
										<LogOut className='mr-2 h-4 w-4' />
										Log out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className='p-4 sm:p-6 lg:p-8 animate-fade-in'>{children}</main>
			</div>
		</div>
	);
}
