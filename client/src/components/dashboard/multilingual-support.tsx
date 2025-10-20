import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  TestTube, 
  Languages, 
  Translate, 
  Target,
  Settings,
  Copy,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Flag,
  BookOpen,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
  isDefault: boolean;
  translationQuality: 'basic' | 'good' | 'excellent';
  aiProvider: string;
  customPrompts: string[];
  createdAt: string;
  updatedAt: string;
}

interface TranslationConfig {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  autoTranslate: boolean;
  humanReview: boolean;
  qualityThreshold: number;
  customInstructions: string;
  isActive: boolean;
}

interface ContentTranslation {
  id: string;
  contentId: string;
  contentType: 'question' | 'answer' | 'comment';
  sourceLanguage: string;
  targetLanguage: string;
  translatedContent: string;
  translationQuality: number;
  isHumanReviewed: boolean;
  createdAt: string;
}

const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', quality: 'excellent' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', quality: 'excellent' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', quality: 'excellent' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', quality: 'excellent' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', quality: 'good' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', quality: 'good' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', quality: 'good' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', quality: 'good' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', quality: 'good' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', quality: 'good' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', quality: 'basic' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', quality: 'basic' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', quality: 'good' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', quality: 'basic' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', quality: 'basic' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', quality: 'basic' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', quality: 'basic' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', quality: 'basic' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', quality: 'basic' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', quality: 'basic' }
];

export default function MultilingualSupport() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testContent, setTestContent] = useState('');
  const [testTranslation, setTestTranslation] = useState('');
  const [selectedSourceLanguage, setSelectedSourceLanguage] = useState('en');
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState('es');
  const queryClient = useQueryClient();

  // Fetch languages
  const { data: languages = [], isLoading: languagesLoading } = useQuery({
    queryKey: ['/api/languages'],
    queryFn: async () => {
      const response = await fetch('/api/languages');
      if (!response.ok) throw new Error('Failed to fetch languages');
      return response.json();
    }
  });

  // Fetch translation configs
  const { data: translationConfigs = [] } = useQuery({
    queryKey: ['/api/translation-configs'],
    queryFn: async () => {
      const response = await fetch('/api/translation-configs');
      if (!response.ok) throw new Error('Failed to fetch translation configs');
      return response.json();
    }
  });

  // Fetch recent translations
  const { data: recentTranslations = [] } = useQuery({
    queryKey: ['/api/translations/recent'],
    queryFn: async () => {
      const response = await fetch('/api/translations/recent');
      if (!response.ok) throw new Error('Failed to fetch recent translations');
      return response.json();
    }
  });

  // Add language mutation
  const addLanguageMutation = useMutation({
    mutationFn: async (languageData: Partial<Language>) => {
      const response = await fetch('/api/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(languageData)
      });
      if (!response.ok) throw new Error('Failed to add language');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/languages'] });
      toast.success('Language added successfully');
      setIsAddingLanguage(false);
    },
    onError: (error) => {
      toast.error(`Failed to add language: ${error.message}`);
    }
  });

  // Update language mutation
  const updateLanguageMutation = useMutation({
    mutationFn: async ({ id, ...languageData }: Partial<Language> & { id: string }) => {
      const response = await fetch(`/api/languages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(languageData)
      });
      if (!response.ok) throw new Error('Failed to update language');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/languages'] });
      toast.success('Language updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update language: ${error.message}`);
    }
  });

  // Delete language mutation
  const deleteLanguageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/languages/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete language');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/languages'] });
      toast.success('Language deleted successfully');
      setSelectedLanguage(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete language: ${error.message}`);
    }
  });

  // Test translation mutation
  const testTranslationMutation = useMutation({
    mutationFn: async ({ sourceLanguage, targetLanguage, content }: { 
      sourceLanguage: string; 
      targetLanguage: string; 
      content: string 
    }) => {
      const response = await fetch('/api/translations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceLanguage, targetLanguage, content })
      });
      if (!response.ok) throw new Error('Failed to test translation');
      return response.json();
    },
    onSuccess: (data) => {
      setTestTranslation(data.translation);
      toast.success('Translation test completed');
    },
    onError: (error) => {
      toast.error(`Failed to test translation: ${error.message}`);
    }
  });

  // Bulk translate mutation
  const bulkTranslateMutation = useMutation({
    mutationFn: async ({ targetLanguage, contentType }: { 
      targetLanguage: string; 
      contentType?: string 
    }) => {
      const response = await fetch('/api/translations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguage, contentType })
      });
      if (!response.ok) throw new Error('Failed to bulk translate');
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Bulk translation completed: ${data.translatedCount} items translated`);
      queryClient.invalidateQueries({ queryKey: ['/api/translations/recent'] });
    },
    onError: (error) => {
      toast.error(`Failed to bulk translate: ${error.message}`);
    }
  });

  const handleAddLanguage = (languageCode: string) => {
    const language = supportedLanguages.find(l => l.code === languageCode);
    if (!language) return;

    const newLanguage: Partial<Language> = {
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
      flag: language.flag,
      isActive: true,
      isDefault: false,
      translationQuality: language.quality as any,
      aiProvider: 'openai',
      customPrompts: [],
    };

    addLanguageMutation.mutate(newLanguage);
  };

  const handleUpdateLanguage = () => {
    if (!selectedLanguage) return;
    updateLanguageMutation.mutate(selectedLanguage);
  };

  const handleDeleteLanguage = () => {
    if (!selectedLanguage?.code) return;
    if (confirm('Are you sure you want to delete this language?')) {
      deleteLanguageMutation.mutate(selectedLanguage.code);
    }
  };

  const handleTestTranslation = () => {
    if (!testContent) return;
    testTranslationMutation.mutate({
      sourceLanguage: selectedSourceLanguage,
      targetLanguage: selectedTargetLanguage,
      content: testContent
    });
  };

  const handleBulkTranslate = (targetLanguage: string) => {
    if (confirm(`Are you sure you want to translate all content to ${targetLanguage}? This may take a while.`)) {
      bulkTranslateMutation.mutate({ targetLanguage });
    }
  };

  const addCustomPrompt = () => {
    if (!selectedLanguage) return;
    setSelectedLanguage({
      ...selectedLanguage,
      customPrompts: [...selectedLanguage.customPrompts, '']
    });
  };

  const updateCustomPrompt = (index: number, value: string) => {
    if (!selectedLanguage) return;
    const updatedPrompts = [...selectedLanguage.customPrompts];
    updatedPrompts[index] = value;
    setSelectedLanguage({
      ...selectedLanguage,
      customPrompts: updatedPrompts
    });
  };

  const removeCustomPrompt = (index: number) => {
    if (!selectedLanguage) return;
    const updatedPrompts = selectedLanguage.customPrompts.filter((_, i) => i !== index);
    setSelectedLanguage({
      ...selectedLanguage,
      customPrompts: updatedPrompts
    });
  };

  if (languagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading languages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multilingual Support</h1>
          <p className="text-muted-foreground">
            Manage languages and translations for global forum reach
          </p>
        </div>
        <Button onClick={() => setIsAddingLanguage(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Language
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Languages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Supported Languages
              </CardTitle>
              <CardDescription>
                Manage active languages and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {languages.map((language: Language) => (
                <div
                  key={language.code}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedLanguage?.code === language.code
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedLanguage(language)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{language.flag}</span>
                      <div>
                        <span className="font-medium">{language.nativeName}</span>
                        <p className="text-sm text-muted-foreground">{language.name}</p>
                      </div>
                      {language.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                      {language.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLanguage(language);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {language.translationQuality}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {language.aiProvider}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {languages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No languages configured yet</p>
                  <p className="text-sm">Add languages to enable multilingual support</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Languages */}
          {isAddingLanguage && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Language
                </CardTitle>
                <CardDescription>
                  Select a language to add to your forum
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {supportedLanguages
                  .filter(lang => !languages.some((l: Language) => l.code === lang.code))
                  .map((language) => (
                    <div
                      key={language.code}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleAddLanguage(language.code)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{language.flag}</span>
                          <div>
                            <span className="font-medium">{language.nativeName}</span>
                            <p className="text-sm text-muted-foreground">{language.name}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{language.quality}</Badge>
                      </div>
                    </div>
                  ))}
                <Button
                  variant="outline"
                  onClick={() => setIsAddingLanguage(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Language Editor */}
        <div className="lg:col-span-2">
          {selectedLanguage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-lg">{selectedLanguage.flag}</span>
                      Edit Language: {selectedLanguage.nativeName}
                    </CardTitle>
                    <CardDescription>
                      Configure language settings and translation preferences
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteLanguage}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleUpdateLanguage} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="settings" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="prompts">Custom Prompts</TabsTrigger>
                    <TabsTrigger value="test">Test Translation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nativeName">Native Name</Label>
                        <Input
                          id="nativeName"
                          value={selectedLanguage.nativeName}
                          onChange={(e) => setSelectedLanguage({
                            ...selectedLanguage,
                            nativeName: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="translationQuality">Translation Quality</Label>
                        <Select
                          value={selectedLanguage.translationQuality}
                          onValueChange={(value: any) => setSelectedLanguage({
                            ...selectedLanguage,
                            translationQuality: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="excellent">Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aiProvider">AI Provider</Label>
                      <Select
                        value={selectedLanguage.aiProvider}
                        onValueChange={(value) => setSelectedLanguage({
                          ...selectedLanguage,
                          aiProvider: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="deepseek">DeepSeek</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={selectedLanguage.isActive}
                          onCheckedChange={(checked) => setSelectedLanguage({
                            ...selectedLanguage,
                            isActive: checked
                          })}
                        />
                        <Label htmlFor="isActive">Active Language</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isDefault"
                          checked={selectedLanguage.isDefault}
                          onCheckedChange={(checked) => setSelectedLanguage({
                            ...selectedLanguage,
                            isDefault: checked
                          })}
                        />
                        <Label htmlFor="isDefault">Default Language</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="prompts" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Custom Translation Prompts</h3>
                        <p className="text-sm text-muted-foreground">
                          Add custom prompts to improve translation quality for this language
                        </p>
                      </div>
                      <Button onClick={addCustomPrompt} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Prompt
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {selectedLanguage.customPrompts.map((prompt, index) => (
                        <div key={index} className="flex gap-2">
                          <Textarea
                            value={prompt}
                            onChange={(e) => updateCustomPrompt(index, e.target.value)}
                            placeholder="Enter a custom translation prompt"
                            rows={2}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCustomPrompt(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {selectedLanguage.customPrompts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Translate className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No custom prompts added yet</p>
                        <p className="text-sm">Add prompts to improve translation quality</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Test Translation</h3>
                        <p className="text-sm text-muted-foreground">
                          Test how content translates to this language
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sourceLanguage">Source Language</Label>
                          <Select
                            value={selectedSourceLanguage}
                            onValueChange={setSelectedSourceLanguage}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map((lang: Language) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.flag} {lang.nativeName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="targetLanguage">Target Language</Label>
                          <Select
                            value={selectedTargetLanguage}
                            onValueChange={setSelectedTargetLanguage}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map((lang: Language) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.flag} {lang.nativeName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="testContent">Content to Translate</Label>
                        <Textarea
                          id="testContent"
                          value={testContent}
                          onChange={(e) => setTestContent(e.target.value)}
                          placeholder="Enter content to test translation"
                          rows={4}
                        />
                      </div>

                      <Button
                        onClick={handleTestTranslation}
                        disabled={!testContent || testTranslationMutation.isPending}
                        className="gap-2"
                      >
                        <TestTube className="h-4 w-4" />
                        {testTranslationMutation.isPending ? 'Translating...' : 'Test Translation'}
                      </Button>

                      {testTranslation && (
                        <div className="space-y-2">
                          <Label>Translation Result</Label>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="whitespace-pre-wrap">{testTranslation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Language</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Choose a language from the list to edit its configuration, or add a new language.
                </p>
                <Button onClick={() => setIsAddingLanguage(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Language
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Translation Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Translate className="h-5 w-5" />
            Translation Management
          </CardTitle>
          <CardDescription>
            Manage bulk translations and translation quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Bulk Translation</h3>
              <p className="text-sm text-muted-foreground">
                Translate all existing content to a target language
              </p>
              <div className="space-y-2">
                <Label htmlFor="bulkTargetLanguage">Target Language</Label>
                <Select onValueChange={(value) => handleBulkTranslate(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang: Language) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.nativeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bulk translation may take several minutes depending on content volume.
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Translations</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentTranslations.slice(0, 5).map((translation: ContentTranslation) => (
                  <div key={translation.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {translation.sourceLanguage} → {translation.targetLanguage}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {translation.contentType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={translation.isHumanReviewed ? "default" : "secondary"} className="text-xs">
                          {translation.isHumanReviewed ? "Reviewed" : "Auto"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(translation.translationQuality * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {translation.translatedContent}
                    </p>
                  </div>
                ))}
                {recentTranslations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent translations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Translation Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{languages.length}</div>
              <div className="text-sm text-muted-foreground">Supported Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {languages.filter((l: Language) => l.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{recentTranslations.length}</div>
              <div className="text-sm text-muted-foreground">Recent Translations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {recentTranslations.filter((t: ContentTranslation) => t.isHumanReviewed).length}
              </div>
              <div className="text-sm text-muted-foreground">Human Reviewed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
