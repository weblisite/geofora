(function() {
  // Configuration options
  const defaultConfig = {
    forumId: null,
    container: 'formai-forum-widget',
    type: 'recent', // 'recent', 'popular', 'category'
    count: 5,
    categoryId: null,
    title: 'Forum Discussion',
    theme: 'light', // 'light', 'dark', 'auto'
    buttonText: 'Visit Forum',
    showAnswerCount: true,
    showViewCount: true,
    maxTitleLength: 60,
    maxContentPreview: 120
  };

  // Get script attributes and merge with defaults
  function getConfig() {
    const script = document.currentScript || (function() {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
    
    const config = { ...defaultConfig };
    
    // Parse data attributes from script tag
    for (const key in defaultConfig) {
      const dataAttr = script.getAttribute(`data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      if (dataAttr !== null) {
        // Parse numbers and booleans
        if (typeof defaultConfig[key] === 'number') {
          config[key] = parseInt(dataAttr, 10);
        } else if (typeof defaultConfig[key] === 'boolean') {
          config[key] = dataAttr === 'true';
        } else {
          config[key] = dataAttr;
        }
      }
    }
    
    return config;
  }

  // Create styles for the widget
  function createStyles(config) {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .formai-forum-widget {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: ${config.theme === 'dark' ? '#1e1e2e' : '#ffffff'};
        color: ${config.theme === 'dark' ? '#e0e0e0' : '#333333'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        max-width: 100%;
      }
      
      .formai-forum-widget-header {
        padding: 16px;
        border-bottom: 1px solid ${config.theme === 'dark' ? '#2d2d3d' : '#f0f0f0'};
      }
      
      .formai-forum-widget-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      .formai-forum-widget-questions {
        list-style-type: none;
        margin: 0;
        padding: 0;
      }
      
      .formai-forum-widget-question {
        padding: 12px 16px;
        border-bottom: 1px solid ${config.theme === 'dark' ? '#2d2d3d' : '#f0f0f0'};
      }
      
      .formai-forum-widget-question:last-child {
        border-bottom: none;
      }
      
      .formai-forum-widget-question-title {
        margin: 0 0 6px;
        font-weight: 500;
        font-size: 15px;
      }
      
      .formai-forum-widget-question-title a {
        color: ${config.theme === 'dark' ? '#61dafb' : '#0070f3'};
        text-decoration: none;
      }
      
      .formai-forum-widget-question-title a:hover {
        text-decoration: underline;
      }
      
      .formai-forum-widget-question-preview {
        margin: 0 0 8px;
        font-size: 13px;
        color: ${config.theme === 'dark' ? '#b0b0b0' : '#666666'};
      }
      
      .formai-forum-widget-question-meta {
        display: flex;
        font-size: 12px;
        color: ${config.theme === 'dark' ? '#858585' : '#888888'};
      }
      
      .formai-forum-widget-meta-item {
        margin-right: 12px;
        display: flex;
        align-items: center;
      }
      
      .formai-forum-widget-meta-item svg {
        margin-right: 4px;
        width: 12px;
        height: 12px;
      }
      
      .formai-forum-widget-footer {
        padding: 12px 16px;
        text-align: center;
        border-top: 1px solid ${config.theme === 'dark' ? '#2d2d3d' : '#f0f0f0'};
      }
      
      .formai-forum-widget-button {
        display: inline-block;
        padding: 8px 16px;
        background: ${config.theme === 'dark' ? '#61dafb' : '#0070f3'};
        color: #ffffff;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        transition: background 0.2s;
      }
      
      .formai-forum-widget-button:hover {
        background: ${config.theme === 'dark' ? '#4bc0f0' : '#0060df'};
      }
      
      .formai-forum-widget-loading {
        padding: 30px;
        text-align: center;
        color: ${config.theme === 'dark' ? '#858585' : '#888888'};
      }
      
      .formai-forum-widget-error {
        padding: 20px;
        text-align: center;
        color: #e53e3e;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // Truncate text to specified length
  function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Format date to relative time
  function timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
      return new Date(date).toLocaleDateString();
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  }

  // Create question HTML
  function createQuestionElement(question, config) {
    const questionEl = document.createElement('li');
    questionEl.className = 'formai-forum-widget-question';
    
    // Title with link
    const titleEl = document.createElement('h3');
    titleEl.className = 'formai-forum-widget-question-title';
    
    const linkEl = document.createElement('a');
    linkEl.href = `${window.location.protocol}//${window.location.host}/q/${question.id}`;
    linkEl.textContent = truncateText(question.title, config.maxTitleLength);
    linkEl.target = '_blank';
    
    titleEl.appendChild(linkEl);
    questionEl.appendChild(titleEl);
    
    // Content preview
    const previewEl = document.createElement('p');
    previewEl.className = 'formai-forum-widget-question-preview';
    // Remove HTML tags and truncate
    const preview = question.content.replace(/<[^>]*>/g, '');
    previewEl.textContent = truncateText(preview, config.maxContentPreview);
    questionEl.appendChild(previewEl);
    
    // Meta information
    const metaEl = document.createElement('div');
    metaEl.className = 'formai-forum-widget-question-meta';
    
    // Date
    const dateEl = document.createElement('div');
    dateEl.className = 'formai-forum-widget-meta-item';
    dateEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      ${timeAgo(question.createdAt)}
    `;
    metaEl.appendChild(dateEl);
    
    // Answer count
    if (config.showAnswerCount) {
      const answersEl = document.createElement('div');
      answersEl.className = 'formai-forum-widget-meta-item';
      answersEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        ${question.answers} answer${question.answers !== 1 ? 's' : ''}
      `;
      metaEl.appendChild(answersEl);
    }
    
    // View count
    if (config.showViewCount) {
      const viewsEl = document.createElement('div');
      viewsEl.className = 'formai-forum-widget-meta-item';
      viewsEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        ${question.views || 0} view${(question.views || 0) !== 1 ? 's' : ''}
      `;
      metaEl.appendChild(viewsEl);
    }
    
    questionEl.appendChild(metaEl);
    
    return questionEl;
  }

  // Render the widget
  async function renderWidget(config) {
    // Create widget container if not exists
    let container = document.getElementById(config.container);
    if (!container) {
      container = document.createElement('div');
      container.id = config.container;
      document.currentScript.parentNode.insertBefore(container, document.currentScript.nextSibling);
    }
    
    // Create widget structure
    const widget = document.createElement('div');
    widget.className = 'formai-forum-widget';
    
    if (config.theme === 'auto') {
      widget.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      // Listen for theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        widget.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      });
    } else {
      widget.setAttribute('data-theme', config.theme);
    }
    
    // Header
    const header = document.createElement('div');
    header.className = 'formai-forum-widget-header';
    
    const title = document.createElement('h2');
    title.className = 'formai-forum-widget-title';
    title.textContent = config.title;
    
    header.appendChild(title);
    widget.appendChild(header);
    
    // Questions list
    const questionsList = document.createElement('ul');
    questionsList.className = 'formai-forum-widget-questions';
    
    // Loading state
    const loadingEl = document.createElement('div');
    loadingEl.className = 'formai-forum-widget-loading';
    loadingEl.textContent = 'Loading questions...';
    questionsList.appendChild(loadingEl);
    
    widget.appendChild(questionsList);
    
    // Footer
    const footer = document.createElement('div');
    footer.className = 'formai-forum-widget-footer';
    
    const button = document.createElement('a');
    button.className = 'formai-forum-widget-button';
    button.textContent = config.buttonText;
    button.href = `${window.location.protocol}//${window.location.host}/forum/${config.forumId}`;
    button.target = '_blank';
    
    footer.appendChild(button);
    widget.appendChild(footer);
    
    // Append widget to container
    container.appendChild(widget);
    
    try {
      // Fetch questions from API
      const queryParams = new URLSearchParams();
      
      if (config.type === 'category' && config.categoryId) {
        queryParams.append('categoryId', config.categoryId);
      }
      
      queryParams.append('type', config.type);
      queryParams.append('count', config.count);
      queryParams.append('forumId', config.forumId);
      
      const response = await fetch(`${window.location.protocol}//${window.location.host}/api/embed/questions?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      
      // Clear loading state
      questionsList.innerHTML = '';
      
      // Render questions
      if (data.questions && data.questions.length > 0) {
        data.questions.forEach(question => {
          questionsList.appendChild(createQuestionElement(question, config));
        });
      } else {
        const noQuestionsEl = document.createElement('div');
        noQuestionsEl.className = 'formai-forum-widget-loading';
        noQuestionsEl.textContent = 'No questions found.';
        questionsList.appendChild(noQuestionsEl);
      }
      
      // Update button URL if forum slug is provided
      if (data.forumSlug) {
        button.href = `${window.location.protocol}//${window.location.host}/forum/${data.forumSlug}`;
      }
      
    } catch (error) {
      console.error('ForumAI Widget Error:', error);
      
      // Show error state
      questionsList.innerHTML = '';
      const errorEl = document.createElement('div');
      errorEl.className = 'formai-forum-widget-error';
      errorEl.textContent = 'Failed to load questions. Please try again later.';
      questionsList.appendChild(errorEl);
    }
  }

  // Initialize widget
  function init() {
    const config = getConfig();
    
    if (!config.forumId) {
      console.error('ForumAI Widget Error: forumId is required');
      return;
    }
    
    createStyles(config);
    renderWidget(config);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();