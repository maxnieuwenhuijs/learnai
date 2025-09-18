import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Clock, 
  User, 
  RotateCcw, 
  Eye, 
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { promptsApi } from '../../api/prompts';

const PromptVersionHistory = ({ promptId, onVersionRestore }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (promptId) {
      loadVersions();
    }
  }, [promptId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const response = await promptsApi.getPromptVersions(promptId);
      setVersions(response.data || []);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId) => {
    if (!window.confirm('Weet je zeker dat je deze versie wilt herstellen? De huidige versie wordt overschreven.')) {
      return;
    }

    setRestoring(true);
    try {
      await promptsApi.restorePromptVersion(promptId, versionId);
      await loadVersions(); // Reload versions
      onVersionRestore?.(); // Notify parent component
      alert('Versie succesvol hersteld!');
    } catch (error) {
      console.error('Error restoring version:', error);
      alert('Er is een fout opgetreden bij het herstellen van de versie.');
    } finally {
      setRestoring(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (isCurrent, status) => {
    if (isCurrent) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (status === 'draft') {
      return <FileText className="w-4 h-4 text-gray-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-amber-500" />;
  };

  const getStatusColor = (isCurrent, status) => {
    if (isCurrent) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (status === 'draft') {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Versies laden...</div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Geen versies gevonden</h3>
        <p className="text-gray-500">Er zijn nog geen versies van deze prompt opgeslagen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Versie Geschiedenis</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={loadVersions}
          disabled={loading}
        >
          <Clock className="w-4 h-4 mr-2" />
          Vernieuwen
        </Button>
      </div>

      <div className="space-y-3">
        {versions.map((version, index) => (
          <Card 
            key={version.id} 
            className={`cursor-pointer transition-all duration-200 ${
              selectedVersion?.id === version.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedVersion(selectedVersion?.id === version.id ? null : version)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(version.is_current, version.status)}
                  <div>
                    <CardTitle className="text-base">
                      Versie {version.version_number}
                      {version.is_current && (
                        <Badge className="ml-2 text-xs" variant="outline">
                          Huidige versie
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(version.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {version.creator?.name || 'Onbekend'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(version.is_current, version.status)}`}
                  >
                    {version.status}
                  </Badge>
                  
                  {!version.is_current && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreVersion(version.id);
                      }}
                      disabled={restoring}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Herstellen
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {selectedVersion?.id === version.id && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Version Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Titel</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">{version.title}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Beschrijving</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">{version.description || 'Geen beschrijving'}</p>
                    </div>
                  </div>

                  {/* Change Notes */}
                  {version.change_notes && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Wijzigingen</h4>
                      <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                        {version.change_notes}
                      </p>
                    </div>
                  )}

                  {/* Content Preview */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Content</h4>
                    <div className="bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {version.content}
                      </pre>
                    </div>
                  </div>

                  {/* Variables */}
                  {version.variables && version.variables.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Variabelen</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {version.variables.map((variable, varIndex) => (
                          <div key={varIndex} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="font-medium">{variable.name}</div>
                            <div className="text-gray-500 text-xs">
                              Type: {variable.type} | 
                              {variable.required ? ' Verplicht' : ' Optioneel'}
                              {variable.default && ` | Standaard: ${variable.default}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromptVersionHistory;
