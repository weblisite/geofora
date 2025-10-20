import React from 'react';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Building2, TrendingUp, BarChart3, Target } from 'lucide-react';

export default function BusinessAnalysisDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-primary-400" />
            <GradientText>Business Analysis Engine</GradientText>
          </h1>
          <p className="text-gray-400 mt-1">
            Analyze your business context, industry, and brand voice for AI-powered content generation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
            Website Analysis
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
              Analyze Business Context
            </Button>
          </div>
        </Glassmorphism>

        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary-400" />
            Industry Detection
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Business Description</label>
              <Textarea
                placeholder="Describe your business, products, and services..."
                className="min-h-[100px]"
              />
            </div>
            <Button className="w-full">
              <Target className="w-4 h-4 mr-2" />
              Detect Industry & Keywords
            </Button>
          </div>
        </Glassmorphism>
      </div>

      <Glassmorphism className="p-6">
        <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
        <div className="text-center py-8 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Run an analysis to see your business insights and recommendations</p>
        </div>
      </Glassmorphism>
    </div>
  );
}
