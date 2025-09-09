import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Bell,
  BookOpen,
  Target,
  Users,
  Video
} from 'lucide-react';
import { getUpcomingEvents, getCourseDeadlines, getScheduledSessions } from '@/api/calendar';

export function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      // Fetch calendar data from API
      const [eventsResponse, deadlinesResponse, sessionsResponse] = await Promise.all([
        getUpcomingEvents(),
        getCourseDeadlines(),
        getScheduledSessions()
      ]);
      
      // Combine and transform all events
      const allEvents = [
        ...(eventsResponse.events || []).map(event => ({
          id: event.id,
          title: event.title,
          type: event.type || 'event',
          date: event.date,
          courseTitle: event.course?.title || '',
          description: event.description,
          priority: event.priority || 'medium'
        })),
        ...(deadlinesResponse.deadlines || []).map(deadline => ({
          id: `deadline-${deadline.id}`,
          title: `${deadline.course_title} - Due`,
          type: 'deadline',
          date: deadline.due_date,
          courseTitle: deadline.course_title,
          description: deadline.description || 'Course deadline',
          priority: 'high'
        })),
        ...(sessionsResponse.sessions || []).map(session => ({
          id: `session-${session.id}`,
          title: session.title,
          type: 'meeting',
          date: session.scheduled_at,
          courseTitle: session.course?.title || '',
          description: session.description,
          priority: 'medium'
        }))
      ];
      
      // Sort events by date
      allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Get upcoming deadlines (next 7 days)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return event.type === 'deadline' && eventDate >= now && eventDate <= nextWeek;
      });
      
      setEvents(allEvents);
      setUpcomingDeadlines(upcomingDeadlines);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      // Start completely empty
      setEvents([]);
      setUpcomingDeadlines([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'deadline': return AlertCircle;
      case 'meeting': return Users;
      case 'exam': return Target;
      case 'announcement': return Bell;
      default: return CalendarIcon;
    }
  };

  const getEventColor = (type, priority) => {
    if (priority === 'high') return 'border-l-red-500 bg-red-50';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-50';
    if (type === 'deadline') return 'border-l-orange-500 bg-orange-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="default">Medium</Badge>;
      case 'low': return <Badge variant="secondary">Low</Badge>;
      default: return null;
    }
  };

  const getDaysLeftColor = (daysLeft) => {
    if (daysLeft <= 1) return 'text-red-600 bg-red-100';
    if (daysLeft <= 3) return 'text-orange-600 bg-orange-100';
    if (daysLeft <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="space-y-4">
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-32 w-64 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Learning Calendar</h1>
              <p className="text-purple-100">Track your course schedules, deadlines, and progress</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{upcomingDeadlines.length}</div>
                <div className="text-sm text-purple-100">Upcoming</div>
              </div>
              <CalendarIcon className="w-16 h-16 text-purple-200 hidden lg:block" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {upcomingDeadlines.filter(d => d.daysLeft <= 3).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {upcomingDeadlines.filter(d => d.daysLeft <= 7).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>

          <TabsContent value="upcoming" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>
                  Your scheduled activities and important dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No upcoming events scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => {
                      const IconComponent = getEventIcon(event.type);
                      return (
                        <div
                          key={event.id}
                          className={`border-l-4 p-4 rounded-lg transition-colors hover:shadow-sm ${getEventColor(event.type, event.priority)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mt-1">
                                <IconComponent className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                  {getPriorityBadge(event.priority)}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    {formatDate(event.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(event.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {event.courseTitle}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    {monthName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Calendar View Coming Soon</p>
                  <p className="text-sm text-gray-400">
                    Interactive calendar with event visualization will be available in the next update
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>
                  Course assignments, quizzes, and certification deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No upcoming deadlines</p>
                    <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Target className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{deadline.title}</h3>
                              <p className="text-sm text-gray-600">{deadline.courseTitle}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDaysLeftColor(deadline.daysLeft)}`}>
                            {deadline.daysLeft <= 1 ? 'Due today' : `${deadline.daysLeft} days left`}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Due: {formatDate(deadline.dueDate)} at {formatTime(deadline.dueDate)}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {deadline.type}
                            </Badge>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}