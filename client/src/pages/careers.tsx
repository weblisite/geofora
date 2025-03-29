
import React from 'react';
import Footer from '../components/layout/footer';

export default function Careers() {
  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Careers</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">
            Join our team and help shape the future of community engagement and SEO.
            We're always looking for talented individuals who are passionate about AI and community building.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import { Footer } from "../components/layout/footer";
import { Navbar } from "../components/layout/navbar";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Careers</h1>
        <p className="text-gray-300 mb-8">
          Join us in building the future of community engagement and AI-powered discussions.
        </p>
      </main>
      <Footer />
    </div>
  );
}
