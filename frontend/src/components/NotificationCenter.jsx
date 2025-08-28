import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, BookOpen, Calendar, Award, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call
      // const response = await fetch('/api/notifications', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockNotifications = [
        {
          id: 1,
          type: 'course_update',
          title: 'New Module Available',
          message: 'Module 5: Advanced Compliance has been added to EU AI Act Fundamentals',
          icon: BookOpen,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          actionUrl: '/courses/1'
        },
        {
          id: 2,
          type: 'deadline',
          title: 'Assignment Due Tomorrow',
          message: 'Risk Assessment Quiz is due in 24 hours',
          icon: Calendar,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          actionUrl: '/courses/2'
        },
        {
          id: 3,
          type: 'achievement',
          title: 'Certificate Earned!',
          message: 'Congratulations! You\'ve earned a certificate for AI Act Fundamentals',
          icon: Award,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          actionUrl: '/certificates'
        },
        {
          id: 4,
          type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled maintenance on Sunday, 2 AM - 4 AM EST',
          icon: Settings,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          read: true,
          actionUrl: null
        },
        {
          id: 5,
          type: 'announcement',
          title: 'New Team Member',
          message: 'Sarah Johnson has joined your learning team',
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          read: true,
          actionUrl: '/team'
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // API call to mark as read
      // await fetch(`/api/notifications/${notificationId}/read`, {
      //   method: 'PUT',
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // API call to mark all as read
      // await fetch('/api/notifications/read-all', {
      //   method: 'PUT',
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      // API call to clear notifications
      // await fetch('/api/notifications/clear', {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const getIcon = (IconComponent, color, bgColor) => {
    return (
      <div className={cn("p-2 rounded-full dark:opacity-80", bgColor)}>
        <IconComponent className={cn("h-4 w-4", color)} />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 dark:bg-red-600 text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
            
            {unreadCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-auto p-0 text-blue-600"
                >
                  Mark all as read
                </Button>
              </div>
            )}
          </div>

          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="course_update">Courses</TabsTrigger>
              <TabsTrigger value="deadline">Deadlines</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-0">
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                    <Bell className="h-12 w-12 mb-2 opacity-20 text-gray-400 dark:text-gray-500" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors",
                          !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          {getIcon(notification.icon, notification.color, notification.bgColor)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={cn(
                                  "text-sm font-medium text-gray-900 dark:text-gray-100",
                                  !notification.read && "font-semibold"
                                )}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 ml-2"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {filteredNotifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="w-full"
                  >
                    Clear all notifications
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}