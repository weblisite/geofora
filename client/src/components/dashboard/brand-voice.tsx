import React from 'react';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Volume2, Palette, Wand2 } from 'lucide-react';

export default function BrandVoiceDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Mic className="w-6 h-6 mr-2 text-primary-400" />
            <GradientText>Brand Voice Integration</GradientText>
          </h1>
          <p className="text-gray-400 mt-1">
            Create, manage, and apply custom brand voice profiles for AI-generated content
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-primary-400" />
            Brand Voice Profile
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Brand Name</label>
              <input
                type="text"
                placeholder="Your Brand Name"
                className="w-full px-3 py-2 bg-dark-500 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Voice Description</label>
              <Textarea
                placeholder="Describe your brand voice: tone, personality, communication style..."
                className="min-h-[100px]"
              />
            </div>
            <Button className="w-full">
              <Wand2 className="w-4 h-4 mr-2" />
              Create Brand Voice
            </Button>
          </div>
        </Glassmorphism>

        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Volume2 className="w-5 h-5 mr-2 text-primary-400" />
            Voice Analysis
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Content to Analyze</label>
              <Textarea
                placeholder="Enter content to analyze for brand voice consistency..."
                className="min-h-[120px]"
              />
            </div>
            <Button className="w-full">
              <Mic className="w-4 h-4 mr-2" />
              Analyze Voice Consistency
            </Button>
          </div>
        </Glassmorphism>
      </div>

      <Glassmorphism className="p-6">
        <h3 className="text-lg font-semibold mb-4">Brand Voice Profiles</h3>
        <div className="text-center py-8 text-gray-400">
          <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Create your first brand voice profile to get started</p>
        </div>
      </Glassmorphism>
    </div>
  );
}
