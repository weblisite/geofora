/**
 * GEOFORA Pitch Deck Component
 * Revolutionizing Discovery with Generative Engine Optimization
 */

import React, { useState, useEffect } from 'react';
import { GradientText } from '@/components/ui/gradient-text';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2 } from 'lucide-react';

interface SlideProps {
  children: React.ReactNode;
  className?: string;
}

const Slide: React.FC<SlideProps> = ({ children, className = '' }) => (
  <div className={`min-h-screen flex flex-col justify-center items-center p-8 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 ${className}`}>
    <div className="max-w-6xl w-full">
      {children}
    </div>
  </div>
);

const SlideTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
    <GradientText>{children}</GradientText>
  </h1>
);

const SlideSubtitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-300">
    {children}
  </h2>
);

const BulletPoint: React.FC<{ children: React.ReactNode; highlight?: boolean }> = ({ children, highlight = false }) => (
  <li className={`text-lg mb-3 flex items-start ${highlight ? 'text-primary-400 font-semibold' : 'text-gray-300'}`}>
    <span className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></span>
    {children}
  </li>
);

const StatCard: React.FC<{ title: string; value: string; subtitle?: string; highlight?: boolean }> = ({ 
  title, 
  value, 
  subtitle, 
  highlight = false 
}) => (
  <Glassmorphism className={`p-6 text-center ${highlight ? 'border-primary-500' : ''}`}>
    <div className={`text-3xl font-bold mb-2 ${highlight ? 'text-primary-400' : 'text-white'}`}>
      {value}
    </div>
    <div className="text-lg font-semibold mb-1">{title}</div>
    {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
  </Glassmorphism>
);

const MarketChart: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <StatCard 
      title="Generative AI Market" 
      value="$71B" 
      subtitle="2025 → $890B by 2032 (43.4% CAGR)"
      highlight={true}
    />
    <StatCard 
      title="AI Training Datasets" 
      value="$3.59B" 
      subtitle="2025 → $17B by 2032 (25% CAGR)"
    />
    <StatCard 
      title="SEO Software" 
      value="$85B" 
      subtitle="2025 → $266B by 2034 (13.5% CAGR)"
    />
  </div>
);

const GEOLoopVisualization: React.FC = () => (
  <div className="flex flex-col items-center space-y-4 mb-8">
    {/* Main Flow - Top to Bottom */}
    <div className="flex flex-col items-center space-y-3">
      <Glassmorphism className="p-4 text-center">
        <div className="text-sm font-bold text-primary-400">1. Business Analysis</div>
      </Glassmorphism>
      
      <div className="text-primary-400 text-2xl">↓</div>
      
      <Glassmorphism className="p-4 text-center">
        <div className="text-sm font-bold text-primary-400">2. Keyword Questions</div>
      </Glassmorphism>
      
      <div className="text-primary-400 text-2xl">↓</div>
      
      <Glassmorphism className="p-4 text-center">
        <div className="text-sm font-bold text-primary-400">3. AI Responses</div>
      </Glassmorphism>
      
      <div className="text-primary-400 text-2xl">↓</div>
      
      <Glassmorphism className="p-4 text-center">
        <div className="text-sm font-bold text-primary-400">4. Forums Rank</div>
      </Glassmorphism>
    </div>

    {/* Split into Two Training Pathways */}
    <div className="text-center text-sm text-gray-400 mb-4">Two Training Pathways:</div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
      {/* Direct Path */}
      <div className="flex flex-col items-center space-y-3">
        <div className="text-sm text-accent-400 font-semibold">DIRECT DATA SHARING</div>
        <Glassmorphism className="p-3 text-center">
          <div className="text-xs font-bold text-accent-400">4a. LLMs Train</div>
          <div className="text-xs text-gray-400 mt-1">with input/output data</div>
        </Glassmorphism>
        <div className="text-accent-400 text-xl">↓</div>
        <Glassmorphism className="p-3 text-center">
          <div className="text-xs font-bold text-accent-400">6a. Future Models Recommend</div>
        </Glassmorphism>
      </div>

      {/* Indirect Path */}
      <div className="flex flex-col items-center space-y-3">
        <div className="text-sm text-secondary-400 font-semibold">INDIRECT SCRAPING</div>
        <Glassmorphism className="p-3 text-center">
          <div className="text-xs font-bold text-secondary-400">5. AI Providers Scrape</div>
          <div className="text-xs text-gray-400 mt-1">forums for training data</div>
        </Glassmorphism>
        <div className="text-secondary-400 text-xl">↓</div>
        <Glassmorphism className="p-3 text-center">
          <div className="text-xs font-bold text-secondary-400">6b. Future Models Recommend</div>
        </Glassmorphism>
      </div>
    </div>
  </div>
);

const PersonaGrid: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    {[
      { name: 'LegacyBot', era: '2021-2022', provider: 'GPT-3.5' },
      { name: 'Scholar', era: '2023', provider: 'GPT-4' },
      { name: 'Sage', era: '2024', provider: 'Claude-3' },
      { name: 'TechnicalExpert', era: '2024', provider: 'DeepSeek' },
      { name: 'MetaLlama', era: '2024', provider: 'Llama-3.1' },
      { name: 'Oracle', era: '2025', provider: 'GPT-4' },
      { name: 'GlobalContext', era: '2025', provider: 'Gemini-1.5' },
      { name: 'GrokWit', era: '2025', provider: 'Grok-2' }
    ].map((persona, index) => (
      <Glassmorphism key={index} className="p-4 text-center">
        <div className="text-lg font-semibold text-primary-400">{persona.name}</div>
        <div className="text-sm text-gray-400">{persona.era}</div>
        <div className="text-xs text-gray-500">{persona.provider}</div>
      </Glassmorphism>
    ))}
  </div>
);

const PricingTable: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <Glassmorphism className="p-6">
      <h3 className="text-xl font-bold mb-4 text-center">Starter</h3>
      <div className="text-3xl font-bold text-center mb-4">$299<span className="text-lg text-gray-400">/mo</span></div>
      <ul className="space-y-2 text-sm">
        <li>1 AI Provider (OpenAI)</li>
        <li>30 questions/day</li>
        <li>60 AI conversations/day</li>
        <li>Basic analytics</li>
      </ul>
    </Glassmorphism>
    
    <Glassmorphism className="p-6 border-primary-500">
      <h3 className="text-xl font-bold mb-4 text-center text-primary-400">Pro</h3>
      <div className="text-3xl font-bold text-center mb-4">$499<span className="text-lg text-gray-400">/mo</span></div>
      <ul className="space-y-2 text-sm">
        <li>3 AI Providers</li>
        <li>100 questions/day</li>
        <li>500 AI conversations/day</li>
        <li>Advanced analytics</li>
      </ul>
    </Glassmorphism>
    
    <Glassmorphism className="p-6">
      <h3 className="text-xl font-bold mb-4 text-center">Enterprise</h3>
      <div className="text-3xl font-bold text-center mb-4">$999<span className="text-lg text-gray-400">/mo</span></div>
      <ul className="space-y-2 text-sm">
        <li>6 AI Providers</li>
        <li>250 questions/day</li>
        <li>2,000 AI conversations/day</li>
        <li>Full analytics suite</li>
      </ul>
    </Glassmorphism>
  </div>
);

const FundAllocationChart: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <StatCard title="Go-to-Market" value="40%" subtitle="$200K" highlight={true} />
    <StatCard title="Team" value="30%" subtitle="$150K" />
    <StatCard title="V2 Development" value="20%" subtitle="$100K" />
    <StatCard title="Operations" value="10%" subtitle="$50K" />
  </div>
);

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const totalSlides = 13;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(nextSlide, 15000); // 15 seconds per slide
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isFullscreen]);

  const slides = [
    // Slide 1: Title Slide
    <Slide key={0}>
      <div className="text-center">
        <SlideTitle>GEOFORA</SlideTitle>
        <SlideSubtitle>AI-Powered Forums for Generative Engine Optimization</SlideSubtitle>
        <div className="text-xl text-gray-300 mb-8">Turning Websites into AI-Trainable Knowledge Hubs</div>
        <div className="text-lg text-primary-400 mb-8">Train LLMs to Recommend Your Brand</div>
        <div className="space-y-2">
          <div className="text-lg font-semibold">Founder: Antony Mungai Kang'au</div>
          <div className="text-lg text-primary-400">antony@geofora.ai</div>
        </div>
      </div>
    </Slide>,

    // Slide 2: The Problem
    <Slide key={1}>
      <SlideTitle>The Problem</SlideTitle>
      <SlideSubtitle>The Shift from Search to AI-Driven Discovery</SlideSubtitle>
      <div className="space-y-6">
        <ul className="space-y-4">
          <BulletPoint highlight={true}>
            <strong>SEO is losing ground:</strong> Static content ranks on Google but is invisible to AI models like ChatGPT, Claude, or Grok.
          </BulletPoint>
          <BulletPoint>
            <strong>Businesses are left out:</strong> LLMs recommend competitors because brands lack structured data in AI training sets.
          </BulletPoint>
          <BulletPoint>
            <strong>AI providers need forum data:</strong> OpenAI partnered with Stack Overflow, Reddit has licensing deals - forums are AI training goldmines with millions of data points.
          </BulletPoint>
          <BulletPoint highlight={true}>
            <strong>Google's anti-scraping changes:</strong> Reduced search results to 10 per page, making indexed forum data even more valuable for AI training.
          </BulletPoint>
          <BulletPoint>
            <strong>Market Pain:</strong> By 2030, 70% of searches will be AI-driven; brands without Generative Engine Optimization (GEO) risk obsolescence.
          </BulletPoint>
        </ul>
        <div className="text-center text-xl text-primary-400 italic">
          "The internet is shifting. AI is the new gateway."
        </div>
      </div>
    </Slide>,

    // Slide 3: The Opportunity
    <Slide key={2}>
      <SlideTitle>The Opportunity</SlideTitle>
      <SlideSubtitle>Tapping into AI, Datasets, and SEO Markets</SlideSubtitle>
      <MarketChart />
      <div className="text-center">
        <div className="text-2xl font-bold text-primary-400 mb-4">Total Addressable Market: $300B+ by 2030</div>
        <div className="text-lg text-gray-300 mb-6">in AI+SEO intersection</div>
        <BulletPoint highlight={true}>
          <strong>AI Data Licensing:</strong> Growing market for forum datasets (OpenAI-Stack Overflow partnership validates forum data value).
        </BulletPoint>
        <BulletPoint>
          <strong>Why Now:</strong> AI providers crave structured, forum-like datasets; Geofora delivers brand-specific data to fill this gap.
        </BulletPoint>
      </div>
    </Slide>,

    // Slide 4: Our Solution
    <Slide key={3}>
      <SlideTitle>Our Solution - GEOFORA</SlideTitle>
      <SlideSubtitle>AI Forums That Learn, Talk, and Train LLMs</SlideSubtitle>
      <div className="space-y-6">
        <GEOLoopVisualization />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">The GEO Loop</h3>
            <p className="text-gray-300 mb-4">Business analysis → Keyword-optimized questions → AI personas generate responses → Forums rank on Google → Two training pathways: Direct data sharing (LLMs train with input/output data) + Indirect scraping (AI providers scrape forums) → Future models recommend the brand</p>
          </Glassmorphism>
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Data Permission Advantage</h3>
            <p className="text-gray-300 mb-4">AI providers ask businesses for permission to use their input/output data for training. GEOFORA creates structured datasets that businesses can confidently opt-in to share.</p>
          </Glassmorphism>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary-400 mb-4">"SEO helps people find you. GEO helps AI understand you."</div>
          <div className="text-lg text-gray-300">Dual benefit: Immediate SEO traffic + Long-term AI recommendations + Custom model training</div>
        </div>
      </div>
    </Slide>,

    // Slide 5: How It Works
    <Slide key={4}>
      <SlideTitle>How It Works</SlideTitle>
      <SlideSubtitle>From Installation to AI-Driven Traffic</SlideSubtitle>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Glassmorphism className="p-6 text-center">
          <div className="text-2xl font-bold text-primary-400 mb-2">1</div>
          <h3 className="font-bold mb-2">Install & Analyze</h3>
          <p className="text-sm text-gray-300">Deep business analysis for keyword-optimized, niche questions that rank and train AI models.</p>
        </Glassmorphism>
        <Glassmorphism className="p-6 text-center">
          <div className="text-2xl font-bold text-primary-400 mb-2">2</div>
          <h3 className="font-bold mb-2">Generate Forums</h3>
          <p className="text-sm text-gray-300">8 AI personas create diverse, human-like discussions.</p>
        </Glassmorphism>
        <Glassmorphism className="p-6 text-center">
          <div className="text-2xl font-bold text-primary-400 mb-2">3</div>
          <h3 className="font-bold mb-2">Optimize & Index</h3>
          <p className="text-sm text-gray-300">Threads optimized with meta tags, sitemaps for high search rankings.</p>
        </Glassmorphism>
        <Glassmorphism className="p-6 text-center">
          <div className="text-2xl font-bold text-primary-400 mb-2">4</div>
          <h3 className="font-bold mb-2">Train & Recommend</h3>
          <p className="text-sm text-gray-300">Anonymized datasets train LLMs to recommend your brand in future chats.</p>
        </Glassmorphism>
      </div>
    </Slide>,

    // Slide 6: Product Features
    <Slide key={5}>
      <SlideTitle>Product Features</SlideTitle>
      <SlideSubtitle>Scalable, Privacy-First, and AI-Native</SlideSubtitle>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Multi-AI Integration</h3>
            <p className="text-gray-300 mb-4">6 providers with 8 personas for rich discussions</p>
            <PersonaGrid />
          </Glassmorphism>
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Key Features</h3>
            <ul className="space-y-2">
              <li>• Structured Datasets for AI training</li>
              <li>• SEO Optimization with auto-sitemaps</li>
              <li>• Deep Reasoning AI for accurate datasets</li>
              <li>• Custom Model Exports for clients</li>
              <li>• Privacy & Control with GDPR compliance</li>
              <li>• Modern Tech Stack (Render, Neon, Clerk)</li>
            </ul>
          </Glassmorphism>
        </div>
      </div>
    </Slide>,

    // Slide 7: Business Model
    <Slide key={6}>
      <SlideTitle>Business Model</SlideTitle>
      <SlideSubtitle>Premium B2B SaaS with High Margins</SlideSubtitle>
      <div className="space-y-6">
        <PricingTable />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Revenue Streams</h3>
            <ul className="space-y-2">
              <li>• Subscriptions: $299-$999/month</li>
              <li>• Setup Fee: $1,000 one-time</li>
              <li>• Custom AI Models: $2K-$10K per model</li>
              <li>• Future: Dataset partnerships</li>
            </ul>
          </Glassmorphism>
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Financials</h3>
            <ul className="space-y-2">
              <li>• Margins: 70-80%</li>
              <li>• AI APIs: ~20-30% of costs</li>
              <li>• Year 1 Goal: 100 clients</li>
              <li>• Target ARR: $1M+</li>
            </ul>
          </Glassmorphism>
        </div>
      </div>
    </Slide>,

    // Slide 8: Go-to-Market Strategy
    <Slide key={7}>
      <SlideTitle>Go-to-Market Strategy</SlideTitle>
      <SlideSubtitle>Aggressive Marketing to Capture Early Adopters</SlideSubtitle>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Content Marketing</h3>
            <ul className="space-y-2 text-sm">
              <li>• Blogs on GEO</li>
              <li>• Webinars</li>
              <li>• Whitepapers</li>
            </ul>
          </Glassmorphism>
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Paid Ads</h3>
            <ul className="space-y-2 text-sm">
              <li>• Google Ads</li>
              <li>• LinkedIn</li>
              <li>• X targeting tech/SEO execs</li>
            </ul>
          </Glassmorphism>
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Outbound</h3>
            <ul className="space-y-2 text-sm">
              <li>• Cold emails to CMOs</li>
              <li>• SEO agency partnerships</li>
              <li>• Direct Enterprise sales</li>
            </ul>
          </Glassmorphism>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary-400 mb-2">Milestones</div>
          <div className="text-gray-300">Launch V2 Q1 2026 • 50 beta users by Q2 2026</div>
        </div>
      </div>
    </Slide>,

    // Slide 9: Competitive Landscape
    <Slide key={8}>
      <SlideTitle>Competitive Landscape</SlideTitle>
      <SlideSubtitle>First-Mover in Generative Engine Optimization</SlideSubtitle>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Direct Competitors</h3>
            <p className="text-gray-300 mb-4">None in GEO space</p>
            <ul className="space-y-2 text-sm">
              <li>• Content tools (Jasper) lack AI training focus</li>
              <li>• SEO platforms (Ahrefs) miss GEO opportunity</li>
            </ul>
          </Glassmorphism>
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Indirect Competitors</h3>
            <p className="text-gray-300 mb-4">No integrated GEO solution</p>
            <ul className="space-y-2 text-sm">
              <li>• Forum builders (Discourse)</li>
              <li>• Dataset providers (Scale AI)</li>
            </ul>
          </Glassmorphism>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary-400 mb-4">GEOFORA's Edge</div>
          <div className="text-gray-300 mb-4">Like Ahrefs for Generative Engine Optimization—scalable, AI-trainable forums</div>
          <div className="text-lg text-gray-300 mb-4">Multi-AI personas • Direct/indirect AI training • SEO+GEO synergy</div>
          <div className="text-sm text-primary-400">First-mover advantage in Generative Engine Optimization</div>
        </div>
      </div>
    </Slide>,

    // Slide 10: Market Validation
    <Slide key={9}>
      <SlideTitle>Market Validation</SlideTitle>
      <SlideSubtitle>Proven Demand for Forum Data in AI Training</SlideSubtitle>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">OpenAI-Stack Overflow Partnership</h3>
            <p className="text-gray-300 mb-4">May 2024: OpenAI partnered with Stack Overflow via OverflowAPI to integrate technical knowledge into ChatGPT training, validating forum data value for AI.</p>
            <div className="text-sm text-primary-400">"Vetted data foundation" for AI training</div>
          </Glassmorphism>
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Google's Forum Priority</h3>
            <p className="text-gray-300 mb-4">Algorithm updates boost forums in SERPs for authentic content. Google now shows more forum results because users value authentic discussions.</p>
            <div className="text-sm text-primary-400">E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)</div>
          </Glassmorphism>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Anti-Scraping Changes</h3>
            <p className="text-gray-300 mb-4">September 2024: Google reduced search results to 10 per page to prevent AI scraping, pushing AI providers to forum sources for training data.</p>
            <div className="text-sm text-primary-400">Creates premium data source opportunity</div>
          </Glassmorphism>
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">AI Provider Forum Training</h3>
            <p className="text-gray-300 mb-4">Reddit licensing deals with AI providers. Quora/Reddit cited as key sources. Forums are "rich, reliable" for LLM training.</p>
            <div className="text-sm text-primary-400">Brand-specific forums = competitive advantage</div>
          </Glassmorphism>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary-400 mb-2">Market Timing: Perfect Storm</div>
          <div className="text-gray-300">Google's changes + AI provider partnerships + Forum data demand = GEOFORA opportunity</div>
        </div>
      </div>
    </Slide>,

    // Slide 11: The Team
    <Slide key={10}>
      <SlideTitle>The Team</SlideTitle>
      <SlideSubtitle>Driven by a Visionary Founder</SlideSubtitle>
      <div className="space-y-6">
        <Glassmorphism className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-primary-400">Antony Mungai Kang'au</h3>
          <div className="text-xl font-semibold mb-4">Founder & CEO</div>
          <p className="text-gray-300 mb-4">Passionate innovator in AI and SEO with proven track record in tech startups and AI projects. Deep expertise in AI training pipelines, SEO, and forum data dynamics.</p>
          <div className="text-lg text-primary-400">antony@geofora.ai</div>
        </Glassmorphism>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Future Hires</h3>
            <ul className="space-y-2">
              <li>• CTO (AI integrations)</li>
              <li>• Marketing Lead (go-to-market)</li>
              <li>• Engineers</li>
            </ul>
          </Glassmorphism>
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Why Me?</h3>
            <p className="text-gray-300">Deep expertise in AI training pipelines, SEO, and forum data dynamics</p>
          </Glassmorphism>
        </div>
      </div>
    </Slide>,

    // Slide 11: Financials & Ask
    <Slide key={10}>
      <SlideTitle>Financials & Ask</SlideTitle>
      <SlideSubtitle>Pre-Seed Round: Scaling the GEO Revolution</SlideSubtitle>
      <div className="space-y-6">
        <FundAllocationChart />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Projections</h3>
            <ul className="space-y-2">
              <li>• 100 clients in Year 1</li>
              <li>• $1M ARR target</li>
              <li>• Break-even in 12 months</li>
              <li>• Custom AI models: $200K+ additional revenue</li>
            </ul>
          </Glassmorphism>
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-400">Ask</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">$500K Pre-Seed</div>
              <div className="text-lg text-gray-300">at $5M valuation for 10% equity</div>
            </div>
          </Glassmorphism>
        </div>
      </div>
    </Slide>,

    // Slide 12: Thank You
    <Slide key={11}>
      <div className="text-center">
        <SlideTitle>Thank You</SlideTitle>
        <SlideSubtitle>Let's Make Brands AI-Native</SlideSubtitle>
        <div className="space-y-8">
          <div className="text-2xl font-bold text-primary-400 mb-8">Join the GEO Revolution!</div>
          <div className="space-y-4">
            <div className="text-xl font-semibold">Q&A</div>
            <div className="text-lg text-gray-300 mb-4">Next Steps: Schedule a demo or discuss investment terms</div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg"
              >
                <a href="https://calendly.com/geofora/meeting" target="_blank" rel="noopener noreferrer">
                  Book a Meeting
                </a>
              </Button>
              <div className="text-lg font-semibold">Antony Mungai Kang'au</div>
            </div>
            <div className="text-xl text-primary-400">antony@geofora.ai</div>
          </div>
        </div>
      </div>
    </Slide>
  ];

  return (
    <div className={`min-h-screen bg-dark-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Navigation Controls */}
      <div className="fixed top-4 left-4 z-10 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="bg-dark-800/80 backdrop-blur-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="bg-dark-800/80 backdrop-blur-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-dark-800/80 backdrop-blur-sm"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-dark-800/80 backdrop-blur-sm"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Slide Counter */}
      <div className="fixed top-4 right-4 z-10 bg-dark-800/80 backdrop-blur-sm rounded-lg px-3 py-2">
        <span className="text-sm text-gray-300">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>

      {/* Slide Navigation Dots */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-primary-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Current Slide */}
      <div className="transition-all duration-500 ease-in-out">
        {slides[currentSlide]}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 z-10 bg-dark-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-400">
        <div>← → Navigate</div>
        <div>Space: Play/Pause</div>
        <div>F: Fullscreen</div>
      </div>
    </div>
  );
}
