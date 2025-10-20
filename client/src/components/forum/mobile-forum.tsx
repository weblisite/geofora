import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  MobileContainer, 
  MobileCard, 
  MobileButton, 
  MobileInput,
  MobileModal,
  MobileTabs,
  MobileList,
  MobileSpinner,
  MobileToast
} from '@/components/ui/mobile-optimized';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Share, 
  Bookmark,
  Filter,
  Search,
  SortAsc,
  MoreVertical,
  User,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MobileForumProps {
  forumId: string;
}

interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  views: number;
  votes: {
    up: number;
    down: number;
  };
  answers: number;
  tags: string[];
  isBookmarked?: boolean;
}

interface Answer {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    isAI?: boolean;
  };
  createdAt: string;
  votes: {
    up: number;
    down: number;
  };
  isAccepted?: boolean;
}

export default function MobileForum({ forumId }: MobileForumProps) {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  const questions: Question[] = [
    {
      id: '1',
      title: 'How does GEOFORA improve SEO rankings?',
      content: 'I\'m interested in understanding how GEOFORA\'s AI-powered forums can help improve my website\'s SEO rankings. Can someone explain the mechanism?',
      author: { name: 'John Doe', avatar: '/avatars/john.jpg' },
      createdAt: '2024-01-15T10:30:00Z',
      views: 1250,
      votes: { up: 15, down: 2 },
      answers: 8,
      tags: ['SEO', 'AI', 'Marketing'],
      isBookmarked: false
    },
    {
      id: '2',
      title: 'What AI models does GEOFORA use?',
      content: 'I want to know which AI models and providers GEOFORA integrates with for generating forum content.',
      author: { name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
      createdAt: '2024-01-14T15:45:00Z',
      views: 890,
      votes: { up: 12, down: 1 },
      answers: 5,
      tags: ['AI', 'Technology'],
      isBookmarked: true
    }
  ];

  const answers: Answer[] = [
    {
      id: '1',
      content: 'GEOFORA improves SEO rankings through several mechanisms: 1) AI-generated content creates fresh, relevant pages that search engines can index, 2) Natural keyword integration based on your business context, 3) Internal linking between related topics, and 4) Structured data markup for better search engine understanding.',
      author: { name: 'AI Expert', isAI: true },
      createdAt: '2024-01-15T11:00:00Z',
      votes: { up: 8, down: 0 },
      isAccepted: true
    },
    {
      id: '2',
      content: 'Additionally, GEOFORA\'s temporal dialogue generation creates multi-turn conversations that provide comprehensive coverage of topics, which search engines favor for authoritative content.',
      author: { name: 'Sarah Wilson', avatar: '/avatars/sarah.jpg' },
      createdAt: '2024-01-15T12:30:00Z',
      votes: { up: 5, down: 0 }
    }
  ];

  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleVote = (type: 'up' | 'down', itemId: string, itemType: 'question' | 'answer') => {
    showToastNotification(`Voted ${type} on ${itemType}`);
  };

  const handleBookmark = (questionId: string) => {
    showToastNotification('Question bookmarked');
  };

  const handleShare = (questionId: string) => {
    showToastNotification('Question shared');
  };

  const handleReply = (questionId: string) => {
    showToastNotification('Reply started');
  };

  const sortOptions = [
    { id: 'recent', label: 'Most Recent' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'votes', label: 'Most Voted' },
    { id: 'answers', label: 'Most Answered' }
  ];

  const tabs = [
    {
      id: 'questions',
      label: 'Questions',
      content: (
        <div className="space-y-4">
          {/* Search and Filter Bar */}
          <div className="flex gap-2">
            <div className="flex-1">
              <MobileInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search questions..."
                type="search"
              />
            </div>
            <MobileButton
              variant="outline"
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="px-3"
            >
              <SortAsc className="h-4 w-4" />
            </MobileButton>
            <MobileButton
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="px-3"
            >
              <Filter className="h-4 w-4" />
            </MobileButton>
          </div>

          {/* Sort Options */}
          {showSortOptions && (
            <MobileCard className="p-2">
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSortOptions(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      sortBy === option.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </MobileCard>
          )}

          {/* Questions List */}
          <MobileList
            items={questions.map((question) => ({
              id: question.id,
              content: (
                <div className="space-y-3">
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {question.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <User className="h-3 w-3" />
                          <span>{question.author.name}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBookmark(question.id)}
                      className={`p-2 rounded-md ${
                        question.isBookmarked
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Question Content Preview */}
                  <div className="text-gray-700 text-sm line-clamp-3">
                    {question.content}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {question.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{question.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{question.answers}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote('up', question.id, 'question')}
                        className="flex items-center space-x-1 px-2 py-1 text-green-600 hover:bg-green-50 rounded-md"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span className="text-xs">{question.votes.up}</span>
                      </button>
                      <button
                        onClick={() => handleVote('down', question.id, 'question')}
                        className="flex items-center space-x-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <ThumbsDown className="h-3 w-3" />
                        <span className="text-xs">{question.votes.down}</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <MobileButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleReply(question.id)}
                      className="flex-1"
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </MobileButton>
                    <MobileButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(question.id)}
                      className="flex-1"
                    >
                      <Share className="h-3 w-3 mr-1" />
                      Share
                    </MobileButton>
                  </div>
                </div>
              ),
              onClick: () => setExpandedQuestion(
                expandedQuestion === question.id ? null : question.id
              )
            }))}
            dividers={true}
          />
        </div>
      )
    },
    {
      id: 'answers',
      label: 'Answers',
      content: (
        <div className="space-y-4">
          <MobileList
            items={answers.map((answer) => ({
              id: answer.id,
              content: (
                <div className="space-y-3">
                  {/* Answer Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        answer.author.isAI ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {answer.author.avatar ? (
                          <img
                            src={answer.author.avatar}
                            alt={answer.author.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <User className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {answer.author.name}
                          {answer.author.isAI && (
                            <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                              AI
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(answer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {answer.isAccepted && (
                      <div className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                        Accepted
                      </div>
                    )}
                  </div>

                  {/* Answer Content */}
                  <div className="text-gray-700 text-sm">
                    {answer.content}
                  </div>

                  {/* Answer Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote('up', answer.id, 'answer')}
                        className="flex items-center space-x-1 px-2 py-1 text-green-600 hover:bg-green-50 rounded-md"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span className="text-xs">{answer.votes.up}</span>
                      </button>
                      <button
                        onClick={() => handleVote('down', answer.id, 'answer')}
                        className="flex items-center space-x-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <ThumbsDown className="h-3 w-3" />
                        <span className="text-xs">{answer.votes.down}</span>
                      </button>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            }))}
            dividers={true}
          />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <MobileContainer className="py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Forum</h1>
            <MobileButton variant="primary" size="sm">
              Ask Question
            </MobileButton>
          </div>
        </MobileContainer>
      </div>

      {/* Main Content */}
      <MobileContainer className="py-6">
        <MobileTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </MobileContainer>

      {/* Mobile Toast */}
      <MobileToast
        message={toastMessage}
        type="info"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />

      {/* Floating Action Button */}
      <button
        onClick={() => showToastNotification('New question started')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:hidden z-20"
      >
        <svg className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
