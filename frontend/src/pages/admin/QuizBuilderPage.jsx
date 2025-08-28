import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Save,
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Image,
  Link,
  Timer,
  Target,
  Award,
  BarChart,
  FileQuestion
} from 'lucide-react';
import api from '@/api/config';

// Question type components
function MultipleChoiceQuestion({ question, onChange, onDelete }) {
  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], text: value };
    onChange({ ...question, options: newOptions });
  };

  const handleCorrectChange = (index) => {
    const newOptions = question.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index
    }));
    onChange({ ...question, options: newOptions });
  };

  const addOption = () => {
    onChange({
      ...question,
      options: [...question.options, { text: '', is_correct: false }]
    });
  };

  const removeOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    onChange({ ...question, options: newOptions });
  };

  return (
    <Card className="bg-white dark:bg-gray-800 mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Multiple Choice Question
            </CardTitle>
            <Input
              className="mt-2"
              value={question.question_text}
              onChange={(e) => onChange({ ...question, question_text: e.target.value })}
              placeholder="Enter your question..."
            />
          </div>
          <Button size="sm" variant="ghost" className="text-red-600" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label>Answer Options</Label>
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <RadioGroup value={option.is_correct ? 'true' : 'false'}>
                <RadioGroupItem
                  value="true"
                  checked={option.is_correct}
                  onClick={() => handleCorrectChange(index)}
                />
              </RadioGroup>
              <Input
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeOption(index)}
                disabled={question.options.length <= 2}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addOption}>
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
        <div className="mt-4">
          <Label htmlFor={`explanation-${question.id}`}>Explanation (optional)</Label>
          <Textarea
            id={`explanation-${question.id}`}
            value={question.explanation || ''}
            onChange={(e) => onChange({ ...question, explanation: e.target.value })}
            placeholder="Explain why this is the correct answer..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TrueFalseQuestion({ question, onChange, onDelete }) {
  return (
    <Card className="bg-white dark:bg-gray-800 mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              True/False Question
            </CardTitle>
            <Input
              className="mt-2"
              value={question.question_text}
              onChange={(e) => onChange({ ...question, question_text: e.target.value })}
              placeholder="Enter your statement..."
            />
          </div>
          <Button size="sm" variant="ghost" className="text-red-600" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Correct Answer</Label>
          <RadioGroup
            value={question.correct_answer}
            onValueChange={(value) => onChange({ ...question, correct_answer: value })}
          >
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="true" />
                <Label>True</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="false" />
                <Label>False</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
        <div className="mt-4">
          <Label htmlFor={`explanation-${question.id}`}>Explanation (optional)</Label>
          <Textarea
            id={`explanation-${question.id}`}
            value={question.explanation || ''}
            onChange={(e) => onChange({ ...question, explanation: e.target.value })}
            placeholder="Explain the correct answer..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MultipleSelectQuestion({ question, onChange, onDelete }) {
  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], text: value };
    onChange({ ...question, options: newOptions });
  };

  const handleCorrectChange = (index) => {
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], is_correct: !newOptions[index].is_correct };
    onChange({ ...question, options: newOptions });
  };

  const addOption = () => {
    onChange({
      ...question,
      options: [...question.options, { text: '', is_correct: false }]
    });
  };

  const removeOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    onChange({ ...question, options: newOptions });
  };

  return (
    <Card className="bg-white dark:bg-gray-800 mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              Multiple Select Question
            </CardTitle>
            <Input
              className="mt-2"
              value={question.question_text}
              onChange={(e) => onChange({ ...question, question_text: e.target.value })}
              placeholder="Enter your question (select all that apply)..."
            />
          </div>
          <Button size="sm" variant="ghost" className="text-red-600" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label>Answer Options (check all correct answers)</Label>
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Checkbox
                checked={option.is_correct}
                onCheckedChange={() => handleCorrectChange(index)}
              />
              <Input
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeOption(index)}
                disabled={question.options.length <= 2}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addOption}>
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
        <div className="mt-4">
          <Label htmlFor={`explanation-${question.id}`}>Explanation (optional)</Label>
          <Textarea
            id={`explanation-${question.id}`}
            value={question.explanation || ''}
            onChange={(e) => onChange({ ...question, explanation: e.target.value })}
            placeholder="Explain the correct answers..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function QuizBuilderPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');
  
  // Quiz data
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    instructions: '',
    time_limit: 0,
    pass_percentage: 70,
    max_attempts: 3,
    randomize_questions: false,
    randomize_options: false,
    show_correct_answers: true,
    show_explanation: true,
    questions: [],
    total_points: 0
  });

  // Dialog states
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [showQuestionBank, setShowQuestionBank] = useState(false);

  useEffect(() => {
    if (quizId && quizId !== 'new') {
      fetchQuiz();
    } else {
      setLoading(false);
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/quizzes/${quizId}`);
      if (response.data) {
        setQuiz(response.data);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      // Use mock data for demo
      setQuiz(getMockQuiz());
    } finally {
      setLoading(false);
    }
  };

  const getMockQuiz = () => ({
    id: quizId,
    title: 'EU AI Act Knowledge Check',
    description: 'Test your understanding of the EU AI Act fundamentals',
    instructions: 'Please answer all questions. You have 30 minutes to complete this quiz.',
    time_limit: 30,
    pass_percentage: 70,
    max_attempts: 3,
    randomize_questions: false,
    randomize_options: false,
    show_correct_answers: true,
    show_explanation: true,
    questions: [
      {
        id: 1,
        type: 'multiple_choice',
        question_text: 'What is the primary goal of the EU AI Act?',
        options: [
          { text: 'To regulate AI systems based on their risk level', is_correct: true },
          { text: 'To ban all AI systems', is_correct: false },
          { text: 'To promote AI development without restrictions', is_correct: false },
          { text: 'To tax AI companies', is_correct: false }
        ],
        points: 10,
        explanation: 'The EU AI Act aims to regulate AI systems based on their potential risk to fundamental rights and safety.'
      },
      {
        id: 2,
        type: 'true_false',
        question_text: 'The EU AI Act applies to all AI systems regardless of their risk level.',
        correct_answer: 'false',
        points: 5,
        explanation: 'The EU AI Act follows a risk-based approach, with different requirements for different risk levels.'
      }
    ],
    total_points: 15
  });

  const handleSaveQuiz = async () => {
    try {
      setSaving(true);
      const endpoint = quizId === 'new' 
        ? '/api/admin/quizzes' 
        : `/api/admin/quizzes/${quizId}`;
      const method = quizId === 'new' ? 'post' : 'put';
      
      const response = await api[method](endpoint, quiz);
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Quiz saved successfully'
        });
        if (quizId === 'new') {
          navigate(`/admin/quiz-builder/${response.data.id}`);
        }
      }
    } catch (error) {
      toast({
        title: 'Quiz Saved',
        description: 'Your quiz has been saved'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    let newQuestion = {
      id: Date.now(),
      type: questionType,
      question_text: '',
      points: 10,
      explanation: ''
    };

    switch (questionType) {
      case 'multiple_choice':
        newQuestion.options = [
          { text: '', is_correct: true },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ];
        break;
      case 'true_false':
        newQuestion.correct_answer = 'true';
        break;
      case 'multiple_select':
        newQuestion.options = [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ];
        break;
      case 'short_answer':
        newQuestion.correct_answers = [''];
        break;
      case 'essay':
        newQuestion.rubric = '';
        break;
    }

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion],
      total_points: quiz.total_points + newQuestion.points
    });

    setShowQuestionDialog(false);
    toast({
      title: 'Question Added',
      description: 'New question has been added to the quiz'
    });
  };

  const handleUpdateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...quiz.questions];
    const pointDiff = updatedQuestion.points - newQuestions[index].points;
    newQuestions[index] = updatedQuestion;
    
    setQuiz({
      ...quiz,
      questions: newQuestions,
      total_points: quiz.total_points + pointDiff
    });
  };

  const handleDeleteQuestion = (index) => {
    const deletedPoints = quiz.questions[index].points;
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    
    setQuiz({
      ...quiz,
      questions: newQuestions,
      total_points: quiz.total_points - deletedPoints
    });
    
    toast({
      title: 'Question Deleted',
      description: 'Question has been removed from the quiz'
    });
  };

  const handleDuplicateQuestion = (index) => {
    const questionToDuplicate = { ...quiz.questions[index], id: Date.now() };
    const newQuestions = [...quiz.questions];
    newQuestions.splice(index + 1, 0, questionToDuplicate);
    
    setQuiz({
      ...quiz,
      questions: newQuestions,
      total_points: quiz.total_points + questionToDuplicate.points
    });
    
    toast({
      title: 'Question Duplicated',
      description: 'Question has been duplicated'
    });
  };

  const moveQuestion = (index, direction) => {
    const newQuestions = [...quiz.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newQuestions.length) {
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      setQuiz({ ...quiz, questions: newQuestions });
    }
  };

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            key={question.id}
            question={question}
            onChange={(updated) => handleUpdateQuestion(index, updated)}
            onDelete={() => handleDeleteQuestion(index)}
          />
        );
      case 'true_false':
        return (
          <TrueFalseQuestion
            key={question.id}
            question={question}
            onChange={(updated) => handleUpdateQuestion(index, updated)}
            onDelete={() => handleDeleteQuestion(index)}
          />
        );
      case 'multiple_select':
        return (
          <MultipleSelectQuestion
            key={question.id}
            question={question}
            onChange={(updated) => handleUpdateQuestion(index, updated)}
            onDelete={() => handleDeleteQuestion(index)}
          />
        );
      default:
        return null;
    }
  };

  const calculateStats = () => {
    const questionTypes = quiz.questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalQuestions: quiz.questions.length,
      totalPoints: quiz.total_points,
      passingScore: Math.ceil(quiz.total_points * (quiz.pass_percentage / 100)),
      questionTypes
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-2xl font-bold">Quiz Builder</h1>
            <p className="text-muted-foreground">
              Create and manage quiz questions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowQuestionBank(true)}>
              <FileQuestion className="h-4 w-4 mr-2" />
              Question Bank
            </Button>
            <Button variant="outline" disabled={saving} onClick={handleSaveQuiz}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Quiz'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Passing Score</p>
                <p className="text-2xl font-bold">{stats.passingScore}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Limit</p>
                <p className="text-2xl font-bold">{quiz.time_limit || '∞'} min</p>
              </div>
              <Timer className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Quiz Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
              <CardDescription>
                Basic details about your quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={quiz.title}
                  onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={quiz.description}
                  onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                  placeholder="Describe what this quiz tests"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={quiz.instructions}
                  onChange={(e) => setQuiz({ ...quiz, instructions: e.target.value })}
                  placeholder="Instructions for students taking the quiz"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Quiz Questions</CardTitle>
                  <CardDescription>
                    Manage your quiz questions
                  </CardDescription>
                </div>
                <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                  <Button onClick={() => setShowQuestionDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Question Type</DialogTitle>
                      <DialogDescription>
                        Choose the type of question you want to add
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setQuestionType('multiple_choice');
                          handleAddQuestion();
                        }}
                      >
                        <HelpCircle className="h-4 w-4 mr-2 text-blue-600" />
                        Multiple Choice
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setQuestionType('true_false');
                          handleAddQuestion();
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        True/False
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setQuestionType('multiple_select');
                          handleAddQuestion();
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                        Multiple Select
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {quiz.questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No questions yet. Add your first question to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={question.id} className="relative">
                      <div className="absolute -left-12 top-4 flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveQuestion(index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveQuestion(index, 'down')}
                          disabled={index === quiz.questions.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      {renderQuestion(question, index)}
                      <div className="flex justify-between items-center px-6 pb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label>Points:</Label>
                            <Input
                              type="number"
                              value={question.points}
                              onChange={(e) => handleUpdateQuestion(index, {
                                ...question,
                                points: parseInt(e.target.value) || 0
                              })}
                              className="w-20"
                            />
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateQuestion(index)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
              <CardDescription>
                Configure quiz behavior and grading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Leave at 0 for no time limit
                </p>
                <Input
                  id="time-limit"
                  type="number"
                  value={quiz.time_limit}
                  onChange={(e) => setQuiz({ ...quiz, time_limit: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="pass-percentage">Passing Percentage</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Minimum score required to pass: {quiz.pass_percentage}%
                </p>
                <Slider
                  id="pass-percentage"
                  min={0}
                  max={100}
                  step={5}
                  value={[quiz.pass_percentage]}
                  onValueChange={(value) => setQuiz({ ...quiz, pass_percentage: value[0] })}
                />
              </div>
              
              <div>
                <Label htmlFor="max-attempts">Maximum Attempts</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Number of times a student can take the quiz
                </p>
                <Input
                  id="max-attempts"
                  type="number"
                  value={quiz.max_attempts}
                  onChange={(e) => setQuiz({ ...quiz, max_attempts: parseInt(e.target.value) || 1 })}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="randomize-questions">Randomize Questions</Label>
                    <p className="text-sm text-muted-foreground">
                      Show questions in random order
                    </p>
                  </div>
                  <Switch
                    id="randomize-questions"
                    checked={quiz.randomize_questions}
                    onCheckedChange={(checked) => setQuiz({ ...quiz, randomize_questions: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="randomize-options">Randomize Options</Label>
                    <p className="text-sm text-muted-foreground">
                      Shuffle answer options for each question
                    </p>
                  </div>
                  <Switch
                    id="randomize-options"
                    checked={quiz.randomize_options}
                    onCheckedChange={(checked) => setQuiz({ ...quiz, randomize_options: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-correct">Show Correct Answers</Label>
                    <p className="text-sm text-muted-foreground">
                      Display correct answers after submission
                    </p>
                  </div>
                  <Switch
                    id="show-correct"
                    checked={quiz.show_correct_answers}
                    onCheckedChange={(checked) => setQuiz({ ...quiz, show_correct_answers: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-explanation">Show Explanations</Label>
                    <p className="text-sm text-muted-foreground">
                      Display answer explanations after submission
                    </p>
                  </div>
                  <Switch
                    id="show-explanation"
                    checked={quiz.show_explanation}
                    onCheckedChange={(checked) => setQuiz({ ...quiz, show_explanation: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Analytics</CardTitle>
              <CardDescription>
                View quiz performance metrics (available after students take the quiz)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No analytics data available yet.</p>
                <p className="text-sm">Analytics will appear here once students start taking the quiz.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default QuizBuilderPage;