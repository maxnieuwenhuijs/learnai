import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
	TrendingUp,
	TrendingDown,
	Users,
	FileText,
	Star,
	Activity,
	Calendar,
	BarChart3,
	PieChart,
	Clock,
	ArrowUpRight,
	ArrowDownRight,
} from "lucide-react";
import analyticsApi from "../../api/analytics";
import { useAuth } from "../../contexts/AuthContext";

const PromptAnalytics = () => {
	const { user } = useAuth();
	const [analyticsData, setAnalyticsData] = useState(null);
	const [companyAnalytics, setCompanyAnalytics] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedPeriod, setSelectedPeriod] = useState("30d");
	const [selectedView, setSelectedView] = useState("overview");

	const periods = [
		{ value: "7d", label: "Laatste 7 dagen" },
		{ value: "30d", label: "Laatste 30 dagen" },
		{ value: "90d", label: "Laatste 90 dagen" },
		{ value: "1y", label: "Laatste jaar" },
	];

	useEffect(() => {
		loadAnalytics();
	}, [selectedPeriod]);

	const loadAnalytics = async () => {
		try {
			setLoading(true);

			// Always try to load prompt analytics
			const promptRes = await analyticsApi.getPromptAnalytics({
				period: selectedPeriod,
			});
			setAnalyticsData(promptRes.data.data);

			// Only try to load company analytics if user is super admin
			if (user.role === "super_admin") {
				try {
					const companyRes = await analyticsApi.getCompanyAnalytics({
						period: selectedPeriod,
					});
					setCompanyAnalytics(companyRes.data.data);
				} catch (companyError) {
					console.warn("Company analytics not available:", companyError);
					// Don't set company analytics if it fails
				}
			}
		} catch (error) {
			console.error("Error loading analytics:", error);
		} finally {
			setLoading(false);
		}
	};

	const formatNumber = (num) => {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
		if (num >= 1000) return (num / 1000).toFixed(1) + "K";
		return num.toString();
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("nl-NL", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const formatDateShort = (dateString) => {
		return new Date(dateString).toLocaleDateString("nl-NL", {
			day: "2-digit",
			month: "2-digit",
		});
	};

	const getGrowthIcon = (growth) => {
		if (growth > 0) return <ArrowUpRight className='w-4 h-4 text-green-500' />;
		if (growth < 0) return <ArrowDownRight className='w-4 h-4 text-red-500' />;
		return <Activity className='w-4 h-4 text-gray-500' />;
	};

	const getGrowthColor = (growth) => {
		if (growth > 0) return "text-green-600";
		if (growth < 0) return "text-red-600";
		return "text-gray-600";
	};

	if (loading) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<div className='h-8 bg-gray-200 rounded w-48 animate-pulse'></div>
					<div className='h-10 bg-gray-200 rounded w-32 animate-pulse'></div>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					{[...Array(4)].map((_, i) => (
						<Card key={i} className='animate-pulse'>
							<CardContent className='p-6'>
								<div className='h-4 bg-gray-200 rounded w-24 mb-2'></div>
								<div className='h-8 bg-gray-200 rounded w-16'></div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (!analyticsData) {
		return (
			<div className='text-center py-12'>
				<BarChart3 className='mx-auto h-12 w-12 text-gray-400 mb-4' />
				<h3 className='text-lg font-medium text-gray-900 mb-2'>
					Geen data beschikbaar
				</h3>
				<p className='text-gray-500'>
					Er zijn nog geen analytics data beschikbaar voor de geselecteerde
					periode.
				</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-2xl font-bold text-gray-900'>Prompt Analytics</h2>
					<p className='text-gray-600'>
						Inzichten in prompt gebruik en prestaties
					</p>
				</div>
				<div className='flex items-center gap-4'>
					<Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
						<SelectTrigger className='w-40'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{periods.map((period) => (
								<SelectItem key={period.value} value={period.value}>
									{period.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant='outline'
						onClick={loadAnalytics}
						className='flex items-center gap-2'>
						<Activity className='w-4 h-4' />
						Ververs
					</Button>
				</div>
			</div>

			{/* Overview Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<Card>
					<CardContent className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>
									Totaal Prompts
								</p>
								<p className='text-2xl font-bold text-gray-900'>
									{formatNumber(analyticsData.overview.totalPrompts)}
								</p>
							</div>
							<div className='p-3 bg-blue-100 rounded-full'>
								<FileText className='w-6 h-6 text-blue-600' />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>
									Totaal Gebruik
								</p>
								<p className='text-2xl font-bold text-gray-900'>
									{formatNumber(analyticsData.overview.totalUsage)}
								</p>
								<div className='flex items-center gap-1 mt-1'>
									{getGrowthIcon(analyticsData.overview.usageGrowth)}
									<span
										className={`text-sm font-medium ${getGrowthColor(
											analyticsData.overview.usageGrowth
										)}`}>
										{analyticsData.overview.usageGrowth > 0 ? "+" : ""}
										{analyticsData.overview.usageGrowth.toFixed(1)}%
									</span>
								</div>
							</div>
							<div className='p-3 bg-green-100 rounded-full'>
								<TrendingUp className='w-6 h-6 text-green-600' />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>
									Actieve Gebruikers
								</p>
								<p className='text-2xl font-bold text-gray-900'>
									{formatNumber(analyticsData.overview.uniqueUsers)}
								</p>
							</div>
							<div className='p-3 bg-purple-100 rounded-full'>
								<Users className='w-6 h-6 text-purple-600' />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-600'>Templates</p>
								<p className='text-2xl font-bold text-gray-900'>
									{formatNumber(analyticsData.overview.totalTemplates)}
								</p>
							</div>
							<div className='p-3 bg-orange-100 rounded-full'>
								<Star className='w-6 h-6 text-orange-600' />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts Section */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Daily Usage Chart */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<BarChart3 className='w-5 h-5' />
							Dagelijks Gebruik
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='h-64 relative'>
							{analyticsData.charts.dailyUsage.length > 0 ? (
								<div className='h-full flex items-end gap-1 px-2'>
									{analyticsData.charts.dailyUsage.map((day, index) => {
										const maxUsage = Math.max(
											...analyticsData.charts.dailyUsage.map((d) => d.usage)
										);
										const height =
											maxUsage > 0 ? (day.usage / maxUsage) * 200 : 2;
										const isToday =
											new Date(day.date).toDateString() ===
											new Date().toDateString();

										return (
											<div
												key={index}
												className='flex-1 flex flex-col items-center group relative'>
												<div
													className={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
														isToday ? "bg-blue-600" : "bg-blue-500"
													}`}
													style={{ height: `${Math.max(height, 2)}px` }}
													title={`${formatDateShort(day.date)}: ${
														day.usage
													} gebruik`}></div>
												{/* Tooltip */}
												<div className='absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10'>
													{formatDateShort(day.date)}: {day.usage} gebruik
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className='h-full flex items-center justify-center text-gray-500'>
									<div className='text-center'>
										<BarChart3 className='w-12 h-12 mx-auto mb-2 opacity-50' />
										<p className='text-sm'>Geen data beschikbaar</p>
									</div>
								</div>
							)}
							{/* Y-axis labels */}
							<div className='absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-8'>
								{analyticsData.charts.dailyUsage.length > 0 && (
									<>
										<span>
											{Math.max(
												...analyticsData.charts.dailyUsage.map((d) => d.usage)
											)}
										</span>
										<span>
											{Math.max(
												...analyticsData.charts.dailyUsage.map((d) => d.usage)
											) / 2}
										</span>
										<span>0</span>
									</>
								)}
							</div>
							{/* X-axis labels */}
							{analyticsData.charts.dailyUsage.length > 0 && (
								<div className='absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 mt-2 px-2'>
									{analyticsData.charts.dailyUsage
										.filter(
											(_, index) =>
												index %
													Math.ceil(
														analyticsData.charts.dailyUsage.length / 7
													) ===
												0
										)
										.map((day, index) => (
											<span key={index} className='text-center'>
												{formatDateShort(day.date)}
											</span>
										))}
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Category Usage Chart */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<PieChart className='w-5 h-5' />
							Gebruik per Categorie
						</CardTitle>
					</CardHeader>
					<CardContent>
						{analyticsData.charts.categoryUsage.length > 0 ? (
							<div className='space-y-4'>
								{/* Visual bar chart for categories */}
								<div className='space-y-3'>
									{analyticsData.charts.categoryUsage.map((category, index) => {
										const total = analyticsData.charts.categoryUsage.reduce(
											(sum, c) => sum + c.count,
											0
										);
										const percentage =
											total > 0 ? (category.count / total) * 100 : 0;
										const barWidth = Math.max(percentage, 2); // Minimum 2% width for visibility

										return (
											<div key={index} className='space-y-2'>
												<div className='flex items-center justify-between'>
													<div className='flex items-center gap-3'>
														<div
															className='w-4 h-4 rounded-full shadow-sm'
															style={{ backgroundColor: category.color }}></div>
														<span className='text-sm font-medium text-gray-900'>
															{category.name}
														</span>
													</div>
													<div className='flex items-center gap-2'>
														<span className='text-sm font-semibold text-gray-900'>
															{category.count}
														</span>
														<span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
															{percentage.toFixed(1)}%
														</span>
													</div>
												</div>
												{/* Progress bar */}
												<div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
													<div
														className='h-full rounded-full transition-all duration-500 ease-out'
														style={{
															width: `${barWidth}%`,
															backgroundColor: category.color,
															opacity: 0.8,
														}}></div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						) : (
							<div className='h-32 flex items-center justify-center text-gray-500'>
								<div className='text-center'>
									<PieChart className='w-12 h-12 mx-auto mb-2 opacity-50' />
									<p className='text-sm'>Geen categorie data beschikbaar</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Top Prompts and Users */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Top Prompts */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<TrendingUp className='w-5 h-5' />
							Meest Gebruikte Prompts
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{analyticsData.topPrompts.map((item, index) => (
								<div
									key={index}
									className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
									<div className='flex items-center gap-3'>
										<div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
											<span className='text-sm font-bold text-blue-600'>
												#{index + 1}
											</span>
										</div>
										<div>
											<p className='font-medium text-gray-900'>
												{item.prompt.title}
											</p>
											<p className='text-sm text-gray-500'>
												{item.prompt.PromptCategory?.name || "Geen categorie"}
											</p>
										</div>
									</div>
									<Badge
										variant='secondary'
										className='bg-blue-100 text-blue-700'>
										{item.count} gebruik
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Top Users */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Users className='w-5 h-5' />
							Meest Actieve Gebruikers
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{analyticsData.topUsers.map((item, index) => (
								<div
									key={index}
									className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
									<div className='flex items-center gap-3'>
										<div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
											<span className='text-sm font-bold text-green-600'>
												#{index + 1}
											</span>
										</div>
										<div>
											<p className='font-medium text-gray-900'>
												{item.user.name}
											</p>
											<p className='text-sm text-gray-500'>{item.user.email}</p>
										</div>
									</div>
									<Badge
										variant='secondary'
										className='bg-green-100 text-green-700'>
										{item.count} gebruik
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Clock className='w-5 h-5' />
						Recente Activiteit
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-3'>
						{analyticsData.recentActivity.map((activity, index) => (
							<div
								key={index}
								className='flex items-center justify-between p-3 border rounded-lg'>
								<div className='flex items-center gap-3'>
									<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
									<div>
										<p className='font-medium text-gray-900'>
											{activity.user_name}
										</p>
										<p className='text-sm text-gray-500'>
											gebruikte "{activity.prompt_title}"
										</p>
									</div>
								</div>
								<div className='text-right'>
									<p className='text-sm text-gray-500'>
										{formatDate(activity.used_at)}
									</p>
									{activity.context && (
										<Badge variant='outline' className='text-xs'>
											{activity.context}
										</Badge>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Company Analytics */}
			{user.role === "super_admin" && companyAnalytics && (
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<BarChart3 className='w-5 h-5' />
							Bedrijfs Analytics
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							<h4 className='font-medium text-gray-900'>Gebruik per Bedrijf</h4>
							<div className='space-y-3'>
								{companyAnalytics.companyUsage.map((item, index) => (
									<div
										key={index}
										className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
										<div>
											<p className='font-medium text-gray-900'>
												{item.company.name}
											</p>
											<p className='text-sm text-gray-500'>
												{item.company.Departments?.length || 0} afdelingen
											</p>
										</div>
										<Badge
											variant='secondary'
											className='bg-blue-100 text-blue-700'>
											{item.usage} gebruik
										</Badge>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default PromptAnalytics;
