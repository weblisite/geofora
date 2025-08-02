
import React from 'react';
import Footer from '../components/layout/footer';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">About Us</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">
            GeoFora is revolutionizing how businesses engage with their communities through AI-powered forums.
            Founded by industry experts, we're committed to helping companies boost their SEO and create meaningful discussions.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import { Footer } from "../components/layout/footer";
import { Navbar } from "../components/layout/navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">About Us</h1>
        <p className="text-gray-300 mb-8">
          We're building the future of AI-powered forums, helping communities grow through intelligent discussions.
        </p>
      </main>
      <Footer />
    </div>
  );
}
