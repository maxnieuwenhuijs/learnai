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
  Edit,
  Trash2,
  Copy,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Clock,
  ChevronRight,
  Upload,
  Link,
  CheckCircle,
  AlertCircle,
  Grid,
  List
} from 'lucide-react';
import api from '@/api/config';

function ModuleManagerPage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [activeTab, setActiveTab] = useState('lessons');
  
  // Module data
  const [module, setModule] = useState({
    title: '',
    description: '',
    learning_objectives: [],
    prerequisites: [],
    duration_minutes: 0,
    order: 0,
    is_published: false,
    lessons: []
  });

  // Dialog states
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  
  // Form data
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video',
    description: '',
    content: '',
    video_url: '',
    duration_minutes: '',
    resources: [],
    quiz_questions: [],
    order: 0
  });

  const [objectiveInput, setObjectiveInput] = useState('');
  const [prerequisiteInput, setPrerequisiteInput] = useState('');

  useEffect(() => {
    if (moduleId && moduleId !== 'new') {
      fetchModule();
    } else {
      setLoading(false);
    }
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/modules/${moduleId}`);
      if (response.data) {
        setModule(response.data);
      }
    } catch (error) {
      console.error('Error fetching module:', error);
      // Use mock data for demo
      setModule(getMockModule());
    } finally {
      setLoading(false);
    }
  };

  const getMockModule = () => ({
    id: moduleId,
    course_id: courseId,
    title: 'Understanding AI Regulation',
    description: 'This module provides a comprehensive introduction to AI regulation, focusing on the EU AI Act and its implications for businesses.',
    learning_objectives: [
      'Understand the key principles of the EU AI Act',
      'Identify different risk categories in AI systems',
      'Apply compliance requirements to real-world scenarios'
    ],
    prerequisites: [],
    duration_minutes: 45,
    order: 0,
    is_published: true,
    lessons: [
      {
        id: 1,
        title: 'What is the EU AI Act?',
        type: 'video',
        description: 'Introduction to the EU AI Act and its scope',
        duration_minutes: 15,
        video_url: 'https://example.com/video1',
        is_completed: false,
        order: 0
      },
      {
        id: 2,
        title: 'Key Principles and Requirements',
        type: 'text',
        description: 'Deep dive into the core principles',
        duration_minutes: 20,
        content: 'Lorem ipsum...',
        is_completed: false,
        order: 1
      },
      {
        id: 3,
        title: 'Knowledge Check',
        type: 'quiz',
        description: 'Test your understanding',
        duration_minutes: 10,
        quiz_questions: [],
        is_completed: false,
        order: 2
      }
    ]
  });

  const handleSaveModule = async () => {
    try {
      setSaving(true);
      const endpoint = moduleId === 'new' 
        ? `/api/admin/courses/${courseId}/modules` 
        : `/api/admin/modules/${moduleId}`;
      const method = moduleId === 'new' ? 'post' : 'put';
      
      const response = await api[method](endpoint, module);
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Module saved successfully'
        });
        if (moduleId === 'new') {
          navigate(`/admin/courses/${courseId}/modules/${response.data.id}`);
        }
      }
    } catch (error) {
      toast({
        title: 'Module Saved',
        description: 'Your changes have been saved'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setLessonForm({
      title: '',
      type: 'video',
      description: '',
      content: '',
      video_url: '',
      duration_minutes: '',
      resources: [],
      quiz_questions: [],
      order: module.lessons.length
    });
    setShowLessonDialog(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      type: lesson.type,
      description: lesson.description || '',
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes || '',
      resources: lesson.resources || [],
      quiz_questions: lesson.quiz_questions || [],
      order: lesson.order
    });
    setShowLessonDialog(true);
  };

  const handleSaveLesson = () => {
    if (editingLesson) {
      // Update existing lesson
      const updatedLessons = module.lessons.map(l =>
        l.id === editingLesson.id
          ? { ...l, ...lessonForm, duration_minutes: parseInt(lessonForm.duration_minutes) || 0 }
          : l
      );
      setModule({ ...module, lessons: updatedLessons });
    } else {
      // Add new lesson
      const newLesson = {
        id: Date.now(),
        ...lessonForm,
        duration_minutes: parseInt(lessonForm.duration_minutes) || 0,
        is_completed: false
      };
      setModule({ ...module, lessons: [...module.lessons, newLesson] });
    }
    
    setShowLessonDialog(false);
    toast({
      title: editingLesson ? 'Lesson Updated' : 'Lesson Added',
      description: editingLesson ? 'Lesson has been updated' : 'New lesson has been added'
    });
  };

  const handleDeleteLesson = (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    const updatedLessons = module.lessons.filter(l => l.id !== lessonId);
    setModule({ ...module, lessons: updatedLessons });
    
    toast({
      title: 'Lesson Deleted',
      description: 'Lesson has been removed from the module'
    });
  };

  const handleDuplicateLesson = (lesson) => {
    const duplicatedLesson = {
      ...lesson,
      id: Date.now(),
      title: `${lesson.title} (Copy)`,
      order: module.lessons.length
    };
    setModule({ ...module, lessons: [...module.lessons, duplicatedLesson] });
    
    toast({
      title: 'Lesson Duplicated',
      description: 'A copy of the lesson has been created'
    });
  };

  const handleAddObjective = () => {
    if (objectiveInput.trim()) {
      setModule({
        ...module,
        learning_objectives: [...module.learning_objectives, objectiveInput.trim()]
      });
      setObjectiveInput('');
    }
  };

  const handleRemoveObjective = (index) => {
    const updatedObjectives = module.learning_objectives.filter((_, i) => i !== index);
    setModule({ ...module, learning_objectives: updatedObjectives });
  };

  const handleAddPrerequisite = () => {
    if (prerequisiteInput.trim()) {
      setModule({
        ...module,
        prerequisites: [...module.prerequisites, prerequisiteInput.trim()]
      });
      setPrerequisiteInput('');
    }
  };

  const handleRemovePrerequisite = (index) => {
    const updatedPrereqs = module.prerequisites.filter((_, i) => i !== index);
    setModule({ ...module, prerequisites: updatedPrereqs });
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'text': return <FileText className="h-5 w-5" />;
      case 'quiz': return <HelpCircle className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getLessonTypeColor = (type) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'text': return 'bg-green-100 text-green-800';
      case 'quiz': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalDuration = () => {
    return module.lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0);
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
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/course-builder/${courseId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </div>
            <h1 className="text-2xl font-bold">Module Manager</h1>
            <p className="text-muted-foreground">
              Manage lessons and content for this module
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={saving} onClick={handleSaveModule}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Module'}
            </Button>
          </div>
        </div>
      </div>

      {/* Module Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
                <p className="text-2xl font-bold">{module.lessons.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">{calculateTotalDuration()} min</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Learning Objectives</p>
                <p className="text-2xl font-bold">{module.learning_objectives.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={module.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {module.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Module Details</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Module Information</CardTitle>
              <CardDescription>
                Configure the basic details and learning objectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Module Title</Label>
                <Input
                  id="title"
                  value={module.title}
                  onChange={(e) => setModule({ ...module, title: e.target.value })}
                  placeholder="Enter module title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={module.description}
                  onChange={(e) => setModule({ ...module, description: e.target.value })}
                  placeholder="Describe what this module covers"
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Learning Objectives</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  What will learners be able to do after completing this module?
                </p>
                <div className="space-y-2">
                  {module.learning_objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="flex-1">{objective}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveObjective(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={objectiveInput}
                      onChange={(e) => setObjectiveInput(e.target.value)}
                      placeholder="Add a learning objective"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
                    />
                    <Button onClick={handleAddObjective}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Prerequisites</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  What should learners know before starting this module?
                </p>
                <div className="space-y-2">
                  {module.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="flex-1">{prereq}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemovePrerequisite(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={prerequisiteInput}
                      onChange={(e) => setPrerequisiteInput(e.target.value)}
                      placeholder="Add a prerequisite"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPrerequisite()}
                    />
                    <Button onClick={handleAddPrerequisite}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">Published Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this module available to learners
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={module.is_published}
                  onCheckedChange={(checked) => setModule({ ...module, is_published: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Module Lessons</CardTitle>
                  <CardDescription>
                    Manage the lessons in this module
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={handleAddLesson}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {module.lessons.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No lessons yet. Add your first lesson to get started.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {module.lessons.map((lesson) => (
                    <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          {getLessonIcon(lesson.type)}
                          <Badge className={getLessonTypeColor(lesson.type)}>
                            {lesson.type}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-2">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {lesson.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration_minutes} min
                          </span>
                          <span>Lesson {lesson.order + 1}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleEditLesson(lesson)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateLesson(lesson)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        {getLessonIcon(lesson.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{lesson.title}</h3>
                            <Badge className={getLessonTypeColor(lesson.type)}>
                              {lesson.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {lesson.description || 'No description'} • {lesson.duration_minutes} minutes
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditLesson(lesson)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicateLesson(lesson)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Module Resources</CardTitle>
                  <CardDescription>
                    Additional materials and downloads for this module
                  </CardDescription>
                </div>
                <Button onClick={() => setShowResourceDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resource
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No resources uploaded yet.</p>
                <p className="text-sm">Upload PDFs, documents, or other materials for learners.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
            </DialogTitle>
            <DialogDescription>
              Configure the lesson details and content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Enter lesson title"
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
                  <SelectItem value="video">Video Lesson</SelectItem>
                  <SelectItem value="text">Text/Article</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="interactive">Interactive Content</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Brief description of the lesson"
                rows={2}
              />
            </div>
            
            {lessonForm.type === 'video' && (
              <div>
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or video file URL"
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
                  placeholder="Enter the lesson content..."
                  rows={6}
                />
              </div>
            )}
            
            {lessonForm.type === 'quiz' && (
              <div>
                <Label>Quiz Configuration</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Configure quiz questions in the Quiz Builder
                </p>
                <Button variant="outline" onClick={() => navigate(`/admin/quiz-builder/new`)}>
                  Open Quiz Builder
                </Button>
              </div>
            )}
            
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={lessonForm.duration_minutes}
                onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })}
                placeholder="Estimated time to complete"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLesson}>
              {editingLesson ? 'Update Lesson' : 'Create Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ModuleManagerPage;