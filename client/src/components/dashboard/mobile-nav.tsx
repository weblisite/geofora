import * as React from "react";
import { Link, useLocation } from "wouter";
import { GradientText } from "@/components/ui/gradient-text";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  name: string;
  path: string;
  icon: string;
  isDashboardItem?: boolean;
}

export default function MobileNav() {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = React.useState(false);

  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard", isDashboardItem: true },
    { name: "Forum Management", path: "/dashboard/forum", icon: "forum", isDashboardItem: true },
    { name: "Interlinking", path: "/dashboard/interlinking", icon: "link", isDashboardItem: true },
    { name: "Keyword Analysis", path: "/dashboard/keyword-analysis", icon: "travel_explore", isDashboardItem: true },
    { name: "Lead Capture", path: "/dashboard/lead-capture", icon: "contact_page", isDashboardItem: true },
    { name: "Gated Content", path: "/dashboard/gated-content", icon: "lock", isDashboardItem: true },
    { name: "CRM Integrations", path: "/dashboard/crm", icon: "sync", isDashboardItem: true },
    { name: "AI Personas", path: "/dashboard/personas", icon: "psychology", isDashboardItem: true },
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
      setOpen(false);
    } else {
      // For non-dashboard items, close the sheet but allow normal navigation
      setOpen(false);
    }
  };

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-dark-100 border-b border-dark-300 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="text-primary-500 flex items-center justify-center w-8 h-8 rounded-full bg-dark-100">
          <span className="material-icons text-sm">forum</span>
        </div>
        <span className="text-lg font-bold">
          <GradientText>GeoFora</GradientText>
        </span>
      </div>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[85%] max-w-xs p-0">
          <SheetHeader className="px-6 py-4 border-b border-dark-300">
            <SheetTitle>
              <div className="flex items-center space-x-2">
                <div className="text-primary-500 flex items-center justify-center w-8 h-8 rounded-full bg-dark-100">
                  <span className="material-icons text-sm">forum</span>
                </div>
                <span className="text-lg font-bold">
                  <GradientText>GeoFora</GradientText>
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <div className="py-4 px-2 overflow-y-auto max-h-[calc(100vh-80px)]">
            <nav className="space-y-1">
              {sidebarItems.slice(0, 11).map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavigation(item, e)}
                  className={`flex items-center py-3 px-4 rounded-lg cursor-pointer ${
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
            
            <div className="mt-8 border-t border-dark-300 pt-4 px-2">
              <Link href="/forum" onClick={() => setOpen(false)}>
                <a className="flex items-center py-3 px-4 rounded-lg text-gray-400 hover:bg-dark-300 mb-2">
                  <span className="material-icons text-sm mr-3">public</span>
                  <span className="truncate">View Forum</span>
                </a>
              </Link>
              <Link href="/" onClick={() => setOpen(false)}>
                <a className="flex items-center py-3 px-4 rounded-lg text-gray-400 hover:bg-dark-300">
                  <span className="material-icons text-sm mr-3">home</span>
                  <span className="truncate">Main Site</span>
                </a>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}