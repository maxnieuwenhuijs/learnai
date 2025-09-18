import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getApiBaseUrl } from "@/utils/urlUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle, Chrome, Mail, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		const result = await login(email, password);

		if (result.success) {
			navigate("/dashboard");
		} else {
			setError(result.error || "Login failed");
		}

		setIsLoading(false);
	};

	// Quick login helper for testing
	const quickLogin = (testEmail, testPassword) => {
		setEmail(testEmail);
		setPassword(testPassword);
	};

	// OAuth login handlers
	const handleGoogleLogin = () => {
		window.location.href = `${getApiBaseUrl()}/auth/google`;
	};

	const handleMicrosoftLogin = () => {
		window.location.href = `${getApiBaseUrl()}/auth/microsoft`;
	};

	return (
		<Card className='w-full border-0 shadow-lg'>
			<CardHeader className='space-y-1 px-4 sm:px-6'>
				<CardTitle className='text-xl sm:text-2xl font-bold text-center'>
					Welcome to E-Learning Platform
				</CardTitle>
				<CardDescription className='text-center text-sm sm:text-base'>
					Sign in to access your courses and track your progress
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='email'>Email</Label>
						<Input
							id='email'
							type='email'
							placeholder='Enter your email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isLoading}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='password'>Password</Label>
						<div className='relative'>
							<Input
								id='password'
								type={showPassword ? "text" : "password"}
								placeholder='Enter your password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoading}
								className='pr-10'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								disabled={isLoading}
								className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none'>
								{showPassword ? (
									<EyeOff className='h-4 w-4' />
								) : (
									<Eye className='h-4 w-4' />
								)}
							</button>
						</div>
					</div>

					{error && (
						<div className='flex items-center gap-2 text-sm text-destructive'>
							<AlertCircle className='h-4 w-4' />
							<span>{error}</span>
						</div>
					)}

					<Button type='submit' className='w-full' disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Signing in...
							</>
						) : (
							"Sign In"
						)}
					</Button>
				</form>

				{/* OAuth Login Options */}
				<div className='mt-6 space-y-3'>
					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<span className='w-full border-t' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-white px-2 text-muted-foreground'>
								Or continue with
							</span>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<Button
							type='button'
							variant='outline'
							onClick={handleGoogleLogin}
							disabled={isLoading}>
							<Chrome className='mr-2 h-4 w-4' />
							Google
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={handleMicrosoftLogin}
							disabled={isLoading}>
							<Mail className='mr-2 h-4 w-4' />
							Microsoft
						</Button>
					</div>
				</div>

				{/* Quick Login Options */}
				<div className='mt-6 space-y-3'>
					<div className='text-center'>
						<span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
							Quick Login (Development)
						</span>
					</div>

					{/* Test User */}
					<div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700'>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() => quickLogin("testuser@testcorp.com", "testuser123")}
							className='w-full border-blue-300 text-blue-700 hover:bg-blue-100'>
							👤 Test User (Participant)
						</Button>
						<p className='text-xs text-blue-600 dark:text-blue-400 text-center mt-1'>
							Regular user - TestCorp company
						</p>
					</div>

					{/* Company Admin */}
					<div className='p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700'>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() => quickLogin("jh@ajax.nl", "password123")}
							className='w-full border-green-300 text-green-700 hover:bg-green-100'>
							👨‍💼 Company Admin (Admin)
						</Button>
						<p className='text-xs text-green-600 dark:text-green-400 text-center mt-1'>
							Company admin - TestCorp management
						</p>
					</div>

					{/* Super Admin */}
					<div className='p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700'>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() =>
								quickLogin("superadmin@platform.com", "SuperSecure123!")
							}
							className='w-full border-purple-300 text-purple-700 hover:bg-purple-100'>
							🎛️ Super Admin (Standalone)
						</Button>
						<p className='text-xs text-purple-600 dark:text-purple-400 text-center mt-1'>
							Platform admin - Full system access
						</p>
					</div>
				</div>
			</CardContent>
			<CardFooter className='flex flex-col space-y-2'>
				<div className='text-sm text-muted-foreground text-center'></div>
			</CardFooter>
		</Card>
	);
}
