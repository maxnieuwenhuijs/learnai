import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  Moon
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['participant', 'manager', 'admin']
    },
    {
      title: 'My Courses',
      icon: BookOpen,
      path: '/courses',
      roles: ['participant', 'manager', 'admin']
    },
    {
      title: 'Certificates',
      icon: Award,
      path: '/certificates',
      roles: ['participant', 'manager', 'admin']
    },
    {
      title: 'Calendar',
      icon: Calendar,
      path: '/calendar',
      roles: ['participant', 'manager', 'admin']
    },
    {
      title: 'Team',
      icon: Users,
      path: '/team',
      roles: ['manager', 'admin']
    },
    {
      title: 'Reports',
      icon: BarChart3,
      path: '/reports',
      roles: ['manager', 'admin']
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      roles: ['participant', 'manager', 'admin']
    }
  ];

  const filteredNavItems = navigationItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border hidden lg:block`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-gray-900">EduLearn</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:block hidden"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {sidebarOpen && (
                  <span className={`font-medium ${isActive ? 'text-indigo-600' : ''}`}>
                    {item.title}
                  </span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-sm rounded-md invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Help Section */}
        {sidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
              <HelpCircle className="w-6 h-6 mb-2" />
              <h4 className="font-semibold mb-1">Need Help?</h4>
              <p className="text-xs opacity-90 mb-3">
                Check our documentation or contact support
              </p>
              <Button size="sm" variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-gray-100">
                Get Help
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EduLearn</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${isActive ? 'text-indigo-600' : ''}`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Search Bar - Hidden on mobile, shown on desktop */}
            <div className="hidden sm:block flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="search"
                  placeholder="Search courses, lessons..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>

            {/* Mobile Search Button */}
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Search className="w-5 h-5 text-gray-600" />
            </Button>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600" />
                )}
              </Button>

              {/* Notifications - Hidden on mobile */}
              <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profilePictureUrl} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}