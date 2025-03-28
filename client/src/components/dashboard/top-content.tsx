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

  // Only use real data from the database
  const displayContent = topContent;

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
      ) : !displayContent || displayContent.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>No top content data available</p>
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
