
import React from 'react';
import Footer from '../components/layout/footer';

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Case Studies</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Tech Startup Success Story</h2>
            <p className="text-gray-300">How a tech startup increased organic traffic by 300% using ForumAI.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">E-commerce Growth Study</h2>
            <p className="text-gray-300">An e-commerce platform's journey to building a thriving community.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import { Footer } from "../components/layout/footer";
import { Navbar } from "../components/layout/navbar";

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Case Studies</h1>
        <p className="text-gray-300 mb-8">
          Explore how organizations are transforming their communities with our AI-powered forums.
        </p>
      </main>
      <Footer />
    </div>
  );
}
