import { useLocation, Link } from "wouter";
import { GradientText } from "@/components/ui/gradient-text";

interface SidebarItem {
  name: string;
  path: string;
  icon: string;
  isDashboardItem?: boolean;
}

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard", isDashboardItem: true },
    { name: "Forum Management", path: "/dashboard/forum", icon: "forum", isDashboardItem: true },
    { name: "Data Export", path: "/dashboard/data-export", icon: "cloud_download", isDashboardItem: true },
    { name: "Setup Fee", path: "/dashboard/setup-fee", icon: "credit_card", isDashboardItem: true },
    { name: "Business Analysis", path: "/dashboard/business-analysis", icon: "business", isDashboardItem: true },
    { name: "Industry Detection", path: "/dashboard/industry-detection", icon: "search", isDashboardItem: true },
    { name: "SEO Management", path: "/dashboard/seo-management", icon: "search", isDashboardItem: true },
    { name: "Custom Domain Setup", path: "/dashboard/custom-domain-setup", icon: "domain", isDashboardItem: true },
    { name: "Content Moderation", path: "/dashboard/content-moderation", icon: "shield", isDashboardItem: true },
    { name: "AI Personas", path: "/dashboard/ai-personas", icon: "bot", isDashboardItem: true },
    { name: "Multilingual Support", path: "/dashboard/multilingual-support", icon: "language", isDashboardItem: true },
    { name: "Custom AI Training", path: "/dashboard/custom-ai-training", icon: "psychology", isDashboardItem: true },
    { name: "Webhook System", path: "/dashboard/webhook-system", icon: "webhook", isDashboardItem: true },
    { name: "Brand Voice", path: "/dashboard/brand-voice", icon: "record_voice_over", isDashboardItem: true },
    { name: "Interlinking", path: "/dashboard/interlinking", icon: "link", isDashboardItem: true },
    { name: "Keyword Analysis", path: "/dashboard/keyword-analysis", icon: "travel_explore", isDashboardItem: true },
    { name: "Lead Capture", path: "/dashboard/lead-capture", icon: "contact_page", isDashboardItem: true },
    { name: "CRM Integrations", path: "/dashboard/crm", icon: "sync", isDashboardItem: true },
    { name: "AI Agents", path: "/dashboard/agents", icon: "smart_toy", isDashboardItem: true },
    { name: "Analytics", path: "/dashboard/analytics", icon: "analytics", isDashboardItem: true },
    { name: "Integration", path: "/dashboard/integration", icon: "integration_instructions", isDashboardItem: true },
    { name: "Settings", path: "/dashboard/settings", icon: "settings", isDashboardItem: true },
    { name: "View Forum", path: "/forum", icon: "public" },
    { name: "Main Site", path: "/", icon: "home" },
  ];

  // Handle navigation function to avoid full page reloads for dashboard items
  const handleNavigation = (item: SidebarItem, e: React.MouseEvent) => {
    if (item.isDashboardItem) {
      e.preventDefault();
      setLocation(item.path);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-dark-300 h-screen">
      <div className="flex flex-col h-full flex-1">
        {/* Header with logo */}
        <div className="p-4 flex items-center space-x-2">
          <div className="text-primary-500 flex items-center justify-center w-8 h-8 rounded-full bg-dark-100">
            <span className="material-icons text-sm">forum</span>
          </div>
          <span className="text-lg font-bold">
            <GradientText>GEOFORA</GradientText>
          </span>
        </div>
        
        {/* Scrollable navigation section */}
        <div className="flex-1 overflow-y-auto py-2 px-4">
          <nav className="space-y-1">
            {/* All sidebar items */}
            {sidebarItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNavigation(item, e)}
                className={`flex items-center py-2 px-3 rounded-lg cursor-pointer ${
                  location === item.path
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-gray-400 hover:bg-dark-300"
                }`}
              >
                <span className="material-icons text-sm mr-3">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
