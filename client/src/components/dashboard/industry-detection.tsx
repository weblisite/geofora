import React from 'react';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, TrendingUp, BarChart3, Lightbulb } from 'lucide-react';

export default function IndustryDetectionDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Search className="w-6 h-6 mr-2 text-primary-400" />
            <GradientText>Industry Detection Algorithm</GradientText>
          </h1>
          <p className="text-gray-400 mt-1">
            AI-powered detection of business industries from text, websites, and descriptions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-primary-400" />
            Text Analysis
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Business Text</label>
              <Textarea
                placeholder="Enter business description, product information, or company details..."
                className="min-h-[120px]"
              />
            </div>
            <Button className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Detect Industry
            </Button>
          </div>
        </Glassmorphism>

        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
            Industry Insights
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Website URL</label>
              <input
                type="url"
                placeholder="https://your-website.com"
                className="w-full px-3 py-2 bg-dark-500 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analyze Website
            </Button>
          </div>
        </Glassmorphism>
      </div>

      <Glassmorphism className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detection Results</h3>
        <div className="text-center py-8 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Run industry detection to see insights and comparisons</p>
        </div>
      </Glassmorphism>
    </div>
  );
}
