import { useLocation, Link } from "wouter";
import { GradientText } from "@/components/ui/gradient-text";

interface SidebarItem {
  name: string;
  path: string;
  icon: string;
}

export default function Sidebar() {
  const [location] = useLocation();

  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "Forum Management", path: "/dashboard/forum", icon: "forum" },
    { name: "Interlinking", path: "/dashboard/interlinking", icon: "link" },
    { name: "Keyword Analysis", path: "/dashboard/keyword-analysis", icon: "travel_explore" },
    { name: "Lead Capture", path: "/dashboard/lead-capture", icon: "contact_page" },
    { name: "Gated Content", path: "/dashboard/gated-content", icon: "lock" },
    { name: "CRM Integrations", path: "/dashboard/crm", icon: "sync" },
    { name: "AI Personas", path: "/dashboard/personas", icon: "psychology" },
    { name: "Analytics", path: "/dashboard/analytics", icon: "analytics" },
    { name: "Integration", path: "/dashboard/integration", icon: "integration_instructions" },
    { name: "Settings", path: "/dashboard/settings", icon: "settings" },
  ];

  return (
    <div className="hidden md:block w-64 border-r border-dark-300 p-4 h-full">
      <div className="flex items-center space-x-2 mb-8">
        <div className="text-primary-500 flex items-center justify-center w-8 h-8 rounded-full bg-dark-100">
          <span className="material-icons text-sm">forum</span>
        </div>
        <span className="text-lg font-bold">
          <GradientText>ForumAI</GradientText>
        </span>
      </div>

      <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
        {sidebarItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={`flex items-center py-2 px-3 rounded-lg ${
                location === item.path
                  ? "bg-primary-500/10 text-primary-400"
                  : "text-gray-400 hover:bg-dark-300"
              }`}
            >
              <span className="material-icons text-sm mr-3">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </a>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <Link href="/forum">
          <a className="flex items-center py-2 px-3 rounded-lg text-gray-400 hover:bg-dark-300 mb-2">
            <span className="material-icons text-sm mr-3">public</span>
            <span className="truncate">View Forum</span>
          </a>
        </Link>
        <Link href="/">
          <a className="flex items-center py-2 px-3 rounded-lg text-gray-400 hover:bg-dark-300">
            <span className="material-icons text-sm mr-3">home</span>
            <span className="truncate">Main Site</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
