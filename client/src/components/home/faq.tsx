import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/constants";
import { GradientText } from "@/components/ui/gradient-text";
import { Glassmorphism } from "@/components/ui/glassmorphism";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-20 bg-dark-100">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Frequently Asked <GradientText>Questions</GradientText>
          </h2>
          <p className="text-gray-400">
            Get answers to the most common questions about our AI-powered forum platform.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {FAQ_ITEMS.map((faq, index) => (
            <Glassmorphism key={index} className="mb-4 rounded-lg overflow-hidden">
              <button
                className="flex items-center justify-between w-full p-4 text-left border-b border-dark-400"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium">{faq.question}</span>
                <span className={`material-icons transform ${openIndex === index ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {openIndex === index && (
                <div className="p-4 text-gray-300">
                  <p>{faq.answer}</p>
                </div>
              )}
            </Glassmorphism>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Have more questions?</p>
          <a href="#" className="inline-flex items-center px-6 py-2 text-sm font-medium text-white transition-all rounded-lg border border-primary-500 bg-dark-200 hover:bg-primary-500/10">
            <span>Contact Support</span>
          </a>
        </div>
      </div>
    </section>
  );
}
