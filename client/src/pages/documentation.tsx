
import React from 'react';
import Footer from '../components/layout/footer';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Documentation</h1>
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl">Getting Started</h2>
          <p className="text-gray-300">
            Welcome to ForumAI's comprehensive documentation. Learn how to leverage our AI-powered forum platform to boost your SEO and engage your community.
          </p>
          <h2 className="text-2xl mt-8">Platform Features</h2>
          <ul className="list-disc pl-6 text-gray-300">
            <li>AI-powered content generation</li>
            <li>SEO optimization tools</li>
            <li>Community engagement features</li>
            <li>Analytics and reporting</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
