import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Award, 
  Download, 
  Share2, 
  Eye, 
  Calendar,
  Trophy,
  FileText,
  CheckCircle,
  Clock,
  Search,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getUserCertificates, downloadCertificatePDF } from '@/api/certificates';

export function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await getUserCertificates();
      
      // Transform the API response to match our component's expected format
      const transformedCertificates = response.certificates?.map(cert => ({
        id: cert.id,
        courseTitle: cert.course?.title || 'Unknown Course',
        courseDescription: cert.course?.description || '',
        courseDuration: cert.course?.duration || 'N/A',
        issuedAt: cert.issuedAt,
        certificateUid: cert.certificateUid,
        verificationCode: cert.verificationCode,
        score: cert.finalScore || 85, // Default score if not provided
        validUntil: cert.validUntil,
        status: cert.status || 'active',
        completionTime: cert.completionTime,
        downloadUrl: `/api/certificates/${cert.id}/download`
      })) || [];
      
      setCertificates(transformedCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
      // If API fails, show empty state instead of crashing
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate) => {
    try {
      await downloadCertificatePDF(certificate.id);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const handleShare = async (certificate) => {
    // Copy certificate URL to clipboard for sharing
    const shareUrl = `${window.location.origin}/certificates/verify/${certificate.certificateUid}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Certificate link copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  const handleView = (certificate) => {
    // Open certificate in new tab for viewing
    window.open(`/certificates/view/${certificate.certificateUid}`, '_blank');
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificateUid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">My Certificates</h1>
              <p className="text-blue-100">Your achievements and certifications for EU AI Act compliance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{certificates.length}</div>
                <div className="text-sm text-blue-100">Total Certificates</div>
              </div>
              <Trophy className="w-16 h-16 text-yellow-300 hidden lg:block" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {certificates.filter(c => c.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {certificates.length > 0 
                      ? Math.round(certificates.reduce((sum, c) => sum + c.score, 0) / certificates.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>

        {/* Certificates List */}
        {filteredCertificates.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No certificates found' : 'No certificates yet'}
              </h4>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Complete courses to earn your first certificate'}
              </p>
              {!searchTerm && (
                <Button onClick={() => window.location.href = '/courses'}>
                  Browse Courses
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCertificates.map((certificate) => (
              <Card key={certificate.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{certificate.courseTitle}</CardTitle>
                        <CardDescription className="mt-1">
                          Certificate ID: {certificate.certificateUid}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getScoreColor(certificate.score)}>
                      {certificate.score}%
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Certificate Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Issued: {formatDate(certificate.issuedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {certificate.courseDuration}</span>
                      </div>
                    </div>

                    {/* Additional Details */}
                    {certificate.completionTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Completion Time: {certificate.completionTime} minutes</span>
                      </div>
                    )}

                    {/* Valid Until */}
                    {certificate.validUntil && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Valid until: {formatDate(certificate.validUntil)}</span>
                      </div>
                    )}

                    {/* Verification Code */}
                    {certificate.verificationCode && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>Code: {certificate.verificationCode}</span>
                      </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleView(certificate)}
                        className="flex-1 min-w-0"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(certificate)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(certificate)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}