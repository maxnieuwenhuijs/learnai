import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Download, 
  Share2, 
  CheckCircle, 
  Clock, 
  Star,
  ExternalLink,
  Copy
} from 'lucide-react';
import { downloadCertificatePDF } from '@/api/certificates';
import { useToast } from '@/hooks/use-toast';

export function CertificateSuccessModal({ 
  isOpen, 
  onClose, 
  certificate, 
  courseTitle,
  onViewCertificates 
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!certificate) return;
    
    setIsDownloading(true);
    try {
      await downloadCertificatePDF(certificate.id);
      toast({
        title: "Certificate Downloaded",
        description: "Your certificate has been downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!certificate?.verificationCode) return;
    
    const shareUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${courseTitle}`,
          text: `I completed the course "${courseTitle}" and earned a certificate!`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Certificate verification link copied to clipboard!",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const handleCopyVerificationCode = async () => {
    if (!certificate?.verificationCode) return;
    
    try {
      await navigator.clipboard.writeText(certificate.verificationCode);
      toast({
        title: "Code Copied",
        description: "Verification code copied to clipboard!",
      });
    } catch (error) {
      console.error('Error copying verification code:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!certificate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8" />
            Gefeliciteerd!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Message */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Je hebt een certificaat verdiend!</h3>
            <p className="text-muted-foreground">
              Je hebt de cursus <strong>"{courseTitle}"</strong> succesvol afgerond.
            </p>
          </div>

          {/* Certificate Details Card */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">Certificaat Details</h4>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Actief
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Uitgegeven:</span>
                      <span>{formatDate(certificate.issuedAt)}</span>
                    </div>
                    
                    {certificate.completionTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Voltooiingstijd:</span>
                        <span>{formatTime(certificate.completionTime)}</span>
                      </div>
                    )}

                    {certificate.finalScore && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Eindscore:</span>
                        <span className="font-semibold text-green-600">{certificate.finalScore}%</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {certificate.validUntil && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Geldig tot:</span>
                        <span>{formatDate(certificate.validUntil)}</span>
                      </div>
                    )}

                    {certificate.verificationCode && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Verificatiecode:</span>
                        <div className="flex items-center gap-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                            {certificate.verificationCode}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyVerificationCode}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download Certificaat'}
            </Button>

            <Button 
              variant="outline"
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Deel Certificaat
            </Button>

            <Button 
              variant="outline"
              onClick={onViewCertificates}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Bekijk Alle Certificaten
            </Button>
          </div>

          {/* Verification Link */}
          {certificate.verificationCode && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Verifieer dit certificaat online:
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {window.location.origin}/certificates/verify/{certificate.verificationCode}
              </code>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
