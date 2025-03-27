import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { QuestionWithDetails } from "@shared/schema";
import { formatNumber } from "@/lib/utils";

export default function QuestionList() {
  const [selectedCategory, setSelectedCategory] = useState(1); // default to "All Topics"
  const [searchQuery, setSearchQuery] = useState("");

  const { data: questions, isLoading } = useQuery<QuestionWithDetails[]>({
    queryKey: ['/api/questions'],
  });

  const filteredQuestions = questions?.filter(question => {
    if (selectedCategory !== 1 && question.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery && !question.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <Glassmorphism className="gradient-border rounded-xl overflow-hidden shadow-glow">
      {/* Forum Header */}
      <div className="flex items-center justify-between p-6 border-b border-dark-300">
        <div className="flex items-center space-x-3">
          <div className="text-primary-500 flex items-center justify-center w-10 h-10 rounded-full bg-dark-100 shadow-glow">
            <span className="material-icons">forum</span>
          </div>
          <h3 className="text-xl font-semibold">Forum</h3>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 px-4 pr-10 rounded-lg bg-dark-300 border border-dark-400 text-gray-300 text-sm focus:outline-none focus:border-primary-500 w-full md:w-60"
            />
            <span className="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
          </div>
          <Link href="/forum/new">
            <a className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500">
              <span className="material-icons text-sm mr-1">add</span>
              <span>Ask Question</span>
            </a>
          </Link>
        </div>
      </div>

      {/* Forum Categories */}
      <div className="p-4 bg-dark-300 border-b border-dark-300 flex items-center space-x-2 overflow-x-auto">
        {FORUM_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 text-xs rounded-full ${
              selectedCategory === category.id
                ? "bg-primary-500/10 text-primary-400 hover:bg-primary-500/20"
                : "bg-dark-400 text-gray-300 hover:bg-dark-300"
            } whitespace-nowrap`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Question List */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredQuestions && filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="mb-6 p-5 rounded-lg bg-dark-200 hover:bg-dark-300 transition-colors border border-dark-400"
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-medium mb-2">
                    <Link href={`/forum/${question.id}`} className="hover:text-primary-400 transition-colors">
                      {question.title}
                    </Link>
                  </h4>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {question.content}
                  </p>

                  <div className="flex items-center text-xs text-gray-500">
                    <span>Posted by</span>
                    <div className="flex items-center ml-1">
                      <span className="font-medium text-gray-400">
                        {question.user.displayName || question.user.username}
                      </span>
                      <div className="flex items-center ml-1 text-xs text-gray-400">
                        <span className="material-icons text-xs">
                          {question.user.role === "expert" ? "verified" : 
                           question.user.role === "premium" ? "workspace_premium" : "person"}
                        </span>
                        <span className="ml-0.5">{question.user.role}</span>
                      </div>
                    </div>
                    <span className="mx-2">•</span>
                    <span>{new Date(question.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center ml-4 min-w-[60px] text-center">
                  <div className="bg-dark-300 rounded-md px-2 py-1 mb-1">
                    <div className="text-lg font-medium">{question.answers}</div>
                    <div className="text-xs text-gray-400">answers</div>
                  </div>
                  <div className="text-xs text-gray-400">{formatNumber(question.views)} views</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <div className="text-gray-400 mb-4">No questions found</div>
            <Link href="/forum/new">
              <a className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500">
                <span className="material-icons text-sm mr-1">add</span>
                <span>Ask the First Question</span>
              </a>
            </Link>
          </div>
        )}

        {filteredQuestions && filteredQuestions.length > 0 && (
          <div className="flex justify-center mt-8">
            <button className="inline-flex items-center px-6 py-2 text-sm font-medium text-white transition-all rounded-lg border border-primary-500 bg-dark-200 hover:bg-primary-500/10">
              <span>View More Questions</span>
              <span className="ml-2 material-icons text-sm">arrow_downward</span>
            </button>
          </div>
        )}
      </div>
    </Glassmorphism>
  );
}
