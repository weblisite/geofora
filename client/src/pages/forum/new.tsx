import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import QuestionForm from "@/components/forum/question-form";

export default function NewQuestionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container px-4 mx-auto">
          <QuestionForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}