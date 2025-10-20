import { useState } from "react";
import { useAI } from "@/hooks/use-ai";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GradientText } from "@/components/ui/gradient-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENT_TYPES } from "@/lib/constants";
import { AlertCircle, FileCheck, Lightbulb, LinkIcon, Scale, SearchIcon, Sparkles, Zap, Brain, Gem, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIPanel() {
  const [activeTab, setActiveTab] = useState("content");
  const [prompt, setPrompt] = useState("");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedAgent, setSelectedAgent] = useState<"beginner" | "intermediate" | "expert" | "smart" | "genius" | "intelligent" | "moderator">("expert");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoContent, setSeoContent] = useState("");
  const [interlinkContent, setInterlinkContent] = useState("");
  
  const { toast } = useToast();
  const { 
    generateContent, 
    generateSeoQuestions, 
    analyzeSeo, 
    generateInterlinking 
  } = useAI({
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleGenerateContent = async () => {
    if (!prompt) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    const result = await generateContent.mutateAsync({
      prompt,
              agentType: selectedAgent,
    });

    setContent(result);
  };

  const handleGenerateSeoQuestions = async () => {
    if (!topic) {
      toast({
        title: "Input Required",
        description: "Please enter a topic to generate questions.",
        variant: "destructive",
      });
      return;
    }

    const result = await generateSeoQuestions.mutateAsync({
      topic,
      count: questionCount,
              agentType: selectedAgent,
    });

    setContent(result.join("\n\n"));
  };

  const handleAnalyzeSeo = async () => {
    if (!seoTitle || !seoContent) {
      toast({
        title: "Input Required",
        description: "Please enter both title and content for SEO analysis.",
        variant: "destructive",
      });
      return;
    }

    const result = await analyzeSeo.mutateAsync({
      title: seoTitle,
      content: seoContent,
    });

    // Format the analysis results
    let formattedResult = "# SEO Analysis Results\n\n";
    
    // Format primary and secondary keywords section
    formattedResult += "## Keywords\n";
    if (result.primaryKeyword) {
      formattedResult += `### Primary Keyword\n- ${result.primaryKeyword}\n\n`;
    }
    
    formattedResult += "### Secondary Keywords\n";
    if (result.secondaryKeywords && result.secondaryKeywords.length > 0) {
      formattedResult += result.secondaryKeywords.map((keyword: string) => `- ${keyword}`).join("\n");
    } else {
      formattedResult += "No secondary keywords identified.";
    }
    
    // Format suggested tags section
    formattedResult += "\n\n## Suggested Tags\n";
    if (result.suggestedTags && result.suggestedTags.length > 0) {
      formattedResult += result.suggestedTags.map((tag: string) => `- ${tag}`).join("\n");
    } else {
      formattedResult += "No tags suggested.";
    }
    
    // Format improvement tips section
    formattedResult += "\n\n## Improvement Tips\n";
    if (result.improvementTips && result.improvementTips.length > 0) {
      formattedResult += result.improvementTips.map((suggestion: string) => `- ${suggestion}`).join("\n");
    } else {
      formattedResult += "No improvement tips provided.";
    }
    
    // Format score section
    if (result.seoScore !== undefined) {
      formattedResult += `\n\n## SEO Score\n${result.seoScore}/100`;
    }

    setContent(formattedResult);
  };

  const handleGenerateInterlinking = async () => {
    if (!interlinkContent) {
      toast({
        title: "Input Required",
        description: "Please enter content to generate interlinking suggestions.",
        variant: "destructive",
      });
      return;
    }

    const result = await generateInterlinking.mutateAsync({
      content: interlinkContent,
    });

    // Format the interlinking results
    let formattedResult = "# Interlinking Suggestions\n\n";
    
    if (result && result.length > 0) {
      result.forEach((item: { questionId: number, questionTitle: string, relevanceScore: number, anchorText: string }, index: number) => {
        formattedResult += `## Suggestion ${index + 1}\n\n`;
        formattedResult += `- **Target Question:** ${item.questionTitle || "Unknown Title"}\n`;
        formattedResult += `- **Relevance Score:** ${item.relevanceScore}/100\n`;
        formattedResult += `- **Suggested Link Text:** "${item.anchorText}"\n`;
        formattedResult += `- **Link to:** /forum/${item.questionId}\n\n`;
      });
    } else {
      formattedResult += "No interlinking suggestions found. Try content with more specific topics.";
    }

    setContent(formattedResult);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Select AI Persona</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(AGENT_TYPES).map(([key, agent]) => (
                  <Button
                    key={key}
                    variant={selectedAgent === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAgent(key as any)}
                    className="flex items-center gap-1"
                  >
                    {key === "expert" && <Sparkles className="w-4 h-4" />}
                    {key === "beginner" && <AlertCircle className="w-4 h-4" />}
                    {key === "intermediate" && <Zap className="w-4 h-4" />}
                    {key === "smart" && <Lightbulb className="w-4 h-4" />}
                    {key === "genius" && <Trophy className="w-4 h-4" />}
                    {key === "intelligent" && <Brain className="w-4 h-4" />}
                    {key === "moderator" && <Scale className="w-4 h-4" />}
                    {agent.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-2">Dialogue Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a prompt for temporal dialogue generation..."
                className="min-h-[100px]"
              />
            </div>
            
            <Button 
              onClick={handleGenerateContent}
              disabled={generateContent.isPending || !prompt}
              className="w-full"
            >
              {generateContent.isPending ? (
                <div className="animate-spin w-4 h-4 border-t-2 border-b-2 border-[#ffffff] rounded-full mr-2"></div>
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Temporal Dialogue
            </Button>
          </div>
        );
      
      case "seo-questions":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Business Topic</label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your business topic or industry for analysis..."
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="block text-sm">Analysis Depth</label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                  disabled={questionCount <= 1}
                >
                  -
                </Button>
                <span className="mx-2">{questionCount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuestionCount(Math.min(10, questionCount + 1))}
                  disabled={questionCount >= 10}
                >
                  +
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-2">AI Persona Level</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(AGENT_TYPES).map(([key, agent]) => (
                  <Button
                    key={key}
                    variant={selectedAgent === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAgent(key as any)}
                  >
                    {agent.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateSeoQuestions}
              disabled={generateSeoQuestions.isPending || !topic}
              className="w-full"
            >
              {generateSeoQuestions.isPending ? (
                <div className="animate-spin w-4 h-4 border-t-2 border-b-2 border-[#ffffff] rounded-full mr-2"></div>
              ) : (
                <SearchIcon className="w-4 h-4 mr-2" />
              )}
              Analyze Business Context
            </Button>
          </div>
        );
      
      case "seo-analysis":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Brand Voice Title</label>
              <Textarea
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Enter your brand voice title or description..."
                className="min-h-[50px]"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">Content to Analyze</label>
              <Textarea
                value={seoContent}
                onChange={(e) => setSeoContent(e.target.value)}
                placeholder="Enter content to analyze for brand voice consistency..."
                className="min-h-[100px]"
              />
            </div>
            
            <Button 
              onClick={handleAnalyzeSeo}
              disabled={analyzeSeo.isPending || !seoTitle || !seoContent}
              className="w-full"
            >
              {analyzeSeo.isPending ? (
                <div className="animate-spin w-4 h-4 border-t-2 border-b-2 border-[#ffffff] rounded-full mr-2"></div>
              ) : (
                <FileCheck className="w-4 h-4 mr-2" />
              )}
              Analyze Brand Voice
            </Button>
          </div>
        );
      
      case "interlinking":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Content for Export</label>
              <Textarea
                value={interlinkContent}
                onChange={(e) => setInterlinkContent(e.target.value)}
                placeholder="Enter content to prepare for AI training dataset export..."
                className="min-h-[150px]"
              />
            </div>
            
            <Button 
              onClick={handleGenerateInterlinking}
              disabled={generateInterlinking.isPending || !interlinkContent}
              className="w-full"
            >
              {generateInterlinking.isPending ? (
                <div className="animate-spin w-4 h-4 border-t-2 border-b-2 border-[#ffffff] rounded-full mr-2"></div>
              ) : (
                <LinkIcon className="w-4 h-4 mr-2" />
              )}
              Prepare Data Export
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Glassmorphism className="p-0 rounded-lg border border-dark-400 h-full overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-dark-400">
          <div className="flex items-center mb-2">
            <Lightbulb className="w-5 h-5 mr-2 text-primary-400" />
            <GradientText className="text-lg font-medium">Multi-Model AI Intelligence</GradientText>
          </div>
          <p className="text-sm text-gray-400">
            Leverage 6 AI providers and 8 specialized personas for Generative Engine Optimization.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1">
          <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-dark-400">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="content">Temporal Dialogue</TabsTrigger>
                <TabsTrigger value="seo-questions">Business Analysis</TabsTrigger>
              </TabsList>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="seo-analysis">Brand Voice</TabsTrigger>
                <TabsTrigger value="interlinking">Data Export</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                {renderTabContent()}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="w-full md:w-1/2 p-4 overflow-auto">
            <h4 className="text-sm font-medium mb-2">Generated Output</h4>
            <div className="border border-dark-400 rounded-lg p-4 bg-dark-500 h-[400px] overflow-auto">
              {content ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  {content.split('\n').map((line, i) => (
                    <div key={i}>
                      {line || <br />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  <div className="text-center">
                    <Lightbulb className="w-5 h-5 mx-auto mb-2 opacity-50" />
                    <p>AI-generated content will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Glassmorphism>
  );
}