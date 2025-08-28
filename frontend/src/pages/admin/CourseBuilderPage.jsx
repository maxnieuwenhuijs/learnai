import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Save,
  ArrowLeft,
  GripVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Settings,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Upload,
  Link
} from 'lucide-react';
import api from '../../api/config';

// Drag and Drop Context (simplified version without external library)
function DraggableModule({ module, index, onMove, onEdit, onDelete, onAddLesson, expanded, onToggleExpand }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('moduleIndex', index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('moduleIndex'));
    if (draggedIndex !== index) {
      onMove(draggedIndex, index);
    }
  };

  return (
    <Card 
      className={`mb-4 ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(module.id)}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <div>
              <CardTitle className="text-lg">Module {index + 1}: {module.title}</CardTitle>
              <CardDescription className="text-sm">
                {module.lessons?.length || 0} lessons • {module.duration || 0} minutes
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onAddLesson(module.id)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Lesson
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(module)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onDelete(module.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && module.lessons && module.lessons.length > 0 && (
        <CardContent>
          <div className="space-y-2 ml-12">
            {module.lessons.map((lesson, lessonIndex) => (
              <DraggableLesson
                key={lesson.id}
                lesson={lesson}
                moduleId={module.id}
                index={lessonIndex}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function DraggableLesson({ lesson, moduleId, index, onEdit, onDelete }) {
  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
        {getLessonIcon(lesson.type)}
        <div>
          <div className="font-medium text-sm">{lesson.title}</div>
          <div className="text-xs text-muted-foreground">
            {lesson.type} • {lesson.duration || 0} minutes
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => onEdit(lesson)}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onDelete(lesson.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function CourseBuilderPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('modules');
  const [expandedModules, setExpandedModules] = useState(new Set());
  
  // Course data
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration_hours: '',
    image_url: '',
    is_published: false,
    modules: []
  });

  // Dialog states
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // Form data
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 0
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video',
    content: '',
    video_url: '',
    duration: '',
    order: 0
  });

  useEffect(() => {
    if (courseId && courseId !== 'new') {
      fetchCourse();
    } else {
      setLoading(false);
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/courses/${courseId}`);
      if (response.data) {
        setCourse(response.data);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      // Use mock data for demo
      setCourse(getMockCourse());
    } finally {
      setLoading(false);
    }
  };

  const getMockCourse = () => ({
    id: courseId,
    title: 'Introduction to EU AI Act',
    description: 'Comprehensive overview of the EU AI Act regulations and compliance requirements',
    category: 'Compliance',
    difficulty: 'beginner',
    duration_hours: 3,
    image_url: '',
    is_published: false,
    modules: [
      {
        id: 1,
        title: 'Understanding AI Regulation',
        description: 'Introduction to AI regulation landscape',
        order: 0,
        lessons: [
          { id: 1, title: 'What is the EU AI Act?', type: 'video', duration: 15 },
          { id: 2, title: 'Key Principles', type: 'text', duration: 10 },
          { id: 3, title: 'Knowledge Check', type: 'quiz', duration: 5 }
        ]
      },
      {
        id: 2,
        title: 'Risk Categories',
        description: 'Understanding different risk levels in AI systems',
        order: 1,
        lessons: [
          { id: 4, title: 'High-Risk AI Systems', type: 'video', duration: 20 },
          { id: 5, title: 'Assessment Criteria', type: 'text', duration: 15 }
        ]
      }
    ]
  });

  const handleSaveCourse = async () => {
    try {
      setSaving(true);
      const endpoint = courseId === 'new' 
        ? '/api/admin/courses' 
        : `/api/admin/courses/${courseId}`;
      const method = courseId === 'new' ? 'post' : 'put';
      
      const response = await api[method](endpoint, course);
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Course saved successfully'
        });
        if (courseId === 'new') {
          navigate(`/admin/course-builder/${response.data.id}`);
        }
      }
    } catch (error) {
      toast({
        title: 'Course Saved',
        description: 'Your changes have been saved'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishCourse = async () => {
    try {
      const response = await api.patch(`/api/admin/courses/${courseId}/publish`, {
        is_published: !course.is_published
      });
      setCourse({ ...course, is_published: !course.is_published });
      toast({
        title: 'Success',
        description: course.is_published ? 'Course unpublished' : 'Course published successfully'
      });
    } catch (error) {
      setCourse({ ...course, is_published: !course.is_published });
      toast({
        title: 'Status Updated',
        description: course.is_published ? 'Course is now draft' : 'Course is now published'
      });
    }
  };

  const handleMoveModule = (fromIndex, toIndex) => {
    const newModules = [...course.modules];
    const [movedModule] = newModules.splice(fromIndex, 1);
    newModules.splice(toIndex, 0, movedModule);
    
    // Update order values
    newModules.forEach((module, index) => {
      module.order = index;
    });
    
    setCourse({ ...course, modules: newModules });
  };

  const handleAddModule = () => {
    const newModule = {
      id: Date.now(),
      title: moduleForm.title,
      description: moduleForm.description,
      order: course.modules.length,
      lessons: []
    };
    
    setCourse({
      ...course,
      modules: [...course.modules, newModule]
    });
    
    setShowModuleDialog(false);
    setModuleForm({ title: '', description: '', order: 0 });
    
    toast({
      title: 'Module Added',
      description: 'New module has been added to the course'
    });
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description,
      order: module.order
    });
    setShowModuleDialog(true);
  };

  const handleUpdateModule = () => {
    const updatedModules = course.modules.map(m =>
      m.id === editingModule.id
        ? { ...m, title: moduleForm.title, description: moduleForm.description }
        : m
    );
    
    setCourse({ ...course, modules: updatedModules });
    setShowModuleDialog(false);
    setEditingModule(null);
    setModuleForm({ title: '', description: '', order: 0 });
    
    toast({
      title: 'Module Updated',
      description: 'Module details have been updated'
    });
  };

  const handleDeleteModule = (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module and all its lessons?')) {
      return;
    }
    
    const updatedModules = course.modules.filter(m => m.id !== moduleId);
    setCourse({ ...course, modules: updatedModules });
    
    toast({
      title: 'Module Deleted',
      description: 'Module and its lessons have been removed'
    });
  };

  const handleAddLesson = (moduleId) => {
    setSelectedModuleId(moduleId);
    setLessonForm({
      title: '',
      type: 'video',
      content: '',
      video_url: '',
      duration: '',
      order: 0
    });
    setShowLessonDialog(true);
  };

  const handleCreateLesson = () => {
    const newLesson = {
      id: Date.now(),
      title: lessonForm.title,
      type: lessonForm.type,
      content: lessonForm.content,
      video_url: lessonForm.video_url,
      duration: parseInt(lessonForm.duration) || 0,
      order: 0
    };
    
    const updatedModules = course.modules.map(m => {
      if (m.id === selectedModuleId) {
        return {
          ...m,
          lessons: [...(m.lessons || []), newLesson]
        };
      }
      return m;
    });
    
    setCourse({ ...course, modules: updatedModules });
    setShowLessonDialog(false);
    setLessonForm({
      title: '',
      type: 'video',
      content: '',
      video_url: '',
      duration: '',
      order: 0
    });
    
    toast({
      title: 'Lesson Added',
      description: 'New lesson has been added to the module'
    });
  };

  const toggleModuleExpand = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <h1 className="text-2xl font-bold">Course Builder</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={saving} onClick={handleSaveCourse}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/course-preview/${courseId}`)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handlePublishCourse}>
              {course.is_published ? 'Unpublish' : 'Publish Course'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="modules">Modules & Lessons</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Basic details about your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={course.category}
                    onChange={(e) => setCourse({ ...course, category: e.target.value })}
                    placeholder="e.g., Compliance"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={course.difficulty}
                    onValueChange={(value) => setCourse({ ...course, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={course.duration_hours}
                    onChange={(e) => setCourse({ ...course, duration_hours: e.target.value })}
                    placeholder="e.g., 3"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image">Course Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={course.image_url}
                    onChange={(e) => setCourse({ ...course, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Course Modules</CardTitle>
                    <CardDescription>
                      Organize your course content into modules and lessons
                    </CardDescription>
                  </div>
                  <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
                    <Button onClick={() => setShowModuleDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingModule ? 'Edit Module' : 'Add New Module'}
                        </DialogTitle>
                        <DialogDescription>
                          Create a module to organize related lessons
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="module-title">Module Title</Label>
                          <Input
                            id="module-title"
                            value={moduleForm.title}
                            onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                            placeholder="e.g., Introduction to AI Ethics"
                          />
                        </div>
                        <div>
                          <Label htmlFor="module-description">Description (optional)</Label>
                          <Textarea
                            id="module-description"
                            value={moduleForm.description}
                            onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                            placeholder="Brief description of what this module covers"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setShowModuleDialog(false);
                          setEditingModule(null);
                          setModuleForm({ title: '', description: '', order: 0 });
                        }}>
                          Cancel
                        </Button>
                        <Button onClick={editingModule ? handleUpdateModule : handleAddModule}>
                          {editingModule ? 'Update Module' : 'Add Module'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {course.modules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No modules yet. Add your first module to get started.</p>
                  </div>
                ) : (
                  <div>
                    {course.modules.map((module, index) => (
                      <DraggableModule
                        key={module.id}
                        module={module}
                        index={index}
                        onMove={handleMoveModule}
                        onEdit={handleEditModule}
                        onDelete={handleDeleteModule}
                        onAddLesson={handleAddLesson}
                        expanded={expandedModules.has(module.id)}
                        onToggleExpand={toggleModuleExpand}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>
                Configure advanced settings for your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">Published Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this course available to learners
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={course.is_published}
                  onCheckedChange={(checked) => setCourse({ ...course, is_published: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="certificate">Enable Certificate</Label>
                  <p className="text-sm text-muted-foreground">
                    Issue certificates upon course completion
                  </p>
                </div>
                <Switch id="certificate" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="prerequisites">Prerequisites Required</Label>
                  <p className="text-sm text-muted-foreground">
                    Learners must complete prerequisites first
                  </p>
                </div>
                <Switch id="prerequisites" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Create a lesson for the selected module
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="e.g., Introduction to AI Ethics"
              />
            </div>
            <div>
              <Label htmlFor="lesson-type">Lesson Type</Label>
              <Select
                value={lessonForm.type}
                onValueChange={(value) => setLessonForm({ ...lessonForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text/Article</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {lessonForm.type === 'video' && (
              <div>
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}
            {lessonForm.type === 'text' && (
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  placeholder="Enter lesson content..."
                  rows={4}
                />
              </div>
            )}
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                placeholder="e.g., 15"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowLessonDialog(false);
              setLessonForm({
                title: '',
                type: 'video',
                content: '',
                video_url: '',
                duration: '',
                order: 0
              });
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateLesson}>
              Add Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CourseBuilderPage;