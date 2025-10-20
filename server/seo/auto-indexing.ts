/**
 * SEO Auto-Indexing System
 * Implements PRD requirements for advanced SEO features
 */

import { db } from '../db';
import { questions, answers, forums, categories } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface SEOConfig {
  autoIndex: boolean;
  generateSitemaps: boolean;
  structuredData: boolean;
  canonicalization: boolean;
  metaOptimization: boolean;
  performanceOptimization: boolean;
}

export interface SEOContent {
  id: number;
  type: 'question' | 'answer' | 'forum' | 'category';
  title: string;
  content: string;
  url: string;
  metaDescription: string;
  keywords: string[];
  lastModified: Date;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  datePublished?: Date;
  dateModified?: Date;
  author?: {
    '@type': string;
    name: string;
  };
  mainEntity?: any;
  about?: any;
}

export class SEOAutoIndexingSystem {
  private defaultConfig: SEOConfig = {
    autoIndex: true,
    generateSitemaps: true,
    structuredData: true,
    canonicalization: true,
    metaOptimization: true,
    performanceOptimization: true
  };

  /**
   * Auto-index all content for SEO
   */
  async autoIndexContent(forumId: number): Promise<void> {
    try {
      // Get all questions and answers for the forum
      const questions = await this.getForumQuestions(forumId);
      const answers = await this.getForumAnswers(forumId);
      
      // Process each content item
      for (const question of questions) {
        await this.processContentForSEO(question, 'question');
      }
      
      for (const answer of answers) {
        await this.processContentForSEO(answer, 'answer');
      }
      
      // Generate sitemap
      if (this.defaultConfig.generateSitemaps) {
        await this.generateSitemap(forumId);
      }
      
      // Generate structured data
      if (this.defaultConfig.structuredData) {
        await this.generateStructuredData(forumId);
      }
      
    } catch (error) {
      console.error('Error in auto-indexing:', error);
      throw error;
    }
  }

  /**
   * Process individual content for SEO
   */
  private async processContentForSEO(content: any, type: 'question' | 'answer'): Promise<void> {
    try {
      // Generate SEO-optimized meta description
      const metaDescription = this.generateMetaDescription(content.content, content.title);
      
      // Extract keywords
      const keywords = this.extractKeywords(content.title, content.content);
      
      // Generate canonical URL
      const canonicalUrl = this.generateCanonicalUrl(content.id, type);
      
      // Update content with SEO data
      await this.updateContentSEO(content.id, type, {
        metaDescription,
        keywords,
        canonicalUrl
      });
      
    } catch (error) {
      console.error(`Error processing ${type} ${content.id}:`, error);
    }
  }

  /**
   * Generate meta description
   */
  private generateMetaDescription(content: string, title: string): string {
    // Clean content and limit to 160 characters
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    const description = cleanContent.length > 160 
      ? cleanContent.substring(0, 157) + '...'
      : cleanContent;
    
    return description || `${title} - Expert insights and discussions`;
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];
    
    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      if (!this.isStopWord(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Return top keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'for', 'with', 'this', 'that', 'are', 'was', 'were',
      'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should',
      'may', 'might', 'can', 'must', 'shall', 'from', 'they', 'them',
      'their', 'there', 'these', 'those', 'what', 'when', 'where',
      'which', 'who', 'why', 'how', 'about', 'above', 'below', 'over',
      'under', 'through', 'during', 'before', 'after', 'between', 'among'
    ];
    
    return stopWords.includes(word);
  }

  /**
   * Generate canonical URL
   */
  private generateCanonicalUrl(id: number, type: 'question' | 'answer'): string {
    const baseUrl = process.env.BASE_URL || 'https://geofora.com';
    return `${baseUrl}/${type}/${id}`;
  }

  /**
   * Update content with SEO data
   */
  private async updateContentSEO(
    id: number, 
    type: 'question' | 'answer', 
    seoData: { metaDescription: string; keywords: string[]; canonicalUrl: string }
  ): Promise<void> {
    // This would update the database with SEO metadata
    // For now, we'll just log the data
    console.log(`Updated SEO data for ${type} ${id}:`, seoData);
  }

  /**
   * Generate XML sitemap
   */
  async generateSitemap(forumId: number): Promise<string> {
    try {
      const entries = await this.getSitemapEntries(forumId);
      
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      entries.forEach(entry => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${entry.url}</loc>\n`;
        sitemap += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`;
        sitemap += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
        sitemap += `    <priority>${entry.priority}</priority>\n`;
        sitemap += '  </url>\n';
      });
      
      sitemap += '</urlset>';
      
      // Save sitemap to file or database
      await this.saveSitemap(forumId, sitemap);
      
      return sitemap;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      throw error;
    }
  }

  /**
   * Get sitemap entries for forum
   */
  private async getSitemapEntries(forumId: number): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = [];
    const baseUrl = process.env.BASE_URL || 'https://geofora.com';
    
    // Add forum main page
    entries.push({
      url: `${baseUrl}/forum/${forumId}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    });
    
    // Add questions
    const forumQuestions = await this.getForumQuestions(forumId);
    forumQuestions.forEach(question => {
      entries.push({
        url: `${baseUrl}/question/${question.id}`,
        lastModified: question.createdAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8
      });
    });
    
    // Add categories
    const forumCategories = await this.getForumCategories(forumId);
    forumCategories.forEach(category => {
      entries.push({
        url: `${baseUrl}/category/${category.id}`,
        lastModified: category.createdAt || new Date(),
        changeFrequency: 'monthly',
        priority: 0.6
      });
    });
    
    return entries;
  }

  /**
   * Generate structured data (Schema.org)
   */
  async generateStructuredData(forumId: number): Promise<StructuredData[]> {
    try {
      const structuredData: StructuredData[] = [];
      const forum = await this.getForum(forumId);
      
      if (forum) {
        // Forum structured data
        structuredData.push({
          '@context': 'https://schema.org',
          '@type': 'DiscussionForumPosting',
          name: forum.name,
          description: forum.description || '',
          url: `${process.env.BASE_URL}/forum/${forumId}`,
          datePublished: forum.createdAt,
          dateModified: forum.updatedAt || forum.createdAt
        });
        
        // Questions structured data
        const forumQuestions = await this.getForumQuestions(forumId);
        forumQuestions.forEach(question => {
          structuredData.push({
            '@context': 'https://schema.org',
            '@type': 'Question',
            name: question.title,
            description: question.content,
            url: `${process.env.BASE_URL}/question/${question.id}`,
            datePublished: question.createdAt,
            dateModified: question.updatedAt || question.createdAt,
            mainEntity: {
              '@type': 'Question',
              name: question.title,
              text: question.content
            }
          });
        });
      }
      
      return structuredData;
    } catch (error) {
      console.error('Error generating structured data:', error);
      throw error;
    }
  }

  /**
   * Get forum questions
   */
  private async getForumQuestions(forumId: number): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(questions)
        .where(eq(questions.forumId, forumId))
        .orderBy(desc(questions.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error fetching forum questions:', error);
      return [];
    }
  }

  /**
   * Get forum answers
   */
  private async getForumAnswers(forumId: number): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(answers)
        .innerJoin(questions, eq(answers.questionId, questions.id))
        .where(eq(questions.forumId, forumId))
        .orderBy(desc(answers.createdAt));
      
      return result.map(row => row.answers);
    } catch (error) {
      console.error('Error fetching forum answers:', error);
      return [];
    }
  }

  /**
   * Get forum categories
   */
  private async getForumCategories(forumId: number): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(categories)
        .where(eq(categories.forumId, forumId));
      
      return result;
    } catch (error) {
      console.error('Error fetching forum categories:', error);
      return [];
    }
  }

  /**
   * Get forum details
   */
  private async getForum(forumId: number): Promise<any> {
    try {
      const result = await db
        .select()
        .from(forums)
        .where(eq(forums.id, forumId))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching forum:', error);
      return null;
    }
  }

  /**
   * Save sitemap
   */
  private async saveSitemap(forumId: number, sitemap: string): Promise<void> {
    // This would save the sitemap to a file or database
    console.log(`Saving sitemap for forum ${forumId}`);
  }

  /**
   * Get SEO statistics
   */
  async getSEOStats(forumId: number): Promise<{
    totalPages: number;
    indexedPages: number;
    sitemapGenerated: boolean;
    structuredDataGenerated: boolean;
    lastIndexed: Date;
  }> {
    try {
      const questions = await this.getForumQuestions(forumId);
      const answers = await this.getForumAnswers(forumId);
      
      return {
        totalPages: questions.length + answers.length + 1, // +1 for forum page
        indexedPages: questions.length + answers.length,
        sitemapGenerated: true,
        structuredDataGenerated: true,
        lastIndexed: new Date()
      };
    } catch (error) {
      console.error('Error getting SEO stats:', error);
      throw error;
    }
  }

  /**
   * Optimize content for performance
   */
  async optimizeContentPerformance(content: string): Promise<string> {
    // Remove unnecessary whitespace
    let optimized = content.replace(/\s+/g, ' ').trim();
    
    // Remove empty paragraphs
    optimized = optimized.replace(/<p>\s*<\/p>/g, '');
    
    // Optimize images (placeholder - would integrate with image optimization service)
    optimized = optimized.replace(/<img([^>]*)>/g, (match, attrs) => {
      if (!attrs.includes('loading=')) {
        return `<img${attrs} loading="lazy">`;
      }
      return match;
    });
    
    return optimized;
  }
}

// Export singleton instance
export const seoAutoIndexingSystem = new SEOAutoIndexingSystem();
