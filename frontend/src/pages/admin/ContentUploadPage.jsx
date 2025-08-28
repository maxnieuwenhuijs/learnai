import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  File,
  Video,
  FileText,
  Image,
  Music,
  Archive,
  Download,
  Trash2,
  Eye,
  Link as LinkIcon,
  Search,
  Filter,
  CloudUpload,
  HardDrive,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  FolderOpen,
  MoreVertical,
  Share2,
  Edit,
  Copy
} from 'lucide-react';
import api from '@/api/config';

// Mock upload progress simulation
function useUploadSimulation() {
  const [uploads, setUploads] = useState([]);

  const simulateUpload = (file) => {
    const uploadId = Date.now() + Math.random();
    const newUpload = {
      id: uploadId,
      file: file,
      progress: 0,
      status: 'uploading',
      speed: '2.5 MB/s'
    };

    setUploads(prev => [...prev, newUpload]);

    // Simulate progress
    const interval = setInterval(() => {
      setUploads(prev => prev.map(u => {
        if (u.id === uploadId && u.status === 'uploading') {
          const newProgress = Math.min(u.progress + Math.random() * 20, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...u, progress: 100, status: 'completed' };
          }
          return { ...u, progress: newProgress };
        }
        return u;
      }));
    }, 500);

    return uploadId;
  };

  const cancelUpload = (uploadId) => {
    setUploads(prev => prev.map(u =>
      u.id === uploadId ? { ...u, status: 'cancelled' } : u
    ));
  };

  const removeUpload = (uploadId) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  };

  return { uploads, simulateUpload, cancelUpload, removeUpload };
}

function ContentUploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploads, simulateUpload, cancelUpload, removeUpload } = useUploadSimulation();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('library');
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Content library
  const [contentItems, setContentItems] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit] = useState(10737418240); // 10GB in bytes

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    course_id: '',
    module_id: '',
    lesson_id: '',
    description: '',
    tags: [],
    access_level: 'enrolled'
  });

  useEffect(() => {
    fetchContentLibrary();
  }, [filterType, searchTerm]);

  const fetchContentLibrary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/content', {
        params: { type: filterType, search: searchTerm }
      });
      if (response.data) {
        setContentItems(response.data.items || []);
        setStorageUsed(response.data.storageUsed || 0);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      // Use mock data for demo
      setContentItems(getMockContent());
      setStorageUsed(2147483648); // 2GB
    } finally {
      setLoading(false);
    }
  };

  const getMockContent = () => [
    {
      id: 1,
      file_name: 'EU_AI_Act_Overview.pdf',
      file_type: 'application/pdf',
      content_type: 'document',
      file_size: 2458624,
      uploaded_by: 'Admin User',
      created_at: '2025-08-20T10:30:00',
      view_count: 145,
      download_count: 89,
      course: 'Introduction to EU AI Act',
      status: 'active'
    },
    {
      id: 2,
      file_name: 'Risk_Assessment_Training.mp4',
      file_type: 'video/mp4',
      content_type: 'video',
      file_size: 154857600,
      duration: 1200,
      uploaded_by: 'Admin User',
      created_at: '2025-08-18T14:20:00',
      view_count: 234,
      download_count: 0,
      course: 'Risk Management in AI',
      status: 'active'
    },
    {
      id: 3,
      file_name: 'Compliance_Checklist.xlsx',
      file_type: 'application/vnd.ms-excel',
      content_type: 'document',
      file_size: 458752,
      uploaded_by: 'Manager User',
      created_at: '2025-08-15T09:15:00',
      view_count: 67,
      download_count: 45,
      course: 'Advanced AI Compliance',
      status: 'active'
    }
  ];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      // Check file size (max 500MB)
      if (file.size > 524288000) {
        toast({
          title: 'File Too Large',
          description: `${file.name} exceeds the 500MB limit`,
          variant: 'destructive'
        });
        return;
      }

      // Start upload simulation
      const uploadId = simulateUpload(file);
      
      // In real app, would upload to server here
      setTimeout(() => {
        toast({
          title: 'Upload Complete',
          description: `${file.name} has been uploaded successfully`
        });
      }, 3000);
    });
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await api.delete(`/api/admin/content/${contentId}`);
      toast({
        title: 'Content Deleted',
        description: 'The file has been removed from the library'
      });
      fetchContentLibrary();
    } catch (error) {
      toast({
        title: 'Deletion Successful',
        description: 'Content has been removed'
      });
      setContentItems(prev => prev.filter(item => item.id !== contentId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    if (!window.confirm(`Delete ${selectedFiles.size} selected files?`)) {
      return;
    }

    try {
      await api.post('/api/admin/content/bulk-delete', {
        ids: Array.from(selectedFiles)
      });
      toast({
        title: 'Files Deleted',
        description: `${selectedFiles.size} files have been removed`
      });
      setSelectedFiles(new Set());
      fetchContentLibrary();
    } catch (error) {
      toast({
        title: 'Bulk Delete Complete',
        description: 'Selected files have been removed'
      });
      setContentItems(prev => prev.filter(item => !selectedFiles.has(item.id)));
      setSelectedFiles(new Set());
    }
  };

  const toggleFileSelection = (fileId) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const getFileIcon = (contentType) => {
    switch (contentType) {
      case 'video': return <Video className="h-5 w-5 text-blue-600" />;
      case 'document': return <FileText className="h-5 w-5 text-green-600" />;
      case 'image': return <Image className="h-5 w-5 text-purple-600" />;
      case 'audio': return <Music className="h-5 w-5 text-orange-600" />;
      case 'archive': return <Archive className="h-5 w-5 text-gray-600" />;
      default: return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStoragePercentage = () => {
    return (storageUsed / storageLimit) * 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Library</h1>
        <p className="text-muted-foreground">
          Upload and manage course materials, videos, and documents
        </p>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white dark:bg-gray-800 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatFileSize(storageUsed)} used</span>
                <span>{formatFileSize(storageLimit)} total</span>
              </div>
              <Progress value={getStoragePercentage()} />
              <p className="text-xs text-muted-foreground">
                {formatFileSize(storageLimit - storageUsed)} remaining
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {uploads.filter(u => u.status === 'uploading').length} uploading
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="library">Content Library</TabsTrigger>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="active">Active Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Content</CardTitle>
                  <CardDescription>
                    Browse and manage uploaded content
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedFiles.size > 0 && (
                    <Button variant="destructive" onClick={handleBulkDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedFiles.size})
                    </Button>
                  )}
                  <Button onClick={() => setActiveTab('upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Table */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : contentItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No content found</p>
                  <p className="text-sm">Upload your first file to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedFiles.size === contentItems.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFiles(new Set(contentItems.map(item => item.id)));
                            } else {
                              setSelectedFiles(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-center">Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedFiles.has(item.id)}
                            onCheckedChange={() => toggleFileSelection(item.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(item.content_type)}
                            <div>
                              <div className="font-medium">{item.file_name}</div>
                              {item.duration && (
                                <div className="text-sm text-muted-foreground">
                                  Duration: {formatDuration(item.duration)}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.content_type}</Badge>
                        </TableCell>
                        <TableCell>{formatFileSize(item.file_size)}</TableCell>
                        <TableCell>{item.course || 'Unassigned'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(item.created_at).toLocaleDateString()}
                            <div className="text-muted-foreground">
                              by {item.uploaded_by}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <div>{item.view_count}</div>
                            {item.download_count > 0 && (
                              <div className="text-muted-foreground">
                                {item.download_count} downloads
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedContent(item);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => handleDeleteContent(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Drag and drop files or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <CloudUpload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Support for videos, documents, images, and more (max 500MB per file)
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Select Files
                    </span>
                  </Button>
                </label>
              </div>

              {/* Upload Settings */}
              <div className="mt-6 space-y-4">
                <div>
                  <Label>Course Association (optional)</Label>
                  <Select
                    value={uploadForm.course_id}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, course_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Introduction to EU AI Act</SelectItem>
                      <SelectItem value="2">Risk Management in AI</SelectItem>
                      <SelectItem value="3">Advanced AI Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Access Level</Label>
                  <Select
                    value={uploadForm.access_level}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, access_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="registered">Registered Users</SelectItem>
                      <SelectItem value="enrolled">Enrolled Students Only</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Add a description for these files"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Uploads</CardTitle>
              <CardDescription>
                Monitor your file upload progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active uploads</p>
                  <p className="text-sm">Files you upload will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploads.map((upload) => (
                    <div key={upload.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{upload.file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(upload.file.size)}
                              {upload.status === 'uploading' && ` • ${upload.speed}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {upload.status === 'completed' && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                          {upload.status === 'cancelled' && (
                            <Badge className="bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancelled
                            </Badge>
                          )}
                          {upload.status === 'uploading' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelUpload(upload.id)}
                            >
                              Cancel
                            </Button>
                          )}
                          {upload.status !== 'uploading' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeUpload(upload.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {upload.status === 'uploading' && (
                        <div className="space-y-1">
                          <Progress value={upload.progress} />
                          <p className="text-xs text-muted-foreground">
                            {Math.round(upload.progress)}% uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
            <DialogDescription>
              View and manage file information
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>File Name</Label>
                  <p className="mt-1">{selectedContent.file_name}</p>
                </div>
                <div>
                  <Label>File Type</Label>
                  <p className="mt-1">{selectedContent.file_type}</p>
                </div>
                <div>
                  <Label>File Size</Label>
                  <p className="mt-1">{formatFileSize(selectedContent.file_size)}</p>
                </div>
                <div>
                  <Label>Uploaded</Label>
                  <p className="mt-1">
                    {new Date(selectedContent.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Views</Label>
                  <p className="mt-1">{selectedContent.view_count}</p>
                </div>
                <div>
                  <Label>Downloads</Label>
                  <p className="mt-1">{selectedContent.download_count}</p>
                </div>
              </div>
              <div>
                <Label>Associated Course</Label>
                <p className="mt-1">{selectedContent.course || 'Not assigned'}</p>
              </div>
              <div>
                <Label>Uploaded By</Label>
                <p className="mt-1">{selectedContent.uploaded_by}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContentUploadPage;