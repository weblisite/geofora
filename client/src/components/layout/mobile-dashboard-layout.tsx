import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  MobileContainer, 
  MobileCard, 
  MobileButton, 
  MobileNav, 
  MobileModal,
  MobileTabs,
  MobileList,
  MobileSpinner,
  MobileToast
} from '@/components/ui/mobile-optimized';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  BarChart3, 
  Users, 
  MessageSquare,
  Shield,
  Globe,
  Bot,
  Language,
  Psychology,
  Webhook,
  Search,
  Domain,
  CreditCard,
  CloudDownload,
  Business,
  Link,
  TravelExplore,
  ContactPage,
  Sync,
  RecordVoiceOver
} from 'lucide-react';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Forum Management", path: "/dashboard/forum", icon: MessageSquare },
  { name: "Data Export", path: "/dashboard/data-export", icon: CloudDownload },
  { name: "Setup Fee", path: "/dashboard/setup-fee", icon: CreditCard },
  { name: "Business Analysis", path: "/dashboard/business-analysis", icon: Business },
  { name: "Industry Detection", path: "/dashboard/industry-detection", icon: Search },
  { name: "SEO Management", path: "/dashboard/seo-management", icon: Search },
  { name: "Custom Domain Setup", path: "/dashboard/custom-domain-setup", icon: Domain },
  { name: "Content Moderation", path: "/dashboard/content-moderation", icon: Shield },
  { name: "AI Personas", path: "/dashboard/ai-personas", icon: Bot },
  { name: "Multilingual Support", path: "/dashboard/multilingual-support", icon: Language },
  { name: "Custom AI Training", path: "/dashboard/custom-ai-training", icon: Psychology },
  { name: "Webhook System", path: "/dashboard/webhook-system", icon: Webhook },
  { name: "Brand Voice", path: "/dashboard/brand-voice", icon: RecordVoiceOver },
  { name: "Interlinking", path: "/dashboard/interlinking", icon: Link },
  { name: "Keyword Analysis", path: "/dashboard/keyword-analysis", icon: TravelExplore },
  { name: "Lead Capture", path: "/dashboard/lead-capture", icon: ContactPage },
  { name: "CRM Integrations", path: "/dashboard/crm", icon: Sync },
];

export default function MobileDashboardLayout({ children }: MobileDashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const showToastNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsMobileMenuOpen(false);
    showToastNotification(`Navigated to ${path.split('/').pop()?.replace('-', ' ')}`, 'success');
  };

  const currentPage = sidebarItems.find(item => item.path === location)?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="sticky top-0 z-40"
      >
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <h1 className="text-xl font-bold text-gray-900">GEOFORA</h1>
          <div className="flex space-x-6">
            {sidebarItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:block">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">GEOFORA</h1>
            <div className="text-sm text-gray-600">{currentPage}</div>
          </div>
          
          {/* Mobile Menu Items */}
          <MobileList
            items={sidebarItems.map((item) => {
              const Icon = item.icon;
              return {
                id: item.path,
                content: (
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-900">{item.name}</span>
                  </div>
                ),
                onClick: () => handleNavigation(item.path)
              };
            })}
            dividers={true}
          />
        </div>
      </MobileNav>

      {/* Main Content */}
      <MobileContainer className="py-6">
        {children}
      </MobileContainer>

      {/* Mobile Toast */}
      <MobileToast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <div className="flex justify-around py-2">
          {sidebarItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  location === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add bottom padding to account for fixed bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

// Mobile-optimized dashboard stats cards
interface MobileStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MobileStatsCard({ 
  title, 
  value, 
  change, 
  icon,
  className 
}: MobileStatsCardProps) {
  const changeColors = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <MobileCard className={className}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColors[change.type]}`}>
              {change.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            {icon}
          </div>
        )}
      </div>
    </MobileCard>
  );
}

// Mobile-optimized dashboard tabs
interface MobileDashboardTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function MobileDashboardTabs({ 
  tabs, 
  activeTab, 
  onTabChange 
}: MobileDashboardTabsProps) {
  return (
    <MobileTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      className="mt-6"
    />
  );
}

// Mobile-optimized loading state
interface MobileLoadingStateProps {
  message?: string;
  className?: string;
}

export function MobileLoadingState({ 
  message = 'Loading...', 
  className 
}: MobileLoadingStateProps) {
  return (
    <MobileContainer className={className}>
      <div className="flex flex-col items-center justify-center py-12">
        <MobileSpinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </MobileContainer>
  );
}

// Mobile-optimized error state
interface MobileErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function MobileErrorState({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading this content.',
  onRetry,
  className
}: MobileErrorStateProps) {
  return (
    <MobileContainer className={className}>
      <MobileCard className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <MobileButton onClick={onRetry} variant="primary">
            Try Again
          </MobileButton>
        )}
      </MobileCard>
    </MobileContainer>
  );
}

// Mobile-optimized empty state
interface MobileEmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MobileEmptyState({ 
  title = 'No data available',
  message = 'There is no data to display at this time.',
  action,
  icon,
  className
}: MobileEmptyStateProps) {
  return (
    <MobileContainer className={className}>
      <MobileCard className="text-center py-12">
        {icon && (
          <div className="text-gray-400 mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {action && (
          <MobileButton onClick={action.onClick} variant="primary">
            {action.label}
          </MobileButton>
        )}
      </MobileCard>
    </MobileContainer>
  );
}
