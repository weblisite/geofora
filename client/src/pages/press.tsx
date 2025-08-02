
import React from 'react';
import Footer from '../components/layout/footer';

export default function Press() {
  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Press</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">
            Stay up to date with GeoFora's latest news, press releases, and media coverage.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import { Footer } from "../components/layout/footer";
import { Navbar } from "../components/layout/navbar";

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Press</h1>
        <p className="text-gray-300 mb-8">
          Latest news, updates, and media resources about our AI-powered forum platform.
        </p>
      </main>
      <Footer />
    </div>
  );
}
