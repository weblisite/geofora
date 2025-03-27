import { useParams } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import QuestionDetail from "@/components/forum/question-detail";

export default function QuestionDetailPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container px-4 mx-auto">
          <QuestionDetail />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
