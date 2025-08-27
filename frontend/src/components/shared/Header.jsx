import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, BookOpen, Users, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">E-Learning Platform</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-4">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              
              {user?.role === 'participant' && (
                <Button
                  variant={isActive('/courses') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/courses')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Courses
                </Button>
              )}
              
              {['manager', 'admin', 'super_admin'].includes(user?.role) && (
                <Button
                  variant={isActive('/team') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/team')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Team Progress
                </Button>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span className="font-medium">{user?.name}</span>
                <span className="text-muted-foreground">({user?.role})</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}