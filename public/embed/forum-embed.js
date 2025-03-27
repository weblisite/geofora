(function() {
  // Configuration options
  const defaultConfig = {
    forumId: null,
    container: 'formai-forum-embed',
    theme: 'light', // 'light', 'dark', 'auto'
    layout: 'full', // 'full', 'sidebar', 'minimal'
    defaultView: 'questions', // 'questions', 'categories', 'search'
    showHeader: true,
    showFooter: true,
    height: '600px',
    width: '100%',
    customStyles: null
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

  // Create styles for the embed
  function createStyles(config) {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .formai-forum-embed {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: ${config.theme === 'dark' ? '#1e1e2e' : '#ffffff'};
        color: ${config.theme === 'dark' ? '#e0e0e0' : '#333333'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        width: ${config.width};
        height: ${config.height};
        display: flex;
        flex-direction: column;
      }
      
      .formai-forum-embed-frame {
        border: none;
        width: 100%;
        flex: 1;
        min-height: 0;
      }
      
      .formai-forum-embed-header {
        padding: 12px 16px;
        border-bottom: 1px solid ${config.theme === 'dark' ? '#2d2d3d' : '#f0f0f0'};
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .formai-forum-embed-title {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 16px;
        gap: 8px;
      }
      
      .formai-forum-embed-title svg {
        width: 20px;
        height: 20px;
      }
      
      .formai-forum-embed-nav {
        display: flex;
        gap: 12px;
        font-size: 14px;
      }
      
      .formai-forum-embed-nav-item {
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      .formai-forum-embed-nav-item:hover {
        background: ${config.theme === 'dark' ? '#2d2d3d' : '#f5f5f5'};
      }
      
      .formai-forum-embed-nav-item.active {
        background: ${config.theme === 'dark' ? '#3a3a4d' : '#f0f0f0'};
        font-weight: 500;
      }
      
      .formai-forum-embed-footer {
        padding: 8px 16px;
        border-top: 1px solid ${config.theme === 'dark' ? '#2d2d3d' : '#f0f0f0'};
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: ${config.theme === 'dark' ? '#858585' : '#888888'};
      }
      
      .formai-forum-embed-footer a {
        color: ${config.theme === 'dark' ? '#61dafb' : '#0070f3'};
        text-decoration: none;
      }
      
      .formai-forum-embed-footer a:hover {
        text-decoration: underline;
      }
      
      .formai-forum-embed-loading {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        font-size: 14px;
        color: ${config.theme === 'dark' ? '#858585' : '#888888'};
      }
      
      .formai-forum-embed-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid ${config.theme === 'dark' ? '#2d2d3d' : '#f0f0f0'};
        border-radius: 50%;
        border-top-color: ${config.theme === 'dark' ? '#61dafb' : '#0070f3'};
        animation: formai-spin 1s linear infinite;
      }
      
      @keyframes formai-spin {
        to { transform: rotate(360deg); }
      }
      
      .formai-forum-embed-error {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
        text-align: center;
      }
      
      .formai-forum-embed-error-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: ${config.theme === 'dark' ? '#2d2d3d' : '#fff3f3'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e53e3e;
        margin-bottom: 8px;
      }
      
      .formai-forum-embed-error-title {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
      }
      
      .formai-forum-embed-error-message {
        font-size: 14px;
        color: ${config.theme === 'dark' ? '#b0b0b0' : '#666666'};
        margin-bottom: 16px;
      }

      .formai-forum-embed-iframe-container {
        flex: 1;
        position: relative;
        overflow: hidden;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .formai-forum-embed-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        
        .formai-forum-embed-nav {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 4px;
        }
      }
    `;
    
    // Add custom styles if provided
    if (config.customStyles) {
      styleEl.textContent += config.customStyles;
    }
    
    document.head.appendChild(styleEl);
  }

  // Create the forum embed
  async function createEmbed(config) {
    try {
      // Create container if not exists
      let container = document.getElementById(config.container);
      if (!container) {
        container = document.createElement('div');
        container.id = config.container;
        document.currentScript.parentNode.insertBefore(container, document.currentScript.nextSibling);
      }
      
      // Create embed structure
      const embed = document.createElement('div');
      embed.className = 'formai-forum-embed';
      embed.setAttribute('data-theme', config.theme);
      
      // Loading state
      const loadingEl = document.createElement('div');
      loadingEl.className = 'formai-forum-embed-loading';
      loadingEl.innerHTML = `
        <div class="formai-forum-embed-spinner"></div>
        <div>Loading forum...</div>
      `;
      
      embed.appendChild(loadingEl);
      container.appendChild(embed);
      
      // Fetch forum data
      const response = await fetch(`${window.location.protocol}//${window.location.host}/api/embed/forum/${config.forumId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load forum');
      }
      
      const forumData = await response.json();
      
      // Remove loading state
      embed.removeChild(loadingEl);
      
      // Create header if enabled
      if (config.showHeader) {
        const header = document.createElement('div');
        header.className = 'formai-forum-embed-header';
        
        const title = document.createElement('div');
        title.className = 'formai-forum-embed-title';
        title.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          ${forumData.name}
        `;
        
        const nav = document.createElement('div');
        nav.className = 'formai-forum-embed-nav';
        
        // Add navigation items
        const navItems = [
          { value: 'questions', label: 'Questions' },
          { value: 'categories', label: 'Categories' },
          { value: 'search', label: 'Search' }
        ];
        
        navItems.forEach(item => {
          const navItem = document.createElement('div');
          navItem.className = `formai-forum-embed-nav-item ${item.value === config.defaultView ? 'active' : ''}`;
          navItem.setAttribute('data-view', item.value);
          navItem.textContent = item.label;
          
          navItem.addEventListener('click', () => {
            // Toggle active state
            nav.querySelectorAll('.formai-forum-embed-nav-item').forEach(el => {
              el.classList.remove('active');
            });
            navItem.classList.add('active');
            
            // Update iframe URL
            const iframe = embed.querySelector('.formai-forum-embed-frame');
            const baseUrl = iframe.getAttribute('data-base-url');
            iframe.src = `${baseUrl}/${item.value === 'questions' ? '' : item.value}`;
          });
          
          nav.appendChild(navItem);
        });
        
        header.appendChild(title);
        header.appendChild(nav);
        embed.appendChild(header);
      }
      
      // Create iframe container
      const iframeContainer = document.createElement('div');
      iframeContainer.className = 'formai-forum-embed-iframe-container';
      
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.className = 'formai-forum-embed-frame';
      
      // Determine URL based on forum data and config
      let forumUrl;
      
      if (forumData.customDomain) {
        forumUrl = `https://${forumData.customDomain}`;
      } else if (forumData.subdomain) {
        const baseUrl = window.location.hostname.includes('localhost') ? 
          'localhost:3000' : 
          'formai.repl.app';
        forumUrl = `https://${forumData.subdomain}.${baseUrl}`;
      } else {
        const baseUrl = window.location.hostname.includes('localhost') ? 
          'localhost:3000' : 
          'formai.repl.app';
        forumUrl = `https://${baseUrl}/forum/${forumData.slug}`;
      }
      
      // Store base URL for navigation
      iframe.setAttribute('data-base-url', forumUrl);
      
      // Set iframe source based on default view
      let viewPath = '';
      switch(config.defaultView) {
        case 'categories':
          viewPath = '/categories';
          break;
        case 'search':
          viewPath = '/search';
          break;
        default:
          viewPath = '';
      }
      
      // Add layout parameter
      const layoutParam = config.layout !== 'full' ? `?embed=${config.layout}` : '?embed=true';
      iframe.src = `${forumUrl}${viewPath}${layoutParam}`;
      
      // Add the iframe
      iframeContainer.appendChild(iframe);
      embed.appendChild(iframeContainer);
      
      // Create footer if enabled
      if (config.showFooter) {
        const footer = document.createElement('div');
        footer.className = 'formai-forum-embed-footer';
        
        const stats = document.createElement('div');
        stats.textContent = `${forumData.totalQuestions || 0} Questions · ${forumData.totalAnswers || 0} Answers`;
        
        const powered = document.createElement('div');
        powered.innerHTML = `Powered by <a href="https://formai.repl.app" target="_blank">ForumAI</a>`;
        
        footer.appendChild(stats);
        footer.appendChild(powered);
        embed.appendChild(footer);
      }
      
      // Setup message communication with iframe
      window.addEventListener('message', (event) => {
        // Verify the origin
        const iframeSrc = new URL(iframe.src);
        if (event.origin !== iframeSrc.origin) return;
        
        // Handle height adjustments
        if (event.data.type === 'resize' && event.data.height) {
          iframe.style.height = `${event.data.height}px`;
        }
        
        // Handle navigation events
        if (event.data.type === 'navigate' && event.data.path) {
          // Update navigation tabs if header is shown
          if (config.showHeader) {
            const navItems = embed.querySelectorAll('.formai-forum-embed-nav-item');
            navItems.forEach(item => {
              const view = item.getAttribute('data-view');
              if (
                (view === 'questions' && !event.data.path.includes('/')) ||
                (view === 'categories' && event.data.path.includes('/categories')) ||
                (view === 'search' && event.data.path.includes('/search'))
              ) {
                item.classList.add('active');
              } else {
                item.classList.remove('active');
              }
            });
          }
        }
      });
      
    } catch (error) {
      console.error('ForumAI Embed Error:', error);
      
      // Show error message
      const container = document.getElementById(config.container);
      const embed = container.querySelector('.formai-forum-embed');
      
      // Remove loading state if exists
      const loadingEl = embed.querySelector('.formai-forum-embed-loading');
      if (loadingEl) {
        embed.removeChild(loadingEl);
      }
      
      // Add error message
      const errorEl = document.createElement('div');
      errorEl.className = 'formai-forum-embed-error';
      errorEl.innerHTML = `
        <div class="formai-forum-embed-error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="formai-forum-embed-error-title">Cannot load forum</div>
        <div class="formai-forum-embed-error-message">
          ${error.message || 'Failed to load forum. Please try again later.'}
        </div>
      `;
      
      embed.appendChild(errorEl);
    }
  }

  // Initialize
  function init() {
    const config = getConfig();
    
    if (!config.forumId) {
      console.error('ForumAI Embed Error: forumId is required');
      return;
    }
    
    createStyles(config);
    createEmbed(config);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();