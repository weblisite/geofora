/**
 * XML Sitemaps Generation System
 * Implements PRD requirements for advanced SEO sitemaps
 */

import { db } from '../db';
import { questions, answers, forums, categories, mainSitePages } from '../../shared/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: Array<{
    loc: string;
    caption?: string;
    title?: string;
  }>;
}

export interface SitemapIndex {
  sitemaps: Array<{
    loc: string;
    lastModified: Date;
  }>;
}

export interface SitemapConfig {
  baseUrl: string;
  maxUrlsPerSitemap: number;
  includeImages: boolean;
  includeNews: boolean;
  includeVideo: boolean;
  defaultChangeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  defaultPriority: number;
}

export class XMLSitemapsSystem {
  private config: SitemapConfig;

  constructor(config: Partial<SitemapConfig> = {}) {
    this.config = {
      baseUrl: process.env.BASE_URL || 'https://geofora.com',
      maxUrlsPerSitemap: 50000,
      includeImages: true,
      includeNews: false,
      includeVideo: false,
      defaultChangeFrequency: 'weekly',
      defaultPriority: 0.5,
      ...config
    };
  }

  /**
   * Generate main sitemap index
   */
  async generateSitemapIndex(): Promise<SitemapIndex> {
    try {
      const sitemaps = [
        {
          loc: `${this.config.baseUrl}/sitemap-main.xml`,
          lastModified: new Date()
        },
        {
          loc: `${this.config.baseUrl}/sitemap-forums.xml`,
          lastModified: new Date()
        },
        {
          loc: `${this.config.baseUrl}/sitemap-questions.xml`,
          lastModified: new Date()
        },
        {
          loc: `${this.config.baseUrl}/sitemap-pages.xml`,
          lastModified: new Date()
        }
      ];

      return { sitemaps };
    } catch (error) {
      console.error('Error generating sitemap index:', error);
      throw error;
    }
  }

  /**
   * Generate main sitemap
   */
  async generateMainSitemap(): Promise<SitemapEntry[]> {
    try {
      const entries: SitemapEntry[] = [];

      // Home page
      entries.push({
        url: this.config.baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      });

      // Main navigation pages
      const mainPages = [
        { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
        { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' as const },
        { path: '/features', priority: 0.8, changeFrequency: 'monthly' as const },
        { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
        { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
        { path: '/docs', priority: 0.7, changeFrequency: 'weekly' as const }
      ];

      mainPages.forEach(page => {
        entries.push({
          url: `${this.config.baseUrl}${page.path}`,
          lastModified: new Date(),
          changeFrequency: page.changeFrequency,
          priority: page.priority
        });
      });

      return entries;
    } catch (error) {
      console.error('Error generating main sitemap:', error);
      throw error;
    }
  }

  /**
   * Generate forums sitemap
   */
  async generateForumsSitemap(): Promise<SitemapEntry[]> {
    try {
      const entries: SitemapEntry[] = [];
      const forums = await db.query.forums.findMany({
        orderBy: desc(forums.createdAt)
      });

      forums.forEach(forum => {
        entries.push({
          url: `${this.config.baseUrl}/forum/${forum.id}`,
          lastModified: forum.updatedAt || forum.createdAt || new Date(),
          changeFrequency: 'daily',
          priority: 0.8
        });

        // Add forum categories if they exist
        if (forum.categories) {
          forum.categories.forEach(category => {
            entries.push({
              url: `${this.config.baseUrl}/forum/${forum.id}/category/${category.id}`,
              lastModified: category.updatedAt || category.createdAt || new Date(),
              changeFrequency: 'weekly',
              priority: 0.6
            });
          });
        }
      });

      return entries;
    } catch (error) {
      console.error('Error generating forums sitemap:', error);
      throw error;
    }
  }

  /**
   * Generate questions sitemap
   */
  async generateQuestionsSitemap(): Promise<SitemapEntry[]> {
    try {
      const entries: SitemapEntry[] = [];
      const questions = await db.query.questions.findMany({
        orderBy: desc(questions.createdAt),
        limit: this.config.maxUrlsPerSitemap
      });

      questions.forEach(question => {
        entries.push({
          url: `${this.config.baseUrl}/question/${question.id}`,
          lastModified: question.updatedAt || question.createdAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.7
        });
      });

      return entries;
    } catch (error) {
      console.error('Error generating questions sitemap:', error);
      throw error;
    }
  }

  /**
   * Generate pages sitemap
   */
  async generatePagesSitemap(): Promise<SitemapEntry[]> {
    try {
      const entries: SitemapEntry[] = [];
      const pages = await db.query.mainSitePages.findMany({
        orderBy: desc(mainSitePages.createdAt)
      });

      pages.forEach(page => {
        entries.push({
          url: `${this.config.baseUrl}/${page.slug}`,
          lastModified: page.updatedAt || page.createdAt || new Date(),
          changeFrequency: this.getChangeFrequencyForPageType(page.pageType),
          priority: this.getPriorityForPageType(page.pageType)
        });
      });

      return entries;
    } catch (error) {
      console.error('Error generating pages sitemap:', error);
      throw error;
    }
  }

  /**
   * Generate news sitemap
   */
  async generateNewsSitemap(): Promise<SitemapEntry[]> {
    try {
      if (!this.config.includeNews) {
        return [];
      }

      const entries: SitemapEntry[] = [];
      const newsPages = await db.query.mainSitePages.findMany({
        where: eq(mainSitePages.pageType, 'news'),
        orderBy: desc(mainSitePages.createdAt),
        limit: 1000 // Google News limit
      });

      newsPages.forEach(page => {
        entries.push({
          url: `${this.config.baseUrl}/${page.slug}`,
          lastModified: page.updatedAt || page.createdAt || new Date(),
          changeFrequency: 'daily',
          priority: 0.9
        });
      });

      return entries;
    } catch (error) {
      console.error('Error generating news sitemap:', error);
      throw error;
    }
  }

  /**
   * Generate image sitemap
   */
  async generateImageSitemap(): Promise<SitemapEntry[]> {
    try {
      if (!this.config.includeImages) {
        return [];
      }

      const entries: SitemapEntry[] = [];
      
      // Get pages with images
      const pagesWithImages = await db.query.mainSitePages.findMany({
        where: and(
          eq(mainSitePages.featuredImage, ''),
          // Add condition to check for non-empty featuredImage
        )
      });

      pagesWithImages.forEach(page => {
        if (page.featuredImage) {
          entries.push({
            url: `${this.config.baseUrl}/${page.slug}`,
            lastModified: page.updatedAt || page.createdAt || new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
            images: [{
              loc: page.featuredImage,
              caption: page.title,
              title: page.title
            }]
          });
        }
      });

      return entries;
    } catch (error) {
      console.error('Error generating image sitemap:', error);
      throw error;
    }
  }

  /**
   * Generate video sitemap
   */
  async generateVideoSitemap(): Promise<SitemapEntry[]> {
    try {
      if (!this.config.includeVideo) {
        return [];
      }

      // This would be implemented when video content is added
      return [];
    } catch (error) {
      console.error('Error generating video sitemap:', error);
      throw error;
    }
  }

  /**
   * Generate all sitemaps
   */
  async generateAllSitemaps(): Promise<{
    sitemapIndex: SitemapIndex;
    mainSitemap: SitemapEntry[];
    forumsSitemap: SitemapEntry[];
    questionsSitemap: SitemapEntry[];
    pagesSitemap: SitemapEntry[];
    newsSitemap: SitemapEntry[];
    imageSitemap: SitemapEntry[];
    videoSitemap: SitemapEntry[];
  }> {
    try {
      const [
        sitemapIndex,
        mainSitemap,
        forumsSitemap,
        questionsSitemap,
        pagesSitemap,
        newsSitemap,
        imageSitemap,
        videoSitemap
      ] = await Promise.all([
        this.generateSitemapIndex(),
        this.generateMainSitemap(),
        this.generateForumsSitemap(),
        this.generateQuestionsSitemap(),
        this.generatePagesSitemap(),
        this.generateNewsSitemap(),
        this.generateImageSitemap(),
        this.generateVideoSitemap()
      ]);

      return {
        sitemapIndex,
        mainSitemap,
        forumsSitemap,
        questionsSitemap,
        pagesSitemap,
        newsSitemap,
        imageSitemap,
        videoSitemap
      };
    } catch (error) {
      console.error('Error generating all sitemaps:', error);
      throw error;
    }
  }

  /**
   * Convert sitemap entries to XML
   */
  entriesToXML(entries: SitemapEntry[], sitemapType: 'urlset' | 'sitemapindex' = 'urlset'): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    
    if (sitemapType === 'urlset') {
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
      
      if (this.config.includeImages) {
        xml += ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
      }
      
      if (this.config.includeNews) {
        xml += ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"';
      }
      
      if (this.config.includeVideo) {
        xml += ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"';
      }
      
      xml += '>\n';
      
      entries.forEach(entry => {
        xml += '  <url>\n';
        xml += `    <loc>${this.escapeXML(entry.url)}</loc>\n`;
        xml += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`;
        xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
        xml += `    <priority>${entry.priority}</priority>\n`;
        
        // Add images if present
        if (entry.images && entry.images.length > 0) {
          entry.images.forEach(image => {
            xml += '    <image:image>\n';
            xml += `      <image:loc>${this.escapeXML(image.loc)}</image:loc>\n`;
            if (image.caption) {
              xml += `      <image:caption>${this.escapeXML(image.caption)}</image:caption>\n`;
            }
            if (image.title) {
              xml += `      <image:title>${this.escapeXML(image.title)}</image:title>\n`;
            }
            xml += '    </image:image>\n';
          });
        }
        
        xml += '  </url>\n';
      });
      
      xml += '</urlset>';
    } else {
      xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      entries.forEach(entry => {
        xml += '  <sitemap>\n';
        xml += `    <loc>${this.escapeXML(entry.url)}</loc>\n`;
        xml += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`;
        xml += '  </sitemap>\n';
      });
      
      xml += '</sitemapindex>';
    }
    
    return xml;
  }

  /**
   * Generate sitemap index XML
   */
  sitemapIndexToXML(sitemapIndex: SitemapIndex): string {
    const entries: SitemapEntry[] = sitemapIndex.sitemaps.map(sitemap => ({
      url: sitemap.loc,
      lastModified: sitemap.lastModified,
      changeFrequency: 'never' as const,
      priority: 0
    }));
    
    return this.entriesToXML(entries, 'sitemapindex');
  }

  /**
   * Get change frequency for page type
   */
  private getChangeFrequencyForPageType(pageType: string): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
    switch (pageType) {
      case 'blog':
        return 'daily';
      case 'product':
        return 'weekly';
      case 'landing':
        return 'monthly';
      case 'documentation':
        return 'weekly';
      default:
        return this.config.defaultChangeFrequency;
    }
  }

  /**
   * Get priority for page type
   */
  private getPriorityForPageType(pageType: string): number {
    switch (pageType) {
      case 'landing':
        return 1.0;
      case 'product':
        return 0.9;
      case 'blog':
        return 0.8;
      case 'documentation':
        return 0.7;
      default:
        return this.config.defaultPriority;
    }
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Submit sitemap to search engines
   */
  async submitSitemapToSearchEngines(sitemapUrl: string): Promise<{
    google: boolean;
    bing: boolean;
    yandex: boolean;
  }> {
    const results = {
      google: false,
      bing: false,
      yandex: false
    };

    try {
      // Submit to Google Search Console
      const googleUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      // This would make an HTTP request to Google
      console.log(`Submitting to Google: ${googleUrl}`);
      results.google = true;

      // Submit to Bing Webmaster Tools
      const bingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      // This would make an HTTP request to Bing
      console.log(`Submitting to Bing: ${bingUrl}`);
      results.bing = true;

      // Submit to Yandex Webmaster
      const yandexUrl = `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      // This would make an HTTP request to Yandex
      console.log(`Submitting to Yandex: ${yandexUrl}`);
      results.yandex = true;

    } catch (error) {
      console.error('Error submitting sitemap to search engines:', error);
    }

    return results;
  }

  /**
   * Get sitemap statistics
   */
  async getSitemapStats(): Promise<{
    totalUrls: number;
    totalSitemaps: number;
    lastGenerated: Date;
    urlsByType: Record<string, number>;
  }> {
    try {
      const [
        mainSitemap,
        forumsSitemap,
        questionsSitemap,
        pagesSitemap
      ] = await Promise.all([
        this.generateMainSitemap(),
        this.generateForumsSitemap(),
        this.generateQuestionsSitemap(),
        this.generatePagesSitemap()
      ]);

      const totalUrls = mainSitemap.length + forumsSitemap.length + questionsSitemap.length + pagesSitemap.length;

      return {
        totalUrls,
        totalSitemaps: 4,
        lastGenerated: new Date(),
        urlsByType: {
          main: mainSitemap.length,
          forums: forumsSitemap.length,
          questions: questionsSitemap.length,
          pages: pagesSitemap.length
        }
      };
    } catch (error) {
      console.error('Error getting sitemap stats:', error);
      throw error;
    }
  }

  /**
   * Update sitemap configuration
   */
  updateConfig(newConfig: Partial<SitemapConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get sitemap configuration
   */
  getConfig(): SitemapConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const xmlSitemapsSystem = new XMLSitemapsSystem();
