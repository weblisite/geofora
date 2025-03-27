import { useState } from "react";
import { useAI } from "@/hooks/use-ai";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GradientText } from "@/components/ui/gradient-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERSONA_TYPES } from "@/lib/constants";
import { AlertCircle, FileCheck, Lightbulb, LinkIcon, Scale, SearchIcon, Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIPanel() {
  const [activeTab, setActiveTab] = useState("content");
  const [prompt, setPrompt] = useState("");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedPersona, setSelectedPersona] = useState<"beginner" | "intermediate" | "expert" | "moderator">("expert");
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
      personaType: selectedPersona,
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
      personaType: selectedPersona,
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
    
    // Format keywords section
    formattedResult += "## Keywords\n";
    if (result.keywords && result.keywords.length > 0) {
      formattedResult += result.keywords.map(keyword => `- ${keyword}`).join("\n");
    } else {
      formattedResult += "No keywords identified.";
    }
    
    // Format suggestions section
    formattedResult += "\n\n## Suggestions\n";
    if (result.suggestions && result.suggestions.length > 0) {
      formattedResult += result.suggestions.map(suggestion => `- ${suggestion}`).join("\n");
    } else {
      formattedResult += "No suggestions provided.";
    }
    
    // Format score section
    if (result.score !== undefined) {
      formattedResult += `\n\n## SEO Score\n${result.score}/10`;
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
      result.forEach((item, index) => {
        formattedResult += `## Suggestion ${index + 1}\n\n`;
        formattedResult += `- **Target Question:** ${item.questionTitle}\n`;
        formattedResult += `- **Relevance Score:** ${item.relevanceScore}/10\n`;
        formattedResult += `- **Suggested Link Text:** "${item.suggestedLinkText}"\n`;
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
                {Object.entries(PERSONA_TYPES).map(([key, persona]) => (
                  <Button
                    key={key}
                    variant={selectedPersona === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPersona(key as any)}
                    className="flex items-center gap-1"
                  >
                    {key === "expert" && <Sparkles className="w-4 h-4" />}
                    {key === "beginner" && <AlertCircle className="w-4 h-4" />}
                    {key === "intermediate" && <Zap className="w-4 h-4" />}
                    {key === "moderator" && <Scale className="w-4 h-4" />}
                    {persona.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-2">Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a prompt for content generation..."
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
              Generate Content
            </Button>
          </div>
        );
      
      case "seo-questions":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Topic</label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic or keyword for question generation..."
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="block text-sm">Number of Questions</label>
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
                {Object.entries(PERSONA_TYPES).map(([key, persona]) => (
                  <Button
                    key={key}
                    variant={selectedPersona === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPersona(key as any)}
                  >
                    {persona.name}
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
              Generate SEO Questions
            </Button>
          </div>
        );
      
      case "seo-analysis":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Title</label>
              <Textarea
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Enter your question or content title..."
                className="min-h-[50px]"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">Content</label>
              <Textarea
                value={seoContent}
                onChange={(e) => setSeoContent(e.target.value)}
                placeholder="Enter your content for SEO analysis..."
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
              Analyze SEO
            </Button>
          </div>
        );
      
      case "interlinking":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Content for Interlinking Analysis</label>
              <Textarea
                value={interlinkContent}
                onChange={(e) => setInterlinkContent(e.target.value)}
                placeholder="Enter your content to generate interlinking suggestions..."
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
              Generate Interlinking Suggestions
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
            <GradientText className="text-lg font-medium">AI Assistant Panel</GradientText>
          </div>
          <p className="text-sm text-gray-400">
            Use AI to generate content, analyze SEO, and enhance your forum's performance.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1">
          <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-dark-400">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo-questions">SEO Questions</TabsTrigger>
              </TabsList>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="seo-analysis">SEO Analysis</TabsTrigger>
                <TabsTrigger value="interlinking">Interlinking</TabsTrigger>
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