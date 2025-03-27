import { useQuery } from "@tanstack/react-query";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Link } from "wouter";
import { formatNumber } from "@/lib/utils";

// Define the top content item type
interface TopContentItem {
  id: number;
  title: string;
  views: number;
  answers: number;
  conversions: number;
  ranking: string;
  position: number;
}

export default function TopContent() {
  // Fetch top performing content data
  const { data: topContent, isLoading } = useQuery<TopContentItem[]>({
    queryKey: [`/api/analytics/top-content`],
  });

  // Generate fallback data when API data isn't available
  const getFallbackTopContent = (): TopContentItem[] => [
    {
      id: 1,
      title: "What's the most effective way to implement AI-driven content strategies?",
      views: 12456,
      answers: 32,
      conversions: 147,
      ranking: "Position #3",
      position: 3,
    },
    {
      id: 2,
      title: "How do you measure the ROI of your SEO investments?",
      views: 9871,
      answers: 24,
      conversions: 93,
      ranking: "Position #1",
      position: 1,
    },
    {
      id: 3,
      title: "Which keyword research tools are worth the investment in 2024?",
      views: 8542,
      answers: 19,
      conversions: 78,
      ranking: "Position #2",
      position: 2,
    },
    {
      id: 4,
      title: "What are the best practices for E-E-A-T compliance?",
      views: 7329,
      answers: 15,
      conversions: 64,
      ranking: "Position #5",
      position: 5,
    },
  ];

  // Use fallback data if API data isn't available
  const displayContent = topContent || getFallbackTopContent();

  return (
    <Glassmorphism className="p-4 rounded-lg border border-dark-400">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Top Performing Content</h4>
        <button className="px-3 py-1 text-xs rounded-lg bg-dark-300 text-gray-300 hover:bg-dark-400">
          Export
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary-500 rounded-full"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase">
              <tr className="border-b border-dark-300">
                <th scope="col" className="px-4 py-3">Question</th>
                <th scope="col" className="px-4 py-3">Views</th>
                <th scope="col" className="px-4 py-3">Answers</th>
                <th scope="col" className="px-4 py-3">Conversions</th>
                <th scope="col" className="px-4 py-3">Ranking</th>
              </tr>
            </thead>
            <tbody>
              {displayContent.map((item) => (
                <tr key={item.id} className="border-b border-dark-300 hover:bg-dark-300/50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/forum/${item.id}`} className="hover:text-primary-400 transition-colors">
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{formatNumber(item.views)}</td>
                  <td className="px-4 py-3">{item.answers}</td>
                  <td className="px-4 py-3">{item.conversions}</td>
                  <td className="px-4 py-3">
                    <span className="text-accent-400">{item.ranking}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Glassmorphism>
  );
}
