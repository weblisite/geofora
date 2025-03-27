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
      api: 'ForumAI Embed API',
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
}