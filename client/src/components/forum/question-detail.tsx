import { useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import AnswerForm from "@/components/forum/answer-form";
import RelatedQuestions from "@/components/forum/related-questions";
import SchemaMarkup from "@/components/seo/schema-markup";
import { AnswerWithDetails, QuestionWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function QuestionDetail() {
  const { id } = useParams();
  const [location] = useLocation();
  const { toast } = useToast();
  const questionId = Number(id);
  const currentUrl = window.location.origin + location;

  // Fetch question details
  const { data: question, isLoading: questionLoading } = useQuery<QuestionWithDetails>({
    queryKey: [`/api/questions/${questionId}`],
  });

  // Fetch answers for this question
  const { data: answers, isLoading: answersLoading } = useQuery<AnswerWithDetails[]>({
    queryKey: [`/api/questions/${questionId}/answers`],
    enabled: !!questionId,
  });

  // Track question view
  useEffect(() => {
    if (questionId) {
      apiRequest(`/api/questions/${questionId}/view`, {
        method: "POST"
      }).catch((error) => console.error("Failed to track view:", error));
    }
  }, [questionId]);

  // Vote on an answer
  const voteMutation = useMutation({
    mutationFn: async ({ answerId, isUpvote }: { answerId: number; isUpvote: boolean }) => {
      return apiRequest(`/api/answers/${answerId}/vote`, {
        method: "POST",
        body: JSON.stringify({ isUpvote })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}/answers`] });
      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to vote: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleVote = (answerId: number, isUpvote: boolean) => {
    voteMutation.mutate({ answerId, isUpvote });
  };

  if (questionLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-primary-500 rounded-full"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-xl font-medium mb-4">Question not found</h3>
        <Link href="/forum">
          <Button variant="outline">Return to Forum</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Insert structured data for SEO */}
      <SchemaMarkup 
        question={question}
        answers={answers} 
        url={currentUrl}
      />
      
      <div className="md:col-span-3">
        <Glassmorphism className="gradient-border rounded-xl overflow-hidden shadow-glow">
          {/* Question Header */}
          <div className="p-6 border-b border-dark-300">
            <div className="flex items-center space-x-3 mb-4">
              <Link href="/forum" className="text-primary-400 hover:text-primary-300">
                <span className="material-icons">arrow_back</span>
              </Link>
              <div>
                <div className="flex items-center text-xs text-gray-400 mb-2">
                  <span>{question.category?.name || "Uncategorized"}</span>
                  <span className="mx-2">•</span>
                  <span>Posted {formatDate(question.createdAt || new Date())}</span>
                </div>
                <h3 className="text-2xl font-semibold">{question.title}</h3>
              </div>
            </div>

            <div className="flex items-start mt-4">
              <img
                src={question.user.avatar || `https://i.pravatar.cc/150?img=${question.user.id % 70}`}
                alt={`${question.user.displayName || question.user.username}'s avatar`}
                className="w-10 h-10 rounded-full mr-4"
              />

              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="font-medium">{question.user.displayName || question.user.username}</span>
                  <div className="flex items-center ml-2 text-xs text-gray-400">
                    <span className="material-icons text-xs">
                      {question.user.role === "expert" ? "verified" : 
                       question.user.role === "premium" ? "workspace_premium" : "person"}
                    </span>
                    <span className="ml-0.5">{question.user.role}</span>
                  </div>
                  {question.isAiGenerated && (
                    <div className="ml-2 px-2 py-0.5 text-xs bg-secondary-500/20 text-secondary-400 rounded-full">
                      AI Generated
                    </div>
                  )}
                </div>

                <div className="text-gray-300 whitespace-pre-line">
                  {question.content}
                </div>

                <div className="flex items-center mt-4 space-x-4">
                  <button className="inline-flex items-center text-sm text-gray-400 hover:text-primary-400">
                    <span className="material-icons text-sm mr-1">bookmark</span>
                    <span>Save</span>
                  </button>
                  <button className="inline-flex items-center text-sm text-gray-400 hover:text-primary-400">
                    <span className="material-icons text-sm mr-1">share</span>
                    <span>Share</span>
                  </button>
                  <div className="text-xs text-gray-400">
                    {question.views} views
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answers */}
          <div className="p-6 border-b border-dark-300">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">
                {answers?.length || 0} {(answers?.length || 0) === 1 ? "Answer" : "Answers"}
              </h4>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-2">Sort by:</span>
                <select className="bg-dark-300 border border-dark-400 text-gray-300 text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-primary-500">
                  <option>Most Helpful</option>
                  <option>Newest</option>
                  <option>Oldest</option>
                </select>
              </div>
            </div>

            {answersLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary-500 rounded-full"></div>
              </div>
            ) : answers && answers.length > 0 ? (
              answers.map((answer) => (
                <Glassmorphism 
                  key={answer.id}
                  id={`answer-${answer.id}`}
                  className={`mb-6 p-5 rounded-lg ${answer.user.role === "expert" ? "border-primary-500/20" : "border-dark-400"}`}
                >
                  <div className="flex items-start">
                    <img
                      src={answer.user.avatar || `https://i.pravatar.cc/150?img=${answer.user.id % 70}`}
                      alt={`${answer.user.displayName || answer.user.username}'s avatar`}
                      className="w-10 h-10 rounded-full mr-4"
                    />

                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-medium">{answer.user.displayName || answer.user.username}</span>
                        <div className="flex items-center ml-2 text-xs text-gray-400">
                          <span className="material-icons text-xs">
                            {answer.user.role === "expert" ? "verified" : 
                             answer.user.role === "premium" ? "workspace_premium" : "person"}
                          </span>
                          <span className="ml-0.5">{answer.user.role}</span>
                        </div>
                        {answer.isAiGenerated && (
                          <div className="ml-2 px-2 py-0.5 text-xs bg-secondary-500/20 text-secondary-400 rounded-full">
                            AI Generated
                          </div>
                        )}
                        <div className="ml-2 text-xs text-gray-400">
                          {formatDate(answer.createdAt || new Date())}
                        </div>
                      </div>

                      <div className="text-gray-300 whitespace-pre-line">
                        {answer.content}
                      </div>

                      <div className="flex items-center mt-4 space-x-4">
                        <button 
                          className="inline-flex items-center text-sm text-gray-400 hover:text-primary-400"
                          onClick={() => handleVote(answer.id, true)}
                        >
                          <span className="material-icons text-sm mr-1">thumb_up</span>
                          <span>{answer.votes || 0}</span>
                        </button>
                        <button 
                          className="inline-flex items-center text-sm text-gray-400 hover:text-primary-400"
                          onClick={() => handleVote(answer.id, false)}
                        >
                          <span className="material-icons text-sm mr-1">thumb_down</span>
                        </button>
                        <button className="inline-flex items-center text-sm text-gray-400 hover:text-primary-400">
                          <span className="material-icons text-sm mr-1">comment</span>
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Glassmorphism>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No answers yet. Be the first to answer!
              </div>
            )}
          </div>

          {/* Add Answer Form */}
          <AnswerForm questionId={questionId} />
        </Glassmorphism>
      </div>
      
      {/* Sidebar with related questions */}
      <div className="md:col-span-1 space-y-6">
        <RelatedQuestions 
          questionId={questionId}
          title={question.title}
          content={question.content}
          categoryId={question.category?.id}
        />
      </div>
    </div>
  );
}
