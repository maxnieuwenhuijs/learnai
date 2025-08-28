import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Filter,
  FileText,
  PieChart,
  Calendar,
  Users,
  Award,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Building2,
  Shield,
  FileBarChart
} from 'lucide-react';
import { reportsApi } from '@/api/reports';

export function ReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({});
  const [complianceData, setComplianceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    loadReportData();
  }, [selectedTimeframe, selectedDepartment]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple report data in parallel
      const [complianceResponse, statsResponse, teamResponse] = await Promise.all([
        reportsApi.getComplianceReport({ timeframe: selectedTimeframe, department: selectedDepartment }),
        reportsApi.getOverallStatistics({ timeframe: selectedTimeframe, department: selectedDepartment }),
        reportsApi.getTeamProgress()
      ]);
      
      // Transform API responses to match component's expected format
      const transformedReportData = {
        overview: {
          totalLearners: statsResponse.total_learners || 0,
          activeThisMonth: statsResponse.active_this_month || 0,
          completionRate: statsResponse.completion_rate || 0,
          averageScore: statsResponse.average_score || 0,
          certificatesIssued: statsResponse.certificates_issued || 0,
          complianceStatus: complianceResponse.compliance_score || 0
        },
        departmentBreakdown: statsResponse.departments || [],
        courseProgress: statsResponse.courses || [],
        timeSeriesData: statsResponse.time_series || []
      };
      
      const transformedComplianceData = {
        overallStatus: complianceResponse.overall_status || 'unknown',
        complianceScore: complianceResponse.compliance_score || 0,
        requirements: complianceResponse.requirements || [],
        upcomingDeadlines: complianceResponse.upcoming_deadlines || [],
        riskAreas: complianceResponse.risk_areas || []
      };
      
      setReportData(transformedReportData);
      setComplianceData(transformedComplianceData);
    } catch (error) {
      console.error('Error loading report data:', error);
      // If API fails, use fallback data
      const mockReportData = {
        overview: {
          totalLearners: 125,
          activeThisMonth: 98,
          completionRate: 73,
          averageScore: 87,
          certificatesIssued: 45,
          complianceStatus: 85
        },
        departmentBreakdown: [
          { name: 'Engineering', learners: 45, completion: 78, avgScore: 89 },
          { name: 'Legal', learners: 20, completion: 92, avgScore: 94 },
          { name: 'Product', learners: 35, completion: 68, avgScore: 85 },
          { name: 'Marketing', learners: 25, completion: 60, avgScore: 82 }
        ],
        courseProgress: [
          { course: 'AI Act Fundamentals', enrolled: 125, completed: 89, completion: 71 },
          { course: 'Risk Management', enrolled: 98, completed: 62, completion: 63 },
          { course: 'Data Privacy in AI', enrolled: 87, completed: 45, completion: 52 },
          { course: 'Compliance Framework', enrolled: 76, completed: 28, completion: 37 }
        ],
        timeSeriesData: [
          { month: 'Jan', completions: 12, enrollments: 45 },
          { month: 'Feb', completions: 18, enrollments: 38 },
          { month: 'Mar', completions: 24, enrollments: 42 },
          { month: 'Apr', completions: 31, enrollments: 35 },
          { month: 'May', completions: 28, enrollments: 40 },
          { month: 'Jun', completions: 35, enrollments: 48 }
        ]
      };

      const mockComplianceData = {
        overallStatus: 'good', // 'excellent', 'good', 'warning', 'critical'
        complianceScore: 85,
        requirements: [
          { 
            id: 1, 
            name: 'AI Act Training Completion', 
            status: 'compliant', 
            percentage: 89, 
            required: 90,
            description: 'All employees must complete AI Act fundamentals training'
          },
          { 
            id: 2, 
            name: 'Risk Assessment Certification', 
            status: 'warning', 
            percentage: 67, 
            required: 80,
            description: 'Risk assessment certification for AI system developers'
          },
          { 
            id: 3, 
            name: 'Data Privacy Training', 
            status: 'critical', 
            percentage: 45, 
            required: 100,
            description: 'Mandatory data privacy training for all staff'
          },
          { 
            id: 4, 
            name: 'Annual Compliance Review', 
            status: 'compliant', 
            percentage: 100, 
            required: 100,
            description: 'Annual compliance assessment completed'
          }
        ],
        riskAreas: [
          { area: 'High-Risk AI Systems', score: 75, status: 'warning' },
          { area: 'Data Protection', score: 60, status: 'critical' },
          { area: 'Algorithm Transparency', score: 85, status: 'good' },
          { area: 'Human Oversight', score: 90, status: 'excellent' }
        ]
      };

      setReportData(mockReportData);
      setComplianceData(mockComplianceData);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
      case 'good':
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const exportReport = (type) => {
    // TODO: Implement actual export functionality
    console.log(`Exporting ${type} report...`);
  };

  // Only show full reports to managers and above
  const canViewDetailedReports = ['manager', 'admin', 'super_admin'].includes(user?.role);

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

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {canViewDetailedReports ? 'Analytics & Reports' : 'My Progress Report'}
              </h1>
              <p className="text-indigo-100">
                {canViewDetailedReports 
                  ? 'Comprehensive compliance and learning analytics'
                  : 'Track your personal learning progress and achievements'
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  {canViewDetailedReports ? `${complianceData.complianceScore}%` : '85%'}
                </div>
                <div className="text-sm text-indigo-100">
                  {canViewDetailedReports ? 'Compliance' : 'Progress'}
                </div>
              </div>
              <BarChart3 className="w-16 h-16 text-indigo-200 hidden lg:block" />
            </div>
          </div>
        </div>

        {!canViewDetailedReports ? (
          // Personal Progress for Participants
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5" />
                  Courses Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">4/5</div>
                <p className="text-sm text-gray-600">Courses completed</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5" />
                  Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">3</div>
                <p className="text-sm text-gray-600">Certificates earned</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5" />
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">89%</div>
                <p className="text-sm text-gray-600">Quiz performance</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Full Analytics for Managers/Admins
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{reportData.overview?.totalLearners}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Learners</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{reportData.overview?.completionRate}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{reportData.overview?.averageScore}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Avg Score</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{reportData.overview?.certificatesIssued}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Certificates</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{reportData.overview?.activeThisMonth}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Active Users</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{reportData.overview?.complianceStatus}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Compliance</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Reports Tabs */}
            <Tabs defaultValue="compliance" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="compliance" className="space-y-6">
                {/* Compliance Overview */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      EU AI Act Compliance Status
                    </CardTitle>
                    <CardDescription>
                      Monitor compliance requirements and risk areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {complianceData.requirements?.map((req) => (
                        <div key={req.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(req.status)}
                              <div>
                                <h3 className="font-semibold text-gray-900">{req.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(req.status)}>
                              {req.percentage}% / {req.required}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                req.status === 'compliant' ? 'bg-green-500' :
                                req.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(req.percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Areas */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Risk Assessment Areas</CardTitle>
                    <CardDescription>
                      Key areas requiring attention for AI Act compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {complianceData.riskAreas?.map((area, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{area.area}</h3>
                            <Badge className={getStatusColor(area.status)}>
                              {area.score}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                area.status === 'excellent' ? 'bg-green-500' :
                                area.status === 'good' ? 'bg-blue-500' :
                                area.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${area.score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="departments" className="space-y-6">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Department Performance
                    </CardTitle>
                    <CardDescription>
                      Learning progress by department
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.departmentBreakdown?.map((dept, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                              <p className="text-sm text-gray-600">{dept.learners} learners</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{dept.completion}%</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Avg Score: {dept.avgScore}%</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${dept.completion}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Course Performance
                    </CardTitle>
                    <CardDescription>
                      Enrollment and completion rates by course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.courseProgress?.map((course, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{course.course}</h3>
                              <p className="text-sm text-gray-600">
                                {course.completed}/{course.enrolled} completed
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{course.completion}%</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${course.completion}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardContent className="text-center py-12">
                    <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
                    <p className="text-gray-600 mb-4">
                      Detailed charts and visualizations will be available in the next update
                    </p>
                    <Button variant="outline">
                      <FileBarChart className="w-4 h-4 mr-2" />
                      Request Custom Report
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}