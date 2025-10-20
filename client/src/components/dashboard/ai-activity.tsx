import { useQuery } from "@tanstack/react-query";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { formatDate } from "@/lib/utils";

// Define the activity type
interface AIActivity {
  id: number;
  type: "answer" | "question" | "moderation" | "response";
  agentType: "beginner" | "intermediate" | "expert" | "smart" | "genius" | "intelligent" | "moderator";
  agentName: string;
  action: string;
  subject: string;
  timestamp: string;
}

export default function AIActivity() {
  // Fetch AI activity data
  const { data: activities, isLoading, refetch } = useQuery<AIActivity[]>({
    queryKey: [`/api/analytics/ai-activity`],
  });

  const getIconForAgentType = (type: string) => {
    switch (type) {
      case "expert":
        return "psychology";
      case "beginner":
        return "help";
      case "smart":
        return "lightbulb";
      case "genius":
        return "auto_awesome";
      case "intelligent":
        return "school";
      case "moderator":
        return "psychology_alt";
      default:
        return "smart_toy";
    }
  };

  const getColorForAgentType = (type: string) => {
    switch (type) {
      case "expert":
        return "primary";
      case "beginner":
        return "secondary";
      case "smart":
        return "blue";
      case "genius":
        return "purple";
      case "intelligent":
        return "green";
      case "moderator":
        return "accent";
      default:
        return "primary";
    }
  };

  // Only use real data from the database
  const displayActivities = activities;

  return (
    <Glassmorphism className="p-4 rounded-lg border border-dark-400 h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">AI Activity</h4>
        <button 
          className="text-gray-400 hover:text-white"
          onClick={() => refetch()}
        >
          <span className="material-icons text-sm">refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary-500 rounded-full"></div>
        </div>
      ) : !displayActivities || displayActivities.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>No AI activity available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                                        <div className={`w-8 h-8 rounded-full bg-${getColorForAgentType(activity.agentType)}-500/20 flex items-center justify-center text-${getColorForAgentType(activity.agentType)}-400`}>
                          <span className="material-icons text-sm">{getIconForAgentType(activity.agentType)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm">
                  <span className={`font-medium text-${getColorForAgentType(activity.agentType)}-400`}>
                    {activity.agentName}
                  </span>{" "}
                  {activity.action} "{activity.subject}"
                </p>
                <p className="text-xs text-gray-400">{formatDate(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-center">
        <button className="text-xs text-primary-400 hover:text-primary-300">
          View All Activity
        </button>
      </div>
    </Glassmorphism>
  );
}
