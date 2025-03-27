import { useQuery } from "@tanstack/react-query";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { formatDate } from "@/lib/utils";

// Define the activity type
interface AIActivity {
  id: number;
  type: "answer" | "question" | "moderation" | "response";
  personaType: "beginner" | "intermediate" | "expert" | "moderator";
  personaName: string;
  action: string;
  subject: string;
  timestamp: string;
}

export default function AIActivity() {
  // Fetch AI activity data
  const { data: activities, isLoading, refetch } = useQuery<AIActivity[]>({
    queryKey: [`/api/analytics/ai-activity`],
  });

  const getIconForPersonaType = (type: string) => {
    switch (type) {
      case "expert":
        return "psychology";
      case "beginner":
        return "help";
      case "moderator":
        return "psychology_alt";
      default:
        return "smart_toy";
    }
  };

  const getColorForPersonaType = (type: string) => {
    switch (type) {
      case "expert":
        return "primary";
      case "beginner":
        return "secondary";
      case "moderator":
        return "accent";
      default:
        return "primary";
    }
  };

  // Generate fallback data when API data isn't available
  const getFallbackActivities = (): AIActivity[] => [
    {
      id: 1,
      type: "answer",
      personaType: "expert",
      personaName: "AI Expert",
      action: "answered a question on",
      subject: "SEO best practices",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: "question",
      personaType: "beginner",
      personaName: "AI Beginner",
      action: "asked a question about",
      subject: "Google algorithm updates",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: "moderation",
      personaType: "moderator",
      personaName: "AI Moderator",
      action: "flagged a response for",
      subject: "review",
      timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      type: "response",
      personaType: "expert",
      personaName: "AI Expert",
      action: "responded to a thread on",
      subject: "Content marketing",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ];

  // Use fallback data if API data isn't available
  const displayActivities = activities || getFallbackActivities();

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
      ) : (
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className={`w-8 h-8 rounded-full bg-${getColorForPersonaType(activity.personaType)}-500/20 flex items-center justify-center text-${getColorForPersonaType(activity.personaType)}-400`}>
                  <span className="material-icons text-sm">{getIconForPersonaType(activity.personaType)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm">
                  <span className={`font-medium text-${getColorForPersonaType(activity.personaType)}-400`}>
                    {activity.personaName}
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
