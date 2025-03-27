import { FORUM_CATEGORIES } from "@/lib/constants";
import { GradientText } from "@/components/ui/gradient-text";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Link } from "wouter";

export default function ForumPreview() {
  const mockQuestions = [
    {
      id: 1,
      title: "What's the most effective way to implement AI-driven content strategies in 2024?",
      excerpt: "I've been researching various approaches to using AI for content generation, but I'm not sure what's working best right now. Has anyone had success with...",
      author: {
        name: "Sarah T.",
        role: "AI Specialist",
        verified: true,
      },
      timeAgo: "2 hours ago",
      answers: 4,
      views: 2400,
    },
    {
      id: 2,
      title: "How do you measure the ROI of your SEO investments?",
      excerpt: "I'm trying to convince my boss that we need to invest more in SEO, but he wants to see concrete ROI metrics. What are the best ways to track...",
      author: {
        name: "Mark J.",
        role: "Marketing Lead",
        premium: true,
      },
      timeAgo: "1 day ago",
      answers: 7,
      views: 3800,
    },
    {
      id: 3,
      title: "Which keyword research tools are worth the investment in 2024?",
      excerpt: "There are so many options out there, from free tools to enterprise solutions costing thousands. I'm wondering which ones provide the best value...",
      author: {
        name: "Alex W.",
        role: "SEO Consultant",
        verified: true,
      },
      timeAgo: "3 days ago",
      answers: 12,
      views: 5200,
    },
  ];

  return (
    <section className="py-20 bg-dark-100">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            How Your <GradientText>Forum</GradientText> Will Look
          </h2>
          <p className="text-gray-400">
            Experience the sleek, futuristic design of your AI-powered Q&A platform that drives engagement and conversions.
          </p>
        </div>

        <Glassmorphism className="gradient-border rounded-xl overflow-hidden shadow-glow">
          {/* Forum Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-300">
            <div className="flex items-center space-x-3">
              <div className="text-primary-500 flex items-center justify-center w-10 h-10 rounded-full bg-dark-100 shadow-glow">
                <span className="material-icons">forum</span>
              </div>
              <h3 className="text-xl font-semibold">YourBrand Forum</h3>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="py-2 px-4 pr-10 rounded-lg bg-dark-300 border border-dark-400 text-gray-300 text-sm focus:outline-none focus:border-primary-500 w-full md:w-60"
                />
                <span className="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  search
                </span>
              </div>
              <button className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500">
                <span className="material-icons text-sm mr-1">add</span>
                <span>Ask Question</span>
              </button>
            </div>
          </div>

          {/* Forum Categories */}
          <div className="p-4 bg-dark-300 border-b border-dark-300 flex items-center space-x-2 overflow-x-auto">
            {FORUM_CATEGORIES.map((category, index) => (
              <button
                key={category.id}
                className={`px-3 py-1 text-xs rounded-full ${
                  index === 0
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
            {mockQuestions.map((question) => (
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
                      {question.excerpt}
                    </p>

                    <div className="flex items-center text-xs text-gray-500">
                      <span>Posted by</span>
                      <div className="flex items-center ml-1">
                        <span className="font-medium text-gray-400">
                          {question.author.name}
                        </span>
                        <div className="flex items-center ml-1 text-xs text-gray-400">
                          <span className="material-icons text-xs">
                            {question.author.verified
                              ? "verified"
                              : question.author.premium
                              ? "workspace_premium"
                              : "person"}
                          </span>
                          <span className="ml-0.5">{question.author.role}</span>
                        </div>
                      </div>
                      <span className="mx-2">•</span>
                      <span>{question.timeAgo}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center ml-4 min-w-[60px] text-center">
                    <div className="bg-dark-300 rounded-md px-2 py-1 mb-1">
                      <div className="text-lg font-medium">{question.answers}</div>
                      <div className="text-xs text-gray-400">answers</div>
                    </div>
                    <div className="text-xs text-gray-400">{question.views.toLocaleString()} views</div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-8">
              <button className="inline-flex items-center px-6 py-2 text-sm font-medium text-white transition-all rounded-lg border border-primary-500 bg-dark-200 hover:bg-primary-500/10">
                <span>View More Questions</span>
                <span className="ml-2 material-icons text-sm">arrow_downward</span>
              </button>
            </div>
          </div>
        </Glassmorphism>
      </div>
    </section>
  );
}
