import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import QuestionList from "@/components/forum/question-list";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function ForumPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container px-4 mx-auto">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Forum</h1>
              <p className="text-gray-400">
                Discover answers to your questions and share your knowledge with the community
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              {isAuthenticated ? (
                <Link href="/forum/new">
                  <Button className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-glow">
                    <span className="material-icons text-sm mr-2">add</span>
                    Ask a Question
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-glow">
                      Sign Up to Participate
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <QuestionList />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
