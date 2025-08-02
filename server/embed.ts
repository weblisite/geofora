import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { z } from 'zod';
import { generateAnswer } from './ai';
import path from 'path';

/**
 * Register embed and JavaScript integration API routes
 */
export function registerEmbedRoutes(app: Express) {
  // Serve static embed files
  app.get('/embed/:filename', (req, res) => {
    const { filename } = req.params;
    res.sendFile(path.join(process.cwd(), 'public', 'embed', filename));
  });

  // API version endpoint
  app.get('/api/embed/version', (req, res) => {
    res.json({
      version: '1.0.0',
      api: 'GeoFora Embed API',
      timestamp: new Date().toISOString()
    });
  });

  // Get forum information for embed
  app.get('/api/embed/forum/:forumId', async (req, res) => {
    try {
      const forumId = parseInt(req.params.forumId, 10);
      
      if (isNaN(forumId)) {
        return res.status(400).json({ message: 'Invalid forum ID' });
      }
      
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).json({ message: 'Forum not found' });
      }
      
      // Get stats
      const totalQuestions = await storage.countQuestionsByForum(forumId);
      const totalAnswers = await storage.countAnswersByForum(forumId);
      
      // Return safe forum data (exclude sensitive info)
      res.json({
        id: forum.id,
        name: forum.name,
        description: forum.description,
        slug: forum.slug,
        subdomain: forum.subdomain,
        customDomain: forum.customDomain,
        themeColor: forum.themeColor,
        primaryFont: forum.primaryFont,
        totalQuestions,
        totalAnswers
      });
    } catch (error) {
      console.error('Error fetching forum for embed:', error);
      res.status(500).json({ message: 'Failed to fetch forum information' });
    }
  });

  // Get questions for embed widget
  app.get('/api/embed/questions', async (req, res) => {
    try {
      const forumId = parseInt(req.query.forumId as string, 10);
      
      if (isNaN(forumId)) {
        return res.status(400).json({ message: 'Invalid forum ID' });
      }
      
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const type = (req.query.type as string) || 'recent';
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      
      let questions;
      
      if (type === 'popular') {
        const sortBy = req.query.sortBy as string || 'views';
        // Time frame in days, 0 means all time
        const timeFrame = parseInt(req.query.timeFrame as string, 10) || 30;
        
        questions = await storage.getPopularQuestionsForForum(
          forumId, 
          sortBy as 'views' | 'answers', 
          limit,
          categoryId,
          timeFrame > 0 ? timeFrame : undefined
        );
      } else {
        questions = await storage.getQuestionsForForum(forumId, limit, categoryId);
      }
      
      // Get forum data to return the slug
      const forum = await storage.getForum(forumId);
      
      res.json({
        questions,
        forumSlug: forum?.slug
      });
    } catch (error) {
      console.error('Error fetching questions for embed:', error);
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  });

  // Get categories for embed
  app.get('/api/embed/categories', async (req, res) => {
    try {
      const forumId = parseInt(req.query.forumId as string, 10);
      
      if (isNaN(forumId)) {
        return res.status(400).json({ message: 'Invalid forum ID' });
      }
      
      const categories = await storage.getCategoriesByForum(forumId);
      
      res.json({
        categories
      });
    } catch (error) {
      console.error('Error fetching categories for embed:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // Get question details for embed
  app.get('/api/embed/questions/:questionId', async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId, 10);
      
      if (isNaN(questionId)) {
        return res.status(400).json({ message: 'Invalid question ID' });
      }
      
      const question = await storage.getQuestionWithDetails(questionId);
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      // Check if question belongs to requested forum
      const forumId = parseInt(req.query.forumId as string, 10);
      if (!isNaN(forumId)) {
        // This is a flexible check because we want to allow embedding across forums
        // if the embed API is being used by a parent company with multiple forums
        const isSameForumOwner = await storage.checkSameForumOwner(question.id, forumId);
        
        // Only enforce forum check if specified in the request
        if (!isSameForumOwner) {
          console.warn(`Attempt to access question ${questionId} from different forum owner ${forumId}`);
        }
      }
      
      res.json(question);
    } catch (error) {
      console.error('Error fetching question for embed:', error);
      res.status(500).json({ message: 'Failed to fetch question' });
    }
  });

  // Get answers for embed
  app.get('/api/embed/questions/:questionId/answers', async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId, 10);
      
      if (isNaN(questionId)) {
        return res.status(400).json({ message: 'Invalid question ID' });
      }
      
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const sortBy = (req.query.sortBy as string) || 'votes';
      
      const answers = await storage.getAnswersForQuestion(questionId, sortBy as 'votes' | 'newest' | 'oldest', limit);
      
      res.json({
        answers
      });
    } catch (error) {
      console.error('Error fetching answers for embed:', error);
      res.status(500).json({ message: 'Failed to fetch answers' });
    }
  });

  // Search questions for embed
  app.get('/api/embed/search', async (req, res) => {
    try {
      const forumId = parseInt(req.query.forumId as string, 10);
      
      if (isNaN(forumId)) {
        return res.status(400).json({ message: 'Invalid forum ID' });
      }
      
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      
      const results = await storage.searchQuestionsInForum(forumId, query, limit, categoryId);
      
      res.json({
        results
      });
    } catch (error) {
      console.error('Error searching questions for embed:', error);
      res.status(500).json({ message: 'Failed to search questions' });
    }
  });

  // Get lead form by ID for embed
  app.get('/api/embed/lead-form/:formId', async (req, res) => {
    try {
      const formId = parseInt(req.params.formId, 10);
      
      if (isNaN(formId)) {
        return res.status(400).json({ message: 'Invalid form ID' });
      }
      
      const form = await storage.getLeadCaptureForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }
      
      // Record form view
      await storage.createLeadFormView({
        formId: form.id,
        isConversion: false
      });
      
      res.json(form);
    } catch (error) {
      console.error('Error fetching lead form for embed:', error);
      res.status(500).json({ message: 'Failed to fetch lead form' });
    }
  });

  // Submit lead form for embed
  app.post('/api/embed/lead-form-submit', async (req, res) => {
    try {
      const { formId, formData, referrer, userAgent, ipAddress } = req.body;
      
      if (!formId || !formData) {
        return res.status(400).json({ message: 'Form ID and form data are required' });
      }
      
      const form = await storage.getLeadCaptureForm(formId);
      
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }
      
      // Extract email and name fields if present
      let email = '';
      let firstName = null;
      let lastName = null;
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key.toLowerCase().includes('email')) {
          email = value as string;
        } else if (key.toLowerCase().includes('first') && key.toLowerCase().includes('name')) {
          firstName = value as string;
        } else if (key.toLowerCase().includes('last') && key.toLowerCase().includes('name')) {
          lastName = value as string;
        }
      });
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Create lead submission
      const submission = await storage.createLeadSubmission({
        formId,
        email,
        formData: JSON.stringify(formData),
        firstName,
        lastName,
        ipAddress: ipAddress || req.ip,
        userAgent: userAgent || req.headers['user-agent'] || null,
        isExported: false
      });
      
      // Record conversion
      await storage.createLeadFormView({
        formId: form.id,
        isConversion: true,
        ipAddress: ipAddress || req.ip,
        userAgent: userAgent || req.headers['user-agent'] || null,
        referrer: referrer || null
      });
      
      res.json({
        success: true,
        submissionId: submission.id,
        form: {
          ...form,
          successTitle: form.successTitle || 'Thank you!',
          successMessage: form.successMessage || 'Your submission has been received.'
        }
      });
    } catch (error) {
      console.error('Error submitting lead form for embed:', error);
      res.status(500).json({ message: 'Failed to submit form' });
    }
  });

  // Track lead form view for embed
  app.post('/api/embed/track-form-view', async (req, res) => {
    try {
      const { formId, isConversion, referrer, userAgent } = req.body;
      
      if (!formId) {
        return res.status(400).json({ message: 'Form ID is required' });
      }
      
      await storage.createLeadFormView({
        formId,
        isConversion: isConversion || false,
        ipAddress: req.ip,
        userAgent: userAgent || req.headers['user-agent'] || null,
        referrer: referrer || null
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking form view for embed:', error);
      res.status(500).json({ message: 'Failed to track form view' });
    }
  });

  // Create question via API
  app.post('/api/embed/questions', async (req, res) => {
    try {
      // API key authentication would be implemented here
      // This is a simplified implementation
      
      const { title, content, categoryId, forumId } = req.body;
      
      if (!title || !content || !forumId) {
        return res.status(400).json({ message: 'Title, content and forumId are required' });
      }
      
      // For embed API, we need to create or get an API user
      const apiUser = await storage.getOrCreateAPIUser(forumId);
      
      const question = await storage.createQuestion({
        title,
        content,
        categoryId,
        userId: apiUser.id,
        isAiGenerated: false
      });
      
      res.status(201).json(question);
    } catch (error) {
      console.error('Error creating question via embed API:', error);
      res.status(500).json({ message: 'Failed to create question' });
    }
  });

  // Create answer via API
  app.post('/api/embed/questions/:questionId/answers', async (req, res) => {
    try {
      // API key authentication would be implemented here
      
      const questionId = parseInt(req.params.questionId, 10);
      const { content, forumId } = req.body;
      
      if (isNaN(questionId)) {
        return res.status(400).json({ message: 'Invalid question ID' });
      }
      
      if (!content || !forumId) {
        return res.status(400).json({ message: 'Content and forumId are required' });
      }
      
      // For embed API, we need to create or get an API user
      const apiUser = await storage.getOrCreateAPIUser(forumId);
      
      const answer = await storage.createAnswer({
        questionId,
        content,
        userId: apiUser.id,
        isAiGenerated: false
      });
      
      res.status(201).json(answer);
    } catch (error) {
      console.error('Error creating answer via embed API:', error);
      res.status(500).json({ message: 'Failed to create answer' });
    }
  });

  // Vote on an answer via API
  app.post('/api/embed/answers/:answerId/vote', async (req, res) => {
    try {
      // API key authentication would be implemented here
      
      const answerId = parseInt(req.params.answerId, 10);
      const { isUpvote, forumId } = req.body;
      
      if (isNaN(answerId)) {
        return res.status(400).json({ message: 'Invalid answer ID' });
      }
      
      if (typeof isUpvote !== 'boolean' || !forumId) {
        return res.status(400).json({ message: 'isUpvote (boolean) and forumId are required' });
      }
      
      // For embed API, we need to create or get an API user
      const apiUser = await storage.getOrCreateAPIUser(forumId);
      
      const vote = await storage.createOrUpdateVote({
        answerId,
        userId: apiUser.id,
        isUpvote
      });
      
      res.json(vote);
    } catch (error) {
      console.error('Error voting via embed API:', error);
      res.status(500).json({ message: 'Failed to record vote' });
    }
  });

  // Get AI answer preview
  app.post('/api/embed/ai/answer-preview', async (req, res) => {
    try {
      const { title, content, personaType = 'expert', forumId } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: 'Question title and content are required' });
      }
      
      if (!forumId) {
        return res.status(400).json({ message: 'Forum ID is required' });
      }
      
      // Check if the persona type is valid
      if (!['beginner', 'intermediate', 'expert', 'moderator'].includes(personaType)) {
        return res.status(400).json({ message: 'Invalid persona type' });
      }
      
      // Generate AI answer
      const answer = await generateAnswer(title, content, personaType);
      
      res.json(answer);
    } catch (error) {
      console.error('Error generating AI answer preview:', error);
      res.status(500).json({ message: 'Failed to generate AI answer preview' });
    }
  });

  // Redirect endpoint with advanced options
  app.get('/embed/redirect/:forumId', async (req, res) => {
    try {
      const forumId = parseInt(req.params.forumId, 10);
      
      if (isNaN(forumId)) {
        return res.status(400).send('Invalid forum ID');
      }
      
      const forum = await storage.getForum(forumId);
      
      if (!forum) {
        return res.status(404).send('Forum not found');
      }
      
      // Extract redirect parameters
      const destination = req.query.dest as string; // 'forum', 'question', 'category', 'ask'
      const targetId = req.query.id ? parseInt(req.query.id as string, 10) : null;
      const embed = req.query.embed as string || null; // 'true', 'minimal', 'compact', 'sidebar'
      const theme = req.query.theme as string || null; // 'light', 'dark', 'auto'
      const utmSource = req.query.utm_source as string || 'redirect';
      const utmMedium = req.query.utm_medium as string || 'forum';
      const utmCampaign = req.query.utm_campaign as string || 'forum-redirect';
      const tracking = req.query.track !== 'false'; // Track by default unless disabled
      const cookieConsent = req.query.cookies === 'true'; // Default to no cookies unless explicitly allowed
      const dataConsent = req.query.data === 'true'; // Default to no data collection unless explicitly allowed
      const preserveParams = req.query.params === 'true'; // Whether to preserve additional query parameters
      const mode = req.query.mode as string || 'navigate'; // 'navigate', 'newtab', 'iframe'
      const customParams = req.query.custom as string || null; // Custom parameters in JSON format
      
      // Construct the URL
      let targetUrl;
      
      // Determine base URL
      let baseUrl;
      if (forum.customDomain) {
        baseUrl = `https://${forum.customDomain}`;
      } else if (forum.subdomain) {
        baseUrl = `https://${forum.subdomain}.${process.env.BASE_DOMAIN || 'formai.repl.app'}`;
      } else {
        baseUrl = `https://${process.env.BASE_DOMAIN || 'formai.repl.app'}/forum/${forum.slug}`;
      }
      
      // Determine path based on destination
      let path = '';
      
      if (destination === 'question' && targetId) {
        // Redirect to specific question
        const question = await storage.getQuestion(targetId);
        if (question) {
          path = `/question/${targetId}/${encodeURIComponent(question.title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase())}`;
        } else {
          path = '/questions';
        }
      } else if (destination === 'category' && targetId) {
        // Redirect to specific category
        const category = await storage.getCategory(targetId);
        if (category) {
          path = `/category/${targetId}/${encodeURIComponent(category.name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase())}`;
        } else {
          path = '/categories';
        }
      } else if (destination === 'ask') {
        // Redirect to ask page
        path = '/ask';
      } else {
        // Default to forum main page
        path = '';
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add embed parameters if embed mode is requested
      if (embed) {
        if (embed === 'true') {
          params.set('embed', 'true');
        } else {
          params.set('embed', embed);
        }
      }
      
      // Add theme if specified
      if (theme) {
        params.set('theme', theme);
      }
      
      // Add UTM parameters for tracking
      if (tracking) {
        params.set('utm_source', utmSource);
        params.set('utm_medium', utmMedium);
        params.set('utm_campaign', utmCampaign);
      }
      
      // Add consent parameters
      if (cookieConsent) {
        params.set('cookie_consent', 'true');
      }
      
      if (dataConsent) {
        params.set('data_consent', 'true');
      }
      
      // Add custom parameters if provided
      if (customParams) {
        try {
          const customParamsObj = JSON.parse(customParams);
          Object.entries(customParamsObj).forEach(([key, value]) => {
            params.set(key, String(value));
          });
        } catch (e) {
          console.warn('Failed to parse custom parameters:', e);
        }
      }
      
      // Preserve additional query parameters if requested
      if (preserveParams) {
        Object.entries(req.query).forEach(([key, value]) => {
          if (!['dest', 'id', 'embed', 'theme', 'utm_source', 'utm_medium', 'utm_campaign', 
                'track', 'cookies', 'data', 'params', 'mode', 'custom'].includes(key)) {
            params.set(key, value as string);
          }
        });
      }
      
      // Construct final URL
      const queryString = params.toString();
      targetUrl = `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`;
      
      // Track the redirect event if tracking is enabled
      if (tracking) {
        // Record analytics event
        try {
          await storage.createAnalyticsEvent({
            type: 'redirect',
            category: 'forum_embed',
            action: `redirect_to_${destination || 'forum'}`,
            label: `from=${req.headers.referer || 'unknown'};to=${path}`,
            value: 1,
            forumId,
            metadata: JSON.stringify({
              timestamp: new Date().toISOString(),
              referer: req.headers.referer,
              userAgent: req.headers['user-agent'],
              ipAddress: req.ip,
              destination,
              targetId,
              mode
            })
          });
        } catch (err) {
          console.error('Failed to track redirect event:', err);
        }
      }
      
      // Handle different redirect modes
      if (mode === 'newtab') {
        // Return an HTML page that will open the URL in a new tab
        res.send(`<!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting to Forum...</title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background: #f5f5f7;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                padding: 20px;
                color: #333;
                text-align: center;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                max-width: 500px;
                width: 100%;
              }
              h1 {
                font-weight: 600;
                font-size: 22px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                line-height: 1.5;
                color: #666;
                margin-bottom: 24px;
              }
              .button {
                background: ${forum.themeColor || '#0070f3'};
                color: white;
                border: none;
                padding: 12px 24px;
                font-size: 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
                text-decoration: none;
                display: inline-block;
              }
              .button:hover {
                opacity: 0.9;
                transform: translateY(-1px);
              }
              .powered-by {
                margin-top: 20px;
                font-size: 14px;
                color: #999;
              }
              .powered-by a {
                color: ${forum.themeColor || '#0070f3'};
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Redirecting to ${forum.name}</h1>
              <p>Click the button below to continue to the forum.</p>
              <a href="${targetUrl}" target="_blank" class="button" id="redirect-btn">Continue to Forum</a>
            </div>
            <div class="powered-by">
              Powered by <a href="https://geofora.ai" target="_blank">GeoFora</a>
            </div>
            <script>
              // Auto-click the button after a short delay
              setTimeout(() => {
                document.getElementById('redirect-btn').click();
              }, 500);
            </script>
          </body>
        </html>`);
      } else if (mode === 'iframe') {
        // Return an HTML page with an iframe
        res.send(`<!DOCTYPE html>
        <html>
          <head>
            <title>${forum.name} - Embedded Forum</title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                height: 100vh;
                width: 100vw;
              }
              iframe {
                border: none;
                width: 100%;
                height: 100%;
              }
            </style>
          </head>
          <body>
            <iframe src="${targetUrl}" allowfullscreen></iframe>
          </body>
        </html>`);
      } else {
        // Default mode: navigate directly to the URL
        res.redirect(targetUrl);
      }
    } catch (error) {
      console.error('Error in redirect endpoint:', error);
      res.status(500).send('Failed to process redirect request');
    }
  });
}