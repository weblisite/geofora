/**
 * Structured Data Markup System (Schema.org)
 * Implements PRD requirements for advanced SEO structured data
 */

import { db } from '../db';
import { questions, answers, forums, categories } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface StructuredDataItem {
  '@context': string;
  '@type': string;
  '@id'?: string;
  [key: string]: any;
}

export interface QuestionStructuredData extends StructuredDataItem {
  '@type': 'Question';
  name: string;
  text: string;
  dateCreated: string;
  dateModified: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  acceptedAnswer?: {
    '@type': 'Answer';
    text: string;
    dateCreated: string;
    author: {
      '@type': 'Person';
      name: string;
    };
  };
  suggestedAnswer?: Array<{
    '@type': 'Answer';
    text: string;
    dateCreated: string;
    author: {
      '@type': 'Person';
      name: string;
    };
  }>;
  mainEntity?: {
    '@type': 'Thing';
    name: string;
    description: string;
  };
}

export interface AnswerStructuredData extends StructuredDataItem {
  '@type': 'Answer';
  text: string;
  dateCreated: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  upvoteCount?: number;
  downvoteCount?: number;
  isAccepted?: boolean;
}

export interface ForumStructuredData extends StructuredDataItem {
  '@type': 'DiscussionForumPosting';
  name: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: {
    '@type': 'Organization';
    name: string;
  };
  mainEntity?: {
    '@type': 'Thing';
    name: string;
    description: string;
  };
  about?: Array<{
    '@type': 'Thing';
    name: string;
  }>;
}

export interface OrganizationStructuredData extends StructuredDataItem {
  '@type': 'Organization';
  name: string;
  description: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
    telephone?: string;
  };
  address?: {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    streetAddress: string;
  };
}

export interface BreadcrumbStructuredData extends StructuredDataItem {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export interface FAQStructuredData extends StructuredDataItem {
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export class StructuredDataSystem {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.BASE_URL || 'https://geofora.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate structured data for a question
   */
  async generateQuestionStructuredData(questionId: number): Promise<QuestionStructuredData> {
    try {
      const question = await db.query.questions.findFirst({
        where: eq(questions.id, questionId),
        with: {
          answers: {
            orderBy: desc(answers.createdAt),
            limit: 5
          },
          forum: true
        }
      });

      if (!question) {
        throw new Error(`Question with ID ${questionId} not found`);
      }

      const structuredData: QuestionStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Question',
        '@id': `${this.baseUrl}/question/${questionId}`,
        name: question.title,
        text: question.content,
        dateCreated: question.createdAt?.toISOString() || new Date().toISOString(),
        dateModified: question.updatedAt?.toISOString() || question.createdAt?.toISOString() || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: 'GEOFORA AI'
        }
      };

      // Add accepted answer if exists
      const acceptedAnswer = question.answers.find(answer => answer.isAccepted);
      if (acceptedAnswer) {
        structuredData.acceptedAnswer = {
          '@type': 'Answer',
          text: acceptedAnswer.content,
          dateCreated: acceptedAnswer.createdAt?.toISOString() || new Date().toISOString(),
          author: {
            '@type': 'Person',
            name: 'GEOFORA AI'
          }
        };
      }

      // Add suggested answers
      const suggestedAnswers = question.answers.filter(answer => !answer.isAccepted).slice(0, 3);
      if (suggestedAnswers.length > 0) {
        structuredData.suggestedAnswer = suggestedAnswers.map(answer => ({
          '@type': 'Answer',
          text: answer.content,
          dateCreated: answer.createdAt?.toISOString() || new Date().toISOString(),
          author: {
            '@type': 'Person',
            name: 'GEOFORA AI'
          }
        }));
      }

      // Add main entity (forum context)
      if (question.forum) {
        structuredData.mainEntity = {
          '@type': 'Thing',
          name: question.forum.name,
          description: question.forum.description || ''
        };
      }

      return structuredData;
    } catch (error) {
      console.error('Error generating question structured data:', error);
      throw error;
    }
  }

  /**
   * Generate structured data for an answer
   */
  async generateAnswerStructuredData(answerId: number): Promise<AnswerStructuredData> {
    try {
      const answer = await db.query.answers.findFirst({
        where: eq(answers.id, answerId),
        with: {
          question: true
        }
      });

      if (!answer) {
        throw new Error(`Answer with ID ${answerId} not found`);
      }

      const structuredData: AnswerStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Answer',
        text: answer.content,
        dateCreated: answer.createdAt?.toISOString() || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: 'GEOFORA AI'
        },
        upvoteCount: answer.upvotes || 0,
        downvoteCount: answer.downvotes || 0,
        isAccepted: answer.isAccepted || false
      };

      return structuredData;
    } catch (error) {
      console.error('Error generating answer structured data:', error);
      throw error;
    }
  }

  /**
   * Generate structured data for a forum
   */
  async generateForumStructuredData(forumId: number): Promise<ForumStructuredData> {
    try {
      const forum = await db.query.forums.findFirst({
        where: eq(forums.id, forumId),
        with: {
          questions: {
            orderBy: desc(questions.createdAt),
            limit: 10
          }
        }
      });

      if (!forum) {
        throw new Error(`Forum with ID ${forumId} not found`);
      }

      const structuredData: ForumStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'DiscussionForumPosting',
        name: forum.name,
        description: forum.description || '',
        url: `${this.baseUrl}/forum/${forumId}`,
        datePublished: forum.createdAt?.toISOString() || new Date().toISOString(),
        dateModified: forum.updatedAt?.toISOString() || forum.createdAt?.toISOString() || new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: 'GEOFORA'
        }
      };

      // Add main entity
      structuredData.mainEntity = {
        '@type': 'Thing',
        name: forum.name,
        description: forum.description || ''
      };

      // Add about topics
      if (forum.questions.length > 0) {
        const topics = forum.questions.map(q => q.title).slice(0, 5);
        structuredData.about = topics.map(topic => ({
          '@type': 'Thing',
          name: topic
        }));
      }

      return structuredData;
    } catch (error) {
      console.error('Error generating forum structured data:', error);
      throw error;
    }
  }

  /**
   * Generate organization structured data
   */
  generateOrganizationStructuredData(): OrganizationStructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'GEOFORA',
      description: 'The world\'s first platform to influence AI training datasets for long-term discovery. Our AI-powered forums generate Q&A threads that shape how AI models understand your industry.',
      url: this.baseUrl,
      logo: `${this.baseUrl}/logo.png`,
      sameAs: [
        'https://twitter.com/geofora',
        'https://linkedin.com/company/geofora',
        'https://github.com/geofora'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@geofora.ai'
      }
    };
  }

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): BreadcrumbStructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    };
  }

  /**
   * Generate FAQ structured data
   */
  async generateFAQStructuredData(forumId: number): Promise<FAQStructuredData> {
    try {
      const questions = await db.query.questions.findMany({
        where: eq(questions.forumId, forumId),
        with: {
          answers: {
            where: eq(answers.isAccepted, true),
            limit: 1
          }
        },
        orderBy: desc(questions.createdAt),
        limit: 10
      });

      const faqItems = questions
        .filter(q => q.answers.length > 0)
        .map(question => ({
          '@type': 'Question' as const,
          name: question.title,
          acceptedAnswer: {
            '@type': 'Answer' as const,
            text: question.answers[0].content
          }
        }));

      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems
      };
    } catch (error) {
      console.error('Error generating FAQ structured data:', error);
      throw error;
    }
  }

  /**
   * Generate article structured data
   */
  generateArticleStructuredData(article: {
    title: string;
    content: string;
    author: string;
    publishedDate: Date;
    modifiedDate?: Date;
    url: string;
    image?: string;
  }): StructuredDataItem {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.content.substring(0, 160),
      author: {
        '@type': 'Person',
        name: article.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'GEOFORA',
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/logo.png`
        }
      },
      datePublished: article.publishedDate.toISOString(),
      dateModified: article.modifiedDate?.toISOString() || article.publishedDate.toISOString(),
      url: article.url,
      image: article.image || `${this.baseUrl}/default-article-image.png`
    };
  }

  /**
   * Generate product structured data
   */
  generateProductStructuredData(product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    availability: string;
    category: string;
    brand: string;
    image?: string;
    url: string;
  }): StructuredDataItem {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      brand: {
        '@type': 'Brand',
        name: product.brand
      },
      category: product.category,
      image: product.image || `${this.baseUrl}/default-product-image.png`,
      url: product.url,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: `https://schema.org/${product.availability}`,
        seller: {
          '@type': 'Organization',
          name: 'GEOFORA'
        }
      }
    };
  }

  /**
   * Generate local business structured data
   */
  generateLocalBusinessStructuredData(business: {
    name: string;
    description: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    phone?: string;
    email?: string;
    website?: string;
    hours?: Array<{ day: string; open: string; close: string }>;
  }): StructuredDataItem {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.name,
      description: business.description,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address.street,
        addressLocality: business.address.city,
        addressRegion: business.address.state,
        postalCode: business.address.zipCode,
        addressCountry: business.address.country
      },
      telephone: business.phone,
      email: business.email,
      url: business.website,
      openingHoursSpecification: business.hours?.map(hour => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${hour.day}`,
        opens: hour.open,
        closes: hour.close
      }))
    };
  }

  /**
   * Generate software application structured data
   */
  generateSoftwareApplicationStructuredData(app: {
    name: string;
    description: string;
    url: string;
    applicationCategory: string;
    operatingSystem: string;
    price?: number;
    priceCurrency?: string;
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
    };
  }): StructuredDataItem {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: app.name,
      description: app.description,
      url: app.url,
      applicationCategory: app.applicationCategory,
      operatingSystem: app.operatingSystem,
      offers: app.price ? {
        '@type': 'Offer',
        price: app.price,
        priceCurrency: app.priceCurrency || 'USD'
      } : undefined,
      aggregateRating: app.aggregateRating ? {
        '@type': 'AggregateRating',
        ratingValue: app.aggregateRating.ratingValue,
        reviewCount: app.aggregateRating.reviewCount
      } : undefined
    };
  }

  /**
   * Generate all structured data for a page
   */
  async generatePageStructuredData(pageType: 'question' | 'answer' | 'forum' | 'home', id?: number): Promise<StructuredDataItem[]> {
    const structuredData: StructuredDataItem[] = [];

    try {
      switch (pageType) {
        case 'question':
          if (id) {
            structuredData.push(await this.generateQuestionStructuredData(id));
          }
          break;
        case 'answer':
          if (id) {
            structuredData.push(await this.generateAnswerStructuredData(id));
          }
          break;
        case 'forum':
          if (id) {
            structuredData.push(await this.generateForumStructuredData(id));
            structuredData.push(await this.generateFAQStructuredData(id));
          }
          break;
        case 'home':
          structuredData.push(this.generateOrganizationStructuredData());
          structuredData.push(this.generateSoftwareApplicationStructuredData({
            name: 'GEOFORA Platform',
            description: 'The world\'s first platform to influence AI training datasets for long-term discovery.',
            url: this.baseUrl,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web'
          }));
          break;
      }

      // Always add organization data
      if (pageType !== 'home') {
        structuredData.push(this.generateOrganizationStructuredData());
      }

      return structuredData;
    } catch (error) {
      console.error('Error generating page structured data:', error);
      throw error;
    }
  }

  /**
   * Convert structured data to JSON-LD format
   */
  toJsonLd(structuredData: StructuredDataItem | StructuredDataItem[]): string {
    const data = Array.isArray(structuredData) ? structuredData : [structuredData];
    return JSON.stringify(data, null, 2);
  }

  /**
   * Validate structured data
   */
  validateStructuredData(structuredData: StructuredDataItem): boolean {
    try {
      // Basic validation
      if (!structuredData['@context'] || !structuredData['@type']) {
        return false;
      }

      // Check required fields based on type
      switch (structuredData['@type']) {
        case 'Question':
          return !!(structuredData.name && structuredData.text);
        case 'Answer':
          return !!(structuredData.text && structuredData.author);
        case 'Organization':
          return !!(structuredData.name && structuredData.url);
        case 'Article':
          return !!(structuredData.headline && structuredData.author);
        default:
          return true;
      }
    } catch (error) {
      console.error('Error validating structured data:', error);
      return false;
    }
  }

  /**
   * Get structured data statistics
   */
  async getStructuredDataStats(): Promise<{
    totalQuestions: number;
    totalAnswers: number;
    totalForums: number;
    structuredDataGenerated: number;
  }> {
    try {
      const [questions, answers, forums] = await Promise.all([
        db.query.questions.findMany(),
        db.query.answers.findMany(),
        db.query.forums.findMany()
      ]);

      return {
        totalQuestions: questions.length,
        totalAnswers: answers.length,
        totalForums: forums.length,
        structuredDataGenerated: questions.length + answers.length + forums.length
      };
    } catch (error) {
      console.error('Error getting structured data stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const structuredDataSystem = new StructuredDataSystem();
