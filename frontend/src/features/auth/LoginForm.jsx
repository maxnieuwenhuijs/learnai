import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  // Quick login helper for testing
  const quickLogin = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="space-y-1 px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">
          Welcome to E-Learning Platform
        </CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">
          Sign in to access your courses and track your progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Quick Login Options for Testing */}
        <div className="mt-6 space-y-2">
          <p className="text-sm text-muted-foreground text-center">Quick Login (for testing):</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => quickLogin('participant@test.com', 'password123')}
            >
              Participant
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => quickLogin('manager@test.com', 'password123')}
            >
              Manager
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => quickLogin('admin@test.com', 'password123')}
            >
              Admin
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          EU AI Act Compliance Training Platform
        </div>
      </CardFooter>
    </Card>
  );
}