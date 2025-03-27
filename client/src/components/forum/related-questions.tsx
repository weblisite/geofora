import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-text";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, truncateText } from "@/lib/utils";
import { useAI } from "@/hooks/use-ai";
import { QuestionWithDetails } from "@shared/schema";

interface RelatedQuestionsProps {
  questionId: number;
  title: string;
  content: string;
  categoryId?: number;
}

export default function RelatedQuestions({ questionId, title, content, categoryId }: RelatedQuestionsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<QuestionWithDetails[]>([]);

  // Fetch all questions to find related ones
  const { data: allQuestions, isLoading } = useQuery<QuestionWithDetails[]>({
    queryKey: ["/api/questions"],
  });

  // Get AI functions for similarity analysis
  const { generateInterlinking } = useAI({
    onSuccess: (data) => {
      if (allQuestions && Array.isArray(data)) {
        // Map suggested interlinks to actual questions
        const suggestedQuestions = data
          .filter(link => link.contentType === "question" && link.contentId !== questionId)
          .map(link => {
            return allQuestions.find(q => q.id === link.contentId);
          })
          .filter(q => q !== undefined) as QuestionWithDetails[];
          
        setRelatedQuestions(suggestedQuestions);
        setIsAnalyzing(false);
      }
    },
    onError: () => {
      setIsAnalyzing(false);
      // Fallback to category-based filtering
      findCategoryBasedRelated();
    }
  });

  // Find related questions based on category when AI fails
  const findCategoryBasedRelated = () => {
    if (!allQuestions || !categoryId) return;
    
    const sameCategory = allQuestions
      .filter(q => q.category?.id === categoryId && q.id !== questionId)
      .slice(0, 5);
      
    setRelatedQuestions(sameCategory);
  };

  // Analyze content for related questions
  useEffect(() => {
    if (allQuestions && allQuestions.length > 0 && title && content) {
      setIsAnalyzing(true);
      
      // Transform questions to the format expected by the AI service
      const targetContents = allQuestions.map(q => ({
        id: q.id,
        type: "question",
        title: q.title,
        content: q.content
      }));
      
      // Generate interlinking suggestions using the current question
      generateInterlinking.mutate({
        content,
        sourceTitle: title,
        sourceType: "question",
        sourceId: questionId
      });
    }
  }, [allQuestions, questionId, title, content]);

  if (isLoading || isAnalyzing) {
    return (
      <Glassmorphism className="p-5 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Related Questions</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </Glassmorphism>
    );
  }

  if (relatedQuestions.length === 0) {
    return null;
  }

  return (
    <Glassmorphism className="p-5 rounded-lg">
      <h3 className="text-lg font-medium mb-4">
        <GradientText>Related Questions</GradientText>
      </h3>
      <div className="space-y-3">
        {relatedQuestions.map((question) => (
          <div key={question.id} className="border-b border-dark-400 pb-3 last:border-0">
            <Link href={`/forum/${question.id}`}>
              <a className="block hover:text-primary-400 transition-colors">
                <h4 className="font-medium mb-1">{question.title}</h4>
                <p className="text-sm text-gray-400 mb-1">
                  {truncateText(question.content, 100)}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>{question.answers} {question.answers === 1 ? "answer" : "answers"}</span>
                  <span className="mx-1">•</span>
                  <span>{formatDate(question.createdAt || new Date())}</span>
                </div>
              </a>
            </Link>
          </div>
        ))}
      </div>
    </Glassmorphism>
  );
}