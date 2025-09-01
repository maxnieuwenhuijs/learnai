import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  GraduationCap,
  Scale,
  Lightbulb,
  CheckSquare,
  BarChart,
  Clock,
  TrendingUp,
  Eye,
  Edit3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { promptsApi } from '@/api/prompts';
import PromptGenerator from '@/components/prompts/PromptGenerator';
import PromptCreator from '@/components/prompts/PromptCreator';
import CategoryCreator from '@/components/prompts/CategoryCreator';

const categoryIcons = {
  'GraduationCap': GraduationCap,
  'Scale': Scale,
  'Lightbulb': Lightbulb,
  'CheckSquare': CheckSquare,
  'MessageSquare': MessageSquare,
  'BarChart': BarChart,
};

export function PromptsPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [showGenerator, setShowGenerator] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [selectedCategory, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, allPromptsRes] = await Promise.all([
        promptsApi.getCategories(),
        promptsApi.getPrompts({}) // Get all prompts to count total
      ]);
      setCategories(categoriesRes.data);
      setTotalPrompts(allPromptsRes.data.pagination.total);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrompts = async () => {
    try {
      const filters = {};
      if (selectedCategory !== 'all') {
        filters.category_id = selectedCategory;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const res = await promptsApi.getPrompts(filters);
      setPrompts(res.data.prompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  };

  const handleGenerateContent = async (prompt, variables) => {
    try {
      setIsGenerating(true);
      const res = await promptsApi.generateContent(prompt.id, variables, 'prompt_library');
      return res.data;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUsePrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setShowGenerator(true);
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setShowCreator(true);
  };

  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    setShowCreator(true);
  };

  const handlePromptSaved = (savedPrompt) => {
    // Refresh the prompts list and categories with counts
    loadData();
    loadPrompts();
  };

  const handleCategorySaved = (savedCategory) => {
    // Refresh both categories and prompts
    loadData();
    loadPrompts();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
                <MessageSquare className="w-8 h-8" />
                Prompt Library
              </h1>
              <p className="text-blue-100">
                Beheer en gebruik herbruikbare prompts voor je team
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{totalPrompts}</div>
                <div className="text-sm text-blue-100">Prompts</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-blue-100">Categorieën</div>
              </div>
              <MessageSquare className="w-16 h-16 text-blue-200 hidden lg:block" />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
            <Button 
              variant="outline"
              onClick={() => setActiveTab('analytics')}
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowCategoryCreator(true)}
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Categorie
            </Button>
            <Button 
              onClick={handleCreatePrompt}
              size="sm"
              className="bg-white text-blue-600 hover:bg-white/90 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Prompt
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Zoek prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Bladeren</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Categorieën
                      </CardTitle>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowCategoryCreator(true)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedCategory === 'all'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="flex-1 min-w-0">Alle Prompts</span>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-white/20 text-current border-0 px-2"
                        >
                          {totalPrompts}
                        </Badge>
                      </div>
                    </button>
                    
                    {categories.map((category) => {
                      const IconComponent = categoryIcons[category.icon] || MessageSquare;
                      
                      // Debug log for missing icons
                      if (!categoryIcons[category.icon]) {
                        console.warn(`Missing icon for category: ${category.name}, icon: ${category.icon}`);
                      }
                      
                      // Ensure we have an icon to render
                      if (!IconComponent) {
                        console.error(`No icon component found for: ${category.icon}`);
                      }
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                            selectedCategory === category.id
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'hover:bg-gray-50 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                              <IconComponent 
                                className="w-4 h-4" 
                                style={{ color: selectedCategory === category.id ? 'currentColor' : category.color }} 
                              />
                            </div>
                            <span className="flex-1 min-w-0">{category.name}</span>
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-white/20 text-current border-0 px-2"
                            >
                              {category.prompt_count || 0}
                            </Badge>
                          </div>
                        </button>
                      );
                    })}
                    
                    {categories.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-3">Geen categorieën gevonden</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowCategoryCreator(true)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Eerste Categorie
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Prompts Grid */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {prompts.map((prompt) => {
                    const category = categories.find(c => c.id === prompt.category_id);
                    const IconComponent = categoryIcons[category?.icon] || MessageSquare;
                    
                    // Debug log for missing icons in prompt cards
                    if (category && !categoryIcons[category.icon]) {
                      console.warn(`Missing icon for prompt category: ${category.name}, icon: ${category.icon}`);
                    }
                    
                    return (
                      <Card key={prompt.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-transparent hover:border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="flex-shrink-0 p-1.5 rounded-md flex items-center justify-center"
                                style={{ 
                                  backgroundColor: `${category?.color}15`,
                                  color: category?.color 
                                }}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              <Badge 
                                variant="outline" 
                                className="text-xs border-0 px-2 py-0.5"
                                style={{ 
                                  backgroundColor: `${category?.color}10`,
                                  color: category?.color 
                                }}
                              >
                                {category?.name}
                              </Badge>
                            </div>
                            {prompt.is_template && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                Template
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                            {prompt.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {prompt.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="py-3">
                          {prompt.tags && prompt.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {prompt.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                                  {tag}
                                </Badge>
                              ))}
                              {prompt.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                                  +{prompt.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Versie {prompt.version}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{prompt.usage_count || 0}x gebruikt</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-3 gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-sm"
                            onClick={() => handleUsePrompt(prompt)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-2" />
                            Gebruiken
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-300 hover:bg-gray-50"
                            onClick={() => handleEditPrompt(prompt)}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
                
                  {prompts.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Geen prompts gevonden
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ? 'Probeer andere zoektermen' : 'Maak je eerste prompt aan'}
                      </p>
                      <Button onClick={handleCreatePrompt}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nieuwe Prompt
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="text-center py-12">
              <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Templates weergave
              </h3>
              <p className="text-muted-foreground">
                Hier komen alle herbruikbare prompt templates
              </p>
            </div>
          </TabsContent>


          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-muted-foreground">
                Hier komen de usage analytics en statistieken
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <PromptGenerator
          prompt={selectedPrompt}
          isOpen={showGenerator}
          onClose={() => {
            setShowGenerator(false);
            setSelectedPrompt(null);
          }}
          onGenerate={handleGenerateContent}
        />

        <PromptCreator
          isOpen={showCreator}
          onClose={() => {
            setShowCreator(false);
            setEditingPrompt(null);
          }}
          onSave={handlePromptSaved}
          editPrompt={editingPrompt}
        />

        <CategoryCreator
          isOpen={showCategoryCreator}
          onClose={() => setShowCategoryCreator(false)}
          onSave={handleCategorySaved}
        />
      </div>
    </DashboardLayout>
  );
}