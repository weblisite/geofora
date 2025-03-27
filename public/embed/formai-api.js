/**
 * ForumAI JavaScript API Client
 * A lightweight client for integrating ForumAI functionality into your website
 * 
 * Usage:
 * 1. Include this script in your page
 * 2. Initialize with your API key
 * 3. Use the provided methods to interact with the API
 * 
 * Example:
 * ```
 * <script src="https://formai.repl.app/embed/formai-api.js"></script>
 * <script>
 *   const forumAI = new ForumAI({
 *     forumId: 1,
 *     apiKey: 'your-api-key', // if required
 *   });
 *   
 *   forumAI.getRecentQuestions().then(questions => {
 *     console.log(questions);
 *   });
 * </script>
 * ```
 */

(function(global) {
  'use strict';
  
  /**
   * ForumAI API Client
   */
  class ForumAI {
    /**
     * Initialize the API client
     * @param {Object} config Configuration object
     * @param {number} config.forumId ID of the forum to interact with
     * @param {string} [config.apiKey] Optional API key for authenticated operations
     * @param {string} [config.baseUrl] API base URL (defaults to current origin)
     */
    constructor(config = {}) {
      if (!config.forumId) {
        throw new Error('ForumAI: forumId is required');
      }
      
      this.forumId = config.forumId;
      this.apiKey = config.apiKey || null;
      this.baseUrl = config.baseUrl || this._getDefaultBaseUrl();
      
      // Event listeners
      this._listeners = {
        question: [],
        answer: [],
        vote: [],
        error: []
      };
      
      // Version check
      this._checkVersion().catch(err => {
        this._triggerEvent('error', {
          type: 'version',
          message: 'Version check failed',
          error: err
        });
      });
    }
    
    /**
     * Get default base URL from current script location
     * @private
     * @returns {string} Base URL
     */
    _getDefaultBaseUrl() {
      // Find the current script
      const scripts = document.getElementsByTagName('script');
      const currentScript = scripts[scripts.length - 1];
      
      // Extract origin from script src
      if (currentScript.src) {
        try {
          const url = new URL(currentScript.src);
          return url.origin;
        } catch (e) {
          // If URL parsing fails, use current origin
          return window.location.origin;
        }
      }
      
      return window.location.origin;
    }
    
    /**
     * Check API version
     * @private
     * @returns {Promise<Object>} Version info
     */
    async _checkVersion() {
      try {
        const response = await this._request('/api/embed/version');
        this.version = response.version;
        return response;
      } catch (err) {
        console.warn('ForumAI: Version check failed', err);
        throw err;
      }
    }
    
    /**
     * Make an API request
     * @private
     * @param {string} path API endpoint path
     * @param {Object} [options] Fetch options
     * @returns {Promise<Object>} Response data
     */
    async _request(path, options = {}) {
      const url = `${this.baseUrl}${path}`;
      
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };
      
      // Add API key if available
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }
      
      // Add forum ID to all requests
      const queryChar = path.includes('?') ? '&' : '?';
      const urlWithForum = `${url}${queryChar}forumId=${this.forumId}`;
      
      try {
        const response = await fetch(urlWithForum, {
          ...options,
          headers
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP error ${response.status}`
          }));
          
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        return await response.json();
      } catch (err) {
        this._triggerEvent('error', {
          type: 'request',
          path,
          message: err.message || 'Request failed',
          error: err
        });
        
        throw err;
      }
    }
    
    /**
     * Add event listener
     * @param {string} event Event name
     * @param {Function} callback Callback function
     * @returns {ForumAI} ForumAI instance for chaining
     */
    on(event, callback) {
      if (this._listeners[event]) {
        this._listeners[event].push(callback);
      } else {
        console.warn(`ForumAI: Unknown event type "${event}"`);
      }
      
      return this;
    }
    
    /**
     * Remove event listener
     * @param {string} event Event name
     * @param {Function} callback Callback function
     * @returns {ForumAI} ForumAI instance for chaining
     */
    off(event, callback) {
      if (this._listeners[event]) {
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
      }
      
      return this;
    }
    
    /**
     * Trigger event
     * @private
     * @param {string} event Event name
     * @param {*} data Event data
     */
    _triggerEvent(event, data) {
      if (this._listeners[event]) {
        this._listeners[event].forEach(callback => {
          try {
            callback(data);
          } catch (err) {
            console.error(`ForumAI: Error in ${event} event listener`, err);
          }
        });
      }
    }
    
    /**
     * Get forum information
     * @returns {Promise<Object>} Forum data
     */
    async getForum() {
      return this._request(`/api/embed/forum/${this.forumId}`);
    }
    
    /**
     * Get recent questions from the forum
     * @param {Object} [options] Query options
     * @param {number} [options.limit=10] Number of questions to return
     * @param {number} [options.categoryId] Category ID to filter by
     * @returns {Promise<Array>} Questions list
     */
    async getRecentQuestions(options = {}) {
      const { limit = 10, categoryId } = options;
      
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        type: 'recent'
      });
      
      if (categoryId) {
        queryParams.append('categoryId', categoryId.toString());
      }
      
      const response = await this._request(`/api/embed/questions?${queryParams.toString()}`);
      return response.questions || [];
    }
    
    /**
     * Get popular questions from the forum
     * @param {Object} [options] Query options
     * @param {number} [options.limit=10] Number of questions to return
     * @param {number} [options.categoryId] Category ID to filter by
     * @param {string} [options.sortBy='views'] Sort method ('views' or 'answers')
     * @param {number} [options.timeFrame=30] Time frame in days (0 for all time)
     * @returns {Promise<Array>} Questions list
     */
    async getPopularQuestions(options = {}) {
      const { limit = 10, categoryId, sortBy = 'views', timeFrame = 30 } = options;
      
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        type: 'popular',
        sortBy,
        timeFrame: timeFrame.toString()
      });
      
      if (categoryId) {
        queryParams.append('categoryId', categoryId.toString());
      }
      
      const response = await this._request(`/api/embed/questions?${queryParams.toString()}`);
      return response.questions || [];
    }
    
    /**
     * Get categories from the forum
     * @returns {Promise<Array>} Categories list
     */
    async getCategories() {
      const response = await this._request(`/api/embed/categories?forumId=${this.forumId}`);
      return response.categories || [];
    }
    
    /**
     * Get a single question by ID
     * @param {number} questionId Question ID
     * @returns {Promise<Object>} Question data
     */
    async getQuestion(questionId) {
      return this._request(`/api/embed/questions/${questionId}`);
    }
    
    /**
     * Get answers for a question
     * @param {number} questionId Question ID
     * @param {Object} [options] Query options
     * @param {number} [options.limit=20] Number of answers to return
     * @param {string} [options.sortBy='votes'] Sort method ('votes', 'newest', 'oldest')
     * @returns {Promise<Array>} Answers list
     */
    async getAnswers(questionId, options = {}) {
      const { limit = 20, sortBy = 'votes' } = options;
      
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        sortBy
      });
      
      const response = await this._request(`/api/embed/questions/${questionId}/answers?${queryParams.toString()}`);
      return response.answers || [];
    }
    
    /**
     * Search questions in the forum
     * @param {string} query Search query
     * @param {Object} [options] Search options
     * @param {number} [options.limit=20] Number of results to return
     * @param {number} [options.categoryId] Category ID to filter by
     * @returns {Promise<Array>} Search results
     */
    async searchQuestions(query, options = {}) {
      const { limit = 20, categoryId } = options;
      
      const queryParams = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      
      if (categoryId) {
        queryParams.append('categoryId', categoryId.toString());
      }
      
      const response = await this._request(`/api/embed/search?${queryParams.toString()}`);
      return response.results || [];
    }
    
    /**
     * Ask a question (requires authentication)
     * @param {Object} questionData Question data
     * @param {string} questionData.title Question title
     * @param {string} questionData.content Question content
     * @param {number} questionData.categoryId Category ID
     * @returns {Promise<Object>} Created question
     */
    async askQuestion(questionData) {
      if (!this.apiKey) {
        throw new Error('API key is required for this operation');
      }
      
      const response = await this._request('/api/embed/questions', {
        method: 'POST',
        body: JSON.stringify({
          ...questionData,
          forumId: this.forumId
        })
      });
      
      this._triggerEvent('question', response);
      return response;
    }
    
    /**
     * Post an answer to a question (requires authentication)
     * @param {number} questionId Question ID
     * @param {Object} answerData Answer data
     * @param {string} answerData.content Answer content
     * @returns {Promise<Object>} Created answer
     */
    async postAnswer(questionId, answerData) {
      if (!this.apiKey) {
        throw new Error('API key is required for this operation');
      }
      
      const response = await this._request(`/api/embed/questions/${questionId}/answers`, {
        method: 'POST',
        body: JSON.stringify({
          ...answerData,
          forumId: this.forumId
        })
      });
      
      this._triggerEvent('answer', response);
      return response;
    }
    
    /**
     * Vote on an answer (requires authentication)
     * @param {number} answerId Answer ID
     * @param {boolean} isUpvote Whether the vote is an upvote
     * @returns {Promise<Object>} Vote result
     */
    async voteAnswer(answerId, isUpvote) {
      if (!this.apiKey) {
        throw new Error('API key is required for this operation');
      }
      
      const response = await this._request(`/api/embed/answers/${answerId}/vote`, {
        method: 'POST',
        body: JSON.stringify({
          isUpvote,
          forumId: this.forumId
        })
      });
      
      this._triggerEvent('vote', response);
      return response;
    }
    
    /**
     * Get AI-generated answer preview
     * @param {Object} data Question data
     * @param {string} data.title Question title
     * @param {string} data.content Question content
     * @param {string} [data.personaType='expert'] AI persona type
     * @returns {Promise<Object>} AI-generated answer
     */
    async getAIAnswerPreview(data) {
      const response = await this._request('/api/embed/ai/answer-preview', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          forumId: this.forumId
        })
      });
      
      return response;
    }
    
    /**
     * Render a widget into a container
     * @param {Object} options Widget options
     * @param {string} options.container Container ID or element
     * @param {string} options.type Widget type ('questions', 'ask', 'search')
     * @param {Object} [options.config] Widget configuration
     * @returns {Promise<Object>} Widget instance
     */
    async renderWidget(options) {
      const { container, type = 'questions', config = {} } = options;
      
      if (!container) {
        throw new Error('Container is required for widget rendering');
      }
      
      // Create widget container if string is provided
      let containerEl = typeof container === 'string' 
        ? document.getElementById(container) 
        : container;
      
      if (!containerEl) {
        containerEl = document.createElement('div');
        containerEl.id = container;
        document.body.appendChild(containerEl);
      }
      
      // Load widget styles
      await this._loadStyles();
      
      // Create widget based on type
      switch (type) {
        case 'questions':
          return this._renderQuestionsWidget(containerEl, config);
        case 'ask':
          return this._renderAskWidget(containerEl, config);
        case 'search':
          return this._renderSearchWidget(containerEl, config);
        default:
          throw new Error(`Unknown widget type: ${type}`);
      }
    }
    
    /**
     * Load widget styles
     * @private
     * @returns {Promise<void>}
     */
    async _loadStyles() {
      return new Promise((resolve, reject) => {
        // Check if styles are already loaded
        if (document.getElementById('formai-api-styles')) {
          resolve();
          return;
        }
        
        const styleEl = document.createElement('link');
        styleEl.id = 'formai-api-styles';
        styleEl.rel = 'stylesheet';
        styleEl.href = `${this.baseUrl}/embed/formai-widgets.css`;
        
        styleEl.onload = () => resolve();
        styleEl.onerror = () => reject(new Error('Failed to load widget styles'));
        
        document.head.appendChild(styleEl);
      });
    }
    
    /**
     * Render questions widget
     * @private
     * @param {HTMLElement} container Container element
     * @param {Object} config Widget configuration
     * @returns {Object} Widget controller
     */
    async _renderQuestionsWidget(container, config) {
      const { 
        title = 'Recent Questions',
        limit = 5,
        categoryId = null,
        type = 'recent',
        showAnswerCount = true,
        showViewCount = true,
        theme = 'light'
      } = config;
      
      let questions;
      try {
        if (type === 'popular') {
          questions = await this.getPopularQuestions({ limit, categoryId });
        } else {
          questions = await this.getRecentQuestions({ limit, categoryId });
        }
      } catch (err) {
        container.innerHTML = `
          <div class="formai-widget formai-widget-error">
            <p>Failed to load questions</p>
          </div>
        `;
        throw err;
      }
      
      container.innerHTML = `
        <div class="formai-widget formai-questions-widget" data-theme="${theme}">
          <div class="formai-widget-header">
            <h3 class="formai-widget-title">${title}</h3>
          </div>
          <div class="formai-widget-body">
            <ul class="formai-questions-list">
              ${questions.length === 0 ? '<li class="formai-empty-state">No questions found</li>' : ''}
              ${questions.map(q => `
                <li class="formai-question-item">
                  <a href="${this.baseUrl}/forum/${this.forumId}/q/${q.id}" target="_blank" class="formai-question-title">
                    ${q.title}
                  </a>
                  <div class="formai-question-meta">
                    ${showAnswerCount ? `<span class="formai-meta-item">${q.answers} answer${q.answers !== 1 ? 's' : ''}</span>` : ''}
                    ${showViewCount ? `<span class="formai-meta-item">${q.views || 0} view${(q.views || 0) !== 1 ? 's' : ''}</span>` : ''}
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
          <div class="formai-widget-footer">
            <a href="${this.baseUrl}/forum/${this.forumId}" target="_blank" class="formai-widget-link">
              View all questions
            </a>
          </div>
        </div>
      `;
      
      // Return controller object
      return {
        refresh: async () => {
          try {
            let refreshedQuestions;
            if (type === 'popular') {
              refreshedQuestions = await this.getPopularQuestions({ limit, categoryId });
            } else {
              refreshedQuestions = await this.getRecentQuestions({ limit, categoryId });
            }
            
            const listEl = container.querySelector('.formai-questions-list');
            if (listEl) {
              listEl.innerHTML = refreshedQuestions.length === 0 
                ? '<li class="formai-empty-state">No questions found</li>' 
                : refreshedQuestions.map(q => `
                    <li class="formai-question-item">
                      <a href="${this.baseUrl}/forum/${this.forumId}/q/${q.id}" target="_blank" class="formai-question-title">
                        ${q.title}
                      </a>
                      <div class="formai-question-meta">
                        ${showAnswerCount ? `<span class="formai-meta-item">${q.answers} answer${q.answers !== 1 ? 's' : ''}</span>` : ''}
                        ${showViewCount ? `<span class="formai-meta-item">${q.views || 0} view${(q.views || 0) !== 1 ? 's' : ''}</span>` : ''}
                      </div>
                    </li>
                  `).join('');
            }
            
            return refreshedQuestions;
          } catch (err) {
            this._triggerEvent('error', {
              type: 'widget',
              message: 'Failed to refresh questions widget',
              error: err
            });
            throw err;
          }
        },
        
        setConfig: (newConfig) => {
          // Update configuration for next refresh
          Object.assign(config, newConfig);
        },
        
        destroy: () => {
          container.innerHTML = '';
        }
      };
    }
    
    /**
     * Render ask question widget
     * @private
     * @param {HTMLElement} container Container element
     * @param {Object} config Widget configuration
     * @returns {Object} Widget controller
     */
    async _renderAskWidget(container, config) {
      const {
        title = 'Ask a Question',
        theme = 'light',
        buttonText = 'Submit Question',
        placeholder = 'What would you like to ask?',
        redirectToQuestion = true,
        showAIPreview = false
      } = config;
      
      // Fetch categories if needed
      let categoriesHtml = '';
      
      try {
        const categories = await this.getCategories();
        if (categories.length > 0) {
          categoriesHtml = `
            <div class="formai-form-group">
              <label for="formai-category">Category</label>
              <select id="formai-category" class="formai-form-select" required>
                <option value="">Select a category</option>
                ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
          `;
        }
      } catch (err) {
        console.warn('Failed to load categories:', err);
      }
      
      container.innerHTML = `
        <div class="formai-widget formai-ask-widget" data-theme="${theme}">
          <div class="formai-widget-header">
            <h3 class="formai-widget-title">${title}</h3>
          </div>
          <div class="formai-widget-body">
            <form id="formai-ask-form" class="formai-ask-form">
              <div class="formai-form-group">
                <label for="formai-title">Title</label>
                <input type="text" id="formai-title" class="formai-form-input" placeholder="Enter your question title" required>
              </div>
              
              ${categoriesHtml}
              
              <div class="formai-form-group">
                <label for="formai-content">Details</label>
                <textarea id="formai-content" class="formai-form-textarea" placeholder="${placeholder}" rows="5" required></textarea>
              </div>
              
              ${showAIPreview ? `
                <div class="formai-ai-preview-container" style="display: none;">
                  <div class="formai-ai-preview-header">
                    <h4>AI-Generated Answer Preview</h4>
                    <button type="button" class="formai-preview-toggle">Hide Preview</button>
                  </div>
                  <div class="formai-ai-preview-content">
                    <div class="formai-ai-preview-loading">
                      <div class="formai-spinner"></div>
                      <p>Generating preview...</p>
                    </div>
                    <div class="formai-ai-preview-result" style="display: none;"></div>
                  </div>
                </div>
                <button type="button" class="formai-preview-button">Get AI Answer Preview</button>
              ` : ''}
              
              <div class="formai-form-error" style="display: none;"></div>
              
              <button type="submit" class="formai-form-button">
                ${buttonText}
              </button>
            </form>
          </div>
        </div>
      `;
      
      // Set up form submission
      const form = container.querySelector('#formai-ask-form');
      const errorEl = container.querySelector('.formai-form-error');
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        errorEl.style.display = 'none';
        
        // Get form data
        const titleEl = form.querySelector('#formai-title');
        const contentEl = form.querySelector('#formai-content');
        const categoryEl = form.querySelector('#formai-category');
        
        const submitButton = form.querySelector('.formai-form-button');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <span class="formai-button-spinner"></span>
          Submitting...
        `;
        
        try {
          // Check API key
          if (!this.apiKey) {
            throw new Error('API key is required to submit questions');
          }
          
          const questionData = {
            title: titleEl.value,
            content: contentEl.value,
            categoryId: categoryEl ? parseInt(categoryEl.value, 10) : null
          };
          
          const question = await this.askQuestion(questionData);
          
          // Clear form
          form.reset();
          
          // Redirect to question if enabled
          if (redirectToQuestion && question.id) {
            window.open(`${this.baseUrl}/forum/${this.forumId}/q/${question.id}`, '_blank');
          } else {
            submitButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Submitted
            `;
            
            setTimeout(() => {
              submitButton.disabled = false;
              submitButton.textContent = originalButtonText;
            }, 3000);
          }
        } catch (err) {
          errorEl.textContent = err.message || 'Failed to submit question';
          errorEl.style.display = 'block';
          
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          
          this._triggerEvent('error', {
            type: 'widget',
            message: 'Failed to submit question',
            error: err
          });
        }
      });
      
      // Set up AI preview if enabled
      if (showAIPreview) {
        const previewButton = container.querySelector('.formai-preview-button');
        const previewContainer = container.querySelector('.formai-ai-preview-container');
        const previewLoading = container.querySelector('.formai-ai-preview-loading');
        const previewResult = container.querySelector('.formai-ai-preview-result');
        const previewToggle = container.querySelector('.formai-preview-toggle');
        
        previewButton.addEventListener('click', async () => {
          const titleEl = form.querySelector('#formai-title');
          const contentEl = form.querySelector('#formai-content');
          
          if (!titleEl.value || !contentEl.value) {
            errorEl.textContent = 'Please enter a title and details to get an AI preview';
            errorEl.style.display = 'block';
            return;
          }
          
          // Show preview container
          previewContainer.style.display = 'block';
          previewLoading.style.display = 'flex';
          previewResult.style.display = 'none';
          previewButton.style.display = 'none';
          
          try {
            const preview = await this.getAIAnswerPreview({
              title: titleEl.value,
              content: contentEl.value,
              personaType: 'expert'
            });
            
            previewLoading.style.display = 'none';
            previewResult.style.display = 'block';
            previewResult.innerHTML = preview.content || 'No preview available';
          } catch (err) {
            previewLoading.style.display = 'none';
            previewResult.style.display = 'block';
            previewResult.innerHTML = `
              <div class="formai-preview-error">
                Failed to generate preview. Please try again later.
              </div>
            `;
            
            this._triggerEvent('error', {
              type: 'widget',
              message: 'Failed to generate AI preview',
              error: err
            });
          }
        });
        
        // Toggle preview visibility
        previewToggle.addEventListener('click', () => {
          if (previewContainer.classList.contains('collapsed')) {
            previewContainer.classList.remove('collapsed');
            previewToggle.textContent = 'Hide Preview';
          } else {
            previewContainer.classList.add('collapsed');
            previewToggle.textContent = 'Show Preview';
          }
        });
      }
      
      // Return controller object
      return {
        reset: () => {
          form.reset();
          errorEl.style.display = 'none';
          
          const previewContainer = container.querySelector('.formai-ai-preview-container');
          const previewButton = container.querySelector('.formai-preview-button');
          
          if (previewContainer) {
            previewContainer.style.display = 'none';
          }
          
          if (previewButton) {
            previewButton.style.display = 'block';
          }
        },
        
        setConfig: (newConfig) => {
          // Update configuration items that can be changed dynamically
          if (newConfig.buttonText) {
            const submitButton = form.querySelector('.formai-form-button');
            if (submitButton) {
              submitButton.textContent = newConfig.buttonText;
            }
          }
          
          if (newConfig.placeholder) {
            const contentEl = form.querySelector('#formai-content');
            if (contentEl) {
              contentEl.placeholder = newConfig.placeholder;
            }
          }
          
          // Store other config updates
          Object.assign(config, newConfig);
        },
        
        destroy: () => {
          container.innerHTML = '';
        }
      };
    }
    
    /**
     * Render search widget
     * @private
     * @param {HTMLElement} container Container element
     * @param {Object} config Widget configuration
     * @returns {Object} Widget controller
     */
    async _renderSearchWidget(container, config) {
      const {
        title = 'Search Questions',
        theme = 'light',
        placeholder = 'Search for questions...',
        buttonText = 'Search',
        showEmptyState = true,
        redirectToResults = false,
        limit = 5
      } = config;
      
      container.innerHTML = `
        <div class="formai-widget formai-search-widget" data-theme="${theme}">
          <div class="formai-widget-header">
            <h3 class="formai-widget-title">${title}</h3>
          </div>
          <div class="formai-widget-body">
            <form id="formai-search-form" class="formai-search-form">
              <div class="formai-search-input-group">
                <input type="text" id="formai-search-input" class="formai-form-input" placeholder="${placeholder}" required>
                <button type="submit" class="formai-form-button">${buttonText}</button>
              </div>
            </form>
            
            <div class="formai-search-results" style="display: none;">
              <h4 class="formai-results-title">Search Results</h4>
              <ul class="formai-results-list"></ul>
              <div class="formai-results-more" style="display: none;">
                <a href="#" class="formai-widget-link" target="_blank">View all results</a>
              </div>
            </div>
            
            ${showEmptyState ? `
              <div class="formai-search-empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p>Search for questions in our forum</p>
              </div>
            ` : ''}
          </div>
        </div>
      `;
      
      // Set up search form
      const form = container.querySelector('#formai-search-form');
      const resultsContainer = container.querySelector('.formai-search-results');
      const resultsList = container.querySelector('.formai-results-list');
      const resultsMore = container.querySelector('.formai-results-more');
      const emptyState = container.querySelector('.formai-search-empty-state');
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const searchInput = form.querySelector('#formai-search-input');
        const query = searchInput.value.trim();
        
        if (!query) return;
        
        const submitButton = form.querySelector('.formai-form-button');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <span class="formai-button-spinner"></span>
          Searching...
        `;
        
        try {
          if (redirectToResults) {
            // Open search results in a new tab
            window.open(`${this.baseUrl}/forum/${this.forumId}/search?q=${encodeURIComponent(query)}`, '_blank');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            return;
          }
          
          // Perform search and show results
          const results = await this.searchQuestions(query, { limit });
          
          // Update results list
          resultsList.innerHTML = results.length > 0
            ? results.map(q => `
                <li class="formai-result-item">
                  <a href="${this.baseUrl}/forum/${this.forumId}/q/${q.id}" target="_blank" class="formai-result-title">
                    ${q.title}
                  </a>
                  <p class="formai-result-excerpt">${q.content.replace(/<[^>]*>/g, '').substring(0, 100)}...</p>
                </li>
              `).join('')
            : '<li class="formai-empty-state">No results found</li>';
          
          // Show more link if there might be more results
          if (results.length >= limit) {
            resultsMore.style.display = 'block';
            const moreLink = resultsMore.querySelector('a');
            moreLink.href = `${this.baseUrl}/forum/${this.forumId}/search?q=${encodeURIComponent(query)}`;
          } else {
            resultsMore.style.display = 'none';
          }
          
          // Show results and hide empty state
          resultsContainer.style.display = 'block';
          if (emptyState) {
            emptyState.style.display = 'none';
          }
          
        } catch (err) {
          resultsList.innerHTML = `
            <li class="formai-empty-state formai-error-state">
              Error: Failed to search questions
            </li>
          `;
          resultsContainer.style.display = 'block';
          if (emptyState) {
            emptyState.style.display = 'none';
          }
          
          this._triggerEvent('error', {
            type: 'widget',
            message: 'Failed to search questions',
            error: err
          });
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
      
      // Return controller object
      return {
        search: async (query) => {
          const searchInput = form.querySelector('#formai-search-input');
          searchInput.value = query;
          form.dispatchEvent(new Event('submit'));
        },
        
        reset: () => {
          form.reset();
          resultsContainer.style.display = 'none';
          if (emptyState) {
            emptyState.style.display = 'block';
          }
        },
        
        setConfig: (newConfig) => {
          // Update configuration items that can be changed dynamically
          if (newConfig.buttonText) {
            const submitButton = form.querySelector('.formai-form-button');
            if (submitButton) {
              submitButton.textContent = newConfig.buttonText;
            }
          }
          
          if (newConfig.placeholder) {
            const searchInput = form.querySelector('#formai-search-input');
            if (searchInput) {
              searchInput.placeholder = newConfig.placeholder;
            }
          }
          
          // Store other config updates
          Object.assign(config, newConfig);
        },
        
        destroy: () => {
          container.innerHTML = '';
        }
      };
    }
  }
  
  // Export to global scope
  global.ForumAI = ForumAI;
  
})(typeof window !== 'undefined' ? window : this);