import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Plus, 
  X, 
  Save,
  Eye,
  Trash2,
  Variable,
  AlertCircle,
  Info,
  MessageSquare,
  GraduationCap,
  Scale,
  Lightbulb,
  CheckSquare,
  BarChart
} from 'lucide-react';
import { promptsApi } from '../../api/prompts';
import { useAuth } from '../../contexts/AuthContext';
import CategoryCreator from './CategoryCreator';

const categoryIcons = {
  'GraduationCap': GraduationCap,
  'Scale': Scale,
  'Lightbulb': Lightbulb,
  'CheckSquare': CheckSquare,
  'MessageSquare': MessageSquare,
  'BarChart': BarChart,
};

const PromptCreator = ({ isOpen, onClose, onSave, editPrompt = null }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category_id: '',
    department_id: null,
    is_template: false,
    tags: [],
    status: 'draft'
  });
  const [variables, setVariables] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (editPrompt) {
        // Pre-fill form when editing
        setFormData({
          title: editPrompt.title || '',
          description: editPrompt.description || '',
          content: editPrompt.content || '',
          category_id: editPrompt.category_id || '',
          department_id: editPrompt.department_id || null,
          is_template: editPrompt.is_template || false,
          tags: editPrompt.tags || [],
          status: editPrompt.status || 'draft'
        });
        setVariables(editPrompt.variables || []);
      } else {
        // Reset form for new prompt
        setFormData({
          title: '',
          description: '',
          content: '',
          category_id: '',
          department_id: null,
          is_template: false,
          tags: [],
          status: 'draft'
        });
        setVariables([]);
      }
    }
  }, [isOpen, editPrompt]);

  const loadCategories = async () => {
    try {
      const response = await promptsApi.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addVariable = () => {
    setVariables(prev => [...prev, {
      name: '',
      type: 'string',
      default: '',
      description: ''
    }]);
  };

  const updateVariable = (index, field, value) => {
    setVariables(prev => prev.map((variable, i) => 
      i === index ? { ...variable, [field]: value } : variable
    ));
  };

  const removeVariable = (index) => {
    setVariables(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Titel is verplicht';
    if (!formData.content.trim()) return 'Content is verplicht';
    if (!formData.category_id) return 'Categorie is verplicht';
    
    // Validate variables
    for (let i = 0; i < variables.length; i++) {
      const variable = variables[i];
      if (!variable.name.trim()) {
        return `Variabele ${i + 1} moet een naam hebben`;
      }
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.name)) {
        return `Variabele "${variable.name}" heeft een ongeldige naam (alleen letters, cijfers en underscores)`;
      }
    }
    
    return null;
  };

  const previewContent = () => {
    let preview = formData.content;
    variables.forEach(variable => {
      const placeholder = `{{${variable.name}}}`;
      const replacement = variable.default || `[${variable.name}]`;
      preview = preview.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    });
    return preview;
  };

  const handleCategorySaved = (newCategory) => {
    // Add the new category to the list and select it
    setCategories(prev => [...prev, newCategory]);
    setFormData(prev => ({
      ...prev,
      category_id: newCategory.id.toString()
    }));
    setShowCategoryCreator(false);
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const promptData = {
        ...formData,
        variables: variables.filter(v => v.name.trim()) // Only include variables with names
      };

      let response;
      if (editPrompt) {
        response = await promptsApi.updatePrompt(editPrompt.id, promptData);
      } else {
        response = await promptsApi.createPrompt(promptData);
      }

      if (onSave) {
        onSave(response.data);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving prompt:', error);
      setError('Fout bij het opslaan. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Variable className="w-5 h-5" />
            {editPrompt ? 'Prompt Bewerken' : 'Nieuwe Prompt Maken'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Panel */}
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Voer een titel in voor de prompt"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Beschrijf waar deze prompt voor gebruikt wordt"
                  rows={3}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="category">Categorie *</Label>
                  <Button 
                    size="sm" 
                    onClick={() => setShowCategoryCreator(true)}
                    type="button"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nieuwe Categorie
                  </Button>
                </div>
                
                {categories.length === 0 ? (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
                    <div className="mb-3">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-700">Geen categorieën beschikbaar</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Maak eerst een categorie aan voordat je een prompt kunt maken
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowCategoryCreator(true)}
                      type="button"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Maak je eerste categorie
                    </Button>
                  </div>
                ) : (
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies een categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => {
                        const IconComponent = categoryIcons[category.icon] || MessageSquare;
                        return (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center gap-2">
                              <IconComponent 
                                className="w-4 h-4" 
                                style={{ color: category.color }} 
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_template"
                  checked={formData.is_template}
                  onCheckedChange={(checked) => handleInputChange('is_template', checked)}
                />
                <Label htmlFor="is_template">Dit is een herbruikbare template</Label>
              </div>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Prompt Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Schrijf je prompt hier. Gebruik {{variabele_naam}} voor dynamische waarden."
                rows={8}
              />
              <div className="text-xs text-gray-500 mt-1">
                <Info className="w-3 h-3 inline mr-1" />
                Gebruik {`{{variabele_naam}}`} voor dynamische waarden
              </div>
            </div>

            {/* Variables */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Variabelen</Label>
                <Button size="sm" variant="outline" onClick={addVariable}>
                  <Plus className="w-4 h-4 mr-1" />
                  Variabele
                </Button>
              </div>
              
              {variables.map((variable, index) => (
                <Card key={index} className="p-3 mb-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <Label className="text-xs">Naam</Label>
                      <Input
                        value={variable.name}
                        onChange={(e) => updateVariable(index, 'name', e.target.value)}
                        placeholder="variabele_naam"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select 
                        value={variable.type} 
                        onValueChange={(value) => updateVariable(index, 'type', value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">Tekst</SelectItem>
                          <SelectItem value="text">Lange tekst</SelectItem>
                          <SelectItem value="number">Nummer</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    <div>
                      <Label className="text-xs">Beschrijving</Label>
                      <Input
                        value={variable.description}
                        onChange={(e) => updateVariable(index, 'description', e.target.value)}
                        placeholder="Beschrijf deze variabele"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Standaardwaarde</Label>
                      <Input
                        value={variable.default}
                        onChange={(e) => updateVariable(index, 'default', e.target.value)}
                        placeholder="Standaardwaarde (optioneel)"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => removeVariable(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Voeg een tag toe"
                />
                <Button size="sm" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}
          </div>
          
          {/* Preview Panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Voorbeeld</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md max-h-96 overflow-y-auto">
                  {previewContent() || 'Voer content in om een voorbeeld te zien...'}
                </pre>
              </CardContent>
            </Card>
            
            {variables.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Gedetecteerde Variabelen</h4>
                <div className="space-y-1">
                  {variables.map((variable, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <code>{`{{${variable.name}}}`}</code>
                      {variable.description && (
                        <span className="text-gray-500 ml-2">- {variable.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => handleInputChange('status', 'draft')}
              disabled={loading}
            >
              Als Concept Opslaan
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Opslaan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editPrompt ? 'Bijwerken' : 'Opslaan'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* Category Creator Modal */}
      <CategoryCreator
        isOpen={showCategoryCreator}
        onClose={() => setShowCategoryCreator(false)}
        onSave={handleCategorySaved}
      />
    </Dialog>
  );
};

export default PromptCreator;