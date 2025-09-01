import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Save,
  X,
  AlertCircle,
  Palette,
  MessageSquare,
  GraduationCap,
  Scale,
  Lightbulb,
  CheckSquare,
  BarChart,
  Star,
  Heart,
  Target,
  Zap,
  Calendar,
  Search,
  Laptop,
  TrendingUp
} from 'lucide-react';
import { promptsApi } from '../../api/prompts';

const predefinedColors = [
  { name: 'Blauw', value: '#3b82f6' },
  { name: 'Groen', value: '#10b981' },
  { name: 'Geel', value: '#f59e0b' },
  { name: 'Rood', value: '#ef4444' },
  { name: 'Paars', value: '#8b5cf6' },
  { name: 'Cyaan', value: '#06b6d4' },
  { name: 'Roze', value: '#ec4899' },
  { name: 'Oranje', value: '#f97316' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Smaragd', value: '#059669' }
];

const iconOptions = [
  { name: 'Berichten', value: 'MessageSquare', icon: MessageSquare },
  { name: 'Educatie', value: 'GraduationCap', icon: GraduationCap },
  { name: 'Beslissingen', value: 'Scale', icon: Scale },
  { name: 'Ideeën', value: 'Lightbulb', icon: Lightbulb },
  { name: 'Taken', value: 'CheckSquare', icon: CheckSquare },
  { name: 'Analytics', value: 'BarChart', icon: BarChart },
  { name: 'Favorieten', value: 'Star', icon: Star },
  { name: 'Belangrijk', value: 'Heart', icon: Heart },
  { name: 'Doelen', value: 'Target', icon: Target },
  { name: 'Snel', value: 'Zap', icon: Zap },
  { name: 'Creativiteit', value: 'Palette', icon: Palette },
  { name: 'Planning', value: 'Calendar', icon: Calendar },
  { name: 'Research', value: 'Search', icon: Search },
  { name: 'Technologie', value: 'Laptop', icon: Laptop },
  { name: 'Marketing', value: 'TrendingUp', icon: TrendingUp }
];

const CategoryCreator = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: 'MessageSquare'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Naam is verplicht';
    if (formData.name.length > 100) return 'Naam mag maximaal 100 karakters bevatten';
    return null;
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
      
      const response = await promptsApi.createCategory(formData);
      
      if (onSave) {
        onSave(response.data);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: 'MessageSquare'
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Fout bij het aanmaken van categorie. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      icon: 'MessageSquare'
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-5 h-5" />
            Nieuwe Categorie Maken
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Naam *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Bijv. Marketing, Ontwikkeling, Support"
              maxLength={100}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Beschrijving
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Beschrijf waarvoor deze categorie gebruikt wordt"
              rows={3}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="color" className="text-sm font-medium">
              Kleur
            </Label>
            <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: formData.color }}
                    />
                    {predefinedColors.find(c => c.value === formData.color)?.name || 'Custom'}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {predefinedColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="icon" className="text-sm font-medium">
              Icoon
            </Label>
            <Select value={formData.icon} onValueChange={(value) => handleInputChange('icon', value)}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const selectedIcon = iconOptions.find(i => i.value === formData.icon);
                      const IconComponent = selectedIcon?.icon || MessageSquare;
                      return <IconComponent className="w-4 h-4" style={{ color: formData.color }} />;
                    })()}
                    <span>{iconOptions.find(i => i.value === formData.icon)?.name || formData.icon}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex items-center gap-2">
                      <icon.icon className="w-4 h-4" style={{ color: formData.color }} />
                      <span>{icon.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Preview */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border">
            <Label className="text-sm font-medium text-muted-foreground mb-3 block">
              Live Voorbeeld
            </Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const selectedIcon = iconOptions.find(i => i.value === formData.icon);
                  const IconComponent = selectedIcon?.icon || MessageSquare;
                  return <IconComponent className="w-5 h-5" style={{ color: formData.color }} />;
                })()}
                <div 
                  className="w-4 h-4 rounded-full shadow-sm border border-white/20" 
                  style={{ backgroundColor: formData.color }}
                />
              </div>
              <span className="font-semibold text-lg">{formData.name || 'Categorie naam'}</span>
            </div>
            {formData.description && (
              <p className="text-sm text-muted-foreground mt-3 pl-10">{formData.description}</p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={handleClose}>
            Annuleren
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Aanmaken...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Aanmaken
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryCreator;