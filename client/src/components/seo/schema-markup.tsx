import { useEffect } from "react";
import { AnswerWithDetails, QuestionWithDetails } from "@shared/schema";

interface SchemaMarkupProps {
  question?: QuestionWithDetails;
  answers?: AnswerWithDetails[];
  url: string;
}

export default function SchemaMarkup({ question, answers, url }: SchemaMarkupProps) {
  useEffect(() => {
    if (!question) return;
    
    // Create the JSON-LD schema for the question
    const questionSchema = {
      "@context": "https://schema.org",
      "@type": "QAPage",
      "mainEntity": {
        "@type": "Question",
        "name": question.title,
        "text": question.content,
        "answerCount": answers?.length || 0,
        "dateCreated": question.createdAt 
          ? new Date(question.createdAt).toISOString() 
          : new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": question.user.displayName || question.user.username
        },
        "url": url,
        "answer": answers && answers.length > 0 
          ? answers.map(answer => ({
              "@type": "Answer",
              "text": answer.content,
              "dateCreated": answer.createdAt 
                ? new Date(answer.createdAt).toISOString() 
                : new Date().toISOString(),
              "upvoteCount": answer.votes || 0,
              "url": `${url}#answer-${answer.id}`,
              "author": {
                "@type": "Person",
                "name": answer.user.displayName || answer.user.username
              }
            }))
          : []
      }
    };
    
    // Create a script element to inject the schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(questionSchema);
    script.id = 'question-schema';
    
    // Remove any existing schema scripts
    const existingScript = document.getElementById('question-schema');
    if (existingScript && existingScript.parentNode) {
      existingScript.parentNode.removeChild(existingScript);
    }
    
    // Add the script to the document head
    document.head.appendChild(script);
    
    // Clean up on unmount
    return () => {
      const scriptToRemove = document.getElementById('question-schema');
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
    };
  }, [question, answers, url]);
  
  // This is a utility component that doesn't render anything visible
  return null;
}