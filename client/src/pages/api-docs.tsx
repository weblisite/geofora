
import React from 'react';
import Footer from '../components/layout/footer';

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">API Documentation</h1>
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl">API Overview</h2>
          <p className="text-gray-300">
            GeoFora provides a powerful RESTful API that allows you to integrate our platform with your existing systems.
          </p>
          <h2 className="text-2xl mt-8">Authentication</h2>
          <p className="text-gray-300">
            All API requests require authentication using API keys that you can generate from your dashboard.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import { Footer } from "../components/layout/footer";
import { Navbar } from "../components/layout/navbar";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">API Documentation</h1>
        <p className="text-gray-300 mb-8">
          Comprehensive documentation for integrating with our AI-powered forum platform.
        </p>
      </main>
      <Footer />
    </div>
  );
}
