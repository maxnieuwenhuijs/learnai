import { LoginForm } from '@/features/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}