import { LoginForm } from '@/features/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}