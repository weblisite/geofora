/**
 * Analytics Tracker
 * 
 * This module provides functions for tracking user interactions, page views,
 * and other analytics events. It sends data to the server for storage and analysis.
 */

import { apiRequest } from "./queryClient";

interface TrackEventParams {
  forumId: number;
  eventType: string;
  eventCategory?: string;
  eventAction?: string; 
  eventLabel?: string;
  eventValue?: number;
  pageUrl?: string;
  additionalData?: Record<string, any>;
}

interface TrackUserEngagementParams {
  forumId: number;
  date: string;
  pageViews?: number;
  uniqueVisitors?: number;
  avgSessionDuration?: number;
  bounceRate?: number;
  deviceType?: string;
  referrer?: string;
}

interface TrackContentPerformanceParams {
  forumId: number;
  contentType: string;
  contentId: number;
  title?: string;
  url?: string;
  impressions?: number;
  clicks?: number;
  socialShares?: number;
  avgTimeOnContent?: number;
}

// Store session information
let sessionStartTime: number | null = null;
let pageViewCount = 0;
const visitedPages = new Set<string>();

/**
 * Initialize the analytics tracker
 */
export function initAnalytics() {
  // Start session tracking
  sessionStartTime = Date.now();
  
  // Track page view on initialization
  trackPageView();
  
  // Attach event listeners for general tracking
  window.addEventListener('beforeunload', () => {
    if (sessionStartTime) {
      // Track session duration on page unload
      const sessionDuration = (Date.now() - sessionStartTime) / 1000; // in seconds
      trackSessionDuration(sessionDuration);
    }
  });
  
  // Track click events
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    // Track clicks on links, buttons, and other interactive elements
    if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
        target.closest('button') || target.closest('a') || 
        target.hasAttribute('data-track-click')) {
      
      const trackElement = target.hasAttribute('data-track-click') 
        ? target 
        : target.closest('[data-track-click]');
      
      if (trackElement) {
        const eventCategory = trackElement.getAttribute('data-track-category') || 'interaction';
        const eventAction = trackElement.getAttribute('data-track-action') || 'click';
        const eventLabel = trackElement.getAttribute('data-track-label');
        const eventValue = trackElement.getAttribute('data-track-value');
        
        trackEvent({
          forumId: getCurrentForumId(),
          eventType: 'click',
          eventCategory,
          eventAction,
          eventLabel: eventLabel || undefined,
          eventValue: eventValue ? parseInt(eventValue) : undefined,
          pageUrl: window.location.href
        });
      }
    }
  });
}

/**
 * Get the current forum ID from the page
 */
function getCurrentForumId(): number {
  // Try to get forum ID from data attribute on body
  const bodyForumId = document.body.getAttribute('data-forum-id');
  if (bodyForumId) {
    return parseInt(bodyForumId);
  }
  
  // Try to extract from URL path if in forum section
  const pathMatch = window.location.pathname.match(/\/forum\/(\d+)/);
  if (pathMatch && pathMatch[1]) {
    return parseInt(pathMatch[1]);
  }
  
  // Fall back to a default forum ID or localStorage value if available
  const storedForumId = localStorage.getItem('currentForumId');
  if (storedForumId) {
    return parseInt(storedForumId);
  }
  
  // If all else fails, return a default value
  // In a real implementation, this would be handled better
  return 1;
}

/**
 * Track a page view
 */
export function trackPageView(forumId?: number) {
  pageViewCount++;
  visitedPages.add(window.location.pathname);
  
  const currentForumId = forumId || getCurrentForumId();
  
  trackEvent({
    forumId: currentForumId,
    eventType: 'page_view',
    eventCategory: 'navigation',
    eventAction: 'view',
    eventLabel: window.location.pathname,
    pageUrl: window.location.href
  });
  
  // After first page view, set returning visitor flag
  const isReturningVisitor = localStorage.getItem('seenBefore') === 'true';
  localStorage.setItem('seenBefore', 'true');
  
  // Track user engagement metrics
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  trackUserEngagement({
    forumId: currentForumId,
    date: date,
    pageViews: 1,
    uniqueVisitors: isReturningVisitor ? 0 : 1,
    deviceType: getDeviceType(),
    referrer: document.referrer
  });
}

/**
 * Track how long a user spends on a session
 */
function trackSessionDuration(durationInSeconds: number) {
  const currentForumId = getCurrentForumId();
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const bounceRate = pageViewCount === 1 ? 1 : 0;
  
  trackUserEngagement({
    forumId: currentForumId,
    date: date,
    avgSessionDuration: durationInSeconds,
    bounceRate: bounceRate
  });
  
  trackEvent({
    forumId: currentForumId,
    eventType: 'session_end',
    eventCategory: 'engagement',
    eventAction: 'session_duration',
    eventValue: Math.round(durationInSeconds),
    additionalData: {
      pageViewCount,
      uniquePageCount: visitedPages.size
    }
  });
}

/**
 * Track content view (for questions, answers, articles)
 */
export function trackContentView(
  contentType: string, 
  contentId: number, 
  title: string, 
  forumId?: number
) {
  const currentForumId = forumId || getCurrentForumId();
  const url = window.location.href;
  
  // Track as an event
  trackEvent({
    forumId: currentForumId,
    eventType: 'content_view',
    eventCategory: 'content',
    eventAction: 'view',
    eventLabel: `${contentType}_${contentId}`,
    pageUrl: url
  });
  
  // Also track content performance metrics
  trackContentPerformance({
    forumId: currentForumId,
    contentType,
    contentId,
    title,
    url,
    impressions: 1
  });
}

/**
 * Track a click on content
 */
export function trackContentClick(
  contentType: string, 
  contentId: number, 
  title: string,
  forumId?: number
) {
  const currentForumId = forumId || getCurrentForumId();
  
  trackEvent({
    forumId: currentForumId,
    eventType: 'content_click',
    eventCategory: 'content',
    eventAction: 'click',
    eventLabel: `${contentType}_${contentId}`
  });
  
  trackContentPerformance({
    forumId: currentForumId,
    contentType,
    contentId,
    title,
    clicks: 1
  });
}

/**
 * Track sharing of content on social media
 */
export function trackSocialShare(
  contentType: string, 
  contentId: number, 
  platform: string,
  forumId?: number
) {
  const currentForumId = forumId || getCurrentForumId();
  
  trackEvent({
    forumId: currentForumId,
    eventType: 'social_share',
    eventCategory: 'social',
    eventAction: 'share',
    eventLabel: platform,
    additionalData: {
      contentType,
      contentId
    }
  });
  
  trackContentPerformance({
    forumId: currentForumId,
    contentType,
    contentId,
    socialShares: 1
  });
}

/**
 * Track a form submission
 */
export function trackFormSubmission(
  formId: number,
  formName: string,
  forumId?: number
) {
  const currentForumId = forumId || getCurrentForumId();
  
  trackEvent({
    forumId: currentForumId,
    eventType: 'form_submit',
    eventCategory: 'form',
    eventAction: 'submit',
    eventLabel: formName,
    eventValue: formId
  });
}

/**
 * Track a conversion event
 */
export function trackConversion(
  conversionType: string,
  value?: number,
  forumId?: number
) {
  const currentForumId = forumId || getCurrentForumId();
  
  trackEvent({
    forumId: currentForumId,
    eventType: 'conversion',
    eventCategory: 'conversion',
    eventAction: conversionType,
    eventValue: value
  });
}

/**
 * Track search usage
 */
export function trackSearch(
  query: string,
  resultCount: number,
  forumId?: number
) {
  const currentForumId = forumId || getCurrentForumId();
  
  trackEvent({
    forumId: currentForumId,
    eventType: 'search',
    eventCategory: 'search',
    eventAction: 'query',
    eventLabel: query,
    eventValue: resultCount
  });
}

/**
 * Track general event
 */
export async function trackEvent(params: TrackEventParams) {
  try {
    await apiRequest("/api/analytics/track-event", {
      method: "POST",
      body: JSON.stringify({
        ...params,
        sessionId: getSessionId(),
        deviceType: getDeviceType(),
        browserInfo: getBrowserInfo(),
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error("Error tracking event:", error);
  }
}

/**
 * Track user engagement metrics
 */
export async function trackUserEngagement(params: TrackUserEngagementParams) {
  try {
    await apiRequest("/api/analytics/track-user-engagement", {
      method: "POST",
      body: JSON.stringify({
        ...params,
        deviceBreakdown: {
          [getDeviceType()]: 1
        }
      })
    });
  } catch (error) {
    console.error("Error tracking user engagement:", error);
  }
}

/**
 * Track content performance metrics
 */
export async function trackContentPerformance(params: TrackContentPerformanceParams) {
  try {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await apiRequest("/api/analytics/track-content-performance", {
      method: "POST",
      body: JSON.stringify({
        ...params,
        scoreDate: date
      })
    });
  } catch (error) {
    console.error("Error tracking content performance:", error);
  }
}

/**
 * Generate or retrieve a session ID
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Generate a UUID for session tracking
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get the device type
 */
function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Get browser information
 */
function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  let browser = '';
  
  if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (ua.indexOf('SamsungBrowser') > -1) {
    browser = 'Samsung';
  } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
    browser = 'Opera';
  } else if (ua.indexOf('Trident') > -1) {
    browser = 'IE';
  } else if (ua.indexOf('Edge') > -1) {
    browser = 'Edge';
  } else if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (ua.indexOf('Safari') > -1) {
    browser = 'Safari';
  } else {
    browser = 'Unknown';
  }
  
  return browser;
}