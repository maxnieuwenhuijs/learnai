import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  X, 
  Type, 
  Hash, 
  Calendar,
  ToggleLeft,
  ToggleRight,
  Check
} from 'lucide-react';

const VariableInserter = ({ onVariableAdd, existingVariables = [] }) => {
  const [variables, setVariables] = useState([]);
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'text',
    description: '',
    default: '',
    required: false
  });

  useEffect(() => {
    setVariables(existingVariables);
  }, [existingVariables]);

  const variableTypes = [
    { value: 'text', label: 'Tekst', icon: Type, description: 'Vrije tekst invoer' },
    { value: 'number', label: 'Nummer', icon: Hash, description: 'Numerieke waarde' },
    { value: 'date', label: 'Datum', icon: Calendar, description: 'Datum selectie' },
    { value: 'boolean', label: 'Ja/Nee', icon: ToggleLeft, description: 'Waar/Onwaar' }
  ];

  const handleAddVariable = () => {
    if (!newVariable.name.trim()) return;

    const variable = {
      ...newVariable,
      name: newVariable.name.trim()
    };

    setVariables(prev => [...prev, variable]);
    onVariableAdd([...variables, variable]);
    
    // Reset form
    setNewVariable({
      name: '',
      type: 'text',
      description: '',
      default: '',
      required: false
    });
  };

  const handleRemoveVariable = (index) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    setVariables(updatedVariables);
    onVariableAdd(updatedVariables);
  };

  const handleUpdateVariable = (index, field, value) => {
    const updatedVariables = variables.map((variable, i) => 
      i === index ? { ...variable, [field]: value } : variable
    );
    setVariables(updatedVariables);
    onVariableAdd(updatedVariables);
  };

  const getVariableIcon = (type) => {
    const typeConfig = variableTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Type;
  };

  const getVariableLabel = (type) => {
    const typeConfig = variableTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.label : 'Tekst';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Variabelen Beheer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Variable Form */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h4 className="font-medium mb-3">Nieuwe Variabele Toevoegen</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="var-name">Variabele Naam *</Label>
              <Input
                id="var-name"
                value={newVariable.name}
                onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                placeholder="bijv. onderwerp, doelgroep, toon"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="var-type">Type</Label>
              <select
                id="var-type"
                value={newVariable.type}
                onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {variableTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="var-description">Beschrijving</Label>
              <Input
                id="var-description"
                value={newVariable.description}
                onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Korte beschrijving van de variabele"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="var-default">Standaard Waarde</Label>
              <Input
                id="var-default"
                value={newVariable.default}
                onChange={(e) => setNewVariable(prev => ({ ...prev, default: e.target.value }))}
                placeholder="Optionele standaard waarde"
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="var-required"
                checked={newVariable.required}
                onChange={(e) => setNewVariable(prev => ({ ...prev, required: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="var-required">Verplicht veld</Label>
            </div>
          </div>
          
          <Button 
            onClick={handleAddVariable}
            disabled={!newVariable.name.trim()}
            className="mt-4 w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Variabele Toevoegen
          </Button>
        </div>

        {/* Existing Variables List */}
        {variables.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Gedefinieerde Variabelen</h4>
            {variables.map((variable, index) => {
              const IconComponent = getVariableIcon(variable.type);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{variable.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getVariableLabel(variable.type)}
                        </Badge>
                        {variable.required && (
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                            Verplicht
                          </Badge>
                        )}
                      </div>
                      {variable.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {variable.description}
                        </p>
                      )}
                      {variable.default && (
                        <p className="text-xs text-gray-500">
                          Standaard: {variable.default}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveVariable(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Variable Usage Instructions */}
        {variables.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Hoe variabelen te gebruiken:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Gebruik <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{"{{variabele_naam}}"}</code> in je prompt content</li>
              <li>• Variabelen worden automatisch vervangen door de ingevulde waarden</li>
              <li>• Gebruikers kunnen de variabelen invullen in de prompt generator</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariableInserter;
