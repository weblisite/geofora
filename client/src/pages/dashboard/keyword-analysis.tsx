import React from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/sidebar";
import KeywordAnalysis from "@/components/dashboard/keyword-analysis";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Glassmorphism } from "@/components/ui/glassmorphism";

export default function KeywordAnalysisPage() {
  const { user } = useAuth();
  
  // Fetch the user's forums to show in a dropdown selector
  const { data: forums, isLoading } = useQuery({
    queryKey: ["/api/forums/user"],
    enabled: !!user,
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-10 overflow-auto">
        <Glassmorphism className="p-6 rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <KeywordAnalysis />
          )}
        </Glassmorphism>
      </div>
    </div>
  );
}