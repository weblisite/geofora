import React, { useState } from "react";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface Section {
  id: string;
  title: string;
  subSections?: {
    id: string;
    title: string;
  }[];
}

interface DocumentationLayoutProps {
  children: React.ReactNode;
  currentSectionId: string;
  setCurrentSectionId: (id: string) => void;
  sections: Section[];
}

export function DocumentationLayout({
  children,
  currentSectionId,
  setCurrentSectionId,
  sections,
}: DocumentationLayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] gap-6 relative">
      {/* Mobile menu toggle */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 right-4 z-50 bg-primary-500 text-white p-3 rounded-full shadow-lg"
        >
          <ChevronRight
            size={24}
            className={`transition-transform ${
              sidebarOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "w-full md:w-64 xl:w-72 transition-all duration-300 ease-in-out overflow-auto",
          isMobile
            ? sidebarOpen
              ? "fixed inset-0 z-40 bg-dark-100/95 backdrop-blur-md"
              : "hidden"
            : "relative"
        )}
      >
        <Glassmorphism 
          className="h-full p-4 rounded-lg overflow-auto gradient-border"
          intensity="medium"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Documentation</h3>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
          
          <nav className="space-y-1">
            {sections.map((section) => (
              <div key={section.id} className="mb-4">
                <button
                  onClick={() => {
                    setCurrentSectionId(section.id);
                    if (isMobile) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md flex items-center justify-between transition-colors text-sm",
                    currentSectionId === section.id
                      ? "bg-primary-500/20 text-primary-300"
                      : "hover:bg-dark-300 text-gray-300"
                  )}
                >
                  <span>{section.title}</span>
                  {section.subSections && (
                    <span className="material-icons text-sm">
                      {currentSectionId === section.id ? "expand_less" : "expand_more"}
                    </span>
                  )}
                </button>

                {section.subSections && currentSectionId === section.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.subSections.map((subSection) => (
                      <button
                        key={subSection.id}
                        onClick={() => {
                          setCurrentSectionId(subSection.id);
                          if (isMobile) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                          currentSectionId === subSection.id
                            ? "bg-primary-500/10 text-primary-400"
                            : "hover:bg-dark-300 text-gray-400"
                        )}
                      >
                        {subSection.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </Glassmorphism>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <Glassmorphism className="p-6 rounded-lg gradient-border">
          {children}
        </Glassmorphism>
      </div>
    </div>
  );
}