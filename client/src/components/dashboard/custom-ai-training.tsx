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
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Play, 
  Pause, 
  Stop, 
  Download, 
  Upload,
  Settings,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Target,
  BarChart3,
  FileText,
  Database,
  Cpu,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  GitBranch,
  Code,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomModel {
  id: string;
  name: string;
  description: string;
  baseModel: string;
  trainingData: TrainingDataset[];
  hyperparameters: Hyperparameters;
  status: 'draft' | 'training' | 'completed' | 'failed' | 'deployed';
  performance: ModelPerformance;
  cost: TrainingCost;
  createdAt: string;
  updatedAt: string;
  deployedAt?: string;
}

interface TrainingDataset {
  id: string;
  name: string;
  type: 'questions' | 'answers' | 'conversations' | 'custom';
  size: number;
  quality: number;
  isActive: boolean;
  createdAt: string;
}

interface Hyperparameters {
  learningRate: number;
  batchSize: number;
  epochs: number;
  temperature: number;
  maxTokens: number;
  customInstructions: string[];
}

interface ModelPerformance {
  accuracy: number;
  perplexity: number;
  bleuScore: number;
  rougeScore: number;
  humanEvaluation: number;
  lastEvaluated: string;
}

interface TrainingCost {
  estimatedCost: number;
  actualCost: number;
  tokensUsed: number;
  trainingTime: number;
  currency: string;
}

interface TrainingJob {
  id: string;
  modelId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  logs: string[];
  error?: string;
}

const baseModels = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', cost: 0.002, quality: 'good' },
  { id: 'gpt-4', name: 'GPT-4', cost: 0.03, quality: 'excellent' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', cost: 0.015, quality: 'excellent' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', cost: 0.0025, quality: 'good' },
  { id: 'gemini-pro', name: 'Gemini Pro', cost: 0.001, quality: 'good' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', cost: 0.0014, quality: 'good' }
];

export default function CustomAITraining() {
  const [selectedModel, setSelectedModel] = useState<CustomModel | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<TrainingDataset | null>(null);
  const queryClient = useQueryClient();

  // Fetch custom models
  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['/api/custom-models'],
    queryFn: async () => {
      const response = await fetch('/api/custom-models');
      if (!response.ok) throw new Error('Failed to fetch models');
      return response.json();
    }
  });

  // Fetch training datasets
  const { data: datasets = [] } = useQuery({
    queryKey: ['/api/training-datasets'],
    queryFn: async () => {
      const response = await fetch('/api/training-datasets');
      if (!response.ok) throw new Error('Failed to fetch datasets');
      return response.json();
    }
  });

  // Fetch training jobs
  const { data: trainingJobs = [] } = useQuery({
    queryKey: ['/api/training-jobs'],
    queryFn: async () => {
      const response = await fetch('/api/training-jobs');
      if (!response.ok) throw new Error('Failed to fetch training jobs');
      return response.json();
    }
  });

  // Create model mutation
  const createModelMutation = useMutation({
    mutationFn: async (modelData: Partial<CustomModel>) => {
      const response = await fetch('/api/custom-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData)
      });
      if (!response.ok) throw new Error('Failed to create model');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-models'] });
      toast.success('Custom model created successfully');
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Failed to create model: ${error.message}`);
    }
  });

  // Update model mutation
  const updateModelMutation = useMutation({
    mutationFn: async ({ id, ...modelData }: Partial<CustomModel> & { id: string }) => {
      const response = await fetch(`/api/custom-models/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData)
      });
      if (!response.ok) throw new Error('Failed to update model');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-models'] });
      toast.success('Custom model updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update model: ${error.message}`);
    }
  });

  // Delete model mutation
  const deleteModelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/custom-models/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete model');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-models'] });
      toast.success('Custom model deleted successfully');
      setSelectedModel(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete model: ${error.message}`);
    }
  });

  // Start training mutation
  const startTrainingMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`/api/custom-models/${modelId}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to start training');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-models'] });
      toast.success('Training started successfully');
      setIsTraining(true);
    },
    onError: (error) => {
      toast.error(`Failed to start training: ${error.message}`);
    }
  });

  // Stop training mutation
  const stopTrainingMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/training-jobs/${jobId}/stop`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to stop training');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-jobs'] });
      toast.success('Training stopped successfully');
      setIsTraining(false);
    },
    onError: (error) => {
      toast.error(`Failed to stop training: ${error.message}`);
    }
  });

  // Deploy model mutation
  const deployModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`/api/custom-models/${modelId}/deploy`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to deploy model');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-models'] });
      toast.success('Model deployed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to deploy model: ${error.message}`);
    }
  });

  // Test model mutation
  const testModelMutation = useMutation({
    mutationFn: async ({ modelId, prompt }: { modelId: string; prompt: string }) => {
      const response = await fetch(`/api/custom-models/${modelId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) throw new Error('Failed to test model');
      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Model test completed');
      // Handle test response display
    },
    onError: (error) => {
      toast.error(`Failed to test model: ${error.message}`);
    }
  });

  const handleCreateModel = () => {
    const newModel: Partial<CustomModel> = {
      name: '',
      description: '',
      baseModel: 'gpt-3.5-turbo',
      trainingData: [],
      hyperparameters: {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 3,
        temperature: 0.7,
        maxTokens: 2048,
        customInstructions: []
      },
      status: 'draft',
      performance: {
        accuracy: 0,
        perplexity: 0,
        bleuScore: 0,
        rougeScore: 0,
        humanEvaluation: 0,
        lastEvaluated: ''
      },
      cost: {
        estimatedCost: 0,
        actualCost: 0,
        tokensUsed: 0,
        trainingTime: 0,
        currency: 'USD'
      }
    };
    setSelectedModel(newModel as CustomModel);
    setIsCreating(true);
  };

  const handleSaveModel = () => {
    if (!selectedModel) return;

    if (isCreating) {
      createModelMutation.mutate(selectedModel);
    } else {
      updateModelMutation.mutate(selectedModel);
    }
  };

  const handleDeleteModel = () => {
    if (!selectedModel?.id) return;
    if (confirm('Are you sure you want to delete this model?')) {
      deleteModelMutation.mutate(selectedModel.id);
    }
  };

  const handleStartTraining = () => {
    if (!selectedModel?.id) return;
    startTrainingMutation.mutate(selectedModel.id);
  };

  const handleStopTraining = (jobId: string) => {
    stopTrainingMutation.mutate(jobId);
  };

  const handleDeployModel = () => {
    if (!selectedModel?.id) return;
    deployModelMutation.mutate(selectedModel.id);
  };

  const addCustomInstruction = () => {
    if (!selectedModel) return;
    setSelectedModel({
      ...selectedModel,
      hyperparameters: {
        ...selectedModel.hyperparameters,
        customInstructions: [...selectedModel.hyperparameters.customInstructions, '']
      }
    });
  };

  const updateCustomInstruction = (index: number, value: string) => {
    if (!selectedModel) return;
    const updatedInstructions = [...selectedModel.hyperparameters.customInstructions];
    updatedInstructions[index] = value;
    setSelectedModel({
      ...selectedModel,
      hyperparameters: {
        ...selectedModel.hyperparameters,
        customInstructions: updatedInstructions
      }
    });
  };

  const removeCustomInstruction = (index: number) => {
    if (!selectedModel) return;
    const updatedInstructions = selectedModel.hyperparameters.customInstructions.filter((_, i) => i !== index);
    setSelectedModel({
      ...selectedModel,
      hyperparameters: {
        ...selectedModel.hyperparameters,
        customInstructions: updatedInstructions
      }
    });
  };

  const addDataset = (dataset: TrainingDataset) => {
    if (!selectedModel || selectedModel.trainingData.some(d => d.id === dataset.id)) return;
    setSelectedModel({
      ...selectedModel,
      trainingData: [...selectedModel.trainingData, dataset]
    });
  };

  const removeDataset = (datasetId: string) => {
    if (!selectedModel) return;
    setSelectedModel({
      ...selectedModel,
      trainingData: selectedModel.trainingData.filter(d => d.id !== datasetId)
    });
  };

  if (modelsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading custom models...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom AI Model Training</h1>
          <p className="text-muted-foreground">
            Train custom AI models based on your forum data and brand voice
          </p>
        </div>
        <Button onClick={handleCreateModel} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Model
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Models List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Custom Models
              </CardTitle>
              <CardDescription>
                Manage your custom AI models and training jobs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {models.map((model: CustomModel) => (
                <div
                  key={model.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModel?.id === model.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    setSelectedModel(model);
                    setIsCreating(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span className="font-medium">{model.name}</span>
                      <Badge variant={
                        model.status === 'completed' ? 'default' :
                        model.status === 'training' ? 'secondary' :
                        model.status === 'failed' ? 'destructive' :
                        'outline'
                      } className="text-xs">
                        {model.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModel(model);
                        setIsCreating(false);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {model.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {model.baseModel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {model.trainingData.length} datasets
                    </Badge>
                    {model.status === 'deployed' && (
                      <Badge variant="default" className="text-xs">
                        Deployed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {models.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No custom models created yet</p>
                  <p className="text-sm">Create your first custom model to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Training Jobs */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active Training Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trainingJobs.filter((job: TrainingJob) => job.status === 'running').map((job: TrainingJob) => (
                <div key={job.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Training Job #{job.id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        Started {new Date(job.startTime).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStopTraining(job.id)}
                    >
                      <Stop className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="mt-1" />
                  </div>
                </div>
              ))}
              {trainingJobs.filter((job: TrainingJob) => job.status === 'running').length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active training jobs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Model Editor */}
        <div className="lg:col-span-2">
          {selectedModel ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      {isCreating ? 'Create New Model' : 'Edit Model'}
                    </CardTitle>
                    <CardDescription>
                      Configure your custom AI model settings and training parameters
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isCreating && (
                      <>
                        {selectedModel.status === 'completed' && (
                          <Button onClick={handleDeployModel} variant="outline" size="sm">
                            <Zap className="h-4 w-4 mr-2" />
                            Deploy
                          </Button>
                        )}
                        {selectedModel.status === 'draft' && (
                          <Button onClick={handleStartTraining} size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Start Training
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteModel}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button onClick={handleSaveModel} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="datasets">Training Data</TabsTrigger>
                    <TabsTrigger value="hyperparameters">Hyperparameters</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="test">Test Model</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Model Name</Label>
                        <Input
                          id="name"
                          value={selectedModel.name}
                          onChange={(e) => setSelectedModel({
                            ...selectedModel,
                            name: e.target.value
                          })}
                          placeholder="e.g., My Brand Voice Model"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="baseModel">Base Model</Label>
                        <Select
                          value={selectedModel.baseModel}
                          onValueChange={(value) => setSelectedModel({
                            ...selectedModel,
                            baseModel: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {baseModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{model.name}</span>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Badge variant="outline" className="text-xs">
                                      {model.quality}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      ${model.cost}/1K tokens
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={selectedModel.description}
                        onChange={(e) => setSelectedModel({
                          ...selectedModel,
                          description: e.target.value
                        })}
                        placeholder="Describe the purpose and characteristics of this custom model"
                        rows={3}
                      />
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Choose a base model that best fits your needs. GPT-4 offers the highest quality but costs more, 
                        while GPT-3.5 Turbo provides good quality at a lower cost.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="datasets" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Training Datasets</h3>
                        <p className="text-sm text-muted-foreground">
                          Select datasets to train your custom model
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Dataset
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {selectedModel.trainingData.map((dataset) => (
                        <div key={dataset.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{dataset.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {dataset.type} • {dataset.size.toLocaleString()} samples • Quality: {dataset.quality}%
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeDataset(dataset.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedModel.trainingData.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No training datasets selected</p>
                        <p className="text-sm">Add datasets to train your custom model</p>
                      </div>
                    )}

                    {/* Available Datasets */}
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Available Datasets</h4>
                      <div className="space-y-2">
                        {datasets.filter(d => !selectedModel.trainingData.some(td => td.id === d.id)).map((dataset: TrainingDataset) => (
                          <div key={dataset.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => addDataset(dataset)}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{dataset.name}</h5>
                                <p className="text-sm text-muted-foreground">
                                  {dataset.type} • {dataset.size.toLocaleString()} samples • Quality: {dataset.quality}%
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="hyperparameters" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="learningRate">Learning Rate</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[selectedModel.hyperparameters.learningRate]}
                            onValueChange={(value) => setSelectedModel({
                              ...selectedModel,
                              hyperparameters: {
                                ...selectedModel.hyperparameters,
                                learningRate: value[0]
                              }
                            })}
                            min={0.0001}
                            max={0.01}
                            step={0.0001}
                            className="w-full"
                          />
                          <div className="text-sm text-muted-foreground text-center">
                            {selectedModel.hyperparameters.learningRate}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batchSize">Batch Size</Label>
                        <Select
                          value={selectedModel.hyperparameters.batchSize.toString()}
                          onValueChange={(value) => setSelectedModel({
                            ...selectedModel,
                            hyperparameters: {
                              ...selectedModel.hyperparameters,
                              batchSize: parseInt(value)
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16">16</SelectItem>
                            <SelectItem value="32">32</SelectItem>
                            <SelectItem value="64">64</SelectItem>
                            <SelectItem value="128">128</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="epochs">Epochs</Label>
                        <Select
                          value={selectedModel.hyperparameters.epochs.toString()}
                          onValueChange={(value) => setSelectedModel({
                            ...selectedModel,
                            hyperparameters: {
                              ...selectedModel.hyperparameters,
                              epochs: parseInt(value)
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temperature">Temperature</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[selectedModel.hyperparameters.temperature]}
                            onValueChange={(value) => setSelectedModel({
                              ...selectedModel,
                              hyperparameters: {
                                ...selectedModel.hyperparameters,
                                temperature: value[0]
                              }
                            })}
                            min={0.1}
                            max={2.0}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="text-sm text-muted-foreground text-center">
                            {selectedModel.hyperparameters.temperature}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Select
                        value={selectedModel.hyperparameters.maxTokens.toString()}
                        onValueChange={(value) => setSelectedModel({
                          ...selectedModel,
                          hyperparameters: {
                            ...selectedModel.hyperparameters,
                            maxTokens: parseInt(value)
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="512">512</SelectItem>
                          <SelectItem value="1024">1024</SelectItem>
                          <SelectItem value="2048">2048</SelectItem>
                          <SelectItem value="4096">4096</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Custom Instructions</h4>
                        <Button onClick={addCustomInstruction} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Instruction
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {selectedModel.hyperparameters.customInstructions.map((instruction, index) => (
                          <div key={index} className="flex gap-2">
                            <Textarea
                              value={instruction}
                              onChange={(e) => updateCustomInstruction(index, e.target.value)}
                              placeholder="Enter a custom instruction for the model"
                              rows={2}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeCustomInstruction(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Accuracy</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{Math.round(selectedModel.performance.accuracy * 100)}%</div>
                          <p className="text-xs text-muted-foreground">Model accuracy</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Perplexity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedModel.performance.perplexity.toFixed(2)}</div>
                          <p className="text-xs text-muted-foreground">Lower is better</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">BLEU Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedModel.performance.bleuScore.toFixed(3)}</div>
                          <p className="text-xs text-muted-foreground">Translation quality</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">ROUGE Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedModel.performance.rougeScore.toFixed(3)}</div>
                          <p className="text-xs text-muted-foreground">Summarization quality</p>
                        </CardContent>
                      </Card>
                    </div>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Human Evaluation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{Math.round(selectedModel.performance.humanEvaluation * 100)}%</div>
                        <p className="text-xs text-muted-foreground">Human-rated quality</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Test Model</h3>
                        <p className="text-sm text-muted-foreground">
                          Test your custom model with sample prompts
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="testPrompt">Test Prompt</Label>
                        <Textarea
                          id="testPrompt"
                          placeholder="Enter a prompt to test your custom model"
                          rows={4}
                        />
                      </div>

                      <Button
                        disabled={testModelMutation.isPending}
                        className="gap-2"
                      >
                        <TestTube className="h-4 w-4" />
                        {testModelMutation.isPending ? 'Testing...' : 'Test Model'}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Model</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Choose a custom model from the list to edit its configuration, or create a new one.
                </p>
                <Button onClick={handleCreateModel} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Model
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Training Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{models.length}</div>
              <div className="text-sm text-muted-foreground">Total Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {models.filter((m: CustomModel) => m.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {models.filter((m: CustomModel) => m.status === 'deployed').length}
              </div>
              <div className="text-sm text-muted-foreground">Deployed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${models.reduce((acc: number, m: CustomModel) => acc + m.cost.actualCost, 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
