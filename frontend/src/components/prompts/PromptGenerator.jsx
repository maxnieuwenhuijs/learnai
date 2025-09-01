import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  Copy, 
  Download,
  Wand2,
  X,
  Check
} from 'lucide-react';

const PromptGenerator = ({ prompt, isOpen, onClose }) => {
  const [variables, setVariables] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prompt && prompt.variables) {
      // Initialize variables with default values
      const initialVariables = {};
      prompt.variables.forEach(variable => {
        initialVariables[variable.name] = variable.default || '';
      });
      setVariables(initialVariables);
    }
  }, [prompt]);

  const handleVariableChange = (variableName, value) => {
    setVariables(prev => ({
      ...prev,
      [variableName]: value
    }));
  };


  const handleCopy = async (content) => {
    const textToCopy = content || previewContent();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = (content) => {
    const textToDownload = content || previewContent();
    const element = document.createElement('a');
    const file = new Blob([textToDownload], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${prompt.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const previewContent = () => {
    if (!prompt.content) return '';
    
    let preview = prompt.content;
    prompt.variables?.forEach(variable => {
      const placeholder = `{{${variable.name}}}`;
      const value = variables[variable.name] || `[${variable.name}]`;
      preview = preview.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return preview;
  };

  if (!prompt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            {prompt.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Variables Panel */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Variabelen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {prompt.description}
              </p>
            </div>
            
            {prompt.variables && prompt.variables.length > 0 ? (
              <div className="space-y-4">
                {prompt.variables.map((variable) => (
                  <div key={variable.name} className="space-y-2">
                    <Label htmlFor={variable.name} className="flex items-center gap-2">
                      {variable.name}
                      {variable.description && (
                        <span className="text-xs text-gray-500">
                          ({variable.description})
                        </span>
                      )}
                    </Label>
                    
                    {variable.type === 'text' ? (
                      <Textarea
                        id={variable.name}
                        value={variables[variable.name] || ''}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        placeholder={variable.default || `Voer ${variable.name} in...`}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={variable.name}
                        type={variable.type === 'number' ? 'number' : 'text'}
                        value={variables[variable.name] || ''}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                        placeholder={variable.default || `Voer ${variable.name} in...`}
                      />
                    )}
                    
                    {variable.default && (
                      <div className="text-xs text-gray-500">
                        Standaard: {variable.default}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Deze prompt heeft geen variabelen
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => handleCopy(previewContent())}
                className={`flex-1 transition-all duration-300 ${
                  copied 
                    ? 'bg-green-700 hover:bg-green-800 scale-105 shadow-lg' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 animate-bounce" />
                    Gekopieerd naar Klembord!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Kopiëren naar Klembord
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Preview & Generated Content Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Live Voorbeeld
              </h3>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={copied ? "default" : "outline"}
                  onClick={() => handleCopy(previewContent())}
                  title="Kopiëren naar klembord"
                  className={`transition-all duration-300 ${
                    copied 
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 scale-105' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1 animate-bounce" />
                      Gekopieerd!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Kopiëren
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDownload(previewContent())}
                  title="Download als bestand"
                  className="hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded-md max-h-96 overflow-y-auto">
                  {previewContent()}
                </pre>
              </CardContent>
            </Card>
            
            <div className="text-xs text-gray-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  v{prompt.version}
                </Badge>
                <span>Direct kopieerbaar - vul variabelen in en kopiëer!</span>
              </div>
              {copied && (
                <div className="flex items-center gap-1 text-green-600 font-medium animate-fade-in">
                  <Check className="w-3 h-3 animate-pulse" />
                  <span>In klembord!</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptGenerator;